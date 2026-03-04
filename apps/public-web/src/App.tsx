/* ============================
   BARBERPRO PWA — App Principal
   Router + Auth + Layout
   Lazy loading por rota (Fase 5)
   ============================ */
import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthListener } from './hooks/useAuth';
import { useUser } from './store/user';
import { useSubscription } from './hooks/useSubscription';

// ─── Layout (carrega sempre, sem lazy) ──────────────────
import AppLayout from './components/AppLayout';

// ─── Lazy-loaded Pages ──────────────────────────────────
const LoginPage = React.lazy(() => import('./pages/auth/LoginPage'));
const CustomerHome = React.lazy(() => import('./pages/customer/HomePage'));
const OwnerDashboard = React.lazy(() => import('./pages/owner/DashboardPage'));
const StaffArea = React.lazy(() => import('./pages/staff/AreaPage'));
const BookingPage = React.lazy(() => import('./pages/customer/BookingPage'));
const AppointmentsPage = React.lazy(() => import('./pages/customer/AppointmentsPage'));
const ProfilePage = React.lazy(() => import('./pages/customer/ProfilePage'));
const ReviewPage = React.lazy(() => import('./pages/customer/ReviewPage'));
const TeamPage = React.lazy(() => import('./pages/owner/TeamPage'));
const ServicesPage = React.lazy(() => import('./pages/owner/ServicesPage'));
const EventsPage = React.lazy(() => import('./pages/owner/EventsPage'));
const ClientsPage = React.lazy(() => import('./pages/owner/ClientsPage'));
const ReportsPage = React.lazy(() => import('./pages/owner/ReportsPage'));
const ChatPage = React.lazy(() => import('./pages/common/ChatPage'));
const PaywallPage = React.lazy(() => import('./pages/owner/PaywallPage'));
const PublicApp = React.lazy(() => import('./publicApp'));

// ─── Fallback de carregamento ───────────────────────────
function PageLoader() {
  return (
    <div className="page flex-center" style={{ minHeight: '60dvh' }}>
      <div className="spinner" style={{ margin: '0 auto' }} />
    </div>
  );
}

// ─── Guard de Rota Protegida ────────────────────────────
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isReady } = useUser();

  if (!isReady) {
    return (
      <div className="page flex-center" style={{ minHeight: '100dvh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
          <p className="text-muted mt-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// ─── Guard de Assinatura (só para donos) ────────────────
function SubscriptionGuard({ children }: { children: React.ReactNode }) {
  const { role, isDemo } = useUser();
  const { isActive, loading } = useSubscription();

  // Não bloquear: clientes, staff, ou modo demo
  if (role !== 'dono' || isDemo) return <>{children}</>;

  if (loading) {
    return (
      <div className="page flex-center" style={{ minHeight: '40dvh' }}>
        <div className="spinner" style={{ margin: '0 auto' }} />
      </div>
    );
  }

  // Sem assinatura → redirecionar para paywall
  if (!isActive) return <Navigate to="/app/subscription" replace />;
  return <>{children}</>;
}

// ─── Home por Role ──────────────────────────────────────
function RoleHome() {
  const role = useUser((s) => s.role);
  if (role === 'dono') return <OwnerDashboard />;
  if (role === 'funcionario') return <StaffArea />;
  return <CustomerHome />;
}

// ─── App Content ────────────────────────────────────────
function AppContent() {
  useAuthListener();
  const { isAuthenticated, isReady } = useUser();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Página pública da barbearia (/:slug) */}
        <Route path="/b/:slug" element={<PublicApp />} />

        {/* Login */}
        <Route path="/login" element={
          isReady && isAuthenticated ? <Navigate to="/app" replace /> : <LoginPage />
        } />

        {/* App protegido */}
        <Route path="/app" element={
          <ProtectedRoute><AppLayout /></ProtectedRoute>
        }>
          <Route index element={<RoleHome />} />
          <Route path="booking" element={<BookingPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="review/:appointmentId" element={<ReviewPage />} />
          <Route path="subscription" element={<PaywallPage />} />
          <Route path="profile" element={<ProfilePage />} />
          {/* Rotas premium (guard de assinatura para donos) */}
          <Route path="services" element={<SubscriptionGuard><ServicesPage /></SubscriptionGuard>} />
          <Route path="events" element={<SubscriptionGuard><EventsPage /></SubscriptionGuard>} />
          <Route path="team" element={<SubscriptionGuard><TeamPage /></SubscriptionGuard>} />
          <Route path="clients" element={<SubscriptionGuard><ClientsPage /></SubscriptionGuard>} />
          <Route path="reports" element={<SubscriptionGuard><ReportsPage /></SubscriptionGuard>} />
          <Route path="chat" element={<SubscriptionGuard><ChatPage /></SubscriptionGuard>} />
        </Route>

        {/* Redirecionar raiz */}
        <Route path="/" element={
          isReady && isAuthenticated ? <Navigate to="/app" replace /> : <Navigate to="/login" replace />
        } />

        {/* 404 → Login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </BrowserRouter>
  );
}

// ─── Error Boundary para capturar erros de lazy loading ─
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: '' };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, color: '#ef4444', background: '#0f172a', minHeight: '100dvh' }}>
          <h2>❌ Erro ao carregar</h2>
          <pre style={{ whiteSpace: 'pre-wrap', marginTop: 16, color: '#94a3b8' }}>
            {this.state.error}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: 16, padding: '8px 16px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
          >
            Recarregar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
