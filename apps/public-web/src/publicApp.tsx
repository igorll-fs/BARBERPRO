/* ============================
   BARBERPRO — Página Pública da Barbearia
   Perfil, serviços, contato, link para app
   ============================ */
import React, { useEffect, useState } from 'react';
import { listActiveEvents, type ShopEvent } from './services/events';

interface ServiceItem {
  id: string;
  name: string;
  priceCents: number;
  durationMin: number;
}

interface ShopData {
  name: string;
  slug: string;
  description?: string;
  phone?: string;
  address?: string;
  services: ServiceItem[];
}

const API_BASE = import.meta.env.VITE_FUNCTIONS_URL || '';

export default function App() {
  const [slug, setSlug] = useState<string>('');
  const [shop, setShop] = useState<ShopData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<ShopEvent[]>([]);

  useEffect(() => {
    const path = window.location.pathname.replace(/^\//, '').replace(/\/$/, '');
    const s = path || 'demo';
    setSlug(s);

    const fetchShop = async () => {
      try {
        const res = await fetch(`${API_BASE}/httpPublicBarbershop/${s}`);
        if (!res.ok) throw new Error('Barbearia não encontrada');
        const data = await res.json();
        setShop(data.shop);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchShop();
    // Buscar eventos ativos
    listActiveEvents(s).then(setEvents).catch(() => {});
  }, []);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>Carregando...</p>
        </div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.logo}>💈 BarberPro</h1>
          <p style={styles.errorText}>{error || 'Barbearia não encontrada'}</p>
          <a href="/" style={styles.link}>← Voltar ao início</a>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.shopName}>{shop.name}</h1>
          <p style={styles.shopSlug}>barberpro.app/{slug}</p>
        </div>
      </header>

      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroIcon}>✂️</div>
        <h2 style={styles.heroTitle}>Agende seu horário</h2>
        <p style={styles.heroSubtitle}>
          {shop.description || 'A melhor experiência em barbearia. Agende pelo app!'}
        </p>
        <div style={styles.ctaRow}>
          <a href="https://play.google.com" target="_blank" rel="noopener noreferrer" style={styles.ctaButton}>
            📱 Android
          </a>
          <a href="https://apps.apple.com" target="_blank" rel="noopener noreferrer" style={styles.ctaButtonOutline}>
            🍎 iOS
          </a>
        </div>
      </section>

      {/* Serviços */}
      {shop.services && shop.services.length > 0 && (
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Nossos Serviços</h3>
          <div style={styles.servicesGrid}>
            {shop.services.map((svc) => (
              <div key={svc.id} style={styles.serviceCard}>
                <div style={styles.serviceHeader}>
                  <span style={styles.serviceName}>{svc.name}</span>
                  <span style={styles.servicePrice}>R$ {(svc.priceCents / 100).toFixed(2)}</span>
                </div>
                <span style={styles.serviceDuration}>{svc.durationMin} min</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Eventos / Comunicados */}
      {events.length > 0 && (
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>📢 Eventos & Comunicados</h3>
          <div style={styles.servicesGrid}>
            {events.map((evt) => (
              <div key={evt.id} style={styles.serviceCard}>
                {evt.imageUrl && (
                  <img src={evt.imageUrl} alt={evt.title} style={{
                    width: '100%', height: 180, objectFit: 'cover',
                    borderRadius: 8, marginBottom: 12,
                  }} />
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{
                    padding: '2px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                    color: evt.type === 'promocao' ? '#10B981' : evt.type === 'evento' ? '#F59E0B' : '#3B82F6',
                    background: evt.type === 'promocao' ? 'rgba(16,185,129,0.15)' : evt.type === 'evento' ? 'rgba(245,158,11,0.15)' : 'rgba(59,130,246,0.15)',
                  }}>
                    {evt.type === 'promocao' ? '🏷️ Promoção' : evt.type === 'evento' ? '🎉 Evento' : '📢 Comunicado'}
                  </span>
                  {evt.expiresAt && (
                    <span style={{ fontSize: 11, color: '#64748b' }}>
                      até {new Date(evt.expiresAt).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
                <p style={{ fontWeight: 600, fontSize: 16, color: '#f1f5f9' }}>{evt.title}</p>
                {evt.description && <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 4 }}>{evt.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Contato */}
      <section style={styles.section}>
        <h3 style={styles.sectionTitle}>Contato</h3>
        <div style={styles.contactCard}>
          {shop.phone && (
            <a href={`https://wa.me/${shop.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={styles.contactItem}>
              📱 WhatsApp: {shop.phone}
            </a>
          )}
          {shop.address && (
            <p style={styles.contactItem}>📍 {shop.address}</p>
          )}
          {!shop.phone && !shop.address && (
            <p style={styles.contactItem}>Baixe o app para entrar em contato</p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>Powered by <strong>BarberPro</strong> 💈</p>
        <p style={styles.footerSmall}>Sistema de gestão para barbearias</p>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    backgroundColor: '#0f172a',
    color: '#f1f5f9',
    minHeight: '100vh',
    margin: 0,
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
  },
  spinner: {
    width: 40,
    height: 40,
    border: '3px solid #334155',
    borderTop: '3px solid #22c55e',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: { color: '#94a3b8', marginTop: 16 },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    gap: 16,
  },
  logo: { fontSize: 32, color: '#22c55e' },
  errorText: { color: '#f87171', fontSize: 18 },
  link: { color: '#22c55e', textDecoration: 'none' },
  header: {
    borderBottom: '1px solid #1e293b',
    padding: '20px 24px',
  },
  headerContent: { maxWidth: 800, margin: '0 auto' },
  shopName: { fontSize: 28, fontWeight: 700, color: '#f1f5f9', margin: 0 },
  shopSlug: { color: '#64748b', fontSize: 14, margin: '4px 0 0' },
  hero: {
    textAlign: 'center',
    padding: '60px 24px',
    background: 'linear-gradient(135deg, #0f172a 0%, #1a2e1a 100%)',
  },
  heroIcon: { fontSize: 64 },
  heroTitle: { fontSize: 36, fontWeight: 700, color: '#22c55e', margin: '16px 0 8px' },
  heroSubtitle: { color: '#94a3b8', fontSize: 18, maxWidth: 500, margin: '0 auto 24px' },
  ctaRow: { display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' },
  ctaButton: {
    display: 'inline-block',
    backgroundColor: '#22c55e',
    color: '#0f172a',
    padding: '14px 28px',
    borderRadius: 12,
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: 16,
  },
  ctaButtonOutline: {
    display: 'inline-block',
    border: '2px solid #22c55e',
    color: '#22c55e',
    padding: '12px 26px',
    borderRadius: 12,
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: 16,
  },
  section: { maxWidth: 800, margin: '0 auto', padding: '40px 24px' },
  sectionTitle: { fontSize: 24, fontWeight: 600, color: '#f1f5f9', marginBottom: 20 },
  servicesGrid: { display: 'flex', flexDirection: 'column', gap: 12 },
  serviceCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: '16px 20px',
    border: '1px solid #334155',
  },
  serviceHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  serviceName: { fontSize: 16, fontWeight: 600, color: '#f1f5f9' },
  servicePrice: { fontSize: 16, fontWeight: 700, color: '#22c55e' },
  serviceDuration: { fontSize: 14, color: '#64748b', marginTop: 4 },
  contactCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
    border: '1px solid #334155',
  },
  contactItem: {
    color: '#94a3b8',
    fontSize: 16,
    margin: '8px 0',
    textDecoration: 'none',
  },
  footer: {
    textAlign: 'center',
    padding: '40px 24px',
    borderTop: '1px solid #1e293b',
    color: '#64748b',
    fontSize: 14,
  },
  footerSmall: { fontSize: 12, marginTop: 4 },
};
