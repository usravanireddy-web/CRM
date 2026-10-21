import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ChartNoAxesCombined, Mail, Megaphone, Send, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api-client';

type Summary = { campaigns: number; sentCampaigns: number; leads: number; campaignLeads: number };

export function MarketingPage() {
  const summary = useQuery({ queryKey: ['marketing', 'summary'], queryFn: () => api.get<Summary>('/marketing/summary') });
  const metrics = [['Campaigns', summary.data?.campaigns ?? 0, Megaphone], ['Sent campaigns', summary.data?.sentCampaigns ?? 0, Send], ['Campaign leads', summary.data?.campaignLeads ?? 0, Users]] as const;
  return <div className="communications-page"><div className="resource-heading"><span className="resource-title-icon marketing-icon"><Megaphone size={21} /></span><div><h1>Marketing</h1><p>Plan outreach and understand the leads it brings in.</p></div></div>
    <div className="kpi-grid communication-kpis">{metrics.map(([label, value, Icon]) => <article className="kpi-card" key={label}><div className="kpi-top"><span>{label}</span><span className="kpi-icon"><Icon size={18} /></span></div><strong>{summary.isLoading ? '…' : value}</strong><small>Current workspace</small></article>)}</div>
    {summary.isError && <div className="inline-error">Marketing metrics could not be loaded.</div>}
    <div className="marketing-action-grid"><Link to="/email-campaigns" className="marketing-action-card"><span className="marketing-action-icon"><Send size={20} /></span><div><b>Email campaigns</b><p>Draft a campaign, review its audience, then send using your SMTP settings.</p></div><ArrowRight size={17} /></Link><Link to="/email" className="marketing-action-card"><span className="marketing-action-icon purple"><Mail size={20} /></span><div><b>One-to-one email</b><p>Contact an individual prospect from your workspace.</p></div><ArrowRight size={17} /></Link><Link to="/reports" className="marketing-action-card"><span className="marketing-action-icon blue"><ChartNoAxesCombined size={20} /></span><div><b>Marketing results</b><p>Review current lead totals and campaign source counts.</p></div><ArrowRight size={17} /></Link></div>
    <div className="provider-notice"><span className="notice-icon"><Megaphone size={18} /></span><div><b>Campaigns use your own SMTP account</b><p>Velvorax does not include paid marketing providers or invent delivery credentials. Add SMTP settings to backend/.env to enable sending.</p></div></div>
  </div>;
}
