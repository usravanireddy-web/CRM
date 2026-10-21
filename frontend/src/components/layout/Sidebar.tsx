import {
  Activity, Building2, CalendarDays, ChartNoAxesCombined, CircleHelp, ContactRound,
  Handshake, LayoutDashboard, Mail, Megaphone, MessageCircle, PhoneCall, Send,
  Settings, Target, UserRound, Users, X,
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext';

const mainLinks = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard, permission: 'dashboard:read' },
  { label: 'Leads', to: '/leads', icon: Target, permission: 'leads:read' },
  { label: 'Companies', to: '/companies', icon: Building2, permission: 'companies:read' },
  { label: 'Contacts', to: '/contacts', icon: ContactRound, permission: 'contacts:read' },
  { label: 'Deals', to: '/deals', icon: Handshake, permission: 'deals:read' },
  { label: 'Lead Intelligence', to: '/lead-intelligence', icon: Activity, permission: 'lead_intelligence:read', badge: 'AI' },
  { label: 'Email', to: '/email', icon: Mail, permission: 'email:read' },
  { label: 'Marketing', to: '/marketing', icon: Megaphone, permission: 'marketing:read' },
  { label: 'Email Campaigns', to: '/email-campaigns', icon: Send, permission: 'email_campaigns:read' },
  { label: 'Telecalling', to: '/telecalling', icon: PhoneCall, permission: 'telecalling:read' },
  { label: 'WhatsApp', to: '/whatsapp', icon: MessageCircle, permission: 'whatsapp:read' },
  { label: 'Tasks', to: '/tasks', icon: CalendarDays, permission: 'tasks:read' },
  { label: 'Reports', to: '/reports', icon: ChartNoAxesCombined, permission: 'reports:read' },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation();
  const { can, user } = useAuth();
  const visibleLinks = mainLinks.filter((link) => can(link.permission));
  return <>
    {open && <button aria-label="Close navigation" className="mobile-scrim" onClick={onClose} />}
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <NavLink className="brand" to="/" onClick={onClose} aria-label="Velvorax CRM home"><span className="brand-mark">V</span><span className="brand-copy"><b>VELVORAX</b><small>BUILD Â· AUTOMATE Â· GROW</small></span><span className="close-menu"><X size={19} /></span></NavLink>
      <div className="workspace-label">{user?.role.replace(/_/g, ' ').toUpperCase()} WORKSPACE</div>
      <nav className="side-nav" aria-label="Main navigation">{visibleLinks.map(({ label, to, icon: Icon, badge }) => <NavLink key={to} to={to} end={to === '/'} onClick={onClose} className={({ isActive }) => `nav-link ${isActive ? 'nav-active' : ''}`}><Icon size={18} strokeWidth={1.8} /><span>{label}</span>{badge && <span className="nav-badge">{badge}</span>}</NavLink>)}</nav>
      <div className="sidebar-spacer" />
      <div className="sidebar-bottom">
        <NavLink className={({ isActive }) => `nav-link ${isActive ? 'nav-active' : ''}`} to="/account" onClick={onClose}><UserRound size={18} /><span>Your account</span></NavLink>
        {can('users:read') && <NavLink className={({ isActive }) => `nav-link ${location.pathname === '/users' || isActive ? 'nav-active' : ''}`} to="/users" onClick={onClose}><Users size={18} /><span>Team & roles</span></NavLink>}
        {can('assignments:manage') && <NavLink className={({ isActive }) => `nav-link ${location.pathname === '/assignments' || isActive ? 'nav-active' : ''}`} to="/assignments" onClick={onClose}><Users size={18} /><span>Team assignments</span></NavLink>}
        {can('settings:read') && <NavLink className={({ isActive }) => `nav-link ${location.pathname === '/settings' || isActive ? 'nav-active' : ''}`} to="/settings" onClick={onClose}><Settings size={18} /><span>Settings</span></NavLink>}
        <NavLink className={({ isActive }) => `nav-link ${isActive ? 'nav-active' : ''}`} to="/support" onClick={onClose}><CircleHelp size={18} /><span>Help & support</span></NavLink>
        <div className="help-card"><span className="help-icon"><CircleHelp size={17} /></span><b>Need a hand?</b><p>Find help with your sales workspace.</p><NavLink to="/support">Contact support <span>â†—</span></NavLink></div>
      </div>
      <div className="sidebar-foot">Â© 2026 Velvorax CRM <span>{user?.role.replace(/_/g, ' ')}</span></div>
    </aside>
  </>;
}
