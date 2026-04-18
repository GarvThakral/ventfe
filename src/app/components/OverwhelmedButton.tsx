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
      className="hidden md:block fixed bottom-6 right-6 z-40"
    >
      <Link to="/overwhelmed">
        <Button
          size="lg"
          className="rounded-full shadow-lg bg-secondary hover:bg-secondary/90 text-secondary-foreground px-6 gap-2"
        >
          <Wind className="w-5 h-5" />
          I'm Overwhelmed 💙
        </Button>
      </Link>
    </motion.div>
  );
}
