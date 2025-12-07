import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiPower,
    FiX,
    FiStar,
    FiShuffle,
    FiSkipBack,
    FiPlay,
    FiPause,
    FiSkipForward,
    FiRepeat,
    FiVolume2,
    FiChevronLeft,
    FiChevronRight,
    FiGrid,
} from 'react-icons/fi';
import { useApp } from '@/context';

// Zone configuration for 9-zone Russound amplifier
interface AudioZone {
    id: string;
    name: string;
    isOn: boolean;
    volume: number;
    source: string;
    isMuted: boolean;
}

// Audio source types
interface AudioSource {
    id: string;
    name: string;
    icon: string;
    color: string;
}

// Track information
interface Track {
    title: string;
    artist: string;
    album: string;
    albumArt: string;
    duration: number;
    position: number;
    source: string;
}

// Favorite item
interface FavoriteItem {
    id: string;
    title: string;
    albumArt: string;
    source: string;
    sourceIcon: string;
}

// Available sources for Russound
const SOURCES: AudioSource[] = [
    { id: 'tidal', name: 'TIDAL', icon: '⬡', color: '#00FFFF' },
    { id: 'spotify', name: 'SPOTIFY', icon: '●', color: '#1DB954' },
    { id: 'tunein', name: 'TUNEIN', icon: '◉', color: '#14D8CC' },
    { id: 'siriusxm', name: 'SIRUSXM', icon: '★', color: '#0033A0' },
    { id: 'airplay', name: 'AIRPLAY', icon: '◎', color: '#FFFFFF' },
    { id: 'airable', name: 'AIRABLE RADIO', icon: '◈', color: '#FF6B35' },
];

// 9 Russound zones
const INITIAL_ZONES: AudioZone[] = [
    { id: 'zone-1', name: 'Living Room', isOn: true, volume: 45, source: 'tidal', isMuted: false },
    { id: 'zone-2', name: 'Kitchen', isOn: true, volume: 30, source: 'spotify', isMuted: false },
    { id: 'zone-3', name: 'Dining', isOn: false, volume: 25, source: 'tidal', isMuted: false },
    { id: 'zone-4', name: 'Veranda', isOn: true, volume: 55, source: 'tidal', isMuted: false },
    { id: 'zone-5', name: 'Bedroom 1', isOn: false, volume: 20, source: 'tunein', isMuted: false },
    { id: 'zone-6', name: 'Bedroom 2', isOn: false, volume: 25, source: 'spotify', isMuted: false },
    { id: 'zone-7', name: 'Office', isOn: true, volume: 35, source: 'tidal', isMuted: false },
    { id: 'zone-8', name: 'Bathroom', isOn: false, volume: 40, source: 'tunein', isMuted: false },
    { id: 'zone-9', name: 'Garage', isOn: false, volume: 50, source: 'spotify', isMuted: false },
];

// Sample favorites
const FAVORITES: FavoriteItem[] = [
    { id: 'fav-1', title: 'Midnight City', albumArt: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200', source: 'SIRUSXM', sourceIcon: '★' },
    { id: 'fav-2', title: 'Blinding Lights', albumArt: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=200', source: 'TUNEIN', sourceIcon: '◉' },
    { id: 'fav-3', title: 'New Roads', albumArt: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=200', source: 'TIDAL', sourceIcon: '⬡' },
    { id: 'fav-4', title: 'Starboy', albumArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200', source: 'AIRABLE RADIO', sourceIcon: '◈' },
    { id: 'fav-5', title: 'Levitating', albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200', source: 'SPOTIFY', sourceIcon: '●' },
];

// View tabs
type ViewTab = 'player' | 'zones';

export default function RussoundPlayerModal() {
    const { musicPlayerOpen, closeMusicPlayer } = useApp();
    const [activeView, setActiveView] = useState<ViewTab>('player');
    const [zones, setZones] = useState<AudioZone[]>(INITIAL_ZONES);
    const [currentZoneIndex, setCurrentZoneIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isShuffle, setIsShuffle] = useState(false);
    const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
    const [isFavorited, setIsFavorited] = useState(false);

    // Current track (mock data)
    const [track, setTrack] = useState<Track>({
        title: 'New Roads',
        artist: 'Phineas Brinker',
        album: 'Elevations',
        albumArt: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
        duration: 259,
        position: 225,
        source: 'tidal',
    });

    const currentZone = zones[currentZoneIndex];

    // Simulate track progress
    useEffect(() => {
        if (!isPlaying || !musicPlayerOpen) return;
        const interval = setInterval(() => {
            setTrack((prev) => ({
                ...prev,
                position: prev.position >= prev.duration ? 0 : prev.position + 1,
            }));
        }, 1000);
        return () => clearInterval(interval);
    }, [isPlaying, musicPlayerOpen]);

    // Format time as mm:ss
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Zone controls
    const toggleZonePower = useCallback(() => {
        setZones((prev) =>
            prev.map((z, i) => (i === currentZoneIndex ? { ...z, isOn: !z.isOn } : z))
        );
    }, [currentZoneIndex]);

    const setZoneVolume = useCallback(
        (volume: number) => {
            setZones((prev) =>
                prev.map((z, i) => (i === currentZoneIndex ? { ...z, volume } : z))
            );
        },
        [currentZoneIndex]
    );

    const cycleZone = useCallback(
        (direction: 'next' | 'prev') => {
            setCurrentZoneIndex((prev) => {
                if (direction === 'next') {
                    return prev >= zones.length - 1 ? 0 : prev + 1;
                }
                return prev <= 0 ? zones.length - 1 : prev - 1;
            });
        },
        [zones.length]
    );

    // Get source info
    const currentSource = SOURCES.find((s) => s.id === track.source) || SOURCES[0];
    const progressPercent = (track.position / track.duration) * 100;

    return (
        <AnimatePresence>
            {musicPlayerOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeMusicPlayer}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal Container - Flexbox centering */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="w-full max-w-[600px] max-h-[80vh] rounded-3xl overflow-hidden flex flex-col pointer-events-auto"
                            style={{
                                background: 'linear-gradient(to bottom, #1a1a2e, #16213e, #0f0f1a)',
                            }}
                        >
                            {/* Header */}
                            <header className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0">
                                {/* Left controls */}
                                <div className="flex items-center gap-2">
                                    {/* Power button */}
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={toggleZonePower}
                                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${currentZone.isOn
                                            ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_12px_rgba(0,255,255,0.3)]'
                                            : 'bg-white/5 text-white/40'
                                            }`}
                                    >
                                        <FiPower size={18} />
                                    </motion.button>
                                </div>

                                {/* Zone selector */}
                                <div className="flex items-center gap-2">
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => cycleZone('prev')}
                                        className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white"
                                    >
                                        <FiChevronLeft size={16} />
                                    </motion.button>
                                    <div className="text-center min-w-[100px]">
                                        <h1 className="text-base font-medium text-white">{currentZone.name}</h1>
                                        <p className="text-[10px] text-cyan-400 uppercase tracking-wider">Now Playing</p>
                                    </div>
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => cycleZone('next')}
                                        className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white"
                                    >
                                        <FiChevronRight size={16} />
                                    </motion.button>
                                </div>

                                {/* Right actions */}
                                <div className="flex items-center gap-2">
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setIsFavorited(!isFavorited)}
                                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${isFavorited ? 'text-yellow-400' : 'text-white/50 hover:text-white'
                                            }`}
                                    >
                                        <FiStar size={18} fill={isFavorited ? 'currentColor' : 'none'} />
                                    </motion.button>
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={closeMusicPlayer}
                                        className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10"
                                    >
                                        <FiX size={18} />
                                    </motion.button>
                                </div>
                            </header>

                            {/* View tabs */}
                            <div className="flex px-5 pt-3 gap-2 flex-shrink-0">
                                <button
                                    onClick={() => setActiveView('player')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeView === 'player'
                                        ? 'bg-cyan-500/20 text-cyan-400'
                                        : 'text-white/50 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    Player
                                </button>
                                <button
                                    onClick={() => setActiveView('zones')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeView === 'zones'
                                        ? 'bg-cyan-500/20 text-cyan-400'
                                        : 'text-white/50 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <FiGrid size={14} />
                                    Zones ({zones.filter((z) => z.isOn).length}/9)
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto px-5 py-4">
                                <AnimatePresence mode="wait">
                                    {activeView === 'player' && (
                                        <motion.div
                                            key="player"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                        >
                                            {/* Now Playing section */}
                                            <div className="flex gap-4 mb-6">
                                                {/* Album art */}
                                                <div
                                                    className="w-28 h-28 rounded-xl overflow-hidden shadow-xl flex-shrink-0"
                                                    style={{ boxShadow: '0 0 30px rgba(0, 255, 255, 0.15)' }}
                                                >
                                                    <img
                                                        src={track.albumArt}
                                                        alt={track.album}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>

                                                {/* Track info */}
                                                <div className="flex-1 flex flex-col justify-center min-w-0">
                                                    {/* Source badge */}
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-sm" style={{ color: currentSource.color }}>
                                                            {currentSource.icon}
                                                        </span>
                                                        <span className="text-xs font-medium text-white/40">
                                                            {currentSource.name}
                                                        </span>
                                                    </div>

                                                    {/* Album */}
                                                    <p className="text-xs text-white/50 mb-0.5 truncate">{track.album}</p>

                                                    {/* Title */}
                                                    <h2 className="text-xl font-bold text-white mb-1 truncate">{track.title}</h2>

                                                    {/* Artist */}
                                                    <p className="text-sm text-white/60 truncate">{track.artist}</p>
                                                </div>
                                            </div>

                                            {/* Progress bar */}
                                            <div className="mb-5">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs text-cyan-400 w-10 text-right">
                                                        {formatTime(track.position)}
                                                    </span>
                                                    <div className="flex-1 relative h-1 bg-white/10 rounded-full overflow-hidden">
                                                        <motion.div
                                                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-400 to-cyan-300 rounded-full"
                                                            style={{ width: `${progressPercent}%` }}
                                                        />
                                                        <div
                                                            className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-lg"
                                                            style={{ left: `calc(${progressPercent}% - 5px)` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-white/40 w-10">
                                                        {formatTime(track.duration)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Playback controls */}
                                            <div className="flex items-center justify-center gap-4 mb-6">
                                                <motion.button
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => setIsShuffle(!isShuffle)}
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isShuffle ? 'text-cyan-400' : 'text-white/40 hover:text-white'
                                                        }`}
                                                >
                                                    <FiShuffle size={18} />
                                                </motion.button>

                                                <motion.button
                                                    whileTap={{ scale: 0.9 }}
                                                    className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                                                >
                                                    <FiSkipBack size={20} />
                                                </motion.button>

                                                <motion.button
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => setIsPlaying(!isPlaying)}
                                                    className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                                                    style={{
                                                        boxShadow: isPlaying ? '0 0 15px rgba(0, 255, 255, 0.25)' : undefined,
                                                    }}
                                                >
                                                    {isPlaying ? <FiPause size={22} /> : <FiPlay size={22} className="ml-0.5" />}
                                                </motion.button>

                                                <motion.button
                                                    whileTap={{ scale: 0.9 }}
                                                    className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                                                >
                                                    <FiSkipForward size={20} />
                                                </motion.button>

                                                <motion.button
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() =>
                                                        setRepeatMode((prev) =>
                                                            prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off'
                                                        )
                                                    }
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors relative ${repeatMode !== 'off' ? 'text-cyan-400' : 'text-white/40 hover:text-white'
                                                        }`}
                                                >
                                                    <FiRepeat size={18} />
                                                    {repeatMode === 'one' && (
                                                        <span className="absolute text-[8px] font-bold">1</span>
                                                    )}
                                                </motion.button>
                                            </div>

                                            {/* Volume control */}
                                            <div className="flex items-center gap-3 mb-5">
                                                <FiVolume2 size={16} className="text-white/50" />
                                                <span className="text-xs text-white/50 w-6">{currentZone.volume}</span>
                                                <div className="flex-1 relative">
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="100"
                                                        value={currentZone.volume}
                                                        onChange={(e) => setZoneVolume(parseInt(e.target.value))}
                                                        className="w-full h-1 appearance-none rounded-full cursor-pointer"
                                                        style={{
                                                            background: `linear-gradient(to right, #22d3ee ${currentZone.volume}%, rgba(255,255,255,0.1) ${currentZone.volume}%)`,
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Favorites row */}
                                            <div>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <FiStar className="text-white/40" size={14} />
                                                    <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider">
                                                        Favorites
                                                    </h3>
                                                </div>

                                                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                                    {FAVORITES.map((fav) => (
                                                        <motion.div
                                                            key={fav.id}
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            className="flex-shrink-0 w-20 cursor-pointer"
                                                        >
                                                            <div className="w-20 h-20 rounded-lg overflow-hidden mb-1.5 bg-white/5">
                                                                <img
                                                                    src={fav.albumArt}
                                                                    alt={fav.title}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                            <p className="text-xs text-white/70 truncate">{fav.title}</p>
                                                            <p className="text-[10px] text-white/40 flex items-center gap-1">
                                                                <span>{fav.sourceIcon}</span>
                                                                {fav.source}
                                                            </p>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeView === 'zones' && (
                                        <motion.div
                                            key="zones"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                        >
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {zones.map((zone, index) => (
                                                    <motion.div
                                                        key={zone.id}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => {
                                                            setCurrentZoneIndex(index);
                                                            setActiveView('player');
                                                        }}
                                                        className={`p-3 rounded-xl cursor-pointer transition-all ${zone.isOn
                                                            ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/30'
                                                            : 'bg-white/5 border border-white/5'
                                                            }`}
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h3 className="text-sm font-medium text-white truncate">{zone.name}</h3>
                                                            <div
                                                                className={`w-2 h-2 rounded-full flex-shrink-0 ${zone.isOn ? 'bg-cyan-400 shadow-[0_0_6px_#22d3ee]' : 'bg-white/20'
                                                                    }`}
                                                            />
                                                        </div>
                                                        <div className="flex items-center justify-between text-xs text-white/50">
                                                            <span>{zone.isOn ? 'Playing' : 'Off'}</span>
                                                            {zone.isOn && (
                                                                <span className="flex items-center gap-1">
                                                                    <FiVolume2 size={12} />
                                                                    {zone.volume}%
                                                                </span>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
