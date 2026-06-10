import { useSettings } from '../../hooks/useSettings';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Sun, Moon, Monitor, Settings, CheckSquare, Calendar, FileText } from 'lucide-react';
import { cn } from '../../lib/utils';

interface NavBarProps {
  activeView: 'today' | 'upcoming' | 'templates' | 'settings';
  onNavigate: (view: 'today' | 'upcoming' | 'templates' | 'settings') => void;
}

const navItems = [
  { id: 'today' as const, label: 'Today', icon: CheckSquare },
  { id: 'upcoming' as const, label: 'Upcoming', icon: Calendar },
  { id: 'templates' as const, label: 'Templates', icon: FileText },
];

export default function NavBar({ activeView, onNavigate }: NavBarProps) {
  const { state: settings, dispatch } = useSettings();

  const cycleTheme = () => {
    const modes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const currentIndex = modes.indexOf(settings.themeMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    dispatch({ type: 'SET_THEME_MODE', payload: nextMode });
  };

  const getThemeIcon = () => {
    switch (settings.themeMode) {
      case 'light': return <Sun className="h-5 w-5" />;
      case 'dark': return <Moon className="h-5 w-5" />;
      case 'system': return <Monitor className="h-5 w-5" />;
    }
  };

  const getThemeLabel = () => {
    switch (settings.themeMode) {
      case 'light': return 'Light mode';
      case 'dark': return 'Dark mode';
      case 'system': return 'System theme';
    }
  };

  return (
    <TooltipProvider>
      <header className="h-nav fixed top-0 left-0 right-0 z-40 border-b bg-background">
        <div className="mx-auto flex h-full max-w-[800px] items-center px-6">
          {/* Logo/Name */}
          <div className="text-lg font-semibold text-foreground mr-8">
            Mini Planner
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-1 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    'gap-2',
                    activeView === item.id
                      ? 'text-primary font-semibold bg-accent'
                      : 'text-muted-foreground',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </nav>

          {/* Right section */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={cycleTheme}
                  aria-label={`Switch theme. Current: ${getThemeLabel()}`}
                >
                  {getThemeIcon()}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{getThemeLabel()}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onNavigate('settings')}
                  aria-label="Settings"
                  className={cn(activeView === 'settings' && 'text-primary')}
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}
