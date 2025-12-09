import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { UserProfile, AuthSession, RolePermissions, DEFAULT_PERMISSIONS, UserPreferences, UserRole } from '@/types';
import { createPinHash, verifyPinHash } from '@/utils/crypto';

const STORAGE_KEYS = {
    USERS: 'hcc-users',
    CURRENT_USER: 'hcc-current-user',
    SESSION: 'hcc-session',
};

interface AuthContextType {
    session: AuthSession;
    users: UserProfile[];
    login: (userId: string, pin?: string) => Promise<boolean>;
    loginWithBiometric: (userId: string) => Promise<boolean>;
    logout: () => void;
    createUser: (user: Omit<UserProfile, 'id' | 'createdAt'>) => Promise<UserProfile>;
    createUserWithHashedPin: (userData: Omit<UserProfile, 'id' | 'createdAt' | 'pin' | 'pinHash'>, pin?: string) => Promise<UserProfile>;
    updateUser: (userId: string, updates: Partial<UserProfile>) => void;
    updateUserPin: (userId: string, newPin: string) => Promise<void>;
    removeUserPin: (userId: string) => void;
    deleteUser: (userId: string) => void;
    updatePreferences: (preferences: Partial<UserPreferences>) => void;
    verifyPin: (pin: string) => Promise<boolean>;
    verifyUserPin: (userId: string, pin: string) => Promise<boolean>;
    hasPermission: (permission: keyof RolePermissions) => boolean;
    canAccessRoom: (roomId: string) => boolean;
    enableBiometric: (userId: string, credentialId: string) => void;
    disableBiometric: (userId: string) => void;
    isBiometricAvailable: () => Promise<boolean>;
    updateAllowedRooms: (userId: string, roomIds: string[]) => void;
    userHasPin: (userId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Generate a unique ID
const generateId = () => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Default admin user
const DEFAULT_ADMIN: UserProfile = {
    id: 'admin',
    name: 'Administrator',
    role: 'admin',
    preferences: {
        theme: 'dark',
        accentColor: '#00d4ff',
        animations: true,
        notifications: {
            enabled: true,
            sound: true,
            securityAlerts: true,
            deviceChanges: false,
            energyAlerts: true,
        },
    },
    createdAt: new Date().toISOString(),
};

// Guest session (no login required)
const GUEST_SESSION: AuthSession = {
    user: null,
    isAuthenticated: false,
    permissions: DEFAULT_PERMISSIONS.guest,
};

export function AuthProvider({ children }: { children: ReactNode }) {
    const [users, setUsers] = useState<UserProfile[]>(() => {
        const stored = localStorage.getItem(STORAGE_KEYS.USERS);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch {
                return [DEFAULT_ADMIN];
            }
        }
        return [DEFAULT_ADMIN];
    });

    const [session, setSession] = useState<AuthSession>(() => {
        const storedSession = localStorage.getItem(STORAGE_KEYS.SESSION);
        const storedUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);

        if (storedSession && storedUserId) {
            try {
                const parsedSession = JSON.parse(storedSession);
                const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
                const userList = storedUsers ? JSON.parse(storedUsers) : [DEFAULT_ADMIN];
                const user = userList.find((u: UserProfile) => u.id === storedUserId);

                if (user) {
                    return {
                        ...parsedSession,
                        user,
                        permissions: DEFAULT_PERMISSIONS[user.role as UserRole],
                    };
                }
            } catch {
                return GUEST_SESSION;
            }
        }
        return GUEST_SESSION;
    });

    // Persist users to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }, [users]);

    // Persist session to localStorage
    useEffect(() => {
        if (session.isAuthenticated && session.user) {
            localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, session.user.id);
        } else {
            localStorage.removeItem(STORAGE_KEYS.SESSION);
            localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        }
    }, [session]);

    // Check if user has a PIN set (either legacy or hashed)
    const userHasPin = useCallback((userId: string): boolean => {
        const user = users.find(u => u.id === userId);
        if (!user) return false;
        return !!(user.pinHash || user.pin);
    }, [users]);

    // Verify PIN for a specific user
    const verifyUserPin = useCallback(async (userId: string, pin: string): Promise<boolean> => {
        const user = users.find(u => u.id === userId);
        if (!user) return false;

        // Check hashed PIN first (preferred)
        if (user.pinHash) {
            return await verifyPinHash(pin, user.pinHash);
        }

        // Fall back to legacy plain text PIN
        if (user.pin) {
            return user.pin === pin;
        }

        // No PIN set, allow access
        return true;
    }, [users]);

    const login = useCallback(async (userId: string, pin?: string): Promise<boolean> => {
        const user = users.find(u => u.id === userId);

        if (!user) {
            return false;
        }

        // Check PIN if user has one set
        const hasPin = user.pinHash || user.pin;
        if (hasPin && pin) {
            const isValidPin = await verifyUserPin(userId, pin);
            if (!isValidPin) {
                return false;
            }
        } else if (hasPin && !pin) {
            // PIN required but not provided
            return false;
        }

        // Get permissions, using custom allowedRooms for guests
        const basePermissions = DEFAULT_PERMISSIONS[user.role];
        const permissions: RolePermissions = user.role === 'guest' && user.allowedRooms
            ? { ...basePermissions, allowedRooms: user.allowedRooms }
            : basePermissions;

        const newSession: AuthSession = {
            user: { ...user, lastLogin: new Date().toISOString() },
            isAuthenticated: true,
            permissions,
            sessionStart: new Date().toISOString(),
        };

        // Update user's last login
        setUsers(prev => prev.map(u =>
            u.id === userId
                ? { ...u, lastLogin: new Date().toISOString() }
                : u
        ));

        setSession(newSession);
        return true;
    }, [users, verifyUserPin]);

    const loginWithBiometric = useCallback(async (userId: string): Promise<boolean> => {
        const user = users.find(u => u.id === userId);

        if (!user || !user.biometricEnabled || !user.biometricCredentialId) {
            return false;
        }

        // In a real implementation, you would verify the biometric credential
        // using the Web Authentication API (WebAuthn)
        // For now, we'll just check if biometric is enabled

        const basePermissions = DEFAULT_PERMISSIONS[user.role];
        const permissions: RolePermissions = user.role === 'guest' && user.allowedRooms
            ? { ...basePermissions, allowedRooms: user.allowedRooms }
            : basePermissions;

        const newSession: AuthSession = {
            user: { ...user, lastLogin: new Date().toISOString() },
            isAuthenticated: true,
            permissions,
            sessionStart: new Date().toISOString(),
        };

        setUsers(prev => prev.map(u =>
            u.id === userId
                ? { ...u, lastLogin: new Date().toISOString() }
                : u
        ));

        setSession(newSession);
        return true;
    }, [users]);

    const logout = useCallback(() => {
        setSession(GUEST_SESSION);
        localStorage.removeItem(STORAGE_KEYS.SESSION);
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }, []);

    // Legacy createUser - for backward compatibility
    const createUser = useCallback(async (userData: Omit<UserProfile, 'id' | 'createdAt'>): Promise<UserProfile> => {
        const newUser: UserProfile = {
            ...userData,
            id: generateId(),
            createdAt: new Date().toISOString(),
        };

        // If a plain text PIN is provided, hash it
        if (userData.pin) {
            const hashedPin = await createPinHash(userData.pin);
            newUser.pinHash = hashedPin;
            delete newUser.pin; // Remove plain text PIN
        }

        setUsers(prev => [...prev, newUser]);
        return newUser;
    }, []);

    // Create user with auto-hashing of PIN
    const createUserWithHashedPin = useCallback(async (
        userData: Omit<UserProfile, 'id' | 'createdAt' | 'pin' | 'pinHash'>,
        pin?: string
    ): Promise<UserProfile> => {
        const newUser: UserProfile = {
            ...userData,
            id: generateId(),
            createdAt: new Date().toISOString(),
        };

        if (pin) {
            const hashedPin = await createPinHash(pin);
            newUser.pinHash = hashedPin;
        }

        setUsers(prev => [...prev, newUser]);
        return newUser;
    }, []);

    const updateUser = useCallback((userId: string, updates: Partial<UserProfile>) => {
        setUsers(prev => prev.map(u =>
            u.id === userId ? { ...u, ...updates } : u
        ));

        // Update session if current user was updated
        if (session.user?.id === userId) {
            setSession(prev => ({
                ...prev,
                user: prev.user ? { ...prev.user, ...updates } : null,
            }));
        }
    }, [session.user?.id]);

    // Update user's PIN with hashing
    const updateUserPin = useCallback(async (userId: string, newPin: string): Promise<void> => {
        const hashedPin = await createPinHash(newPin);

        setUsers(prev => prev.map(u =>
            u.id === userId
                ? { ...u, pinHash: hashedPin, pin: undefined } // Remove legacy PIN
                : u
        ));
    }, []);

    // Remove user's PIN
    const removeUserPin = useCallback((userId: string): void => {
        setUsers(prev => prev.map(u =>
            u.id === userId
                ? { ...u, pinHash: undefined, pin: undefined }
                : u
        ));
    }, []);

    const deleteUser = useCallback((userId: string) => {
        // Prevent deleting the last admin
        const admins = users.filter(u => u.role === 'admin');
        const userToDelete = users.find(u => u.id === userId);

        if (userToDelete?.role === 'admin' && admins.length <= 1) {
            console.warn('Cannot delete the last admin user');
            return;
        }

        setUsers(prev => prev.filter(u => u.id !== userId));

        // Logout if current user was deleted
        if (session.user?.id === userId) {
            logout();
        }
    }, [users, session.user?.id, logout]);

    const updatePreferences = useCallback((preferences: Partial<UserPreferences>) => {
        if (!session.user) return;

        const updatedPreferences = {
            ...session.user.preferences,
            ...preferences,
        };

        updateUser(session.user.id, { preferences: updatedPreferences });
    }, [session.user, updateUser]);

    // Verify PIN for current session user
    const verifyPin = useCallback(async (pin: string): Promise<boolean> => {
        if (!session.user) return false;
        return verifyUserPin(session.user.id, pin);
    }, [session.user, verifyUserPin]);

    const hasPermission = useCallback((permission: keyof RolePermissions): boolean => {
        return session.permissions[permission] === true;
    }, [session.permissions]);

    const canAccessRoom = useCallback((roomId: string): boolean => {
        const allowedRooms = session.permissions.allowedRooms;
        if (allowedRooms === 'all') return true;
        return (allowedRooms as string[]).includes(roomId);
    }, [session.permissions.allowedRooms]);

    // Enable biometric authentication for a user
    const enableBiometric = useCallback((userId: string, credentialId: string) => {
        setUsers(prev => prev.map(u =>
            u.id === userId
                ? { ...u, biometricEnabled: true, biometricCredentialId: credentialId }
                : u
        ));
    }, []);

    // Disable biometric authentication for a user
    const disableBiometric = useCallback((userId: string) => {
        setUsers(prev => prev.map(u =>
            u.id === userId
                ? { ...u, biometricEnabled: false, biometricCredentialId: undefined }
                : u
        ));
    }, []);

    // Check if biometric authentication is available on this device
    const isBiometricAvailable = useCallback(async (): Promise<boolean> => {
        // Check if WebAuthn is supported
        if (!window.PublicKeyCredential) {
            return false;
        }

        try {
            // Check if platform authenticator (Face ID, Touch ID, Windows Hello) is available
            const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
            return available;
        } catch {
            return false;
        }
    }, []);

    // Update allowed rooms for a guest user
    const updateAllowedRooms = useCallback((userId: string, roomIds: string[]) => {
        setUsers(prev => prev.map(u =>
            u.id === userId
                ? { ...u, allowedRooms: roomIds }
                : u
        ));

        // Update session permissions if this is the current user
        if (session.user?.id === userId) {
            setSession(prev => ({
                ...prev,
                permissions: { ...prev.permissions, allowedRooms: roomIds },
            }));
        }
    }, [session.user?.id]);

    return (
        <AuthContext.Provider
            value={{
                session,
                users,
                login,
                loginWithBiometric,
                logout,
                createUser,
                createUserWithHashedPin,
                updateUser,
                updateUserPin,
                removeUserPin,
                deleteUser,
                updatePreferences,
                verifyPin,
                verifyUserPin,
                hasPermission,
                canAccessRoom,
                enableBiometric,
                disableBiometric,
                isBiometricAvailable,
                updateAllowedRooms,
                userHasPin,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
