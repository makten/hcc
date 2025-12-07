import { DashboardConfig } from '@/types';

// Default dashboard configuration matching the actual floor plan
export const defaultConfig: DashboardConfig = {
    rooms: [
        // Bedroom 1 (Master - top right)
        {
            id: 'bedroom-1',
            name: 'Bedroom 1',
            icon: 'FiMoon',
            color: '#a855f7',
            devices: [
                { id: 'br1-main-light', entityId: 'light.bedroom_1_main', name: 'Ceiling Light', type: 'light' },
                { id: 'br1-bedside-l', entityId: 'light.bedroom_1_left', name: 'Bedside Left', type: 'light' },
                { id: 'br1-bedside-r', entityId: 'light.bedroom_1_right', name: 'Bedside Right', type: 'light' },
                { id: 'br1-fan', entityId: 'fan.bedroom_1', name: 'Ceiling Fan', type: 'fan' },
                { id: 'br1-climate', entityId: 'climate.bedroom_1', name: 'AC Unit', type: 'climate' },
            ],
        },
        // Bedroom 2 (middle right)
        {
            id: 'bedroom-2',
            name: 'Bedroom 2',
            icon: 'FiMoon',
            color: '#a855f7',
            devices: [
                { id: 'br2-main-light', entityId: 'light.bedroom_2_main', name: 'Ceiling Light', type: 'light' },
                { id: 'br2-lamp', entityId: 'light.bedroom_2_lamp', name: 'Desk Lamp', type: 'light' },
                { id: 'br2-fan', entityId: 'fan.bedroom_2', name: 'Ceiling Fan', type: 'fan' },
                { id: 'br2-climate', entityId: 'climate.bedroom_2', name: 'AC Unit', type: 'climate' },
            ],
        },
        // Office
        {
            id: 'office',
            name: 'Office',
            icon: 'FiBriefcase',
            color: '#00ff88',
            devices: [
                { id: 'of-main-light', entityId: 'light.office_main', name: 'Desk Light', type: 'light' },
                { id: 'of-ambient', entityId: 'light.office_ambient', name: 'LED Strip', type: 'light' },
                { id: 'of-speaker', entityId: 'media_player.office_speaker', name: 'Office Speaker', type: 'media_player' },
                { id: 'of-climate', entityId: 'climate.office', name: 'AC Unit', type: 'climate' },
            ],
        },
        // Shower 1 (top right)
        {
            id: 'shower-1',
            name: 'Shower',
            icon: 'FiDroplet',
            color: '#06b6d4',
            devices: [
                { id: 'sh1-light', entityId: 'light.shower_1', name: 'Bathroom Light', type: 'light' },
                { id: 'sh1-fan', entityId: 'fan.shower_1', name: 'Exhaust Fan', type: 'fan' },
            ],
        },
        // Shower 2 (middle right)
        {
            id: 'shower-2',
            name: 'Shower 2',
            icon: 'FiDroplet',
            color: '#06b6d4',
            devices: [
                { id: 'sh2-light', entityId: 'light.shower_2', name: 'Bathroom Light', type: 'light' },
                { id: 'sh2-fan', entityId: 'fan.shower_2', name: 'Exhaust Fan', type: 'fan' },
            ],
        },
        // Veranda (large open area)
        {
            id: 'veranda',
            name: 'Veranda',
            icon: 'FiSun',
            color: '#fbbf24',
            devices: [
                { id: 've-main-light', entityId: 'light.veranda_main', name: 'Main Lights', type: 'light' },
                { id: 've-ambient', entityId: 'light.veranda_ambient', name: 'Ambient Lighting', type: 'light' },
                { id: 've-fan', entityId: 'fan.veranda', name: 'Ceiling Fan', type: 'fan' },
                { id: 've-speaker', entityId: 'media_player.veranda_speaker', name: 'Outdoor Speaker', type: 'media_player' },
            ],
        },
        // Living Room
        {
            id: 'living-room',
            name: 'Living Room',
            icon: 'FiHome',
            color: '#00d4ff',
            devices: [
                { id: 'lr-main-light', entityId: 'light.living_room_main', name: 'Main Light', type: 'light' },
                { id: 'lr-lamp', entityId: 'light.living_room_lamp', name: 'Floor Lamp', type: 'light' },
                { id: 'lr-tv', entityId: 'media_player.living_room_tv', name: 'Smart TV', type: 'media_player' },
                { id: 'lr-speaker', entityId: 'media_player.living_room_speaker', name: 'Soundbar', type: 'media_player' },
                { id: 'lr-climate', entityId: 'climate.living_room', name: 'AC Unit', type: 'climate' },
                { id: 'lr-fan', entityId: 'fan.living_room', name: 'Ceiling Fan', type: 'fan' },
            ],
        },
        // Kitchen
        {
            id: 'kitchen',
            name: 'Kitchen',
            icon: 'FiCoffee',
            color: '#ff6b35',
            devices: [
                { id: 'kt-main-light', entityId: 'light.kitchen_main', name: 'Main Light', type: 'light' },
                { id: 'kt-counter', entityId: 'light.kitchen_counter', name: 'Counter Lights', type: 'light' },
                { id: 'kt-speaker', entityId: 'media_player.kitchen_speaker', name: 'Kitchen Speaker', type: 'media_player' },
            ],
        },
        // Dining
        {
            id: 'dining',
            name: 'Dining',
            icon: 'FiCoffee',
            color: '#f472b6',
            devices: [
                { id: 'dn-main-light', entityId: 'light.dining_main', name: 'Chandelier', type: 'light' },
                { id: 'dn-accent', entityId: 'light.dining_accent', name: 'Accent Lights', type: 'light' },
            ],
        },
        // Kitchen Veranda
        {
            id: 'kitchen-veranda',
            name: 'K. Veranda',
            icon: 'FiSun',
            color: '#fbbf24',
            devices: [
                { id: 'kv-light', entityId: 'light.kitchen_veranda', name: 'Veranda Light', type: 'light' },
            ],
        },
        // Hall Upper
        {
            id: 'hall-upper',
            name: 'Hall',
            icon: 'FiHome',
            color: '#6b7280',
            devices: [
                { id: 'hu-light', entityId: 'light.hall_upper', name: 'Hallway Light', type: 'light' },
            ],
        },
        // Long Hallway
        {
            id: 'long-hallway',
            name: 'Long Hallway',
            icon: 'FiHome',
            color: '#6b7280',
            devices: [
                { id: 'lh-light', entityId: 'light.long_hallway', name: 'Hallway Lights', type: 'light' },
            ],
        },
        // Hall Lower (entrance)
        {
            id: 'hall-lower',
            name: 'Hall',
            icon: 'FiHome',
            color: '#6b7280',
            devices: [
                { id: 'hl-light', entityId: 'light.hall_lower', name: 'Entrance Light', type: 'light' },
            ],
        },
        // Toilet
        {
            id: 'toilet',
            name: 'Toilet',
            icon: 'FiDroplet',
            color: '#06b6d4',
            devices: [
                { id: 'to-light', entityId: 'light.toilet', name: 'Toilet Light', type: 'light' },
                { id: 'to-fan', entityId: 'fan.toilet', name: 'Exhaust Fan', type: 'fan' },
            ],
        },
        // Garage
        {
            id: 'garage',
            name: 'Garage',
            icon: 'FiTruck',
            color: '#6b7280',
            devices: [
                { id: 'gr-main-light', entityId: 'light.garage_main', name: 'Main Light', type: 'light' },
                { id: 'gr-vacuum', entityId: 'vacuum.roborock', name: 'Robot Vacuum', type: 'vacuum' },
            ],
        },
    ],
    audioSources: [
        { id: 'spotify', name: 'Spotify', icon: 'FiMusic', entityId: 'media_player.spotify' },
        { id: 'tv-audio', name: 'TV Audio', icon: 'FiTv', entityId: 'media_player.tv_audio' },
        { id: 'radio', name: 'Radio', icon: 'FiRadio', entityId: 'media_player.radio' },
        { id: 'airplay', name: 'AirPlay', icon: 'FiCast', entityId: 'media_player.airplay' },
    ],
    audioZones: [
        { id: 'zone-living', name: 'Living Room', roomId: 'living-room', entityId: 'media_player.living_room_speaker' },
        { id: 'zone-veranda', name: 'Veranda', roomId: 'veranda', entityId: 'media_player.veranda_speaker' },
        { id: 'zone-kitchen', name: 'Kitchen', roomId: 'kitchen', entityId: 'media_player.kitchen_speaker' },
        { id: 'zone-office', name: 'Office', roomId: 'office', entityId: 'media_player.office_speaker' },
    ],
    theme: 'dark',
    gridLayout: 'comfortable',
};

// Home Assistant connection config
export const haConfig = {
    // These can be overridden via environment variables
    hassUrl: import.meta.env.VITE_HASS_URL || 'http://homeassistant.local:8123',
    // For development, we'll use a mock mode
    mockMode: import.meta.env.VITE_MOCK_MODE === 'true' || true,
};

// Local storage keys
export const STORAGE_KEYS = {
    CONFIG: 'home-control-config',
    THEME: 'home-control-theme',
    EDIT_MODE: 'home-control-edit-mode',
};
