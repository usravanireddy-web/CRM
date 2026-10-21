import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, ContactRound, Handshake, LoaderCircle, Pencil, Plus, Search, Target, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, apiErrorMessage } from '../../lib/api-client';
import type { ResourceDefinition, ResourceField } from './resource-definitions';

const icons = { target: Target, building: Building2, contact: ContactRound, deal: Handshake, task: Plus };
type Row = Record<string, unknown> & { id: string };

export function ResourcePage({ definition, initialFormOpen = false }: { definition: ResourceDefinition; initialFormOpen?: boolean }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Row | null>(null);
  const [formOpen, setFormOpen] = useState(initialFormOpen);
  const query = useQuery({ queryKey: [definition.key, search], queryFn: () => api.getPage<Row>(`/${definition.key}?search=${encodeURIComponent(search)}`) });
  const save = useMutation({ mutationFn: (payload: Record<string, unknown>) => editing ? api.patch<Row>(`/${definition.key}/${editing.id}`, payload) : api.post<Row>(`/${definition.key}`, payload), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: [definition.key] }); setFormOpen(false); setEditing(null); } });
  const remove = useMutation({ mutationFn: (id: string) => api.delete(`/${definition.key}/${id}`), onSuccess: () => queryClient.invalidateQueries({ queryKey: [definition.key] }) });
  const rows = query.data?.data ?? [];
  const Icon = icons[definition.icon as keyof typeof icons] ?? Target;

  function beginCreate() { setEditing(null); setFormOpen(true); }
  function beginEdit(row: Row) { setEditing(row); setFormOpen(true); }
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const payload: Record<string, unknown> = {};
    definition.fields.forEach((field) => {
      const raw = String(values.get(field.name) ?? '').trim();
      payload[field.name] = field.type === 'number' ? (raw ? Number(raw) : null) : field.type === 'date' ? (raw || null) : raw;
    });
    save.mutate(payload);
  }

  return <div className="resource-page"><div className="resource-heading"><div className="resource-title-icon"><Icon size={21} /></div><div><h1>{definition.title}</h1><p>{definition.description}</p></div><button className="primary-action" onClick={beginCreate}><Plus size={15} /> Add {definition.singular}</button></div>
    <div className="resource-toolbar"><div><b>{query.data?.meta.total ?? rows.length}</b><span> {definition.title.toLowerCase()}</span></div><label className="resource-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${definition.title.toLowerCase()}...`} /></label></div>
    {formOpen && <form className="resource-form panel" onSubmit={submit}><div className="form-heading"><div><h2>{editing ? `Edit ${definition.singular}` : `Add ${definition.singular}`}</h2><p>Fields marked required must be completed.</p></div><button type="button" className="icon-button" aria-label="Close form" onClick={() => { setFormOpen(false); setEditing(null); }}><X size={18} /></button></div><div className="form-grid">{definition.fields.map((field) => <FieldInput field={field} initialValue={editing?.[field.name]} key={field.name} />)}</div>{save.isError && <p className="form-error">{apiErrorMessage(save.error)}</p>}<div className="form-actions"><button className="secondary-action" type="button" onClick={() => { setFormOpen(false); setEditing(null); }}>Cancel</button><button className="primary-action" disabled={save.isPending}>{save.isPending && <LoaderCircle className="spin" size={15} />}{editing ? 'Save changes' : `Create ${definition.singular}`}</button></div></form>}
    {query.isError && <div className="inline-error">{apiErrorMessage(query.error)}</div>}
    <div className="panel resource-table-wrap"><table className="resource-table"><thead><tr>{definition.columns.map((column) => <th key={column.key}>{column.label}</th>)}<th className="actions-heading">ACTIONS</th></tr></thead><tbody>{query.isLoading ? <tr><td className="resource-message" colSpan={definition.columns.length + 1}>Loading {definition.title.toLowerCase()}…</td></tr> : rows.length === 0 ? <tr><td className="resource-message" colSpan={definition.columns.length + 1}><div className="resource-empty"><span><Icon size={21} /></span><b>{search ? 'No matching records' : `No ${definition.title.toLowerCase()} yet`}</b><p>{search ? 'Try another search.' : `Create your first ${definition.singular} to get started.`}</p>{!search && <button className="outline-action" onClick={beginCreate}>Add {definition.singular} <span>+</span></button>}</div></td></tr> : rows.map((row) => <tr key={row.id}>{definition.columns.map((column, index) => <td key={column.key}>{index === 0 ? <Link className="row-primary" to={`/${definition.key}/${row.id}`}>{String(row[column.key] ?? '—')}</Link> : column.key === 'status' || column.key === 'stage' || column.key === 'priority' ? <span className="status-pill">{String(row[column.key] ?? '—')}</span> : String(row[column.key] ?? '—')}</td>)}<td className="row-actions"><button aria-label={`Edit ${definition.singular}`} onClick={() => beginEdit(row)}><Pencil size={14} /></button><button aria-label={`Delete ${definition.singular}`} onClick={() => { if (window.confirm(`Delete this ${definition.singular}?`)) remove.mutate(row.id); }}><Trash2 size={14} /></button></td></tr>)}</tbody></table></div>
    <div className="resource-pagination"><span>Showing {rows.length} of {query.data?.meta.total ?? 0}</span><span>Page 1</span></div>
  </div>;
}

function FieldInput({ field, initialValue }: { field: ResourceField; initialValue?: unknown }) {
  const id = useMemo(() => `field-${field.name}`, [field.name]);
  const value = initialValue == null ? '' : field.type === 'date' ? String(initialValue).slice(0, 10) : String(initialValue);
  return <label className="form-field" htmlFor={id}><span>{field.label}{field.required && <i> *</i>}</span>{field.type === 'select' ? <select id={id} name={field.name} defaultValue={value || field.options?.[0]} required={field.required}>{field.options?.map((option) => <option key={option}>{option}</option>)}</select> : <input id={id} name={field.name} type={field.type ?? 'text'} min={field.type === 'number' ? 0 : undefined} defaultValue={value} placeholder={field.placeholder ?? `Enter ${field.label.toLowerCase()}`} required={field.required} />}</label>;
}
