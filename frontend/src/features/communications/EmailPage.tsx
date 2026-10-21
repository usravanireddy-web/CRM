import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Mail, Send } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { api, apiErrorMessage } from '../../lib/api-client';
import { useAuth } from '../../app/AuthContext';

type EmailStatus = { configured: boolean; provider: string };
type EmailLog = { id: number; recipient: string; subject: string; status: string; createdAt: string };

export function EmailPage() {
  const { can } = useAuth();
  const queryClient = useQueryClient();
  const status = useQuery({ queryKey: ['email', 'status'], queryFn: () => api.get<EmailStatus>('/email/status') });
  const logs = useQuery({ queryKey: ['email', 'logs'], queryFn: () => api.get<EmailLog[]>('/email/logs') });
  const [to, setTo] = useState(''); const [subject, setSubject] = useState(''); const [text, setText] = useState(''); const [message, setMessage] = useState('');
  const send = useMutation({ mutationFn: () => api.post('/email/send', { to, subject, text }), onSuccess: () => { setMessage('Email accepted by SMTP.'); setTo(''); setSubject(''); setText(''); queryClient.invalidateQueries({ queryKey: ['email', 'logs'] }); }, onError: (error) => setMessage(apiErrorMessage(error)) });
  function submit(event: FormEvent) { event.preventDefault(); send.mutate(); }

  return <div className="communications-page"><div className="resource-heading"><span className="resource-title-icon"><Mail size={21} /></span><div><h1>Email</h1><p>Send one-to-one email through your configured SMTP server.</p></div></div>
    <div className={`provider-notice ${status.data?.configured ? 'provider-connected' : ''}`}><span className="notice-icon"><Mail size={18} /></span><div><b>{status.data?.configured ? 'SMTP is configured' : 'SMTP setup required'}</b><p>{status.data?.configured ? 'Email delivery uses the SMTP settings in backend/.env.' : 'Add your SMTP host, port, username, password and sender address to backend/.env, then restart the API.'}</p></div><span className="demo-tag">{status.data?.configured ? 'READY' : 'NOT CONNECTED'}</span></div>
    {can('email:send') && <section className="panel communication-card"><div className="panel-title"><div><h2>Compose email</h2><p>Only send messages to contacts who have agreed to hear from you.</p></div></div><form className="communication-form" onSubmit={submit}><label>Recipient<input type="email" required value={to} onChange={(event) => setTo(event.target.value)} placeholder="contact@company.com" /></label><label>Subject<input required maxLength={180} value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="A clear, helpful subject" /></label><label>Message<textarea required maxLength={10000} rows={6} value={text} onChange={(event) => setText(event.target.value)} placeholder="Write your message…" /></label>{message && <p className={send.isError ? 'inline-error' : 'success-message'}>{message}</p>}<button className="primary-action" disabled={send.isPending || !status.data?.configured}><Send size={15} />{send.isPending ? 'Sending…' : 'Send email'}</button></form></section>}
    <section className="panel communication-card"><div className="panel-title"><div><h2>Recent email activity</h2><p>Delivery requests recorded by this workspace.</p></div></div>{logs.isError && <p className="inline-error">{apiErrorMessage(logs.error)}</p>}{logs.data?.length ? <div className="communication-list">{logs.data.map((log) => <div className="communication-row" key={log.id}><span className="communication-icon"><Mail size={16} /></span><span><b>{log.subject}</b><small>To {log.recipient} · {new Date(log.createdAt).toLocaleString()}</small></span><i className="status-pill">{log.status}</i></div>)}</div> : <div className="simple-empty"><Mail size={21} /><b>{logs.isLoading ? 'Loading activity…' : 'No email activity yet'}</b><p>Emails sent from this workspace will appear here.</p></div>}</section>
  </div>;
}
