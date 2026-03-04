/* ============================
   BARBERPRO PWA — Login Page
   ============================ */
import React, { useState } from 'react';
import { useUser } from '../../store/user';
import { startOtpWhatsApp, verifyOtpWhatsApp, signInOwnerEmail } from '../../services/auth';
import type { UserRole } from '../../types/models';

const roles: { key: UserRole; label: string; icon: string }[] = [
    { key: 'cliente', label: 'Cliente', icon: '👤' },
    { key: 'dono', label: 'Proprietário', icon: '🏪' },
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
        setLoading(true);
        setError('');
        try {
            await startOtpWhatsApp(phone);
            setOtpSent(true);
        } catch (e: any) {
            setError(e.message || 'Erro ao enviar código');
        }
        setLoading(false);
    };

    const verifyOtp = async () => {
        if (!code.trim()) { setError('Digite o código'); return; }
        setLoading(true);
        setError('');
        try {
            await verifyOtpWhatsApp(phone, code, role);
        } catch (e: any) {
            setError(e.message || 'Código inválido');
        }
        setLoading(false);
    };

    const ownerEmailLogin = async () => {
        if (!email.trim() || !password.trim()) { setError('Preencha email e senha'); return; }
        setLoading(true);
        setError('');
        try {
            await signInOwnerEmail(email, password);
        } catch (e: any) {
            setError(e.message || 'Credenciais inválidas');
        }
        setLoading(false);
    };

    const demoLogin = () => setDemo(role, 'demo');

    return (
        <div className="screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--sp-xl)' }}>
            <div style={{ width: '100%', maxWidth: 420 }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 'var(--sp-xxxl)' }} className="animate-fade-in-up">
                    <div style={{ fontSize: 56, marginBottom: 'var(--sp-sm)' }}>✂️</div>
                    <h1 style={{ fontSize: 'var(--fs-xxxl)', fontWeight: 800, color: 'var(--primary)', letterSpacing: -1 }}>
                        BARBERPRO
                    </h1>
                    <p className="body" style={{ marginTop: 'var(--sp-xs)' }}>
                        Sua barbearia na palma da mão
                    </p>
                </div>

                {/* Role Selection */}
                <div style={{ display: 'flex', gap: 'var(--sp-sm)', marginBottom: 'var(--sp-xxl)' }} className="animate-fade-in-up">
                    {roles.map((r) => (
                        <button
                            key={r.key}
                            onClick={() => { setRole(r.key); setOtpSent(false); setError(''); }}
                            style={{
                                flex: 1,
                                background: role === r.key ? 'var(--primary-bg)' : 'var(--card)',
                                borderRadius: 'var(--r-md)',
                                border: `1.5px solid ${role === r.key ? 'var(--primary)' : 'var(--border-light)'}`,
                                padding: 'var(--sp-md)',
                                textAlign: 'center',
                                transition: 'all var(--transition-fast)',
                            }}
                        >
                            <div style={{ fontSize: 24 }}>{r.icon}</div>
                            <div style={{
                                color: role === r.key ? 'var(--primary)' : 'var(--text-muted)',
                                fontSize: 'var(--fs-sm)',
                                fontWeight: 600,
                                marginTop: 4,
                            }}>
                                {r.label}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        background: 'var(--danger-bg)',
                        color: 'var(--danger)',
                        padding: 'var(--sp-md) var(--sp-lg)',
                        borderRadius: 'var(--r-sm)',
                        marginBottom: 'var(--sp-lg)',
                        fontSize: 'var(--fs-sm)',
                        fontWeight: 500,
                    }}>
                        {error}
                    </div>
                )}

                {/* Forms */}
                <div className="card animate-fade-in-up">
                    {role === 'cliente' && (
                        <>
                            <h2 className="subtitle" style={{ marginBottom: 'var(--sp-lg)' }}>Login via WhatsApp</h2>
                            <div className="input-group">
                                <label className="input-label">Telefone</label>
                                <input
                                    className="input"
                                    type="tel"
                                    placeholder="+55 11 99999-9999"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>
                            {!otpSent ? (
                                <button className="btn btn-primary" onClick={requestOtp} disabled={loading}>
                                    {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : <>📱 Enviar código</>}
                                </button>
                            ) : (
                                <>
                                    <div className="input-group">
                                        <label className="input-label">Código de 6 dígitos</label>
                                        <input
                                            className="input"
                                            type="text"
                                            placeholder="123456"
                                            maxLength={6}
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                        />
                                    </div>
                                    <button className="btn btn-primary" onClick={verifyOtp} disabled={loading}>
                                        {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Entrar'}
                                    </button>
                                </>
                            )}
                        </>
                    )}

                    {role === 'dono' && (
                        <>
                            <h2 className="subtitle" style={{ marginBottom: 'var(--sp-lg)' }}>Login do Proprietário</h2>
                            <div className="input-group">
                                <label className="input-label">E-mail</label>
                                <input
                                    className="input"
                                    type="email"
                                    placeholder="email@exemplo.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Senha</label>
                                <input
                                    className="input"
                                    type="password"
                                    placeholder="••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && ownerEmailLogin()}
                                />
                            </div>
                            <button className="btn btn-primary" onClick={ownerEmailLogin} disabled={loading}>
                                {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : <>🔐 Entrar</>}
                            </button>
                        </>
                    )}

                    {role === 'funcionario' && (
                        <>
                            <h2 className="subtitle" style={{ marginBottom: 'var(--sp-lg)' }}>Acesso do Barbeiro</h2>
                            <p className="body" style={{ lineHeight: 1.6 }}>
                                Use o link de convite enviado pelo dono da barbearia para ativar sua conta.
                            </p>
                            <p className="caption" style={{ marginTop: 'var(--sp-md)' }}>
                                Ainda não tem convite? Peça ao dono para enviar um link.
                            </p>
                        </>
                    )}
                </div>

                {/* Demo */}
                <div style={{
                    marginTop: 'var(--sp-xxxl)',
                    paddingTop: 'var(--sp-lg)',
                    borderTop: '1px solid var(--border)',
                    textAlign: 'center',
                }}>
                    <p className="caption" style={{ marginBottom: 'var(--sp-md)' }}>🧪 Sem Firebase configurado?</p>
                    <button className="btn btn-outline" onClick={demoLogin}>
                        Entrar em Modo Demo
                    </button>
                </div>
            </div>
        </div>
    );
}
