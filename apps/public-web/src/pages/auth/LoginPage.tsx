/* ============================
   BARBERPRO PWA — Login Page
   Email/Senha + OTP + Demo
   ============================ */
import React, { useState } from 'react';
import { useUser } from '../../store/user';
import { startOtpWhatsApp, verifyOtpWhatsApp, signInOwnerEmail } from '../../services/auth';
import type { UserRole } from '../../types';

const roles: { key: UserRole; label: string; icon: string }[] = [
  { key: 'cliente', label: 'Cliente', icon: '👤' },
  { key: 'dono', label: 'Dono', icon: '🏪' },
  { key: 'funcionario', label: 'Barbeiro', icon: '✂️' },
];

export default function LoginPage() {
  const [role, setRole] = useState<UserRole>('cliente');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const setDemo = useUser((s) => s.setDemo);

  const requestOtp = async () => {
    if (!phone.trim()) { setError('Digite seu telefone'); return; }
    setLoading(true); setError('');
    try {
      await startOtpWhatsApp(phone);
      setOtpSent(true);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  const verifyOtp = async () => {
    if (!code.trim()) { setError('Digite o código'); return; }
    setLoading(true); setError('');
    try {
      await verifyOtpWhatsApp(phone, code, role);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  const ownerLogin = async () => {
    if (!email.trim() || !password.trim()) { setError('Preencha email e senha'); return; }
    setLoading(true); setError('');
    try {
      await signInOwnerEmail(email, password);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  const demoLogin = () => setDemo(role, 'demo');

  return (
    <div className="page fade-in" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100dvh' }}>
      {/* Logo */}
      <div className="text-center" style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 56 }}>✂️</div>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--primary)', marginTop: 8 }}>BARBERPRO</h1>
        <p className="text-muted" style={{ marginTop: 4 }}>Sua barbearia na palma da mão</p>
      </div>

      {/* Seleção de Role */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {roles.map((r) => (
          <button
            key={r.key}
            onClick={() => { setRole(r.key); setOtpSent(false); setError(''); }}
            className="card"
            style={{
              flex: 1, textAlign: 'center', cursor: 'pointer',
              borderColor: role === r.key ? 'var(--primary)' : 'var(--card-border)',
              background: role === r.key ? 'var(--primary-bg)' : 'var(--card)',
            }}
          >
            <div style={{ fontSize: 28 }}>{r.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: role === r.key ? 'var(--primary)' : 'var(--text-secondary)', marginTop: 4 }}>
              {r.label}
            </div>
          </button>
        ))}
      </div>

      {/* Formulário */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {role === 'dono' ? (
          <>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="label">Senha</label>
              <input className="input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && ownerLogin()} />
            </div>
            <button className="btn btn-primary" onClick={ownerLogin} disabled={loading}>
              {loading ? '⏳ Entrando...' : '🔑 Entrar com Email'}
            </button>
          </>
        ) : !otpSent ? (
          <>
            <div>
              <label className="label">WhatsApp</label>
              <input className="input" type="tel" placeholder="+55 11 99999-9999" value={phone} onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && requestOtp()} />
            </div>
            <button className="btn btn-primary" onClick={requestOtp} disabled={loading}>
              {loading ? '⏳ Enviando...' : '📱 Receber Código'}
            </button>
          </>
        ) : (
          <>
            <p className="text-muted text-sm text-center">Código enviado para {phone}</p>
            <div>
              <label className="label">Código de 6 dígitos</label>
              <input className="input" type="text" placeholder="000000" maxLength={6} value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && verifyOtp()}
                style={{ textAlign: 'center', fontSize: 24, letterSpacing: 8 }} />
            </div>
            <button className="btn btn-primary" onClick={verifyOtp} disabled={loading}>
              {loading ? '⏳ Verificando...' : '✅ Verificar'}
            </button>
            <button className="btn btn-ghost" onClick={() => setOtpSent(false)}>← Alterar número</button>
          </>
        )}

        {error && (
          <p style={{ color: 'var(--danger)', fontSize: 13, textAlign: 'center' }}>{error}</p>
        )}
      </div>

      {/* Modo Demo */}
      <button className="btn btn-outline mt-xl" onClick={demoLogin}>
        🎮 Entrar em Modo Demo ({roles.find(r => r.key === role)?.label})
      </button>

      <p className="text-muted text-xs text-center mt-lg">
        Ao entrar, você concorda com os Termos de Uso e Política de Privacidade.
      </p>
    </div>
  );
}
