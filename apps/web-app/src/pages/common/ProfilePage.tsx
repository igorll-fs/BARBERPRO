import React, { useState } from 'react';
import { useUser } from '../../store/user';
import { doSignOut } from '../../hooks/useAuth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
    const { uid, name, email, phone, role, photoUrl, isDemo } = useUser();
    const navigate = useNavigate();
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({ name: name || '', email: email || '', phone: phone || '' });
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!uid || isDemo || !db) return;
        setSaving(true);
        try {
            await updateDoc(doc(db, 'users', uid), { name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() });
            useUser.getState().setProfile(form);
            setEditMode(false);
        } catch (e: any) { alert(e.message || 'Erro ao salvar'); }
        setSaving(false);
    };

    const handleSignOut = async () => { await doSignOut(); navigate('/'); };
    const roleLabel: Record<string, string> = { cliente: 'Cliente', dono: 'Proprietário', funcionario: 'Barbeiro' };

    return (
        <div className="page-content">
            <div className="container">
                <div style={{ padding: 'var(--sp-xl) 0' }}><h1 className="title">👤 Perfil</h1></div>
                <div className="card animate-fade-in-up" style={{ textAlign: 'center' }}>
                    <div className="avatar avatar-lg" style={{ margin: '0 auto var(--sp-lg)', width: 80, height: 80, fontSize: 32 }}>
                        {photoUrl ? <img src={photoUrl} alt="" /> : (name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <h2 className="subtitle">{name || 'Usuário'}</h2>
                    <span className="badge badge-primary" style={{ marginTop: 'var(--sp-sm)' }}>{roleLabel[role || 'cliente'] || role}</span>
                    {isDemo && <span className="badge badge-warning" style={{ marginLeft: 'var(--sp-sm)' }}>🧪 Demo</span>}
                </div>
                <div className="card animate-fade-in-up">
                    <div className="row-between" style={{ marginBottom: 'var(--sp-lg)' }}>
                        <h3 className="heading">Informações</h3>
                        {!editMode && <button className="btn btn-ghost btn-sm" style={{ width: 'auto' }} onClick={() => setEditMode(true)}>✏️ Editar</button>}
                    </div>
                    {editMode ? (
                        <>
                            <div className="input-group"><label className="input-label">Nome</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                            <div className="input-group"><label className="input-label">E-mail</label><input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                            <div className="input-group"><label className="input-label">Telefone</label><input className="input" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                            <div style={{ display: 'flex', gap: 'var(--sp-md)' }}>
                                <button className="btn btn-ghost" onClick={() => setEditMode(false)}>Cancelar</button>
                                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
                            </div>
                        </>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-lg)' }}>
                            <div><div className="caption">Nome</div><div className="body" style={{ color: 'var(--text)' }}>{name || '—'}</div></div>
                            <div><div className="caption">E-mail</div><div className="body" style={{ color: 'var(--text)' }}>{email || '—'}</div></div>
                            <div><div className="caption">Telefone</div><div className="body" style={{ color: 'var(--text)' }}>{phone || '—'}</div></div>
                        </div>
                    )}
                </div>
                <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-md)' }}>
                    <button className="btn btn-outline" onClick={() => navigate('/notifications')}>🔔 Notificações</button>
                    <div className="divider" />
                    <button className="btn btn-danger" onClick={handleSignOut}>🚪 Sair da conta</button>
                </div>
            </div>
        </div>
    );
}
