import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { DashboardConfig, DeviceConfig } from '@/types';
import { defaultConfig, STORAGE_KEYS } from '@/config';

interface AppContextType {
    config: DashboardConfig;
    editMode: boolean;
    audioMatrixOpen: boolean;
    musicPlayerOpen: boolean;
    currentMediaZone: string | null;
    toggleEditMode: () => void;
    openAudioMatrix: () => void;
    closeAudioMatrix: () => void;
    openMusicPlayer: () => void;
    closeMusicPlayer: () => void;
    setCurrentMediaZone: (zoneId: string | null) => void;
    addDeviceToRoom: (roomId: string, device: DeviceConfig) => void;
    removeDeviceFromRoom: (roomId: string, deviceId: string) => void;
    resetConfig: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const [config, setConfig] = useState<DashboardConfig>(() => {
        const stored = localStorage.getItem(STORAGE_KEYS.CONFIG);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch {
                return defaultConfig;
            }
        }
        return defaultConfig;
    });

    const [editMode, setEditMode] = useState(false);
    const [audioMatrixOpen, setAudioMatrixOpen] = useState(false);
    const [musicPlayerOpen, setMusicPlayerOpen] = useState(false);
    const [currentMediaZone, setCurrentMediaZone] = useState<string | null>(null);

    const toggleEditMode = useCallback(() => {
        setEditMode((prev) => !prev);
    }, []);

    const openAudioMatrix = useCallback(() => {
        setAudioMatrixOpen(true);
    }, []);

    const closeAudioMatrix = useCallback(() => {
        setAudioMatrixOpen(false);
    }, []);

    const openMusicPlayer = useCallback(() => {
        setMusicPlayerOpen(true);
    }, []);

    const closeMusicPlayer = useCallback(() => {
        setMusicPlayerOpen(false);
    }, []);

    const addDeviceToRoom = useCallback((roomId: string, device: DeviceConfig) => {
        setConfig((prev) => {
            const newConfig = {
                ...prev,
                rooms: prev.rooms.map((room) =>
                    room.id === roomId
                        ? { ...room, devices: [...room.devices, device] }
                        : room
                ),
            };
            localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(newConfig));
            return newConfig;
        });
    }, []);

    const removeDeviceFromRoom = useCallback((roomId: string, deviceId: string) => {
        setConfig((prev) => {
            const newConfig = {
                ...prev,
                rooms: prev.rooms.map((room) =>
                    room.id === roomId
                        ? { ...room, devices: room.devices.filter((d) => d.id !== deviceId) }
                        : room
                ),
            };
            localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(newConfig));
            return newConfig;
        });
    }, []);

    const resetConfig = useCallback(() => {
        setConfig(defaultConfig);
        localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(defaultConfig));
    }, []);

    return (
        <AppContext.Provider
            value={{
                config,
                editMode,
                audioMatrixOpen,
                musicPlayerOpen,
                currentMediaZone,
                toggleEditMode,
                openAudioMatrix,
                closeAudioMatrix,
                openMusicPlayer,
                closeMusicPlayer,
                setCurrentMediaZone,
                addDeviceToRoom,
                removeDeviceFromRoom,
                resetConfig,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}
