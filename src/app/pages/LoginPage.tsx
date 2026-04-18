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

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    setLoading(true);

    try {
      const auth = await api.login(email, password);
      await syncSupabaseSession(auth);
      toast.success('Welcome back.');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to sign in');
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
        title="Log In — Tea ☕"
        description="Sign in to your Tea account and continue your private journaling journey."
      />
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="absolute top-4 left-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">☕</span>
          <span className="font-semibold text-xl">Tea</span>
        </Link>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Welcome back</CardTitle>
          <CardDescription>Sign in to continue journaling</CardDescription>
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
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <a href="#forgot" className="text-sm text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
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

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
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

          <div className="mt-6 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
