import { useState, type FormEvent } from 'react';
import { ArrowRight, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, apiErrorMessage } from '../../lib/api-client';

const roleOptions = [
  { key: 'sales_rep', label: 'Sales Representative', description: 'Work assigned leads, deals, contacts, and follow-up tasks.' },
  { key: 'lead_researcher', label: 'Lead Researcher', description: 'Research companies and prepare assigned prospects.' },
  { key: 'marketing', label: 'Marketing', description: 'Prepare marketing activity and email campaigns.' },
  { key: 'telecaller', label: 'Telecaller', description: 'Handle assigned follow-ups and record call outcomes.' },
] as const;

type RoleKey = typeof roleOptions[number]['key'];

export function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<RoleKey>('sales_rep');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register', { fullName, email, password, role });
      setSubmitted(true);
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  }

  return <main className="login-screen register-screen"><div className="login-decoration login-decoration-one" /><div className="login-decoration login-decoration-two" />
    <section className="login-card register-card"><Link className="login-brand" to="/login"><span className="login-brand-mark">V</span><span><b>VELVORAX</b><small>BUILD · AUTOMATE · GROW</small></span></Link>
      {submitted ? <div className="register-success"><span className="register-success-mark">✓</span><div className="login-heading"><span className="login-kicker">ACCOUNT READY</span><h1>Welcome to Velvorax</h1><p>Your account is active. Sign in with the email and password you just registered.</p></div><Link className="login-submit register-login-link" to="/login">Continue to sign in <ArrowRight size={17} /></Link></div> : <>
        <div className="login-heading"><span className="login-kicker">JOIN YOUR WORKSPACE</span><h1>Create your account</h1><p>Choose your team role. Your account will be ready as soon as you register.</p></div>
        {error && <div className="login-error" role="alert">{error}</div>}
        <form onSubmit={submit} className="login-form register-form">
          <label>Full name<span className="login-input"><UserRound size={17} /><input autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Your full name" minLength={2} maxLength={120} required /></span></label>
          <label>Work email<span className="login-input"><Mail size={17} /><input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" maxLength={320} required /></span></label>
          <label>Password<span className="login-input"><LockKeyhole size={17} /><input type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="8–64 characters" minLength={8} maxLength={64} required /></span></label>
          <label>Request a role<select className="register-role-select" value={role} onChange={(event) => setRole(event.target.value as RoleKey)}>{roleOptions.map((option) => <option value={option.key} key={option.key}>{option.label}</option>)}</select><small className="register-role-description">{roleOptions.find((option) => option.key === role)?.description}</small></label>
          <button className="login-submit" disabled={loading}>{loading ? 'Creating account...' : 'Create account'} <ArrowRight size={17} /></button>
        </form>
        <p className="register-approval-note">Administrator and Sales Manager roles are restricted and can only be assigned by an existing Administrator.</p>
        <div className="register-existing">Already have an account? <Link to="/login">Sign in</Link></div>
      </>}
    </section><p className="login-footer">© 2026 Velvorax CRM · Built for teams that grow</p>
  </main>;
}
