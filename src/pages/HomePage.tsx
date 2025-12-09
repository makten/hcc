import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    FiSun,
    FiVideo,
    FiMaximize2
} from 'react-icons/fi';
import { useApp } from '@/context';
import { useEntityStates } from '@/hooks';
import { RussoundMiniPlayer } from '@/features/russound-player';
import { ModernSecurityCard } from '@/components/devices/ModernSecurityCard';
import { FloorPlanMap } from '@/components/floorplan';

// Weather mock data
const WEATHER = {
    temp: 21,
    condition: 'Partly Cloudy',
    high: 24,
    low: 18,
    humidity: 45,
    wind: 12
};

const MAIN_CCTV_URL = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=640&h=360&fit=crop";

export default function HomePage() {
    const { config } = useApp();

    // Get all entity IDs for state fetching
    const allDeviceIds = useMemo(() => {
        if (!config?.rooms) return [];
        return config.rooms.flatMap(r => r.devices.map(d => d.entityId));
    }, [config]);

    const entityStates = useEntityStates(allDeviceIds);
    const [activeScene, setActiveScene] = useState<string | null>(null);

    const now = new Date();
    const greeting = now.getHours() < 12 ? 'Good Morning' : now.getHours() < 18 ? 'Good Afternoon' : 'Good Evening';
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateString = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

    // Aggregate all devices for security card
    const allDevices = useMemo(() => {
        if (!config?.rooms) return [];
        return config.rooms.flatMap(room => room.devices);
    }, [config]);

    return (
        <div className="relative h-full w-full bg-black overflow-hidden font-sans text-slate-200">
            {/* Layer 0: Background FloorPlan Map (Interactive) */}
            {/* Added padding to prevent map from being hidden behind UI overlays and reduce overstretching */}
            <div className="absolute inset-0 z-0 p-4 md:p-12 lg:p-24 flex items-center justify-center">
                <div className="w-full h-full shadow-2xl rounded-3xl overflow-hidden border border-white/5 relative">
                    <FloorPlanMap />
                </div>
            </div>

            {/* Layer 1: UI Overlays */}
            <div className="absolute inset-0 z-10 pointer-events-none p-6 flex flex-col justify-between">

                {/* Top Row */}
                <div className="flex justify-between items-start gap-6">
                    {/* Left: Info & Sidebar (Floating Glass) */}
                    <div className="pointer-events-auto bg-[#0d1117]/80 backdrop-blur-xl rounded-3xl p-6 border border-white/5 w-[320px] shadow-2xl flex flex-col gap-6">
                        {/* Header */}
                        <div className="space-y-1">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent leading-tight">
                                {greeting},<br />Admin
                            </h1>
                            <div className="flex items-center gap-2 text-white/40 text-xs font-medium">
                                <span>{dateString}</span>
                            </div>
                            <div className="text-4xl font-light text-white mt-2 font-mono">
                                {timeString}
                            </div>
                        </div>

                        {/* Weather Compact */}
                        <div className="flex items-center gap-4 py-4 border-t border-b border-white/5">
                            <div className="text-3xl font-light text-white">{WEATHER.temp}°</div>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-white/80 flex items-center gap-1">
                                    <FiSun className="text-yellow-400" size={14} />
                                    {WEATHER.condition}
                                </span>
                                <span className="text-xs text-white/40">H:{WEATHER.high}° L:{WEATHER.low}°</span>
                            </div>
                        </div>

                        {/* Whole Home Security Status (Compact) */}
                        <div>
                            <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Security</h3>
                            <ModernSecurityCard
                                devices={allDevices}
                                entityStates={entityStates}
                                className="!bg-black/40 !border-white/5 !shadow-none"
                            />
                        </div>

                        {/* Global Scenes (Compact) */}
                        <div>
                            <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Scenes</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { id: 'morning', name: 'Start Day', icon: '☀️' },
                                    { id: 'night', name: 'Good Night', icon: '🌙' },
                                    { id: 'leaving', name: 'Leaving', icon: '👋' },
                                    { id: 'movie', name: 'Cinema', icon: '🎬' },
                                ].map((scene) => (
                                    <button
                                        key={scene.id}
                                        onClick={() => setActiveScene(activeScene === scene.id ? null : scene.id)}
                                        className={`p-2 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${activeScene === scene.id
                                                ? 'bg-white/10 border-white/20 text-white'
                                                : 'bg-white/5 border-transparent text-white/40 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        <span className="text-base">{scene.icon}</span>
                                        <span className="text-[10px] font-medium">{scene.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Audio Player (Floating) */}
                    <div className="pointer-events-auto">
                        <RussoundMiniPlayer roomName="Whole Home" className="shadow-2xl border border-white/10 !bg-[#0d1117]/90 backdrop-blur-xl" />
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="flex justify-between items-end">
                    <div /> {/* Spacer */}

                    {/* Right: CCTV Card (Main Entrance) */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="pointer-events-auto w-[360px] rounded-3xl overflow-hidden shadow-2xl border border-white/10 group bg-[#0d1117] relative"
                    >
                        {/* Header */}
                        <div className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                                <span className="text-xs font-bold text-white/90 shadow-sm">LIVE</span>
                            </div>
                            <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 backdrop-blur-sm transition-all">
                                <FiMaximize2 size={14} />
                            </button>
                        </div>

                        <div className="aspect-video relative overflow-hidden">
                            <img
                                src={MAIN_CCTV_URL}
                                alt="Main Entrance"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {/* Overlay Gradient */}
                            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/90 to-transparent" />
                        </div>

                        {/* Footer Info */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 pt-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 backdrop-blur-sm">
                                    <FiVideo size={16} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white">Main Entrance</h3>
                                    <p className="text-[10px] text-white/40">Camera 01 • Online</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

            </div>
        </div>
    );
}
