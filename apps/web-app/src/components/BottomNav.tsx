import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useUser } from '../store/user';

interface NavItem { path: string; icon: string; label: string; }

const customerNav: NavItem[] = [
    { path: '/', icon: '🏠', label: 'Início' },
    { path: '/appointments', icon: '📅', label: 'Agenda' },
    { path: '/history', icon: '📜', label: 'Histórico' },
    { path: '/loyalty', icon: '⭐', label: 'Fidelidade' },
    { path: '/profile', icon: '👤', label: 'Perfil' },
];

const ownerNav: NavItem[] = [
    { path: '/', icon: '📊', label: 'Dashboard' },
    { path: '/services', icon: '✂️', label: 'Serviços' },
    { path: '/team', icon: '👥', label: 'Equipe' },
    { path: '/reports', icon: '💰', label: 'Relatórios' },
    { path: '/profile', icon: '⚙️', label: 'Config' },
];

const staffNav: NavItem[] = [
    { path: '/', icon: '📋', label: 'Agenda' },
    { path: '/chat', icon: '💬', label: 'Chat' },
    { path: '/profile', icon: '⚙️', label: 'Perfil' },
];

export default function BottomNav() {
    const role = useUser((s) => s.role);
    const location = useLocation();
    const items = role === 'dono' ? ownerNav : role === 'funcionario' ? staffNav : customerNav;

    return (
        <nav className="bottom-nav">
            {items.map((item) => (
                <NavLink key={item.path} to={item.path} className={`bottom-nav-item ${location.pathname === item.path ? 'active' : ''}`}>
                    <span className="bottom-nav-icon">{item.icon}</span>
                    <span>{item.label}</span>
                </NavLink>
            ))}
        </nav>
    );
}
