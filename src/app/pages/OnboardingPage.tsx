import { useState } from 'react';

import { api } from '@/lib/api';
import { useNavigate } from '@/lib/router';
import { useCurrentUser } from '@/lib/use-current-user';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Brain, Lock, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { toast } from 'sonner';

const EMOJIS = ['😤', '😢', '😕', '😠', '🤔', '🙄', '😰', '🤯', '😑', '😶', '🫠', '😬'];

export function OnboardingPage() {
  const navigate = useNavigate();
  useCurrentUser();
  const [step, setStep] = useState(1);
  const [personName, setPersonName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('😤');
  const [isCreating, setIsCreating] = useState(false);

  async function handleNext() {
    if (step < 3) {
      setStep((current) => current + 1);
      return;
    }

    setIsCreating(true);
    try {
      const chat = await api.createChat(personName.trim(), selectedEmoji);
      toast.success(`${chat.name} is ready`);
      navigate(`/chat/${chat.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to create your first chat');
    } finally {
      setIsCreating(false);
    }
  }

  function handleBack() {
    if (step > 1) {
      setStep((current) => current - 1);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <div className="w-full max-w-2xl">
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === step ? 'w-8 bg-primary' : 'w-2 bg-muted'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-8">
                <div className="text-center mb-8">
                  <div className="text-6xl mb-4">☕</div>
                  <h1 className="text-3xl font-bold mb-2">Welcome to Tea</h1>
                  <p className="text-muted-foreground text-lg">Who&apos;s been on your mind lately?</p>
                </div>

                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="personName">Person&apos;s name or nickname</Label>
                    <Input
                      id="personName"
                      placeholder="e.g., My boss, Sarah, That neighbor..."
                      value={personName}
                      onChange={(e) => setPersonName(e.target.value)}
                      className="text-lg bg-input-background"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Pick an emoji</Label>
                    <div className="grid grid-cols-6 gap-2">
                      {EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setSelectedEmoji(emoji)}
                          className={`text-3xl p-3 rounded-xl transition-all hover:scale-110 ${
                            selectedEmoji === emoji
                              ? 'bg-primary/20 ring-2 ring-primary'
                              : 'bg-muted/50 hover:bg-muted'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button onClick={() => void handleNext()} disabled={!personName.trim()} className="w-full" size="lg">
                    Continue
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/20 flex items-center justify-center">
                    <Brain className="w-8 h-8 text-secondary" />
                  </div>
                  <h2 className="text-3xl font-bold mb-2">How AI memory works</h2>
                  <p className="text-muted-foreground text-lg">Your privacy is still the center of the product.</p>
                </div>

                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <FeaturePoint
                      icon={<Lock className="w-5 h-5" />}
                      title="Private by default"
                      description="Every chat is scoped to your Supabase user and protected with row-level security."
                    />
                    <FeaturePoint
                      icon={<Brain className="w-5 h-5" />}
                      title="Smart memory"
                      description="Tea stores short reflective memories so replies stay contextual without flooding the prompt."
                    />
                    <FeaturePoint
                      icon={<Sparkles className="w-5 h-5" />}
                      title="Gentle responses"
                      description="The backend prompt is tuned to validate emotions, ask soft follow-ups, and avoid unsolicited advice."
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleBack} variant="outline" className="w-full" size="lg">
                      Back
                    </Button>
                    <Button onClick={() => void handleNext()} className="w-full" size="lg">
                      Got it
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-8">
                <div className="text-center mb-8">
                  <div className="text-6xl mb-4">{selectedEmoji}</div>
                  <h2 className="text-3xl font-bold mb-2">Your first chat is ready</h2>
                  <p className="text-muted-foreground text-lg">Time to spill the tea about {personName}</p>
                </div>

                <CardContent className="space-y-6">
                  <div className="bg-muted/50 p-6 rounded-xl space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">Tips for getting started:</p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex gap-2">
                        <span className="text-primary">•</span>
                        Write the messy version first. You can always refine later.
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary">•</span>
                        Mood tags help steer the assistant tone.
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary">•</span>
                        Tea will begin storing memories after the assistant notices a pattern worth keeping.
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary">•</span>
                        Use the overwhelmed tools any time you need to step away from the vent.
                      </li>
                    </ul>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleBack} variant="outline" className="w-full" size="lg">
                      Back
                    </Button>
                    <Button onClick={() => void handleNext()} className="w-full" size="lg" disabled={isCreating}>
                      {isCreating ? 'Creating chat...' : 'Start Venting'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function FeaturePoint({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 items-start">
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-primary flex-shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
