import { motion } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import { FiHome, FiGrid, FiSettings, FiEdit3 } from 'react-icons/fi';
import { useApp } from '@/context';

const NAV_ITEMS = [
    { path: '/', icon: <FiHome size={22} />, label: 'Home' },
    { path: '/rooms', icon: <FiGrid size={22} />, label: 'Rooms' },
    { path: '/settings', icon: <FiSettings size={22} />, label: 'Settings' },
];

export default function Navigation() {
    const location = useLocation();
    const { editMode, toggleEditMode } = useApp();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 md:relative md:bottom-auto md:left-auto md:right-auto">
            {/* Mobile bottom navigation */}
            <div className="md:hidden">
                <div className="glass border-t border-glass-border px-6 py-3 flex items-center justify-around">
                    {NAV_ITEMS.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className="relative flex flex-col items-center gap-1 py-2 px-4"
                            >
                                <motion.div
                                    whileTap={{ scale: 0.9 }}
                                    className={`transition-colors duration-200 ${isActive ? 'text-accent-primary' : 'text-white/40'
                                        }`}
                                >
                                    {item.icon}
                                </motion.div>
                                <span
                                    className={`text-xs transition-colors duration-200 ${isActive ? 'text-accent-primary' : 'text-white/40'
                                        }`}
                                >
                                    {item.label}
                                </span>
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-indicator"
                                        className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent-primary"
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    />
                                )}
                            </NavLink>
                        );
                    })}

                    {/* Edit mode toggle */}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleEditMode}
                        className={`flex flex-col items-center gap-1 py-2 px-4 transition-colors duration-200 ${editMode ? 'text-accent-secondary' : 'text-white/40'
                            }`}
                    >
                        <FiEdit3 size={22} />
                        <span className="text-xs">Edit</span>
                    </motion.button>
                </div>
            </div>

            {/* Desktop side navigation */}
            <div className="hidden md:block">
                <div className="flex flex-col gap-2">
                    {NAV_ITEMS.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                    ? 'bg-accent-primary/10 text-accent-primary'
                                    : 'text-white/50 hover:bg-white/5 hover:text-white/80'
                                    }`}
                            >
                                {item.icon}
                                <span className="font-medium">{item.label}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="desktop-nav-indicator"
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full bg-accent-primary"
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    />
                                )}
                            </NavLink>
                        );
                    })}

                    {/* Edit mode toggle */}
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleEditMode}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${editMode
                            ? 'bg-accent-secondary/10 text-accent-secondary'
                            : 'text-white/50 hover:bg-white/5 hover:text-white/80'
                            }`}
                    >
                        <FiEdit3 size={22} />
                        <span className="font-medium">Edit Mode</span>
                    </motion.button>
                </div>
            </div>
        </nav>
    );
}
