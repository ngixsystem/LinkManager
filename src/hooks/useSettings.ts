import { useState, useEffect, useCallback, useRef } from 'react';

export interface AppSettings {
    title: string;
    subtitle: string;
    logoUrl?: string;
    backgroundType: 'gradient' | 'image' | 'solid';
    backgroundColor: string;
    backgroundGradient: string;
    backgroundImage: string | null;
    groupSize: 'compact' | 'normal' | 'large';
}

const defaultSettings: AppSettings = {
    title: 'LinkVault',
    subtitle: 'Organize your web',
    backgroundType: 'gradient',
    backgroundColor: 'hsl(220 20% 97%)',
    backgroundGradient: 'linear-gradient(135deg, hsl(220 30% 96%) 0%, hsl(200 40% 94%) 50%, hsl(240 30% 96%) 100%)',
    backgroundImage: null,
    groupSize: 'compact',
};

export function useSettings() {
    const [settings, setSettings] = useState<AppSettings>(defaultSettings);
    const [loading, setLoading] = useState(true);
    const isFirstLoad = useRef(true);
    // Ref to track if changes are local (optimistic) to debounce saves
    const latestSettings = useRef(defaultSettings);

    // Fetch initial settings
    useEffect(() => {
        fetch('/api/data/settings')
            .then(res => {
                if (res.ok) return res.json();
                throw new Error('No settings found');
            })
            .then(data => {
                const merged = { ...defaultSettings, ...data };
                setSettings(merged);
                latestSettings.current = merged;
            })
            .catch(() => {
                // Fallback to localStorage if API fails or empty (first run)
                const stored = localStorage.getItem('link-manager-settings');
                if (stored) {
                    try {
                        const parsed = JSON.parse(stored);
                        const merged = { ...defaultSettings, ...parsed };
                        setSettings(merged);
                        latestSettings.current = merged;
                        // Sync to server? Yes, why not.
                        saveToServer(merged);
                    } catch { }
                }
            })
            .finally(() => {
                setLoading(false);
                isFirstLoad.current = false;
            });
    }, []);

    const saveToServer = async (newSettings: AppSettings) => {
        try {
            await fetch('/api/data/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSettings)
            });
            // Also backend localstorage as backup/cache
            localStorage.setItem('link-manager-settings', JSON.stringify(newSettings));
        } catch (e) {
            console.error("Failed to save settings", e);
        }
    };

    // Debounce save
    useEffect(() => {
        if (isFirstLoad.current) return;
        const timeout = setTimeout(() => {
            saveToServer(settings);
        }, 500);
        return () => clearTimeout(timeout);
    }, [settings]);

    const updateSettings = useCallback((updates: Partial<AppSettings>) => {
        setSettings(prev => {
            const next = { ...prev, ...updates };
            latestSettings.current = next;
            return next;
        });
    }, []);

    const resetSettings = useCallback(() => {
        setSettings(defaultSettings);
    }, []);

    return {
        settings,
        updateSettings,
        resetSettings,
        loading
    };
}
