// Action types for scenes
export type SceneActionType =
    | 'turn_on'
    | 'turn_off'
    | 'toggle'
    | 'set_brightness'
    | 'set_temperature'
    | 'set_color'
    | 'set_volume'
    | 'play_media'
    | 'set_hvac_mode'
    | 'delay';

// Single action within a scene
export interface SceneAction {
    id: string;
    entityId: string;
    entityName?: string;
    type: SceneActionType;
    value?: number | string | boolean;
    delay?: number; // Milliseconds to wait before this action
}

// Scene definition
export interface Scene {
    id: string;
    name: string;
    icon: string;
    color: string;
    description?: string;
    actions: SceneAction[];
    roomId?: string; // If scene is room-specific
    isActive: boolean;
    lastTriggered?: string;
    createdBy: string;
    createdAt: string;
}

// Trigger types for automations
export type AutomationTriggerType =
    | 'time'
    | 'state_change'
    | 'sunrise'
    | 'sunset'
    | 'device_on'
    | 'device_off'
    | 'motion_detected'
    | 'door_opened'
    | 'temperature_above'
    | 'temperature_below'
    | 'manual';

// Automation trigger
export interface AutomationTrigger {
    id: string;
    type: AutomationTriggerType;
    entityId?: string;
    value?: string | number;
    time?: string; // HH:MM format
    days?: number[]; // 0-6 for Sun-Sat
    config?: Record<string, string | number | boolean | undefined>; // Additional trigger configuration
}

// Condition types for automations
export type AutomationConditionType =
    | 'time_between'
    | 'day_of_week'
    | 'entity_state'
    | 'sun_position'
    | 'anyone_home'
    | 'no_one_home';

// Automation condition
export interface AutomationCondition {
    id: string;
    type: AutomationConditionType;
    entityId?: string;
    operator?: 'equals' | 'not_equals' | 'greater' | 'less';
    value?: string | number | boolean;
    startTime?: string;
    endTime?: string;
    days?: number[];
}

// Full automation rule
export interface Automation {
    id: string;
    name: string;
    description?: string;
    icon: string;
    color: string;
    enabled: boolean;
    triggers: AutomationTrigger[];
    conditions: AutomationCondition[];
    actions: SceneAction[];
    lastTriggered?: string;
    triggerCount: number;
    createdBy: string;
    createdAt: string;
}

// Preset scenes
export const PRESET_SCENES: Partial<Scene>[] = [
    {
        id: 'movie-night',
        name: 'Movie Night',
        icon: '🎬',
        color: '#7c3aed',
        description: 'Dim lights and set the perfect ambiance for watching movies',
    },
    {
        id: 'good-morning',
        name: 'Good Morning',
        icon: '🌅',
        color: '#f59e0b',
        description: 'Gradually turn on lights and adjust temperature for a gentle wake-up',
    },
    {
        id: 'away-mode',
        name: 'Away Mode',
        icon: '🔒',
        color: '#ef4444',
        description: 'Turn off all lights and set thermostats to energy-saving mode',
    },
    {
        id: 'party-mode',
        name: 'Party Mode',
        icon: '🎉',
        color: '#ec4899',
        description: 'Colorful lights and upbeat ambiance for celebrations',
    },
    {
        id: 'bedtime',
        name: 'Bedtime',
        icon: '🌙',
        color: '#6366f1',
        description: 'Dim lights, lower thermostat, and prepare for sleep',
    },
    {
        id: 'focus-mode',
        name: 'Focus Mode',
        icon: '🎯',
        color: '#10b981',
        description: 'Optimal lighting and climate for concentration and productivity',
    },
];
