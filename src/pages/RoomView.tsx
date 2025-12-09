import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiSun, FiThermometer, FiWind, FiMonitor, FiMoon, FiFilm, FiCoffee,
    FiSunrise, FiPower, FiMusic, FiVolume2, FiHome, FiEdit2, FiCheck,
    FiCpu, FiGrid, FiTrash2
} from 'react-icons/fi';
import { useApp } from '@/context';
import { useEntityStates } from '@/hooks';
import { RussoundMiniPlayer } from '@/features/russound-player';
import { DeviceConfig } from '@/types';
import { hassApi, HassState } from '@/services';
import { LightControlModal } from '@/components/devices/LightControlModal';
import { ModernClimateCard } from '@/components/devices/ModernClimateCard';
import { ModernSecurityCard } from '@/components/devices/ModernSecurityCard';

// Room background images (omitted for brevity, keep existing)
const ROOM_IMAGES: Record<string, string> = {
    'living-room': 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200',
    'bedroom-1': 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200',
    'bedroom-2': 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200',
    'kitchen': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200',
    'office': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200',
    'veranda': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200',
    'garage': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200',
    default: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200',
};

// Scene configurations (omitted for brevity, keep existing)
const ROOM_SCENES: Record<string, { id: string; name: string; icon: any; color: string }[]> = {
    'living-room': [
        { id: 'morning', name: 'Morning', icon: FiSunrise, color: 'text-amber-400' },
        { id: 'movie', name: 'Movie', icon: FiFilm, color: 'text-purple-400' },
        { id: 'relax', name: 'Relax', icon: FiCoffee, color: 'text-green-400' },
        { id: 'night', name: 'Night', icon: FiMoon, color: 'text-blue-400' },
    ],
    'bedroom-1': [
        { id: 'wakeup', name: 'Wake Up', icon: FiSun, color: 'text-amber-400' },
        { id: 'read', name: 'Reading', icon: FiCoffee, color: 'text-cyan-400' },
        { id: 'romance', name: 'Mood', icon: FiMusic, color: 'text-pink-400' },
        { id: 'sleep', name: 'Sleep', icon: FiMoon, color: 'text-indigo-400' },
    ],
    'default': [
        { id: 'morning', name: 'Morning', icon: FiSunrise, color: 'text-amber-400' },
        { id: 'active', name: 'Active', icon: FiSun, color: 'text-yellow-400' },
        { id: 'relax', name: 'Relax', icon: FiCoffee, color: 'text-green-400' },
        { id: 'night', name: 'Night', icon: FiMoon, color: 'text-blue-400' },
    ],
};

function getDeviceIcon(type: string) {
    switch (type) {
        case 'light': return FiSun;
        case 'fan': return FiWind;
        case 'climate': return FiThermometer;
        case 'media_player': return FiVolume2;
        case 'switch': return FiPower;
        case 'vacuum': return FiHome;
        default: return FiPower;
    }
}

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

// Device control component
function DeviceControl({ device, state, onToggle, isEditing, onDelete }: {
    device: DeviceConfig;
    state: { state: string; attributes?: any } | undefined;
    onToggle: () => void;
    isEditing?: boolean;
    onDelete?: () => void;
}) {
    const Icon = getDeviceIcon(device.type);
    const isOn = state?.state === 'on' || state?.state === 'playing';
    const isUnavailable = state?.state === 'unavailable' || !state;
    const brightness = state?.attributes?.brightness;
    const brightnessPercent = brightness ? Math.round((brightness / 255) * 100) : 0;

    return (
        <div className="relative group">
            <button
                onClick={onToggle}
                disabled={isUnavailable || isEditing}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${isUnavailable
                    ? 'bg-[#0a0d14] border-transparent opacity-50 cursor-not-allowed'
                    : isOn
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-[#0a0d14] border-transparent hover:bg-white/5 hover:border-white/5'
                    } ${isEditing ? 'border-dashed border-white/20' : ''}`}
            >
                <div className="flex items-center gap-3">
                    <Icon size={14} className={isOn ? 'text-amber-400' : 'text-white/30'} />
                    <div className="flex flex-col items-start">
                        <span className={`text-[10px] font-bold ${isOn ? 'text-white' : 'text-white/50'}`}>
                            {device.name}
                        </span>
                        {device.type === 'light' && brightness !== undefined && isOn && (
                            <span className="text-[8px] text-amber-400/70">{brightnessPercent}%</span>
                        )}
                    </div>
                </div>
                {!isEditing && (
                    <div className={`w-2 h-2 rounded-full transition-all duration-300 ${isUnavailable ? 'bg-red-500/50' :
                        isOn ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]' : 'bg-[#191e2b]'
                        }`} />
                )}
            </button>
            {isEditing && onDelete && (
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:scale-110 transition-transform"
                >
                    <FiTrash2 size={10} />
                </button>
            )}
        </div>
    );
}

export default function RoomView() {
    const { id } = useParams<{ id: string }>();
    const { config, updateRoom } = useApp();
    const room = config.rooms.find((r) => r.id === id);

    const [isEditing, setIsEditing] = useState(false);
    const [allHaStates, setAllHaStates] = useState<HassState[]>([]);
    const [isLoadingStates, setIsLoadingStates] = useState(false);

    // Entity States Logic
    const entityIds = useMemo(() => room ? room.devices.map(d => d.entityId) : [], [room]);
    const entityStates = useEntityStates(entityIds);

    // Device Categorization
    const { lights, climateDevices, mediaDevices, otherDevices } = useMemo(() => {
        if (!room) return { lights: [], climateDevices: [], mediaDevices: [], otherDevices: [] };
        return {
            lights: room.devices.filter(d => d.type === 'light' || d.type === 'switch'),
            climateDevices: room.devices.filter(d => d.type === 'climate' || d.type === 'fan'),
            mediaDevices: room.devices.filter(d => d.type === 'media_player'),
            otherDevices: room.devices.filter(d => !['light', 'switch', 'climate', 'fan', 'media_player'].includes(d.type)),
        };
    }, [room]);

    const [_activeScene, _setActiveScene] = useState<string | null>(null);
    const [selectedLight, setSelectedLight] = useState<DeviceConfig | null>(null);
    const [_refreshKey, setRefreshKey] = useState(0);

    // Editing: Fetch Layout
    const configuredEntityIds = useMemo(() => {
        const ids = new Set<string>();
        config.rooms.forEach(r => r.devices.forEach(d => ids.add(d.entityId)));
        return ids;
    }, [config]);

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

    const availableEntities = useMemo(() => {
        return allHaStates.filter(s =>
            !configuredEntityIds.has(s.entity_id) &&
            !s.entity_id.startsWith('zone.') &&
            !s.entity_id.startsWith('person.')
        );
    }, [allHaStates, configuredEntityIds]);

    const handleAddDevice = (entity: HassState) => {
        if (!room) return;
        const newDevice: DeviceConfig = {
            id: crypto.randomUUID(),
            name: entity.attributes.friendly_name as string || entity.entity_id,
            type: guessDeviceType(entity.entity_id) as DeviceConfig['type'],
            entityId: entity.entity_id
        };
        updateRoom(room.id, { devices: [...room.devices, newDevice] });
    };

    const handleRemoveDevice = (deviceId: string) => {
        if (!room) return;
        updateRoom(room.id, { devices: room.devices.filter(d => d.id !== deviceId) });
    };

    // Drop Handler
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        try {
            const data = JSON.parse(e.dataTransfer.getData('application/json'));
            if (data && data.entity_id) {
                handleAddDevice(data);
            }
        } catch (err) {
            console.error("Drop failed", err);
        }
    };

    const handleDeviceToggle = useCallback(async (device: DeviceConfig) => {
        const state = entityStates.get(device.entityId);
        const isOn = state?.state === 'on' || state?.state === 'playing';
        try {
            isOn ? await hassApi.turnOff(device.entityId) : await hassApi.turnOn(device.entityId);
            setRefreshKey(k => k + 1);
        } catch (error) { console.error(error); }
    }, [entityStates]);

    if (!room) return null;

    const roomImage = ROOM_IMAGES[id || ''] || ROOM_IMAGES.default;
    const scenes = ROOM_SCENES[id || ''] || ROOM_SCENES['default'];
    const lightsOnCount = lights.filter(d => entityStates.get(d.entityId)?.state === 'on').length;

    return (
        <div className="flex bg-[#080a0f] h-full overflow-hidden">
            {/* Main Content */}
            <div className="flex-1 p-3 md:p-4 min-w-0" onDragOver={e => e.preventDefault()} onDrop={handleDrop}>
                <div className="h-full w-full grid grid-cols-5 grid-rows-5 gap-3 md:gap-4 relative">

                    {/* CAMERA / IMAGE PREVIEW (3x3) */}
                    <div className="col-span-3 row-span-3 relative overflow-hidden group rounded-2xl md:rounded-3xl shadow-xl shadow-black/20">
                        <img src={roomImage} alt={room.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10 opacity-70" />

                        {!isEditing && (
                            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600/90 backdrop-blur-md text-white text-[10px] font-bold tracking-wider shadow-lg border border-white/10">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                LIVE
                            </div>
                        )}

                        <div className="absolute top-4 right-4 flex gap-2">
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className={`p-2 rounded-xl backdrop-blur-md border transition-all ${isEditing ? 'bg-cyan-500 text-white border-cyan-400' : 'bg-black/30 text-white/70 border-white/10 hover:bg-black/50 hover:text-white'
                                    }`}
                            >
                                {isEditing ? <FiCheck size={18} /> : <FiEdit2 size={18} />}
                            </button>
                        </div>

                        <div className="absolute bottom-6 left-6">
                            <h2 className="text-3xl font-bold text-white tracking-tight drop-shadow-lg">{room.name}</h2>
                            <div className="flex items-center gap-3 text-white/70 text-sm mt-1.5">
                                <span className="text-xs">{room.devices.length} devices</span>
                                {lights.length > 0 && <span className="text-xs text-amber-400">{lightsOnCount}/{lights.length} lights on</span>}
                            </div>
                        </div>
                    </div>

                    {/* AUDIO PLAYER (2x3) */}
                    <RussoundMiniPlayer roomName={room.name} className="col-span-2 row-span-3" />

                    {/* CLIMATE CARD (1x2) */}
                    {climateDevices.length > 0 ? (
                        <ModernClimateCard devices={climateDevices} entityStates={entityStates} className="col-span-1 row-span-2" />
                    ) : (
                        <div className={`col-span-1 row-span-2 bg-[#131720] rounded-2xl p-4 border border-white/5 flex items-center justify-center ${isEditing ? 'border-dashed border-cyan-500/30' : ''}`}>
                            <span className="text-white/20 text-xs">Drop Climate Devices Here</span>
                        </div>
                    )}

                    {/* SECURITY CARD (1x2) */}
                    <ModernSecurityCard devices={room.devices} entityStates={entityStates} className="col-span-1 row-span-2" />

                    {/* OTHER DEVICES (1x2) */}
                    <div className={`col-span-1 row-span-2 bg-[#131720] rounded-2xl p-4 flex flex-col border border-white/5 shadow-lg ${isEditing ? 'border-dashed border-cyan-500/30' : ''}`}>
                        <div className="flex items-center gap-2 mb-4 flex-shrink-0">
                            <FiMonitor size={14} className="text-purple-400" />
                            <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Devices</span>
                        </div>
                        <div className="flex-1 flex flex-col gap-2.5 min-h-0 overflow-y-auto">
                            {[...climateDevices, ...mediaDevices, ...otherDevices].slice(0, 4).map((device) => (
                                <DeviceControl
                                    key={device.id}
                                    device={device}
                                    state={entityStates.get(device.entityId)}
                                    onToggle={() => handleDeviceToggle(device)}
                                    isEditing={isEditing}
                                    onDelete={() => handleRemoveDevice(device.id)}
                                />
                            ))}
                            {(isEditing || [...climateDevices, ...mediaDevices, ...otherDevices].length === 0) && (
                                <div className="text-white/20 text-xs text-center py-2 border-dashed border border-white/10 rounded-lg">
                                    Drop Devices
                                </div>
                            )}
                        </div>
                    </div>

                    {/* LIGHTS CARD (1x2) */}
                    <div className={`col-span-1 row-span-2 bg-[#131720] rounded-2xl p-4 flex flex-col border border-white/5 shadow-lg ${isEditing ? 'border-dashed border-cyan-500/30' : ''}`}>
                        <div className="flex items-center gap-2 mb-4 flex-shrink-0">
                            <FiSun size={14} className="text-amber-400" />
                            <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Lighting</span>
                        </div>
                        <div className="flex-1 flex flex-col gap-2.5 min-h-0 overflow-y-auto">
                            {lights.map(device => (
                                <div key={device.id} className="relative group">
                                    <div
                                        onClick={() => !isEditing && setSelectedLight(device)}
                                        className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 cursor-pointer ${isEditing ? 'border-dashed border-white/20' : 'hover:bg-white/5'
                                            } ${entityStates.get(device.entityId)?.state === 'on' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-[#0a0d14] border-transparent'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <FiSun size={14} className={entityStates.get(device.entityId)?.state === 'on' ? 'text-amber-400' : 'text-white/30'} />
                                            <span className="text-[10px] font-bold text-white">{device.name}</span>
                                        </div>
                                        {!isEditing && <div className={`w-2 h-2 rounded-full ${entityStates.get(device.entityId)?.state === 'on' ? 'bg-amber-400' : 'bg-[#191e2b]'}`} />}
                                    </div>
                                    {isEditing && (
                                        <button onClick={(e) => { e.stopPropagation(); handleRemoveDevice(device.id); }} className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:scale-110">
                                            <FiTrash2 size={10} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {(isEditing || lights.length === 0) && (
                                <div className="text-white/20 text-xs text-center py-2 border-dashed border border-white/10 rounded-lg">
                                    Drop Lights
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SCENES CARD */}
                    <div className="col-span-1 row-span-2 bg-[#131720] rounded-2xl p-4 flex flex-col border border-white/5 shadow-lg">
                        <div className="flex items-center gap-2 mb-4">
                            <FiSunrise size={14} className="text-orange-400" />
                            <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Scenes</span>
                        </div>
                        <div className="flex-1 grid grid-cols-2 gap-3 min-h-0">
                            {scenes.map(scene => (
                                <button key={scene.id} className="flex flex-col items-center justify-center gap-2 rounded-2xl border bg-[#0a0d14] border-transparent hover:bg-white/5 text-white/40">
                                    <scene.icon size={20} />
                                    <span className="text-[9px] font-bold uppercase">{scene.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar (Edit Mode) */}
            <AnimatePresence>
                {isEditing && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 280, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="bg-[#0d1117] border-l border-white/5 flex flex-col h-full overflow-hidden"
                    >
                        <div className="p-4 border-b border-white/5">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <FiGrid /> Available Devices
                            </h3>
                            <p className="text-xs text-white/40 mt-1">Drag to grid to add</p>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                            {isLoadingStates ? <div className="text-center text-white/30 text-xs py-4">Loading...</div> :
                                availableEntities.map(entity => (
                                    <div
                                        key={entity.entity_id}
                                        draggable
                                        onDragStart={(e) => e.dataTransfer.setData('application/json', JSON.stringify(entity))}
                                        className="p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 cursor-grab flex items-center gap-3"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center text-white/30">
                                            <FiCpu size={14} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-white truncate">{String(entity.attributes.friendly_name || entity.entity_id)}</p>
                                            <p className="text-[8px] text-white/30 font-mono truncate">{entity.entity_id}</p>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Light Modal */}
            {selectedLight && !isEditing && (
                <LightControlModal
                    device={selectedLight}
                    state={entityStates.get(selectedLight.entityId)}
                    isOpen={!!selectedLight}
                    onClose={() => setSelectedLight(null)}
                    onStateChange={() => setRefreshKey(k => k + 1)}
                />
            )}
        </div>
    );
}
