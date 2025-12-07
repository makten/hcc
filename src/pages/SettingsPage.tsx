import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSettings, FiRefreshCw, FiWifi, FiMoon, FiSun, FiGrid, FiList, FiTrash2, FiCheck } from 'react-icons/fi';
import { useApp } from '@/context';

export default function SettingsPage() {
    const { config, resetConfig } = useApp();
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [hassUrl, setHassUrl] = useState('http://homeassistant.local:8123');
    const [connected, setConnected] = useState(false);

    const handleConnect = () => {
        // Mock connection
        setConnected(true);
    };

    const handleReset = () => {
        resetConfig();
        setShowResetConfirm(false);
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4"
            >
                <div className="w-12 h-12 rounded-xl bg-accent-primary/20 flex items-center justify-center">
                    <FiSettings size={24} className="text-accent-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Settings</h1>
                    <p className="text-white/50">Configure your dashboard</p>
                </div>
            </motion.div>

            {/* Connection settings */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6"
            >
                <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                    <FiWifi size={20} />
                    Home Assistant Connection
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-white/50 mb-2">Server URL</label>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={hassUrl}
                                onChange={(e) => setHassUrl(e.target.value)}
                                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-accent-primary/50 focus:outline-none transition-colors"
                                placeholder="http://homeassistant.local:8123"
                            />
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={handleConnect}
                                className={`px-6 py-3 rounded-xl font-medium transition-colors ${connected
                                    ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                    : 'bg-accent-primary/20 text-accent-primary border border-accent-primary/30 hover:bg-accent-primary/30'
                                    }`}
                            >
                                {connected ? (
                                    <span className="flex items-center gap-2">
                                        <FiCheck size={16} />
                                        Connected
                                    </span>
                                ) : (
                                    'Connect'
                                )}
                            </motion.button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                        <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
                        <span className="text-sm text-white/60">
                            {connected ? 'Connected to Home Assistant' : 'Not connected - using demo mode'}
                        </span>
                    </div>
                </div>
            </motion.section>

            {/* Appearance settings */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6"
            >
                <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                    <FiMoon size={20} />
                    Appearance
                </h2>

                <div className="space-y-4">
                    {/* Theme selector */}
                    <div>
                        <label className="block text-sm text-white/50 mb-3">Theme</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button className="p-4 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-accent-primary/50 flex items-center gap-3">
                                <FiMoon size={20} className="text-accent-primary" />
                                <span className="text-white font-medium">Dark</span>
                            </button>
                            <button className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3 opacity-50 cursor-not-allowed">
                                <FiSun size={20} className="text-white/40" />
                                <span className="text-white/40 font-medium">Light</span>
                                <span className="text-xs text-white/30">(Coming)</span>
                            </button>
                        </div>
                    </div>

                    {/* Layout selector */}
                    <div>
                        <label className="block text-sm text-white/50 mb-3">Grid Layout</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button className="p-4 rounded-xl bg-white/5 border-2 border-accent-primary/50 flex items-center gap-3">
                                <FiGrid size={20} className="text-accent-primary" />
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

            {/* Dashboard info */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6"
            >
                <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                    <FiGrid size={20} />
                    Dashboard Configuration
                </h2>

                <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-white/5">
                        <span className="text-white/50">Rooms</span>
                        <span className="text-white">{config.rooms.length}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-white/5">
                        <span className="text-white/50">Total Devices</span>
                        <span className="text-white">
                            {config.rooms.reduce((acc, room) => acc + room.devices.length, 0)}
                        </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-white/5">
                        <span className="text-white/50">Audio Sources</span>
                        <span className="text-white">{config.audioSources.length}</span>
                    </div>
                    <div className="flex justify-between py-2">
                        <span className="text-white/50">Audio Zones</span>
                        <span className="text-white">{config.audioZones.length}</span>
                    </div>
                </div>
            </motion.section>

            {/* Reset section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card p-6 border-red-500/20"
            >
                <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                    <FiRefreshCw size={20} />
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
                className="text-center text-sm text-white/30"
            >
                Home Control Center v1.0.0
            </motion.div>
        </div>
    );
}
