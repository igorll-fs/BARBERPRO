/* ============================
   BARBERPRO PWA — Gestão de Serviços (Dono)
   CRUD + galeria de fotos por serviço
   ============================ */
import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../../store/user';
import {
  listServices, addService, updateService, deleteService,
  type ServiceItem,
} from '../../services/scheduling';
import { uploadShopImage } from '../../services/storage';

// Formatar preço
function formatPrice(cents: number): string {
  return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
}

// Converter string "35,00" para centavos
function parsePriceToCents(str: string): number {
  const clean = str.replace(/[^\d,]/g, '').replace(',', '.');
  return Math.round(parseFloat(clean || '0') * 100);
}

export default function ServicesPage() {
  const { shopId, isDemo } = useUser();
  const sid = shopId || 'demo';
  const photoRef = useRef<HTMLInputElement>(null);

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState<string | null>(null);

  // Formulário
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formDuration, setFormDuration] = useState('30');
  const [formDescription, setFormDescription] = useState('');

  // ─── Carregar Serviços ────────────────────────────────
  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await listServices(sid);
      setServices(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadServices(); }, [sid]);

  // ─── Resetar Form ─────────────────────────────────────
  const resetForm = () => {
    setFormName('');
    setFormPrice('');
    setFormDuration('30');
    setFormDescription('');
    setEditingId(null);
    setShowForm(false);
  };

  // ─── Editar ───────────────────────────────────────────
  const handleEdit = (svc: ServiceItem) => {
    setFormName(svc.name);
    setFormPrice((svc.priceCents / 100).toFixed(2).replace('.', ','));
    setFormDuration(svc.durationMin.toString());
    setFormDescription(svc.description || '');
    setEditingId(svc.id);
    setShowForm(true);
  };

  // ─── Salvar ───────────────────────────────────────────
  const handleSave = async () => {
    if (!formName.trim()) return;
    setSaving(true);

    const data = {
      name: formName.trim(),
      priceCents: parsePriceToCents(formPrice),
      durationMin: parseInt(formDuration) || 30,
      description: formDescription.trim(),
      active: true,
    };

    try {
      if (editingId) {
        if (isDemo) {
          // Atualiza localmente
          setServices((prev) => prev.map((s) => s.id === editingId ? { ...s, ...data } : s));
        } else {
          await updateService(sid, editingId, data);
        }
      } else {
        if (isDemo) {
          const newSvc: ServiceItem = { id: 'demo-' + Date.now(), ...data };
          setServices((prev) => [...prev, newSvc]);
        } else {
          await addService(sid, data);
        }
      }
      resetForm();
      if (!isDemo) await loadServices();
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar serviço');
    } finally {
      setSaving(false);
    }
  };

  // ─── Deletar (desativar) ──────────────────────────────
  const handleDelete = async (svc: ServiceItem) => {
    if (!confirm(`Remover "${svc.name}"?`)) return;
    if (isDemo) {
      setServices((prev) => prev.filter((s) => s.id !== svc.id));
      return;
    }
    try {
      await deleteService(sid, svc.id);
      await loadServices();
    } catch {
      alert('Erro ao remover serviço');
    }
  };

  // ─── Upload de Foto do Serviço ────────────────────────
  const handlePhotoUpload = async (svc: ServiceItem, file: File) => {
    if (isDemo) {
      // Em demo, usar URL local temporária
      const localUrl = URL.createObjectURL(file);
      setServices((prev) => prev.map((s) => s.id === svc.id ? { ...s, photoUrl: localUrl } : s));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Imagem muito grande (máx 5MB)');
      return;
    }

    setUploadingPhoto(svc.id);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const url = await uploadShopImage(sid, `services/${svc.id}.${ext}`, file);
      await updateService(sid, svc.id, { photoUrl: url } as any);
      setServices((prev) => prev.map((s) => s.id === svc.id ? { ...s, photoUrl: url } : s));
    } catch (err: any) {
      alert(err.message || 'Erro ao enviar foto');
    } finally {
      setUploadingPhoto(null);
    }
  };

  return (
    <div className="fade-in" style={{ padding: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>✂️ Serviços</h1>
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
            {editingId ? '✏️ Editar Serviço' : '➕ Novo Serviço'}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label className="label">Nome do serviço</label>
              <input className="input" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Ex: Corte Masculino" />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label className="label">Preço (R$)</label>
                <input className="input" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} placeholder="35,00" />
              </div>
              <div style={{ flex: 1 }}>
                <label className="label">Duração (min)</label>
                <input className="input" type="number" value={formDuration} onChange={(e) => setFormDuration(e.target.value)} placeholder="30" />
              </div>
            </div>
            <div>
              <label className="label">Descrição (opcional)</label>
              <textarea
                className="input"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Descrição do serviço..."
                rows={3}
                style={{ resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving || !formName.trim()} style={{ flex: 1 }}>
                {saving ? 'Salvando...' : '💾 Salvar'}
              </button>
              <button className="btn btn-ghost" onClick={resetForm} style={{ flex: 1 }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex-center" style={{ padding: 60 }}><div className="spinner" /></div>
      ) : services.length === 0 ? (
        <div className="text-center" style={{ padding: 60 }}>
          <p style={{ fontSize: 56 }}>✂️</p>
          <p className="text-muted mt-lg">Nenhum serviço cadastrado</p>
          <button className="btn btn-primary mt-xl" style={{ width: 'auto' }} onClick={() => setShowForm(true)}>
            Adicionar Primeiro Serviço
          </button>
        </div>
      ) : (
        /* Lista de Serviços */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {services.map((svc) => (
            <div key={svc.id} className="card" style={{ padding: '16px 20px' }}>
              {/* Foto do serviço */}
              {svc.photoUrl && (
                <div style={{
                  width: '100%', height: 160, borderRadius: 12, overflow: 'hidden',
                  marginBottom: 12, background: 'var(--bg-secondary)',
                }}>
                  <img
                    src={svc.photoUrl}
                    alt={svc.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}

              {/* Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: 16 }}>{svc.name}</p>
                  {svc.description && (
                    <p className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>{svc.description}</p>
                  )}
                  <p className="text-muted text-sm" style={{ marginTop: 6 }}>⏱ {svc.durationMin} min</p>
                </div>
                <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 18, whiteSpace: 'nowrap', marginLeft: 12 }}>
                  {formatPrice(svc.priceCents)}
                </span>
              </div>

              {/* Ações */}
              <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                <button
                  className="btn btn-ghost"
                  onClick={() => handleEdit(svc)}
                  style={{ flex: 1, padding: '8px 12px', fontSize: 13, minWidth: 80 }}
                >
                  ✏️ Editar
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    photoRef.current?.setAttribute('data-svc-id', svc.id);
                    photoRef.current?.click();
                  }}
                  disabled={uploadingPhoto === svc.id}
                  style={{ flex: 1, padding: '8px 12px', fontSize: 13, minWidth: 80 }}
                >
                  {uploadingPhoto === svc.id ? '⏳ Enviando...' : '📸 Foto'}
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => handleDelete(svc)}
                  style={{ flex: 1, padding: '8px 12px', fontSize: 13, color: 'var(--danger)', minWidth: 80 }}
                >
                  🗑️ Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Input de arquivo oculto para fotos de serviço */}
      <input
        ref={photoRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          const svcId = photoRef.current?.getAttribute('data-svc-id');
          if (file && svcId) {
            const svc = services.find((s) => s.id === svcId);
            if (svc) handlePhotoUpload(svc, file);
          }
          if (photoRef.current) photoRef.current.value = '';
        }}
      />
    </div>
  );
}
