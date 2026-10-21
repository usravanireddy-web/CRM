import { Bell, CalendarClock, CheckCheck, LogOut, Menu, Search, Settings } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../app/AuthContext';
import { api } from '../../lib/api-client';
import { Sidebar } from './Sidebar';
type TaskReminder = { id: number; title: string; dueAt: string | null; status: string; relatedTo?: string | null };

const titles: Record<string, string> = {
  '/': 'Dashboard', '/leads': 'Leads', '/companies': 'Companies', '/contacts': 'Contacts', '/deals': 'Deals',
  '/lead-intelligence': 'Lead Intelligence', '/tasks': 'Tasks', '/reports': 'Reports', '/settings': 'Settings', '/support': 'Help & support',
  '/email': 'Email', '/marketing': 'Marketing', '/email-campaigns': 'Email Campaigns', '/telecalling': 'Telecalling', '/whatsapp': 'WhatsApp', '/users': 'Team & roles', '/assignments': 'Team assignments', '/account': 'Your account',
};

export function AppShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, can } = useAuth();
  const canReadTasks = can('tasks:read');
  const taskQuery = useQuery({ queryKey: ['notifications', 'tasks', user?.id], queryFn: () => api.getPage<TaskReminder>('/tasks?page=1&pageSize=100'), enabled: canReadTasks, refetchInterval: 60_000 });
  const now = Date.now();
  const reminders = (taskQuery.data?.data ?? []).filter((task) => {
    if (!task.dueAt || ['completed', 'cancelled'].includes(task.status?.toLowerCase())) return false;
    const due = new Date(task.dueAt).getTime();
    return Number.isFinite(due) && due < now + 24 * 60 * 60 * 1000;
  }).sort((a, b) => new Date(a.dueAt ?? '').getTime() - new Date(b.dueAt ?? '').getTime());
  const rootPath = `/${location.pathname.split('/').filter(Boolean)[0] ?? ''}`;
  const title = titles[rootPath] ?? 'CRM';
  const initials = user?.fullName.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase() ?? 'V';

  return <div className="app-frame"><Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} /><main className="main-area">
    <header className="topbar"><button className="menu-toggle icon-button" aria-label="Open menu" onClick={() => setMenuOpen(true)}><Menu size={21} /></button>
      <div className="global-search"><Search size={17} /><input placeholder="Search leads, companies, contacts..." aria-label="Search" /><kbd>Ctrl K</kbd></div>
      <div className="top-actions"><span className="api-indicator api-connected"><i /> Secure workspace</span><div className="notification-wrap"><button className="icon-button notification-button" aria-label={`Notifications${reminders.length ? `, ${reminders.length} task reminders` : ''}`} aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen((open) => !open)}><Bell size={19} />{reminders.length > 0 && <span className="notification-count">{reminders.length > 99 ? '99+' : reminders.length}</span>}</button>
        {notificationsOpen && <section className="notification-popover" aria-label="Notifications"><div className="notification-popover-head"><span><b>Notifications</b><small>Upcoming and overdue tasks</small></span><button onClick={() => setNotificationsOpen(false)} aria-label="Close notifications">×</button></div>
          {!canReadTasks ? <p className="notification-empty">Your role does not include task reminders.</p> : taskQuery.isLoading ? <p className="notification-empty">Loading reminders…</p> : taskQuery.isError ? <p className="notification-empty notification-error">Could not load task reminders. Check your connection and try again.</p> : reminders.length === 0 ? <p className="notification-empty"><CheckCheck size={19} /> You’re all caught up. No tasks are due in the next 24 hours.</p> : <div className="notification-list">{reminders.slice(0, 8).map((task) => {
            const dueTime = task.dueAt ? new Date(task.dueAt).getTime() : 0;
            const overdue = dueTime < now;
            return <button className="notification-item" key={task.id} onClick={() => { setNotificationsOpen(false); navigate('/tasks'); }}><span className={overdue ? 'notification-task-icon overdue' : 'notification-task-icon'}><CalendarClock size={17} /></span><span><b>{task.title}</b><small>{overdue ? 'Overdue' : 'Due soon'} · {task.dueAt ? new Date(task.dueAt).toLocaleString() : ''}{task.relatedTo ? ` · ${task.relatedTo}` : ''}</small></span></button>;
          })}</div>}
          {reminders.length > 8 && <button className="notification-view-all" onClick={() => { setNotificationsOpen(false); navigate('/tasks'); }}>View all {reminders.length} reminders</button>}
        </section>}</div>
        {can('settings:read') && <button className="icon-button settings-button" aria-label="Open settings" onClick={() => navigate('/settings')}><Settings size={19} /></button>}
        <div className="profile-summary"><span className="avatar">{initials}</span><span className="profile-copy"><b>{user?.fullName}</b><small>{user?.role.replace(/_/g, ' ')}</small></span><button className="signout-button" onClick={() => { signOut(); navigate('/login'); }} aria-label="Sign out" title="Sign out"><LogOut size={16} /></button></div>
      </div>
    </header>
    <div className="page-content"><div className="breadcrumb"><span>{user?.role.replace(/_/g, ' ')}</span><span>/</span><b>{title}</b></div>{children}</div>
  </main></div>;
}

