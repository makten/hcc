import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLock, FiArrowRight, FiPlus, FiShield, FiUsers, FiEye, FiCheck, FiSmartphone } from 'react-icons/fi';
import { useAuth } from '@/context';
import { UserRole } from '@/types';
import { isBiometricAvailable, authenticateWithBiometric, getBiometricType, getBiometricTypeName } from '@/utils/biometric';

const ROLE_COLORS: Record<UserRole, string> = {
    admin: '#ef4444',
    user: '#00d4ff',
    guest: '#6b7280',
};

const ROLE_ICONS: Record<UserRole, string> = {
    admin: '👑',
    user: '👤',
    guest: '👋',
};

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
    admin: 'Full access to all settings and controls',
    user: 'Can control devices and view cameras',
    guest: 'Limited access to specified rooms',
};

export function LoginPage({ onLogin }: { onLogin: () => void }) {
    const { users, login, loginWithBiometric, createUser, userHasPin } = useAuth();
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [showAddUser, setShowAddUser] = useState(false);
    const [biometricAvailable, setBiometricAvailable] = useState(false);
    const [biometricType, setBiometricType] = useState<'face' | 'fingerprint' | 'unknown' | 'none'>('none');
    const [biometricLoading, setBiometricLoading] = useState(false);

    // New user form state
    const [newUserName, setNewUserName] = useState('');
    const [newUserRole, setNewUserRole] = useState<UserRole>('user');
    const [newUserPin, setNewUserPin] = useState('');
    const [newUserConfirmPin, setNewUserConfirmPin] = useState('');
    const [showPinSetup, setShowPinSetup] = useState(false);

    // Check biometric availability on mount
    useEffect(() => {
        const checkBiometric = async () => {
            const available = await isBiometricAvailable();
            setBiometricAvailable(available);
            if (available) {
                const type = await getBiometricType();
                setBiometricType(type);
            }
        };
        checkBiometric();
    }, []);

    const handleLogin = async (pinOverride?: string) => {
        if (!selectedUserId) return;

        const pinToUse = pinOverride ?? pin;
        const success = await login(selectedUserId, pinToUse);
        if (success) {
            onLogin();
        } else {
            setError('Invalid PIN');
            setPin('');
        }
    };

    const handleBiometricLogin = async (userId: string) => {
        const user = users.find(u => u.id === userId);
        if (!user?.biometricEnabled || !user?.biometricCredentialId) return;

        setBiometricLoading(true);
        try {
            const authenticated = await authenticateWithBiometric(user.biometricCredentialId);
            if (authenticated) {
                const success = await loginWithBiometric(userId);
                if (success) {
                    onLogin();
                }
            }
        } catch (err) {
            setError('Biometric authentication failed');
        } finally {
            setBiometricLoading(false);
        }
    };

    const handleQuickLogin = async (userId: string) => {
        const user = users.find(u => u.id === userId);
        const hasPin = userHasPin(userId);

        // Check if user has biometric enabled - offer quick biometric login
        if (user?.biometricEnabled && biometricAvailable) {
            await handleBiometricLogin(userId);
            return;
        }

        if (!hasPin) {
            const success = await login(userId);
            if (success) {
                onLogin();
            }
        } else {
            setSelectedUserId(userId);
        }
    };

    const handleCreateUser = async () => {
        if (!newUserName.trim()) {
            setError('Name is required');
            return;
        }

        if (showPinSetup && newUserPin) {
            if (newUserPin.length !== 4) {
                setError('PIN must be exactly 4 digits');
                return;
            }
            if (newUserPin !== newUserConfirmPin) {
                setError('PINs do not match');
                return;
            }
        }

        await createUser({
            name: newUserName,
            role: newUserRole,
            pin: showPinSetup && newUserPin ? newUserPin : undefined,
            preferences: {
                theme: 'dark',
                animations: true,
                notifications: {
                    enabled: true,
                    sound: true,
                    securityAlerts: true,
                    deviceChanges: false,
                    energyAlerts: true,
                },
            },
        });

        // Reset form
        setNewUserName('');
        setNewUserRole('user');
        setNewUserPin('');
        setNewUserConfirmPin('');
        setShowPinSetup(false);
        setShowAddUser(false);
        setError('');
    };

    const handleContinueAsGuest = async () => {
        onLogin();
    };

    const resetForm = () => {
        setNewUserName('');
        setNewUserRole('user');
        setNewUserPin('');
        setNewUserConfirmPin('');
        setShowPinSetup(false);
        setError('');
        setShowAddUser(false);
    };

    return (
        <div className="min-h-screen bg-[#0a0e14] flex items-center justify-center p-4">
            {/* Animated background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-full max-w-lg"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="inline-flex items-center gap-3 mb-4"
                    >
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center">
                            <FiShield className="text-white text-2xl" />
                        </div>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-3xl font-bold text-white mb-2"
                    >
                        Home Control Center
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-white/50"
                    >
                        Select your profile to continue
                    </motion.p>
                </div>

                {/* User selection */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-[#131720] rounded-3xl border border-white/10 p-6 backdrop-blur-xl"
                >
                    <AnimatePresence mode="wait">
                        {!selectedUserId && !showAddUser ? (
                            <motion.div
                                key="user-list"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-3"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <FiUsers size={18} />
                                        Who's using?
                                    </h2>
                                    <button
                                        onClick={() => setShowAddUser(true)}
                                        className="p-2 rounded-xl bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                                        title="Add new user"
                                    >
                                        <FiPlus size={18} />
                                    </button>
                                </div>

                                {users.map((user, index) => {
                                    const hasPin = userHasPin(user.id);
                                    return (
                                        <motion.button
                                            key={user.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 * index }}
                                            onClick={() => handleQuickLogin(user.id)}
                                            disabled={biometricLoading}
                                            className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:bg-white/10 transition-all flex items-center gap-4 group disabled:opacity-50"
                                        >
                                            <div
                                                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                                                style={{ backgroundColor: `${ROLE_COLORS[user.role]}20` }}
                                            >
                                                {user.avatar || ROLE_ICONS[user.role]}
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="text-white font-medium">{user.name}</p>
                                                <p className="text-xs text-white/40 capitalize flex items-center gap-1 flex-wrap">
                                                    <span
                                                        className="w-2 h-2 rounded-full"
                                                        style={{ backgroundColor: ROLE_COLORS[user.role] }}
                                                    />
                                                    {user.role}
                                                    {hasPin && (
                                                        <span className="flex items-center gap-0.5 text-amber-400/60 ml-2">
                                                            <FiLock size={10} />
                                                            PIN protected
                                                        </span>
                                                    )}
                                                    {user.biometricEnabled && (
                                                        <span className="flex items-center gap-0.5 text-green-400/60 ml-2">
                                                            <FiSmartphone size={10} />
                                                            {getBiometricTypeName(biometricType)}
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                            <FiArrowRight className="text-white/30 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                                        </motion.button>
                                    );
                                })}

                                {/* Guest login */}
                                <motion.button
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * users.length }}
                                    onClick={handleContinueAsGuest}
                                    className="w-full p-4 rounded-2xl border border-dashed border-white/20 hover:border-white/40 hover:bg-white/5 transition-all flex items-center gap-4 group"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl">
                                        <FiEye className="text-white/40" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="text-white/60 font-medium">Continue as Guest</p>
                                        <p className="text-xs text-white/30">Limited access</p>
                                    </div>
                                    <FiArrowRight className="text-white/20 group-hover:text-white/40 group-hover:translate-x-1 transition-all" />
                                </motion.button>
                            </motion.div>
                        ) : showAddUser ? (
                            <motion.div
                                key="add-user"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-4"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={resetForm}
                                            className="p-2 rounded-xl bg-white/5 text-white/60 hover:text-white"
                                        >
                                            <FiArrowRight className="rotate-180" size={18} />
                                        </button>
                                        <h2 className="text-lg font-semibold text-white">Add New User</h2>
                                    </div>
                                </div>

                                {/* Name input */}
                                <div>
                                    <label className="block text-sm text-white/50 mb-2">Name</label>
                                    <input
                                        type="text"
                                        value={newUserName}
                                        onChange={(e) => setNewUserName(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-cyan-500/50 focus:outline-none"
                                        placeholder="Enter name"
                                    />
                                </div>

                                {/* Role selection */}
                                <div>
                                    <label className="block text-sm text-white/50 mb-2">Role</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(['admin', 'user', 'guest'] as UserRole[]).map((role) => (
                                            <button
                                                key={role}
                                                onClick={() => setNewUserRole(role)}
                                                className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-2 ${newUserRole === role
                                                    ? 'border-cyan-500/50 bg-cyan-500/10'
                                                    : 'border-white/10 bg-white/5 hover:border-white/20'
                                                    }`}
                                            >
                                                <span className="text-2xl">{ROLE_ICONS[role]}</span>
                                                <span className="text-xs text-white/60 capitalize">{role}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-white/30 mt-2">{ROLE_DESCRIPTIONS[newUserRole]}</p>
                                </div>

                                {/* PIN Setup Toggle */}
                                <button
                                    onClick={() => setShowPinSetup(!showPinSetup)}
                                    className={`w-full p-3 rounded-xl border transition-all flex items-center justify-between ${showPinSetup
                                        ? 'border-cyan-500/50 bg-cyan-500/10'
                                        : 'border-white/10 bg-white/5 hover:border-white/20'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <FiLock className={showPinSetup ? 'text-cyan-400' : 'text-white/40'} />
                                        <span className="text-white/80">Set up a PIN</span>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${showPinSetup
                                        ? 'border-cyan-500 bg-cyan-500'
                                        : 'border-white/20'
                                        }`}>
                                        {showPinSetup && <FiCheck size={14} className="text-white" />}
                                    </div>
                                </button>

                                {/* PIN Input (collapsible) */}
                                <AnimatePresence>
                                    {showPinSetup && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-sm text-white/50 mb-2">PIN</label>
                                                    <input
                                                        type="password"
                                                        value={newUserPin}
                                                        onChange={(e) => {
                                                            if (/^\d*$/.test(e.target.value) && e.target.value.length <= 4) {
                                                                setNewUserPin(e.target.value);
                                                            }
                                                        }}
                                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-center text-xl tracking-widest placeholder-white/30 focus:border-cyan-500/50 focus:outline-none"
                                                        placeholder="••••"
                                                        maxLength={4}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-white/50 mb-2">Confirm PIN</label>
                                                    <input
                                                        type="password"
                                                        value={newUserConfirmPin}
                                                        onChange={(e) => {
                                                            if (/^\d*$/.test(e.target.value) && e.target.value.length <= 4) {
                                                                setNewUserConfirmPin(e.target.value);
                                                            }
                                                        }}
                                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-center text-xl tracking-widest placeholder-white/30 focus:border-cyan-500/50 focus:outline-none"
                                                        placeholder="••••"
                                                        maxLength={4}
                                                    />
                                                </div>
                                            </div>
                                            <p className="text-xs text-white/30 mt-2">
                                                🔒 PINs are securely hashed using PBKDF2-SHA256
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Error message */}
                                {error && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-red-400 text-sm text-center"
                                    >
                                        {error}
                                    </motion.p>
                                )}

                                {/* Submit button */}
                                <button
                                    onClick={handleCreateUser}
                                    disabled={!newUserName.trim()}
                                    className="w-full py-3 rounded-xl bg-cyan-500 text-white font-medium hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <FiPlus size={18} />
                                    Create User
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="pin-entry"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-4"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => {
                                                setSelectedUserId(null);
                                                setPin('');
                                                setError('');
                                            }}
                                            className="p-2 rounded-xl bg-white/5 text-white/60 hover:text-white"
                                        >
                                            <FiArrowRight className="rotate-180" size={18} />
                                        </button>
                                        <h2 className="text-lg font-semibold text-white">Enter PIN</h2>
                                    </div>
                                </div>

                                {/* Selected user info */}
                                {(() => {
                                    const user = users.find(u => u.id === selectedUserId);
                                    if (!user) return null;
                                    return (
                                        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
                                            <div
                                                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                                                style={{ backgroundColor: `${ROLE_COLORS[user.role]}20` }}
                                            >
                                                {user.avatar || ROLE_ICONS[user.role]}
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{user.name}</p>
                                                <p className="text-xs text-white/40 capitalize">{user.role}</p>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* PIN input boxes */}
                                <div className="flex justify-center gap-3 mb-4">
                                    {[0, 1, 2, 3].map((index) => (
                                        <input
                                            key={index}
                                            type="password"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={pin[index] || ''}
                                            onChange={(e) => {
                                                if (/^\d*$/.test(e.target.value)) {
                                                    const newPin = pin.split('');
                                                    newPin[index] = e.target.value;
                                                    const updatedPin = newPin.join('').slice(0, 4);
                                                    setPin(updatedPin);
                                                    setError('');

                                                    // Move to next input
                                                    if (e.target.value && index < 3) {
                                                        const nextInput = e.target.parentElement?.children[index + 1] as HTMLInputElement;
                                                        nextInput?.focus();
                                                    }

                                                    // Auto-submit when 4 digits entered
                                                    if (updatedPin.length === 4) {
                                                        setTimeout(() => handleLogin(updatedPin), 100);
                                                    }
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Backspace' && !pin[index] && index > 0) {
                                                    const prevInput = (e.target as HTMLElement).parentElement?.children[index - 1] as HTMLInputElement;
                                                    prevInput?.focus();
                                                }
                                                if (e.key === 'Enter') {
                                                    handleLogin();
                                                }
                                            }}
                                            className={`w-14 h-14 rounded-xl bg-white/5 border text-center text-2xl text-white font-bold focus:outline-none transition-colors ${error ? 'border-red-500/50' : 'border-white/10 focus:border-cyan-500/50'
                                                }`}
                                            autoFocus={index === 0}
                                        />
                                    ))}
                                </div>
                                {error && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-red-400 text-sm text-center"
                                    >
                                        {error}
                                    </motion.p>
                                )}

                                <button
                                    onClick={() => handleLogin()}
                                    disabled={pin.length !== 4}
                                    className="w-full py-3 rounded-xl bg-cyan-500 text-white font-medium hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <FiLock size={18} />
                                    Unlock
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Footer */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-center text-white/30 text-sm mt-6"
                >
                    Smart Home Dashboard v1.0
                </motion.p>
            </motion.div>
        </div>
    );
}

export default LoginPage;
