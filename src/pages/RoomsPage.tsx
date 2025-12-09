import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiHome, FiMoon, FiCoffee, FiBriefcase, FiDroplet, FiSun, FiTruck,
    FiChevronRight, FiWifiOff, FiEdit2, FiPlus, FiCpu, FiCheck, FiGrid
} from 'react-icons/fi';
import { useApp } from '@/context';
import { useEntityStates } from '@/hooks';
import { RoomConfig, DeviceConfig } from '@/types';
import { hassApi, HassState } from '@/services';

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

// Helper: Guess device type from entity_id
const guessDeviceType = (entityId: string): string => {
    if (entityId.startsWith('light.')) return 'light';
    if (entityId.startsWith('switch.')) return 'switch';
    if (entityId.startsWith('sensor.') || entityId.startsWith('binary_sensor.')) return 'sensor';
    if (entityId.startsWith('camera.')) return 'camera';
    if (entityId.startsWith('climate.')) return 'climate';
    if (entityId.startsWith('media_player.')) return 'media_player';
    if (entityId.startsWith('fan.')) return 'fan';
    return 'other';
};

interface RoomCardProps {
    room: RoomConfig;
    entityStates: Map<string, { state: string }>;
    isEditing: boolean;
    onDropDevice: (roomId: string, entity: HassState) => void;
}

function RoomCard({ room, entityStates, isEditing, onDropDevice }: RoomCardProps) {
    const [isDragOver, setIsDragOver] = useState(false);

    // Calculate actual light status from entity states
    const lightDevices = room.devices.filter(d => d.type === 'light');
    const lightsOn = lightDevices.filter(d => {
        const state = entityStates.get(d.entityId);
        return state?.state === 'on';
    }).length;
    const totalLights = lightDevices.length;
    const hasActiveDevice = lightsOn > 0;

    // Check if any device is unavailable
    const hasUnavailableDevice = room.devices.some(d => {
        const state = entityStates.get(d.entityId);
        return state?.state === 'unavailable';
    });

    const handleDragOver = (e: React.DragEvent) => {
        if (!isEditing) return;
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        if (!isEditing) return;
        e.preventDefault();
        setIsDragOver(false);
        try {
            const data = JSON.parse(e.dataTransfer.getData('application/json'));
            if (data && data.entity_id) {
                onDropDevice(room.id, data);
            }
        } catch (err) {
            console.error("Drop failed", err);
        }
    };

    const cardContent = (
        <motion.div
            animate={isEditing ? { scale: 0.98 } : { scale: 1 }}
            whileHover={{ scale: isEditing ? 0.98 : 1.02, y: isEditing ? 0 : -4 }}
            className={`glass-card p-5 cursor-pointer group relative transition-colors duration-300 ${isDragOver ? 'bg-cyan-500/20 border-cyan-500/50' : ''
                }`}
            style={{
                background: !isDragOver && hasActiveDevice
                    ? `linear-gradient(135deg, ${room.color}15, transparent)`
                    : undefined,
                borderColor: !isDragOver && hasActiveDevice ? `${room.color}30` : undefined,
                borderStyle: isEditing ? 'dashed' : 'solid',
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
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
                {!isEditing && (
                    <div className="flex items-center gap-2">
                        {hasUnavailableDevice && (
                            <FiWifiOff size={14} className="text-white/30" title="Some devices unavailable" />
                        )}
                        <FiChevronRight
                            size={20}
                            className="text-white/20 group-hover:text-white/50 group-hover:translate-x-1 transition-all"
                        />
                    </div>
                )}
                {isEditing && (
                    <div className="bg-white/10 p-1.5 rounded-lg text-white/40">
                        <FiPlus size={16} />
                    </div>
                )}
            </div>

            <h3 className="text-lg font-medium text-white mb-1">{room.name}</h3>

            <div className="flex items-center gap-3 text-sm text-white/40">
                <span>{room.devices.length} devices</span>
                {!isEditing && totalLights > 0 && (
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
            {!isEditing && hasActiveDevice && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-3 right-3 w-2 h-2 rounded-full"
                    style={{ backgroundColor: room.color, boxShadow: `0 0 8px ${room.color}` }}
                />
            )}

            {/* Drag Overlay Text */}
            {isDragOver && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-3xl backdrop-blur-sm z-10 pointer-events-none">
                    <span className="text-cyan-400 font-bold text-lg flex items-center gap-2">
                        <FiPlus size={24} /> Add Device
                    </span>
                </div>
            )}
        </motion.div>
    );

    if (isEditing) {
        return cardContent; // No Link when editing
    }

    return (
        <Link to={`/room/${room.id}`}>
            {cardContent}
        </Link>
    );
}

export default function RoomsPage() {
    const { config, updateRoom } = useApp();
    const [isEditing, setIsEditing] = useState(false);
    const [allHaStates, setAllHaStates] = useState<HassState[]>([]);
    const [isLoadingStates, setIsLoadingStates] = useState(false);

    // Collect all configured entity IDs
    const configuredEntityIds = useMemo(() => {
        const ids = new Set<string>();
        config.rooms.forEach(room => {
            room.devices.forEach(device => {
                ids.add(device.entityId);
            });
        });
        return ids;
    }, [config.rooms]);

    // Fetch states for configured entities (for display)
    const displayEntityStates = useEntityStates(Array.from(configuredEntityIds));

    // Fetch ALL states when editing
    useEffect(() => {
        if (isEditing) {
            setIsLoadingStates(true);
            hassApi.getStates()
                .then(states => {
                    setAllHaStates(states);
                    setIsLoadingStates(false);
                })
                .catch(err => {
                    console.error("Failed to fetch all states", err);
                    setIsLoadingStates(false);
                });
        }
    }, [isEditing]);

    // Filter available entities (not already configured)
    const availableEntities = useMemo(() => {
        return allHaStates.filter(s =>
            !configuredEntityIds.has(s.entity_id) &&
            !s.entity_id.startsWith('zone.') &&
            !s.entity_id.startsWith('person.')
            // Add more filters as needed
        );
    }, [allHaStates, configuredEntityIds]);

    const handleAddDevice = (roomId: string, entity: HassState) => {
        const room = config.rooms.find(r => r.id === roomId);
        if (!room) return;

        const newDevice: DeviceConfig = {
            id: crypto.randomUUID(),
            name: (entity.attributes.friendly_name as string) || entity.entity_id,
            type: guessDeviceType(entity.entity_id) as any,
            entityId: entity.entity_id
        };

        updateRoom(roomId, { devices: [...room.devices, newDevice] });
    };

    // Calculate stats
    const stats = useMemo(() => {
        let totalDevices = 0;
        let totalLights = 0;
        let lightsOn = 0;
        let totalThermostats = 0;
        let totalSpeakers = 0;

        config.rooms.forEach(room => {
            room.devices.forEach(device => {
                totalDevices++;
                const state = displayEntityStates.get(device.entityId);
                if (device.type === 'light') {
                    totalLights++;
                    if (state?.state === 'on') lightsOn++;
                }
                if (device.type === 'climate') totalThermostats++;
                if (device.type === 'media_player') totalSpeakers++;
            });
        });
        return { totalDevices, totalLights, lightsOn, totalThermostats, totalSpeakers };
    }, [config.rooms, displayEntityStates]);

    return (
        <div className="flex flex-col h-full space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-2xl font-bold text-white">All Rooms</h1>
                    <p className="text-white/50 mt-1">
                        {config.rooms.length} rooms configured
                    </p>
                </div>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${isEditing
                            ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                            : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                        }`}
                >
                    {isEditing ? <FiCheck size={16} /> : <FiEdit2 size={16} />}
                    {isEditing ? 'Done Editing' : 'Edit Rooms'}
                </button>
            </motion.div>

            <div className="flex-1 flex gap-6 min-h-0">
                {/* Main Grid */}
                <motion.div
                    layout
                    className={`flex-1 overflow-y-auto custom-scrollbar pr-2 ${isEditing ? 'max-w-2xl' : ''}`}
                >
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-6"
                    >
                        {config.rooms.map((room, index) => (
                            <motion.div
                                key={room.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <RoomCard
                                    room={room}
                                    entityStates={displayEntityStates}
                                    isEditing={isEditing}
                                    onDropDevice={handleAddDevice}
                                />
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Summary (Only show if not editing, or maybe keep it?) */}
                    {!isEditing && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card p-6"
                        >
                            <h2 className="text-lg font-medium text-white mb-4">Summary</h2>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                                <div>
                                    <p className="text-3xl font-light text-white">{stats.totalDevices}</p>
                                    <p className="text-sm text-white/40">Total Devices</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-light text-white">{stats.totalLights}</p>
                                    <p className="text-sm text-white/40">Lights</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-light text-cyan-400">{stats.lightsOn}</p>
                                    <p className="text-sm text-white/40">Lights On</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-light text-white">{stats.totalThermostats}</p>
                                    <p className="text-sm text-white/40">Thermostats</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-light text-white">{stats.totalSpeakers}</p>
                                    <p className="text-sm text-white/40">Speakers</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </motion.div>

                {/* Edit Mode Sidebar */}
                <AnimatePresence>
                    {isEditing && (
                        <motion.div
                            initial={{ width: 0, opacity: 0, x: 20 }}
                            animate={{ width: 320, opacity: 1, x: 0 }}
                            exit={{ width: 0, opacity: 0, x: 20 }}
                            className="flex-shrink-0 bg-[#0d1117] border-l border-white/5 h-full overflow-hidden flex flex-col"
                        >
                            <div className="p-4 border-b border-white/5">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <FiGrid /> Available Devices
                                </h3>
                                <p className="text-xs text-white/40 mt-1">Drag devices to rooms</p>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
                                {isLoadingStates ? (
                                    <div className="text-white/40 text-center py-4">Loading...</div>
                                ) : availableEntities.length === 0 ? (
                                    <div className="text-white/40 text-center py-4 text-xs">No unassigned devices found.</div>
                                ) : (
                                    availableEntities.map(entity => (
                                        <div
                                            key={entity.entity_id}
                                            draggable
                                            onDragStart={(e) => {
                                                e.dataTransfer.setData('application/json', JSON.stringify(entity));
                                            }}
                                            className="p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 hover:border-white/20 cursor-grab active:cursor-grabbing transition-all hover:scale-102 flex items-center gap-3 group"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center text-white/30 group-hover:text-white/60">
                                                <FiCpu size={14} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-white truncate group-hover:text-cyan-400 transition-colors">
                                                    {(entity.attributes.friendly_name as string) || entity.entity_id}
                                                </p>
                                                <p className="text-[10px] text-white/30 truncate font-mono">
                                                    {entity.entity_id}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
