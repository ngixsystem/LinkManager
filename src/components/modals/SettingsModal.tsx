import { useRef } from 'react';
import { Settings, Upload, Trash2, RotateCcw } from 'lucide-react';
import { AppSettings } from '@/hooks/useSettings';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SettingsModalProps {
    open: boolean;
    onClose: () => void;
    settings: AppSettings;
    onUpdateSettings: (updates: Partial<AppSettings>) => void;
    onResetSettings: () => void;
}

const gradientPresets = [
    { name: 'Sky', value: 'linear-gradient(135deg, hsl(220 30% 96%) 0%, hsl(200 40% 94%) 50%, hsl(240 30% 96%) 100%)' },
    { name: 'Sunset', value: 'linear-gradient(135deg, hsl(30 50% 95%) 0%, hsl(350 50% 93%) 50%, hsl(280 40% 95%) 100%)' },
    { name: 'Forest', value: 'linear-gradient(135deg, hsl(150 30% 95%) 0%, hsl(180 40% 93%) 50%, hsl(200 30% 95%) 100%)' },
    { name: 'Ocean', value: 'linear-gradient(135deg, hsl(200 50% 94%) 0%, hsl(220 60% 92%) 50%, hsl(240 50% 95%) 100%)' },
    { name: 'Lavender', value: 'linear-gradient(135deg, hsl(270 40% 96%) 0%, hsl(290 50% 94%) 50%, hsl(320 40% 96%) 100%)' },
    { name: 'Midnight', value: 'linear-gradient(135deg, hsl(230 25% 18%) 0%, hsl(250 30% 15%) 50%, hsl(220 25% 12%) 100%)' },
];

const sizeOptions = [
    { label: 'Compact', value: 'compact' as const },
    { label: 'Normal', value: 'normal' as const },
    { label: 'Large', value: 'large' as const },
];

export function SettingsModal({
    open,
    onClose,
    settings,
    onUpdateSettings,
    onResetSettings,
}: SettingsModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const imageUrl = event.target?.result as string;
                onUpdateSettings({
                    backgroundType: 'image',
                    backgroundImage: imageUrl,
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        onUpdateSettings({
            backgroundType: 'gradient',
            backgroundImage: null,
        });
    };

    return (
        <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="glass-card-elevated border-border/50 max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Settings
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                    {/* Header Settings */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Header</h3>

                        <div className="space-y-2">
                            <Label htmlFor="app-title" className="text-sm font-medium">
                                Title
                            </Label>
                            <Input
                                id="app-title"
                                value={settings.title}
                                onChange={(e) => onUpdateSettings({ title: e.target.value })}
                                placeholder="App title"
                                className="h-12 rounded-xl bg-secondary/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="app-subtitle" className="text-sm font-medium">
                                Subtitle
                            </Label>
                            <Input
                                id="app-subtitle"
                                value={settings.subtitle}
                                onChange={(e) => onUpdateSettings({ subtitle: e.target.value })}
                                placeholder="App subtitle"
                                className="h-12 rounded-xl bg-secondary/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="app-logo" className="text-sm font-medium">
                                Logo URL (Optional)
                            </Label>
                            <Input
                                id="app-logo"
                                value={settings.logoUrl || ''}
                                onChange={(e) => onUpdateSettings({ logoUrl: e.target.value })}
                                placeholder="https://example.com/logo.png"
                                className="h-12 rounded-xl bg-secondary/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
                            />
                        </div>
                    </div>

                    {/* Background Settings */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Background</h3>

                        {/* Image Upload */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Custom Image</Label>
                            <div className="flex gap-2">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="ios-button-secondary flex-1 h-12 gap-2"
                                >
                                    <Upload className="w-4 h-4" />
                                    Upload Image
                                </button>
                                {settings.backgroundImage && (
                                    <button
                                        onClick={handleRemoveImage}
                                        className="ios-button bg-destructive/10 text-destructive hover:bg-destructive/20 h-12 px-4"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            {settings.backgroundImage && (
                                <div className="mt-2 rounded-xl overflow-hidden h-20">
                                    <img
                                        src={settings.backgroundImage}
                                        alt="Background preview"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Gradient Presets */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Gradient Presets</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {gradientPresets.map((preset) => (
                                    <button
                                        key={preset.name}
                                        onClick={() => onUpdateSettings({
                                            backgroundType: 'gradient',
                                            backgroundGradient: preset.value,
                                            backgroundImage: null,
                                        })}
                                        className={`h-16 rounded-xl transition-all duration-200 ${settings.backgroundGradient === preset.value && settings.backgroundType === 'gradient'
                                                ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-105'
                                                : 'hover:scale-105'
                                            }`}
                                        style={{ background: preset.value }}
                                        title={preset.name}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Group Size */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Group Size</h3>
                        <div className="flex gap-2">
                            {sizeOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => onUpdateSettings({ groupSize: option.value })}
                                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${settings.groupSize === option.value
                                            ? 'bg-primary text-primary-foreground shadow-ios-md'
                                            : 'bg-secondary text-secondary-foreground hover:bg-accent'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Reset Button */}
                    <button
                        onClick={onResetSettings}
                        className="w-full ios-button-secondary h-12 gap-2 text-muted-foreground"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Reset to Defaults
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
