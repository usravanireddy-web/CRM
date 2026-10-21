import { useQuery } from '@tanstack/react-query';
import { ChartNoAxesCombined, Handshake, ListTodo, Target, Users } from 'lucide-react';
import { useAuth } from '../../app/AuthContext';
import { api, apiErrorMessage } from '../../lib/api-client';

type Summary = {
  totalLeads: number | null;
  qualifiedLeads: number | null;
  openDeals: number | null;
  wonDeals: number | null;
  openTasks: number | null;
  byLeadStatus: { status: string; count: number }[];
};

export function ReportsPage() {
  const { user, can } = useAuth();
  const query = useQuery({ queryKey: ['reports', 'summary', user?.id], queryFn: () => api.get<Summary>('/reports/summary') });
  const data = query.data;
  const values = [
    ['Total leads', data?.totalLeads, Target, 'leads:read'],
    ['Qualified', data?.qualifiedLeads, Users, 'leads:read'],
    ['Open deals', data?.openDeals, Handshake, 'deals:read'],
    ['Won deals', data?.wonDeals, ChartNoAxesCombined, 'deals:read'],
    ['Open tasks', data?.openTasks, ListTodo, 'tasks:read'],
  ] as const;

  return <div className="reports-page">
    <div className="resource-heading"><div className="resource-title-icon"><ChartNoAxesCombined size={21} /></div><div><h1>Reports</h1><p>Understand your sales pipeline using current workspace records.</p></div></div>
    {query.isError && <div className="inline-error">{apiErrorMessage(query.error)}</div>}
    <div className="kpi-grid report-kpis">{values.filter(([, , , permission]) => can(permission)).map(([label, count, Icon]) => <article className="kpi-card" key={label}><div className="kpi-top"><span>{label}</span><span className="kpi-icon"><Icon size={18} /></span></div><strong>{query.isLoading ? '...' : count ?? 0}</strong><small>Current records available to your role</small></article>)}</div>
    {can('leads:read') && <section className="panel report-panel"><div className="panel-title"><div><h2>Lead status breakdown</h2><p>Counts are calculated from leads available to your role.</p></div></div>{data?.byLeadStatus.length ? data.byLeadStatus.map(({ status, count }) => <div className="report-bar" key={status}><span>{status}</span><div><i style={{ width: `${Math.max(3, count / Math.max(data.totalLeads ?? 0, 1) * 100)}%` }} /></div><b>{count}</b></div>) : <div className="simple-empty"><Target size={21} /><b>No lead report data yet</b><p>Create leads to populate this report.</p></div>}</section>}
  </div>;
}
