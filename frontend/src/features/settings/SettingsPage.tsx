import { useQuery } from '@tanstack/react-query';
import { Settings2 } from 'lucide-react';
import { api } from '../../lib/api-client';

type SettingsData = { leadStatuses: string[]; dealStages: string[]; taskPriorities: string[]; storageMode: string };

export function SettingsPage() {
  const settings = useQuery({ queryKey: ['settings'], queryFn: () => api.get<SettingsData>('/settings') });
  return <div className="settings-page"><div className="resource-heading"><div className="resource-title-icon"><Settings2 size={21} /></div><div><h1>Settings</h1><p>Workspace options and CRM status values.</p></div></div><div className="settings-grid"><section className="panel settings-card"><h2>Lead statuses</h2><p>Available lead pipeline statuses.</p><div className="chip-list">{settings.data?.leadStatuses.map((status) => <span key={status}>{status}</span>)}</div></section><section className="panel settings-card"><h2>Deal stages</h2><p>Stages used to track sales opportunities.</p><div className="chip-list">{settings.data?.dealStages.map((stage) => <span key={stage}>{stage}</span>)}</div></section><section className="panel settings-card"><h2>Task priorities</h2><p>Priority levels available to sales teams.</p><div className="chip-list">{settings.data?.taskPriorities.map((priority) => <span key={priority}>{priority}</span>)}</div></section><section className="panel settings-card"><h2>Data storage</h2><p>Current backend storage adapter.</p><span className="storage-warning">{settings.data?.storageMode ?? 'Loading'}</span></section></div></div>;
}
