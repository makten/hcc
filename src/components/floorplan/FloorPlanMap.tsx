import { useState, useRef, useEffect, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit2, FiCheck, FiTrash2, FiX } from 'react-icons/fi';
import { useApp } from '@/context';
import { RoomConfig } from '@/types';
import { hassApi } from '@/services';

export function FloorPlanMap() {
    const { config, updateRoom } = useApp();
    const [localEditMode, setLocalEditMode] = useState(false);
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
    const [currentPoints, setCurrentPoints] = useState<[number, number][]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const [states, setStates] = useState<Record<string, string>>({});

    // Update container size on resize - kept for potential future use or aspect ratio handling
    useEffect(() => {
        // ... (keeping effect for image load trigger, though size state is unused)
        const img = new Image();
        img.src = '/floorplan.png';
    }, []);

    // Poll states for room lighting effects
    useEffect(() => {
        const fetchStates = async () => {
            if (!config.homeAssistant.connected) return;
            try {
                // We just want to check if lights are on in each room
                // Ideally this would be a subscription, for now we poll lightly
                const _states = await hassApi.getStates();
                const stateMap: Record<string, string> = {};
                _states.forEach(s => stateMap[s.entity_id] = s.state);
                setStates(stateMap);
            } catch (e) {
                console.error("Failed to fetch states for floorplan", e);
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
                return state === 'on';
            }
            return false;
        });
    };

    // --- Editing Logic ---

    const handleSvgClick = (e: MouseEvent<SVGSVGElement>) => {
        if (!localEditMode || !selectedRoomId) return;

        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = (e.clientX - rect.left) / rect.width * 100;
        const y = (e.clientY - rect.top) / rect.height * 100;

        setCurrentPoints([...currentPoints, [x, y]]);
    };

    const handleSavePath = () => {
        if (!selectedRoomId || currentPoints.length < 3) return;

        // Create SVG path string
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
            {/* Header / Toolbar */}
            <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-start pointer-events-none">
                <div className="pointer-events-auto bg-black/60 backdrop-blur-md rounded-2xl p-2 border border-white/10 flex gap-2">
                    <button
                        onClick={() => setLocalEditMode(!localEditMode)}
                        className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${localEditMode
                            ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                            : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'}`}
                    >
                        <FiEdit2 size={16} />
                        <span className="font-medium text-sm">{localEditMode ? 'Finish Mapping' : 'Edit Map'}</span>
                    </button>

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

                {localEditMode && (
                    <div className="pointer-events-auto bg-black/80 backdrop-blur-md rounded-2xl p-4 border border-white/10 w-64 max-h-[80vh] overflow-y-auto custom-scrollbar">
                        <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wider text-white/40">Select Room</h3>
                        <div className="space-y-2">
                            {config.rooms.map(room => (
                                <button
                                    key={room.id}
                                    onClick={() => {
                                        setSelectedRoomId(room.id);
                                        setCurrentPoints([]);
                                    }}
                                    className={`w-full p-3 rounded-xl flex items-center justify-between transition-all ${selectedRoomId === room.id
                                        ? 'bg-cyan-500/20 border border-cyan-500/50 text-white'
                                        : 'bg-white/5 border border-transparent text-white/50 hover:bg-white/10'
                                        }`}
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
                )}
            </div>

            {/* Map Container */}
            <div
                ref={containerRef}
                className="relative w-full h-full bg-[#050505] flex items-center justify-center overflow-hidden"
            >
                {/* Background Image */}
                <img
                    src="/floorplan.png"
                    alt="Floor Plan"
                    className="absolute inset-0 w-full h-full object-contain opacity-90"
                />

                {/* SVG Overlay */}
                <svg
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    onClick={handleSvgClick}
                >
                    {/* Render saved room paths */}
                    <AnimatePresence>
                        {config.rooms.map(room => {
                            // Don't render the room we are currently editing
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
                                    animate={{
                                        opacity: isActive ? 0.4 : (localEditMode ? 0.2 : 0),
                                        fill: isActive
                                            ? room.color
                                            : (localEditMode ? room.color : 'transparent')
                                    }}
                                    whileHover={{
                                        opacity: 0.5,
                                        fill: room.color,
                                        cursor: 'pointer'
                                    }}
                                    transition={{ duration: 0.3 }}
                                    // Navigate on click if not editing
                                    onClick={() => {
                                        if (!localEditMode) {
                                            window.location.hash = `#/room/${room.id}`;
                                        }
                                    }}
                                />
                            );
                        })}
                    </AnimatePresence>

                    {/* Render current editing path */}
                    {localEditMode && currentPoints.length > 0 && (
                        <path
                            d={(currentPoints.map((p, i) =>
                                `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`
                            ).join(' ')) + (currentPoints.length > 2 ? ' Z' : '')}
                            fill="rgba(6, 182, 212, 0.3)"
                            stroke="#06b6d4"
                            strokeWidth="0.5"
                            className="pointer-events-none"
                        />
                    )}

                    {/* Render editing points */}
                    {localEditMode && currentPoints.map((p, i) => (
                        <circle
                            key={i}
                            cx={p[0]}
                            cy={p[1]}
                            r="0.5"
                            fill="#fff"
                            stroke="#06b6d4"
                            strokeWidth="0.2"
                            className="pointer-events-none"
                        />
                    ))}
                </svg>

                {/* Instructions Overlay if empty */}
                {!localEditMode && !config.rooms.some(r => r.floorplanPath) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10 pointer-events-none">
                        <div className="bg-[#131720] p-8 rounded-3xl border border-white/10 text-center max-w-md pointer-events-auto">
                            <div className="w-16 h-16 bg-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-cyan-400">
                                <FiEdit2 size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Setup Your Floor Plan</h2>
                            <p className="text-white/60 mb-6">
                                Your floor plan image is loaded! Now, click "Edit Map" to outline your rooms and link them to your devices.
                            </p>
                            <button
                                onClick={() => setLocalEditMode(true)}
                                className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl font-bold transition-all shadow-lg shadow-cyan-500/20 w-full"
                            >
                                Start Mapping
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
