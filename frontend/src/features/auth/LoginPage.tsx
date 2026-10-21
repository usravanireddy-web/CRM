import { useState, type FormEvent } from 'react';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext';
import { apiErrorMessage } from '../../lib/api-client';

export function LoginPage() {
  const { user, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  if (user) return <Navigate to="/" replace />;

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(''); setSubmitting(true);
    try { await signIn(email, password); }
    catch (cause) { setError(apiErrorMessage(cause)); }
    finally { setSubmitting(false); }
  }

  return <main className="login-screen"><div className="login-decoration login-decoration-one" /><div className="login-decoration login-decoration-two" />
    <section className="login-card"><Link className="login-brand" to="/login"><span className="login-brand-mark">V</span><span><b>VELVORAX</b><small>BUILD · AUTOMATE · GROW</small></span></Link>
      <div className="login-heading"><span className="login-kicker">YOUR SALES, IN SYNC</span><h1>Welcome back</h1><p>Sign in to continue to your workspace.</p></div>
      {error && <div className="login-error" role="alert">{error}</div>}
      <form onSubmit={submit} className="login-form"><label>Email address<span className="login-input"><Mail size={17} /><input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" required /></span></label>
        <label>Password<span className="login-input"><LockKeyhole size={17} /><input type={visible ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required /><button type="button" aria-label={visible ? 'Hide password' : 'Show password'} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label>
        <button className="login-submit" disabled={submitting}>{submitting ? 'Signing in…' : 'Sign in'} <ArrowRight size={17} /></button>
      </form><div className="login-security"><LockKeyhole size={14} /> Secure workspace access</div>
      <div className="login-signup"><span>New to Velvorax?</span><Link to="/register">Create an account <ArrowRight size={16} /></Link><small>Choose an available team role during registration.</small></div>
    </section><p className="login-footer">© 2026 Velvorax CRM · Built for teams that grow</p>
  </main>;
}
