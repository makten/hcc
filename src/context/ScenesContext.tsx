import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Scene, Automation, SceneAction, AutomationTrigger, AutomationCondition } from '@/types';

const STORAGE_KEY = 'hcc-scenes';

// Input types for creating scenes/automations (without IDs which are generated internally)
type SceneInput = {
    name: string;
    icon: string;
    color: string;
    description?: string;
    actions: Omit<SceneAction, 'id'>[];
    roomId?: string;
    createdBy?: string;
};

type AutomationInput = {
    name: string;
    description?: string;
    icon: string;
    color: string;
    enabled: boolean;
    triggers: Omit<AutomationTrigger, 'id'>[];
    conditions: Omit<AutomationCondition, 'id'>[];
    actions: Omit<SceneAction, 'id'>[];
    createdBy?: string;
};

interface ScenesContextType {
    scenes: Scene[];
    automations: Automation[];
    createScene: (scene: SceneInput) => Scene;
    updateScene: (id: string, updates: Partial<SceneInput>) => void;
    deleteScene: (id: string) => void;
    activateScene: (id: string) => Promise<void>;
    deactivateScene: (id: string) => void;
    createAutomation: (automation: AutomationInput) => Automation;
    updateAutomation: (id: string, updates: Partial<AutomationInput>) => void;
    deleteAutomation: (id: string) => void;
    toggleAutomation: (id: string) => void;
    getScenesByRoom: (roomId: string) => Scene[];
}

const ScenesContext = createContext<ScenesContextType | undefined>(undefined);

const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const generateActionId = () => `a_${Math.random().toString(36).substr(2, 6)}`;
const generateTriggerId = () => `t_${Math.random().toString(36).substr(2, 6)}`;
const generateConditionId = () => `c_${Math.random().toString(36).substr(2, 6)}`;

// Initialize with some example scenes
const initialScenes: Scene[] = [
    {
        id: 'scene_movie_night',
        name: 'Movie Night',
        icon: '🎬',
        color: '#7c3aed',
        description: 'Dim lights for the perfect movie experience',
        actions: [
            { id: 'a1', entityId: 'light.living_room_main', type: 'set_brightness', value: 20 },
            { id: 'a2', entityId: 'light.living_room_lamp', type: 'turn_off' },
        ],
        roomId: 'living-room',
        isActive: false,
        createdBy: 'admin',
        createdAt: new Date().toISOString(),
    },
    {
        id: 'scene_good_morning',
        name: 'Good Morning',
        icon: '🌅',
        color: '#f59e0b',
        description: 'Wake up gently with gradual lighting',
        actions: [
            { id: 'a1', entityId: 'light.bedroom_1_main', type: 'set_brightness', value: 50 },
            { id: 'a2', entityId: 'climate.bedroom_1', type: 'set_temperature', value: 22 },
        ],
        isActive: false,
        createdBy: 'admin',
        createdAt: new Date().toISOString(),
    },
    {
        id: 'scene_away_mode',
        name: 'Away Mode',
        icon: '🔒',
        color: '#ef4444',
        description: 'Secure your home and save energy',
        actions: [
            { id: 'a1', entityId: 'group.all_lights', type: 'turn_off' },
            { id: 'a2', entityId: 'climate.living_room', type: 'set_temperature', value: 18 },
        ],
        isActive: false,
        createdBy: 'admin',
        createdAt: new Date().toISOString(),
    },
];

const initialAutomations: Automation[] = [
    {
        id: 'auto_motion_hallway',
        name: 'Hallway Motion Light',
        description: 'Turn on hallway light when motion is detected',
        icon: '💡',
        color: '#00d4ff',
        enabled: true,
        triggers: [
            { id: 't1', type: 'motion_detected', entityId: 'binary_sensor.hallway_motion' },
        ],
        conditions: [
            { id: 'c1', type: 'time_between', startTime: '18:00', endTime: '07:00' },
        ],
        actions: [
            { id: 'a1', entityId: 'light.hall_upper', type: 'turn_on' },
            { id: 'a2', entityId: 'light.hall_upper', type: 'turn_off', delay: 300000 }, // 5 min
        ],
        triggerCount: 47,
        createdBy: 'admin',
        createdAt: new Date().toISOString(),
    },
    {
        id: 'auto_sunset_lights',
        name: 'Sunset Living Room',
        description: 'Turn on living room lights at sunset',
        icon: '🌅',
        color: '#f59e0b',
        enabled: true,
        triggers: [
            { id: 't1', type: 'sunset' },
        ],
        conditions: [
            { id: 'c1', type: 'anyone_home' },
        ],
        actions: [
            { id: 'a1', entityId: 'light.living_room_main', type: 'set_brightness', value: 70 },
            { id: 'a2', entityId: 'light.living_room_lamp', type: 'turn_on' },
        ],
        triggerCount: 23,
        createdBy: 'admin',
        createdAt: new Date().toISOString(),
    },
];

export function ScenesProvider({ children }: { children: ReactNode }) {
    const [scenes, setScenes] = useState<Scene[]>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                return parsed.scenes || initialScenes;
            } catch {
                return initialScenes;
            }
        }
        return initialScenes;
    });

    const [automations, setAutomations] = useState<Automation[]>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                return parsed.automations || initialAutomations;
            } catch {
                return initialAutomations;
            }
        }
        return initialAutomations;
    });

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ scenes, automations }));
    }, [scenes, automations]);

    const createScene = useCallback((sceneData: SceneInput): Scene => {
        const newScene: Scene = {
            name: sceneData.name,
            icon: sceneData.icon,
            color: sceneData.color,
            description: sceneData.description,
            roomId: sceneData.roomId,
            createdBy: sceneData.createdBy || 'user',
            actions: sceneData.actions.map(action => ({
                ...action,
                id: generateActionId(),
            })),
            id: `scene_${generateId()}`,
            createdAt: new Date().toISOString(),
            isActive: false,
        };

        setScenes(prev => [...prev, newScene]);
        return newScene;
    }, []);

    const updateScene = useCallback((id: string, updates: Partial<SceneInput>) => {
        setScenes(prev => prev.map(s => {
            if (s.id !== id) return s;

            const updatedScene = { ...s };
            if (updates.name !== undefined) updatedScene.name = updates.name;
            if (updates.icon !== undefined) updatedScene.icon = updates.icon;
            if (updates.color !== undefined) updatedScene.color = updates.color;
            if (updates.description !== undefined) updatedScene.description = updates.description;
            if (updates.roomId !== undefined) updatedScene.roomId = updates.roomId;
            if (updates.actions !== undefined) {
                updatedScene.actions = updates.actions.map(action => ({
                    ...action,
                    id: generateActionId(),
                }));
            }
            return updatedScene;
        }));
    }, []);

    const deleteScene = useCallback((id: string) => {
        setScenes(prev => prev.filter(s => s.id !== id));
    }, []);

    const activateScene = useCallback(async (id: string): Promise<void> => {
        // In a real app, this would call Home Assistant to execute the scene actions
        setScenes(prev => prev.map(s =>
            s.id === id
                ? { ...s, isActive: true, lastTriggered: new Date().toISOString() }
                : s
        ));

        // Simulate scene execution time
        await new Promise(resolve => setTimeout(resolve, 1000));
    }, []);

    const deactivateScene = useCallback((id: string) => {
        setScenes(prev => prev.map(s =>
            s.id === id ? { ...s, isActive: false } : s
        ));
    }, []);

    const createAutomation = useCallback((automationData: AutomationInput): Automation => {
        const newAutomation: Automation = {
            name: automationData.name,
            description: automationData.description,
            icon: automationData.icon,
            color: automationData.color,
            enabled: automationData.enabled,
            createdBy: automationData.createdBy || 'user',
            triggers: automationData.triggers.map(trigger => ({
                ...trigger,
                id: generateTriggerId(),
            })),
            conditions: automationData.conditions.map(condition => ({
                ...condition,
                id: generateConditionId(),
            })),
            actions: automationData.actions.map(action => ({
                ...action,
                id: generateActionId(),
            })),
            id: `auto_${generateId()}`,
            createdAt: new Date().toISOString(),
            triggerCount: 0,
        };

        setAutomations(prev => [...prev, newAutomation]);
        return newAutomation;
    }, []);

    const updateAutomation = useCallback((id: string, updates: Partial<AutomationInput>) => {
        setAutomations(prev => prev.map(a => {
            if (a.id !== id) return a;

            const updated = { ...a };
            if (updates.name !== undefined) updated.name = updates.name;
            if (updates.description !== undefined) updated.description = updates.description;
            if (updates.icon !== undefined) updated.icon = updates.icon;
            if (updates.color !== undefined) updated.color = updates.color;
            if (updates.enabled !== undefined) updated.enabled = updates.enabled;
            if (updates.triggers !== undefined) {
                updated.triggers = updates.triggers.map(t => ({ ...t, id: generateTriggerId() }));
            }
            if (updates.conditions !== undefined) {
                updated.conditions = updates.conditions.map(c => ({ ...c, id: generateConditionId() }));
            }
            if (updates.actions !== undefined) {
                updated.actions = updates.actions.map(a => ({ ...a, id: generateActionId() }));
            }
            return updated;
        }));
    }, []);

    const deleteAutomation = useCallback((id: string) => {
        setAutomations(prev => prev.filter(a => a.id !== id));
    }, []);

    const toggleAutomation = useCallback((id: string) => {
        setAutomations(prev => prev.map(a =>
            a.id === id ? { ...a, enabled: !a.enabled } : a
        ));
    }, []);

    const getScenesByRoom = useCallback((roomId: string): Scene[] => {
        return scenes.filter(s => s.roomId === roomId || !s.roomId);
    }, [scenes]);

    return (
        <ScenesContext.Provider
            value={{
                scenes,
                automations,
                createScene,
                updateScene,
                deleteScene,
                activateScene,
                deactivateScene,
                createAutomation,
                updateAutomation,
                deleteAutomation,
                toggleAutomation,
                getScenesByRoom,
            }}
        >
            {children}
        </ScenesContext.Provider>
    );
}

export function useScenes() {
    const context = useContext(ScenesContext);
    if (context === undefined) {
        throw new Error('useScenes must be used within a ScenesProvider');
    }
    return context;
}
