import { Link2, Plus, Moon, Sun, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useMonitoring } from '@/contexts/LinkMonitorContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AppSettings } from '@/hooks/useSettings';

interface HeaderProps {
    onAddGroup: () => void;
    onOpenSettings: () => void;
    settings: AppSettings;
}

export function Header({ onAddGroup, onOpenSettings, settings }: HeaderProps) {
    const [isDark, setIsDark] = useState(false);
    const { isEnabled, toggleMonitoring } = useMonitoring();

    useEffect(() => {
        // Check localStorage first, then DOM
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme === 'dark') {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        } else if (storedTheme === 'light') {
            setIsDark(false);
            document.documentElement.classList.remove('dark');
        } else {
            // If nothing stored, check system or default to dark (as requested)
            const isDarkMode = document.documentElement.classList.contains('dark');
            setIsDark(isDarkMode);
        }
    }, []);

    const toggleTheme = () => {
        const newIsDark = !isDark;
        setIsDark(newIsDark);

        if (newIsDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    return (
        <header className="sticky top-0 z-50 glass-card border-b border-border/50 rounded-none">
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    {settings.logoUrl ? (
                        <img
                            src={settings.logoUrl}
                            alt="Logo"
                            className="w-10 h-10 rounded-xl object-contain shadow-ios-md bg-background"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-ios-md">
                            <Link2 className="w-5 h-5 text-primary-foreground" />
                        </div>
                    )}
                    <div>
                        <h1 className="text-xl font-bold text-foreground">{settings.title}</h1>
                        <p className="text-xs text-muted-foreground">{settings.subtitle}</p>
                    </div>
                </div>


                {/* Actions */}
                <div className="flex items-center gap-2">
                    {/* Monitoring Toggle */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/50">
                        <Switch
                            checked={isEnabled}
                            onCheckedChange={toggleMonitoring}
                            id="monitoring"
                        />
                        <Label htmlFor="monitoring" className="text-sm cursor-pointer">
                            Live
                        </Label>
                    </div>

                    <button
                        onClick={onOpenSettings}
                        className="ios-button-ghost p-2.5 rounded-xl"
                        aria-label="Settings"
                    >
                        <Settings className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <button
                        onClick={toggleTheme}
                        className="ios-button-ghost p-2.5 rounded-xl"
                        aria-label="Toggle theme"
                    >
                        {isDark ? (
                            <Sun className="w-5 h-5 text-muted-foreground" />
                        ) : (
                            <Moon className="w-5 h-5 text-muted-foreground" />
                        )}
                    </button>
                    <button
                        onClick={onAddGroup}
                        className="ios-button-primary gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="hidden sm:inline">Новая группа</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
