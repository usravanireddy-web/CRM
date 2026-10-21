import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PhoneCall, Plus } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useAuth } from '../../app/AuthContext';
import { api, apiErrorMessage } from '../../lib/api-client';

type CallLog = { id: number; contactName: string; phone: string; outcome: string; notes: string; createdAt: string };
const outcomes = ['Connected', 'No answer', 'Voicemail', 'Callback requested', 'Meeting booked'];

export function TelecallingPage() {
  const { can } = useAuth(); const client = useQueryClient();
  const logs = useQuery({ queryKey: ['telecalling', 'logs'], queryFn: () => api.get<CallLog[]>('/telecalling/logs') });
  const [contactName, setContactName] = useState(''); const [phone, setPhone] = useState(''); const [outcome, setOutcome] = useState(outcomes[0]); const [notes, setNotes] = useState(''); const [message, setMessage] = useState('');
  const save = useMutation({ mutationFn: () => api.post('/telecalling/logs', { contactName, phone, outcome, notes }), onSuccess: () => { setContactName(''); setPhone(''); setNotes(''); setMessage('Call activity saved.'); client.invalidateQueries({ queryKey: ['telecalling', 'logs'] }); }, onError: (error) => setMessage(apiErrorMessage(error)) });
  function submit(event: FormEvent) { event.preventDefault(); save.mutate(); }
  return <div className="communications-page"><div className="resource-heading"><span className="resource-title-icon telecalling-icon"><PhoneCall size={21} /></span><div><h1>Telecalling</h1><p>Keep a clear, role-scoped log of customer calls and next steps.</p></div></div>
    <div className="provider-notice"><span className="notice-icon"><PhoneCall size={18} /></span><div><b>Call logging is ready</b><p>This page records calls in your CRM. It does not dial phone numbers or use a paid calling provider.</p></div><span className="demo-tag">MANUAL LOG</span></div>
    {can('telecalling:create') && <section className="panel communication-card"><div className="panel-title"><div><h2>Log a call</h2><p>Record the result while it is fresh.</p></div></div><form className="communication-form call-log-form" onSubmit={submit}><label>Contact name<input required minLength={2} value={contactName} onChange={(event) => setContactName(event.target.value)} placeholder="Contact name" /></label><label>Phone number<input required type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+1 555 010 2000" /></label><label>Call outcome<select value={outcome} onChange={(event) => setOutcome(event.target.value)}>{outcomes.map((item) => <option key={item}>{item}</option>)}</select></label><label>Notes<textarea rows={3} maxLength={2000} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Follow-up details" /></label>{message && <p className={save.isError ? 'inline-error' : 'success-message'}>{message}</p>}<button className="primary-action" disabled={save.isPending}><Plus size={15} />{save.isPending ? 'Saving…' : 'Save call log'}</button></form></section>}
    <section className="panel communication-card"><div className="panel-title"><div><h2>Recent calls</h2><p>Activity visible to your role.</p></div></div>{logs.isError && <p className="inline-error">{apiErrorMessage(logs.error)}</p>}{logs.data?.length ? <div className="communication-list">{logs.data.map((log) => <div className="communication-row" key={log.id}><span className="communication-icon call"><PhoneCall size={16} /></span><span><b>{log.contactName} <small>· {log.outcome}</small></b><small>{log.phone} · {new Date(log.createdAt).toLocaleString()}</small>{log.notes && <small>{log.notes}</small>}</span></div>)}</div> : <div className="simple-empty"><PhoneCall size={22} /><b>{logs.isLoading ? 'Loading calls…' : 'No call activity yet'}</b><p>Log your first call to build a useful history.</p></div>}</section>
  </div>;
}
