import { useState, useRef, useEffect, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit2, FiCheck, FiTrash2, FiX, FiSun, FiMusic, FiCpu, FiToggleRight, FiThermometer, FiVideo, FiActivity } from 'react-icons/fi';
import { useApp } from '@/context';
import { RoomConfig, DeviceConfig } from '@/types';
import { hassApi, HassState } from '@/services';
import { LightControlModal } from '@/components/devices/LightControlModal';
import { GenericDeviceControlModal } from '@/components/devices/GenericDeviceControlModal';

export function FloorPlanMap() {
    const { config, updateRoom } = useApp();
    const [localEditMode, setLocalEditMode] = useState(false);
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
    const [currentPoints, setCurrentPoints] = useState<[number, number][]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const [states, setStates] = useState<Record<string, HassState>>({});
    const [connectionError, setConnectionError] = useState(false);

    // Device Placement Mode State
    const [devicePlacementMode, setDevicePlacementMode] = useState(false);
    const [placingDeviceId, setPlacingDeviceId] = useState<string | null>(null);

    // Device Control State
    const [controlDevice, setControlDevice] = useState<DeviceConfig | null>(null);

    // Helper to get icon for device type
    const getDeviceIcon = (type: string) => {
        switch (type) {
            case 'light': return <FiSun size={14} />;
            case 'switch': return <FiToggleRight size={14} />;
            case 'media_player': return <FiMusic size={14} />;
            case 'climate': return <FiThermometer size={14} />;
            case 'camera': return <FiVideo size={14} />;
            case 'sensor': return <FiActivity size={14} />;
            default: return <FiCpu size={14} />;
        }
    };

    // Update container size on resize - kept for potential future use or aspect ratio handling
    useEffect(() => {
        const img = new Image();
        img.src = '/floorplan.png';
    }, []);

    // Poll states
    useEffect(() => {
        const fetchStates = async () => {
            if (!config.homeAssistant.connected) return;
            try {
                const _states = await hassApi.getStates();
                const stateMap: Record<string, HassState> = {};
                _states.forEach(s => stateMap[s.entity_id] = s);
                setStates(stateMap);
                setConnectionError(false);
            } catch (e) {
                console.error("Failed to fetch states for floorplan", e);
                setConnectionError(true);
            }
        };

        fetchStates();
        const interval = setInterval(fetchStates, 5000);
        return () => clearInterval(interval);
    }, [config.homeAssistant.connected]);

    // Check if a room is "active" (has lights on)
    const isRoomActive = (room: RoomConfig) => {
        return room.devices.some(d => {
            if (d.type === 'light' || d.type === 'switch') {
                const state = states[d.entityId];
                return state?.state === 'on';
            }
            return false;
        });
    };

    // --- Editing Logic ---

    const handleSvgClick = (e: MouseEvent<SVGSVGElement>) => {
        if (!localEditMode || !selectedRoomId) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width * 100;
        const y = (e.clientY - rect.top) / rect.height * 100;

        setCurrentPoints([...currentPoints, [x, y]]);
    };

    const handleDevicePlacementClick = (e: MouseEvent<SVGSVGElement>) => {
        if (!devicePlacementMode || !placingDeviceId) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width * 100;
        const y = (e.clientY - rect.top) / rect.height * 100;

        // Find the room containing the device and update it
        for (const room of config.rooms) {
            const deviceIndex = room.devices.findIndex(d => d.id === placingDeviceId);
            if (deviceIndex !== -1) {
                const newDevices = [...room.devices];
                newDevices[deviceIndex] = { ...newDevices[deviceIndex], x, y };
                updateRoom(room.id, { devices: newDevices });
                setPlacingDeviceId(null); // Deselect after placing
                break;
            }
        }
    };

    const handleSavePath = () => {
        if (!selectedRoomId || currentPoints.length < 3) return;

        const pathData = currentPoints.map((p, i) =>
            `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`
        ).join(' ') + ' Z';

        updateRoom(selectedRoomId, { floorplanPath: pathData });
        setCurrentPoints([]);
        setSelectedRoomId(null);
    };

    const handleClearPath = () => {
        setCurrentPoints([]);
    };

    const handleDeleteRoomPath = (roomId: string) => {
        updateRoom(roomId, { floorplanPath: undefined });
    };

    // --- Rendering ---

    return (
        <div className="flex flex-col h-full bg-[#0d1117] rounded-3xl overflow-hidden border border-white/5 shadow-2xl relative">
            {/* Header / Toolbar (Moved to Bottom Center) */}
            <div className="absolute bottom-6 left-0 right-0 p-4 z-20 flex flex-col-reverse items-center justify-end gap-4 pointer-events-none">
                <div className="pointer-events-auto bg-black/60 backdrop-blur-md rounded-2xl p-2 border border-white/10 flex gap-2">
                    {/* Room Mapping Mode Button */}
                    <button
                        onClick={() => {
                            setLocalEditMode(!localEditMode);
                            setDevicePlacementMode(false);
                            setSelectedRoomId(null);
                        }}
                        className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${localEditMode
                            ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                            : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'}`}
                    >
                        <FiEdit2 size={16} />
                        <span className="font-medium text-sm">{localEditMode ? 'Done Mapping' : 'Map Rooms'}</span>
                    </button>

                    <div className="w-px bg-white/10 mx-1" />

                    {/* Device Placement Mode Button */}
                    <button
                        onClick={() => {
                            setDevicePlacementMode(!devicePlacementMode);
                            setLocalEditMode(false);
                            setPlacingDeviceId(null);
                        }}
                        className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${devicePlacementMode
                            ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                            : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'}`}
                    >
                        <FiCpu size={16} />
                        <span className="font-medium text-sm">{devicePlacementMode ? 'Done Placing' : 'Place Devices'}</span>
                    </button>

                    {/* Check/Clear Buttons (Only for Room Mapping) */}
                    {localEditMode && selectedRoomId && (
                        <>
                            <div className="w-px bg-white/10 mx-1" />
                            <button
                                onClick={handleSavePath}
                                disabled={currentPoints.length < 3}
                                className="p-2 rounded-xl bg-green-500/20 text-green-400 disabled:opacity-30 hover:bg-green-500/30 transition-colors"
                                title="Save Shape"
                            >
                                <FiCheck size={18} />
                            </button>
                            <button
                                onClick={handleClearPath}
                                disabled={currentPoints.length === 0}
                                className="p-2 rounded-xl bg-orange-500/20 text-orange-400 disabled:opacity-30 hover:bg-orange-500/30 transition-colors"
                                title="Clear Points"
                            >
                                <FiX size={18} />
                            </button>
                        </>
                    )}
                </div>

                {/* Room Selector Panel (Room Mapping Mode) */}
                {localEditMode && (
                    !selectedRoomId ? (
                        <div className="pointer-events-auto bg-black/80 backdrop-blur-md rounded-2xl p-4 border border-white/10 w-64 max-h-[50vh] overflow-y-auto custom-scrollbar mb-2">
                            <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wider text-white/40">Select Room</h3>
                            <div className="space-y-2">
                                {config.rooms.map(room => (
                                    <button
                                        key={room.id}
                                        onClick={() => {
                                            setSelectedRoomId(room.id);
                                            setCurrentPoints([]);
                                        }}
                                        className={`w-full p-3 rounded-xl flex items-center justify-between transition-all bg-white/5 border border-transparent text-white/50 hover:bg-white/10`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: room.color }} />
                                            <span className="text-sm font-medium">{room.name}</span>
                                        </div>
                                        {room.floorplanPath && (
                                            <div
                                                className="text-red-400 hover:text-red-300 p-1"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteRoomPath(room.id);
                                                }}
                                            >
                                                <FiTrash2 size={14} />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-4 text-xs text-white/30 px-2">
                                <p>1. Select a room</p>
                                <p>2. Click points on map to outline it</p>
                                <p>3. Click checkmark to save</p>
                            </div>
                        </div>
                    ) : (
                        <div className="pointer-events-auto bg-black/80 backdrop-blur-md rounded-2xl p-3 border border-white/10 mb-2 flex items-center gap-3 animate-slideUp">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: config.rooms.find(r => r.id === selectedRoomId)?.color }} />
                                <span className="text-xs font-bold text-cyan-400">
                                    Mapping: {config.rooms.find(r => r.id === selectedRoomId)?.name}
                                </span>
                            </div>
                            <button
                                onClick={() => setSelectedRoomId(null)}
                                className="text-xs text-white/40 hover:text-white underline"
                            >
                                Change Room
                            </button>
                        </div>
                    )
                )}

                {/* Device Selector Panel (Device Placement Mode) */}
                {devicePlacementMode && (
                    <div className="pointer-events-auto bg-black/80 backdrop-blur-md rounded-2xl p-4 border border-white/10 w-72 max-h-[50vh] overflow-y-auto custom-scrollbar mb-2">
                        <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wider text-white/40">Select Device to Place</h3>
                        <div className="space-y-4">
                            {config.rooms.map(room => (
                                <div key={room.id}>
                                    <h4 className="text-xs font-bold text-white/20 uppercase mb-2 pl-1">{room.name}</h4>
                                    <div className="space-y-1">
                                        {room.devices.map(device => (
                                            <button
                                                key={device.id}
                                                onClick={() => setPlacingDeviceId(placingDeviceId === device.id ? null : device.id)}
                                                className={`w-full p-2 rounded-lg flex items-center justify-between transition-all ${placingDeviceId === device.id
                                                        ? 'bg-purple-500/20 border border-purple-500/50 text-white'
                                                        : 'bg-white/5 border border-transparent text-white/60 hover:bg-white/10'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    {getDeviceIcon(device.type)}
                                                    <span className="text-xs font-medium truncate">{device.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {device.x !== undefined && (
                                                        <FiCheck size={12} className="text-green-400" />
                                                    )}
                                                    {device.x !== undefined && (
                                                        <div
                                                            className="text-white/20 hover:text-red-400 p-1"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                // Handle delete placement
                                                                const newDevices = room.devices.map(d =>
                                                                    d.id === device.id ? { ...d, x: undefined, y: undefined } : d
                                                                );
                                                                updateRoom(room.id, { devices: newDevices });
                                                            }}
                                                        >
                                                            <FiTrash2 size={12} />
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                        {room.devices.length === 0 && (
                                            <div className="text-[10px] text-white/20 italic pl-2">No devices</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Map Container - Uses Grid Stack to align SVG perfectly with Image */}
            <div
                ref={containerRef}
                className="relative w-full h-full flex items-center justify-center overflow-hidden bg-transparent"
            >
                {/* The Wrapper shrinks to fit the Image */}
                <div className="relative grid place-items-center" style={{ maxHeight: '100%', maxWidth: '100%' }}>
                    {/* Background Image - Drives the size */}
                    <img
                        src={`/floorplan.png?v=${Date.now()}`}
                        alt="Floor Plan"
                        className="max-w-full max-h-[85vh] object-contain" // Limit height to ensure toolbar space
                        style={{ gridArea: '1/1' }}
                        onError={(e) => console.error('Failed to load floor plan image:', e)}
                        onLoad={() => console.log('Floor plan image loaded successfully')}
                    />

                    {/* SVG/Interaction Layer */}
                    <svg
                        className="w-full h-full"
                        style={{ gridArea: '1/1', zIndex: 1, cursor: (localEditMode || (devicePlacementMode && placingDeviceId)) ? 'crosshair' : 'default' }}
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        onClick={(e) => {
                            if (localEditMode) handleSvgClick(e);
                            if (devicePlacementMode && placingDeviceId) handleDevicePlacementClick(e);
                        }}
                    >
                        {/* Render saved room paths */}
                        <AnimatePresence>
                            {config.rooms.map(room => {
                                if (localEditMode && selectedRoomId === room.id) return null;
                                if (!room.floorplanPath) return null;
                                const isActive = isRoomActive(room);
                                return (
                                    <motion.path
                                        key={room.id}
                                        d={room.floorplanPath}
                                        fill={isActive ? room.color : 'transparent'}
                                        stroke={localEditMode ? room.color : 'transparent'}
                                        strokeWidth="0.5"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: isActive ? 0.4 : (localEditMode ? 0.2 : 0) }}
                                        whileHover={{ opacity: 0.5, fill: room.color, cursor: 'pointer' }}
                                        onClick={() => {
                                            if (!localEditMode && !devicePlacementMode) {
                                                window.location.href = `/room/${room.id}`;
                                            }
                                        }}
                                    />
                                );
                            })}
                        </AnimatePresence>

                        {/* Rendering Edit Paths/Points */}
                        {localEditMode && currentPoints.length > 0 && (
                            <path
                                d={(currentPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' ')) + (currentPoints.length > 2 ? ' Z' : '')}
                                fill="rgba(6, 182, 212, 0.3)" stroke="#06b6d4" strokeWidth="0.5" className="pointer-events-none"
                            />
                        )}
                        {localEditMode && currentPoints.map((p, i) => (
                            <circle key={i} cx={p[0]} cy={p[1]} r="0.5" fill="#fff" stroke="#06b6d4" strokeWidth="0.2" className="pointer-events-none" />
                        ))}
                    </svg>

                    {/* Overlay Layer for Status Markers & Devices */}
                    <div className="w-full h-full pointer-events-none absolute left-0 top-0" style={{ gridArea: '1/1', zIndex: 10 }}>
                        {/* 1. Render Room Status Pills (Only if NOT in Device Placement Mode to avoid clutter) */}
                        {!devicePlacementMode && config.rooms.map(room => {
                            if (!room.floorplanPath || (localEditMode && selectedRoomId === room.id)) return null;

                            // Calculate centroid
                            const coords = room.floorplanPath.match(/[\d.]+/g)?.map(Number) || [];
                            let xSum = 0, ySum = 0, count = 0;
                            for (let i = 0; i < coords.length; i += 2) {
                                if (coords[i + 1] !== undefined) {
                                    xSum += coords[i];
                                    ySum += coords[i + 1];
                                    count++;
                                }
                            }
                            const center = count > 0 ? { x: xSum / count, y: ySum / count } : { x: 50, y: 50 };

                            const lightsOn = room.devices.filter(d => (d.type === 'light' || d.type === 'switch') && states[d.entityId]?.state === 'on').length;
                            const activeMedia = room.devices.find(d => d.type === 'media_player' && states[d.entityId]?.state !== 'idle' && states[d.entityId]?.state !== 'off');
                            const hasActivity = lightsOn > 0 || activeMedia;
                            return (
                                <div
                                    key={`status-${room.id}`}
                                    className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer"
                                    style={{ left: `${center.x}%`, top: `${center.y}%` }}
                                    onClick={() => { if (!localEditMode && !devicePlacementMode) window.location.href = `/room/${room.id}`; }}
                                >
                                    <motion.div
                                        className={`px-3 py-1.5 rounded-full backdrop-blur-md border shadow-lg flex items-center gap-2 transition-all ${hasActivity ? 'bg-white/90 text-slate-800 border-white/50 scale-110' : 'bg-black/40 text-white/70 border-white/10 hover:bg-black/60 hover:text-white'
                                            }`}
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        <span className="text-xs font-bold whitespace-nowrap">{room.name}</span>
                                        <div className="flex items-center gap-1.5 border-l border-current/20 pl-1.5">
                                            {lightsOn > 0 && <FiSun size={10} className="fill-current text-amber-500" />}
                                            {hasActivity && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
                                        </div>
                                    </motion.div>
                                </div>
                            );
                        })}

                        {/* 2. Render Placed Devices */}
                        {config.rooms.map(room => (
                            room.devices.map(device => {
                                if (device.x === undefined || device.y === undefined) return null;
                                const state = states[device.entityId];
                                const isOn = state?.state === 'on' || (state?.state === 'playing');
                                const isSelected = placingDeviceId === device.id;

                                return (
                                    <div
                                        key={device.id}
                                        className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto select-none"
                                        style={{ left: `${device.x}%`, top: `${device.y}%` }}
                                    >
                                        <motion.button
                                            whileHover={{ scale: 1.2 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (!devicePlacementMode) {
                                                    // Open Device Control Modal
                                                    setControlDevice(device);
                                                } else {
                                                    // Select for moving
                                                    setPlacingDeviceId(device.id);
                                                }
                                            }}
                                            className={`p-2 rounded-full shadow-lg border transition-all ${isOn
                                                    ? 'bg-amber-400 text-amber-900 border-amber-300 shadow-amber-500/50'
                                                    : 'bg-black/60 text-white/60 border-white/10 hover:bg-black/80 hover:text-white'
                                                } ${isSelected ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-black' : ''}`}
                                            title={device.name}
                                        >
                                            {getDeviceIcon(device.type)}
                                        </motion.button>
                                    </div>
                                );
                            })
                        ))}
                    </div>
                </div>

                {/* Connection Error Overlay */}
                {connectionError && (
                    <div className="absolute top-4 right-4 z-30">
                        <div className="bg-red-500/20 backdrop-blur-md border border-red-500/50 text-red-200 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium animate-pulse">
                            <FiX className="text-red-400" />
                            <span>Connection Lost - Checking...</span>
                        </div>
                    </div>
                )}

                {/* Instructions Overlay if empty */}
                {!localEditMode && !devicePlacementMode && !config.rooms.some(r => r.floorplanPath) && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                        <div className="bg-[#131720]/95 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-center max-w-md pointer-events-auto shadow-2xl">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center text-cyan-400 flex-shrink-0">
                                    <FiEdit2 size={24} />
                                </div>
                                <div className="text-left">
                                    <h2 className="text-lg font-bold text-white">Setup Your Floor Plan</h2>
                                    <p className="text-sm text-white/60">
                                        Click "Map Rooms" below to outline your rooms
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setLocalEditMode(true)}
                                className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-cyan-500/20 w-full"
                            >
                                Start Mapping
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Device Control Modals */}
            {controlDevice && controlDevice.type === 'light' && (
                <LightControlModal
                    isOpen={!!controlDevice}
                    device={controlDevice}
                    state={states[controlDevice.entityId] as any} // Cast safely as simplified structure is compatible or handled
                    onClose={() => setControlDevice(null)}
                />
            )}

            {controlDevice && controlDevice.type !== 'light' && (
                <GenericDeviceControlModal
                    isOpen={!!controlDevice}
                    device={controlDevice}
                    state={states[controlDevice.entityId]}
                    onClose={() => setControlDevice(null)}
                />
            )}
        </div>
    );
}
