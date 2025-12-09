import React from 'react';
import { motion } from 'framer-motion';
import { FiVolume2, FiPlay, FiPause, FiMusic } from 'react-icons/fi';
import DeviceCard from './DeviceCard';
import { useEntity } from '@/hooks';
import { MediaPlayerAttributes } from '@/types';

interface MediaCardProps {
    entityId: string;
    name: string;
    deviceId?: string;
    roomId?: string;
}

export default function MediaCard({ entityId, name, deviceId, roomId }: MediaCardProps) {
    const { state, setVolume, mediaPlay, mediaPause } = useEntity(entityId);
    const attributes = state.attributes as MediaPlayerAttributes;
    const volumeLevel = attributes.volume_level ?? 0.5;
    const mediaTitle = attributes.media_title;
    const mediaArtist = attributes.media_artist;
    const isPlaying = state.state === 'playing';

    const volumePercent = Math.round(volumeLevel * 100);

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVolume(parseInt(e.target.value) / 100);
    };

    return (
        <DeviceCard
            title={name}
            icon={<FiVolume2 size={20} />}
            isActive={isPlaying}
            color="#a855f7"
            deviceId={deviceId}
            roomId={roomId}
        >
            {/* Now playing info */}
            {mediaTitle && (
                <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                        {/* Album art placeholder with equalizer */}
                        <div className="relative w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
                            <FiMusic size={20} className="text-purple-300" />
                            {isPlaying && (
                                <div className="absolute bottom-1 right-1 flex items-end gap-0.5">
                                    {[0, 1, 2, 3].map((i) => (
                                        <motion.div
                                            key={i}
                                            className="w-0.5 bg-purple-400 rounded-full equalizer-bar"
                                            style={{ animationDelay: `${i * 0.1}s` }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{mediaTitle}</p>
                            {mediaArtist && (
                                <p className="text-xs text-white/50 truncate">{mediaArtist}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Play/Pause button */}
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={isPlaying ? mediaPause : mediaPlay}
                className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 mb-4 font-medium transition-all duration-300 ${isPlaying
                    ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-purple-300 border border-purple-500/30'
                    : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
                    }`}
            >
                {isPlaying ? <FiPause size={16} /> : <FiPlay size={16} />}
                {isPlaying ? 'Pause' : 'Play'}
            </motion.button>

            {/* Volume slider */}
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-white/50 flex items-center gap-2">
                        <FiVolume2 size={14} />
                        Volume
                    </span>
                    <span className="text-white/80">{volumePercent}%</span>
                </div>
                <div className="relative">
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={volumePercent}
                        onChange={handleVolumeChange}
                        className="w-full h-2 appearance-none rounded-full bg-white/10"
                        style={{
                            background: `linear-gradient(to right, #a855f7 ${volumePercent}%, rgba(255,255,255,0.1) ${volumePercent}%)`,
                        }}
                    />
                </div>
            </div>
        </DeviceCard>
    );
}
