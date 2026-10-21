import { CircleHelp, Mail, MessageCircle } from 'lucide-react';

export function SupportPage() {
  return <div className="support-page"><div className="resource-heading"><div className="resource-title-icon"><CircleHelp size={21} /></div><div><h1>Help & support</h1><p>Find help for using your CRM workspace.</p></div></div><div className="support-grid"><section className="panel support-card"><span><CircleHelp size={19} /></span><h2>Getting started</h2><p>Create companies and contacts first, then add leads and follow-up tasks to build your pipeline.</p></section><section className="panel support-card"><span><MessageCircle size={19} /></span><h2>Data connection</h2><p>Records are currently held in temporary memory while the PostgreSQL connection is being prepared.</p></section><section className="panel support-card"><span><Mail size={19} /></span><h2>Contact support</h2><p>Support contact details can be added in workspace settings.</p></section></div></div>;
}
