import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiPlay,
    FiPause,
    FiSkipBack,
    FiSkipForward,
    FiVolume2,
    FiUsers,
    FiPower,
    FiSliders,
    FiX,
    FiChevronUp,
    FiChevronDown
} from 'react-icons/fi';
import { useApp } from '@/context';

// Audio sources with icons
const AUDIO_SOURCES = [
    { id: 'tidal', name: 'TIDAL', color: '#00FFFF', icon: '⬡' },
    { id: 'spotify', name: 'Spotify', color: '#1DB954', icon: '●' },
    { id: 'netflix', name: 'Netflix', color: '#E50914', icon: 'N' },
    { id: 'youtube', name: 'YouTube', color: '#FF0000', icon: '▶' },
    { id: 'airplay', name: 'AirPlay', color: '#FFFFFF', icon: '◎' },
    { id: 'soundcloud', name: 'SoundCloud', color: '#FF5500', icon: '☁' },
];

interface RussoundMiniPlayerProps {
    roomName: string;
    className?: string;
}

export default function RussoundMiniPlayer({ roomName, className = '' }: RussoundMiniPlayerProps) {
    const { openMusicPlayer } = useApp();

    // Local state
    const [isPlaying, setIsPlaying] = useState(true);
    const [volume, setVolume] = useState(45);
    const [bass, setBass] = useState(60);
    const [treble, setTreble] = useState(55);
    const [partyMode, setPartyMode] = useState(false);
    const [currentSourceIndex, setCurrentSourceIndex] = useState(1); // Spotify
    const [isOn, setIsOn] = useState(true);
    const [activeSettings, setActiveSettings] = useState(false);
    const [isScrolling, setIsScrolling] = useState(false);

    const wheelRef = useRef<HTMLDivElement>(null);
    const activeSource = AUDIO_SOURCES[currentSourceIndex];

    // Slider style helper
    const getSliderStyle = (val: number, color: string = '#22d3ee') => ({
        background: `linear-gradient(to right, ${color} ${val}%, rgba(255,255,255,0.1) ${val}%)`
    });

    // Navigate to next/prev source with animation
    const navigateSource = useCallback((direction: 'up' | 'down') => {
        setIsScrolling(true);
        setCurrentSourceIndex(prev => {
            if (direction === 'up') {
                return prev <= 0 ? AUDIO_SOURCES.length - 1 : prev - 1;
            } else {
                return prev >= AUDIO_SOURCES.length - 1 ? 0 : prev + 1;
            }
        });
        setTimeout(() => setIsScrolling(false), 300);
    }, []);

    // Mouse wheel handler for the source wheel
    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        if (isScrolling) return;

        if (e.deltaY > 0) {
            navigateSource('down');
        } else if (e.deltaY < 0) {
            navigateSource('up');
        }
    }, [isScrolling, navigateSource]);

    // Get visible sources (prev, current, next)
    const getVisibleSources = () => {
        const prevIndex = currentSourceIndex === 0 ? AUDIO_SOURCES.length - 1 : currentSourceIndex - 1;
        const nextIndex = currentSourceIndex === AUDIO_SOURCES.length - 1 ? 0 : currentSourceIndex + 1;
        const prevPrevIndex = prevIndex === 0 ? AUDIO_SOURCES.length - 1 : prevIndex - 1;
        const nextNextIndex = nextIndex === AUDIO_SOURCES.length - 1 ? 0 : nextIndex + 1;

        return [
            { ...AUDIO_SOURCES[prevPrevIndex], position: -2 },
            { ...AUDIO_SOURCES[prevIndex], position: -1 },
            { ...AUDIO_SOURCES[currentSourceIndex], position: 0 },
            { ...AUDIO_SOURCES[nextIndex], position: 1 },
            { ...AUDIO_SOURCES[nextNextIndex], position: 2 },
        ];
    };

    return (
        <motion.div
            className={`rounded-3xl shadow-xl flex flex-col overflow-hidden relative group ${className}`}
            style={{
                background: 'linear-gradient(to bottom, #1a1a2e, #16213e, #0f0f1a)',
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 flex-shrink-0 z-10 transition-colors duration-300 hover:border-white/10">
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOn(!isOn)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isOn
                        ? 'bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                        : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
                        }`}
                >
                    <FiPower size={14} />
                </motion.button>

                <div className="text-center">
                    <h1 className="text-sm font-medium text-white/90 tracking-wide">{roomName}</h1>
                    <p className="text-[10px] text-cyan-400/80 uppercase tracking-widest font-semibold mt-0.5">Now Playing</p>
                </div>

                <div className="flex gap-2">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setPartyMode(!partyMode)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${partyMode
                            ? 'bg-purple-500/10 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                            : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
                            }`}
                    >
                        <FiUsers size={14} />
                    </motion.button>

                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setActiveSettings(!activeSettings)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${activeSettings
                            ? 'bg-white/20 text-white'
                            : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
                            }`}
                    >
                        {activeSettings ? <FiX size={14} /> : <FiSliders size={14} />}
                    </motion.button>
                </div>
            </div>

            {/* Main Content */}
            <div className={`flex-1 flex flex-col px-6 py-5 relative transition-all duration-500 ${!isOn ? 'opacity-30 pointer-events-none grayscale scale-[0.98]' : ''}`}>

                <AnimatePresence mode="wait">
                    {!activeSettings ? (
                        <motion.div
                            key="player"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex flex-col h-full"
                        >
                            {/* Now Playing Info */}
                            <div role="button" onClick={openMusicPlayer} className="flex gap-5 mb-6 group/info cursor-pointer items-center">
                                <div
                                    className="w-20 h-20 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 transition-all duration-500 group-hover/info:scale-105 group-hover/info:shadow-cyan-500/20"
                                    style={{ boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.5)' }}
                                >
                                    <img
                                        src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300"
                                        alt="Album"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-xs" style={{ color: activeSource.color }}>{activeSource.icon}</span>
                                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">{activeSource.name}</span>
                                    </div>
                                    <h2 className="text-lg font-bold text-white truncate leading-tight group-hover/info:text-cyan-400 transition-colors">Midnight City</h2>
                                    <p className="text-xs text-white/50 truncate font-medium">M83</p>
                                </div>
                            </div>

                            {/* Progress Bar (Visual Only) */}
                            <div className="mb-8 group/progress">
                                <div className="flex-1 relative h-1 bg-white/5 rounded-full overflow-hidden transition-all duration-300 group-hover/progress:h-1.5">
                                    <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.3)]" style={{ width: '65%' }} />
                                </div>
                                <div className="flex justify-between mt-2 text-[10px] font-medium text-white/20 transition-colors duration-300 group-hover/progress:text-white/40">
                                    <span>2:45</span>
                                    <span>4:03</span>
                                </div>
                            </div>

                            {/* Playback Controls */}
                            <div className="flex items-center justify-center gap-8 mb-auto">
                                <motion.button
                                    whileHover={{ scale: 1.1, color: 'rgba(255,255,255,1)' }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-3 rounded-full text-white/40 hover:bg-white/5 transition-all duration-300"
                                >
                                    <FiSkipBack size={20} />
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className="w-16 h-16 rounded-full flex items-center justify-center text-white transition-all duration-300 relative group/play"
                                >
                                    <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-white/5 blur-md transition-opacity duration-300 ${isPlaying ? 'opacity-100' : 'opacity-50 group-hover/play:opacity-80'}`} />
                                    <div className="absolute inset-0 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm" />
                                    <div className={`absolute inset-0 rounded-full opacity-0 transition-opacity duration-500 ${isPlaying ? 'opacity-20 shadow-[0_0_30px_rgba(34,211,238,0.4)]' : ''}`} />

                                    {isPlaying ? <FiPause size={24} className="relative z-10 fill-current" /> : <FiPlay size={24} className="relative z-10 ml-1 fill-current" />}
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.1, color: 'rgba(255,255,255,1)' }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-3 rounded-full text-white/40 hover:bg-white/5 transition-all duration-300"
                                >
                                    <FiSkipForward size={20} />
                                </motion.button>
                            </div>

                            {/* Volume */}
                            <div className="flex items-center gap-4 group/vol mt-6">
                                <div className={`p-2 rounded-lg transition-colors duration-300 ${volume > 0 ? 'text-cyan-400 bg-cyan-400/10' : 'text-white/30 bg-white/5'}`}>
                                    <FiVolume2 size={16} />
                                </div>
                                <div className="flex-1 relative h-2 rounded-full bg-white/5 overflow-hidden">
                                    <input
                                        type="range" min="0" max="100" value={volume}
                                        onChange={(e) => setVolume(parseInt(e.target.value))}
                                        className="w-full h-full appearance-none cursor-pointer absolute inset-0 z-10 opacity-0"
                                    />
                                    <div className="w-full h-full absolute top-0 left-0 pointer-events-none transition-all duration-300" style={getSliderStyle(volume)} />
                                </div>
                            </div>

                            {/* Modern Scroll Wheel Source Selector */}
                            <div className="mt-6 flex items-center justify-center gap-4">
                                {/* Up Arrow */}
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => navigateSource('up')}
                                    className="p-2 rounded-full text-white/30 hover:text-white hover:bg-white/10 transition-all"
                                >
                                    <FiChevronUp size={18} />
                                </motion.button>

                                {/* Vertical Wheel */}
                                <div
                                    ref={wheelRef}
                                    onWheel={handleWheel}
                                    className="relative h-28 w-40 overflow-hidden cursor-ns-resize select-none"
                                    style={{ perspective: '400px' }}
                                >
                                    {/* Selection Highlight Window */}
                                    <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-10 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm z-0 shadow-[0_0_20px_rgba(34,211,238,0.1)]" />

                                    {/* Fade gradients */}
                                    <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-[#16213e] to-transparent z-10 pointer-events-none" />
                                    <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#16213e] to-transparent z-10 pointer-events-none" />

                                    {/* Wheel Items */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <AnimatePresence mode="popLayout">
                                            {getVisibleSources().map((source) => {
                                                const pos = source.position;
                                                const isCenter = pos === 0;

                                                // 3D wheel transforms
                                                const rotateX = pos * -25;
                                                const translateY = pos * 22;
                                                const translateZ = isCenter ? 20 : -Math.abs(pos) * 30;
                                                const scale = isCenter ? 1 : Math.max(0.6, 1 - Math.abs(pos) * 0.2);
                                                const opacity = isCenter ? 1 : Math.max(0.2, 1 - Math.abs(pos) * 0.4);

                                                return (
                                                    <motion.div
                                                        key={`${source.id}-${pos}`}
                                                        initial={{ opacity: 0, y: pos > 0 ? 30 : -30 }}
                                                        animate={{
                                                            opacity,
                                                            y: translateY,
                                                            rotateX,
                                                            scale,
                                                            z: translateZ,
                                                        }}
                                                        exit={{ opacity: 0, y: pos > 0 ? -30 : 30 }}
                                                        transition={{
                                                            type: 'spring',
                                                            stiffness: 300,
                                                            damping: 30
                                                        }}
                                                        onClick={() => {
                                                            if (pos === -1) navigateSource('up');
                                                            if (pos === 1) navigateSource('down');
                                                        }}
                                                        className={`absolute flex items-center gap-3 px-4 py-2 rounded-xl transition-all cursor-pointer ${isCenter
                                                                ? 'text-white'
                                                                : 'text-white/40 hover:text-white/60'
                                                            }`}
                                                        style={{
                                                            transformStyle: 'preserve-3d',
                                                            backfaceVisibility: 'hidden',
                                                        }}
                                                    >
                                                        <span
                                                            className={`text-xl transition-all duration-300 ${isCenter ? 'drop-shadow-[0_0_8px_currentColor]' : ''}`}
                                                            style={{ color: isCenter ? source.color : 'inherit' }}
                                                        >
                                                            {source.icon}
                                                        </span>
                                                        <span className={`font-bold uppercase tracking-wider transition-all ${isCenter ? 'text-sm' : 'text-[10px]'
                                                            }`}>
                                                            {source.name}
                                                        </span>
                                                    </motion.div>
                                                );
                                            })}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* Down Arrow */}
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => navigateSource('down')}
                                    className="p-2 rounded-full text-white/30 hover:text-white hover:bg-white/10 transition-all"
                                >
                                    <FiChevronDown size={18} />
                                </motion.button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="settings"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex flex-col h-full justify-center gap-8"
                        >
                            <div className="text-center mb-4">
                                <h3 className="text-lg font-bold text-white">Audio Settings</h3>
                                <p className="text-sm text-white/40">Equalizer & Config</p>
                            </div>

                            {/* Bass */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Bass</span>
                                    <span className="text-xs font-mono text-purple-400">{bass}%</span>
                                </div>
                                <div className="h-10 bg-[#0a0d14] rounded-xl relative flex items-center px-4 overflow-hidden shadow-inner border border-white/5">
                                    <div
                                        className="absolute inset-y-0 left-0 bg-purple-500/20"
                                        style={{ width: `${bass}%` }}
                                    />
                                    <input
                                        type="range" min="0" max="100" value={bass}
                                        onChange={(e) => setBass(parseInt(e.target.value))}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden relative">
                                        <div
                                            className="absolute inset-y-0 left-0 bg-purple-500 rounded-full"
                                            style={{ width: `${bass}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Treble */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Treble</span>
                                    <span className="text-xs font-mono text-amber-400">{treble}%</span>
                                </div>
                                <div className="h-10 bg-[#0a0d14] rounded-xl relative flex items-center px-4 overflow-hidden shadow-inner border border-white/5">
                                    <div
                                        className="absolute inset-y-0 left-0 bg-amber-500/20"
                                        style={{ width: `${treble}%` }}
                                    />
                                    <input
                                        type="range" min="0" max="100" value={treble}
                                        onChange={(e) => setTreble(parseInt(e.target.value))}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden relative">
                                        <div
                                            className="absolute inset-y-0 left-0 bg-amber-500 rounded-full"
                                            style={{ width: `${treble}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto flex gap-3">
                                <button
                                    onClick={() => {
                                        setBass(50);
                                        setTreble(50);
                                    }}
                                    className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-xs font-bold text-white/40 hover:text-white uppercase tracking-wider transition-all"
                                >
                                    Reset to Default
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
