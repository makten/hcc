import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    FiThermometer,
    FiSun,
    FiWind,
    FiMonitor,
    FiLock,
    FiShield,
    FiVideo,
    FiMoon,
    FiFilm,
    FiCoffee,
    FiSunrise,
    FiPower,
    FiBriefcase,
    FiPrinter,
    FiTool,
    FiDroplet,
    FiCloudRain,
    FiChevronUp,
    FiChevronDown,
    FiMusic,
    FiSpeaker,
    FiEye
} from 'react-icons/fi';
import { useApp } from '@/context';
import { RussoundMiniPlayer } from '@/features/russound-player';

// Room background images
const ROOM_IMAGES: Record<string, string> = {
    'living-room': 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200',
    'bedroom-1': 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200',
    'kitchen': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200',
    'office': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200',
    'veranda': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200',
    'garage': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200',
    default: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200',
};

// Room-specific scene configurations (scenes are still hardcoded as they're more complex)
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
    'kitchen': [
        { id: 'cooking', name: 'Cooking', icon: FiTool, color: 'text-orange-400' },
        { id: 'dining', name: 'Dining', icon: FiCoffee, color: 'text-yellow-400' },
        { id: 'clean', name: 'Cleaning', icon: FiDroplet, color: 'text-cyan-400' },
        { id: 'night', name: 'Night', icon: FiMoon, color: 'text-blue-400' },
    ],
    'office': [
        { id: 'focus', name: 'Focus', icon: FiBriefcase, color: 'text-cyan-400' },
        { id: 'meeting', name: 'Meeting', icon: FiVideo, color: 'text-blue-400' },
        { id: 'break', name: 'Break', icon: FiCoffee, color: 'text-green-400' },
        { id: 'late', name: 'Late Work', icon: FiMoon, color: 'text-indigo-400' },
    ],
    'default': [
        { id: 'morning', name: 'Morning', icon: FiSunrise, color: 'text-amber-400' },
        { id: 'active', name: 'Active', icon: FiSun, color: 'text-yellow-400' },
        { id: 'relax', name: 'Relax', icon: FiCoffee, color: 'text-green-400' },
        { id: 'night', name: 'Night', icon: FiMoon, color: 'text-blue-400' },
    ],
};

// Device type to icon mapping
const DEVICE_ICONS: Record<string, any> = {
    light: FiSun,
    climate: FiThermometer,
    fan: FiWind,
    vacuum: FiTool,
    media_player: FiMonitor,
    switch: FiPower,
    sensor: FiEye,
    camera: FiVideo,
    default: FiPower,
};

// Helper component for filter icon
function FiFilter(props: any) {
    return <FiWind {...props} className={props.className || ''} style={{ transform: 'rotate(90deg)', ...props.style }} />;
}

export default function RoomView() {
    const { id } = useParams<{ id: string }>();
    const { config } = useApp();
    const room = config.rooms.find((r) => r.id === id);

    // Extract devices from config by type
    const configuredLights = room?.devices.filter(d => d.type === 'light') || [];
    const configuredAppliances = room?.devices.filter(d =>
        d.type === 'media_player' || d.type === 'switch' || d.type === 'fan' || d.type === 'vacuum'
    ) || [];

    // Get scenes for this room
    const scenes = ROOM_SCENES[id || ''] || ROOM_SCENES['default'];

    // Climate state
    const [temperature, setTemperature] = useState(21.5);
    const [targetTemp, setTargetTemp] = useState(22.0);
    const [acOn, setAcOn] = useState(true);
    const [heatingOn, setHeatingOn] = useState(false);

    // Security state
    const [securityArmed, setSecurityArmed] = useState(true);

    // Appliances state (dynamic sizing)
    const [applianceStates, setApplianceStates] = useState<Record<string, boolean>>({});

    // Lights state
    const [lightStates, setLightStates] = useState<Record<string, number>>({});

    const [activeScene, setActiveScene] = useState<string | null>(null);

    // Initialize/Reset state when room changes
    useEffect(() => {
        // Initialize configured devices (from Settings)
        const newApps: Record<string, boolean> = {};
        configuredAppliances.forEach(d => newApps[d.id] = Math.random() > 0.7);
        setApplianceStates(newApps);

        // Initialize configured lights (from Settings)
        const newLights: Record<string, number> = {};
        configuredLights.forEach(d => newLights[d.id] = Math.floor(Math.random() * 60) + 20);
        setLightStates(newLights);

    }, [id, configuredLights.length, configuredAppliances.length]);

    if (!room) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <span className="text-4xl mb-4">🏠</span>
                <h2 className="text-lg font-medium text-white mb-2">Room Not Found</h2>
                <Link to="/" className="text-cyan-400 text-sm hover:underline">Go Home</Link>
            </div>
        );
    }

    const roomImage = ROOM_IMAGES[id || ''] || ROOM_IMAGES.default;

    const toggleAppliance = (key: string) => {
        setApplianceStates(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const setLightLevel = (key: string, value: number) => {
        setLightStates(prev => ({ ...prev, [key]: value }));
    };

    // Safe accessor helper
    const getApplianceState = (key: string) => applianceStates[key] || false;
    const getLightLevel = (key: string) => lightStates[key] || 0;

    return (
        <div className="h-full w-full bg-[#080a0f] p-3 md:p-4">
            <div className="h-full w-full grid grid-cols-5 grid-rows-5 gap-3 md:gap-4">

                {/* ========== CAMERA / ROOM PREVIEW (3×3) ========== */}
                <div className="col-span-3 row-span-3 relative overflow-hidden group rounded-2xl md:rounded-3xl shadow-xl shadow-black/20">
                    <img
                        src={roomImage}
                        alt={room.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Cinematic overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10 opacity-70" />

                    <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600/90 backdrop-blur-md text-white text-[10px] font-bold tracking-wider shadow-lg border border-white/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        LIVE
                    </div>

                    <div className="absolute bottom-6 left-6">
                        <h2 className="text-3xl font-bold text-white tracking-tight drop-shadow-lg">{room.name}</h2>
                        <div className="flex items-center gap-3 text-white/70 text-sm mt-1.5">
                            <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur px-2 py-1 rounded-md">
                                <FiVideo size={12} />
                                <span>Main Camera</span>
                            </div>
                            <span className="text-white/40">•</span>
                            <span className="text-xs uppercase tracking-wider opacity-80">4K HDR</span>
                        </div>
                    </div>
                </div>

                {/* ========== AUDIO PLAYER (2×3) ========== */}
                <RussoundMiniPlayer
                    roomName={room.name}
                    className="col-span-2 row-span-3"
                />

                {/* ========== CLIMATE CARD (1×2) ========== */}
                <div className="col-span-1 row-span-2 bg-[#131720] rounded-2xl p-4 flex flex-col relative overflow-hidden border border-white/5 shadow-lg">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-[40px] pointer-events-none" />

                    <div className="flex items-center gap-2 mb-2 flex-shrink-0 z-10">
                        <div className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-400">
                            <FiThermometer size={14} />
                        </div>
                        <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Climate</span>
                    </div>

                    {/* Main Dial */}
                    <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                        <div className="relative w-28 h-28 transform scale-90 md:scale-100 transition-transform">
                            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 drop-shadow-2xl">
                                {/* Track */}
                                <circle cx="50" cy="50" r="42" fill="none" stroke="#0a0d14" strokeWidth="6" strokeLinecap="round" />
                                {/* Indicator */}
                                <circle
                                    cx="50" cy="50" r="42" fill="none"
                                    stroke="url(#tempGradient)"
                                    strokeWidth="6"
                                    strokeDasharray={`${(temperature / 35) * 264} 264`}
                                    strokeLinecap="round"
                                    className="transition-all duration-700 ease-out"
                                />
                                <defs>
                                    <linearGradient id="tempGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#22d3ee" />
                                        <stop offset="50%" stopColor="#f59e0b" />
                                        <stop offset="100%" stopColor="#ef4444" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-bold text-white tracking-tighter drop-shadow-md">{temperature.toFixed(1)}°</span>
                                <span className="text-[9px] text-white/30 uppercase tracking-widest mt-1">Status</span>
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between mt-auto pt-3 z-10 border-t border-white/5">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-white/30 uppercase tracking-wider">Target</span>
                            <div className="flex items-center gap-1">
                                <span className="text-lg font-bold text-white">{targetTemp}°</span>
                                <div className="flex flex-col -gap-1">
                                    <FiChevronUp size={10} className="text-white/30 cursor-pointer hover:text-white" onClick={() => setTargetTemp(t => Math.min(30, t + 0.5))} />
                                    <FiChevronDown size={10} className="text-white/30 cursor-pointer hover:text-white" onClick={() => setTargetTemp(t => Math.max(16, t - 0.5))} />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setAcOn(!acOn)}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${acOn
                                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-900/40'
                                    : 'bg-[#0a0d14] text-white/20 hover:bg-white/5 hover:text-white/40'
                                    }`}
                            >
                                <FiWind size={16} />
                            </button>
                            <button
                                onClick={() => setHeatingOn(!heatingOn)}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${heatingOn
                                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-900/40'
                                    : 'bg-[#0a0d14] text-white/20 hover:bg-white/5 hover:text-white/40'
                                    }`}
                            >
                                <FiSun size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ========== SECURITY CARD (1×2) ========== */}
                <div className="col-span-1 row-span-2 bg-[#131720] rounded-2xl p-4 flex flex-col relative overflow-hidden border border-white/5 shadow-lg group">
                    <div className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${securityArmed ? 'bg-gradient-to-br from-green-500/5 to-transparent opacity-100' : 'bg-gradient-to-br from-red-500/5 to-transparent opacity-100'}`} />

                    <div className="flex items-center gap-2 mb-2 flex-shrink-0 z-10">
                        <div className={`p-1.5 rounded-md transition-colors ${securityArmed ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                            <FiShield size={14} />
                        </div>
                        <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Security</span>
                    </div>

                    {/* Status Big */}
                    <div className="flex flex-col items-center justify-center flex-1 my-2">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-3 transition-all duration-500 ${securityArmed
                            ? 'bg-[#0a0d14] text-green-400 border-2 border-green-500/20 shadow-[0_0_30px_rgba(74,222,128,0.1)]'
                            : 'bg-[#0a0d14] text-red-500 border-2 border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)]'
                            }`}>
                            <FiShield size={32} />
                        </div>
                        <span className={`text-sm font-bold uppercase tracking-widest ${securityArmed ? 'text-green-400' : 'text-red-400'}`}>
                            {securityArmed ? 'Armed' : 'Disarmed'}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="bg-[#0a0d14] rounded-lg p-2 flex flex-col items-center border border-white/5">
                            <FiLock size={12} className="text-white/40 mb-1" />
                            <span className="text-[9px] font-bold text-white/30 uppercase">Entry</span>
                        </div>
                        <div className="bg-[#0a0d14] rounded-lg p-2 flex flex-col items-center border border-white/5">
                            <FiEye size={12} className="text-white/40 mb-1" />
                            <span className="text-[9px] font-bold text-white/30 uppercase">PIR</span>
                        </div>
                    </div>

                    <button
                        onClick={() => setSecurityArmed(!securityArmed)}
                        className={`text-[10px] py-3 w-full rounded-xl font-bold uppercase tracking-wider transition-all active:scale-95 shadow-lg ${securityArmed
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 shadow-red-900/10'
                            : 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 shadow-green-900/10'
                            }`}
                    >
                        {securityArmed ? 'Disarm System' : 'Arm Away'}
                    </button>
                </div>

                {/* ========== APPLIANCES/DEVICES CARD (1×2) - Uses config devices ========== */}
                <div className="col-span-1 row-span-2 bg-[#131720] rounded-2xl p-4 flex flex-col border border-white/5 shadow-lg">
                    <div className="flex items-center gap-2 mb-4 flex-shrink-0">
                        <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-400">
                            <FiMonitor size={14} />
                        </div>
                        <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Devices</span>
                    </div>

                    <div className="flex-1 flex flex-col gap-2.5 min-h-0 overflow-y-auto">
                        {configuredAppliances.length > 0 ? (
                            configuredAppliances.map((device) => {
                                const isOn = getApplianceState(device.id);
                                const Icon = DEVICE_ICONS[device.type] || DEVICE_ICONS.default;
                                return (
                                    <button
                                        key={device.id}
                                        onClick={() => toggleAppliance(device.id)}
                                        className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 group ${isOn
                                            ? 'bg-purple-500/10 border-purple-500/30'
                                            : 'bg-[#0a0d14] border-transparent hover:bg-white/5 hover:border-white/5'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon size={14} className={isOn ? 'text-purple-400' : 'text-white/30'} />
                                            <span className={`text-[10px] font-bold ${isOn ? 'text-white' : 'text-white/50'}`}>{device.name}</span>
                                        </div>
                                        <div className={`w-2 h-2 rounded-full transition-all duration-300 ${isOn ? 'bg-purple-400 shadow-[0_0_8px_#a855f7]' : 'bg-[#191e2b]'}`} />
                                    </button>
                                );
                            })
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-white/30 text-xs">
                                No devices configured
                            </div>
                        )}
                    </div>
                </div>

                {/* ========== LIGHTS CARD (1×2) - Uses config lights ========== */}
                <div className="col-span-1 row-span-2 bg-[#131720] rounded-2xl p-4 flex flex-col border border-white/5 shadow-lg">
                    <div className="flex items-center gap-2 mb-4 flex-shrink-0">
                        <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-400">
                            <FiSun size={14} />
                        </div>
                        <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Lighting</span>
                    </div>

                    <div className="flex-1 flex flex-col gap-4 min-h-0 overflow-y-auto">
                        {configuredLights.length > 0 ? (
                            configuredLights.map((device) => {
                                const level = getLightLevel(device.id);
                                return (
                                    <div key={device.id} className="space-y-1.5">
                                        <div className="flex justify-between items-center text-[10px]">
                                            <span className="text-white/60 font-bold">{device.name}</span>
                                            <span className="text-amber-400 font-mono">{level}%</span>
                                        </div>
                                        <div className="h-1.5 bg-[#0a0d14] rounded-full overflow-hidden relative group">
                                            <div
                                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                                                style={{ width: `${level}%` }}
                                            />
                                            <input
                                                type="range" min="0" max="100" value={level}
                                                onChange={(e) => setLightLevel(device.id, parseInt(e.target.value))}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-white/30 text-xs">
                                No lights configured
                            </div>
                        )}

                        <div className="mt-auto pt-2 border-t border-white/5 flex gap-2">
                            <button className="flex-1 py-2 bg-[#0a0d14] rounded-lg text-[9px] font-bold text-white/30 hover:text-white hover:bg-white/5 transition-all">
                                ALL OFF
                            </button>
                            <button className="flex-1 py-2 bg-[#0a0d14] rounded-lg text-[9px] font-bold text-white/30 hover:text-white hover:bg-white/5 transition-all">
                                50%
                            </button>
                        </div>
                    </div>
                </div>

                {/* ========== SCENES CARD (1×2) ========== */}
                <div className="col-span-1 row-span-2 bg-[#131720] rounded-2xl p-4 flex flex-col border border-white/5 shadow-lg">
                    <div className="flex items-center gap-2 mb-4 flex-shrink-0">
                        <div className="p-1.5 rounded-md bg-orange-500/10 text-orange-400">
                            <FiSunrise size={14} />
                        </div>
                        <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Scenes</span>
                    </div>

                    <div className="flex-1 grid grid-cols-2 gap-3 min-h-0">
                        {scenes.map((scene) => {
                            const Icon = scene.icon;
                            const isActive = activeScene === scene.id;

                            return (
                                <button
                                    key={scene.id}
                                    onClick={() => setActiveScene(isActive ? null : scene.id)}
                                    className={`flex flex-col items-center justify-center gap-2 rounded-2xl border transition-all duration-300 group relative overflow-hidden ${isActive
                                        ? `bg-white/5 border-white/20 shadow-lg scale-95`
                                        : 'bg-[#0a0d14] border-transparent hover:bg-white/5 hover:border-white/5'
                                        }`}
                                >
                                    <div className={`absolute inset-0 opacity-20 bg-gradient-to-br transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'} ${scene.color.replace('text', 'from').replace('400', '500/20').replace('500', '600/20')} to-transparent`} />

                                    <Icon size={20} className={`relative z-10 transition-colors duration-300 ${isActive ? scene.color : 'text-white/30 group-hover:text-white/60'}`} />
                                    <span className={`relative z-10 text-[9px] font-bold uppercase tracking-wider ${isActive ? 'text-white' : 'text-white/40'}`}>
                                        {scene.name}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
}
