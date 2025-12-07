import { useState } from 'react';
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
    FiSquare
} from 'react-icons/fi';

interface Camera {
    id: string;
    name: string;
    location: string;
    status: 'online' | 'offline';
    lastMotion: string;
    thumbnail: string;
}

// Camera definitions for different angles of the house
const CAMERAS: Camera[] = [
    {
        id: 'front-door',
        name: 'Front Door',
        location: 'Entrance',
        status: 'online',
        lastMotion: '2 min ago',
        thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=640&h=360&fit=crop'
    },
    {
        id: 'driveway',
        name: 'Driveway',
        location: 'Exterior',
        status: 'online',
        lastMotion: '15 min ago',
        thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=640&h=360&fit=crop'
    },
    {
        id: 'backyard',
        name: 'Backyard',
        location: 'Garden',
        status: 'online',
        lastMotion: '1 hour ago',
        thumbnail: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=640&h=360&fit=crop'
    },
    {
        id: 'garage',
        name: 'Garage',
        location: 'Garage',
        status: 'online',
        lastMotion: '3 hours ago',
        thumbnail: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=640&h=360&fit=crop'
    },
    {
        id: 'living-room',
        name: 'Living Room',
        location: 'Interior',
        status: 'online',
        lastMotion: '5 min ago',
        thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=640&h=360&fit=crop'
    },
    {
        id: 'kitchen',
        name: 'Kitchen',
        location: 'Interior',
        status: 'offline',
        lastMotion: 'N/A',
        thumbnail: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=640&h=360&fit=crop'
    },
    {
        id: 'side-gate',
        name: 'Side Gate',
        location: 'Exterior',
        status: 'online',
        lastMotion: '45 min ago',
        thumbnail: 'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?w=640&h=360&fit=crop'
    },
    {
        id: 'pool-area',
        name: 'Pool Area',
        location: 'Exterior',
        status: 'online',
        lastMotion: '2 hours ago',
        thumbnail: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=640&h=360&fit=crop'
    },
    {
        id: 'baby-room',
        name: 'Baby Room',
        location: 'Bedroom',
        status: 'online',
        lastMotion: '10 min ago',
        thumbnail: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=640&h=360&fit=crop'
    },
];

function CameraCard({ camera, onExpand }: { camera: Camera; onExpand: () => void }) {
    const isOnline = camera.status === 'online';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            className={`relative group rounded-2xl overflow-hidden bg-[#0d1117] border transition-all duration-300 ${isOnline
                    ? 'border-white/10 hover:border-cyan-500/30'
                    : 'border-red-500/20 opacity-60'
                }`}
        >
            <div className="aspect-video relative overflow-hidden">
                <img
                    src={camera.thumbnail}
                    alt={camera.name}
                    className={`w-full h-full object-cover transition-all duration-500 ${isOnline ? 'group-hover:scale-105' : 'grayscale'
                        }`}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {isOnline && (
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Live</span>
                    </div>
                )}

                {!isOnline && (
                    <div className="absolute top-3 left-3 flex items-center gap-2 px-2 py-1 rounded-full bg-red-500/20 border border-red-500/30">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Offline</span>
                    </div>
                )}

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onExpand}
                        className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white transition-all hover:bg-cyan-500/30 hover:border-cyan-500/50"
                    >
                        <FiMaximize2 size={20} />
                    </motion.button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="flex items-end justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-white">{camera.name}</h3>
                            <p className="text-[10px] text-white/50">{camera.location}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-white/40">Last motion</p>
                            <p className="text-[10px] text-cyan-400 font-medium">{camera.lastMotion}</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function ExpandedCameraModal({ camera, onClose }: { camera: Camera; onClose: () => void }) {
    const [isMuted, setIsMuted] = useState(true);

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
                            className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
                        >
                            <FiRefreshCw size={18} />
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setIsMuted(!isMuted)}
                            className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
                        >
                            {isMuted ? <FiVolumeX size={18} /> : <FiVolume2 size={18} />}
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
                        >
                            <FiDownload size={18} />
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-all"
                        >
                            <FiX size={18} />
                        </motion.button>
                    </div>
                </div>

                <div className="aspect-video relative">
                    <img
                        src={camera.thumbnail}
                        alt={camera.name}
                        className="w-full h-full object-cover"
                    />

                    <div className="absolute top-16 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Live</span>
                    </div>

                    <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm">
                        <span className="text-xs font-mono text-white/80">
                            {new Date().toLocaleTimeString()}
                        </span>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default function CamerasPage() {
    const [expandedCamera, setExpandedCamera] = useState<Camera | null>(null);
    const [gridSize, setGridSize] = useState<'3x3' | '2x2'>('3x3');

    const onlineCount = CAMERAS.filter(c => c.status === 'online').length;

    return (
        <div className="h-full w-full bg-[#0d1117] p-4 md:p-6 overflow-auto custom-scrollbar">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/20">
                        <FiVideo className="text-cyan-400" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Security Cameras</h1>
                        <p className="text-sm text-white/50">
                            <span className="text-green-400">{onlineCount}</span> of {CAMERAS.length} cameras online
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1">
                    <button
                        onClick={() => setGridSize('3x3')}
                        className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${gridSize === '3x3'
                                ? 'bg-cyan-500/20 text-cyan-400'
                                : 'text-white/40 hover:text-white/60'
                            }`}
                    >
                        <FiGrid size={16} />
                        3×3
                    </button>
                    <button
                        onClick={() => setGridSize('2x2')}
                        className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${gridSize === '2x2'
                                ? 'bg-cyan-500/20 text-cyan-400'
                                : 'text-white/40 hover:text-white/60'
                            }`}
                    >
                        <FiSquare size={16} />
                        2×2
                    </button>
                </div>
            </motion.div>

            <motion.div
                layout
                className={`grid gap-4 ${gridSize === '3x3'
                        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                        : 'grid-cols-1 md:grid-cols-2'
                    }`}
            >
                {CAMERAS.map((camera, index) => (
                    <motion.div
                        key={camera.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <CameraCard
                            camera={camera}
                            onExpand={() => setExpandedCamera(camera)}
                        />
                    </motion.div>
                ))}
            </motion.div>

            <AnimatePresence>
                {expandedCamera && (
                    <ExpandedCameraModal
                        camera={expandedCamera}
                        onClose={() => setExpandedCamera(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
