import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, LoaderCircle } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { api, apiErrorMessage } from '../../lib/api-client';
import { resources } from './resource-definitions';

export function RecordDetailPage({ resourceKey }: { resourceKey: string }) {
  const { id = '' } = useParams();
  const definition = resources[resourceKey];
  const record = useQuery({ queryKey: [resourceKey, id], queryFn: () => api.get<Record<string, unknown>>(`/${resourceKey}/${id}`) });
  if (record.isLoading) return <div className="loading-state"><LoaderCircle className="spin" /> Loading record…</div>;
  if (record.isError || !record.data) return <div className="inline-error">{apiErrorMessage(record.error)} <Link to={`/${resourceKey}`}>Back to {definition.title.toLowerCase()}</Link></div>;
  const data = record.data;
  const displayName = resourceKey === 'leads' || resourceKey === 'contacts' ? `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim() : String(data.name ?? data.title ?? 'Record');
  return <div className="detail-page"><Link className="back-link" to={`/${resourceKey}`}><ArrowLeft size={15} /> Back to {definition.title}</Link><div className="detail-heading"><div><span className="eyebrow">{definition.singular.toUpperCase()} PROFILE</span><h1>{displayName}</h1><p>Record details and current relationship information.</p></div><span className="status-pill">{String(data.status ?? data.stage ?? 'Active')}</span></div><section className="panel detail-card"><h2>Overview</h2><div className="detail-grid">{definition.fields.map((field) => <div key={field.name}><small>{field.label}</small><b>{String(data[field.name] ?? '—')}</b></div>)}</div></section><section className="panel detail-card"><h2>Record history</h2><p className="muted-copy">Activity history will be available when the activity module is added.</p></section></div>;
}
