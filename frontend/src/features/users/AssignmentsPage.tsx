import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeftRight, UserRoundCog } from 'lucide-react';
import { api, apiErrorMessage } from '../../lib/api-client';

type User = { id: number; fullName: string; email: string };
type RecordAssignment = { id: number; label: string; company?: string; status?: string; userId: number | null };
type Assignments = { users: User[]; leads: RecordAssignment[]; deals: RecordAssignment[]; tasks: RecordAssignment[] };
type ResourceKey = 'leads' | 'deals' | 'tasks';

export function AssignmentsPage() {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ['team-assignments'], queryFn: () => api.get<Assignments>('/assignments') });
  const update = useMutation({ mutationFn: ({ resource, id, userId }: { resource: ResourceKey; id: number; userId: number | null }) => api.patch(`/assignments/${resource}/${id}`, { userId }), onSuccess: () => { client.invalidateQueries({ queryKey: ['team-assignments'] }); client.invalidateQueries({ queryKey: ['reports', 'summary'] }); client.invalidateQueries({ queryKey: ['leads'] }); client.invalidateQueries({ queryKey: ['deals'] }); client.invalidateQueries({ queryKey: ['tasks'] }); } });
  const sections: { key: ResourceKey; title: string; records: RecordAssignment[] }[] = [
    { key: 'leads', title: 'Leads', records: query.data?.leads ?? [] },
    { key: 'deals', title: 'Deals', records: query.data?.deals ?? [] },
    { key: 'tasks', title: 'Tasks', records: query.data?.tasks ?? [] },
  ];
  return <div className="communications-page"><div className="resource-heading"><span className="resource-title-icon users-icon"><UserRoundCog size={21} /></span><div><h1>Team assignments</h1><p>Assign leads, deals and follow-up tasks so each person sees their own workspace.</p></div></div>
    <div className="provider-notice"><span className="notice-icon"><ArrowLeftRight size={18} /></span><div><b>Assignment changes apply immediately</b><p>Sales representatives, researchers and telecallers only receive their own assigned records through the API.</p></div><span className="demo-tag">ROLE SCOPED</span></div>
    {query.isError && <div className="inline-error">{apiErrorMessage(query.error)}</div>}
    {query.isLoading ? <div className="loading-state">Loading assignments…</div> : sections.map(({ key, title, records }) => <section className="panel communication-card" key={key}><div className="panel-title"><div><h2>{title}</h2><p>{records.length} recent records available for assignment</p></div></div>{records.length ? <div className="assignment-list">{records.map((record) => <div className="assignment-row" key={record.id}><span><b>{record.label || `Record ${record.id}`}</b><small>{record.company || record.status || `ID ${record.id}`}</small></span><select aria-label={`Assign ${record.label}`} value={record.userId ?? ''} disabled={update.isPending} onChange={(event) => update.mutate({ resource: key, id: record.id, userId: event.target.value ? Number(event.target.value) : null })}><option value="">Unassigned</option>{query.data?.users.map((person) => <option value={person.id} key={person.id}>{person.fullName} · {person.email}</option>)}</select></div>)}</div> : <div className="simple-empty"><b>No {title.toLowerCase()} to assign</b><p>Create {title.toLowerCase()} to see them here.</p></div>}</section>)}
  </div>;
}
