'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/src/lib/supabase';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Coffee, ArrowLeft } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) {
        const msg =
          authError.message === 'Email logins are disabled'
            ? 'Email/password is disabled. Enable Email provider in Supabase.'
            : authError.message === 'Invalid login credentials'
              ? 'Invalid email or password'
              : authError.message;
        setError(msg || 'Login failed');
        setIsLoading(false);
        return;
      }

      router.push('/admin/dashboard');
  } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during login';
      setError(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-cafe-50 p-4 relative">
      {/* Back to Menu Link */}
      <div className="absolute top-6 left-6">
        <Link 
          href="/" 
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 border-cafe-slate text-cafe-slate hover:bg-cafe-100 hover:text-cafe-charcoal transition-all duration-200"
        >
          <ArrowLeft size={16} />
          <span>Back to Menu</span>
        </Link>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 bg-cafe-100 rounded-full text-cafe-600">
              <Coffee size={32} />
            </div>
          </div>
          <h1 className="font-serif text-3xl text-cafe-charcoal font-bold tracking-tight">
            Cafein
          </h1>
          <p className="text-cafe-charcoal/60 text-sm">
            Admin Portal
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <Input
              id="email"
              type="email"
              label="Email Address"
              placeholder="admin@cafe.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="bg-cafe-50/50"
            />
            <Input
              id="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="bg-cafe-50/50"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm text-center font-medium animate-in zoom-in-95">
              {error}
            </div>
          )}

          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
            className="h-11 text-base shadow-lg shadow-amber-900/10"
          >
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}
