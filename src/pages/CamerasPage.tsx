import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiVideo,
    FiMaximize2,
    FiX,
    FiRefreshCw,
    FiVolume2,
    FiVolumeX,
    FiDownload,
    FiGrid,
    FiSquare,
    FiPlus,
    FiSettings,
    FiTrash2,
    FiEdit2,
    FiCheck,
    FiAlertCircle,
    FiEye,
    FiCamera,
    FiWifi,
    FiSave,
    FiRotateCw,
    FiZap
} from 'react-icons/fi';
import { RestrictedAccess } from '@/components/auth';

// Camera types and interfaces
export interface CameraConfig {
    id: string;
    name: string;
    location: string;
    type: 'rtsp' | 'hls' | 'mjpeg' | 'snapshot' | 'ha-camera';
    url?: string;
    entityId?: string;
    snapshotUrl?: string;
    refreshInterval?: number;
    motionDetection?: boolean;
    recordingEnabled?: boolean;
    nightVision?: boolean;
    ptzEnabled?: boolean;
    audioEnabled?: boolean;
    createdAt: string;
}

interface CameraState {
    status: 'online' | 'offline' | 'connecting';
    lastMotion?: string;
    lastSnapshot?: string;
    isRecording?: boolean;
}

// Default camera placeholders for demo
const DEFAULT_CAMERAS: CameraConfig[] = [
    {
        id: 'front-door',
        name: 'Front Door',
        location: 'Entrance',
        type: 'snapshot',
        snapshotUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=640&h=360&fit=crop',
        refreshInterval: 10,
        motionDetection: true,
        recordingEnabled: true,
        audioEnabled: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 'driveway',
        name: 'Driveway',
        location: 'Exterior',
        type: 'snapshot',
        snapshotUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=640&h=360&fit=crop',
        refreshInterval: 10,
        motionDetection: true,
        recordingEnabled: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 'backyard',
        name: 'Backyard',
        location: 'Garden',
        type: 'snapshot',
        snapshotUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=640&h=360&fit=crop',
        refreshInterval: 15,
        motionDetection: true,
        nightVision: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 'garage',
        name: 'Garage',
        location: 'Garage',
        type: 'snapshot',
        snapshotUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=640&h=360&fit=crop',
        refreshInterval: 30,
        motionDetection: true,
        createdAt: new Date().toISOString()
    }
];

// Storage key for cameras
const CAMERAS_STORAGE_KEY = 'hcc_cameras';

// Load cameras from localStorage
function loadCameras(): CameraConfig[] {
    try {
        const stored = localStorage.getItem(CAMERAS_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error('Failed to load cameras:', e);
    }
    return DEFAULT_CAMERAS;
}

// Save cameras to localStorage
function saveCameras(cameras: CameraConfig[]) {
    try {
        localStorage.setItem(CAMERAS_STORAGE_KEY, JSON.stringify(cameras));
    } catch (e) {
        console.error('Failed to save cameras:', e);
    }
}

// Camera Card Component
function CameraCard({
    camera,
    state,
    onExpand,
    onEdit,
    onDelete,
    isEditing
}: {
    camera: CameraConfig;
    state: CameraState;
    onExpand: () => void;
    onEdit: () => void;
    onDelete: () => void;
    isEditing: boolean;
}) {
    const isOnline = state.status === 'online';
    const [refreshKey, setRefreshKey] = useState(0);

    // Auto-refresh snapshot
    useEffect(() => {
        if (camera.type === 'snapshot' && camera.refreshInterval && isOnline) {
            const interval = setInterval(() => {
                setRefreshKey(k => k + 1);
            }, camera.refreshInterval * 1000);
            return () => clearInterval(interval);
        }
    }, [camera.refreshInterval, camera.type, isOnline]);

    const thumbnailUrl = camera.snapshotUrl || camera.url || 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=640&h=360&fit=crop';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: isEditing ? 1 : 1.02 }}
            className={`relative group rounded-2xl overflow-hidden bg-[#0d1117] border transition-all duration-300 ${isOnline
                ? 'border-white/10 hover:border-cyan-500/30'
                : 'border-red-500/20 opacity-60'
                } ${isEditing ? 'ring-2 ring-cyan-500/50' : ''}`}
        >
            <div className="aspect-video relative overflow-hidden">
                <img
                    key={refreshKey}
                    src={`${thumbnailUrl}${thumbnailUrl.includes('?') ? '&' : '?'}t=${refreshKey}`}
                    alt={camera.name}
                    className={`w-full h-full object-cover transition-all duration-500 ${isOnline ? 'group-hover:scale-105' : 'grayscale'
                        }`}
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=640&h=360&fit=crop';
                    }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Status Badge */}
                {isOnline ? (
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Live</span>
                    </div>
                ) : (
                    <div className="absolute top-3 left-3 flex items-center gap-2 px-2 py-1 rounded-full bg-red-500/20 border border-red-500/30">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Offline</span>
                    </div>
                )}

                {/* Feature indicators */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    {camera.motionDetection && (
                        <div className="w-6 h-6 rounded-lg bg-black/50 backdrop-blur-sm flex items-center justify-center" title="Motion Detection">
                            <FiZap size={12} className="text-amber-400" />
                        </div>
                    )}
                    {camera.recordingEnabled && (
                        <div className="w-6 h-6 rounded-lg bg-black/50 backdrop-blur-sm flex items-center justify-center" title="Recording">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        </div>
                    )}
                    {camera.audioEnabled && (
                        <div className="w-6 h-6 rounded-lg bg-black/50 backdrop-blur-sm flex items-center justify-center" title="Audio Enabled">
                            <FiVolume2 size={12} className="text-white/60" />
                        </div>
                    )}
                </div>

                {/* Hover actions */}
                {!isEditing && (
                    <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onExpand}
                            className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white transition-all hover:bg-cyan-500/30 hover:border-cyan-500/50"
                            title="Expand"
                        >
                            <FiMaximize2 size={20} />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onEdit}
                            className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white transition-all hover:bg-blue-500/30 hover:border-blue-500/50"
                            title="Configure"
                        >
                            <FiSettings size={16} />
                        </motion.button>
                    </div>
                )}

                {/* Edit mode overlay */}
                {isEditing && (
                    <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 backdrop-blur-sm">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onEdit}
                            className="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-sm font-medium flex items-center gap-2"
                        >
                            <FiEdit2 size={14} />
                            Edit
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onDelete}
                            className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium flex items-center gap-2"
                        >
                            <FiTrash2 size={14} />
                            Remove
                        </motion.button>
                    </div>
                )}

                {/* Camera info */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="flex items-end justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-white">{camera.name}</h3>
                            <p className="text-[10px] text-white/50">{camera.location}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-white/40">Last motion</p>
                            <p className="text-[10px] text-cyan-400 font-medium">{state.lastMotion || 'No motion'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// Add/Edit Camera Modal
function CameraConfigModal({
    camera,
    onSave,
    onClose
}: {
    camera?: CameraConfig;
    onSave: (camera: CameraConfig) => void;
    onClose: () => void;
}) {
    const [form, setForm] = useState<Partial<CameraConfig>>({
        id: camera?.id || `camera-${Date.now()}`,
        name: camera?.name || '',
        location: camera?.location || '',
        type: camera?.type || 'snapshot',
        url: camera?.url || '',
        snapshotUrl: camera?.snapshotUrl || '',
        entityId: camera?.entityId || '',
        refreshInterval: camera?.refreshInterval || 10,
        motionDetection: camera?.motionDetection ?? true,
        recordingEnabled: camera?.recordingEnabled ?? false,
        nightVision: camera?.nightVision ?? false,
        audioEnabled: camera?.audioEnabled ?? false,
        ptzEnabled: camera?.ptzEnabled ?? false,
        createdAt: camera?.createdAt || new Date().toISOString()
    });
    const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

    const handleTestConnection = async () => {
        setTestStatus('testing');
        // Simulate connection test
        await new Promise(resolve => setTimeout(resolve, 1500));
        const url = form.snapshotUrl || form.url;
        if (url && url.startsWith('http')) {
            setTestStatus('success');
        } else {
            setTestStatus('error');
        }
    };

    const handleSave = () => {
        if (!form.name || !form.location) return;
        onSave(form as CameraConfig);
    };

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
                className="w-full max-w-lg bg-[#131720] rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                            <FiCamera className="text-cyan-400" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">
                                {camera ? 'Edit Camera' : 'Add New Camera'}
                            </h2>
                            <p className="text-xs text-white/40">Configure camera settings</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                    >
                        <FiX size={18} />
                    </button>
                </div>

                {/* Form */}
                <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
                    {/* Basic Info */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Basic Information</h3>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-white/40 mb-1.5">Camera Name</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    placeholder="e.g., Front Door"
                                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-white/40 mb-1.5">Location</label>
                                <input
                                    type="text"
                                    value={form.location}
                                    onChange={e => setForm({ ...form, location: e.target.value })}
                                    placeholder="e.g., Entrance"
                                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Connection Settings */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Connection</h3>

                        <div>
                            <label className="block text-xs text-white/40 mb-1.5">Camera Type</label>
                            <select
                                value={form.type}
                                onChange={e => setForm({ ...form, type: e.target.value as CameraConfig['type'] })}
                                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                            >
                                <option value="snapshot">Snapshot/JPEG URL</option>
                                <option value="mjpeg">MJPEG Stream</option>
                                <option value="hls">HLS Stream</option>
                                <option value="rtsp">RTSP Stream</option>
                                <option value="ha-camera">Home Assistant Camera</option>
                            </select>
                        </div>

                        {form.type === 'ha-camera' ? (
                            <div>
                                <label className="block text-xs text-white/40 mb-1.5">Entity ID</label>
                                <input
                                    type="text"
                                    value={form.entityId}
                                    onChange={e => setForm({ ...form, entityId: e.target.value })}
                                    placeholder="camera.front_door"
                                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                                />
                            </div>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-xs text-white/40 mb-1.5">
                                        {form.type === 'snapshot' ? 'Snapshot URL' : 'Stream URL'}
                                    </label>
                                    <input
                                        type="text"
                                        value={form.type === 'snapshot' ? form.snapshotUrl : form.url}
                                        onChange={e => setForm({
                                            ...form,
                                            [form.type === 'snapshot' ? 'snapshotUrl' : 'url']: e.target.value
                                        })}
                                        placeholder={form.type === 'snapshot' ? 'https://camera.local/snapshot.jpg' : 'rtsp://camera.local/stream'}
                                        className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                                    />
                                </div>

                                {form.type === 'snapshot' && (
                                    <div>
                                        <label className="block text-xs text-white/40 mb-1.5">Refresh Interval (seconds)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="300"
                                            value={form.refreshInterval}
                                            onChange={e => setForm({ ...form, refreshInterval: parseInt(e.target.value) || 10 })}
                                            className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                                        />
                                    </div>
                                )}
                            </>
                        )}

                        {/* Test Connection Button */}
                        <button
                            onClick={handleTestConnection}
                            disabled={testStatus === 'testing'}
                            className={`w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all ${testStatus === 'success'
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : testStatus === 'error'
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'
                                }`}
                        >
                            {testStatus === 'testing' ? (
                                <FiRotateCw size={16} className="animate-spin" />
                            ) : testStatus === 'success' ? (
                                <FiCheck size={16} />
                            ) : testStatus === 'error' ? (
                                <FiAlertCircle size={16} />
                            ) : (
                                <FiWifi size={16} />
                            )}
                            {testStatus === 'testing' ? 'Testing...' : testStatus === 'success' ? 'Connected!' : testStatus === 'error' ? 'Connection Failed' : 'Test Connection'}
                        </button>
                    </div>

                    {/* Features */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Features</h3>

                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { key: 'motionDetection', label: 'Motion Detection', icon: FiZap },
                                { key: 'recordingEnabled', label: 'Recording', icon: FiVideo },
                                { key: 'nightVision', label: 'Night Vision', icon: FiEye },
                                { key: 'audioEnabled', label: 'Audio', icon: FiVolume2 },
                            ].map(({ key, label, icon: Icon }) => (
                                <button
                                    key={key}
                                    onClick={() => setForm({ ...form, [key]: !form[key as keyof CameraConfig] })}
                                    className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${form[key as keyof CameraConfig]
                                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                                        : 'bg-white/5 border-white/10 text-white/40'
                                        }`}
                                >
                                    <Icon size={18} />
                                    <span className="text-sm font-medium">{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-5 border-t border-white/5">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl bg-white/5 text-white/60 hover:text-white font-medium text-sm transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!form.name || !form.location}
                        className="px-5 py-2.5 rounded-xl bg-cyan-500 text-black font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all hover:bg-cyan-400"
                    >
                        <FiSave size={16} />
                        {camera ? 'Save Changes' : 'Add Camera'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// Expanded Camera Modal
function ExpandedCameraModal({ camera, onClose }: { camera: CameraConfig; onClose: () => void }) {
    const [isMuted, setIsMuted] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    const thumbnailUrl = camera.snapshotUrl || camera.url || 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=1280&h=720&fit=crop';

    const handleRefresh = () => {
        setRefreshKey(k => k + 1);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-5xl rounded-3xl overflow-hidden bg-[#0d1117] border border-white/10 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                            <FiVideo className="text-cyan-400" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">{camera.name}</h2>
                            <p className="text-xs text-white/50">{camera.location} • Live Feed</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={handleRefresh}
                            className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
                            title="Refresh"
                        >
                            <FiRefreshCw size={18} />
                        </motion.button>
                        {camera.audioEnabled && (
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setIsMuted(!isMuted)}
                                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
                                title={isMuted ? "Unmute" : "Mute"}
                            >
                                {isMuted ? <FiVolumeX size={18} /> : <FiVolume2 size={18} />}
                            </motion.button>
                        )}
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
                            title="Download Snapshot"
                        >
                            <FiDownload size={18} />
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-all"
                            title="Close"
                        >
                            <FiX size={18} />
                        </motion.button>
                    </div>
                </div>

                {/* Video Feed */}
                <div className="aspect-video relative">
                    <img
                        key={refreshKey}
                        src={`${thumbnailUrl}${thumbnailUrl.includes('?') ? '&' : '?'}t=${refreshKey}`}
                        alt={camera.name}
                        className="w-full h-full object-cover"
                    />

                    {/* Live Badge */}
                    <div className="absolute top-16 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Live</span>
                    </div>

                    {/* Recording Badge */}
                    {camera.recordingEnabled && (
                        <div className="absolute top-16 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">REC</span>
                        </div>
                    )}

                    {/* Time Overlay */}
                    <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm">
                        <span className="text-xs font-mono text-white/80">
                            {new Date().toLocaleTimeString()}
                        </span>
                    </div>

                    {/* Feature Indicators */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                        {camera.motionDetection && (
                            <div className="px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm flex items-center gap-2">
                                <FiZap size={12} className="text-amber-400" />
                                <span className="text-xs text-white/60">Motion Detection</span>
                            </div>
                        )}
                        {camera.nightVision && (
                            <div className="px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm flex items-center gap-2">
                                <FiEye size={12} className="text-green-400" />
                                <span className="text-xs text-white/60">Night Vision</span>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

// Main Cameras Page
export default function CamerasPage() {
    const [cameras, setCameras] = useState<CameraConfig[]>([]);
    const [cameraStates, setCameraStates] = useState<Map<string, CameraState>>(new Map());
    const [expandedCamera, setExpandedCamera] = useState<CameraConfig | null>(null);
    const [configCamera, setConfigCamera] = useState<CameraConfig | null | undefined>(undefined); // undefined = closed, null = new camera
    const [gridSize, setGridSize] = useState<'3x3' | '2x2' | '1x1'>('3x3');
    const [isEditMode, setIsEditMode] = useState(false);

    // Load cameras on mount
    useEffect(() => {
        const loaded = loadCameras();
        setCameras(loaded);

        // Initialize states
        const states = new Map<string, CameraState>();
        loaded.forEach(cam => {
            states.set(cam.id, {
                status: Math.random() > 0.1 ? 'online' : 'offline',
                lastMotion: ['2 min ago', '15 min ago', '1 hour ago', '3 hours ago'][Math.floor(Math.random() * 4)]
            });
        });
        setCameraStates(states);
    }, []);

    // Save cameras when changed
    useEffect(() => {
        if (cameras.length > 0) {
            saveCameras(cameras);
        }
    }, [cameras]);

    const handleAddCamera = () => {
        setConfigCamera(null);
    };

    const handleEditCamera = (camera: CameraConfig) => {
        setConfigCamera(camera);
    };

    const handleSaveCamera = (camera: CameraConfig) => {
        setCameras(prev => {
            const existing = prev.findIndex(c => c.id === camera.id);
            if (existing >= 0) {
                const updated = [...prev];
                updated[existing] = camera;
                return updated;
            }
            return [...prev, camera];
        });

        // Initialize state for new camera
        setCameraStates(prev => {
            const updated = new Map(prev);
            if (!updated.has(camera.id)) {
                updated.set(camera.id, {
                    status: 'online',
                    lastMotion: 'Just now'
                });
            }
            return updated;
        });

        setConfigCamera(undefined);
    };

    const handleDeleteCamera = (cameraId: string) => {
        if (confirm('Are you sure you want to remove this camera?')) {
            setCameras(prev => prev.filter(c => c.id !== cameraId));
            setCameraStates(prev => {
                const updated = new Map(prev);
                updated.delete(cameraId);
                return updated;
            });
        }
    };

    const onlineCount = Array.from(cameraStates.values()).filter(s => s.status === 'online').length;

    return (
        <RestrictedAccess permission="canViewCameras" fallbackMessage="You don't have permission to view security cameras.">
            <div className="h-full w-full bg-[#0d1117] p-4 md:p-6 overflow-auto custom-scrollbar">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/20">
                            <FiVideo className="text-cyan-400" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Security Cameras</h1>
                            <p className="text-sm text-white/50">
                                <span className="text-green-400">{onlineCount}</span> of {cameras.length} cameras online
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Grid Size Toggle */}
                        <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
                            {[
                                { value: '3x3', icon: FiGrid, label: '3×3' },
                                { value: '2x2', icon: FiSquare, label: '2×2' },
                                { value: '1x1', icon: FiMaximize2, label: '1×1' },
                            ].map(({ value, icon: Icon, label }) => (
                                <button
                                    key={value}
                                    onClick={() => setGridSize(value as typeof gridSize)}
                                    className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${gridSize === value
                                        ? 'bg-cyan-500/20 text-cyan-400'
                                        : 'text-white/40 hover:text-white/60'
                                        }`}
                                >
                                    <Icon size={16} />
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* Edit Mode Toggle */}
                        <button
                            onClick={() => setIsEditMode(!isEditMode)}
                            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition-all ${isEditMode
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-white/5 text-white/60 hover:text-white border border-white/10'
                                }`}
                        >
                            {isEditMode ? <FiCheck size={16} /> : <FiSettings size={16} />}
                            {isEditMode ? 'Done' : 'Manage'}
                        </button>

                        {/* Add Camera Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleAddCamera}
                            className="px-4 py-2.5 rounded-xl bg-cyan-500 text-black font-semibold text-sm flex items-center gap-2 transition-all hover:bg-cyan-400"
                        >
                            <FiPlus size={16} />
                            Add Camera
                        </motion.button>
                    </div>
                </motion.div>

                {/* Cameras Grid */}
                {cameras.length > 0 ? (
                    <motion.div
                        layout
                        className={`grid gap-4 ${gridSize === '3x3'
                            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                            : gridSize === '2x2'
                                ? 'grid-cols-1 md:grid-cols-2'
                                : 'grid-cols-1'
                            }`}
                    >
                        {cameras.map((camera, index) => (
                            <motion.div
                                key={camera.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <CameraCard
                                    camera={camera}
                                    state={cameraStates.get(camera.id) || { status: 'offline' }}
                                    onExpand={() => setExpandedCamera(camera)}
                                    onEdit={() => handleEditCamera(camera)}
                                    onDelete={() => handleDeleteCamera(camera.id)}
                                    isEditing={isEditMode}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-20"
                    >
                        <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
                            <FiVideo size={40} className="text-white/20" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">No Cameras Configured</h2>
                        <p className="text-white/40 text-center max-w-md mb-6">
                            Add security cameras to monitor your home. Support for RTSP, MJPEG, HLS streams and Home Assistant cameras.
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleAddCamera}
                            className="px-6 py-3 rounded-xl bg-cyan-500 text-black font-semibold flex items-center gap-2"
                        >
                            <FiPlus size={18} />
                            Add Your First Camera
                        </motion.button>
                    </motion.div>
                )}

                {/* Modals */}
                <AnimatePresence>
                    {expandedCamera && (
                        <ExpandedCameraModal
                            camera={expandedCamera}
                            onClose={() => setExpandedCamera(null)}
                        />
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {configCamera !== undefined && (
                        <CameraConfigModal
                            camera={configCamera || undefined}
                            onSave={handleSaveCamera}
                            onClose={() => setConfigCamera(undefined)}
                        />
                    )}
                </AnimatePresence>
            </div>
        </RestrictedAccess>
    );
}
