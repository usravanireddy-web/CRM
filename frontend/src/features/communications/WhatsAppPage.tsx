import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, MessageCircle, ShieldCheck } from 'lucide-react';
import { api } from '../../lib/api-client';

type WhatsAppStatus = { connected: boolean; provider: string | null; mode: string; message: string };

export function WhatsAppPage() {
  const status = useQuery({ queryKey: ['whatsapp', 'status'], queryFn: () => api.get<WhatsAppStatus>('/whatsapp/status') });
  return <div className="communications-page"><div className="resource-heading"><span className="resource-title-icon whatsapp-icon"><MessageCircle size={21} /></span><div><h1>WhatsApp</h1><p>Prepare for customer conversations from one organized workspace.</p></div></div>
    <section className="whatsapp-connect-card"><span className="whatsapp-large-icon"><MessageCircle size={27} /></span><span className="demo-tag">{status.data?.connected ? 'CONNECTED' : 'NOT CONNECTED'}</span><h2>{status.data?.connected ? 'WhatsApp is connected' : 'Connect an approved WhatsApp provider'}</h2><p>{status.data?.message ?? 'Checking provider configuration…'}</p><div className="whatsapp-note"><ShieldCheck size={17} /><span>WhatsApp Business API credentials are not configured. No messages will be sent until you choose and approve a provider.</span></div><a className="secondary-action" href="https://business.whatsapp.com/" target="_blank" rel="noreferrer">WhatsApp Business information <ArrowUpRight size={14} /></a></section>
  </div>;
}
