import { Link } from '@/lib/router';
import { Button } from './ui/button';
import { Wind } from 'lucide-react';
import { motion } from 'motion/react';

export function OverwhelmedButton() {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
      className="fixed bottom-8 right-8 z-40"
    >
      <Link to="/overwhelmed">
        <Button
          className="rounded-full shadow-2xl bg-secondary hover:bg-secondary/90 text-secondary-foreground h-16 px-8 text-lg font-semibold gap-3 border-2 border-white/20 backdrop-blur-sm"
        >
          <Wind className="w-7 h-7" />
          I'm Overwhelmed 💙
        </Button>
      </Link>
    </motion.div>
  );
}
