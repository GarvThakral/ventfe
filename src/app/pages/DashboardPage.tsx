import { useEffect, useState } from 'react';

import { formatDistanceToNow } from 'date-fns';

import { api } from '@/lib/api';
import { Link, useNavigate } from '@/lib/router';
import { useCurrentUser } from '@/lib/use-current-user';
import type { Chat } from '@/lib/types';
import { ChatListSkeleton } from '../components/LoadingSkeleton';
import { MobileNav } from '../components/MobileNav';
import { OverwhelmedButton } from '../components/OverwhelmedButton';
import { SEOHead } from '../components/SEOHead';
import { ThemeToggle } from '../components/ThemeToggle';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Menu, MessageSquare, MoreHorizontal, Pencil, Plus, Settings, Trash2, User, LogOut } from 'lucide-react';
import { toast } from 'sonner';

const EMOJIS = ['😤', '😢', '😕', '😠', '🤔', '🙄', '😰', '🤯', '😑', '😶', '🫠', '😬'];

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, isLoading: isUserLoading } = useCurrentUser();
  const [chats, setChats] = useState<Chat[]>([]);
  const [isChatsLoading, setIsChatsLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [draftName, setDraftName] = useState('');
  const [draftEmoji, setDraftEmoji] = useState('😤');
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('add') === 'true') {
      openCreateDialog();
    }
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    void loadChats();
  }, [user]);

  async function loadChats() {
    setIsChatsLoading(true);
    try {
      const response = await api.listChats();
      setChats(response);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to load chats');
    } finally {
      setIsChatsLoading(false);
    }
  }

  function openCreateDialog() {
    setDialogMode('create');
    setEditingChatId(null);
    setDraftName('');
    setDraftEmoji('😤');
    setShowDialog(true);
  }

  function openEditDialog(chat: Chat) {
    setDialogMode('edit');
    setEditingChatId(chat.id);
    setDraftName(chat.name);
    setDraftEmoji(chat.emoji);
    setShowDialog(true);
  }

  async function handleSaveChat() {
    if (!draftName.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      if (dialogMode === 'create') {
        const createdChat = await api.createChat(draftName.trim(), draftEmoji);
        setChats((prev) => [createdChat, ...prev]);
        toast.success(`Added ${createdChat.name}`);
      } else if (editingChatId) {
        const updatedChat = await api.updateChat(editingChatId, {
          name: draftName.trim(),
          emoji: draftEmoji,
        });
        setChats((prev) => prev.map((chat) => (chat.id === updatedChat.id ? { ...chat, ...updatedChat } : chat)));
        toast.success(`Updated ${updatedChat.name}`);
      }

      setShowDialog(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save chat');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteChat(chat: Chat) {
    try {
      await api.deleteChat(chat.id);
      setChats((prev) => prev.filter((item) => item.id !== chat.id));
      toast.success(`Deleted ${chat.name}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to delete chat');
    }
  }

  async function handleLogout() {
    try {
      await api.logout();
      navigate('/login');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to log out');
    }
  }

  function handleChatClick(chatId: string) {
    navigate(`/chat/${chatId}`);
  }

  const isLoading = isUserLoading || isChatsLoading;

  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden bg-background">
      <SEOHead
        title="Dashboard — Tea ☕"
        description="Manage your private person chats and journal entries."
      />
      <aside className={`${showMobileMenu ? 'block' : 'hidden'} md:block w-full md:w-80 border-r flex flex-col bg-card`}>
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl">☕</span>
              <span className="font-semibold text-xl">Tea</span>
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-2 py-1.5 text-xs text-muted-foreground">{user?.email ?? 'Signed in'}</div>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button className="w-full" size="lg" onClick={openCreateDialog}>
                <Plus className="w-5 h-5 mr-2" />
                Add Person
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{dialogMode === 'create' ? 'Add a new person' : 'Edit person'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="personName">Name or nickname</Label>
                  <Input
                    id="personName"
                    placeholder="e.g., My boss, Sarah..."
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    className="bg-input-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pick an emoji</Label>
                  <div className="grid grid-cols-6 gap-2">
                    {EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setDraftEmoji(emoji)}
                        className={`text-2xl p-2 rounded-lg transition-all hover:scale-110 ${
                          draftEmoji === emoji
                            ? 'bg-primary/20 ring-2 ring-primary'
                            : 'bg-muted/50 hover:bg-muted'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <Button onClick={handleSaveChat} disabled={!draftName.trim() || isSaving} className="w-full">
                  {isSaving ? 'Saving...' : dialogMode === 'create' ? 'Add Person' : 'Save Changes'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <ChatListSkeleton />
          ) : chats.length === 0 ? (
            <div className="text-center py-12 px-4">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No chats yet</p>
              <p className="text-sm text-muted-foreground">Add someone to start venting</p>
            </div>
          ) : (
            <div className="space-y-2">
              {chats.map((chat) => (
                <div key={chat.id} className="group rounded-xl hover:bg-accent/50">
                  <div className="flex items-start gap-2 p-3">
                    <button onClick={() => handleChatClick(chat.id)} className="flex flex-1 items-start gap-3 text-left">
                      <div className="text-3xl">{chat.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1 gap-2">
                          <h3 className="font-semibold truncate">{chat.name}</h3>
                          <p className="text-xs text-muted-foreground whitespace-nowrap">
                            {chat.last_message_at
                              ? formatDistanceToNow(new Date(chat.last_message_at), { addSuffix: true })
                              : 'No messages'}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {chat.last_message ?? 'Start venting...'}
                        </p>
                      </div>
                    </button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-100 md:opacity-0 md:group-hover:opacity-100">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(chat)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => void handleDeleteChat(chat)} className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden absolute top-4 left-4"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          <Menu className="w-6 h-6" />
        </Button>

        <div className="max-w-md">
          <div className="text-6xl mb-6">🫖</div>
          <h2 className="text-3xl font-bold mb-3">Who do you need to vent about today?</h2>
          <p className="text-muted-foreground mb-6">
            Select a chat from the sidebar or add someone new to get started.
          </p>
          <Button size="lg" onClick={openCreateDialog}>
            <Plus className="w-5 h-5 mr-2" />
            {chats.length > 0 ? 'Add Another Person' : 'Add Your First Person'}
          </Button>
        </div>
      </main>

      <OverwhelmedButton />
      <MobileNav />
    </div>
  );
}
