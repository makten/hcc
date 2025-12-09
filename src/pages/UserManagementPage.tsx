import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiUsers,
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiShield,
    FiLock,
    FiUnlock,
    FiX,
    FiCheck,
    FiAlertTriangle,
    FiUser,
    FiStar,
    FiEye,
    FiHome,
    FiSmartphone,
} from 'react-icons/fi';
import { useAuth, useApp } from '@/context';
import { RestrictedAccess } from '@/components/auth';
import { UserRole, DEFAULT_PERMISSIONS, UserProfile } from '@/types';
import { isBiometricAvailable, getBiometricType, getBiometricTypeName, registerBiometric } from '@/utils/biometric';

const ROLE_CONFIG: Record<UserRole, { icon: React.ReactNode; color: string; label: string; description: string }> = {
    admin: {
        icon: <FiStar className="text-amber-400" />,
        color: '#f59e0b',
        label: 'Administrator',
        description: 'Full access to all features and settings',
    },
    user: {
        icon: <FiUser className="text-cyan-400" />,
        color: '#00d4ff',
        label: 'Family Member',
        description: 'Can control devices and view cameras',
    },
    guest: {
        icon: <FiEye className="text-gray-400" />,
        color: '#6b7280',
        label: 'Guest',
        description: 'Limited access to specified rooms only',
    },
};

export function UserManagementPage() {
    const { users, createUser, updateUser, updateUserPin, removeUserPin, deleteUser, session, updateAllowedRooms, enableBiometric, disableBiometric, userHasPin } = useAuth();
    const { config } = useApp();
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [showRoomModal, setShowRoomModal] = useState<string | null>(null);
    const [biometricAvailable, setBiometricAvailable] = useState(false);
    const [biometricType, setBiometricType] = useState<'face' | 'fingerprint' | 'unknown' | 'none'>('none');
    const [biometricLoading, setBiometricLoading] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'user' as UserRole,
        pin: '',
        confirmPin: '',
        avatar: '',
        allowedRooms: [] as string[],
    });
    const [formError, setFormError] = useState('');

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

    const openCreateModal = () => {
        setFormData({
            name: '',
            email: '',
            role: 'user',
            pin: '',
            confirmPin: '',
            avatar: '',
            allowedRooms: [],
        });
        setEditingUser(null);
        setFormError('');
        setShowModal(true);
    };

    const openEditModal = (userId: string) => {
        const user = users.find(u => u.id === userId);
        if (user) {
            setFormData({
                name: user.name,
                email: user.email || '',
                role: user.role,
                pin: '',
                confirmPin: '',
                avatar: user.avatar || '',
                allowedRooms: user.allowedRooms || [],
            });
            setEditingUser(userId);
            setFormError('');
            setShowModal(true);
        }
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            setFormError('Name is required');
            return;
        }

        if (formData.pin && formData.pin !== formData.confirmPin) {
            setFormError('PINs do not match');
            return;
        }

        if (formData.pin && formData.pin.length !== 4) {
            setFormError('PIN must be exactly 4 digits');
            return;
        }

        if (editingUser) {
            const updates: Partial<UserProfile> = {
                name: formData.name,
                email: formData.email || undefined,
                role: formData.role,
                avatar: formData.avatar || undefined,
            };

            // Update allowed rooms for guests
            if (formData.role === 'guest') {
                updates.allowedRooms = formData.allowedRooms;
            }

            updateUser(editingUser, updates);

            // Update PIN separately (uses hashing)
            if (formData.pin) {
                await updateUserPin(editingUser, formData.pin);
            }
        } else {
            await createUser({
                name: formData.name,
                email: formData.email || undefined,
                role: formData.role,
                pin: formData.pin || undefined,
                avatar: formData.avatar || undefined,
                allowedRooms: formData.role === 'guest' ? formData.allowedRooms : undefined,
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
        }

        setShowModal(false);
    };

    const handleDelete = (userId: string) => {
        deleteUser(userId);
        setShowDeleteConfirm(null);
    };

    const handleRoomToggle = (roomId: string) => {
        setFormData(prev => ({
            ...prev,
            allowedRooms: prev.allowedRooms.includes(roomId)
                ? prev.allowedRooms.filter(id => id !== roomId)
                : [...prev.allowedRooms, roomId],
        }));
    };

    const handleSaveRooms = (userId: string) => {
        const user = users.find(u => u.id === userId);
        if (user) {
            updateAllowedRooms(userId, formData.allowedRooms);
        }
        setShowRoomModal(null);
    };

    const openRoomModal = (userId: string) => {
        const user = users.find(u => u.id === userId);
        if (user) {
            setFormData(prev => ({
                ...prev,
                allowedRooms: user.allowedRooms || [],
            }));
            setShowRoomModal(userId);
        }
    };

    const handleEnableBiometric = async (userId: string) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;

        setBiometricLoading(userId);
        try {
            const result = await registerBiometric(userId, user.name);
            if (result) {
                enableBiometric(userId, result.credentialId);
            }
        } catch (error) {
            console.error('Failed to register biometric:', error);
        } finally {
            setBiometricLoading(null);
        }
    };

    const handleDisableBiometric = (userId: string) => {
        disableBiometric(userId);
    };

    const handleRemovePin = (userId: string) => {
        removeUserPin(userId);
    };

    const formatLastLogin = (lastLogin?: string) => {
        if (!lastLogin) return 'Never';
        const date = new Date(lastLogin);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <RestrictedAccess permission="canManageUsers" fallbackMessage="Only administrators can manage users.">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                            <FiUsers className="text-cyan-400" />
                            User Management
                        </h1>
                        <p className="text-white/50">Manage family members and guest access</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={openCreateModal}
                        className="px-4 py-3 rounded-xl bg-cyan-500 text-white font-medium hover:bg-cyan-600 transition-colors flex items-center gap-2"
                    >
                        <FiPlus size={18} />
                        Add User
                    </motion.button>
                </div>

                {/* Biometric Status Banner */}
                {biometricAvailable && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center gap-3"
                    >
                        <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <FiSmartphone className="text-green-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-green-400 font-medium">{getBiometricTypeName(biometricType)} Available</p>
                            <p className="text-sm text-white/50">Users can enable biometric authentication for quick access</p>
                        </div>
                    </motion.div>
                )}

                {/* Role Legend */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(Object.entries(ROLE_CONFIG) as [UserRole, typeof ROLE_CONFIG.admin][]).map(([role, config]) => (
                        <div
                            key={role}
                            className="p-4 rounded-xl bg-white/5 border border-white/10"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: `${config.color}20` }}
                                >
                                    {config.icon}
                                </div>
                                <div>
                                    <p className="text-white font-medium">{config.label}</p>
                                    <p className="text-xs text-white/40 capitalize">{role}</p>
                                </div>
                            </div>
                            <p className="text-sm text-white/50">{config.description}</p>
                        </div>
                    ))}
                </div>

                {/* Users List */}
                <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-white">All Users ({users.length})</h2>
                    {users.map((user, index) => {
                        const roleConfig = ROLE_CONFIG[user.role];
                        const isCurrentUser = session.user?.id === user.id;
                        const isOnlyAdmin = user.role === 'admin' && users.filter(u => u.role === 'admin').length === 1;
                        const hasPin = userHasPin(user.id);

                        return (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`p-4 rounded-2xl border transition-all ${isCurrentUser
                                    ? 'bg-cyan-500/10 border-cyan-500/30'
                                    : 'bg-white/5 border-white/10'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    {/* Avatar */}
                                    <div
                                        className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                                        style={{ backgroundColor: `${roleConfig.color}20` }}
                                    >
                                        {user.avatar || roleConfig.icon}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-white font-semibold">{user.name}</p>
                                            {isCurrentUser && (
                                                <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded-full">
                                                    You
                                                </span>
                                            )}
                                            {hasPin ? (
                                                <span className="flex items-center gap-1 text-amber-400/60 text-xs">
                                                    <FiLock size={10} /> PIN Set
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-white/30 text-xs">
                                                    <FiUnlock size={10} /> No PIN
                                                </span>
                                            )}
                                            {user.biometricEnabled && (
                                                <span className="flex items-center gap-1 text-green-400/60 text-xs">
                                                    <FiSmartphone size={10} /> {getBiometricTypeName(biometricType)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                                            <span
                                                className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs"
                                                style={{
                                                    backgroundColor: `${roleConfig.color}20`,
                                                    color: roleConfig.color,
                                                }}
                                            >
                                                <FiShield size={10} />
                                                {roleConfig.label}
                                            </span>
                                            {user.email && (
                                                <span className="text-xs text-white/40">{user.email}</span>
                                            )}
                                            {user.role === 'guest' && user.allowedRooms && (
                                                <span className="text-xs text-purple-400/60">
                                                    {user.allowedRooms.length} room{user.allowedRooms.length !== 1 ? 's' : ''} access
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="text-right">
                                        <p className="text-xs text-white/40">Last login</p>
                                        <p className="text-sm text-white/60">{formatLastLogin(user.lastLogin)}</p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        {/* Room Access Button (for guests) */}
                                        {user.role === 'guest' && (
                                            <button
                                                onClick={() => openRoomModal(user.id)}
                                                className="p-2 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors"
                                                title="Manage room access"
                                            >
                                                <FiHome size={18} />
                                            </button>
                                        )}
                                        {/* Biometric Toggle */}
                                        {biometricAvailable && (
                                            <button
                                                onClick={() => user.biometricEnabled
                                                    ? handleDisableBiometric(user.id)
                                                    : handleEnableBiometric(user.id)
                                                }
                                                disabled={biometricLoading === user.id}
                                                className={`p-2 rounded-xl transition-colors ${user.biometricEnabled
                                                    ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                                                    : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'
                                                    } ${biometricLoading === user.id ? 'opacity-50' : ''}`}
                                                title={user.biometricEnabled ? 'Disable biometric' : 'Enable biometric'}
                                            >
                                                <FiSmartphone size={18} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => openEditModal(user.id)}
                                            className="p-2 rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                                        >
                                            <FiEdit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => setShowDeleteConfirm(user.id)}
                                            disabled={isOnlyAdmin}
                                            className="p-2 rounded-xl bg-white/5 text-red-400/40 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                            title={isOnlyAdmin ? 'Cannot delete the only admin' : 'Delete user'}
                                        >
                                            <FiTrash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Permissions preview */}
                                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/5">
                                    {Object.entries(DEFAULT_PERMISSIONS[user.role])
                                        .filter(([, value]) => value === true)
                                        .slice(0, 5)
                                        .map(([perm]) => (
                                            <span
                                                key={perm}
                                                className="px-2 py-1 bg-white/5 rounded-lg text-xs text-white/40"
                                            >
                                                {perm.replace(/can|([A-Z])/g, ' $1').trim()}
                                            </span>
                                        ))}
                                    {hasPin && (
                                        <button
                                            onClick={() => handleRemovePin(user.id)}
                                            className="px-2 py-1 bg-red-500/10 text-red-400/60 rounded-lg text-xs hover:bg-red-500/20 hover:text-red-400 transition-colors"
                                        >
                                            Remove PIN
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Create/Edit Modal */}
                <AnimatePresence>
                    {showModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                            onClick={() => setShowModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-[#131720] border border-white/10 p-6"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-white">
                                        {editingUser ? 'Edit User' : 'Add New User'}
                                    </h2>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="p-2 rounded-xl bg-white/5 text-white/40 hover:text-white"
                                    >
                                        <FiX size={20} />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm text-white/50 mb-2">Name *</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-cyan-500/50 focus:outline-none"
                                            placeholder="Enter name"
                                        />
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm text-white/50 mb-2">Email (optional)</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-cyan-500/50 focus:outline-none"
                                            placeholder="user@example.com"
                                        />
                                    </div>

                                    {/* Role */}
                                    <div>
                                        <label className="block text-sm text-white/50 mb-2">Role</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {(Object.entries(ROLE_CONFIG) as [UserRole, typeof ROLE_CONFIG.admin][]).map(([role, config]) => (
                                                <button
                                                    key={role}
                                                    onClick={() => setFormData(prev => ({ ...prev, role }))}
                                                    className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-2 ${formData.role === role
                                                        ? 'border-cyan-500/50 bg-cyan-500/10'
                                                        : 'border-white/10 bg-white/5 hover:border-white/20'
                                                        }`}
                                                >
                                                    <div
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                                                        style={{ backgroundColor: `${config.color}20` }}
                                                    >
                                                        {config.icon}
                                                    </div>
                                                    <span className="text-xs text-white/60">{config.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Guest Room Access */}
                                    {formData.role === 'guest' && (
                                        <div>
                                            <label className="block text-sm text-white/50 mb-2">
                                                Allowed Rooms
                                            </label>
                                            <p className="text-xs text-white/30 mb-3">
                                                Select which rooms this guest can access
                                            </p>
                                            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                                                {config.rooms.map(room => (
                                                    <button
                                                        key={room.id}
                                                        onClick={() => handleRoomToggle(room.id)}
                                                        className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2 ${formData.allowedRooms.includes(room.id)
                                                            ? 'border-purple-500/50 bg-purple-500/10'
                                                            : 'border-white/10 bg-white/5 hover:border-white/20'
                                                            }`}
                                                    >
                                                        <div
                                                            className="w-6 h-6 rounded flex items-center justify-center text-sm"
                                                            style={{ backgroundColor: room.color + '40' }}
                                                        >
                                                            {room.icon}
                                                        </div>
                                                        <span className="text-xs text-white/80">{room.name}</span>
                                                        {formData.allowedRooms.includes(room.id) && (
                                                            <FiCheck className="ml-auto text-purple-400" size={14} />
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                            {config.rooms.length === 0 && (
                                                <p className="text-center text-white/30 py-4 text-sm">
                                                    No rooms configured yet
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* PIN */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm text-white/50 mb-2">
                                                {editingUser ? 'New PIN (leave blank to keep)' : 'PIN (optional)'}
                                            </label>
                                            <input
                                                type="password"
                                                value={formData.pin}
                                                onChange={(e) => {
                                                    if (/^\d*$/.test(e.target.value) && e.target.value.length <= 4) {
                                                        setFormData(prev => ({ ...prev, pin: e.target.value }));
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
                                                value={formData.confirmPin}
                                                onChange={(e) => {
                                                    if (/^\d*$/.test(e.target.value) && e.target.value.length <= 4) {
                                                        setFormData(prev => ({ ...prev, confirmPin: e.target.value }));
                                                    }
                                                }}
                                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-center text-xl tracking-widest placeholder-white/30 focus:border-cyan-500/50 focus:outline-none"
                                                placeholder="••••"
                                                maxLength={4}
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs text-white/30">
                                        🔒 PINs are securely hashed using PBKDF2-SHA256 with 100,000 iterations
                                    </p>

                                    {/* Error */}
                                    {formError && (
                                        <p className="text-red-400 text-sm">{formError}</p>
                                    )}
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-3 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        className="flex-1 py-3 rounded-xl bg-cyan-500 text-white font-medium hover:bg-cyan-600 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <FiCheck size={18} />
                                        {editingUser ? 'Save Changes' : 'Add User'}
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Room Access Modal */}
                <AnimatePresence>
                    {showRoomModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                            onClick={() => setShowRoomModal(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="w-full max-w-md rounded-2xl bg-[#131720] border border-purple-500/30 p-6"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                        <FiHome className="text-purple-400 text-xl" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Room Access</h2>
                                        <p className="text-white/50 text-sm">
                                            {users.find(u => u.id === showRoomModal)?.name}
                                        </p>
                                    </div>
                                </div>

                                <p className="text-sm text-white/50 mb-4">
                                    Select which rooms this guest can control devices in:
                                </p>

                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {config.rooms.map(room => (
                                        <button
                                            key={room.id}
                                            onClick={() => handleRoomToggle(room.id)}
                                            className={`w-full p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${formData.allowedRooms.includes(room.id)
                                                ? 'border-purple-500/50 bg-purple-500/10'
                                                : 'border-white/10 bg-white/5 hover:border-white/20'
                                                }`}
                                        >
                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                                                style={{ backgroundColor: room.color + '40' }}
                                            >
                                                {room.icon}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-white font-medium">{room.name}</p>
                                                <p className="text-xs text-white/40">
                                                    {room.devices.length} device{room.devices.length !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                            {formData.allowedRooms.includes(room.id) ? (
                                                <FiCheck className="text-purple-400" size={20} />
                                            ) : (
                                                <div className="w-5 h-5 rounded border border-white/20" />
                                            )}
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-4 p-3 rounded-xl bg-white/5">
                                    <p className="text-sm text-white/60 text-center">
                                        {formData.allowedRooms.length === 0
                                            ? 'No rooms selected - guest will have no access'
                                            : `${formData.allowedRooms.length} room${formData.allowedRooms.length !== 1 ? 's' : ''} selected`
                                        }
                                    </p>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => setShowRoomModal(null)}
                                        className="flex-1 py-3 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleSaveRooms(showRoomModal)}
                                        className="flex-1 py-3 rounded-xl bg-purple-500 text-white font-medium hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <FiCheck size={18} />
                                        Save Access
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Delete Confirmation Modal */}
                <AnimatePresence>
                    {showDeleteConfirm && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                            onClick={() => setShowDeleteConfirm(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="w-full max-w-sm rounded-2xl bg-[#131720] border border-red-500/30 p-6"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex justify-center mb-4">
                                    <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center">
                                        <FiAlertTriangle className="text-red-400 text-3xl" />
                                    </div>
                                </div>
                                <h2 className="text-xl font-bold text-white text-center mb-2">Delete User?</h2>
                                <p className="text-white/50 text-center mb-6">
                                    This will permanently remove{' '}
                                    <span className="text-white font-medium">
                                        {users.find(u => u.id === showDeleteConfirm)?.name}
                                    </span>
                                    {' '}and their preferences.
                                </p>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowDeleteConfirm(null)}
                                        className="flex-1 py-3 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleDelete(showDeleteConfirm)}
                                        className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <FiTrash2 size={18} />
                                        Delete
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </RestrictedAccess>
    );
}

export default UserManagementPage;
