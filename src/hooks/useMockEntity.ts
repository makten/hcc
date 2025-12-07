import { useState, useCallback, useMemo } from 'react';
import { EntityState, LightAttributes, ClimateAttributes, FanAttributes, VacuumAttributes, MediaPlayerAttributes } from '@/types';

// Mock entity states for development
const createMockState = (entityId: string): EntityState => {
    const type = entityId.split('.')[0];
    const name = entityId.split('.')[1];

    switch (type) {
        case 'light':
            return {
                state: Math.random() > 0.5 ? 'on' : 'off',
                attributes: {
                    brightness: Math.floor(Math.random() * 255),
                    friendly_name: name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
                    color_mode: 'brightness',
                } as LightAttributes,
                last_changed: new Date().toISOString(),
                last_updated: new Date().toISOString(),
            };

        case 'climate':
            return {
                state: ['heat', 'cool', 'off', 'auto'][Math.floor(Math.random() * 4)],
                attributes: {
                    current_temperature: 20 + Math.floor(Math.random() * 8),
                    temperature: 21,
                    hvac_modes: ['off', 'heat', 'cool', 'auto'],
                    hvac_action: 'heating',
                    friendly_name: name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
                } as ClimateAttributes,
                last_changed: new Date().toISOString(),
                last_updated: new Date().toISOString(),
            };

        case 'fan':
            return {
                state: Math.random() > 0.5 ? 'on' : 'off',
                attributes: {
                    percentage: [0, 33, 66, 100][Math.floor(Math.random() * 4)],
                    preset_modes: ['off', 'low', 'medium', 'high'],
                    friendly_name: name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
                } as FanAttributes,
                last_changed: new Date().toISOString(),
                last_updated: new Date().toISOString(),
            };

        case 'vacuum':
            return {
                state: ['docked', 'cleaning', 'returning'][Math.floor(Math.random() * 3)],
                attributes: {
                    battery_level: Math.floor(Math.random() * 100),
                    status: 'Docked',
                    fan_speed: 'standard',
                    friendly_name: name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
                } as VacuumAttributes,
                last_changed: new Date().toISOString(),
                last_updated: new Date().toISOString(),
            };

        case 'media_player':
            return {
                state: ['playing', 'paused', 'idle', 'off'][Math.floor(Math.random() * 4)],
                attributes: {
                    volume_level: Math.random(),
                    media_title: 'Midnight City',
                    media_artist: 'M83',
                    source: 'Spotify',
                    source_list: ['Spotify', 'AirPlay', 'TV'],
                    friendly_name: name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
                } as MediaPlayerAttributes,
                last_changed: new Date().toISOString(),
                last_updated: new Date().toISOString(),
            };

        default:
            return {
                state: 'unknown',
                attributes: {
                    friendly_name: name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
                },
                last_changed: new Date().toISOString(),
                last_updated: new Date().toISOString(),
            };
    }
};

// Mock state store
const mockStates = new Map<string, EntityState>();

export function useMockEntity(entityId: string) {
    // Initialize mock state if not exists
    if (!mockStates.has(entityId)) {
        mockStates.set(entityId, createMockState(entityId));
    }

    const [state, setState] = useState<EntityState>(() => mockStates.get(entityId)!);

    // Toggle entity (for lights, switches, fans)
    const toggle = useCallback(() => {
        setState((prev) => {
            const newState = {
                ...prev,
                state: prev.state === 'on' ? 'off' : 'on',
                last_changed: new Date().toISOString(),
                last_updated: new Date().toISOString(),
            };
            mockStates.set(entityId, newState);
            return newState;
        });
    }, [entityId]);

    // Turn on
    const turnOn = useCallback(() => {
        setState((prev) => {
            const newState = {
                ...prev,
                state: 'on',
                last_changed: new Date().toISOString(),
                last_updated: new Date().toISOString(),
            };
            mockStates.set(entityId, newState);
            return newState;
        });
    }, [entityId]);

    // Turn off
    const turnOff = useCallback(() => {
        setState((prev) => {
            const newState = {
                ...prev,
                state: 'off',
                last_changed: new Date().toISOString(),
                last_updated: new Date().toISOString(),
            };
            mockStates.set(entityId, newState);
            return newState;
        });
    }, [entityId]);

    // Set brightness (for lights)
    const setBrightness = useCallback(
        (brightness: number) => {
            setState((prev) => {
                const newState = {
                    ...prev,
                    state: brightness > 0 ? 'on' : 'off',
                    attributes: {
                        ...prev.attributes,
                        brightness,
                    },
                    last_changed: new Date().toISOString(),
                    last_updated: new Date().toISOString(),
                };
                mockStates.set(entityId, newState);
                return newState;
            });
        },
        [entityId]
    );

    // Set temperature (for climate)
    const setTemperature = useCallback(
        (temperature: number) => {
            setState((prev) => {
                const newState = {
                    ...prev,
                    attributes: {
                        ...prev.attributes,
                        temperature,
                    },
                    last_changed: new Date().toISOString(),
                    last_updated: new Date().toISOString(),
                };
                mockStates.set(entityId, newState);
                return newState;
            });
        },
        [entityId]
    );

    // Set HVAC mode (for climate)
    const setHvacMode = useCallback(
        (mode: string) => {
            setState((prev) => {
                const newState = {
                    ...prev,
                    state: mode,
                    last_changed: new Date().toISOString(),
                    last_updated: new Date().toISOString(),
                };
                mockStates.set(entityId, newState);
                return newState;
            });
        },
        [entityId]
    );

    // Set fan speed (for fans)
    const setFanSpeed = useCallback(
        (percentage: number) => {
            setState((prev) => {
                const newState = {
                    ...prev,
                    state: percentage > 0 ? 'on' : 'off',
                    attributes: {
                        ...prev.attributes,
                        percentage,
                    },
                    last_changed: new Date().toISOString(),
                    last_updated: new Date().toISOString(),
                };
                mockStates.set(entityId, newState);
                return newState;
            });
        },
        [entityId]
    );

    // Set volume (for media players)
    const setVolume = useCallback(
        (volume_level: number) => {
            setState((prev) => {
                const newState = {
                    ...prev,
                    attributes: {
                        ...prev.attributes,
                        volume_level,
                    },
                    last_changed: new Date().toISOString(),
                    last_updated: new Date().toISOString(),
                };
                mockStates.set(entityId, newState);
                return newState;
            });
        },
        [entityId]
    );

    // Media controls
    const mediaPlay = useCallback(() => {
        setState((prev) => {
            const newState = {
                ...prev,
                state: 'playing',
                last_changed: new Date().toISOString(),
                last_updated: new Date().toISOString(),
            };
            mockStates.set(entityId, newState);
            return newState;
        });
    }, [entityId]);

    const mediaPause = useCallback(() => {
        setState((prev) => {
            const newState = {
                ...prev,
                state: 'paused',
                last_changed: new Date().toISOString(),
                last_updated: new Date().toISOString(),
            };
            mockStates.set(entityId, newState);
            return newState;
        });
    }, [entityId]);

    // Vacuum controls
    const vacuumStart = useCallback(() => {
        setState((prev) => {
            const newState = {
                ...prev,
                state: 'cleaning',
                attributes: {
                    ...prev.attributes,
                    status: 'Cleaning',
                },
                last_changed: new Date().toISOString(),
                last_updated: new Date().toISOString(),
            };
            mockStates.set(entityId, newState);
            return newState;
        });
    }, [entityId]);

    const vacuumDock = useCallback(() => {
        setState((prev) => {
            const newState = {
                ...prev,
                state: 'returning',
                attributes: {
                    ...prev.attributes,
                    status: 'Returning',
                },
                last_changed: new Date().toISOString(),
                last_updated: new Date().toISOString(),
            };
            mockStates.set(entityId, newState);
            return newState;
        });
    }, [entityId]);

    return useMemo(
        () => ({
            state,
            entity: state,
            isOn: state.state === 'on' || state.state === 'playing',
            isOff: state.state === 'off' || state.state === 'idle',
            toggle,
            turnOn,
            turnOff,
            setBrightness,
            setTemperature,
            setHvacMode,
            setFanSpeed,
            setVolume,
            mediaPlay,
            mediaPause,
            vacuumStart,
            vacuumDock,
        }),
        [
            state,
            toggle,
            turnOn,
            turnOff,
            setBrightness,
            setTemperature,
            setHvacMode,
            setFanSpeed,
            setVolume,
            mediaPlay,
            mediaPause,
            vacuumStart,
            vacuumDock,
        ]
    );
}

// Check if any light in a list is on
export function useRoomLightStatus(entityIds: string[]): boolean {
    const states = entityIds.map((id) => {
        if (!mockStates.has(id)) {
            mockStates.set(id, createMockState(id));
        }
        return mockStates.get(id)!;
    });

    return states.some(
        (state) => state.state === 'on' && state.attributes.brightness !== undefined
    );
}

// Check if any media is playing in a room
export function useRoomMediaStatus(entityIds: string[]): boolean {
    const states = entityIds.map((id) => {
        if (!mockStates.has(id)) {
            mockStates.set(id, createMockState(id));
        }
        return mockStates.get(id)!;
    });

    return states.some((state) => state.state === 'playing');
}
