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
import { Menu, MessageSquare, MoreHorizontal, Pencil, Plus, Settings, Trash2, User, LogOut, Upload, Image as ImageIcon, TreePine } from 'lucide-react';
import { toast } from 'sonner';
import { uploadToCloudinary } from '@/lib/cloudinary';

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
  const [draftImageUrl, setDraftImageUrl] = useState('');
  const [draftPersonality, setDraftPersonality] = useState('');
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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
    setDraftImageUrl('');
    setDraftPersonality('');
    setShowDialog(true);
  }

  function openEditDialog(chat: Chat) {
    setDialogMode('edit');
    setEditingChatId(chat.id);
    setDraftName(chat.name);
    setDraftEmoji(chat.emoji);
    setDraftImageUrl(chat.image_url || '');
    setDraftPersonality(chat.personality || '');
    setShowDialog(true);
  }

  async function handleSaveChat() {
    if (!draftName.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      if (dialogMode === 'create') {
        const createdChat = await api.createChat(draftName.trim(), draftEmoji, draftImageUrl.trim() || undefined, draftPersonality.trim() || undefined);
        setChats((prev) => [createdChat, ...prev]);
        toast.success(`Added ${createdChat.name}`);
      } else if (editingChatId) {
        const updatedChat = await api.updateChat(editingChatId, {
          name: draftName.trim(),
          emoji: draftEmoji,
          image_url: draftImageUrl.trim() || null,
          personality: draftPersonality.trim() || null,
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

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setDraftImageUrl(url);
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
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
        title="Dashboard — Vent 🌬️"
        description="Manage your private person chats and journal entries."
      />
      <aside className={`${showMobileMenu ? 'block' : 'hidden'} md:block w-full md:w-80 border-r flex flex-col bg-gradient-to-b from-card to-secondary/5`}>
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl">🌬️</span>
              <span className="font-semibold text-xl">Vent</span>
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

            <Button variant="outline" className="w-full gap-2" size="lg" onClick={() => navigate('/memory-tree')}>
              <TreePine className="w-5 h-5" />
              Memory Tree
            </Button>
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
                  <Label>Picture (optional)</Label>
                  <div className="flex gap-4 items-start">
                    {draftImageUrl ? (
                      <div className="relative group">
                        <img 
                          src={draftImageUrl} 
                          alt="Preview" 
                          className="w-20 h-20 rounded-xl object-cover border border-border shadow-sm" 
                        />
                        <button 
                          onClick={() => setDraftImageUrl('')}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Plus className="w-3 h-3 rotate-45" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center border-2 border-dashed border-border text-muted-foreground">
                        <ImageIcon className="w-8 h-8 opacity-20" />
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <div className="relative">
                        <input
                          type="file"
                          id="file-upload"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileChange}
                          disabled={isUploading}
                        />
                        <Button 
                          variant="outline" 
                          className="w-full h-10 gap-2"
                          onClick={() => document.getElementById('file-upload')?.click()}
                          disabled={isUploading}
                        >
                          <Upload className="w-4 h-4" />
                          {isUploading ? 'Uploading...' : 'Upload Image'}
                        </Button>
                      </div>
                      <p className="text-[10px] text-muted-foreground text-center">
                        Or paste a URL below
                      </p>
                      <Input
                        id="personImage"
                        placeholder="https://example.com/photo.jpg"
                        value={draftImageUrl}
                        onChange={(e) => setDraftImageUrl(e.target.value)}
                        className="bg-input-background text-xs h-8"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="personPersonality">AI Personality / Tone (optional)</Label>
                  <textarea
                    id="personPersonality"
                    placeholder="e.g., Be blunt and logical, or Be warm and validating..."
                    value={draftPersonality}
                    onChange={(e) => setDraftPersonality(e.target.value)}
                    className="w-full min-h-[80px] rounded-md border border-input bg-input-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
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
                <div key={chat.id} className="group rounded-xl hover:bg-accent/50 transition-all">
                  <div className="flex items-start gap-2 p-3">
                    <button onClick={() => handleChatClick(chat.id)} className="flex flex-1 items-start gap-3 text-left overflow-hidden">
                      {chat.image_url ? (
                        <img src={chat.image_url} alt={chat.name} className="w-12 h-12 rounded-full object-cover shadow-sm border border-border" />
                      ) : (
                        <div className="text-3xl w-12 h-12 flex items-center justify-center bg-muted/50 rounded-full">{chat.emoji}</div>
                      )}
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

      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-background via-background to-primary/5">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden absolute top-4 left-4"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          <Menu className="w-6 h-6" />
        </Button>
        
        <div className="max-w-md animate-in fade-in zoom-in duration-500">
          {/* Mascot sitting above the text, paw resting on it */}
          <div className="flex justify-center mb-[-24px] relative z-20">
            <img 
              src="/mascot.png" 
              alt="Vent Mascot" 
              className="w-40 h-40 object-contain "
            />
          </div>
          <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500 relative z-10 pt-2">
            Who do you need to vent about today?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-sm mx-auto">
            Select a person from the sidebar or add someone new to clear your mind.
          </p>
          <Button size="lg" onClick={openCreateDialog} className="shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
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
