/* ============================
   BARBERPRO PWA — Services Management
   ============================ */
import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useUser } from '../../store/user';
import type { ServiceItem } from '../../types/models';

export default function ServicesPage() {
    const { shopId } = useUser();
    const [services, setServices] = useState<ServiceItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<ServiceItem | null>(null);
    const [form, setForm] = useState({ name: '', priceCents: '', durationMin: '', description: '', category: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!shopId || !db) { setLoading(false); return; }
        const unsub = onSnapshot(collection(db, 'barbershops', shopId, 'services'), (snap) => {
            setServices(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
            setLoading(false);
        });
        return () => unsub();
    }, [shopId]);

    const openNew = () => {
        setEditing(null);
        setForm({ name: '', priceCents: '', durationMin: '30', description: '', category: '' });
        setShowModal(true);
    };

    const openEdit = (s: ServiceItem) => {
        setEditing(s);
        setForm({
            name: s.name,
            priceCents: String(s.priceCents / 100),
            durationMin: String(s.durationMin),
            description: s.description || '',
            category: s.category || '',
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!shopId || !form.name.trim()) return;
        setSaving(true);
        const data = {
            name: form.name.trim(),
            priceCents: Math.round(parseFloat(form.priceCents || '0') * 100),
            durationMin: parseInt(form.durationMin || '30'),
            description: form.description.trim(),
            category: form.category.trim(),
            active: true,
        };
        try {
            if (editing) {
                await updateDoc(doc(db, 'barbershops', shopId, 'services', editing.id), data);
            } else {
                await addDoc(collection(db, 'barbershops', shopId, 'services'), { ...data, createdAt: serverTimestamp() });
            }
            setShowModal(false);
        } catch (e: any) {
            alert(e.message || 'Erro ao salvar');
        }
        setSaving(false);
    };

    const handleToggle = async (s: ServiceItem) => {
        if (!shopId) return;
        await updateDoc(doc(db, 'barbershops', shopId, 'services', s.id), { active: !s.active });
    };

    const handleDelete = async (s: ServiceItem) => {
        if (!shopId || !confirm(`Excluir "${s.name}"?`)) return;
        await deleteDoc(doc(db, 'barbershops', shopId, 'services', s.id));
    };

    const formatPrice = (cents: number) => `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;

    return (
        <div className="page-content">
            <div className="container">
                <div style={{ padding: 'var(--sp-xl) 0' }} className="row-between">
                    <h1 className="title">✂️ Serviços</h1>
                    <button className="btn btn-primary btn-sm" style={{ width: 'auto' }} onClick={openNew}>+ Novo</button>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-md)' }}>
                        {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 'var(--r-lg)' }} />)}
                    </div>
                ) : services.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">✂️</div>
                        <div className="empty-state-title">Nenhum serviço</div>
                        <div className="empty-state-text">Adicione seu primeiro serviço</div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-md)' }}>
                        {services.map((s) => (
                            <div key={s.id} className="card animate-fade-in" style={{ opacity: s.active ? 1 : 0.5, marginBottom: 0 }}>
                                <div className="row-between" style={{ marginBottom: 'var(--sp-sm)' }}>
                                    <div className="heading">{s.name}</div>
                                    <div className="heading" style={{ color: 'var(--primary)' }}>{formatPrice(s.priceCents)}</div>
                                </div>
                                <div className="row" style={{ marginBottom: 'var(--sp-md)' }}>
                                    <span className="badge badge-info">⏱ {s.durationMin}min</span>
                                    {s.category && <span className="badge badge-primary">{s.category}</span>}
                                    {!s.active && <span className="badge badge-danger">Inativo</span>}
                                </div>
                                {s.description && <p className="caption" style={{ marginBottom: 'var(--sp-md)' }}>{s.description}</p>}
                                <div style={{ display: 'flex', gap: 'var(--sp-sm)' }}>
                                    <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => openEdit(s)}>✏️ Editar</button>
                                    <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => handleToggle(s)}>
                                        {s.active ? '🔴 Desativar' : '🟢 Ativar'}
                                    </button>
                                    <button className="btn btn-ghost btn-sm" style={{ flex: 0, color: 'var(--danger)' }} onClick={() => handleDelete(s)}>🗑</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-handle" />
                        <h2 className="subtitle" style={{ marginBottom: 'var(--sp-xl)' }}>
                            {editing ? 'Editar Serviço' : 'Novo Serviço'}
                        </h2>
                        <div className="input-group">
                            <label className="input-label">Nome do serviço</label>
                            <input className="input" placeholder="Ex: Corte Fade" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-md)' }}>
                            <div className="input-group">
                                <label className="input-label">Preço (R$)</label>
                                <input className="input" type="number" placeholder="35.00" value={form.priceCents} onChange={(e) => setForm({ ...form, priceCents: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Duração (min)</label>
                                <input className="input" type="number" placeholder="30" value={form.durationMin} onChange={(e) => setForm({ ...form, durationMin: e.target.value })} />
                            </div>
                        </div>
                        <div className="input-group">
                            <label className="input-label">Categoria</label>
                            <input className="input" placeholder="Ex: Cabelo, Barba" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Descrição</label>
                            <textarea className="input" rows={3} placeholder="Descrição do serviço..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical', minHeight: 80 }} />
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--sp-md)', marginTop: 'var(--sp-lg)' }}>
                            <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                                {saving ? 'Salvando...' : editing ? 'Salvar' : 'Criar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
