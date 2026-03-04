/* ============================
   BARBERPRO PWA — Layout Principal
   Bottom nav + conteúdo com padding
   ============================ */
import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useUser } from '../store/user';
import { signOut } from '../services/auth';

// ─── Tabs por role ──────────────────────────────────────
const customerTabs = [
  { to: '/app', icon: '🏠', label: 'Início', end: true },
  { to: '/app/booking', icon: '📅', label: 'Agenda' },
  { to: '/app/appointments', icon: '📋', label: 'Meus' },
  { to: '/app/profile', icon: '👤', label: 'Perfil' },
];

const ownerTabs = [
  { to: '/app', icon: '📊', label: 'Painel', end: true },
  { to: '/app/services', icon: '✂️', label: 'Serviços' },
  { to: '/app/clients', icon: '👥', label: 'Clientes' },
  { to: '/app/reports', icon: '📈', label: 'Relatórios' },
  { to: '/app/profile', icon: '⚙️', label: 'Config' },
];

const staffTabs = [
  { to: '/app', icon: '📅', label: 'Agenda', end: true },
  { to: '/app/clients', icon: '👥', label: 'Clientes' },
  { to: '/app/chat', icon: '💬', label: 'Chat' },
  { to: '/app/profile', icon: '👤', label: 'Perfil' },
];

export default function AppLayout() {
  const { role, name, isDemo } = useUser();
  const navigate = useNavigate();

  const tabs = role === 'dono' ? ownerTabs : role === 'funcionario' ? staffTabs : customerTabs;

  const handleSignOut = async () => {
    await signOut();
    useUser.getState().signOut();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
      {/* Banner demo */}
      {isDemo && (
        <div style={{
          background: 'var(--warning)', color: '#000', textAlign: 'center',
          padding: '6px 16px', fontSize: 13, fontWeight: 600,
        }}>
          🎮 Modo Demo — {name} &nbsp;
          <button onClick={handleSignOut} style={{
            background: 'rgba(0,0,0,0.15)', border: 'none', borderRadius: 6,
            padding: '2px 10px', cursor: 'pointer', fontSize: 12, fontWeight: 600,
          }}>
            Sair
          </button>
        </div>
      )}

      {/* Conteúdo */}
      <main style={{ paddingBottom: 80, maxWidth: 480, margin: '0 auto' }}>
        <Outlet />
      </main>

      {/* Bottom Nav */}
      <nav className="bottom-nav">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            <span className="nav-icon">{tab.icon}</span>
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
