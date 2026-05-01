import { useEffect, useState } from 'react';

import { api, syncSupabaseSession } from '@/lib/api';
import { Link, useNavigate } from '@/lib/router';
import { getBrowserSupabaseSafe } from '@/lib/supabase';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { SEOHead } from '../components/SEOHead';
import { ThemeToggle } from '../components/ThemeToggle';
import { toast } from 'sonner';

export function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = getBrowserSupabaseSafe();
    if (!supabase) {
      toast.error('Supabase frontend env vars are missing or invalid.');
      return;
    }

    void supabase.auth.getSession()
      .then(({ data }) => {
        if (data.session) {
          navigate('/dashboard');
        }
      })
      .catch((error) => {
        console.error('Supabase session check failed:', error);
        toast.error(error instanceof Error ? error.message : 'Unable to initialize auth');
      });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const auth = await api.signup(email, password);
      await syncSupabaseSession(auth);

      if (auth.needs_email_confirmation) {
        toast.success('Check your inbox to confirm your email, then log in.');
        navigate('/login');
        return;
      }

      toast.success('Account created.');
      navigate('/onboarding');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    toast.info('Google OAuth is not configured in this starter yet.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-muted/30 to-background">
      <SEOHead
        title="Sign Up — Vent 🌬️"
        description="Create your free Vent account and start your private journaling journey today."
      />
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="absolute top-4 left-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🌬️</span>
          <span className="font-semibold text-xl">Vent</span>
        </Link>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Create your account</CardTitle>
          <CardDescription>Start your private journaling journey</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-input-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-input-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-input-background"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="relative my-6">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-sm text-muted-foreground">
              or
            </span>
          </div>

          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleAuth}
            >
              Continue with Google
            </Button>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button type="button" variant="outline" className="w-full" disabled>
                      Continue as Guest
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Coming soon</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            By signing up, you agree to our{' '}
            <a href="#terms" className="text-primary hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#privacy" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </div>

          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
