/* ============================
   BARBERPRO PWA — Gerenciar Equipe (Dono)
   Lista + convidar staff
   ============================ */
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../../services/firebase';
import { useUser } from '../../store/user';

interface StaffMember {
  uid: string;
  name?: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  active?: boolean;
}

// ─── Dados demo ─────────────────────────────────────────
const demoStaff: StaffMember[] = [
  { uid: 's1', name: 'Carlos Silva', email: 'carlos@email.com', phone: '(11) 99999-1111', active: true },
  { uid: 's2', name: 'Lucas Oliveira', email: 'lucas@email.com', phone: '(11) 99999-2222', active: true },
  { uid: 's3', name: 'Rafael Santos', email: 'rafael@email.com', active: false },
];

export default function TeamPage() {
  const { shopId, isDemo } = useUser();
  const sid = shopId || 'demo';

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [invName, setInvName] = useState('');
  const [invEmail, setInvEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [toast, setToast] = useState('');

  // ─── Carregar ─────────────────────────────────────────
  useEffect(() => {
    if (isDemo || !db) {
      setStaff(demoStaff);
      setLoading(false);
      return;
    }
    const unsub = onSnapshot(collection(db, 'barbershops', sid, 'staff'), (snap) => {
      setStaff(snap.docs.map((d) => ({ uid: d.id, ...(d.data() as any) })));
      setLoading(false);
    });
    return () => unsub();
  }, [sid, isDemo]);

  // ─── Convidar ─────────────────────────────────────────
  const handleInvite = async () => {
    if (!invName.trim() || !invEmail.trim()) return;

    if (isDemo) {
      const newMember: StaffMember = { uid: 'demo-' + Date.now(), name: invName, email: invEmail, active: true };
      setStaff((prev) => [...prev, newMember]);
      setShowForm(false);
      setInvName('');
      setInvEmail('');
      showToast('✅ Barbeiro adicionado (demo)');
      return;
    }

    setInviting(true);
    try {
      const fn = httpsCallable(functions, 'inviteStaff');
      await fn({ shopId: sid, email: invEmail, name: invName });
      showToast('✅ Convite enviado!');
      setShowForm(false);
      setInvName('');
      setInvEmail('');
    } catch (err: any) {
      alert(err.message || 'Erro ao enviar convite');
    } finally {
      setInviting(false);
    }
  };

  // ─── Toggle ativo ─────────────────────────────────────
  const toggleActive = (member: StaffMember) => {
    if (isDemo) {
      setStaff((prev) => prev.map((s) => s.uid === member.uid ? { ...s, active: !s.active } : s));
      return;
    }
    // TODO: updateDoc no Firestore
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const activeCount = staff.filter((s) => s.active !== false).length;

  return (
    <div className="fade-in" style={{ padding: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>👥 Equipe</h1>
          <p className="text-muted" style={{ fontSize: 13, marginTop: 2 }}>{activeCount} ativo{activeCount !== 1 ? 's' : ''} de {staff.length}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            background: 'var(--primary)', color: '#fff', border: 'none',
            borderRadius: 10, padding: '8px 16px', fontWeight: 600,
            fontSize: 14, cursor: 'pointer',
          }}
        >
          + Convidar
        </button>
      </div>

      {/* Formulário de convite */}
      {showForm && (
        <div className="card" style={{ marginBottom: 20, animation: 'fadeIn 0.2s ease' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>✉️ Convidar Barbeiro</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label className="label">Nome</label>
              <input className="input" value={invName} onChange={(e) => setInvName(e.target.value)} placeholder="Nome do barbeiro" />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={invEmail} onChange={(e) => setInvEmail(e.target.value)} placeholder="email@exemplo.com" />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" onClick={handleInvite} disabled={inviting || !invName.trim() || !invEmail.trim()} style={{ flex: 1 }}>
                {inviting ? 'Enviando...' : '📨 Enviar Convite'}
              </button>
              <button className="btn btn-ghost" onClick={() => setShowForm(false)} style={{ flex: 1 }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="flex-center" style={{ padding: 60 }}><div className="spinner" /></div>
      ) : staff.length === 0 ? (
        <div className="text-center" style={{ padding: 60 }}>
          <p style={{ fontSize: 56 }}>👥</p>
          <p className="text-muted mt-lg">Nenhum barbeiro na equipe</p>
          <button className="btn btn-primary mt-xl" style={{ width: 'auto' }} onClick={() => setShowForm(true)}>
            Convidar Primeiro Barbeiro
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {staff.map((m) => (
            <div key={m.uid} className="card" style={{ padding: '14px 16px', opacity: m.active === false ? 0.6 : 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Avatar */}
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: m.photoUrl ? 'transparent' : 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, overflow: 'hidden',
                }}>
                  {m.photoUrl ? (
                    <img src={m.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ color: '#fff', fontWeight: 700, fontSize: 20 }}>
                      {(m.name || 'B').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: 15 }}>{m.name || 'Barbeiro'}</p>
                  <p className="text-muted" style={{ fontSize: 12 }}>
                    {m.email || m.phone || m.uid}
                  </p>
                </div>

                {/* Status badge */}
                <span style={{
                  padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                  color: m.active !== false ? '#10B981' : 'var(--danger)',
                  background: m.active !== false ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                }}>
                  {m.active !== false ? 'Ativo' : 'Inativo'}
                </span>
              </div>

              {/* Ações */}
              <div style={{ display: 'flex', gap: 8, marginTop: 12, borderTop: '1px solid var(--border-light)', paddingTop: 10 }}>
                <button
                  className="btn btn-ghost"
                  onClick={() => toggleActive(m)}
                  style={{ flex: 1, fontSize: 13, padding: '6px 8px' }}
                >
                  {m.active !== false ? '⏸️ Desativar' : '✅ Ativar'}
                </button>
                {m.phone && (
                  <a
                    href={`https://wa.me/55${m.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost"
                    style={{ flex: 1, fontSize: 13, padding: '6px 8px', textDecoration: 'none', textAlign: 'center' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    💬 WhatsApp
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--card)', color: 'var(--text)', padding: '10px 20px',
          borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.3)', fontSize: 14,
          fontWeight: 600, animation: 'fadeIn 0.3s ease', zIndex: 999,
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}
