import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { AppShell } from '../components/layout/AppShell';
import { CompaniesPage } from '../features/companies/CompaniesPage';
import { ContactsPage } from '../features/contacts/ContactsPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { DealsPage } from '../features/deals/DealsPage';
import { LeadIntelligencePage } from '../features/lead-intelligence/LeadIntelligencePage';
import { LeadsPage } from '../features/leads/LeadsPage';
import { ReportsPage } from '../features/reports/ReportsPage';
import { RecordDetailPage } from '../features/shared/RecordDetailPage';
import { resources } from '../features/shared/resource-definitions';
import { SettingsPage } from '../features/settings/SettingsPage';
import { SupportPage } from '../features/support/SupportPage';
import { TasksPage } from '../features/tasks/TasksPage';
import { ResourcePage } from '../features/shared/ResourcePage';
import { LoginPage } from '../features/auth/LoginPage';
import { EmailPage } from '../features/communications/EmailPage';
import { MarketingPage } from '../features/communications/MarketingPage';
import { EmailCampaignsPage } from '../features/communications/EmailCampaignsPage';
import { TelecallingPage } from '../features/communications/TelecallingPage';
import { WhatsAppPage } from '../features/communications/WhatsAppPage';
import { UsersPage } from '../features/users/UsersPage';
import { AssignmentsPage } from '../features/users/AssignmentsPage';
import { AccountPage } from '../features/auth/AccountPage';
import { RegisterPage } from '../features/auth/RegisterPage';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 15_000 } } });

function RequireAuth() {
  const { user, loading } = useAuth();
  if (loading) return <div className="auth-loading">Checking your secure session...</div>;
  return user ? <AppShell><Outlet /></AppShell> : <Navigate to="/login" replace />;
}

function Allow({ permission, children }: { permission: string; children: React.ReactNode }) {
  const { can } = useAuth();
  return can(permission) ? <>{children}</> : <div className="permission-denied"><h1>Access restricted</h1><p>Your workspace role does not include access to this screen.</p></div>;
}

export function App() {
  return <QueryClientProvider client={queryClient}><AuthProvider><BrowserRouter><Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route element={<RequireAuth />}>
      <Route index element={<Allow permission="dashboard:read"><DashboardPage /></Allow>} />
      <Route path="leads" element={<Allow permission="leads:read"><LeadsPage /></Allow>} />
      <Route path="leads/new" element={<Allow permission="leads:create"><ResourcePage definition={resources.leads} initialFormOpen /></Allow>} />
      <Route path="leads/:id" element={<Allow permission="leads:read"><RecordDetailPage resourceKey="leads" /></Allow>} />
      <Route path="companies" element={<Allow permission="companies:read"><CompaniesPage /></Allow>} />
      <Route path="companies/new" element={<Allow permission="companies:create"><ResourcePage definition={resources.companies} initialFormOpen /></Allow>} />
      <Route path="companies/:id" element={<Allow permission="companies:read"><RecordDetailPage resourceKey="companies" /></Allow>} />
      <Route path="contacts" element={<Allow permission="contacts:read"><ContactsPage /></Allow>} />
      <Route path="contacts/new" element={<Allow permission="contacts:create"><ResourcePage definition={resources.contacts} initialFormOpen /></Allow>} />
      <Route path="contacts/:id" element={<Allow permission="contacts:read"><RecordDetailPage resourceKey="contacts" /></Allow>} />
      <Route path="deals" element={<Allow permission="deals:read"><DealsPage /></Allow>} />
      <Route path="deals/new" element={<Allow permission="deals:create"><ResourcePage definition={resources.deals} initialFormOpen /></Allow>} />
      <Route path="deals/:id" element={<Allow permission="deals:read"><RecordDetailPage resourceKey="deals" /></Allow>} />
      <Route path="tasks" element={<Allow permission="tasks:read"><TasksPage /></Allow>} />
      <Route path="tasks/new" element={<Allow permission="tasks:create"><ResourcePage definition={resources.tasks} initialFormOpen /></Allow>} />
      <Route path="tasks/:id" element={<Allow permission="tasks:read"><RecordDetailPage resourceKey="tasks" /></Allow>} />
      <Route path="lead-intelligence" element={<Allow permission="lead_intelligence:read"><LeadIntelligencePage /></Allow>} />
      <Route path="reports" element={<Allow permission="reports:read"><ReportsPage /></Allow>} />
      <Route path="email" element={<Allow permission="email:read"><EmailPage /></Allow>} />
      <Route path="marketing" element={<Allow permission="marketing:read"><MarketingPage /></Allow>} />
      <Route path="email-campaigns" element={<Allow permission="email_campaigns:read"><EmailCampaignsPage /></Allow>} />
      <Route path="telecalling" element={<Allow permission="telecalling:read"><TelecallingPage /></Allow>} />
      <Route path="whatsapp" element={<Allow permission="whatsapp:read"><WhatsAppPage /></Allow>} />
      <Route path="users" element={<Allow permission="users:read"><UsersPage /></Allow>} />
      <Route path="assignments" element={<Allow permission="assignments:manage"><AssignmentsPage /></Allow>} />
      <Route path="account" element={<AccountPage />} />
      <Route path="settings" element={<Allow permission="settings:read"><SettingsPage /></Allow>} />
      <Route path="support" element={<SupportPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  </Routes></BrowserRouter></AuthProvider></QueryClientProvider>;
}
