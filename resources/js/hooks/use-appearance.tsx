import { useCallback, useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark' | 'system';

const prefersDark = () => {
    if (typeof window === 'undefined') {
        return false;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const setCookie = (name: string, value: string, days = 365) => {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const applyTheme = (appearance: Appearance) => {
    const isDark = appearance === 'dark' || (appearance === 'system' && prefersDark());

    document.documentElement.classList.toggle('dark', isDark);
};

const mediaQuery = () => {
    if (typeof window === 'undefined') {
        return null;
    }

    return window.matchMedia('(prefers-color-scheme: dark)');
};

const handleSystemThemeChange = () => {
    const currentAppearance = localStorage.getItem('appearance') as Appearance;
    if (currentAppearance === 'system') {
        applyTheme('system');
    }
};

export function initializeTheme() {
    const savedAppearance = (localStorage.getItem('appearance') as Appearance) || 'system';

    applyTheme(savedAppearance);

    // Add the event listener for system theme changes
    const mediaQueryInstance = mediaQuery();
    if (mediaQueryInstance) {
        mediaQueryInstance.addEventListener('change', handleSystemThemeChange);
    }
}

export function useAppearance() {
    const [appearance, setAppearance] = useState<Appearance>('system');
    const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(prefersDark() ? 'dark' : 'light');

    const updateAppearance = useCallback((mode: Appearance) => {
        setAppearance(mode);

        // Store in localStorage for client-side persistence
        localStorage.setItem('appearance', mode);

        // Store in cookie for SSR
        setCookie('appearance', mode);

        applyTheme(mode);
    }, []);

    useEffect(() => {
        const savedAppearance = localStorage.getItem('appearance') as Appearance | null;
        updateAppearance(savedAppearance || 'system');

        // Listen for system theme changes
        const mediaQueryInstance = mediaQuery();
        if (mediaQueryInstance) {
            const handleChange = (e: MediaQueryListEvent) => {
                setSystemTheme(e.matches ? 'dark' : 'light');
                if (appearance === 'system') {
                    applyTheme('system');
                }
            };

            mediaQueryInstance.addEventListener('change', handleChange);
            return () => mediaQueryInstance.removeEventListener('change', handleChange);
        }
    }, [updateAppearance, appearance]);

    // Get the effective theme (system theme when appearance is 'system')
    const effectiveTheme = appearance === 'system' ? systemTheme : appearance;

    return { 
        appearance, 
        updateAppearance, 
        systemTheme,
        effectiveTheme 
    } as const;
}
