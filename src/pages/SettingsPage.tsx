import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { hassApi, type HassState } from '@/services';
import {
    FiSettings,
    FiRefreshCw,
    FiWifi,
    FiMoon,
    FiSun,
    FiGrid,
    FiList,
    FiTrash2,
    FiCheck,
    FiPlus,
    FiX,
    FiHome,
    FiCpu,
    FiKey,
    FiChevronRight,
    FiChevronDown,
    FiSave
} from 'react-icons/fi';
import { useApp } from '@/context';
import { DeviceConfig, RoomConfig, DeviceType } from '@/types';

const DEVICE_TYPES: { value: DeviceType; label: string; icon: string }[] = [
    { value: 'light', label: 'Light', icon: '💡' },
    { value: 'climate', label: 'Climate/AC', icon: '❄️' },
    { value: 'fan', label: 'Fan', icon: '🌀' },
    { value: 'vacuum', label: 'Vacuum', icon: '🤖' },
    { value: 'media_player', label: 'Media Player', icon: '🔊' },
    { value: 'switch', label: 'Switch', icon: '🔌' },
    { value: 'sensor', label: 'Sensor', icon: '📊' },
    { value: 'camera', label: 'Camera', icon: '📹' },
];

const ROOM_COLORS = [
    '#00d4ff', '#a855f7', '#00ff88', '#ff6b35', '#fbbf24',
    '#f472b6', '#06b6d4', '#6b7280', '#ef4444', '#10b981',
];

interface DeviceFormData {
    name: string;
    entityId: string;
    type: DeviceType;
}

interface RoomFormData {
    name: string;
    icon: string;
    color: string;
}

function AddDeviceModal({
    isOpen,
    onClose,
    onSave,
    roomName,
    hassConnected
}: {
    isOpen: boolean;
    onClose: () => void;
    onSave: (device: DeviceFormData) => void;
    roomName: string;
    hassConnected: boolean;
}) {
    const [formData, setFormData] = useState<DeviceFormData>({
        name: '',
        entityId: '',
        type: 'light',
    });

    // Entity suggestions state
    const [availableEntities, setAvailableEntities] = useState<HassState[]>([]);
    const [isLoadingEntities, setIsLoadingEntities] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState<HassState[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    // Entity test state
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<{
        success: boolean;
        state?: string;
        friendlyName?: string;
        error?: string;
    } | null>(null);

    // Fetch available entities when modal opens and connected
    useEffect(() => {
        if (isOpen && hassConnected) {
            setIsLoadingEntities(true);
            hassApi.getStates().then((states) => {
                setAvailableEntities(states);
                setIsLoadingEntities(false);
            }).catch(() => {
                setIsLoadingEntities(false);
            });
        }
    }, [isOpen, hassConnected]);

    // Filter suggestions based on input
    useEffect(() => {
        if (formData.entityId.length > 0 && availableEntities.length > 0) {
            const query = formData.entityId.toLowerCase();
            const filtered = availableEntities
                .filter(entity =>
                    entity.entity_id.toLowerCase().includes(query) ||
                    (entity.attributes.friendly_name as string || '').toLowerCase().includes(query)
                )
                .slice(0, 10); // Limit to 10 suggestions
            setFilteredSuggestions(filtered);
        } else {
            setFilteredSuggestions([]);
        }
    }, [formData.entityId, availableEntities]);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(event.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = () => {
        if (formData.name && formData.entityId) {
            onSave(formData);
            setFormData({ name: '', entityId: '', type: 'light' });
            setTestResult(null);
            onClose();
        }
    };

    const handleSelectEntity = (entity: HassState) => {
        const domain = entity.entity_id.split('.')[0];
        const typeMap: Record<string, DeviceType> = {
            light: 'light',
            climate: 'climate',
            fan: 'fan',
            vacuum: 'vacuum',
            media_player: 'media_player',
            switch: 'switch',
            sensor: 'sensor',
            camera: 'camera',
        };

        setFormData({
            entityId: entity.entity_id,
            name: (entity.attributes.friendly_name as string) || entity.entity_id,
            type: typeMap[domain] || 'switch',
        });
        setTestResult({
            success: true,
            state: entity.state,
            friendlyName: (entity.attributes.friendly_name as string) || entity.entity_id,
        });
        setShowSuggestions(false);
    };

    const handleTestEntity = async () => {
        if (!formData.entityId) return;

        setIsTesting(true);
        setTestResult(null);

        try {
            const state = await hassApi.getState(formData.entityId);

            if (state) {
                setTestResult({
                    success: true,
                    state: state.state,
                    friendlyName: state.attributes.friendly_name as string || formData.entityId,
                });
                // Auto-fill name if empty
                if (!formData.name && state.attributes.friendly_name) {
                    setFormData(prev => ({ ...prev, name: state.attributes.friendly_name as string }));
                }
                // Auto-detect type from entity_id prefix
                const domain = formData.entityId.split('.')[0];
                const typeMap: Record<string, DeviceType> = {
                    light: 'light',
                    climate: 'climate',
                    fan: 'fan',
                    vacuum: 'vacuum',
                    media_player: 'media_player',
                    switch: 'switch',
                    sensor: 'sensor',
                    camera: 'camera',
                };
                if (typeMap[domain]) {
                    setFormData(prev => ({ ...prev, type: typeMap[domain] }));
                }
            } else {
                setTestResult({
                    success: false,
                    error: `Entity "${formData.entityId}" not found in Home Assistant`,
                });
            }
        } catch (error) {
            setTestResult({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to test entity',
            });
        }

        setIsTesting(false);
    };

    // Reset test result when entity ID changes
    const handleEntityIdChange = (value: string) => {
        setFormData({ ...formData, entityId: value });
        setTestResult(null);
        setShowSuggestions(true);
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-md rounded-2xl bg-[#131720] border border-white/10 p-6 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Add Device to {roomName}</h3>
                    <button onClick={onClose} className="text-white/40 hover:text-white">
                        <FiX size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Entity ID with Autocomplete */}
                    <div className="relative">
                        <label className="block text-sm text-white/50 mb-2">
                            Entity ID (from Home Assistant)
                            {isLoadingEntities && (
                                <span className="ml-2 text-cyan-400/60">Loading entities...</span>
                            )}
                            {!isLoadingEntities && availableEntities.length > 0 && (
                                <span className="ml-2 text-cyan-400/60">
                                    {availableEntities.length} entities available
                                </span>
                            )}
                        </label>
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={formData.entityId}
                                    onChange={(e) => handleEntityIdChange(e.target.value)}
                                    onFocus={() => setShowSuggestions(true)}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-cyan-500/50 focus:outline-none font-mono text-sm"
                                    placeholder="Start typing to search entities..."
                                    autoComplete="off"
                                />

                                {/* Suggestions Dropdown */}
                                <AnimatePresence>
                                    {showSuggestions && filteredSuggestions.length > 0 && (
                                        <motion.div
                                            ref={suggestionsRef}
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute z-50 left-0 right-0 mt-1 rounded-xl bg-[#1a1f2e] border border-white/10 shadow-2xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar"
                                        >
                                            {filteredSuggestions.map((entity) => {
                                                const domain = entity.entity_id.split('.')[0];
                                                const icon = DEVICE_TYPES.find(t => t.value === domain)?.icon || '📱';
                                                const isOn = entity.state === 'on';
                                                const isOff = entity.state === 'off';

                                                return (
                                                    <button
                                                        key={entity.entity_id}
                                                        onClick={() => handleSelectEntity(entity)}
                                                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-b-0"
                                                    >
                                                        <span className="text-lg">{icon}</span>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm text-white truncate">
                                                                {(entity.attributes.friendly_name as string) || entity.entity_id}
                                                            </p>
                                                            <p className="text-xs text-white/40 font-mono truncate">
                                                                {entity.entity_id}
                                                            </p>
                                                        </div>
                                                        <span className={`text-xs px-2 py-0.5 rounded-md ${isOn ? 'bg-green-500/20 text-green-400' :
                                                                isOff ? 'bg-red-500/20 text-red-400' :
                                                                    'bg-cyan-500/20 text-cyan-400'
                                                            }`}>
                                                            {entity.state}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleTestEntity}
                                disabled={!formData.entityId || !hassConnected || isTesting}
                                className={`px-4 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 ${testResult?.success
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                    : testResult?.error
                                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                        : 'bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {isTesting ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    >
                                        <FiRefreshCw size={16} />
                                    </motion.div>
                                ) : testResult?.success ? (
                                    <FiCheck size={16} />
                                ) : (
                                    <FiWifi size={16} />
                                )}
                                {isTesting ? 'Testing...' : 'Test'}
                            </motion.button>
                        </div>

                        {/* Test Result Display */}
                        {testResult && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`mt-3 p-3 rounded-xl ${testResult.success ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
                                    }`}
                            >
                                {testResult.success ? (
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                                            <FiCheck size={14} />
                                            Entity found!
                                        </div>
                                        <div className="text-xs text-white/60">
                                            <span className="text-white/40">Name:</span> {testResult.friendlyName}
                                        </div>
                                        <div className="text-xs text-white/60">
                                            <span className="text-white/40">State:</span>{' '}
                                            <span className={testResult.state === 'on' ? 'text-green-400' : testResult.state === 'off' ? 'text-red-400' : 'text-cyan-400'}>
                                                {testResult.state}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-start gap-2 text-red-400 text-sm">
                                        <FiX size={14} className="mt-0.5 flex-shrink-0" />
                                        <span>{testResult.error}</span>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {!hassConnected && (
                            <p className="text-xs text-amber-400/80 mt-2">
                                ⚠️ Connect to Home Assistant first to browse entities
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm text-white/50 mb-2">Device Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-cyan-500/50 focus:outline-none"
                            placeholder="e.g., Ceiling Light"
                        />
                        {testResult?.success && !formData.name && (
                            <p className="text-xs text-cyan-400/60 mt-1">
                                💡 Tip: Test the entity to auto-fill the name
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm text-white/50 mb-2">Device Type</label>
                        <div className="grid grid-cols-4 gap-2">
                            {DEVICE_TYPES.map((type) => (
                                <button
                                    key={type.value}
                                    onClick={() => setFormData({ ...formData, type: type.value })}
                                    className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${formData.type === type.value
                                        ? 'bg-cyan-500/20 border border-cyan-500/50'
                                        : 'bg-white/5 border border-white/10 hover:border-white/20'
                                        }`}
                                >
                                    <span className="text-lg">{type.icon}</span>
                                    <span className="text-[10px] text-white/60">{type.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!formData.name || !formData.entityId}
                        className="flex-1 py-3 rounded-xl bg-cyan-500 text-white font-medium hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <FiPlus size={18} />
                        Add Device
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}


function AddRoomModal({
    isOpen,
    onClose,
    onSave
}: {
    isOpen: boolean;
    onClose: () => void;
    onSave: (room: RoomFormData) => void;
}) {
    const [formData, setFormData] = useState<RoomFormData>({
        name: '',
        icon: 'FiHome',
        color: ROOM_COLORS[0],
    });

    const handleSubmit = () => {
        if (formData.name) {
            onSave(formData);
            setFormData({ name: '', icon: 'FiHome', color: ROOM_COLORS[0] });
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-md rounded-2xl bg-[#131720] border border-white/10 p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Add New Room</h3>
                    <button onClick={onClose} className="text-white/40 hover:text-white">
                        <FiX size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-white/50 mb-2">Room Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-cyan-500/50 focus:outline-none"
                            placeholder="e.g., Master Bedroom"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-white/50 mb-2">Room Color</label>
                        <div className="flex gap-2 flex-wrap">
                            {ROOM_COLORS.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => setFormData({ ...formData, color })}
                                    className={`w-10 h-10 rounded-xl transition-all ${formData.color === color
                                        ? 'ring-2 ring-white ring-offset-2 ring-offset-[#131720]'
                                        : ''
                                        }`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!formData.name}
                        className="flex-1 py-3 rounded-xl bg-cyan-500 text-white font-medium hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <FiPlus size={18} />
                        Add Room
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

function RoomSection({ room, onAddDevice, onRemoveDevice, onRemoveRoom }: {
    room: RoomConfig;
    onAddDevice: () => void;
    onRemoveDevice: (deviceId: string) => void;
    onRemoveRoom: () => void;
}) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${room.color}20` }}
                    >
                        <FiHome size={16} style={{ color: room.color }} />
                    </div>
                    <div className="text-left">
                        <p className="text-white font-medium">{room.name}</p>
                        <p className="text-xs text-white/40">{room.devices.length} devices</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {isExpanded ? <FiChevronDown className="text-white/40" /> : <FiChevronRight className="text-white/40" />}
                </div>
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/10"
                    >
                        <div className="p-4 space-y-2">
                            {room.devices.map((device) => (
                                <div
                                    key={device.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">
                                            {DEVICE_TYPES.find(t => t.value === device.type)?.icon || '📱'}
                                        </span>
                                        <div>
                                            <p className="text-sm text-white">{device.name}</p>
                                            <p className="text-xs text-white/40 font-mono">{device.entityId}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onRemoveDevice(device.id)}
                                        className="p-2 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                    >
                                        <FiTrash2 size={14} />
                                    </button>
                                </div>
                            ))}

                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={onAddDevice}
                                    className="flex-1 py-2 rounded-lg border border-dashed border-white/20 text-white/40 hover:text-cyan-400 hover:border-cyan-500/50 transition-colors flex items-center justify-center gap-2 text-sm"
                                >
                                    <FiPlus size={14} />
                                    Add Device
                                </button>
                                <button
                                    onClick={onRemoveRoom}
                                    className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors text-sm"
                                >
                                    Delete Room
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function SettingsPage() {
    const { config, resetConfig, updateHomeAssistant, addRoom, removeRoom, addDeviceToRoom, removeDeviceFromRoom } = useApp();
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [hassUrl, setHassUrl] = useState(config.homeAssistant?.url || 'http://homeassistant.local:8123');
    const [accessToken, setAccessToken] = useState(config.homeAssistant?.accessToken || '');
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [haVersion, setHaVersion] = useState<string | null>(null);

    const [addDeviceModalRoom, setAddDeviceModalRoom] = useState<RoomConfig | null>(null);
    const [showAddRoomModal, setShowAddRoomModal] = useState(false);

    const handleConnect = async () => {
        setIsConnecting(true);
        setConnectionStatus('idle');
        setConnectionError(null);
        setHaVersion(null);

        // Configure the API with current settings
        hassApi.configure({
            url: hassUrl,
            accessToken,
        });

        // Test the connection with the real API
        const result = await hassApi.testConnection();

        if (result.success) {
            updateHomeAssistant({
                url: hassUrl,
                accessToken,
                connected: true,
                lastConnected: new Date().toISOString(),
            });
            setConnectionStatus('success');
            setHaVersion(result.version || null);
        } else {
            updateHomeAssistant({
                url: hassUrl,
                accessToken,
                connected: false,
            });
            setConnectionStatus('error');
            setConnectionError(result.error || 'Connection failed');
        }

        setIsConnecting(false);
    };

    const handleSaveConnection = () => {
        updateHomeAssistant({
            url: hassUrl,
            accessToken,
        });
    };

    const handleReset = () => {
        resetConfig();
        setShowResetConfirm(false);
        setHassUrl('http://homeassistant.local:8123');
        setAccessToken('');
        setConnectionStatus('idle');
    };

    const handleAddRoom = (formData: RoomFormData) => {
        const id = formData.name.toLowerCase().replace(/\s+/g, '-');
        const newRoom: RoomConfig = {
            id,
            name: formData.name,
            icon: formData.icon,
            color: formData.color,
            devices: [],
        };
        addRoom(newRoom);
    };

    const handleAddDevice = (roomId: string, formData: DeviceFormData) => {
        const id = `${roomId}-${formData.entityId.split('.').pop()}`;
        const newDevice: DeviceConfig = {
            id,
            name: formData.name,
            entityId: formData.entityId,
            type: formData.type,
        };
        addDeviceToRoom(roomId, newDevice);
    };

    const connected = config.homeAssistant?.connected || false;

    return (
        <div className="h-full overflow-auto custom-scrollbar p-4 md:p-6">
            <div className="space-y-6 max-w-3xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4"
                >
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                        <FiSettings size={24} className="text-cyan-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Settings</h1>
                        <p className="text-white/50">Configure your smart home dashboard</p>
                    </div>
                </motion.div>

                {/* Home Assistant Connection */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-2xl bg-[#131720] border border-white/10 p-6"
                >
                    <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                        <FiWifi size={20} className="text-cyan-400" />
                        Home Assistant Connection
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-white/50 mb-2">Server URL</label>
                            <input
                                type="text"
                                value={hassUrl}
                                onChange={(e) => setHassUrl(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-cyan-500/50 focus:outline-none"
                                placeholder="http://homeassistant.local:8123"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-white/50 mb-2 flex items-center gap-2">
                                <FiKey size={14} />
                                Long-Lived Access Token
                            </label>
                            <input
                                type="password"
                                value={accessToken}
                                onChange={(e) => setAccessToken(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-cyan-500/50 focus:outline-none font-mono text-sm"
                                placeholder="Enter your Home Assistant access token"
                            />
                            <p className="text-xs text-white/30 mt-2">
                                Generate at: Profile → Long-Lived Access Tokens → Create Token
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={handleSaveConnection}
                                className="px-6 py-3 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 transition-colors flex items-center gap-2"
                            >
                                <FiSave size={16} />
                                Save
                            </motion.button>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={handleConnect}
                                disabled={isConnecting}
                                className={`flex-1 px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${connectionStatus === 'success'
                                    ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                    : connectionStatus === 'error'
                                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                        : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30'
                                    }`}
                            >
                                {isConnecting ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    >
                                        <FiRefreshCw size={16} />
                                    </motion.div>
                                ) : connectionStatus === 'success' ? (
                                    <>
                                        <FiCheck size={16} />
                                        Connected
                                    </>
                                ) : (
                                    'Test Connection'
                                )}
                            </motion.button>
                        </div>

                        <div className={`flex items-start gap-3 p-3 rounded-xl ${connected ? 'bg-green-500/10' : connectionError ? 'bg-red-500/10' : 'bg-white/5'}`}>
                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${connected ? 'bg-green-400' : connectionError ? 'bg-red-400' : 'bg-gray-400'}`} />
                            <div className="flex-1 min-w-0">
                                {connected ? (
                                    <>
                                        <span className="text-sm text-green-400">
                                            Connected to Home Assistant{haVersion ? ` v${haVersion}` : ''}
                                        </span>
                                        {config.homeAssistant?.lastConnected && (
                                            <span className="text-xs text-white/40 block mt-0.5">
                                                Last connected: {new Date(config.homeAssistant.lastConnected).toLocaleString()}
                                            </span>
                                        )}
                                    </>
                                ) : connectionError ? (
                                    <pre className="text-sm text-red-300 whitespace-pre-wrap font-sans">{connectionError}</pre>
                                ) : (
                                    <span className="text-sm text-white/60">
                                        Not connected - click "Test Connection" to connect
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* Rooms & Devices Management */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-2xl bg-[#131720] border border-white/10 p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-medium text-white flex items-center gap-2">
                            <FiCpu size={20} className="text-purple-400" />
                            Rooms & Devices
                        </h2>
                        <button
                            onClick={() => setShowAddRoomModal(true)}
                            className="px-4 py-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 transition-colors flex items-center gap-2 text-sm"
                        >
                            <FiPlus size={14} />
                            Add Room
                        </button>
                    </div>

                    <div className="space-y-2">
                        {config.rooms.map((room) => (
                            <RoomSection
                                key={room.id}
                                room={room}
                                onAddDevice={() => setAddDeviceModalRoom(room)}
                                onRemoveDevice={(deviceId) => removeDeviceFromRoom(room.id, deviceId)}
                                onRemoveRoom={() => removeRoom(room.id)}
                            />
                        ))}
                    </div>

                    <div className="mt-4 p-4 rounded-xl bg-white/5 border border-dashed border-white/20">
                        <p className="text-sm text-white/40 text-center">
                            Total: {config.rooms.length} rooms, {config.rooms.reduce((acc, room) => acc + room.devices.length, 0)} devices
                        </p>
                    </div>
                </motion.section>

                {/* Appearance settings */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-2xl bg-[#131720] border border-white/10 p-6"
                >
                    <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                        <FiMoon size={20} className="text-indigo-400" />
                        Appearance
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-white/50 mb-3">Theme</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button className="p-4 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-cyan-500/50 flex items-center gap-3">
                                    <FiMoon size={20} className="text-cyan-400" />
                                    <span className="text-white font-medium">Dark</span>
                                </button>
                                <button className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3 opacity-50 cursor-not-allowed">
                                    <FiSun size={20} className="text-white/40" />
                                    <span className="text-white/40 font-medium">Light</span>
                                    <span className="text-xs text-white/30">(Coming)</span>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-white/50 mb-3">Grid Layout</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button className="p-4 rounded-xl bg-white/5 border-2 border-cyan-500/50 flex items-center gap-3">
                                    <FiGrid size={20} className="text-cyan-400" />
                                    <span className="text-white font-medium">Comfortable</span>
                                </button>
                                <button className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3 hover:border-white/20 transition-colors">
                                    <FiList size={20} className="text-white/50" />
                                    <span className="text-white/70 font-medium">Compact</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* Reset section */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-2xl bg-[#131720] border border-red-500/20 p-6"
                >
                    <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                        <FiRefreshCw size={20} className="text-red-400" />
                        Reset
                    </h2>

                    {!showResetConfirm ? (
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white/70">Reset to defaults</p>
                                <p className="text-sm text-white/40">
                                    This will reset all room and device configurations
                                </p>
                            </div>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowResetConfirm(true)}
                                className="px-4 py-2 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition-colors flex items-center gap-2"
                            >
                                <FiTrash2 size={16} />
                                Reset
                            </motion.button>
                        </div>
                    ) : (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                            <p className="text-white mb-4">
                                Are you sure? This cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleReset}
                                    className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors"
                                >
                                    Yes, Reset Everything
                                </motion.button>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowResetConfirm(false)}
                                    className="px-4 py-2 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 transition-colors"
                                >
                                    Cancel
                                </motion.button>
                            </div>
                        </div>
                    )}
                </motion.section>

                {/* Version info */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center text-sm text-white/30 pb-6"
                >
                    Home Control Center v1.0.0
                </motion.div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {addDeviceModalRoom && (
                    <AddDeviceModal
                        isOpen={!!addDeviceModalRoom}
                        onClose={() => setAddDeviceModalRoom(null)}
                        onSave={(formData) => handleAddDevice(addDeviceModalRoom.id, formData)}
                        roomName={addDeviceModalRoom.name}
                        hassConnected={connected}
                    />
                )}
                {showAddRoomModal && (
                    <AddRoomModal
                        isOpen={showAddRoomModal}
                        onClose={() => setShowAddRoomModal(false)}
                        onSave={handleAddRoom}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
