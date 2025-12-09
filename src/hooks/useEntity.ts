import { useState, useCallback, useMemo, useEffect } from 'react';
import { EntityState, LightAttributes, ClimateAttributes, FanAttributes, VacuumAttributes, MediaPlayerAttributes } from '@/types';
import { hassApi } from '@/services';
import { useApp } from '@/context';

/**
 * Hook to get real entity state from Home Assistant
 * Falls back to default states when not connected
 */
export function useEntity(entityId: string) {
    const { config } = useApp();
    const isConnected = config.homeAssistant.connected;

    const [state, setState] = useState<EntityState>(() => createDefaultState(entityId));
    const [loading, setLoading] = useState(true);

    // Fetch state from Home Assistant
    useEffect(() => {
        if (!isConnected || !entityId) {
            setLoading(false);
            return;
        }

        const fetchState = async () => {
            try {
                const hassState = await hassApi.getState(entityId);
                if (hassState) {
                    setState({
                        state: hassState.state,
                        attributes: hassState.attributes as EntityState['attributes'],
                        last_changed: hassState.last_changed,
                        last_updated: hassState.last_updated,
                    });
                }
            } catch (error) {
                console.error(`Failed to fetch state for ${entityId}:`, error);
            } finally {
                setLoading(false);
            }
        };

        fetchState();

        // Poll for updates every 5 seconds
        const interval = setInterval(fetchState, 5000);
        return () => clearInterval(interval);
    }, [entityId, isConnected]);

    // Toggle entity
    const toggle = useCallback(async () => {
        if (!isConnected) return;
        const domain = entityId.split('.')[0];
        const newState = state.state === 'on' ? 'off' : 'on';
        try {
            await hassApi.callService(domain, newState === 'on' ? 'turn_on' : 'turn_off', entityId);
            setState(prev => ({ ...prev, state: newState }));
        } catch (error) {
            console.error('Failed to toggle entity:', error);
        }
    }, [entityId, isConnected, state.state]);

    // Turn on
    const turnOn = useCallback(async () => {
        if (!isConnected) return;
        const domain = entityId.split('.')[0];
        try {
            await hassApi.callService(domain, 'turn_on', entityId);
            setState(prev => ({ ...prev, state: 'on' }));
        } catch (error) {
            console.error('Failed to turn on entity:', error);
        }
    }, [entityId, isConnected]);

    // Turn off
    const turnOff = useCallback(async () => {
        if (!isConnected) return;
        const domain = entityId.split('.')[0];
        try {
            await hassApi.callService(domain, 'turn_off', entityId);
            setState(prev => ({ ...prev, state: 'off' }));
        } catch (error) {
            console.error('Failed to turn off entity:', error);
        }
    }, [entityId, isConnected]);

    // Set brightness
    const setBrightness = useCallback(async (brightness: number) => {
        if (!isConnected) return;
        try {
            await hassApi.callService('light', 'turn_on', entityId, { brightness });
            setState(prev => ({
                ...prev,
                state: brightness > 0 ? 'on' : 'off',
                attributes: { ...prev.attributes, brightness },
            }));
        } catch (error) {
            console.error('Failed to set brightness:', error);
        }
    }, [entityId, isConnected]);

    // Set temperature
    const setTemperature = useCallback(async (temperature: number) => {
        if (!isConnected) return;
        try {
            await hassApi.callService('climate', 'set_temperature', entityId, { temperature });
            setState(prev => ({
                ...prev,
                attributes: { ...prev.attributes, temperature },
            }));
        } catch (error) {
            console.error('Failed to set temperature:', error);
        }
    }, [entityId, isConnected]);

    // Set HVAC mode
    const setHvacMode = useCallback(async (hvac_mode: string) => {
        if (!isConnected) return;
        try {
            await hassApi.callService('climate', 'set_hvac_mode', entityId, { hvac_mode });
            setState(prev => ({ ...prev, state: hvac_mode }));
        } catch (error) {
            console.error('Failed to set HVAC mode:', error);
        }
    }, [entityId, isConnected]);

    // Set fan speed
    const setFanSpeed = useCallback(async (percentage: number) => {
        if (!isConnected) return;
        try {
            await hassApi.callService('fan', 'set_percentage', entityId, { percentage });
            setState(prev => ({
                ...prev,
                state: percentage > 0 ? 'on' : 'off',
                attributes: { ...prev.attributes, percentage },
            }));
        } catch (error) {
            console.error('Failed to set fan speed:', error);
        }
    }, [entityId, isConnected]);

    // Set volume
    const setVolume = useCallback(async (volume_level: number) => {
        if (!isConnected) return;
        try {
            await hassApi.callService('media_player', 'volume_set', entityId, { volume_level });
            setState(prev => ({
                ...prev,
                attributes: { ...prev.attributes, volume_level },
            }));
        } catch (error) {
            console.error('Failed to set volume:', error);
        }
    }, [entityId, isConnected]);

    // Media play
    const mediaPlay = useCallback(async () => {
        if (!isConnected) return;
        try {
            await hassApi.callService('media_player', 'media_play', entityId);
            setState(prev => ({ ...prev, state: 'playing' }));
        } catch (error) {
            console.error('Failed to play media:', error);
        }
    }, [entityId, isConnected]);

    // Media pause
    const mediaPause = useCallback(async () => {
        if (!isConnected) return;
        try {
            await hassApi.callService('media_player', 'media_pause', entityId);
            setState(prev => ({ ...prev, state: 'paused' }));
        } catch (error) {
            console.error('Failed to pause media:', error);
        }
    }, [entityId, isConnected]);

    // Vacuum start
    const vacuumStart = useCallback(async () => {
        if (!isConnected) return;
        try {
            await hassApi.callService('vacuum', 'start', entityId);
            setState(prev => ({
                ...prev,
                state: 'cleaning',
                attributes: { ...prev.attributes, status: 'Cleaning' },
            }));
        } catch (error) {
            console.error('Failed to start vacuum:', error);
        }
    }, [entityId, isConnected]);

    // Vacuum dock
    const vacuumDock = useCallback(async () => {
        if (!isConnected) return;
        try {
            await hassApi.callService('vacuum', 'return_to_base', entityId);
            setState(prev => ({
                ...prev,
                state: 'returning',
                attributes: { ...prev.attributes, status: 'Returning' },
            }));
        } catch (error) {
            console.error('Failed to dock vacuum:', error);
        }
    }, [entityId, isConnected]);

    return useMemo(() => ({
        state,
        entity: state,
        loading,
        isConnected,
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
    }), [
        state, loading, isConnected,
        toggle, turnOn, turnOff,
        setBrightness, setTemperature, setHvacMode,
        setFanSpeed, setVolume,
        mediaPlay, mediaPause,
        vacuumStart, vacuumDock,
    ]);
}

/**
 * Hook to get states for multiple entities (useful for room status)
 */
export function useEntityStates(entityIds: string[]): Map<string, EntityState> {
    const { config } = useApp();
    const isConnected = config.homeAssistant.connected;
    const [states, setStates] = useState<Map<string, EntityState>>(new Map());

    useEffect(() => {
        if (!isConnected || entityIds.length === 0) {
            // Set default states when not connected
            const defaultStates = new Map<string, EntityState>();
            entityIds.forEach(id => {
                defaultStates.set(id, createDefaultState(id));
            });
            setStates(defaultStates);
            return;
        }

        const fetchStates = async () => {
            try {
                const allStates = await hassApi.getStates();
                const stateMap = new Map<string, EntityState>();

                entityIds.forEach(id => {
                    const hassState = allStates.find(s => s.entity_id === id);
                    if (hassState) {
                        stateMap.set(id, {
                            state: hassState.state,
                            attributes: hassState.attributes as EntityState['attributes'],
                            last_changed: hassState.last_changed,
                            last_updated: hassState.last_updated,
                        });
                    } else {
                        stateMap.set(id, createDefaultState(id));
                    }
                });

                setStates(stateMap);
            } catch (error) {
                console.error('Failed to fetch entity states:', error);
            }
        };

        fetchStates();
        const interval = setInterval(fetchStates, 5000);
        return () => clearInterval(interval);
    }, [entityIds.join(','), isConnected]);

    return states;
}

/**
 * Create default state for an entity when not connected
 */
function createDefaultState(entityId: string): EntityState {
    const type = entityId.split('.')[0];
    const name = entityId.split('.')[1] || 'unknown';

    const friendlyName = name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    switch (type) {
        case 'light':
            return {
                state: 'unavailable',
                attributes: {
                    brightness: 0,
                    friendly_name: friendlyName,
                    color_mode: 'brightness',
                } as LightAttributes,
                last_changed: new Date().toISOString(),
                last_updated: new Date().toISOString(),
            };

        case 'climate':
            return {
                state: 'unavailable',
                attributes: {
                    current_temperature: 0,
                    temperature: 0,
                    hvac_modes: ['off', 'heat', 'cool', 'auto'],
                    hvac_action: 'off',
                    friendly_name: friendlyName,
                } as ClimateAttributes,
                last_changed: new Date().toISOString(),
                last_updated: new Date().toISOString(),
            };

        case 'fan':
            return {
                state: 'unavailable',
                attributes: {
                    percentage: 0,
                    preset_modes: ['off', 'low', 'medium', 'high'],
                    friendly_name: friendlyName,
                } as FanAttributes,
                last_changed: new Date().toISOString(),
                last_updated: new Date().toISOString(),
            };

        case 'vacuum':
            return {
                state: 'unavailable',
                attributes: {
                    battery_level: 0,
                    status: 'Unknown',
                    fan_speed: 'standard',
                    friendly_name: friendlyName,
                } as VacuumAttributes,
                last_changed: new Date().toISOString(),
                last_updated: new Date().toISOString(),
            };

        case 'media_player':
            return {
                state: 'unavailable',
                attributes: {
                    volume_level: 0,
                    friendly_name: friendlyName,
                } as MediaPlayerAttributes,
                last_changed: new Date().toISOString(),
                last_updated: new Date().toISOString(),
            };

        default:
            return {
                state: 'unavailable',
                attributes: {
                    friendly_name: friendlyName,
                },
                last_changed: new Date().toISOString(),
                last_updated: new Date().toISOString(),
            };
    }
}
