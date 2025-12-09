// Notification severity levels
export type NotificationSeverity = 'info' | 'warning' | 'error' | 'success';

// Notification categories
export type NotificationCategory =
    | 'security'
    | 'device'
    | 'energy'
    | 'system'
    | 'automation'
    | 'intercom';

// Single notification
export interface Notification {
    id: string;
    title: string;
    message: string;
    severity: NotificationSeverity;
    category: NotificationCategory;
    timestamp: string;
    read: boolean;
    dismissed: boolean;
    entityId?: string; // Related Home Assistant entity
    roomId?: string; // Related room
    actionUrl?: string; // Deep link to related page
    actionLabel?: string;
    persistent?: boolean; // If true, requires manual dismissal
}

// Event log entry (more detailed than notification)
export interface EventLogEntry {
    id: string;
    type: 'device_state_change' | 'user_action' | 'automation_trigger' | 'system_event' | 'security_event';
    entityId?: string;
    entityName?: string;
    roomId?: string;
    userId?: string;
    userName?: string;
    previousState?: string;
    newState?: string;
    details?: string;
    timestamp: string;
}

// Alert for persistent issues
export interface Alert {
    id: string;
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: NotificationCategory;
    isActive: boolean;
    createdAt: string;
    acknowledgedAt?: string;
    acknowledgedBy?: string;
    resolvedAt?: string;
    entityId?: string;
    roomId?: string;
}

// Notification center state
export interface NotificationCenterState {
    notifications: Notification[];
    eventLog: EventLogEntry[];
    alerts: Alert[];
    unreadCount: number;
    activeAlertCount: number;
}
