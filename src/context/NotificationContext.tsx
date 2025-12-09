import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Notification, EventLogEntry, Alert, NotificationCenterState, NotificationCategory } from '@/types';

const STORAGE_KEY = 'hcc-notifications';
const MAX_NOTIFICATIONS = 100;
const MAX_EVENT_LOG = 500;

interface NotificationContextType {
    state: NotificationCenterState;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read' | 'dismissed'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    dismissNotification: (id: string) => void;
    clearAllNotifications: () => void;
    addEvent: (event: Omit<EventLogEntry, 'id' | 'timestamp'>) => void;
    addAlert: (alert: Omit<Alert, 'id' | 'createdAt' | 'isActive'>) => void;
    acknowledgeAlert: (id: string, userId?: string) => void;
    resolveAlert: (id: string) => void;
    getNotificationsByCategory: (category: NotificationCategory) => Notification[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const initialState: NotificationCenterState = {
    notifications: [],
    eventLog: [],
    alerts: [],
    unreadCount: 0,
    activeAlertCount: 0,
};

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<NotificationCenterState>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                return {
                    ...parsed,
                    unreadCount: parsed.notifications?.filter((n: Notification) => !n.read).length || 0,
                    activeAlertCount: parsed.alerts?.filter((a: Alert) => a.isActive).length || 0,
                };
            } catch {
                return initialState;
            }
        }
        return initialState;
    });

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [state]);

    const addNotification = useCallback((
        notification: Omit<Notification, 'id' | 'timestamp' | 'read' | 'dismissed'>
    ) => {
        const newNotification: Notification = {
            ...notification,
            id: generateId(),
            timestamp: new Date().toISOString(),
            read: false,
            dismissed: false,
        };

        setState(prev => {
            const notifications = [newNotification, ...prev.notifications].slice(0, MAX_NOTIFICATIONS);
            return {
                ...prev,
                notifications,
                unreadCount: notifications.filter(n => !n.read).length,
            };
        });
    }, []);

    const markAsRead = useCallback((id: string) => {
        setState(prev => {
            const notifications = prev.notifications.map(n =>
                n.id === id ? { ...n, read: true } : n
            );
            return {
                ...prev,
                notifications,
                unreadCount: notifications.filter(n => !n.read).length,
            };
        });
    }, []);

    const markAllAsRead = useCallback(() => {
        setState(prev => ({
            ...prev,
            notifications: prev.notifications.map(n => ({ ...n, read: true })),
            unreadCount: 0,
        }));
    }, []);

    const dismissNotification = useCallback((id: string) => {
        setState(prev => {
            const notifications = prev.notifications.filter(n => n.id !== id);
            return {
                ...prev,
                notifications,
                unreadCount: notifications.filter(n => !n.read).length,
            };
        });
    }, []);

    const clearAllNotifications = useCallback(() => {
        setState(prev => ({
            ...prev,
            notifications: prev.notifications.filter(n => n.persistent),
            unreadCount: 0,
        }));
    }, []);

    const addEvent = useCallback((event: Omit<EventLogEntry, 'id' | 'timestamp'>) => {
        const newEvent: EventLogEntry = {
            ...event,
            id: generateId(),
            timestamp: new Date().toISOString(),
        };

        setState(prev => ({
            ...prev,
            eventLog: [newEvent, ...prev.eventLog].slice(0, MAX_EVENT_LOG),
        }));
    }, []);

    const addAlert = useCallback((alert: Omit<Alert, 'id' | 'createdAt' | 'isActive'>) => {
        const newAlert: Alert = {
            ...alert,
            id: generateId(),
            createdAt: new Date().toISOString(),
            isActive: true,
        };

        setState(prev => {
            const alerts = [newAlert, ...prev.alerts];
            return {
                ...prev,
                alerts,
                activeAlertCount: alerts.filter(a => a.isActive).length,
            };
        });

        // Also create a notification for the alert
        addNotification({
            title: alert.title,
            message: alert.description,
            severity: alert.severity === 'critical' ? 'error' : alert.severity === 'high' ? 'warning' : 'info',
            category: alert.category,
            persistent: true,
            entityId: alert.entityId,
            roomId: alert.roomId,
        });
    }, [addNotification]);

    const acknowledgeAlert = useCallback((id: string, userId?: string) => {
        setState(prev => ({
            ...prev,
            alerts: prev.alerts.map(a =>
                a.id === id
                    ? { ...a, acknowledgedAt: new Date().toISOString(), acknowledgedBy: userId }
                    : a
            ),
        }));
    }, []);

    const resolveAlert = useCallback((id: string) => {
        setState(prev => {
            const alerts = prev.alerts.map(a =>
                a.id === id
                    ? { ...a, isActive: false, resolvedAt: new Date().toISOString() }
                    : a
            );
            return {
                ...prev,
                alerts,
                activeAlertCount: alerts.filter(a => a.isActive).length,
            };
        });
    }, []);

    const getNotificationsByCategory = useCallback((category: NotificationCategory): Notification[] => {
        return state.notifications.filter(n => n.category === category);
    }, [state.notifications]);

    return (
        <NotificationContext.Provider
            value={{
                state,
                addNotification,
                markAsRead,
                markAllAsRead,
                dismissNotification,
                clearAllNotifications,
                addEvent,
                addAlert,
                acknowledgeAlert,
                resolveAlert,
                getNotificationsByCategory,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}

// Helper hook for creating quick notifications
export function useToast() {
    const { addNotification } = useNotifications();

    return {
        success: (title: string, message: string = '') =>
            addNotification({ title, message, severity: 'success', category: 'system' }),
        error: (title: string, message: string = '') =>
            addNotification({ title, message, severity: 'error', category: 'system' }),
        warning: (title: string, message: string = '') =>
            addNotification({ title, message, severity: 'warning', category: 'system' }),
        info: (title: string, message: string = '') =>
            addNotification({ title, message, severity: 'info', category: 'system' }),
    };
}
