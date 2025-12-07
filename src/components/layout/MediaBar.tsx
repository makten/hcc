import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMusic, FiSkipBack, FiPlay, FiPause, FiSkipForward, FiVolume2, FiMaximize2 } from 'react-icons/fi';
import { useApp } from '@/context';

interface NowPlaying {
    title: string;
    artist: string;
    albumArt?: string;
    isPlaying: boolean;
    progress: number;
    duration: number;
    zone: string;
}

// Mock now playing data
const MOCK_NOW_PLAYING: NowPlaying = {
    title: 'New Roads',
    artist: 'Phineas Brinker',
    isPlaying: true,
    progress: 124,
    duration: 259,
    zone: 'Living Room',
};

export default function MediaBar() {
    const { openMusicPlayer } = useApp();
    const [nowPlaying, setNowPlaying] = useState<NowPlaying>(MOCK_NOW_PLAYING);
    const [volume, setVolume] = useState(45);

    // Simulate progress
    useEffect(() => {
        if (!nowPlaying.isPlaying) return;
        const interval = setInterval(() => {
            setNowPlaying((prev) => ({
                ...prev,
                progress: prev.progress >= prev.duration ? 0 : prev.progress + 1,
            }));
        }, 1000);
        return () => clearInterval(interval);
    }, [nowPlaying.isPlaying]);

    const togglePlayPause = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setNowPlaying((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progressPercent = (nowPlaying.progress / nowPlaying.duration) * 100;

    return (
        <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="fixed bottom-0 left-0 right-0 z-30 md:bottom-4 md:left-4 md:right-4 md:rounded-2xl overflow-hidden"
        >
            {/* Progress bar */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/10">
                <motion.div
                    className="h-full bg-gradient-to-r from-cyan-400 to-purple-400"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            <div className="glass border-t border-glass-border md:border md:border-glass-border px-4 md:px-6 py-3">
                <div className="flex items-center gap-4">
                    {/* Album art / Icon - Opens music player modal */}
                    <button onClick={openMusicPlayer} className="group">
                        <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center overflow-hidden flex-shrink-0 transition-transform group-hover:scale-105">
                            <FiMusic size={20} className="text-cyan-300" />
                            {nowPlaying.isPlaying && (
                                <div className="absolute bottom-1 right-1 flex items-end gap-0.5">
                                    {[0, 1, 2].map((i) => (
                                        <motion.div
                                            key={i}
                                            className="w-0.5 bg-cyan-400 rounded-full"
                                            animate={{ height: ['2px', '8px', '4px', '6px', '2px'] }}
                                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </button>

                    {/* Track info - Opens music player modal */}
                    <button onClick={openMusicPlayer} className="flex-1 min-w-0 hidden sm:block text-left hover:opacity-80 transition-opacity">
                        <p className="text-sm font-medium text-white truncate">{nowPlaying.title}</p>
                        <p className="text-xs text-white/50 truncate">
                            {nowPlaying.artist} • <span className="text-cyan-400">{nowPlaying.zone}</span>
                        </p>
                    </button>

                    {/* Mobile: Compact info */}
                    <button onClick={openMusicPlayer} className="flex-1 min-w-0 sm:hidden text-left hover:opacity-80 transition-opacity">
                        <p className="text-sm font-medium text-white truncate">
                            {nowPlaying.title} • {nowPlaying.artist}
                        </p>
                        <p className="text-xs text-cyan-400 truncate">{nowPlaying.zone}</p>
                    </button>

                    {/* Playback controls */}
                    <div className="flex items-center gap-2 md:gap-3">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-colors hidden md:flex"
                        >
                            <FiSkipBack size={18} />
                        </motion.button>

                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={togglePlayPause}
                            className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-background hover:scale-105 transition-transform"
                        >
                            {nowPlaying.isPlaying ? <FiPause size={18} /> : <FiPlay size={18} />}
                        </motion.button>

                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-colors hidden md:flex"
                        >
                            <FiSkipForward size={18} />
                        </motion.button>
                    </div>

                    {/* Time display - Desktop only */}
                    <div className="hidden lg:flex items-center gap-2 text-xs text-white/40 min-w-[100px]">
                        <span>{formatTime(nowPlaying.progress)}</span>
                        <span>/</span>
                        <span>{formatTime(nowPlaying.duration)}</span>
                    </div>

                    {/* Volume slider - Desktop only */}
                    <div className="hidden lg:flex items-center gap-2 w-32">
                        <FiVolume2 size={16} className="text-white/40" />
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={volume}
                            onChange={(e) => setVolume(parseInt(e.target.value))}
                            className="flex-1 h-1 appearance-none rounded-full"
                            style={{
                                background: `linear-gradient(to right, #22d3ee ${volume}%, rgba(255,255,255,0.1) ${volume}%)`,
                            }}
                        />
                    </div>

                    {/* Expand player button */}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={openMusicPlayer}
                        className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <FiMaximize2 size={18} />
                    </motion.button>
                </div>
            </div>

            {/* Safe area padding for mobile */}
            <div className="h-safe-area-inset-bottom bg-glass md:hidden" />
        </motion.div>
    );
}
