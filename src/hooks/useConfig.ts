import { useState, useCallback, useEffect } from 'react';
import { DashboardConfig, RoomConfig, DeviceConfig } from '@/types';
import { defaultConfig, STORAGE_KEYS } from '@/config';

export function useConfig() {
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

    const [editMode, setEditMode] = useState(() => {
        return localStorage.getItem(STORAGE_KEYS.EDIT_MODE) === 'true';
    });

    // Persist config changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    }, [config]);

    // Persist edit mode
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.EDIT_MODE, String(editMode));
    }, [editMode]);

    // Get a specific room by ID
    const getRoom = useCallback(
        (roomId: string): RoomConfig | undefined => {
            return config.rooms.find((room) => room.id === roomId);
        },
        [config.rooms]
    );

    // Add a device to a room
    const addDevice = useCallback(
        (roomId: string, device: DeviceConfig) => {
            setConfig((prev) => ({
                ...prev,
                rooms: prev.rooms.map((room) =>
                    room.id === roomId
                        ? { ...room, devices: [...room.devices, device] }
                        : room
                ),
            }));
        },
        []
    );

    // Remove a device from a room
    const removeDevice = useCallback((roomId: string, deviceId: string) => {
        setConfig((prev) => ({
            ...prev,
            rooms: prev.rooms.map((room) =>
                room.id === roomId
                    ? { ...room, devices: room.devices.filter((d) => d.id !== deviceId) }
                    : room
            ),
        }));
    }, []);

    // Update a device in a room
    const updateDevice = useCallback(
        (roomId: string, deviceId: string, updates: Partial<DeviceConfig>) => {
            setConfig((prev) => ({
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
            }));
        },
        []
    );

    // Reset to default config
    const resetConfig = useCallback(() => {
        setConfig(defaultConfig);
        localStorage.removeItem(STORAGE_KEYS.CONFIG);
    }, []);

    // Toggle edit mode
    const toggleEditMode = useCallback(() => {
        setEditMode((prev) => !prev);
    }, []);

    return {
        config,
        setConfig,
        editMode,
        toggleEditMode,
        getRoom,
        addDevice,
        removeDevice,
        updateDevice,
        resetConfig,
    };
}
