/* ============================
   BARBERPRO PWA — Clientes
   Lista de clientes da barbearia (dono + staff)
   ============================ */
import React, { useState, useEffect, useMemo } from 'react';
import { useUser } from '../../store/user';
import { listShopClients, type ClientInfo } from '../../services/clients';

// Formatar preço
function fmt(cents: number): string {
  return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
}

// Tempo relativo
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Hoje';
  if (days === 1) return 'Ontem';
  if (days < 30) return `${days} dias atrás`;
  const months = Math.floor(days / 30);
  return months === 1 ? '1 mês atrás' : `${months} meses atrás`;
}

export default function ClientsPage() {
  const { shopId } = useUser();
  const sid = shopId || 'demo';

  const [clients, setClients] = useState<ClientInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'visits' | 'spent'>('recent');

  // ─── Carregar ─────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    listShopClients(sid)
      .then(setClients)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sid]);

  // ─── Filtrar e Ordenar ────────────────────────────────
  const filtered = useMemo(() => {
    let list = clients;
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(
        (c) => c.name.toLowerCase().includes(s) || c.phone?.includes(s),
      );
    }
    // Ordenar
    const sorted = [...list];
    if (sortBy === 'visits') sorted.sort((a, b) => b.totalVisits - a.totalVisits);
    else if (sortBy === 'spent') sorted.sort((a, b) => b.totalSpent - a.totalSpent);
    // 'recent' já é a ordem padrão do service
    return sorted;
  }, [clients, search, sortBy]);

  // ─── Stats Gerais ─────────────────────────────────────
  const totalClients = clients.length;
  const totalRevenue = clients.reduce((s, c) => s + c.totalSpent, 0);
  const avgTicket = totalClients > 0
    ? Math.round(totalRevenue / clients.reduce((s, c) => s + c.totalVisits, 0) || 0)
    : 0;

  return (
    <div className="fade-in" style={{ padding: 16 }}>
      {/* Header */}
      <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 16, marginBottom: 16 }}>👥 Clientes</h1>

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
        <div className="card" style={{ padding: '12px 8px', textAlign: 'center' }}>
          <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)' }}>{totalClients}</p>
          <p className="text-muted" style={{ fontSize: 11 }}>Total</p>
        </div>
        <div className="card" style={{ padding: '12px 8px', textAlign: 'center' }}>
          <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)' }}>{fmt(totalRevenue)}</p>
          <p className="text-muted" style={{ fontSize: 11 }}>Receita</p>
        </div>
        <div className="card" style={{ padding: '12px 8px', textAlign: 'center' }}>
          <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)' }}>{avgTicket > 0 ? fmt(avgTicket) : '—'}</p>
          <p className="text-muted" style={{ fontSize: 11 }}>Ticket Médio</p>
        </div>
      </div>

      {/* Busca + Filtro */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          className="input"
          placeholder="🔍 Buscar cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1 }}
        />
        <select
          className="input"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          style={{ width: 'auto', minWidth: 100, fontSize: 13 }}
        >
          <option value="recent">Recentes</option>
          <option value="visits">+ Visitas</option>
          <option value="spent">+ Gastos</option>
        </select>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex-center" style={{ padding: 60 }}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center" style={{ padding: 60 }}>
          <p style={{ fontSize: 56 }}>👥</p>
          <p className="text-muted mt-lg">
            {search ? 'Nenhum cliente encontrado' : 'Nenhum cliente ainda'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((c) => {
            const expanded = expandedId === c.uid;
            return (
              <div
                key={c.uid}
                className="card"
                onClick={() => setExpandedId(expanded ? null : c.uid)}
                style={{ padding: '14px 16px', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                {/* Linha principal */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {/* Avatar */}
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: c.photoUrl ? 'transparent' : 'var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, overflow: 'hidden',
                  }}>
                    {c.photoUrl ? (
                      <img src={c.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>
                        {c.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: 15 }}>{c.name}</p>
                    <p className="text-muted" style={{ fontSize: 12 }}>
                      {c.totalVisits} visita{c.totalVisits !== 1 ? 's' : ''}
                      {c.lastVisit && <> · {timeAgo(c.lastVisit)}</>}
                    </p>
                  </div>

                  {/* Valor total */}
                  <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap' }}>
                    {fmt(c.totalSpent)}
                  </span>
                </div>

                {/* Expandido */}
                {expanded && (
                  <div style={{
                    marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-light)',
                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
                    animation: 'fadeIn 0.2s ease',
                  }}>
                    {c.phone && (
                      <InfoItem label="📱 Telefone" value={c.phone} />
                    )}
                    <InfoItem label="📊 Visitas" value={`${c.totalVisits}`} />
                    <InfoItem label="💰 Total gasto" value={fmt(c.totalSpent)} />
                    {c.noShows > 0 && (
                      <InfoItem label="⚠️ No-shows" value={`${c.noShows}`} danger />
                    )}
                    {c.firstVisit && (
                      <InfoItem label="📅 Primeira visita" value={new Date(c.firstVisit).toLocaleDateString('pt-BR')} />
                    )}
                    {c.lastVisit && (
                      <InfoItem label="🕒 Última visita" value={new Date(c.lastVisit).toLocaleDateString('pt-BR')} />
                    )}

                    {/* Ações */}
                    {c.phone && (
                      <div style={{ gridColumn: '1 / -1', marginTop: 4 }}>
                        <a
                          href={`https://wa.me/55${c.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary"
                          style={{ fontSize: 13, textDecoration: 'none', textAlign: 'center' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          💬 WhatsApp
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Componente auxiliar ─────────────────────────────────
function InfoItem({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div>
      <p className="text-muted" style={{ fontSize: 11 }}>{label}</p>
      <p style={{ fontWeight: 600, fontSize: 14, color: danger ? 'var(--danger)' : undefined }}>{value}</p>
    </div>
  );
}
