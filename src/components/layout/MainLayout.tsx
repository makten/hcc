import { motion } from 'framer-motion';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
    FiHome,
    FiMonitor,
    FiCoffee,
    FiSun,
    FiMoon,
    FiTool,
    FiVideo,
    FiMusic,
    FiGrid,
    FiSettings,
    FiSquare,
} from 'react-icons/fi';
import { AudioMatrix } from '@/features/audio-matrix';
import { RussoundPlayerModal } from '@/features/russound-player';
import { useApp } from '@/context';
import { IconType } from 'react-icons';

// Icon mapping for dynamic room icons
const ICON_MAP: Record<string, IconType> = {
    FiHome,
    FiMonitor,
    FiCoffee,
    FiSun,
    FiMoon,
    FiTool,
    FiVideo,
    FiMusic,
    FiGrid,
    FiSettings,
    FiSquare,
};

// Fixed navigation items (always present)
const FIXED_NAV_ITEMS = [
    { id: 'home', path: '/', icon: FiHome, label: 'Home' },
];

const FIXED_BOTTOM_NAV = [
    { id: 'cameras', path: '/cameras', icon: FiVideo, label: 'Cameras' },
    { id: 'music', path: '#', icon: FiMusic, label: 'Music', isMusic: true },
    { id: 'settings', path: '/settings', icon: FiSettings, label: 'Settings' },
];

export default function MainLayout() {
    const { editMode, openMusicPlayer, config } = useApp();
    const location = useLocation();

    // Generate room navigation from config
    const roomNavItems = config.rooms.map((room) => ({
        id: room.id,
        path: `/room/${room.id}`,
        icon: ICON_MAP[room.icon] || FiSquare,
        label: room.name,
        color: room.color,
    }));

    // Combine all nav items
    const allNavItems = [...FIXED_NAV_ITEMS, ...roomNavItems, ...FIXED_BOTTOM_NAV];

    return (
        <div className="h-screen w-screen bg-[#0d1117] flex overflow-hidden">
            {/* Slim Icon Sidebar - fixed width */}
            <aside className="hidden md:flex flex-col w-12 bg-[#080a0f] flex-shrink-0 z-10">
                {/* Logo area */}
                <div className="h-10 flex items-center justify-center border-b border-white/5">
                    <span className="text-cyan-400 text-xs font-bold">●</span>
                </div>

                {/* Room navigation icons */}
                <nav className="flex-1 flex flex-col items-center py-2 gap-1 overflow-y-auto custom-scrollbar">
                    {allNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.path === '/'
                            ? location.pathname === '/'
                            : location.pathname.startsWith(item.path);

                        if ('isMusic' in item && item.isMusic) {
                            return (
                                <motion.button
                                    key={item.id}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={openMusicPlayer}
                                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white/30 hover:text-cyan-400 hover:bg-white/5 transition-all group relative"
                                    title={item.label}
                                >
                                    <Icon size={18} />
                                </motion.button>
                            );
                        }

                        return (
                            <NavLink
                                key={item.id}
                                to={item.path}
                                className="relative"
                                title={item.label}
                            >
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${isActive
                                        ? 'bg-cyan-500/20 text-cyan-400'
                                        : 'text-white/30 hover:text-white hover:bg-white/5'
                                        }`}
                                    style={isActive && 'color' in item && item.color ? { color: item.color as string } : undefined}
                                >
                                    <Icon size={18} />
                                </motion.div>
                            </NavLink>
                        );
                    })}
                </nav>
            </aside>

            {/* Edit mode indicator */}
            {editMode && (
                <motion.div
                    initial={{ y: -50 }}
                    animate={{ y: 0 }}
                    className="fixed top-0 left-12 right-0 z-50 bg-orange-500/20 border-b border-orange-500/30 py-1 px-4"
                >
                    <div className="flex items-center justify-center gap-2 text-xs text-orange-300">
                        <span className="animate-pulse">●</span>
                        <span>Edit Mode</span>
                    </div>
                </motion.div>
            )}

            {/* Main content area - fills remaining space with no padding */}
            <main className={`flex-1 min-h-0 overflow-hidden ${editMode ? 'pt-8' : ''}`}>
                <Outlet />
            </main>

            {/* Mobile bottom navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080a0f] border-t border-white/5">
                <nav className="flex items-center justify-around py-2">
                    {allNavItems.slice(0, 5).map((item) => {
                        const Icon = item.icon;
                        const isActive = item.path === '/'
                            ? location.pathname === '/'
                            : location.pathname.startsWith(item.path);

                        return (
                            <NavLink
                                key={item.id}
                                to={item.path}
                                className={`flex flex-col items-center gap-0.5 ${isActive ? 'text-cyan-400' : 'text-white/30'}`}
                            >
                                <Icon size={18} />
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            {/* Audio Matrix drawer */}
            <AudioMatrix />

            {/* Russound Music Player Modal */}
            <RussoundPlayerModal />
        </div>
    );
}
