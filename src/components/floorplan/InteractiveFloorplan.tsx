import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context';
import { RoomConfig } from '@/types';

// Room SVG definitions matching the actual floor plan
interface FloorplanRoom {
    id: string;
    name: string;
    path: string;
    labelPosition: { x: number; y: number };
    color: string;
}

// Floor plan based on the actual house layout
// The layout is approximately 540 wide x 500 tall in SVG units
// Top section: Bedrooms, Office, Showers on the right
// Middle: Large Veranda on left, Hall corridor
// Bottom: Living Room, Kitchen, Dining, Garage

const FLOORPLAN_ROOMS: FloorplanRoom[] = [
    // Top right - Bedroom 1 (master)
    {
        id: 'bedroom-1',
        name: 'Bedroom 1',
        path: 'M 420,20 L 520,20 L 520,100 L 420,100 Z',
        labelPosition: { x: 470, y: 60 },
        color: '#a855f7',
    },
    // Shower 1 (top right)
    {
        id: 'shower-1',
        name: 'Shower',
        path: 'M 420,100 L 520,100 L 520,160 L 420,160 Z',
        labelPosition: { x: 470, y: 130 },
        color: '#06b6d4',
    },
    // Office (right side, middle)
    {
        id: 'office',
        name: 'Office',
        path: 'M 420,160 L 520,160 L 520,220 L 420,220 Z',
        labelPosition: { x: 470, y: 190 },
        color: '#00ff88',
    },
    // Shower 2 (middle right)
    {
        id: 'shower-2',
        name: 'Shower 2',
        path: 'M 420,220 L 520,220 L 520,270 L 420,270 Z',
        labelPosition: { x: 470, y: 245 },
        color: '#06b6d4',
    },
    // Bedroom 2 (middle right)
    {
        id: 'bedroom-2',
        name: 'Bedroom 2',
        path: 'M 420,270 L 520,270 L 520,360 L 420,360 Z',
        labelPosition: { x: 470, y: 315 },
        color: '#a855f7',
    },
    // Hall (upper - connecting bedrooms to veranda)
    {
        id: 'hall-upper',
        name: 'Hall',
        path: 'M 340,100 L 420,100 L 420,360 L 340,360 Z',
        labelPosition: { x: 380, y: 230 },
        color: '#6b7280',
    },
    // Veranda (large open area on left)
    {
        id: 'veranda',
        name: 'Veranda',
        path: 'M 80,20 L 340,20 L 340,320 L 80,320 Z',
        labelPosition: { x: 210, y: 170 },
        color: '#fbbf24',
    },
    // Long Hallway (connecting veranda to bottom section)
    {
        id: 'long-hallway',
        name: 'Long Hallway',
        path: 'M 80,320 L 340,320 L 340,360 L 80,360 Z',
        labelPosition: { x: 210, y: 340 },
        color: '#6b7280',
    },
    // Living Room (bottom left)
    {
        id: 'living-room',
        name: 'Living Room',
        path: 'M 80,360 L 200,360 L 200,460 L 80,460 Z',
        labelPosition: { x: 140, y: 410 },
        color: '#00d4ff',
    },
    // Hall (lower left - entrance area)
    {
        id: 'hall-lower',
        name: 'Hall',
        path: 'M 20,360 L 80,360 L 80,460 L 20,460 Z',
        labelPosition: { x: 50, y: 410 },
        color: '#6b7280',
    },
    // Toilet (center bottom)
    {
        id: 'toilet',
        name: 'Toilet',
        path: 'M 260,400 L 310,400 L 310,460 L 260,460 Z',
        labelPosition: { x: 285, y: 430 },
        color: '#06b6d4',
    },
    // Kitchen (center right bottom)
    {
        id: 'kitchen',
        name: 'Kitchen',
        path: 'M 310,360 L 450,360 L 450,460 L 310,460 Z',
        labelPosition: { x: 380, y: 410 },
        color: '#ff6b35',
    },
    // Dining (right of kitchen)
    {
        id: 'dining',
        name: 'Dining',
        path: 'M 450,360 L 520,360 L 520,420 L 450,420 Z',
        labelPosition: { x: 485, y: 390 },
        color: '#f472b6',
    },
    // Kitchen Veranda (far right bottom)
    {
        id: 'kitchen-veranda',
        name: 'K. Veranda',
        path: 'M 450,420 L 520,420 L 520,460 L 450,460 Z',
        labelPosition: { x: 485, y: 440 },
        color: '#fbbf24',
    },
    // Garage (bottom left, separate)
    {
        id: 'garage',
        name: 'Garage',
        path: 'M 20,480 L 120,480 L 120,540 L 20,540 Z',
        labelPosition: { x: 70, y: 510 },
        color: '#6b7280',
    },
];

// Simulated room states - in real app would come from HA
const useRoomStates = (rooms: RoomConfig[]) => {
    const [states, setStates] = useState<Record<string, { lightsOn: boolean; mediaPlaying: boolean }>>({});

    useEffect(() => {
        // Simulate initial states
        const initialStates: Record<string, { lightsOn: boolean; mediaPlaying: boolean }> = {};
        FLOORPLAN_ROOMS.forEach((room) => {
            initialStates[room.id] = {
                lightsOn: Math.random() > 0.6,
                mediaPlaying: Math.random() > 0.85,
            };
        });
        setStates(initialStates);

        // Simulate state changes
        const interval = setInterval(() => {
            setStates((prev) => {
                const newStates = { ...prev };
                const roomIds = Object.keys(newStates);
                if (roomIds.length > 0) {
                    const randomRoom = roomIds[Math.floor(Math.random() * roomIds.length)];
                    if (Math.random() > 0.5) {
                        newStates[randomRoom] = {
                            ...newStates[randomRoom],
                            lightsOn: !newStates[randomRoom].lightsOn,
                        };
                    } else {
                        newStates[randomRoom] = {
                            ...newStates[randomRoom],
                            mediaPlaying: !newStates[randomRoom].mediaPlaying,
                        };
                    }
                }
                return newStates;
            });
        }, 5000);

        return () => clearInterval(interval);
    }, [rooms]);

    return states;
};

// Equalizer animation for music
function Equalizer({ color }: { color: string }) {
    return (
        <div className="flex items-end gap-0.5 h-4">
            {[0, 1, 2, 3].map((i) => (
                <motion.div
                    key={i}
                    className="w-1 rounded-full"
                    style={{ backgroundColor: color }}
                    animate={{
                        height: ['4px', '16px', '8px', '12px', '4px'],
                    }}
                    transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.1,
                    }}
                />
            ))}
        </div>
    );
}

export default function InteractiveFloorplan() {
    const navigate = useNavigate();
    const { config } = useApp();
    const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);
    const roomStates = useRoomStates(config.rooms);

    const handleRoomClick = (roomId: string) => {
        navigate(`/room/${roomId}`);
    };

    return (
        <div className="relative w-full max-w-4xl mx-auto">
            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 rounded-3xl blur-3xl" />

            {/* SVG Floorplan */}
            <svg
                viewBox="0 0 540 560"
                className="w-full h-auto"
                style={{ filter: 'drop-shadow(0 0 40px rgba(0, 0, 0, 0.5))' }}
            >
                {/* Background */}
                <rect x="0" y="0" width="540" height="560" fill="transparent" />

                {/* Grid pattern */}
                <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path
                            d="M 20 0 L 0 0 0 20"
                            fill="none"
                            stroke="rgba(255,255,255,0.03)"
                            strokeWidth="0.5"
                        />
                    </pattern>

                    {/* Glow filter for lit rooms */}
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                <rect x="0" y="0" width="540" height="560" fill="url(#grid)" />

                {/* Outer walls - Main structure outline */}
                <path
                    d="M 20,20 L 520,20 L 520,460 L 20,460 L 20,360 L 80,360 L 80,320 L 20,320 Z"
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="3"
                />

                {/* Garage outline (separate structure) */}
                <path
                    d="M 20,480 L 120,480 L 120,540 L 20,540 Z"
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="2"
                />

                {/* Room polygons */}
                {FLOORPLAN_ROOMS.map((room) => {
                    const state = roomStates[room.id];
                    const isLit = state?.lightsOn;
                    // Note: state?.mediaPlaying is available but handled via roomStates
                    const isHovered = hoveredRoom === room.id;

                    return (
                        <g key={room.id}>
                            {/* Room shape */}
                            <motion.path
                                d={room.path}
                                fill={isLit ? `${room.color}25` : 'rgba(30, 30, 30, 0.5)'}
                                stroke={isHovered ? room.color : 'rgba(255, 255, 255, 0.08)'}
                                strokeWidth={isHovered ? 2 : 1}
                                style={{
                                    cursor: 'pointer',
                                    filter: isLit ? 'url(#glow)' : undefined,
                                }}
                                whileHover={{ scale: 1.01 }}
                                transition={{ duration: 0.2 }}
                                onClick={() => handleRoomClick(room.id)}
                                onMouseEnter={() => setHoveredRoom(room.id)}
                                onMouseLeave={() => setHoveredRoom(null)}
                            />

                            {/* Room label */}
                            <text
                                x={room.labelPosition.x}
                                y={room.labelPosition.y - 8}
                                textAnchor="middle"
                                fill={isHovered || isLit ? room.color : 'rgba(255, 255, 255, 0.4)'}
                                fontSize="10"
                                fontWeight="500"
                                style={{
                                    pointerEvents: 'none',
                                    fontFamily: 'Inter, sans-serif',
                                    textShadow: isLit ? `0 0 10px ${room.color}` : 'none',
                                }}
                            >
                                {room.name}
                            </text>

                            {/* Light status indicator */}
                            {isLit && (
                                <motion.circle
                                    cx={room.labelPosition.x}
                                    cy={room.labelPosition.y + 6}
                                    r="3"
                                    fill="#ffcc00"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    style={{
                                        filter: 'drop-shadow(0 0 4px #ffcc00)',
                                    }}
                                />
                            )}
                        </g>
                    );
                })}

                {/* Interior walls for visual depth */}
                {/* Vertical wall between bedrooms area and hall */}
                <line x1="420" y1="20" x2="420" y2="360" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
                {/* Hall to veranda wall */}
                <line x1="340" y1="20" x2="340" y2="360" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
                {/* Horizontal hallway division */}
                <line x1="80" y1="360" x2="520" y2="360" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
                {/* Long hallway lower bound */}
                <line x1="80" y1="320" x2="340" y2="320" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                {/* Living room right wall */}
                <line x1="200" y1="360" x2="200" y2="460" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                {/* Kitchen left wall */}
                <line x1="310" y1="360" x2="310" y2="460" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                {/* Dining wall */}
                <line x1="450" y1="360" x2="450" y2="460" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

                {/* Horizontal divisions in right wing */}
                <line x1="420" y1="100" x2="520" y2="100" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                <line x1="420" y1="160" x2="520" y2="160" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                <line x1="420" y1="220" x2="520" y2="220" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                <line x1="420" y1="270" x2="520" y2="270" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            </svg>

            {/* Music playing indicators - positioned absolutely over the SVG */}
            {FLOORPLAN_ROOMS.map((room) => {
                const state = roomStates[room.id];
                if (!state?.mediaPlaying) return null;

                // Calculate position relative to SVG viewBox
                const xPercent = (room.labelPosition.x / 540) * 100;
                const yPercent = ((room.labelPosition.y + 18) / 560) * 100;

                return (
                    <motion.div
                        key={`eq-${room.id}`}
                        className="absolute"
                        style={{
                            left: `${xPercent}%`,
                            top: `${yPercent}%`,
                            transform: 'translate(-50%, -50%)',
                        }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                    >
                        <Equalizer color={room.color} />
                    </motion.div>
                );
            })}

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-6 text-sm text-white/50">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_8px_#ffcc00]" />
                    <span>Lights On</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-end gap-0.5">
                        {[0, 1, 2].map((i) => (
                            <div key={i} className="w-0.5 h-2 bg-purple-400 rounded-full" />
                        ))}
                    </div>
                    <span>Media Playing</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded border border-cyan-400" />
                    <span>Click to Enter</span>
                </div>
            </div>
        </div>
    );
}
