/* ============================
   BARBERPRO PWA — Gestão de Eventos (Dono)
   Comunicados, promoções, eventos
   ============================ */
import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../../store/user';
import {
  listEvents, addEvent, updateEvent, deleteEvent,
  type ShopEvent, type EventType,
} from '../../services/events';
import { uploadShopImage } from '../../services/storage';

// ─── Config de tipos ────────────────────────────────────
const typeConfig: Record<EventType, { label: string; icon: string; color: string; bg: string }> = {
  comunicado: { label: 'Comunicado', icon: '📢', color: '#3B82F6', bg: 'rgba(59,130,246,0.15)' },
  promocao: { label: 'Promoção', icon: '🏷️', color: '#10B981', bg: 'rgba(16,185,129,0.15)' },
  evento: { label: 'Evento', icon: '🎉', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
};

export default function EventsPage() {
  const { shopId, isDemo } = useUser();
  const sid = shopId || 'demo';
  const photoRef = useRef<HTMLInputElement>(null);

  const [events, setEvents] = useState<ShopEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Formulário
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formType, setFormType] = useState<EventType>('comunicado');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formExpires, setFormExpires] = useState('');

  // ─── Carregar ─────────────────────────────────────────
  const load = async () => {
    setLoading(true);
    try {
      const data = await listEvents(sid);
      setEvents(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [sid]);

  // ─── Reset ────────────────────────────────────────────
  const resetForm = () => {
    setFormTitle('');
    setFormDesc('');
    setFormType('comunicado');
    setFormImageUrl('');
    setFormExpires('');
    setEditingId(null);
    setShowForm(false);
  };

  // ─── Editar ───────────────────────────────────────────
  const handleEdit = (evt: ShopEvent) => {
    setFormTitle(evt.title);
    setFormDesc(evt.description);
    setFormType(evt.type);
    setFormImageUrl(evt.imageUrl || '');
    setFormExpires(evt.expiresAt ? evt.expiresAt.split('T')[0] : '');
    setEditingId(evt.id);
    setShowForm(true);
  };

  // ─── Upload de Imagem ─────────────────────────────────
  const handleImageUpload = async (file: File) => {
    if (isDemo) {
      // Em demo, usar URL local
      setFormImageUrl(URL.createObjectURL(file));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Imagem muito grande (máx 5MB)');
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const url = await uploadShopImage(sid, `events/${Date.now()}.${ext}`, file);
      setFormImageUrl(url);
    } catch (err: any) {
      alert(err.message || 'Erro ao enviar imagem');
    } finally {
      setUploading(false);
    }
  };

  // ─── Salvar ───────────────────────────────────────────
  const handleSave = async () => {
    if (!formTitle.trim()) return;
    setSaving(true);

    const data = {
      title: formTitle.trim(),
      description: formDesc.trim(),
      type: formType,
      imageUrl: formImageUrl || undefined,
      active: true,
      expiresAt: formExpires ? new Date(formExpires + 'T23:59:59').toISOString() : undefined,
    };

    try {
      if (editingId) {
        if (isDemo) {
          setEvents((prev) => prev.map((e) => e.id === editingId ? { ...e, ...data } : e));
        } else {
          await updateEvent(sid, editingId, data);
        }
      } else {
        if (isDemo) {
          const newEvt: ShopEvent = {
            id: 'demo-' + Date.now(), shopId: sid, createdAt: new Date().toISOString(), ...data,
          };
          setEvents((prev) => [newEvt, ...prev]);
        } else {
          await addEvent(sid, data);
        }
      }
      resetForm();
      if (!isDemo) await load();
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  // ─── Deletar ──────────────────────────────────────────
  const handleDelete = async (evt: ShopEvent) => {
    if (!confirm(`Remover "${evt.title}"?`)) return;
    if (isDemo) {
      setEvents((prev) => prev.filter((e) => e.id !== evt.id));
      return;
    }
    try {
      await deleteEvent(sid, evt.id);
      await load();
    } catch {
      alert('Erro ao remover');
    }
  };

  // ─── Toggle ativo ─────────────────────────────────────
  const handleToggle = async (evt: ShopEvent) => {
    const newActive = !evt.active;
    if (isDemo) {
      setEvents((prev) => prev.map((e) => e.id === evt.id ? { ...e, active: newActive } : e));
      return;
    }
    try {
      await updateEvent(sid, evt.id, { active: newActive });
      await load();
    } catch {}
  };

  return (
    <div className="fade-in" style={{ padding: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>📢 Eventos</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          style={{
            background: 'var(--primary)', color: '#fff', border: 'none',
            borderRadius: 10, padding: '8px 16px', fontWeight: 600,
            fontSize: 14, cursor: 'pointer',
          }}
        >
          + Novo
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="card" style={{ marginBottom: 20, animation: 'fadeIn 0.2s ease' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
            {editingId ? '✏️ Editar' : '➕ Novo Evento'}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Tipo */}
            <div>
              <label className="label">Tipo</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {(Object.keys(typeConfig) as EventType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setFormType(t)}
                    style={{
                      flex: 1, padding: '10px 8px', borderRadius: 10, border: 'none',
                      cursor: 'pointer', textAlign: 'center', fontSize: 13, fontWeight: 600,
                      background: formType === t ? typeConfig[t].bg : 'var(--bg-secondary)',
                      color: formType === t ? typeConfig[t].color : 'var(--text-muted)',
                      transition: 'all 0.2s',
                    }}
                  >
                    {typeConfig[t].icon} {typeConfig[t].label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Título</label>
              <input className="input" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Ex: Promoção de Verão" />
            </div>
            <div>
              <label className="label">Descrição</label>
              <textarea
                className="input"
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Detalhes do comunicado..."
                rows={3}
                style={{ resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            {/* Imagem */}
            <div>
              <label className="label">Imagem (opcional)</label>
              {formImageUrl ? (
                <div style={{ position: 'relative', marginBottom: 8 }}>
                  <img src={formImageUrl} alt="Preview" style={{
                    width: '100%', height: 160, objectFit: 'cover', borderRadius: 12,
                  }} />
                  <button
                    onClick={() => setFormImageUrl('')}
                    style={{
                      position: 'absolute', top: 8, right: 8,
                      background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none',
                      borderRadius: '50%', width: 28, height: 28, cursor: 'pointer',
                      fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  className="btn btn-secondary"
                  onClick={() => photoRef.current?.click()}
                  disabled={uploading}
                  style={{ fontSize: 13 }}
                >
                  {uploading ? '⏳ Enviando...' : '📷 Adicionar Imagem'}
                </button>
              )}
            </div>

            <div>
              <label className="label">Expira em (opcional)</label>
              <input
                className="input"
                type="date"
                value={formExpires}
                onChange={(e) => setFormExpires(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving || !formTitle.trim()} style={{ flex: 1 }}>
                {saving ? 'Salvando...' : '💾 Publicar'}
              </button>
              <button className="btn btn-ghost" onClick={resetForm} style={{ flex: 1 }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input de arquivo oculto */}
      <input
        ref={photoRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageUpload(file);
          if (photoRef.current) photoRef.current.value = '';
        }}
      />

      {/* Loading */}
      {loading ? (
        <div className="flex-center" style={{ padding: 60 }}><div className="spinner" /></div>
      ) : events.length === 0 ? (
        <div className="text-center" style={{ padding: 60 }}>
          <p style={{ fontSize: 56 }}>📢</p>
          <p className="text-muted mt-lg">Nenhum evento criado</p>
          <button className="btn btn-primary mt-xl" style={{ width: 'auto' }} onClick={() => setShowForm(true)}>
            Criar Primeiro Evento
          </button>
        </div>
      ) : (
        /* Lista */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {events.map((evt) => {
            const tc = typeConfig[evt.type] || typeConfig.comunicado;
            return (
              <div key={evt.id} className="card" style={{ padding: '16px 20px', opacity: evt.active ? 1 : 0.6 }}>
                {/* Imagem */}
                {evt.imageUrl && (
                  <div style={{
                    width: '100%', height: 160, borderRadius: 12, overflow: 'hidden',
                    marginBottom: 12, background: 'var(--bg-secondary)',
                  }}>
                    <img src={evt.imageUrl} alt={evt.title} style={{
                      width: '100%', height: '100%', objectFit: 'cover',
                    }} />
                  </div>
                )}

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                        color: tc.color, background: tc.bg,
                      }}>
                        {tc.icon} {tc.label}
                      </span>
                      {!evt.active && (
                        <span style={{
                          padding: '3px 8px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                          color: 'var(--text-muted)', background: 'var(--bg-tertiary)',
                        }}>
                          Inativo
                        </span>
                      )}
                    </div>
                    <p style={{ fontWeight: 600, fontSize: 16 }}>{evt.title}</p>
                  </div>
                </div>

                {/* Descrição */}
                {evt.description && (
                  <p className="text-muted" style={{ fontSize: 13, marginBottom: 8 }}>{evt.description}</p>
                )}

                {/* Expiração */}
                {evt.expiresAt && (
                  <p className="text-muted text-xs" style={{ marginBottom: 8 }}>
                    ⏰ Expira em {new Date(evt.expiresAt).toLocaleDateString('pt-BR')}
                  </p>
                )}

                {/* Ações */}
                <div style={{ display: 'flex', gap: 8, marginTop: 8, borderTop: '1px solid var(--border-light)', paddingTop: 12 }}>
                  <button className="btn btn-ghost" onClick={() => handleToggle(evt)} style={{ flex: 1, padding: '8px', fontSize: 13 }}>
                    {evt.active ? '👁️ Desativar' : '✅ Ativar'}
                  </button>
                  <button className="btn btn-ghost" onClick={() => handleEdit(evt)} style={{ flex: 1, padding: '8px', fontSize: 13 }}>
                    ✏️ Editar
                  </button>
                  <button className="btn btn-ghost" onClick={() => handleDelete(evt)} style={{ flex: 1, padding: '8px', fontSize: 13, color: 'var(--danger)' }}>
                    🗑️ Remover
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
