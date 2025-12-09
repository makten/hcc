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
    FiZap,
    FiActivity,
    FiBell,
    FiLogOut,
    FiUsers,
} from 'react-icons/fi';
import { AudioMatrix } from '@/features/audio-matrix';
import { RussoundPlayerModal } from '@/features/russound-player';
import { useApp, useAuth, useNotifications } from '@/context';
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

// Feature navigation (new pages)
const FEATURE_NAV_ITEMS = [
    { id: 'energy', path: '/energy', icon: FiActivity, label: 'Energy' },
    { id: 'scenes', path: '/scenes', icon: FiZap, label: 'Scenes' },
    { id: 'notifications', path: '/notifications', icon: FiBell, label: 'Notifications', hasBadge: true },
];

const FIXED_BOTTOM_NAV = [
    { id: 'cameras', path: '/cameras', icon: FiVideo, label: 'Cameras' },
    { id: 'music', path: '#', icon: FiMusic, label: 'Music', isMusic: true },
    { id: 'users', path: '/users', icon: FiUsers, label: 'Users', adminOnly: true },
    { id: 'settings', path: '/settings', icon: FiSettings, label: 'Settings' },
];

interface MainLayoutProps {
    onLogout?: () => void;
}

export default function MainLayout({ onLogout }: MainLayoutProps) {
    const { editMode, openMusicPlayer, config } = useApp();
    const { session, logout } = useAuth();
    const { state: notificationState } = useNotifications();
    const location = useLocation();

    // Generate room navigation from config (limit to first 8 to prevent overflow)
    const roomNavItems = config.rooms.slice(0, 8).map((room) => ({
        id: room.id,
        path: `/room/${room.id}`,
        icon: ICON_MAP[room.icon] || FiSquare,
        label: room.name,
        color: room.color,
    }));

    const handleLogout = () => {
        logout();
        onLogout?.();
    };

    return (
        <div className="h-screen w-screen bg-[#0d1117] flex overflow-hidden">
            {/* Slim Icon Sidebar - fixed width */}
            <aside className="hidden md:flex flex-col w-14 bg-[#080a0f] flex-shrink-0 z-10 border-r border-white/5">
                {/* User avatar/logo area */}
                <div className="h-14 flex items-center justify-center border-b border-white/5">
                    {session.user ? (
                        <div
                            className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold cursor-pointer hover:scale-105 transition-transform"
                            title={session.user.name}
                        >
                            {session.user.avatar || session.user.name.charAt(0).toUpperCase()}
                        </div>
                    ) : (
                        <span className="text-cyan-400 text-lg font-bold">●</span>
                    )}
                </div>

                {/* Main navigation */}
                <nav className="flex-1 flex flex-col items-center py-3 gap-1 overflow-y-auto custom-scrollbar">
                    {/* Fixed top items */}
                    {FIXED_NAV_ITEMS.map((item) => (
                        <NavItem key={item.id} item={item} location={location} />
                    ))}

                    {/* Feature navigation */}
                    <div className="w-8 h-px bg-white/10 my-2" />
                    {FEATURE_NAV_ITEMS.map((item) => (
                        <NavItem
                            key={item.id}
                            item={item}
                            location={location}
                            badge={item.hasBadge && notificationState.unreadCount > 0 ? notificationState.unreadCount : undefined}
                        />
                    ))}

                    {/* Room navigation */}
                    <div className="w-8 h-px bg-white/10 my-2" />
                    {roomNavItems.map((item) => (
                        <NavItem key={item.id} item={item} location={location} />
                    ))}

                    {/* More rooms indicator */}
                    {config.rooms.length > 8 && (
                        <NavLink to="/rooms" title="All Rooms">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 transition-all">
                                <FiGrid size={18} />
                            </div>
                        </NavLink>
                    )}
                </nav>

                {/* Bottom navigation */}
                <div className="flex flex-col items-center py-3 gap-1 border-t border-white/5">
                    {FIXED_BOTTOM_NAV.filter(item => {
                        // Hide admin-only items for non-admin users
                        if ('adminOnly' in item && item.adminOnly && session.user?.role !== 'admin') {
                            return false;
                        }
                        return true;
                    }).map((item) => {
                        if ('isMusic' in item && item.isMusic) {
                            return (
                                <motion.button
                                    key={item.id}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={openMusicPlayer}
                                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white/30 hover:text-cyan-400 hover:bg-white/5 transition-all"
                                    title={item.label}
                                >
                                    <item.icon size={18} />
                                </motion.button>
                            );
                        }
                        return <NavItem key={item.id} item={item} location={location} />;
                    })}

                    {/* Logout button */}
                    {session.isAuthenticated && (
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleLogout}
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all mt-2"
                            title="Logout"
                        >
                            <FiLogOut size={18} />
                        </motion.button>
                    )}
                </div>
            </aside>

            {/* Edit mode indicator */}
            {editMode && (
                <motion.div
                    initial={{ y: -50 }}
                    animate={{ y: 0 }}
                    className="fixed top-0 left-14 right-0 z-50 bg-orange-500/20 border-b border-orange-500/30 py-1 px-4"
                >
                    <div className="flex items-center justify-center gap-2 text-xs text-orange-300">
                        <span className="animate-pulse">●</span>
                        <span>Edit Mode</span>
                    </div>
                </motion.div>
            )}

            {/* Main content area */}
            <main className={`flex-1 min-h-0 overflow-auto p-6 ${editMode ? 'pt-12' : ''}`}>
                <Outlet />
            </main>

            {/* Mobile bottom navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080a0f] border-t border-white/5">
                <nav className="flex items-center justify-around py-2">
                    {[
                        { id: 'home', path: '/', icon: FiHome, label: 'Home' },
                        { id: 'energy', path: '/energy', icon: FiActivity, label: 'Energy' },
                        { id: 'scenes', path: '/scenes', icon: FiZap, label: 'Scenes' },
                        { id: 'cameras', path: '/cameras', icon: FiVideo, label: 'Cameras' },
                        { id: 'settings', path: '/settings', icon: FiSettings, label: 'Settings' },
                    ].map((item) => {
                        const Icon = item.icon;
                        const isActive = item.path === '/'
                            ? location.pathname === '/'
                            : location.pathname.startsWith(item.path);

                        return (
                            <NavLink
                                key={item.id}
                                to={item.path}
                                className={`flex flex-col items-center gap-0.5 relative ${isActive ? 'text-cyan-400' : 'text-white/30'}`}
                            >
                                <Icon size={20} />
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

// Helper component for navigation items
function NavItem({
    item,
    location,
    badge
}: {
    item: { id: string; path: string; icon: IconType; label: string; color?: string };
    location: { pathname: string };
    badge?: number;
}) {
    const Icon = item.icon;
    const isActive = item.path === '/'
        ? location.pathname === '/'
        : location.pathname.startsWith(item.path);

    return (
        <NavLink to={item.path} className="relative" title={item.label}>
            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${isActive
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'text-white/30 hover:text-white hover:bg-white/5'
                    }`}
                style={isActive && item.color ? { color: item.color } : undefined}
            >
                <Icon size={18} />
            </motion.div>
            {badge !== undefined && badge > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 rounded-full text-[10px] text-white flex items-center justify-center font-medium">
                    {badge > 9 ? '9+' : badge}
                </span>
            )}
        </NavLink>
    );
}
