import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiPower,
    FiMoreVertical,
    FiStar,
    FiShuffle,
    FiSkipBack,
    FiPlay,
    FiPause,
    FiSkipForward,
    FiRepeat,
    FiVolume2,
    FiCalendar,
    FiGrid,
    FiMusic,
    FiFolder,
    FiHome,

    FiChevronLeft,
    FiChevronRight,
} from 'react-icons/fi';

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
    { id: 'fav-1', title: 'Phineas Brinker', albumArt: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200', source: 'SIRUSXM', sourceIcon: '★' },
    { id: 'fav-2', title: 'Phineas Brinker', albumArt: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=200', source: 'TUNEIN', sourceIcon: '◉' },
    { id: 'fav-3', title: 'Phineas Brinker', albumArt: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=200', source: 'TIDAL', sourceIcon: '⬡' },
    { id: 'fav-4', title: 'Phineas Brinker', albumArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200', source: 'AIRABLE RADIO', sourceIcon: '◈' },
    { id: 'fav-5', title: 'Phineas Brinker', albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200', source: 'SPOTIFY', sourceIcon: '●' },
];

// Navigation tabs
type NavTab = 'schedule' | 'rooms' | 'now-playing' | 'browse' | 'favorites';

export default function RussoundPlayer() {
    const [activeTab, setActiveTab] = useState<NavTab>('now-playing');
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
        duration: 259, // 4:19
        position: 225, // 3:45
        source: 'tidal',
    });

    const currentZone = zones[currentZoneIndex];

    // Simulate track progress
    useEffect(() => {
        if (!isPlaying) return;
        const interval = setInterval(() => {
            setTrack((prev) => ({
                ...prev,
                position: prev.position >= prev.duration ? 0 : prev.position + 1,
            }));
        }, 1000);
        return () => clearInterval(interval);
    }, [isPlaying]);

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
        <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f0f1a] text-white">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                {/* Left controls */}
                <div className="flex items-center gap-2">
                    {/* Home button - back to dashboard */}
                    <Link to="/">
                        <motion.div
                            whileTap={{ scale: 0.9 }}
                            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
                        >
                            <FiHome size={20} />
                        </motion.div>
                    </Link>

                    {/* Power button */}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleZonePower}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${currentZone.isOn
                            ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.3)]'
                            : 'bg-white/5 text-white/40'
                            }`}
                    >
                        <FiPower size={20} />
                    </motion.button>
                </div>

                {/* Zone selector */}
                <div className="flex items-center gap-3">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => cycleZone('prev')}
                        className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white"
                    >
                        <FiChevronLeft size={18} />
                    </motion.button>
                    <div className="text-center min-w-[120px]">
                        <h1 className="text-lg font-medium">{currentZone.name}</h1>
                        <p className="text-xs text-cyan-400">Now Playing</p>
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => cycleZone('next')}
                        className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white"
                    >
                        <FiChevronRight size={18} />
                    </motion.button>
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-3">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white/50 hover:text-white"
                    >
                        <FiMoreVertical size={20} />
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsFavorited(!isFavorited)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isFavorited ? 'text-yellow-400' : 'text-white/50 hover:text-white'
                            }`}
                    >
                        <FiStar size={20} fill={isFavorited ? 'currentColor' : 'none'} />
                    </motion.button>
                </div>
            </header>

            {/* Main content */}
            <main className="px-6 py-6">
                <AnimatePresence mode="wait">
                    {activeTab === 'now-playing' && (
                        <motion.div
                            key="now-playing"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            {/* Now Playing section */}
                            <div className="flex gap-6 mb-8">
                                {/* Album art */}
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="w-36 h-36 md:w-44 md:h-44 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0"
                                    style={{
                                        boxShadow: '0 0 40px rgba(0, 255, 255, 0.2)',
                                    }}
                                >
                                    <img
                                        src={track.albumArt}
                                        alt={track.album}
                                        className="w-full h-full object-cover"
                                    />
                                </motion.div>

                                {/* Track info */}
                                <div className="flex-1 flex flex-col justify-center">
                                    {/* Source badge */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <span
                                            className="text-lg"
                                            style={{ color: currentSource.color }}
                                        >
                                            {currentSource.icon}
                                        </span>
                                        <span className="text-sm font-medium text-white/50">
                                            {currentSource.name}
                                        </span>
                                    </div>

                                    {/* Album */}
                                    <p className="text-sm text-white/60 mb-1">{track.album}</p>

                                    {/* Title */}
                                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                        {track.title}
                                    </h2>

                                    {/* Artist */}
                                    <p className="text-base text-white/70">
                                        {track.artist} - {track.album}
                                    </p>

                                    {/* Progress bar */}
                                    <div className="mt-6">
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm text-cyan-400 w-12">
                                                {formatTime(track.position)}
                                            </span>
                                            <div className="flex-1 relative h-1 bg-white/10 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-400 to-cyan-300 rounded-full"
                                                    style={{ width: `${progressPercent}%` }}
                                                />
                                                <div
                                                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg"
                                                    style={{ left: `calc(${progressPercent}% - 6px)` }}
                                                />
                                            </div>
                                            <span className="text-sm text-white/50 w-12 text-right">
                                                {formatTime(track.duration)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Playback controls */}
                            <div className="flex items-center justify-center gap-6 mb-10">
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setIsShuffle(!isShuffle)}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isShuffle ? 'text-cyan-400' : 'text-white/40 hover:text-white'
                                        }`}
                                >
                                    <FiShuffle size={22} />
                                </motion.button>

                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    <FiSkipBack size={24} />
                                </motion.button>

                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                                    style={{
                                        boxShadow: isPlaying ? '0 0 20px rgba(0, 255, 255, 0.3)' : undefined,
                                    }}
                                >
                                    {isPlaying ? <FiPause size={28} /> : <FiPlay size={28} className="ml-1" />}
                                </motion.button>

                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    <FiSkipForward size={24} />
                                </motion.button>

                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() =>
                                        setRepeatMode((prev) =>
                                            prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off'
                                        )
                                    }
                                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors relative ${repeatMode !== 'off' ? 'text-cyan-400' : 'text-white/40 hover:text-white'
                                        }`}
                                >
                                    <FiRepeat size={22} />
                                    {repeatMode === 'one' && (
                                        <span className="absolute text-[10px] font-bold">1</span>
                                    )}
                                </motion.button>
                            </div>

                            {/* Favorites row */}
                            <div className="mb-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <FiStar className="text-white/50" size={18} />
                                    <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider">
                                        Favorites
                                    </h3>
                                </div>

                                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                    {FAVORITES.map((fav) => (
                                        <motion.div
                                            key={fav.id}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="flex-shrink-0 w-28 cursor-pointer"
                                        >
                                            <div className="w-28 h-28 rounded-xl overflow-hidden mb-2 bg-white/5">
                                                <img
                                                    src={fav.albumArt}
                                                    alt={fav.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <p className="text-sm text-white/80 truncate">{fav.title}</p>
                                            <p className="text-xs text-white/40 flex items-center gap-1">
                                                <span>{fav.sourceIcon}</span>
                                                {fav.source}
                                            </p>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Volume control */}
                            <div className="flex items-center gap-4">
                                <FiVolume2 size={18} className="text-white/50" />
                                <span className="text-sm text-white/50 w-8">{currentZone.volume}</span>
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
                        </motion.div>
                    )}

                    {activeTab === 'rooms' && (
                        <motion.div
                            key="rooms"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <h2 className="text-xl font-bold mb-6">All Zones</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {zones.map((zone, index) => (
                                    <motion.div
                                        key={zone.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            setCurrentZoneIndex(index);
                                            setActiveTab('now-playing');
                                        }}
                                        className={`p-4 rounded-2xl cursor-pointer transition-all ${zone.isOn
                                            ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/30'
                                            : 'bg-white/5 border border-white/5'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-medium">{zone.name}</h3>
                                            <div
                                                className={`w-2 h-2 rounded-full ${zone.isOn ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]' : 'bg-white/20'
                                                    }`}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between text-sm text-white/50">
                                            <span>{zone.isOn ? 'Playing' : 'Off'}</span>
                                            {zone.isOn && (
                                                <span className="flex items-center gap-1">
                                                    <FiVolume2 size={14} />
                                                    {zone.volume}%
                                                </span>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'browse' && (
                        <motion.div
                            key="browse"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <h2 className="text-xl font-bold mb-6">Browse Sources</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {SOURCES.map((source) => (
                                    <motion.div
                                        key={source.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 cursor-pointer transition-all"
                                    >
                                        <div
                                            className="text-3xl mb-3"
                                            style={{ color: source.color }}
                                        >
                                            {source.icon}
                                        </div>
                                        <h3 className="font-medium">{source.name}</h3>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'favorites' && (
                        <motion.div
                            key="favorites"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <h2 className="text-xl font-bold mb-6">My Favorites</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {FAVORITES.map((fav) => (
                                    <motion.div
                                        key={fav.id}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="cursor-pointer"
                                    >
                                        <div className="aspect-square rounded-xl overflow-hidden mb-2 bg-white/5">
                                            <img
                                                src={fav.albumArt}
                                                alt={fav.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <p className="text-sm text-white/80 truncate">{fav.title}</p>
                                        <p className="text-xs text-white/40">{fav.source}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'schedule' && (
                        <motion.div
                            key="schedule"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex flex-col items-center justify-center py-16"
                        >
                            <FiCalendar size={48} className="text-white/30 mb-4" />
                            <h2 className="text-xl font-medium text-white/50">Schedule</h2>
                            <p className="text-white/30 mt-2">Set up automated playback schedules</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Bottom navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-[#0f0f1a]/95 backdrop-blur-xl border-t border-white/10 px-6 py-3">
                <div className="flex items-center justify-around max-w-lg mx-auto">
                    {[
                        { id: 'schedule' as NavTab, icon: FiCalendar, label: 'Schedule' },
                        { id: 'rooms' as NavTab, icon: FiGrid, label: 'Rooms' },
                        { id: 'now-playing' as NavTab, icon: FiMusic, label: 'Now Playing' },
                        { id: 'browse' as NavTab, icon: FiFolder, label: 'Browse' },
                        { id: 'favorites' as NavTab, icon: FiStar, label: 'Favorites' },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <motion.button
                                key={tab.id}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-colors ${isActive ? 'text-cyan-400' : 'text-white/40 hover:text-white/60'
                                    }`}
                            >
                                <Icon size={20} />
                                <span className="text-xs">{tab.label}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-dot"
                                        className="absolute -bottom-1 w-1 h-1 bg-cyan-400 rounded-full"
                                    />
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
