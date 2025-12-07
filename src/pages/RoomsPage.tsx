import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiMoon, FiCoffee, FiBriefcase, FiDroplet, FiSun, FiTruck, FiChevronRight } from 'react-icons/fi';
import { useApp } from '@/context';
import { RoomConfig } from '@/types';

// Icon mapping
const ROOM_ICONS: Record<string, React.ReactNode> = {
    FiHome: <FiHome size={24} />,
    FiMoon: <FiMoon size={24} />,
    FiCoffee: <FiCoffee size={24} />,
    FiBriefcase: <FiBriefcase size={24} />,
    FiDroplet: <FiDroplet size={24} />,
    FiSun: <FiSun size={24} />,
    FiTruck: <FiTruck size={24} />,
};

function RoomCard({ room }: { room: RoomConfig }) {
    // Mock status - in real app would come from entities
    const lightsOn = Math.floor(Math.random() * room.devices.filter(d => d.type === 'light').length);
    const totalLights = room.devices.filter(d => d.type === 'light').length;
    const hasActiveDevice = lightsOn > 0;

    return (
        <Link to={`/room/${room.id}`}>
            <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="glass-card p-5 cursor-pointer group"
                style={{
                    background: hasActiveDevice
                        ? `linear-gradient(135deg, ${room.color}15, transparent)`
                        : undefined,
                    borderColor: hasActiveDevice ? `${room.color}30` : undefined,
                }}
            >
                <div className="flex items-start justify-between mb-4">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300"
                        style={{
                            background: `${room.color}20`,
                            color: room.color,
                            boxShadow: hasActiveDevice ? `0 0 20px ${room.color}30` : undefined,
                        }}
                    >
                        {ROOM_ICONS[room.icon] || <FiHome size={24} />}
                    </div>
                    <FiChevronRight
                        size={20}
                        className="text-white/20 group-hover:text-white/50 group-hover:translate-x-1 transition-all"
                    />
                </div>

                <h3 className="text-lg font-medium text-white mb-1">{room.name}</h3>

                <div className="flex items-center gap-3 text-sm text-white/40">
                    <span>{room.devices.length} devices</span>
                    {totalLights > 0 && (
                        <>
                            <span>•</span>
                            <span
                                className="flex items-center gap-1"
                                style={{ color: lightsOn > 0 ? room.color : undefined }}
                            >
                                {lightsOn}/{totalLights} lights
                            </span>
                        </>
                    )}
                </div>

                {/* Active indicator */}
                {hasActiveDevice && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-3 right-3 w-2 h-2 rounded-full"
                        style={{ backgroundColor: room.color, boxShadow: `0 0 8px ${room.color}` }}
                    />
                )}
            </motion.div>
        </Link>
    );
}

export default function RoomsPage() {
    const { config } = useApp();

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-2xl font-bold text-white">All Rooms</h1>
                <p className="text-white/50 mt-1">
                    {config.rooms.length} rooms configured
                </p>
            </motion.div>

            {/* Rooms grid */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
                {config.rooms.map((room, index) => (
                    <motion.div
                        key={room.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <RoomCard room={room} />
                    </motion.div>
                ))}
            </motion.div>

            {/* Summary stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6"
            >
                <h2 className="text-lg font-medium text-white mb-4">Summary</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                        <p className="text-3xl font-light text-white">
                            {config.rooms.reduce((acc, room) => acc + room.devices.length, 0)}
                        </p>
                        <p className="text-sm text-white/40">Total Devices</p>
                    </div>
                    <div>
                        <p className="text-3xl font-light text-white">
                            {config.rooms.reduce((acc, room) => acc + room.devices.filter(d => d.type === 'light').length, 0)}
                        </p>
                        <p className="text-sm text-white/40">Lights</p>
                    </div>
                    <div>
                        <p className="text-3xl font-light text-white">
                            {config.rooms.reduce((acc, room) => acc + room.devices.filter(d => d.type === 'climate').length, 0)}
                        </p>
                        <p className="text-sm text-white/40">Thermostats</p>
                    </div>
                    <div>
                        <p className="text-3xl font-light text-white">
                            {config.rooms.reduce((acc, room) => acc + room.devices.filter(d => d.type === 'media_player').length, 0)}
                        </p>
                        <p className="text-sm text-white/40">Speakers</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
