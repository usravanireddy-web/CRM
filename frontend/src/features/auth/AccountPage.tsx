import { useMutation } from '@tanstack/react-query';
import { KeyRound, UserRound } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useAuth } from '../../app/AuthContext';
import { api, apiErrorMessage } from '../../lib/api-client';

export function AccountPage() {
  const { user, signOut } = useAuth();
  const [currentPassword, setCurrentPassword] = useState(''); const [newPassword, setNewPassword] = useState(''); const [message, setMessage] = useState('');
  const change = useMutation({ mutationFn: () => api.patch('/auth/password', { currentPassword, newPassword }), onSuccess: () => { setCurrentPassword(''); setNewPassword(''); setMessage('Password updated. Sign in again with your new password.'); window.setTimeout(() => { signOut(); window.location.assign('/login'); }, 1200); }, onError: (error) => setMessage(apiErrorMessage(error)) });
  function submit(event: FormEvent) { event.preventDefault(); setMessage(''); change.mutate(); }
  return <div className="settings-page"><div className="resource-heading"><span className="resource-title-icon users-icon"><UserRound size={21} /></span><div><h1>Your account</h1><p>Personal details and sign-in security.</p></div></div><div className="settings-grid"><section className="panel settings-card"><h2>Profile</h2><p>Your signed-in workspace identity.</p><div className="account-details"><span><small>Full name</small><b>{user?.fullName}</b></span><span><small>Email</small><b>{user?.email}</b></span><span><small>Role</small><b>{user?.role.replace(/_/g, ' ')}</b></span></div></section><section className="panel settings-card"><span className="settings-security-icon"><KeyRound size={18} /></span><h2>Change your password</h2><p>Use 8–64 characters.</p><form className="communication-form" onSubmit={submit}><label>Current password<input type="password" required autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} /></label><label>New password<input type="password" required minLength={8} maxLength={64} autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /></label>{message && <div className={change.isError ? 'inline-error' : 'success-message'}>{message}</div>}<button className="primary-action" disabled={change.isPending}>{change.isPending ? 'Updating…' : 'Update password'}</button></form></section></div></div>;
}
