import { useEffect, useRef, useState } from 'react';

import { api } from '@/lib/api';
import { useNavigate, useParams } from '@/lib/router';
import { useCurrentUser } from '@/lib/use-current-user';
import type { Chat, Memory, Message } from '@/lib/types';
import { MobileNav } from '../components/MobileNav';
import { MessageSkeleton } from '../components/LoadingSkeleton';
import { OverwhelmedButton } from '../components/OverwhelmedButton';
import { SEOHead } from '../components/SEOHead';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';
import { Textarea } from '../components/ui/textarea';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, Brain, Send, Settings, Upload, Image as ImageIcon, Plus, Clock, Sparkles, Lock } from 'lucide-react';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { AnimatePresence, motion } from 'motion/react';
import { toast } from 'sonner';
import { PricingModal } from '../components/PricingModal';

const MOODS = [
  { emoji: '😤', label: 'Venting' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😕', label: 'Confused' },
  { emoji: '😠', label: 'Angry' },
  { emoji: '🤔', label: 'Unsure' },
];

const CHARACTERS = [
  { id: 'default', name: 'Default', emoji: '☕', premium: false },
  { id: 'golden_retriever', name: 'Golden Retriever', emoji: '🐕', premium: false },
  { id: 'chihuahua', name: 'Chihuahua', emoji: '🐕', premium: true },
  { id: 'wise_owl', name: 'Wise Owl', emoji: '🦉', premium: true },
  { id: 'cat', name: 'Observant Cat', emoji: '🐈', premium: true },
];

type MessageWithState = Message & {
  optimistic?: boolean;
  failed?: boolean;
};

export function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoading: isUserLoading } = useCurrentUser();
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<MessageWithState[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [input, setInput] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isLoadingChat, setIsLoadingChat] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmoji, setEditEmoji] = useState('🧑');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editPersonality, setEditPersonality] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isRecommending, setIsRecommending] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  useEffect(() => {
    if (!user || !id) {
      return;
    }

    void loadConversation(id);
  }, [id, user]);

  async function loadConversation(chatId: string) {
    setIsLoadingChat(true);
    try {
      const [chatResponse, messageResponse, memoryResponse] = await Promise.all([
        api.getChat(chatId),
        api.getMessages(chatId),
        api.getMemories(chatId),
      ]);
      setChat(chatResponse);
      setMessages(messageResponse.items);
      setMemories(memoryResponse);
      
      setEditName(chatResponse.name);
      setEditEmoji(chatResponse.emoji);
      setEditImageUrl(chatResponse.image_url || '');
      setEditPersonality(chatResponse.personality || '');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to load this chat');
      navigate('/dashboard');
    } finally {
      setIsLoadingChat(false);
    }
  }

  async function refreshMemories() {
    if (!id) {
      return;
    }

    try {
      const nextMemories = await api.getMemories(id);
      setMemories(nextMemories);
    } catch {
      // Silent refresh failure keeps the primary chat flow responsive.
    }
  }

  async function handleSend() {
    if (!id || !input.trim() || isSending) {
      return;
    }

    const moodTag = selectedMood;
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticMessage: MessageWithState = {
      id: optimisticId,
      chat_id: id,
      role: 'user',
      content: input.trim(),
      mood_tag: moodTag,
      used_memory: false,
      created_at: new Date().toISOString(),
      optimistic: true,
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setInput('');
    setSelectedMood(null);
    setIsSending(true);

    try {
      const response = await api.sendMessage(id, optimisticMessage.content, moodTag);
      setMessages((prev) => {
        const withoutOptimistic = prev.filter((message) => message.id !== optimisticId);
        return [...withoutOptimistic, response.user_message, response.ai_message];
      });

      if (response.rate_limited) {
        toast.info(response.ai_message.content);
      }

      void refreshMemories();
    } catch (error) {
      setMessages((prev) =>
        prev.map((message) =>
          message.id === optimisticId
            ? {
                ...message,
                optimistic: false,
                failed: true,
              }
            : message,
        ),
      );
      toast.error(error instanceof Error ? error.message : 'Unable to send message');
    } finally {
      setIsSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }

  async function handleUpdateChat() {
    if (!id || !editName.trim() || isUpdating) {
      return;
    }

    setIsUpdating(true);
    try {
      const updatedChat = await api.updateChat(id, {
        name: editName.trim(),
        emoji: editEmoji,
        image_url: editImageUrl.trim() || null,
        personality: editPersonality.trim() || null,
      });
      setChat(updatedChat);
      setShowSettings(false);
      toast.success('Chat updated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update chat');
    } finally {
      setIsUpdating(false);
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
      setEditImageUrl(url);
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }

  async function handleRecommendPersonality() {
    if (!user?.is_premium) {
      setShowPricing(true);
      return;
    }

    setIsRecommending(true);
    try {
      const data = await api.recommendPersonality(id);
      setEditPersonality(data.recommendation);
      toast.success('AI recommended a new personality!');
    } catch (error) {
      toast.error('Unable to get recommendation');
    } finally {
      setIsRecommending(false);
    }
  }

  const isLoading = isUserLoading || isLoadingChat;

  return (
    <div className="h-screen flex flex-col relative overflow-hidden">
      {/* Background Image Layer */}
      {chat?.image_url && (
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
            style={{ backgroundImage: `url(${chat.image_url})` }}
          />
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />
        </div>
      )}
      
      <div className="relative z-10 flex flex-col h-full bg-background/5">
      <SEOHead
        title={chat ? `Chat with ${chat.name} — Vent 🌬️` : 'Chat with AI — Vent 🌬️'}
        description="Engage in a conversation with Vent's companion AI."
      />
      <header className="border-b bg-card/50 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            {chat?.image_url ? (
              <img src={chat.image_url} alt={chat.name} className="w-10 h-10 rounded-full object-cover border border-border shadow-sm" />
            ) : (
              <span className="text-3xl">{chat?.emoji ?? '☕'}</span>
            )}
            <div>
              <h1 className="font-semibold">{chat?.name ?? 'Loading...'}</h1>
              <p className="text-xs text-muted-foreground">Private chat</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Sheet open={showSettings} onOpenChange={setShowSettings}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Chat Settings</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Picture (optional)</label>
                  <div className="flex gap-4 items-start">
                    {editImageUrl ? (
                      <div className="relative group">
                        <img 
                          src={editImageUrl} 
                          alt="Preview" 
                          className="w-16 h-16 rounded-lg object-cover border border-border shadow-sm" 
                        />
                        <button 
                          onClick={() => setEditImageUrl('')}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Plus className="w-3 h-3 rotate-45" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center border-2 border-dashed border-border text-muted-foreground">
                        <ImageIcon className="w-6 h-6 opacity-20" />
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <div className="relative">
                        <input
                          type="file"
                          id="chat-file-upload"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileChange}
                          disabled={isUploading}
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full h-8 gap-2 text-xs"
                          onClick={() => document.getElementById('chat-file-upload')?.click()}
                          disabled={isUploading}
                        >
                          <Upload className="w-3 h-3" />
                          {isUploading ? 'Uploading...' : 'Upload Image'}
                        </Button>
                      </div>
                      <input
                        value={editImageUrl}
                        onChange={(e) => setEditImageUrl(e.target.value)}
                        placeholder="Or paste URL here..."
                        className="w-full rounded-md border border-input bg-input-background px-3 py-1 text-[10px]"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Choose a Character</label>
                    {!user?.is_premium && (
                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <Lock className="w-2 h-2" />
                        PREMIUM
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {CHARACTERS.map((char) => {
                      const isLocked = char.premium && !user?.is_premium;
                      const isSelected = editPersonality.toLowerCase().includes(char.id) || 
                                       (char.id === 'default' && !CHARACTERS.some(c => editPersonality.toLowerCase().includes(c.id)));
                      
                      return (
                        <button
                          key={char.id}
                          onClick={() => {
                            if (isLocked) {
                              setShowPricing(true);
                            } else {
                              setEditPersonality(char.id);
                            }
                          }}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all ${
                            isSelected 
                              ? 'border-primary bg-primary/5' 
                              : 'border-transparent bg-muted/50 hover:bg-muted'
                          } ${isLocked ? 'opacity-60' : ''}`}
                        >
                          <span className="text-2xl mb-1">{char.emoji}</span>
                          <span className="text-[10px] font-medium text-center leading-tight">{char.name}</span>
                          {isLocked && <Lock className="w-2 h-2 mt-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Custom AI Tone</label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-[10px] gap-1 text-primary"
                      onClick={handleRecommendPersonality}
                      disabled={isRecommending}
                    >
                      <Sparkles className="w-3 h-3" />
                      {isRecommending ? 'Thinking...' : 'AI Recommend'}
                    </Button>
                  </div>
                  <textarea
                    value={editPersonality}
                    onChange={(e) => setEditPersonality(e.target.value)}
                    placeholder="e.g., Be blunt, logical, or warm..."
                    className="w-full min-h-[80px] rounded-md border border-input bg-input-background px-3 py-2 text-sm"
                  />
                  {!user?.is_premium && (
                    <p className="text-[10px] text-muted-foreground italic">
                      Custom tones are locked for free users.
                    </p>
                  )}
                </div>
                <Button onClick={handleUpdateChat} disabled={isUpdating} className="w-full">
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="hidden sm:flex">
              <Brain className="w-4 h-4 mr-2" />
              View Memories
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                What I remember
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              {memories.length === 0 ? (
                <div className="text-center py-12">
                  <Brain className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">No memories saved for this relationship yet.</p>
                </div>
              ) : (
                memories.map((memory, index) => (
                  <motion.div
                    key={memory.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-3 rounded-xl border bg-card/50 space-y-2"
                  >
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {memory.created_at ? formatDistanceToNow(new Date(memory.created_at), { addSuffix: true }) : 'Recently'}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/90">
                      {memory.content}
                    </p>
                  </motion.div>
                ))
              )}
            </div>
          </SheetContent>
          </Sheet>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <MessageSkeleton />
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center px-6">
            <div className="max-w-sm">
              <div className="text-6xl mb-6 bounce-slow">{chat?.emoji ?? '☕'}</div>
              <h2 className="text-2xl font-semibold mb-3">Venting about {chat?.name}?</h2>
              <p className="text-muted-foreground mb-6">
                Vent is here to listen. Tell me what happened with {chat?.name} today, or how they're making you feel.
              </p>
              <div className="grid grid-cols-1 gap-2">
                <Button variant="outline" className="justify-start h-auto py-3 px-4" onClick={() => setInput(`Something happened with ${chat?.name}...`)}>
                  <div className="text-left">
                    <p className="font-medium text-sm">"Something happened..."</p>
                    <p className="text-xs text-muted-foreground">Start with a specific event</p>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto py-3 px-4" onClick={() => setInput(`I'm feeling frustrated about ${chat?.name} because...`)}>
                  <div className="text-left">
                    <p className="font-medium text-sm">"I'm feeling frustrated..."</p>
                    <p className="text-xs text-muted-foreground">Describe your emotions</p>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message) => {
              const isUser = message.role === 'user';
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
                >
                  {!isUser && (
                    <Avatar className="w-8 h-8 bg-secondary text-secondary-foreground">
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                      isUser ? 'bg-primary text-primary-foreground' : 'glass border-none'
                    } ${message.failed ? 'border-destructive' : ''}`}
                  >
                    {message.mood_tag && <span className="text-xl mr-2">{message.mood_tag.split(' ')[0]}</span>}
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {!isUser && message.used_memory && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        <Brain className="w-3 h-3 mr-1" />
                        remembered this
                      </Badge>
                    )}
                    {message.failed && (
                      <Badge variant="destructive" className="mt-2 text-xs">
                        Not sent
                      </Badge>
                    )}
                    <p className="text-xs opacity-70 mt-2">
                      {message.created_at
                        ? new Date(message.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Just now'}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {isSending && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <Avatar className="w-8 h-8 bg-secondary text-secondary-foreground">
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
            <div className="bg-card border rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t bg-card/50 backdrop-blur-sm p-4 space-y-3">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {MOODS.map((mood) => {
            const value = `${mood.emoji} ${mood.label}`;
            return (
              <button
                key={mood.label}
                onClick={() => setSelectedMood(selectedMood === value ? null : value)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
                  selectedMood === value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                <span>{mood.emoji}</span>
                <span>{mood.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex gap-3 items-end">
          <Textarea
            placeholder="What happened?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[60px] max-h-40 resize-none bg-input-background"
          />
          <Button size="icon" className="h-[60px] w-[60px]" onClick={() => void handleSend()} disabled={!input.trim() || isSending}>
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <OverwhelmedButton />
      <MobileNav />
      <PricingModal isOpen={showPricing} onOpenChange={setShowPricing} />
      </div>
    </div>
  );
}
