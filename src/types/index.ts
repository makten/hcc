// Room configuration
export interface RoomConfig {
    id: string;
    name: string;
    icon: string;
    color: string;
    devices: DeviceConfig[];
    floorplanPath?: string; // SVG polygon path for the room
}

// Device types supported
export type DeviceType = 'light' | 'climate' | 'fan' | 'vacuum' | 'media_player' | 'switch' | 'sensor';

export interface DeviceConfig {
    id: string;
    entityId: string;
    name: string;
    type: DeviceType;
    icon?: string;
}

// Audio source configuration
export interface AudioSource {
    id: string;
    name: string;
    icon: string;
    entityId?: string;
}

// Audio zone configuration
export interface AudioZone {
    id: string;
    name: string;
    roomId: string;
    entityId: string;
    icon?: string;
}

// Dashboard configuration (persisted to localStorage)
export interface DashboardConfig {
    rooms: RoomConfig[];
    audioSources: AudioSource[];
    audioZones: AudioZone[];
    theme: 'dark' | 'light';
    gridLayout: 'compact' | 'comfortable';
}

// Entity state from Home Assistant
export interface EntityState {
    state: string;
    attributes: Record<string, unknown>;
    last_changed: string;
    last_updated: string;
}

// Media player specific attributes
export interface MediaPlayerAttributes {
    volume_level?: number;
    is_volume_muted?: boolean;
    media_content_type?: string;
    media_title?: string;
    media_artist?: string;
    media_album_name?: string;
    media_position?: number;
    media_duration?: number;
    source?: string;
    source_list?: string[];
    group_members?: string[];
}

// Climate specific attributes
export interface ClimateAttributes {
    current_temperature?: number;
    temperature?: number;
    target_temp_high?: number;
    target_temp_low?: number;
    hvac_action?: string;
    hvac_modes?: string[];
    fan_mode?: string;
    fan_modes?: string[];
    humidity?: number;
}

// Light specific attributes
export interface LightAttributes {
    brightness?: number;
    color_temp?: number;
    rgb_color?: [number, number, number];
    effect?: string;
    effect_list?: string[];
}

// Vacuum specific attributes
export interface VacuumAttributes {
    battery_level?: number;
    status?: string;
    fan_speed?: string;
    fan_speed_list?: string[];
}

// Fan specific attributes
export interface FanAttributes {
    percentage?: number;
    preset_mode?: string;
    preset_modes?: string[];
}
