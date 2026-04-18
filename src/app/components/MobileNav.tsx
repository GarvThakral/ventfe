import { Link, useLocation } from '@/lib/router';
import { Home, Plus, Wind, Settings } from 'lucide-react';
import { cn } from './ui/utils';

export function MobileNav() {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/dashboard?add=true', icon: Plus, label: 'New', isAction: true },
    { path: '/overwhelmed', icon: Wind, label: 'Overwhelmed' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          if (item.isAction) {
            return (
              <Link
                key={item.path}
                to="/dashboard"
                className="flex flex-col items-center justify-center flex-1 h-full -mt-8"
              >
                <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                  <Icon className="w-6 h-6" />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
