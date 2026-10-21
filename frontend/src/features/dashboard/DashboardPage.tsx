import { useQuery } from '@tanstack/react-query';
import {
  Activity, ArrowUpRight, Building2, ChartNoAxesCombined, CheckSquare, Clock3,
  ContactRound, Handshake, Plus, Target, Users, type LucideIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api-client';
import { useAuth } from '../../app/AuthContext';

type Breakdown = { status?: string; source?: string; count: number };
type Summary = {
  totalLeads: number | null;
  qualifiedLeads: number | null;
  openDeals: number | null;
  wonDeals: number | null;
  openTasks: number | null;
  totalCompanies: number | null;
  byLeadStatus: Breakdown[];
  byLeadSource: Breakdown[];
};
type CrmRecord = Record<string, unknown>;

const sourceColors = ['#3978ec', '#35b68a', '#e1ad39', '#8b5cf6', '#ef6b65', '#31a5c1', '#8491a3'];

function DonutChart({ sources, total }: { sources: Breakdown[]; total: number }) {
  let progress = 0;
  const segments = sources.map((source, index) => {
    const share = total ? (source.count / total) * 100 : 0;
    const start = progress;
    progress += share;
    return `${sourceColors[index % sourceColors.length]} ${start}% ${progress}%`;
  });

  if (!segments.length) segments.push('#e9edf2 0% 100%');

  return <div className="source-chart-wrap">
    <div className="source-donut" style={{ background: `conic-gradient(${segments.join(', ')})` }} role="img" aria-label={`Lead sources for ${total} leads`}>
      <div><strong>{total.toLocaleString()}</strong><span>Total leads</span></div>
    </div>
    <div className="source-legend">{sources.length ? sources.map((source, index) => <div key={source.source}>
      <i style={{ background: sourceColors[index % sourceColors.length] }} /><span>{source.source}</span><strong>{source.count}</strong>
    </div>) : <p>Source breakdown will appear when leads are added.</p>}</div>
  </div>;
}

export function DashboardPage() {
  const { user, can } = useAuth();
  const summary = useQuery({ queryKey: ['reports', 'summary', user?.id], queryFn: () => api.get<Summary>('/reports/summary') });
  const leads = useQuery({ queryKey: ['leads', 'recent'], queryFn: () => api.getPage<CrmRecord>('/leads?pageSize=5'), enabled: can('leads:read') });
  const tasks = useQuery({ queryKey: ['tasks', 'upcoming'], queryFn: () => api.getPage<CrmRecord>('/tasks?pageSize=5'), enabled: can('tasks:read') });
  const stats = summary.data;
  const kpis: { label: string; value: number | null | undefined; caption: string; Icon: LucideIcon; permission: string }[] = [
    { label: 'Total leads', value: stats?.totalLeads, caption: 'Visible in your workspace', Icon: Target, permission: 'leads:read' },
    { label: 'Qualified leads', value: stats?.qualifiedLeads, caption: 'Ready for follow-up', Icon: Users, permission: 'leads:read' },
    { label: 'Open deals', value: stats?.openDeals, caption: 'Active opportunities', Icon: Handshake, permission: 'deals:read' },
    { label: 'Companies', value: stats?.totalCompanies, caption: 'Visible in your CRM', Icon: Building2, permission: 'companies:read' },
    { label: 'Open tasks', value: stats?.openTasks, caption: 'Need attention', Icon: CheckSquare, permission: 'tasks:read' },
  ];
  const quickActions: { label: string; path: string; Icon: LucideIcon }[] = [
    { label: 'Lead', path: '/leads/new', Icon: Target }, { label: 'Company', path: '/companies/new', Icon: Building2 },
    { label: 'Contact', path: '/contacts/new', Icon: ContactRound }, { label: 'Deal', path: '/deals/new', Icon: Handshake },
    { label: 'Task', path: '/tasks/new', Icon: Activity },
  ];
  const visibleActions = quickActions.filter(({ path }) => can(`${path.split('/')[1]}:create`));
  const roleIntro: Record<string, [string, string]> = {
    admin: ['Workspace overview', 'Monitor workspace activity and manage your team.'],
    sales_manager: ['Team sales overview', 'Track pipeline progress and keep team follow-ups moving.'],
    sales_rep: ['Your sales overview', 'Your assigned pipeline, opportunities and next tasks.'],
    lead_researcher: ['Lead research overview', 'Your assigned prospects and discovery work.'],
    marketing: ['Marketing overview', 'Review lead sources and activity from your outreach.'],
    telecaller: ['Your calling workspace', 'Your assigned leads, call activity and follow-up tasks.'],
  };
  const [dashboardTitle, dashboardDescription] = roleIntro[user?.role ?? 'sales_rep'];
  const visibleKpis = kpis.filter(({ permission }) => can(permission));

  return <>
    <div className="welcome-row"><div><div className="eyebrow">{user?.role.replace(/_/g, ' ').toUpperCase()} WORKSPACE <span className="live-dot" /></div><h1>Welcome, {user?.fullName.split(' ')[0]}</h1><p>{dashboardDescription}</p></div>{can('leads:create') && <Link className="primary-action" to="/leads/new"><Plus size={15} /> Add a lead</Link>}</div>
    {summary.isError && <div className="inline-error">Could not load dashboard data. Check that the API and database are running.</div>}

    <section className="section-block"><div className="section-heading"><div><h2>{dashboardTitle}</h2><p>Live totals calculated from records visible to your role.</p></div>{can('reports:read') && <Link className="text-button" to="/reports">View reports <ArrowUpRight size={13} /></Link>}</div>
      <div className={`kpi-grid dashboard-kpis dashboard-kpis-${visibleKpis.length}`}>{visibleKpis.map(({ label, value, caption, Icon }, index) => <article className={`kpi-card kpi-color-${index % 5}`} key={label}><div className="kpi-top"><span>{label}</span><span className="kpi-icon"><Icon size={18} /></span></div><strong>{summary.isLoading ? 'â€¦' : value ?? 0}</strong><small>{caption}</small></article>)}</div>
    </section>

    {can('leads:read') && <div className="overview-grid dashboard-charts">
      <section className="panel chart-panel"><div className="panel-title"><div><h2>Lead pipeline</h2><p>Leads grouped by their current status</p></div><Link className="text-button" to="/leads">Manage leads <ArrowUpRight size={13} /></Link></div>
        {stats?.byLeadStatus.length ? <div className="status-list">{stats.byLeadStatus.map(({ status = 'Other', count }) => <div className="status-row" key={status}><span>{status}</span><strong>{count}</strong><div className="status-track"><i style={{ width: `${Math.max(4, (count / Math.max(stats.totalLeads ?? 0, 1)) * 100)}%` }} /></div></div>)}</div> : <div className="dashboard-empty"><div className="empty-icon"><ChartNoAxesCombined size={20} /></div><b>Your lead activity will appear here</b><p>Add leads to see your pipeline overview.</p><Link className="outline-action" to="/leads/new">Add a lead <span>+</span></Link></div>}
      </section>
      <section className="panel source-panel"><div className="panel-title"><div><h2>Leads by source</h2><p>Where your leads come from</p></div></div><DonutChart sources={stats?.byLeadSource ?? []} total={stats?.totalLeads ?? 0} /></section>
    </div>}

    <div className={`lower-grid dashboard-lower-grid ${can('leads:read') && can('tasks:read') ? '' : 'dashboard-single'}`}>
      {can('leads:read') && <section className="panel recent-panel"><div className="panel-title"><div><h2>Recent leads</h2><p>Your latest opportunities</p></div><Link className="text-button" to="/leads">View all <ArrowUpRight size={13} /></Link></div>
        <div className="table-head table-head-leads"><span>LEAD / COMPANY</span><span>EMAIL</span><span>STATUS</span><span>OWNER</span></div>
        {leads.data?.data.length ? leads.data.data.map((lead) => <Link className="data-row dashboard-lead-row" to={`/leads/${lead.id}`} key={String(lead.id)}><span><b>{String(lead.firstName ?? '')} {String(lead.lastName ?? '')}</b><small>{String(lead.company ?? 'No company linked')}</small></span><span>{String(lead.email ?? 'â€”')}</span><span><i className="status-pill">{String(lead.status ?? 'New')}</i></span><span>{String(lead.owner ?? 'Unassigned')}</span></Link>) : <div className="table-empty"><span className="table-icon"><Target size={20} /></span><div><b>{leads.isLoading ? 'Loading leadsâ€¦' : 'No leads yet'}</b><p>Create a lead to start tracking an opportunity.</p></div><Link className="add-first" to="/leads/new">Add your first lead <span>+</span></Link></div>}
      </section>}
      {can('tasks:read') && <section className="panel tasks-panel"><div className="panel-title"><div><h2>Upcoming tasks</h2><p>Keep your follow-ups moving</p></div><Link className="text-button" to="/tasks">View all <ArrowUpRight size={13} /></Link></div>
        {tasks.data?.data.length ? <div className="dashboard-task-list">{tasks.data.data.map((task) => <Link to={`/tasks/${task.id}`} className="dashboard-task" key={String(task.id)}><span className="task-calendar"><Clock3 size={16} /></span><span><b>{String(task.title ?? 'Untitled task')}</b><small>{String(task.dueAt ?? 'No due date')} Â· {String(task.priority ?? 'Normal')} priority</small></span><ArrowUpRight size={14} /></Link>)}</div> : <div className="tasks-empty"><span className="task-calendar"><Clock3 size={18} /></span><b>{tasks.isLoading ? 'Loading tasksâ€¦' : 'No tasks yet'}</b><p>Add a reminder to keep your sales moving.</p><Link className="outline-action" to="/tasks/new">Create a task</Link></div>}
      </section>}
    </div>

    {visibleActions.length > 0 && <section className="panel dashboard-quick-panel"><div className="panel-title"><div><h2>Quick actions</h2><p>Common actions available to your role</p></div></div><div className="quick-actions">{visibleActions.map(({ label, path, Icon }) => <Link key={label} to={path}><i><Icon size={18} /></i><span>Add {label}</span></Link>)}</div></section>}
  </>;
}
