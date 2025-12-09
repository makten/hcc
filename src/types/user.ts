// User roles for role-based access control
export type UserRole = 'admin' | 'user' | 'guest';

// Hashed PIN storage format
export interface HashedPinData {
    salt: string;
    hash: string;
}

// User profile
export interface UserProfile {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
    role: UserRole;
    pin?: string; // Legacy: Plain text PIN (deprecated, for migration only)
    pinHash?: HashedPinData; // Secure: Hashed PIN with salt
    biometricEnabled?: boolean; // Whether biometric auth is enabled
    biometricCredentialId?: string; // WebAuthn credential ID
    allowedRooms?: string[]; // For guests: specific rooms they can access
    preferences: UserPreferences;
    createdAt: string;
    lastLogin?: string;
}

// User-specific preferences
export interface UserPreferences {
    defaultRoom?: string;
    theme?: 'dark' | 'light' | 'auto';
    accentColor?: string;
    fontSize?: 'small' | 'medium' | 'large';
    animations?: boolean;
    notifications?: NotificationPreferences;
}

// Notification preferences
export interface NotificationPreferences {
    enabled: boolean;
    sound: boolean;
    securityAlerts: boolean;
    deviceChanges: boolean;
    energyAlerts: boolean;
}

// Role permissions
export interface RolePermissions {
    canControlDevices: boolean;
    canViewCameras: boolean;
    canEditRooms: boolean;
    canEditDevices: boolean;
    canManageUsers: boolean;
    canAccessSettings: boolean;
    canViewEnergy: boolean;
    canCreateScenes: boolean;
    canUseIntercom: boolean;
    allowedRooms: string[] | 'all';
}

// Default permissions by role
export const DEFAULT_PERMISSIONS: Record<UserRole, RolePermissions> = {
    admin: {
        canControlDevices: true,
        canViewCameras: true,
        canEditRooms: true,
        canEditDevices: true,
        canManageUsers: true,
        canAccessSettings: true,
        canViewEnergy: true,
        canCreateScenes: true,
        canUseIntercom: true,
        allowedRooms: 'all',
    },
    user: {
        canControlDevices: true,
        canViewCameras: true,
        canEditRooms: false,
        canEditDevices: false,
        canManageUsers: false,
        canAccessSettings: false,
        canViewEnergy: true,
        canCreateScenes: true,
        canUseIntercom: true,
        allowedRooms: 'all',
    },
    guest: {
        canControlDevices: true,
        canViewCameras: false,
        canEditRooms: false,
        canEditDevices: false,
        canManageUsers: false,
        canAccessSettings: false,
        canViewEnergy: false,
        canCreateScenes: false,
        canUseIntercom: false,
        allowedRooms: [], // Empty = no access, must be configured per guest
    },
};

// Auth session
export interface AuthSession {
    user: UserProfile | null;
    isAuthenticated: boolean;
    permissions: RolePermissions;
    sessionStart?: string;
}
