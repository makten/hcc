import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiBell,
    FiCheck,
    FiX,
    FiAlertTriangle,
    FiInfo,
    FiCheckCircle,
    FiClock,
    FiFilter,
    FiTrash2,
    FiChevronRight,
    FiShield,
    FiZap,
    FiSettings,
    FiActivity
} from 'react-icons/fi';
import { useNotifications } from '@/context';
import { NotificationCategory, NotificationSeverity } from '@/types';

const SEVERITY_STYLES: Record<NotificationSeverity, { bg: string; text: string; icon: React.ReactNode }> = {
    info: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', icon: <FiInfo /> },
    success: { bg: 'bg-green-500/10', text: 'text-green-400', icon: <FiCheckCircle /> },
    warning: { bg: 'bg-amber-500/10', text: 'text-amber-400', icon: <FiAlertTriangle /> },
    error: { bg: 'bg-red-500/10', text: 'text-red-400', icon: <FiAlertTriangle /> },
};

const CATEGORY_ICONS: Record<NotificationCategory, React.ReactNode> = {
    security: <FiShield />,
    device: <FiZap />,
    energy: <FiActivity />,
    system: <FiSettings />,
    automation: <FiClock />,
    intercom: <FiBell />,
};

export function NotificationsPage() {
    const {
        state,
        markAsRead,
        markAllAsRead,
        dismissNotification,
        clearAllNotifications,
        acknowledgeAlert,
        resolveAlert
    } = useNotifications();

    const [activeTab, setActiveTab] = useState<'notifications' | 'alerts' | 'activity'>('notifications');
    const [categoryFilter, setCategoryFilter] = useState<NotificationCategory | 'all'>('all');

    const filteredNotifications = categoryFilter === 'all'
        ? state.notifications
        : state.notifications.filter(n => n.category === categoryFilter);

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <FiBell className="text-cyan-400" />
                        Notifications
                        {state.unreadCount > 0 && (
                            <span className="px-2 py-0.5 bg-cyan-500 text-white text-sm rounded-full">
                                {state.unreadCount}
                            </span>
                        )}
                    </h1>
                    <p className="text-white/50">Stay updated on your smart home activity</p>
                </div>
                <div className="flex gap-2">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={markAllAsRead}
                        className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                    >
                        <FiCheck size={16} />
                        Mark all read
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={clearAllNotifications}
                        className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                    >
                        <FiTrash2 size={16} />
                        Clear all
                    </motion.button>
                </div>
            </div>

            {/* Active Alerts Banner */}
            {state.activeAlertCount > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-gradient-to-r from-red-500/20 to-amber-500/20 border border-red-500/30"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                                <FiAlertTriangle className="text-red-400 text-xl" />
                            </div>
                            <div>
                                <p className="text-white font-medium">
                                    {state.activeAlertCount} Active Alert{state.activeAlertCount > 1 ? 's' : ''}
                                </p>
                                <p className="text-white/50 text-sm">Requires your attention</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setActiveTab('alerts')}
                            className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors flex items-center gap-2"
                        >
                            View Alerts
                            <FiChevronRight size={16} />
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit">
                {(['notifications', 'alerts', 'activity'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 rounded-lg font-medium transition-all capitalize flex items-center gap-2 ${activeTab === tab
                                ? 'bg-white/10 text-white'
                                : 'text-white/50 hover:text-white'
                            }`}
                    >
                        {tab}
                        {tab === 'notifications' && state.unreadCount > 0 && (
                            <span className="px-1.5 py-0.5 bg-cyan-500 text-white text-xs rounded-full">
                                {state.unreadCount}
                            </span>
                        )}
                        {tab === 'alerts' && state.activeAlertCount > 0 && (
                            <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                                {state.activeAlertCount}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'notifications' && (
                    <motion.div
                        key="notifications"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                    >
                        {/* Category Filter */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2">
                            <span className="text-white/40 text-sm flex items-center gap-1">
                                <FiFilter size={14} />
                                Filter:
                            </span>
                            {(['all', 'security', 'device', 'energy', 'system', 'automation'] as const).map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setCategoryFilter(cat)}
                                    className={`px-3 py-1.5 rounded-lg text-sm transition-all capitalize whitespace-nowrap ${categoryFilter === cat
                                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                            : 'bg-white/5 text-white/50 border border-transparent hover:bg-white/10'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Notifications List */}
                        {filteredNotifications.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                                    <FiBell className="text-white/20 text-2xl" />
                                </div>
                                <p className="text-white/40">No notifications</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredNotifications.map((notification, index) => {
                                    const styles = SEVERITY_STYLES[notification.severity];

                                    return (
                                        <motion.div
                                            key={notification.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.02 }}
                                            className={`p-4 rounded-xl border transition-all ${notification.read
                                                    ? 'bg-white/[0.02] border-white/5'
                                                    : 'bg-white/5 border-white/10'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`w-10 h-10 rounded-xl ${styles.bg} flex items-center justify-center ${styles.text}`}>
                                                    {CATEGORY_ICONS[notification.category] || styles.icon}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className={`font-medium ${notification.read ? 'text-white/60' : 'text-white'}`}>
                                                            {notification.title}
                                                        </p>
                                                        {!notification.read && (
                                                            <div className="w-2 h-2 rounded-full bg-cyan-500" />
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-white/50 mb-2">{notification.message}</p>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs text-white/30 flex items-center gap-1">
                                                            <FiClock size={12} />
                                                            {formatTime(notification.timestamp)}
                                                        </span>
                                                        <span className={`text-xs px-2 py-0.5 rounded ${styles.bg} ${styles.text} capitalize`}>
                                                            {notification.category}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {!notification.read && (
                                                        <button
                                                            onClick={() => markAsRead(notification.id)}
                                                            className="p-2 rounded-lg text-white/30 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                                                            title="Mark as read"
                                                        >
                                                            <FiCheck size={16} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => dismissNotification(notification.id)}
                                                        className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                        title="Dismiss"
                                                    >
                                                        <FiX size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'alerts' && (
                    <motion.div
                        key="alerts"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                    >
                        {state.alerts.filter(a => a.isActive).length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-16 h-16 mx-auto rounded-2xl bg-green-500/10 flex items-center justify-center mb-4">
                                    <FiCheckCircle className="text-green-400 text-2xl" />
                                </div>
                                <p className="text-white/40">No active alerts</p>
                                <p className="text-white/30 text-sm">All systems operational</p>
                            </div>
                        ) : (
                            state.alerts.filter(a => a.isActive).map((alert, index) => (
                                <motion.div
                                    key={alert.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`p-6 rounded-2xl border ${alert.severity === 'critical'
                                            ? 'bg-red-500/10 border-red-500/30'
                                            : alert.severity === 'high'
                                                ? 'bg-amber-500/10 border-amber-500/30'
                                                : 'bg-white/5 border-white/10'
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${alert.severity === 'critical' || alert.severity === 'high'
                                                ? 'bg-red-500/20'
                                                : 'bg-amber-500/20'
                                            }`}>
                                            <FiAlertTriangle className={
                                                alert.severity === 'critical' || alert.severity === 'high'
                                                    ? 'text-red-400 text-xl'
                                                    : 'text-amber-400 text-xl'
                                            } />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-lg font-semibold text-white">{alert.title}</h3>
                                                <span className={`px-2 py-0.5 rounded text-xs uppercase font-medium ${alert.severity === 'critical'
                                                        ? 'bg-red-500/20 text-red-400'
                                                        : alert.severity === 'high'
                                                            ? 'bg-amber-500/20 text-amber-400'
                                                            : 'bg-white/10 text-white/60'
                                                    }`}>
                                                    {alert.severity}
                                                </span>
                                            </div>
                                            <p className="text-white/60 mb-4">{alert.description}</p>
                                            <div className="flex items-center gap-4 text-xs text-white/40">
                                                <span className="flex items-center gap-1">
                                                    <FiClock size={12} />
                                                    Created {formatTime(alert.createdAt)}
                                                </span>
                                                {alert.acknowledgedAt && (
                                                    <span className="flex items-center gap-1">
                                                        <FiCheck size={12} />
                                                        Acknowledged {formatTime(alert.acknowledgedAt)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {!alert.acknowledgedAt && (
                                                <button
                                                    onClick={() => acknowledgeAlert(alert.id)}
                                                    className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
                                                >
                                                    Acknowledge
                                                </button>
                                            )}
                                            <button
                                                onClick={() => resolveAlert(alert.id)}
                                                className="px-4 py-2 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                                            >
                                                Resolve
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </motion.div>
                )}

                {activeTab === 'activity' && (
                    <motion.div
                        key="activity"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-2"
                    >
                        {state.eventLog.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                                    <FiActivity className="text-white/20 text-2xl" />
                                </div>
                                <p className="text-white/40">No activity recorded yet</p>
                            </div>
                        ) : (
                            <div className="relative">
                                {/* Timeline line */}
                                <div className="absolute left-5 top-0 bottom-0 w-px bg-white/10" />

                                {state.eventLog.map((event, index) => (
                                    <motion.div
                                        key={event.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.02 }}
                                        className="relative flex items-start gap-4 py-3"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center z-10">
                                            {event.type === 'device_state_change' && <FiZap className="text-cyan-400" size={16} />}
                                            {event.type === 'user_action' && <FiCheck className="text-green-400" size={16} />}
                                            {event.type === 'automation_trigger' && <FiClock className="text-purple-400" size={16} />}
                                            {event.type === 'system_event' && <FiSettings className="text-white/40" size={16} />}
                                            {event.type === 'security_event' && <FiShield className="text-red-400" size={16} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-sm">
                                                {event.entityName || event.entityId}
                                                {event.previousState && event.newState && (
                                                    <span className="text-white/50">
                                                        {' '}changed from{' '}
                                                        <span className="text-amber-400">{event.previousState}</span>
                                                        {' '}to{' '}
                                                        <span className="text-green-400">{event.newState}</span>
                                                    </span>
                                                )}
                                                {event.details && (
                                                    <span className="text-white/50"> — {event.details}</span>
                                                )}
                                            </p>
                                            <p className="text-xs text-white/30 mt-1">
                                                {formatTime(event.timestamp)}
                                                {event.userName && ` • by ${event.userName}`}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default NotificationsPage;
