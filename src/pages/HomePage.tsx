import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    FiThermometer,
    FiSun,
    FiZap,
    FiDroplet,
    FiShield,
    FiWifi,
    FiBattery,
    FiCpu
} from 'react-icons/fi';
import { InteractiveFloorplan } from '@/components/floorplan';

// Weather mock data
const WEATHER = {
    temp: 21,
    condition: 'Partly Cloudy',
    high: 24,
    low: 18,
    humidity: 45,
    wind: 12
};

// Quick stats mock data
const HOME_STATS = [
    { label: 'Energy', value: '2.4 kW', icon: FiZap, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { label: 'Water', value: '142 L', icon: FiDroplet, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
    { label: 'Security', value: 'Armed', icon: FiShield, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: 'Network', value: 'Good', icon: FiWifi, color: 'text-purple-400', bg: 'bg-purple-400/10' },
];

export default function HomePage() {
    const now = new Date();
    const greeting = now.getHours() < 12 ? 'Good Morning' : now.getHours() < 18 ? 'Good Afternoon' : 'Good Evening';
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateString = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

    const [activeScene, setActiveScene] = useState<string | null>(null);

    return (
        <div className="h-full w-full bg-[#0d1117] flex overflow-hidden">
            {/* Left Panel - Info & Controls (350px fixed or 25%) */}
            <div className="w-[350px] flex-shrink-0 flex flex-col gap-6 p-6 border-r border-white/5 bg-[#0d1117] overflow-y-auto custom-scrollbar">

                {/* Header / Greeting */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-1"
                >
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                        {greeting},<br />Admin
                    </h1>
                    <div className="flex items-center gap-2 text-white/40 text-sm font-medium">
                        <span>{dateString}</span>
                        <span>•</span>
                        <span>{timeString}</span>
                    </div>
                </motion.div>

                {/* Weather Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600/20 to-cyan-500/20 p-5 border border-white/5"
                >
                    <div className="flex justify-between items-start z-10 relative">
                        <div>
                            <span className="text-4xl font-light text-white">{WEATHER.temp}°</span>
                            <div className="flex items-center gap-2 mt-1">
                                <FiSun className="text-yellow-400" />
                                <span className="text-sm text-blue-100">{WEATHER.condition}</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end text-xs text-blue-200/60 font-medium">
                            <span>H: {WEATHER.high}°</span>
                            <span>L: {WEATHER.low}°</span>
                        </div>
                    </div>

                    {/* Decorative blurred circles */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-400/20 rounded-full blur-2xl -mr-6 -mt-6" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl -ml-6 -mb-6" />

                    <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-white/10">
                        <div className="flex items-center gap-2">
                            <FiDroplet size={12} className="text-cyan-300" />
                            <span className="text-xs text-blue-100">{WEATHER.humidity}% Hum</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FiThermometer size={12} className="text-orange-300" />
                            <span className="text-xs text-blue-100">Indoor 21°</span>
                        </div>
                    </div>
                </motion.div>

                {/* System Status Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-2 gap-3"
                >
                    {HOME_STATS.map((stat, i) => (
                        <div key={i} className={`p-3 rounded-xl border border-white/5 flex flex-col gap-2 ${stat.bg}`}>
                            <div className="flex items-center justify-between">
                                <stat.icon className={stat.color} size={16} />
                                <span className={`text-[10px] uppercase font-bold tracking-wider opacity-60 ${stat.color.replace('text-', 'bg-').replace('400', '500')}/10 px-1 rounded`}>
                                    Status
                                </span>
                            </div>
                            <div>
                                <div className="text-lg font-semibold text-white">{stat.value}</div>
                                <div className="text-[10px] text-white/40 font-medium">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Quick Scenes */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Global Scenes</h3>
                    <div className="space-y-2">
                        {[
                            { id: 'morning', name: 'Good Morning', icon: '☀️', color: 'from-amber-400/20 to-orange-500/20', border: 'border-orange-500/20' },
                            { id: 'leaving', name: 'Leaving Home', icon: '👋', color: 'from-blue-400/20 to-indigo-500/20', border: 'border-indigo-500/20' },
                            { id: 'movie', name: 'Movie Time', icon: '🎬', color: 'from-purple-400/20 to-pink-500/20', border: 'border-purple-500/20' },
                            { id: 'night', name: 'Good Night', icon: '🌙', color: 'from-slate-700/40 to-slate-800/40', border: 'border-slate-600/20' },
                        ].map((scene) => (
                            <motion.button
                                key={scene.id}
                                onClick={() => setActiveScene(activeScene === scene.id ? null : scene.id)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`w-full p-3 rounded-xl border ${scene.border} bg-gradient-to-r ${scene.color} flex items-center justify-between group transition-all`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-xl group-hover:scale-110 transition-transform">{scene.icon}</span>
                                    <span className="font-medium text-white/80 text-sm group-hover:text-white">{scene.name}</span>
                                </div>
                                {activeScene === scene.id && (
                                    <motion.div layoutId="activeSceneIndicator" className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />
                                )}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* Footer Info */}
                <div className="mt-auto pt-4 flex items-center gap-4 text-[10px] text-white/20">
                    <div className="flex items-center gap-1.5">
                        <FiBattery size={10} />
                        <span>UPS 100%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <FiCpu size={10} />
                        <span>Core 12%</span>
                    </div>
                    <div className="flex-1 text-right">v2.4.0</div>
                </div>
            </div>

            {/* Right Panel - Hero Floorplan (Flexible width) */}
            <div className="flex-1 h-full relative flex items-center justify-center bg-[#0d1117] overflow-hidden">

                {/* Radial gradient background behind floorplan */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-[#0d1117]/50 to-[#0d1117] pointer-events-none" />

                <div className="w-full max-w-5xl p-8 scale-90 md:scale-100 xl:scale-110 transition-transform duration-500">
                    <InteractiveFloorplan />
                </div>

                {/* Absolute overlay indicators if needed */}
                <div className="absolute top-6 right-6 flex gap-2">
                    <div className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur border border-white/5 text-xs text-white/60 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        System Online
                    </div>
                </div>
            </div>
        </div>
    );
}
