import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMusic, FiTv, FiDisc, FiCast, FiVolume2, FiCheck } from 'react-icons/fi';
import { useApp } from '@/context';

// Audio source definition
interface AudioSource {
    id: string;
    name: string;
    icon: React.ReactNode;
    color: string;
    isActive: boolean;
}

// Audio zone definition
interface AudioZone {
    id: string;
    name: string;
    roomId: string;
    isPlaying: boolean;
    volume: number;
}

// Mock sources
const AUDIO_SOURCES: AudioSource[] = [
    { id: 'spotify', name: 'Spotify', icon: <FiMusic size={24} />, color: '#1db954', isActive: true },
    { id: 'apple-tv', name: 'Apple TV', icon: <FiTv size={24} />, color: '#a855f7', isActive: false },
    { id: 'turntable', name: 'Turntable', icon: <FiDisc size={24} />, color: '#ff6b35', isActive: false },
    { id: 'airplay', name: 'AirPlay', icon: <FiCast size={24} />, color: '#00d4ff', isActive: false },
];

// Mock zones
const INITIAL_ZONES: AudioZone[] = [
    { id: 'zone-living', name: 'Living Room', roomId: 'living-room', isPlaying: true, volume: 0.7 },
    { id: 'zone-bedroom', name: 'Bedroom', roomId: 'bedroom', isPlaying: false, volume: 0.5 },
    { id: 'zone-kitchen', name: 'Kitchen', roomId: 'kitchen', isPlaying: true, volume: 0.6 },
    { id: 'zone-office', name: 'Office', roomId: 'office', isPlaying: false, volume: 0.5 },
    { id: 'zone-patio', name: 'Patio', roomId: 'patio', isPlaying: false, volume: 0.4 },
];

export default function AudioMatrix() {
    const { audioMatrixOpen, closeAudioMatrix } = useApp();
    const [selectedSource, setSelectedSource] = useState<string>('spotify');
    const [zones, setZones] = useState<AudioZone[]>(INITIAL_ZONES);

    // Toggle zone for current source
    const toggleZone = useCallback((zoneId: string) => {
        setZones((prev) =>
            prev.map((zone) =>
                zone.id === zoneId ? { ...zone, isPlaying: !zone.isPlaying } : zone
            )
        );

        // In a real app, this would call:
        // useService('media_player').join({ entity_id: zoneEntityId, group_members: [...] })
        // or useService('media_player').select_source({ entity_id: zoneEntityId, source: selectedSource })
        console.log(`Toggled zone ${zoneId} for source ${selectedSource}`);
    }, [selectedSource]);

    // Update zone volume
    const updateZoneVolume = useCallback((zoneId: string, volume: number) => {
        setZones((prev) =>
            prev.map((zone) =>
                zone.id === zoneId ? { ...zone, volume } : zone
            )
        );
    }, []);

    // Get source color
    const getSourceColor = (sourceId: string) => {
        return AUDIO_SOURCES.find((s) => s.id === sourceId)?.color || '#00d4ff';
    };

    const activeColor = getSourceColor(selectedSource);
    const activeZonesCount = zones.filter((z) => z.isPlaying).length;

    return (
        <AnimatePresence>
            {audioMatrixOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
                        onClick={closeAudioMatrix}
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-hidden"
                    >
                        <div className="bg-gradient-to-b from-background-lighter to-background rounded-t-3xl border-t border-glass-border">
                            {/* Handle */}
                            <div className="flex justify-center py-3">
                                <div className="w-12 h-1 bg-white/20 rounded-full" />
                            </div>

                            {/* Header */}
                            <div className="flex items-center justify-between px-6 pb-4">
                                <div>
                                    <h2 className="text-xl font-semibold text-white">Audio Routing</h2>
                                    <p className="text-sm text-white/50">
                                        {activeZonesCount} zone{activeZonesCount !== 1 ? 's' : ''} active
                                    </p>
                                </div>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={closeAudioMatrix}
                                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                                >
                                    <FiX size={20} />
                                </motion.button>
                            </div>

                            {/* Content */}
                            <div className="px-6 pb-8 overflow-y-auto max-h-[calc(85vh-100px)]">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Sources Column */}
                                    <div>
                                        <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-4">
                                            Audio Sources
                                        </h3>
                                        <div className="space-y-2">
                                            {AUDIO_SOURCES.map((source) => {
                                                const isSelected = selectedSource === source.id;
                                                return (
                                                    <motion.button
                                                        key={source.id}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => setSelectedSource(source.id)}
                                                        className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all duration-200 ${isSelected
                                                                ? 'border-2'
                                                                : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                                                            }`}
                                                        style={{
                                                            background: isSelected ? `${source.color}15` : undefined,
                                                            borderColor: isSelected ? `${source.color}50` : 'transparent',
                                                        }}
                                                    >
                                                        <div
                                                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                                                            style={{
                                                                background: isSelected ? `${source.color}30` : 'rgba(255,255,255,0.1)',
                                                                color: isSelected ? source.color : 'rgba(255,255,255,0.5)',
                                                            }}
                                                        >
                                                            {source.icon}
                                                        </div>
                                                        <div className="flex-1 text-left">
                                                            <p
                                                                className="font-medium"
                                                                style={{ color: isSelected ? source.color : 'white' }}
                                                            >
                                                                {source.name}
                                                            </p>
                                                            <p className="text-xs text-white/40">
                                                                {source.isActive ? 'Now Playing' : 'Available'}
                                                            </p>
                                                        </div>
                                                        {isSelected && (
                                                            <motion.div
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                className="w-6 h-6 rounded-full flex items-center justify-center"
                                                                style={{ background: source.color }}
                                                            >
                                                                <FiCheck size={14} className="text-white" />
                                                            </motion.div>
                                                        )}
                                                    </motion.button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Zones Column */}
                                    <div>
                                        <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-4">
                                            Output Zones
                                        </h3>
                                        <div className="space-y-2">
                                            {zones.map((zone) => (
                                                <motion.div
                                                    key={zone.id}
                                                    layout
                                                    className={`p-4 rounded-xl transition-all duration-200 ${zone.isPlaying
                                                            ? 'border'
                                                            : 'bg-white/5 border border-transparent'
                                                        }`}
                                                    style={{
                                                        background: zone.isPlaying ? `${activeColor}10` : undefined,
                                                        borderColor: zone.isPlaying ? `${activeColor}30` : 'transparent',
                                                    }}
                                                >
                                                    <div className="flex items-center gap-4 mb-3">
                                                        {/* Toggle button */}
                                                        <motion.button
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => toggleZone(zone.id)}
                                                            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${zone.isPlaying
                                                                    ? ''
                                                                    : 'bg-white/10 text-white/40'
                                                                }`}
                                                            style={{
                                                                background: zone.isPlaying ? `${activeColor}30` : undefined,
                                                                color: zone.isPlaying ? activeColor : undefined,
                                                                boxShadow: zone.isPlaying
                                                                    ? `0 0 20px ${activeColor}30`
                                                                    : undefined,
                                                            }}
                                                        >
                                                            <FiVolume2 size={20} />
                                                        </motion.button>

                                                        <div className="flex-1">
                                                            <p
                                                                className="font-medium"
                                                                style={{ color: zone.isPlaying ? 'white' : 'rgba(255,255,255,0.6)' }}
                                                            >
                                                                {zone.name}
                                                            </p>
                                                            <p className="text-xs text-white/40">
                                                                {zone.isPlaying ? 'Playing' : 'Tap to join'}
                                                            </p>
                                                        </div>

                                                        {/* Status toggle */}
                                                        <motion.div
                                                            className="w-14 h-7 rounded-full cursor-pointer relative"
                                                            style={{
                                                                background: zone.isPlaying
                                                                    ? `linear-gradient(135deg, ${activeColor}, ${activeColor}80)`
                                                                    : 'rgba(255,255,255,0.1)',
                                                            }}
                                                            onClick={() => toggleZone(zone.id)}
                                                        >
                                                            <motion.div
                                                                className="absolute top-1 w-5 h-5 rounded-full bg-white"
                                                                animate={{ left: zone.isPlaying ? '30px' : '4px' }}
                                                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                                            />
                                                        </motion.div>
                                                    </div>

                                                    {/* Volume slider (only when active) */}
                                                    <AnimatePresence>
                                                        {zone.isPlaying && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="flex items-center gap-3 pt-2">
                                                                    <FiVolume2 size={14} className="text-white/40" />
                                                                    <input
                                                                        type="range"
                                                                        min="0"
                                                                        max="100"
                                                                        value={zone.volume * 100}
                                                                        onChange={(e) =>
                                                                            updateZoneVolume(zone.id, parseInt(e.target.value) / 100)
                                                                        }
                                                                        className="flex-1 h-1.5 appearance-none rounded-full"
                                                                        style={{
                                                                            background: `linear-gradient(to right, ${activeColor} ${zone.volume * 100
                                                                                }%, rgba(255,255,255,0.1) ${zone.volume * 100}%)`,
                                                                        }}
                                                                    />
                                                                    <span className="text-xs text-white/50 w-8 text-right">
                                                                        {Math.round(zone.volume * 100)}%
                                                                    </span>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Quick actions */}
                                <div className="mt-6 pt-6 border-t border-white/10">
                                    <div className="flex flex-wrap gap-3">
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() =>
                                                setZones((prev) =>
                                                    prev.map((z) => ({ ...z, isPlaying: true }))
                                                )
                                            }
                                            className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                                            style={{
                                                background: `${activeColor}20`,
                                                color: activeColor,
                                                border: `1px solid ${activeColor}30`,
                                            }}
                                        >
                                            Play Everywhere
                                        </motion.button>
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() =>
                                                setZones((prev) =>
                                                    prev.map((z) => ({ ...z, isPlaying: false }))
                                                )
                                            }
                                            className="px-4 py-2 rounded-xl bg-white/5 text-white/60 text-sm font-medium hover:bg-white/10 transition-colors"
                                        >
                                            Stop All
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
