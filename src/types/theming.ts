// Theme configuration for white-labeling
export interface ThemeConfig {
    id: string;
    name: string;

    // Brand
    brandName: string;
    logoUrl?: string;
    faviconUrl?: string;

    // Colors
    colors: {
        primary: string;
        primaryHover: string;
        secondary: string;
        accent: string;
        success: string;
        warning: string;
        error: string;
        background: string;
        backgroundSecondary: string;
        surface: string;
        surfaceHover: string;
        text: string;
        textSecondary: string;
        textMuted: string;
        border: string;
    };

    // Typography
    fonts: {
        heading: string;
        body: string;
        mono: string;
    };

    // Appearance
    borderRadius: 'none' | 'small' | 'medium' | 'large' | 'full';
    glassmorphism: boolean;
    animations: boolean;

    // Background
    backgroundType: 'solid' | 'gradient' | 'image';
    backgroundImage?: string;
    backgroundGradient?: string;
}

// Preset themes
export const PRESET_THEMES: ThemeConfig[] = [
    {
        id: 'midnight',
        name: 'Midnight',
        brandName: 'Home Control Center',
        colors: {
            primary: '#00d4ff',
            primaryHover: '#00bfe8',
            secondary: '#a855f7',
            accent: '#00ff88',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            background: '#0a0e14',
            backgroundSecondary: '#131720',
            surface: 'rgba(255, 255, 255, 0.05)',
            surfaceHover: 'rgba(255, 255, 255, 0.08)',
            text: '#ffffff',
            textSecondary: 'rgba(255, 255, 255, 0.7)',
            textMuted: 'rgba(255, 255, 255, 0.4)',
            border: 'rgba(255, 255, 255, 0.1)',
        },
        fonts: {
            heading: 'Inter, system-ui, sans-serif',
            body: 'Inter, system-ui, sans-serif',
            mono: 'JetBrains Mono, monospace',
        },
        borderRadius: 'large',
        glassmorphism: true,
        animations: true,
        backgroundType: 'solid',
    },
    {
        id: 'aurora',
        name: 'Aurora',
        brandName: 'Home Control Center',
        colors: {
            primary: '#22d3ee',
            primaryHover: '#06b6d4',
            secondary: '#c084fc',
            accent: '#4ade80',
            success: '#22c55e',
            warning: '#fbbf24',
            error: '#f87171',
            background: '#0f172a',
            backgroundSecondary: '#1e293b',
            surface: 'rgba(255, 255, 255, 0.05)',
            surfaceHover: 'rgba(255, 255, 255, 0.08)',
            text: '#f8fafc',
            textSecondary: 'rgba(248, 250, 252, 0.7)',
            textMuted: 'rgba(248, 250, 252, 0.4)',
            border: 'rgba(255, 255, 255, 0.1)',
        },
        fonts: {
            heading: 'Outfit, system-ui, sans-serif',
            body: 'Outfit, system-ui, sans-serif',
            mono: 'Fira Code, monospace',
        },
        borderRadius: 'medium',
        glassmorphism: true,
        animations: true,
        backgroundType: 'gradient',
        backgroundGradient: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
    },
    {
        id: 'minimal-light',
        name: 'Minimal Light',
        brandName: 'Home Control Center',
        colors: {
            primary: '#0ea5e9',
            primaryHover: '#0284c7',
            secondary: '#8b5cf6',
            accent: '#10b981',
            success: '#22c55e',
            warning: '#f59e0b',
            error: '#ef4444',
            background: '#ffffff',
            backgroundSecondary: '#f8fafc',
            surface: 'rgba(0, 0, 0, 0.03)',
            surfaceHover: 'rgba(0, 0, 0, 0.06)',
            text: '#0f172a',
            textSecondary: 'rgba(15, 23, 42, 0.7)',
            textMuted: 'rgba(15, 23, 42, 0.4)',
            border: 'rgba(0, 0, 0, 0.1)',
        },
        fonts: {
            heading: 'Inter, system-ui, sans-serif',
            body: 'Inter, system-ui, sans-serif',
            mono: 'SF Mono, monospace',
        },
        borderRadius: 'medium',
        glassmorphism: false,
        animations: true,
        backgroundType: 'solid',
    },
];

export const DEFAULT_THEME = PRESET_THEMES[0];
