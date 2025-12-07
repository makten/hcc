import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { DashboardConfig, DeviceConfig, RoomConfig, HomeAssistantConfig } from '@/types';
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
    updateDevice: (roomId: string, deviceId: string, updates: Partial<DeviceConfig>) => void;
    addRoom: (room: RoomConfig) => void;
    updateRoom: (roomId: string, updates: Partial<RoomConfig>) => void;
    removeRoom: (roomId: string) => void;
    updateHomeAssistant: (config: Partial<HomeAssistantConfig>) => void;
    updateConfig: (updates: Partial<DashboardConfig>) => void;
    resetConfig: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to ensure homeAssistant config exists (for migration)
const migrateConfig = (stored: DashboardConfig): DashboardConfig => {
    if (!stored.homeAssistant) {
        return {
            ...stored,
            homeAssistant: defaultConfig.homeAssistant,
        };
    }
    return stored;
};

export function AppProvider({ children }: { children: ReactNode }) {
    const [config, setConfig] = useState<DashboardConfig>(() => {
        const stored = localStorage.getItem(STORAGE_KEYS.CONFIG);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                return migrateConfig(parsed);
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

    const saveConfig = useCallback((newConfig: DashboardConfig) => {
        localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(newConfig));
    }, []);

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
            saveConfig(newConfig);
            return newConfig;
        });
    }, [saveConfig]);

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
            saveConfig(newConfig);
            return newConfig;
        });
    }, [saveConfig]);

    const updateDevice = useCallback((roomId: string, deviceId: string, updates: Partial<DeviceConfig>) => {
        setConfig((prev) => {
            const newConfig = {
                ...prev,
                rooms: prev.rooms.map((room) =>
                    room.id === roomId
                        ? {
                            ...room,
                            devices: room.devices.map((d) =>
                                d.id === deviceId ? { ...d, ...updates } : d
                            ),
                        }
                        : room
                ),
            };
            saveConfig(newConfig);
            return newConfig;
        });
    }, [saveConfig]);

    const addRoom = useCallback((room: RoomConfig) => {
        setConfig((prev) => {
            const newConfig = {
                ...prev,
                rooms: [...prev.rooms, room],
            };
            saveConfig(newConfig);
            return newConfig;
        });
    }, [saveConfig]);

    const updateRoom = useCallback((roomId: string, updates: Partial<RoomConfig>) => {
        setConfig((prev) => {
            const newConfig = {
                ...prev,
                rooms: prev.rooms.map((room) =>
                    room.id === roomId ? { ...room, ...updates } : room
                ),
            };
            saveConfig(newConfig);
            return newConfig;
        });
    }, [saveConfig]);

    const removeRoom = useCallback((roomId: string) => {
        setConfig((prev) => {
            const newConfig = {
                ...prev,
                rooms: prev.rooms.filter((room) => room.id !== roomId),
            };
            saveConfig(newConfig);
            return newConfig;
        });
    }, [saveConfig]);

    const updateHomeAssistant = useCallback((haConfig: Partial<HomeAssistantConfig>) => {
        setConfig((prev) => {
            const newConfig = {
                ...prev,
                homeAssistant: {
                    ...prev.homeAssistant,
                    ...haConfig,
                },
            };
            saveConfig(newConfig);
            return newConfig;
        });
    }, [saveConfig]);

    const updateConfig = useCallback((updates: Partial<DashboardConfig>) => {
        setConfig((prev) => {
            const newConfig = { ...prev, ...updates };
            saveConfig(newConfig);
            return newConfig;
        });
    }, [saveConfig]);

    const resetConfig = useCallback(() => {
        setConfig(defaultConfig);
        saveConfig(defaultConfig);
    }, [saveConfig]);

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
                updateDevice,
                addRoom,
                updateRoom,
                removeRoom,
                updateHomeAssistant,
                updateConfig,
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
