import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Check, Sparkles, Zap } from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PricingModal({ isOpen, onOpenChange }: PricingModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] border-primary/20 shadow-2xl">
        <DialogHeader className="text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold">Go Premium</DialogTitle>
          <DialogDescription>
            Unlock the full potential of your AI companions.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-3">
            {[
              'Unlimited AI Characters (Golden Retriever, Wise Owl, etc.)',
              'AI Personality Recommendations',
              'Custom AI Personalities',
              'Unlimited Memories & Relationship Analysis',
              'Premium Mascot Themes'
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-sm">
                <Check className="w-4 h-4 text-primary" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-lg">Vent Premium</span>
              <div className="text-right">
                <span className="text-2xl font-bold">$9.99</span>
                <span className="text-xs text-muted-foreground">/mo</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Cancel anytime. No hidden fees.
            </p>
            <Button className="w-full gap-2 shadow-lg" size="lg">
              <Zap className="w-4 h-4 fill-current" />
              Upgrade Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
