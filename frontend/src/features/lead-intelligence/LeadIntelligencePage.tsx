import { useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Activity, ArrowUpRight, BadgeCheck, Building2, Check, Search, ShieldCheck, Sparkles, Users, type LucideIcon } from 'lucide-react';
import { api, apiErrorMessage } from '../../lib/api-client';
import { useAuth } from '../../app/AuthContext';

type ProviderStatus = { mode: string; providerConnected: boolean; message: string };
type DemoCompany = {
  id: string;
  name: string;
  industry: string;
  country: string;
  city: string;
  size: string;
  sizeLabel: string;
  website: string;
  contactFirstName: string;
  contactLastName: string;
  contactTitle: string;
  fitScore: number;
  summary: string;
};

const demoCompanies: DemoCompany[] = [
  { id: 'northstar-gridworks', name: 'Northstar Gridworks', industry: 'Energy Technology', country: 'India', city: 'Hyderabad', size: '51-200', sizeLabel: '51–200 employees', website: 'northstar.example', contactFirstName: 'Aarav', contactLastName: 'Rao', contactTitle: 'Technology Director', fitScore: 86, summary: 'Illustrative clean-energy software prospect for demonstrating company research and CRM handoff.' },
  { id: 'asterline-learning', name: 'Asterline Learning', industry: 'Education', country: 'United States', city: 'Austin', size: '11-50', sizeLabel: '11–50 employees', website: 'asterline.example', contactFirstName: 'Maya', contactLastName: 'Chen', contactTitle: 'Operations Lead', fitScore: 78, summary: 'Illustrative education platform prospect with a sample operations contact.' },
  { id: 'harborview-health', name: 'Harborview Health Labs', industry: 'Healthcare', country: 'United Kingdom', city: 'Manchester', size: '201-500', sizeLabel: '201–500 employees', website: 'harborview.example', contactFirstName: 'Noah', contactLastName: 'Patel', contactTitle: 'Commercial Director', fitScore: 74, summary: 'Illustrative healthcare technology company. Sample contact details are not verified.' },
  { id: 'mapleforge-systems', name: 'Mapleforge Systems', industry: 'Manufacturing', country: 'Canada', city: 'Toronto', size: '51-200', sizeLabel: '51–200 employees', website: 'mapleforge.example', contactFirstName: 'Sofia', contactLastName: 'Martin', contactTitle: 'Business Development Lead', fitScore: 69, summary: 'Illustrative manufacturing software prospect for demonstrating filters and lead scoring UI.' },
  { id: 'brightpath-logistics', name: 'Brightpath Logistics', industry: 'Logistics', country: 'India', city: 'Bengaluru', size: '501+', sizeLabel: '500+ employees', website: 'brightpath.example', contactFirstName: 'Ishaan', contactLastName: 'Mehta', contactTitle: 'Regional Sales Director', fitScore: 82, summary: 'Illustrative logistics business with a sample regional decision maker.' },
  { id: 'cloudharbor-analytics', name: 'Cloudharbor Analytics', industry: 'Information Technology', country: 'Singapore', city: 'Singapore', size: '11-50', sizeLabel: '11–50 employees', website: 'cloudharbor.example', contactFirstName: 'Lena', contactLastName: 'Wong', contactTitle: 'Founder', fitScore: 91, summary: 'Illustrative analytics company. This demo profile does not come from a live provider.' },
];

const initialFilters = { country: '', city: '', industry: '', companySize: '' };

export function LeadIntelligencePage() {
  const status = useQuery({ queryKey: ['lead-intelligence', 'status'], queryFn: () => api.get<ProviderStatus>('/lead-intelligence/status') });
  const { can } = useAuth();
  const client = useQueryClient();
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState('');

  const results = useMemo(() => demoCompanies.filter((company) =>
    (!appliedFilters.country || company.country.toLowerCase().includes(appliedFilters.country.toLowerCase()))
    && (!appliedFilters.city || company.city.toLowerCase().includes(appliedFilters.city.toLowerCase()))
    && (!appliedFilters.industry || company.industry.toLowerCase().includes(appliedFilters.industry.toLowerCase()))
    && (!appliedFilters.companySize || company.size === appliedFilters.companySize),
  ), [appliedFilters]);
  const qualifiedCount = results.filter((company) => company.fitScore >= 75).length;
  const industryCounts = useMemo(() => [...new Set(results.map((company) => company.industry))]
    .map((industry) => ({ industry, count: results.filter((company) => company.industry === industry).length }))
    .sort((a, b) => b.count - a.count).slice(0, 5), [results]);

  const addLead = useMutation({
    mutationFn: (company: DemoCompany) => api.post('/leads', {
      firstName: company.contactFirstName,
      lastName: company.contactLastName,
      company: company.name,
      email: '',
      phone: '',
      source: 'Other',
      status: 'New',
      owner: '',
      nextFollowUp: null,
    }),
    onSuccess: (_data, company) => {
      setAddedIds((previous) => new Set(previous).add(company.id));
      setFeedback(`${company.name} was added to your CRM leads.`);
      client.invalidateQueries({ queryKey: ['leads'] });
      client.invalidateQueries({ queryKey: ['reports'] });
    },
    onError: (error) => setFeedback(apiErrorMessage(error)),
  });

  function search(event: FormEvent) {
    event.preventDefault();
    setAppliedFilters(filters);
  }

  function clearFilters() {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
  }

  return <div className="intelligence-page">
    <div className="resource-heading"><div className="resource-title-icon intelligence-icon"><Activity size={22} /></div><div><h1>Lead Intelligence</h1><p>Explore sample prospects, filter by market, and add leads to your CRM.</p></div></div>

    <div className="provider-notice"><span className="notice-icon"><ShieldCheck size={19} /></span><div><b>{status.data?.providerConnected ? 'Provider ready' : 'External provider not connected'}</b><p>{status.data?.message ?? 'Checking provider settings...'}</p></div><span className="demo-tag">DEMO DATA BELOW</span></div>

    <section className="demo-disclaimer"><Sparkles size={18} /><p><b>Development demo dataset</b><span>These fictional examples demonstrate the UI and filters. They are not sourced, verified, or enriched by a real provider. Fit scores are illustrative only.</span></p></section>

    <div className="intelligence-stats">
      <Stat icon={Building2} value={results.length} label="Sample companies" tone="blue" />
      <Stat icon={Users} value={results.length} label="Sample contacts" tone="green" />
      <Stat icon={Sparkles} value={qualifiedCount} label="Illustrative fit scores 75+" tone="purple" />
      <Stat icon={BadgeCheck} value="0" label="Provider-verified contacts" tone="orange" />
    </div>

    <section className="panel discovery-panel"><div className="panel-title"><div><h2>Find sample companies</h2><p>Try the filters on the local demo dataset.</p></div><span className="demo-tag">LOCAL SAMPLE</span></div>
      <form className="form-grid intelligence-filter-grid" onSubmit={search}>
        <label className="form-field"><span>Country or region</span><input value={filters.country} onChange={(event) => setFilters({ ...filters, country: event.target.value })} placeholder="e.g. India" /></label>
        <label className="form-field"><span>City</span><input value={filters.city} onChange={(event) => setFilters({ ...filters, city: event.target.value })} placeholder="e.g. Hyderabad" /></label>
        <label className="form-field"><span>Industry</span><input value={filters.industry} onChange={(event) => setFilters({ ...filters, industry: event.target.value })} placeholder="e.g. Healthcare" /></label>
        <label className="form-field"><span>Company size</span><select value={filters.companySize} onChange={(event) => setFilters({ ...filters, companySize: event.target.value })}><option value="">Any size</option><option value="1-10">1–10</option><option value="11-50">11–50</option><option value="51-200">51–200</option><option value="201-500">201–500</option><option value="501+">501+</option></select></label>
        <div className="form-actions discovery-actions"><span className="muted-copy">{results.length} sample {results.length === 1 ? 'company' : 'companies'} match these filters.</span><div><button className="secondary-action" type="button" onClick={clearFilters}>Clear filters</button><button className="primary-action" type="submit"><Search size={16} /> Search sample data</button></div></div>
      </form>
    </section>

    {feedback && <div className={addLead.isError ? 'inline-error' : 'success-message'} role="status">{feedback}</div>}

    <div className="intelligence-content-grid">
      <section className="panel intelligence-results-panel"><div className="panel-title"><div><h2>Company results</h2><p>Sample companies with fictional contact profiles.</p></div><span className="results-count">{results.length} results</span></div>
        {results.length ? <div className="intelligence-company-list">{results.map((company) => <article className="intelligence-company-card" key={company.id}>
          <div className="company-monogram">{company.name.slice(0, 1)}</div>
          <div className="intelligence-company-main"><div className="company-card-title"><h3>{company.name}</h3><span className="sample-pill">SAMPLE</span></div><p className="company-meta"><span>{company.industry}</span><span>{company.city}, {company.country}</span><span>{company.sizeLabel}</span></p><p className="company-summary">{company.summary}</p><div className="sample-contact"><span className="contact-avatar">{company.contactFirstName[0]}{company.contactLastName[0]}</span><span><b>{company.contactFirstName} {company.contactLastName}</b><small>{company.contactTitle} · sample contact, not verified</small></span><span className="sample-website">{company.website}</span></div></div>
          <div className="company-fit"><b>{company.fitScore}</b><small>sample fit</small><button type="button" className="add-sample-lead" disabled={!can('leads:create') || addedIds.has(company.id) || addLead.isPending} onClick={() => addLead.mutate(company)}>{addedIds.has(company.id) ? <><Check size={14} /> Added</> : <><ArrowUpRight size={14} /> Add lead</>}</button></div>
        </article>)}</div> : <div className="simple-empty"><Search size={23} /><b>No sample companies match those filters</b><p>Change a filter or clear all filters to see the demo examples.</p></div>}
      </section>

      <aside className="intelligence-insights-column">
        <section className="panel intelligence-chart-panel"><div className="panel-title"><div><h2>Demo discovery funnel</h2><p>Illustrative sample records</p></div></div><div className="demo-funnel">{[{ label: 'Companies', value: results.length, color: 'funnel-blue' }, { label: 'Sample contacts', value: results.length, color: 'funnel-teal' }, { label: 'Fit score 75+', value: qualifiedCount, color: 'funnel-purple' }, { label: 'Verified by provider', value: 0, color: 'funnel-gold' }].map((step) => <div className="funnel-row" key={step.label}><span>{step.label}</span><div className="funnel-track"><i className={step.color} style={{ width: `${results.length ? Math.max(0, step.value / results.length * 100) : 0}%` }} /></div><b>{step.value}</b></div>)}</div></section>
        <section className="panel intelligence-chart-panel"><div className="panel-title"><div><h2>Sample industries</h2><p>Counts in the filtered results</p></div></div><div className="industry-bars">{industryCounts.map((item, index) => <div className="industry-bar-row" key={item.industry}><div><span className={`industry-dot industry-dot-${index}`} />{item.industry}</div><div className="industry-track"><i className={`industry-fill industry-dot-${index}`} style={{ width: `${results.length ? item.count / results.length * 100 : 0}%` }} /></div><b>{item.count}</b></div>)}{!industryCounts.length && <p className="muted-copy">No industry totals for the current filters.</p>}</div></section>
        <section className="demo-next-step"><Sparkles size={18} /><div><b>Want live company discovery?</b><p>Connect an approved data provider to replace this clearly labeled sample dataset.</p></div></section>
      </aside>
    </div>
  </div>;
}

function Stat({ icon: Icon, value, label, tone }: { icon: LucideIcon; value: string | number; label: string; tone: string }) {
  return <div className={`panel intelligence-stat intelligence-stat-${tone}`}><span><Icon size={20} /></span><div><b>{value}</b><small>{label}</small></div></div>;
}
