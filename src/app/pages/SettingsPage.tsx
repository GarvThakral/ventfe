import { useEffect, useState } from 'react';

import { api } from '@/lib/api';
import { useNavigate } from '@/lib/router';
import { getBrowserSupabase } from '@/lib/supabase';
import { useCurrentUser } from '@/lib/use-current-user';
import type { Chat } from '@/lib/types';
import { MobileNav } from '../components/MobileNav';
import { SEOHead } from '../components/SEOHead';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Switch } from '../components/ui/switch';
import { ArrowLeft, Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, isLoading: isUserLoading } = useCurrentUser();
  const [emailDigest, setEmailDigest] = useState(true);
  const [currentEmail, setCurrentEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [chats, setChats] = useState<Chat[]>([]);
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem('tea-email-digest');
    setEmailDigest(stored !== 'false');
  }, []);

  useEffect(() => {
    if (user?.email) {
      setCurrentEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    void api.listChats()
      .then(setChats)
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : 'Unable to load chats');
      });
  }, [user]);

  async function handleChangeEmail() {
    const supabase = getBrowserSupabase();
    setIsWorking(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: currentEmail });
      if (error) {
        throw error;
      }
      toast.success('Email update requested. Check your inbox to confirm it.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update email');
    } finally {
      setIsWorking(false);
    }
  }

  async function handleChangePassword() {
    if (!newPassword.trim()) {
      toast.error('Enter a new password first');
      return;
    }

    const supabase = getBrowserSupabase();
    setIsWorking(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        throw error;
      }
      setNewPassword('');
      toast.success('Password updated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update password');
    } finally {
      setIsWorking(false);
    }
  }

  async function handleExportData() {
    setIsWorking(true);
    try {
      const allChats = await api.listChats();
      const messages = await Promise.all(allChats.map((chat) => api.getMessages(chat.id)));
      const payload = {
        exported_at: new Date().toISOString(),
        user,
        chats: allChats.map((chat, index) => ({
          ...chat,
          messages: messages[index].items,
        })),
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'tea-export.json';
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Data export ready');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to export data');
    } finally {
      setIsWorking(false);
    }
  }

  async function handleClearMemories(chat: Chat) {
    try {
      const result = await api.clearMemories(chat.id);
      toast.success(`Cleared ${result.deleted} memories for ${chat.name}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to clear memories');
    }
  }

  async function handleDeleteAccount() {
    setIsWorking(true);
    try {
      await api.deleteAccount();
      await getBrowserSupabase().auth.signOut();
      toast.success('Account deleted');
      navigate('/');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to delete account');
    } finally {
      setIsWorking(false);
    }
  }

  function handleEmailDigestChange(nextValue: boolean) {
    setEmailDigest(nextValue);
    window.localStorage.setItem('tea-email-digest', String(nextValue));
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <SEOHead
        title="Settings — Tea ☕"
        description="Manage your Tea account settings, notifications, privacy, and subscription."
      />
      <header className="border-b bg-card/50 backdrop-blur-sm px-4 py-3 sticky top-0 z-10">
        <div className="container mx-auto max-w-4xl flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-semibold text-xl">Settings</h1>
            <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Manage your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  value={currentEmail}
                  onChange={(e) => setCurrentEmail(e.target.value)}
                  className="bg-input-background"
                  disabled={isUserLoading}
                />
                <Button onClick={() => void handleChangeEmail()} variant="outline" disabled={isWorking}>
                  Update
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="flex gap-2">
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-input-background"
                />
                <Button onClick={() => void handleChangePassword()} variant="outline" disabled={isWorking}>
                  Save
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Choose what you want to be notified about</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-digest">Weekly email digest</Label>
                <p className="text-sm text-muted-foreground">
                  Stored locally in this starter until you add a backend preference table.
                </p>
              </div>
              <Switch
                id="email-digest"
                checked={emailDigest}
                onCheckedChange={handleEmailDigestChange}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Privacy</CardTitle>
            <CardDescription>Control your data and memories</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Clear chat memories</h4>
              <div className="space-y-2">
                {chats.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Create a chat before there are memories to clear.</p>
                ) : (
                  chats.map((chat) => (
                    <div key={chat.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{chat.emoji}</span>
                        <span>{chat.name}</span>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Clear memories for {chat.name}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This removes every stored memory vector for this relationship. Future AI replies will only use the active conversation until new memories are saved again.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => void handleClearMemories(chat)}>
                              Clear Memories
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))
                )}
              </div>
            </div>

            <Separator />

            <div>
              <Button onClick={() => void handleExportData()} variant="outline" disabled={isWorking}>
                <Download className="w-4 h-4 mr-2" />
                Export My Data
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Download your chats and messages as JSON.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Manage your Tea plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="font-medium">Free Plan</p>
              <p className="text-sm text-muted-foreground">
                This starter ships without billing. Add Stripe or your preferred provider when you need paid tiers.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isWorking}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete your account permanently?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This deletes your auth user and cascades through profiles, chats, messages, and memories. There is no undo.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => void handleDeleteAccount()}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete My Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </main>

      <MobileNav />
    </div>
  );
}
