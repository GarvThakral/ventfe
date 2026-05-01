import { useEffect, useState } from 'react';

import { api } from '@/lib/api';
import { useNavigate } from '@/lib/router';
import type { BreathingExercise, GroundingTechnique, MeditationScript } from '@/lib/types';
import { SEOHead } from '../components/SEOHead';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { X, Volume2, VolumeX, Music } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'hold_after_exhale';

export function OverwhelmedPage() {
  const navigate = useNavigate();
  const [breathingExercises, setBreathingExercises] = useState<BreathingExercise[]>([]);
  const [grounding, setGrounding] = useState<GroundingTechnique | null>(null);
  const [meditations, setMeditations] = useState<MeditationScript[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('box');
  const [isBreathing, setIsBreathing] = useState(false);
  const [phase, setPhase] = useState<BreathingPhase>('inhale');
  const [countdown, setCountdown] = useState(4);
  const [activeTab, setActiveTab] = useState('breathing');
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [audio] = useState(() => typeof Audio !== 'undefined' ? new Audio('/monume-relaxing-relaxing-music-498056.mp3') : null);

  useEffect(() => {
    if (!audio) return;
    audio.loop = true;
    
    if (isPlayingMusic && (activeTab === 'grounding' || activeTab === 'meditation')) {
      audio.play().catch(e => console.error("Audio playback failed:", e));
    } else {
      audio.pause();
    }

    return () => {
      audio.pause();
    };
  }, [isPlayingMusic, activeTab, audio]);

  // Stop music when leaving the page
  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [audio]);

  useEffect(() => {
    void Promise.all([
      api.getBreathingExercises(),
      api.getGroundingTechnique(),
      api.getMeditations(),
    ])
      .then(([breathingResponse, groundingResponse, meditationResponse]) => {
        setBreathingExercises(breathingResponse);
        setGrounding(groundingResponse);
        setMeditations(meditationResponse);
        if (breathingResponse[0]) {
          setSelectedExerciseId(breathingResponse[0].id);
          setCountdown(breathingResponse[0].inhale);
        }
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : 'Unable to load wellness tools');
      });
  }, []);

  const selectedExercise =
    breathingExercises.find((exercise) => exercise.id === selectedExerciseId) ?? breathingExercises[0];

  useEffect(() => {
    if (!selectedExercise || !isBreathing) {
      return;
    }

    const phaseOrder: BreathingPhase[] = ['inhale', 'hold', 'exhale', 'hold_after_exhale'];
    const durationMap = {
      inhale: selectedExercise.inhale,
      hold: selectedExercise.hold,
      exhale: selectedExercise.exhale,
      hold_after_exhale: selectedExercise.hold_after_exhale,
    };
    const currentDuration = durationMap[phase];
    const hasPhase = currentDuration > 0;

    const timer = window.setTimeout(() => {
      const currentIndex = phaseOrder.indexOf(phase);
      const nextIndex = (currentIndex + 1) % phaseOrder.length;
      const nextPhase = phaseOrder[nextIndex];
      setPhase(nextPhase);
      setCountdown(durationMap[nextPhase] || selectedExercise.inhale);
    }, hasPhase ? currentDuration * 1000 : 100);

    return () => window.clearTimeout(timer);
  }, [isBreathing, phase, selectedExercise]);

  useEffect(() => {
    if (!isBreathing || countdown <= 1) {
      return;
    }

    const timer = window.setTimeout(() => {
      setCountdown((value) => value - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [countdown, isBreathing]);

  useEffect(() => {
    if (!selectedExercise) {
      return;
    }
    setPhase('inhale');
    setCountdown(selectedExercise.inhale);
    setIsBreathing(false);
  }, [selectedExerciseId, selectedExercise]);

  function currentPhaseText() {
    switch (phase) {
      case 'inhale':
        return 'Breathe In';
      case 'hold':
        return 'Hold';
      case 'exhale':
        return 'Breathe Out';
      case 'hold_after_exhale':
        return 'Hold';
    }
  }

  const boxSize = phase === 'inhale' ? 220 : phase === 'exhale' ? 140 : 180;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 relative">
      <SEOHead
        title="Breathing & Calming Tools — Vent 🌬️"
        description="Take a moment to breathe and ground yourself with Vent's calming exercises and meditation tools."
      />
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-10"
        onClick={() => navigate(-1)}
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </Button>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Take a moment 💙</h1>
          <p className="text-lg text-muted-foreground">You do not need to solve everything before you calm your body down.</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="breathing">Breathing</TabsTrigger>
            <TabsTrigger value="grounding">Grounding</TabsTrigger>
            <TabsTrigger value="meditation">Meditation</TabsTrigger>
          </TabsList>

          <TabsContent value="breathing">
            <Card className="border-0 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8 md:p-12">
                <div className="flex flex-wrap gap-2 justify-center mb-6">
                  {breathingExercises.map((exercise) => (
                    <Button
                      key={exercise.id}
                      variant={exercise.id === selectedExerciseId ? 'default' : 'outline'}
                      onClick={() => setSelectedExerciseId(exercise.id)}
                    >
                      {exercise.title}
                    </Button>
                  ))}
                </div>
                <h2 className="text-2xl font-semibold text-center mb-3">{selectedExercise?.title ?? 'Loading...'}</h2>
                <p className="text-center text-muted-foreground mb-8">
                  {selectedExercise?.description ?? 'Loading breathing instructions...'}
                </p>

                <div className="flex items-center justify-center min-h-[300px] mb-8">
                  <motion.div
                    animate={{
                      width: boxSize,
                      height: boxSize,
                    }}
                    transition={{
                      duration: 1,
                      ease: 'easeInOut',
                    }}
                    className="rounded-3xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center text-white relative"
                  >
                    <div className="text-center">
                      <div className="text-2xl font-semibold mb-2">{currentPhaseText()}</div>
                      {isBreathing && <div className="text-5xl font-bold">{countdown}</div>}
                    </div>
                  </motion.div>
                </div>

                <div className="flex justify-center gap-4">
                  <Button size="lg" onClick={() => setIsBreathing((value) => !value)} className="px-8">
                    {isBreathing ? 'Pause' : 'Start'}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => {
                      setIsBreathing(false);
                      setPhase('inhale');
                      setCountdown(selectedExercise?.inhale ?? 4);
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grounding">
            <div className="flex justify-end mb-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 rounded-full"
                onClick={() => setIsPlayingMusic(!isPlayingMusic)}
              >
                {isPlayingMusic ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                {isPlayingMusic ? 'Music On' : 'Music Off'}
              </Button>
            </div>
            <Card className="border-0 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8 md:p-12">
                <h2 className="text-2xl font-semibold text-center mb-3">{grounding?.title ?? 'Loading...'}</h2>
                <p className="text-center text-muted-foreground mb-8">{grounding?.intro}</p>

                <div className="space-y-4">
                  {grounding?.steps.map((step) => (
                    <div key={step.sense} className="rounded-2xl bg-background/70 p-5 border">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                          {step.count}
                        </div>
                        <h3 className="text-lg font-semibold capitalize">{step.sense}</h3>
                      </div>
                      <p className="text-muted-foreground">{step.prompt}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meditation">
            <div className="flex justify-end mb-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 rounded-full"
                onClick={() => setIsPlayingMusic(!isPlayingMusic)}
              >
                {isPlayingMusic ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                {isPlayingMusic ? 'Music On' : 'Music Off'}
              </Button>
            </div>
            <Card className="border-0 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8 md:p-12 space-y-4">
                {meditations.map((meditation) => (
                  <div key={meditation.id} className="rounded-2xl bg-background/70 p-5 border space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-lg font-semibold">{meditation.title}</h3>
                      <span className="text-sm text-muted-foreground">{meditation.duration_minutes} min</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{meditation.script}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
