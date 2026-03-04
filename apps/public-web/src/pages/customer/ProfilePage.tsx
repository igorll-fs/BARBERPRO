/* ============================
   BARBERPRO PWA — Perfil do Usuário
   Editar nome, foto de perfil, preferências, sair
   ============================ */
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../store/user';
import { signOut as authSignOut } from '../../services/auth';
import { uploadProfilePhoto } from '../../services/storage';
import { usePushNotifications } from '../../hooks/usePushNotifications';

export default function ProfilePage() {
  const { uid, name, email, phone, photoUrl, role, isDemo, shopId } = useUser();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [formName, setFormName] = useState(name || '');
  const [formPhone, setFormPhone] = useState(phone || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // ─── Upload de Foto ───────────────────────────────────
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uid) return;

    if (isDemo) {
      setUploadError('Foto de perfil disponível apenas com conta real');
      setTimeout(() => setUploadError(''), 3000);
      return;
    }

    // Validações
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Imagem muito grande (máx 5MB)');
      setTimeout(() => setUploadError(''), 3000);
      return;
    }
    if (!file.type.startsWith('image/')) {
      setUploadError('Selecione um arquivo de imagem');
      setTimeout(() => setUploadError(''), 3000);
      return;
    }

    setUploading(true);
    setUploadError('');
    try {
      const url = await uploadProfilePhoto(uid, file);
      useUser.getState().setProfile({ photoUrl: url });
    } catch (err: any) {
      setUploadError(err.message || 'Erro ao enviar foto');
      setTimeout(() => setUploadError(''), 3000);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  // ─── Salvar Perfil ────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    useUser.getState().setProfile({ name: formName, phone: formPhone });
    setSaving(false);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // ─── Sair ─────────────────────────────────────────────
  const handleSignOut = async () => {
    if (!confirm('Deseja sair da sua conta?')) return;
    try { await authSignOut(); } catch {}
    useUser.getState().signOut();
    navigate('/login');
  };

  const roleLabel = role === 'dono' ? 'Dono de Barbearia' : role === 'funcionario' ? 'Funcionário' : 'Cliente';

  return (
    <div className="fade-in" style={{ padding: 16 }}>
      {/* Header */}
      <div style={{ marginBottom: 24, marginTop: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Meu Perfil</h1>
      </div>

      {/* Toast */}
      {saved && (
        <div style={{
          background: 'var(--primary)', color: '#fff', padding: '10px 20px',
          borderRadius: 12, fontWeight: 600, fontSize: 13, textAlign: 'center',
          marginBottom: 16, animation: 'fadeIn 0.3s ease',
        }}>
          ✅ Perfil atualizado!
        </div>
      )}
      {uploadError && (
        <div style={{
          background: 'var(--danger-bg)', color: 'var(--danger)', padding: '10px 20px',
          borderRadius: 12, fontWeight: 600, fontSize: 13, textAlign: 'center',
          marginBottom: 16, animation: 'fadeIn 0.3s ease',
        }}>
          ⚠️ {uploadError}
        </div>
      )}

      {/* Avatar + Info Principal */}
      <div className="card" style={{ textAlign: 'center', padding: 24, marginBottom: 16 }}>
        {/* Avatar com botão de câmera */}
        <div style={{ position: 'relative', display: 'inline-block' }}>
          {photoUrl ? (
            <img
              src={photoUrl}
              alt="Foto de perfil"
              style={{
                width: 80, height: 80, borderRadius: '50%', objectFit: 'cover',
                border: '3px solid var(--primary)',
              }}
            />
          ) : (
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, color: '#fff', fontWeight: 700,
            }}>
              {(name || 'U')[0].toUpperCase()}
            </div>
          )}
          {/* Botão câmera */}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            style={{
              position: 'absolute', bottom: -2, right: -2,
              width: 30, height: 30, borderRadius: '50%',
              background: 'var(--primary)', border: '2px solid var(--bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: 14, color: '#fff',
            }}
          >
            {uploading ? '⏳' : '📷'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            style={{ display: 'none' }}
          />
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 12 }}>{name || 'Usuário'}</h2>
        <span style={{
          display: 'inline-block', marginTop: 6,
          padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
          color: 'var(--primary)', background: 'var(--primary-bg)',
        }}>
          {roleLabel}
        </span>
      </div>

      {/* Informações */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600 }}>Informações</h3>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              style={{
                background: 'var(--primary-bg)', color: 'var(--primary)',
                border: 'none', borderRadius: 8, padding: '6px 14px',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}
            >
              ✏️ Editar
            </button>
          )}
        </div>

        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label className="label">Nome</label>
              <input className="input" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Seu nome" />
            </div>
            <div>
              <label className="label">Telefone</label>
              <input className="input" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="(00) 00000-0000" />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ flex: 1 }}>
                {saving ? 'Salvando...' : '💾 Salvar'}
              </button>
              <button className="btn btn-ghost" onClick={() => { setEditing(false); setFormName(name || ''); setFormPhone(phone || ''); }} style={{ flex: 1 }}>
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <InfoRow icon="👤" label="Nome" value={name || '—'} />
            <InfoRow icon="📧" label="E-mail" value={email || '—'} />
            <InfoRow icon="📱" label="Telefone" value={phone || '—'} />
            <InfoRow icon="🏪" label="Barbearia" value={shopId || '—'} />
          </div>
        )}
      </div>

      {/* Preferências */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Preferências</h3>
        <PushToggle />
        <ToggleRow label="Lembretes por WhatsApp" defaultChecked />
        <ToggleRow label="Promoções e ofertas" defaultChecked={false} />
      </div>

      {/* Sobre */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Sobre</h3>
        <InfoRow icon="📱" label="Versão" value="PWA 1.0.0" />
        <InfoRow icon="🆔" label="ID" value={uid?.slice(0, 12) + '...' || '—'} />
      </div>

      {/* Botão Sair */}
      <button className="btn btn-danger" onClick={handleSignOut} style={{ marginBottom: 32 }}>
        🚪 Sair da Conta
      </button>
    </div>
  );
}

// ─── Componente: Linha de Info ───────────────────────────
function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <p className="text-muted text-xs">{label}</p>
        <p style={{ fontWeight: 500, fontSize: 14, marginTop: 1 }}>{value}</p>
      </div>
    </div>
  );
}

// ─── Componente: Toggle de Push Real ────────────────────
function PushToggle() {
  const { isSupported, isEnabled, loading, permission, enable, disable, testNotification } = usePushNotifications();

  if (!isSupported) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 0', borderBottom: '1px solid var(--border-light)',
      }}>
        <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>🔔 Push (não suportado)</span>
      </div>
    );
  }

  const handleToggle = async () => {
    if (isEnabled) {
      await disable();
    } else {
      const ok = await enable();
      if (ok) testNotification();
    }
  };

  const blocked = permission === 'denied';

  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 0', borderBottom: '1px solid var(--border-light)',
    }}>
      <div>
        <span style={{ fontSize: 14 }}>🔔 Notificações push</span>
        {blocked && (
          <p style={{ fontSize: 11, color: 'var(--danger)', marginTop: 2 }}>
            Bloqueado — ative nas configurações do navegador
          </p>
        )}
      </div>
      <button
        onClick={handleToggle}
        disabled={loading || blocked}
        style={{
          width: 44, height: 24, borderRadius: 12, border: 'none', cursor: blocked ? 'not-allowed' : 'pointer',
          background: isEnabled ? 'var(--primary)' : 'var(--bg-tertiary)',
          position: 'relative', transition: 'background 0.2s',
          opacity: loading ? 0.5 : 1,
        }}
      >
        <div style={{
          width: 18, height: 18, borderRadius: '50%', background: '#fff',
          position: 'absolute', top: 3, transition: 'left 0.2s',
          left: isEnabled ? 23 : 3,
        }} />
      </button>
    </div>
  );
}

// ─── Componente: Toggle ─────────────────────────────────
function ToggleRow({ label, defaultChecked = false }: { label: string; defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 0', borderBottom: '1px solid var(--border-light)',
    }}>
      <span style={{ fontSize: 14 }}>{label}</span>
      <button
        onClick={() => setChecked(!checked)}
        style={{
          width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
          background: checked ? 'var(--primary)' : 'var(--bg-tertiary)', position: 'relative',
          transition: 'background 0.2s',
        }}
      >
        <div style={{
          width: 18, height: 18, borderRadius: '50%', background: '#fff',
          position: 'absolute', top: 3, transition: 'left 0.2s',
          left: checked ? 23 : 3,
        }} />
      </button>
    </div>
  );
}
