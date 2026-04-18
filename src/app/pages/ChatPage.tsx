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
import { ArrowLeft, Brain, Send } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { toast } from 'sonner';

const MOODS = [
  { emoji: '😤', label: 'Venting' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😕', label: 'Confused' },
  { emoji: '😠', label: 'Angry' },
  { emoji: '🤔', label: 'Unsure' },
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

  const isLoading = isUserLoading || isLoadingChat;

  return (
    <div className="h-screen flex flex-col bg-background">
      <SEOHead
        title={chat ? `Chat with ${chat.name} — Tea ☕` : 'Chat with AI — Tea ☕'}
        description="Engage in a conversation with Tea's companion AI."
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
            <span className="text-3xl">{chat?.emoji ?? '☕'}</span>
            <div>
              <h1 className="font-semibold">{chat?.name ?? 'Loading...'}</h1>
              <p className="text-xs text-muted-foreground">Private chat</p>
            </div>
          </div>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
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
            <div className="mt-6 space-y-3">
              {memories.length === 0 ? (
                <p className="text-sm text-muted-foreground">No memories saved for this relationship yet.</p>
              ) : (
                memories.map((memory, index) => (
                  <motion.div
                    key={memory.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex gap-2 items-start"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <p className="text-sm">{memory.content}</p>
                  </motion.div>
                ))
              )}
            </div>
          </SheetContent>
        </Sheet>
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
                Tea is here to listen. Tell me what happened with {chat?.name} today, or how they're making you feel.
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
                    className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                      isUser ? 'bg-primary text-primary-foreground' : 'bg-card border'
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
    </div>
  );
}
