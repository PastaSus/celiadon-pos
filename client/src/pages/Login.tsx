import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button, useToast } from '../components';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-brand mb-1">celiadon POS</h1>
        <p className="text-sm text-slate-500 mb-6">Sign in to continue</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email
              <span aria-hidden="true" className="text-danger"> *</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              className="w-full border-line-strong border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              Password
              <span aria-hidden="true" className="text-danger"> *</span>
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full border-line-strong border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
              required
            />
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  );
}