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
          className="rounded-full shadow-2xl bg-secondary hover:bg-secondary/90 text-secondary-foreground h-12 px-4 text-sm sm:h-16 sm:px-8 sm:text-lg font-semibold gap-2 sm:gap-3 border-2 border-white/20 backdrop-blur-sm"
        >
          <Wind className="w-5 h-5 sm:w-7 sm:h-7" />
          <span className="whitespace-nowrap">I'm Overwhelmed 💙</span>
        </Button>
      </Link>
    </motion.div>
  );
}
