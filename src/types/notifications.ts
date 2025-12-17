// Notification System Types

export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationTargetType = 'everyone' | 'role' | 'user';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type NotificationCategory = 'general' | 'order' | 'shipping' | 'payment' | 'promotion' | 'account' | 'system';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    priority: NotificationPriority;
    category: NotificationCategory;
    created_by: string | null;
    target_type: NotificationTargetType;
    target_value: string | null;
    // Action button
    action_url: string | null;
    action_label: string | null;
    // Attachment
    attachment_url: string | null;
    attachment_name: string | null;
    attachment_type: string | null;
    // Expiry
    expires_at: string | null;
    metadata: Record<string, any>;
    created_at: string;
}

export interface UserNotification {
    id: string;
    user_id: string;
    notification_id: string;
    is_read: boolean;
    read_at: string | null;
    created_at: string;
    // Joined from notifications table
    notification?: Notification;
}

export interface NotificationTemplate {
    id: string;
    name: string;
    title_template: string;
    message_template: string;
    type: NotificationType;
    priority: NotificationPriority;
    category: NotificationCategory;
    trigger_event: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// For creating a new notification
export interface CreateNotificationPayload {
    title: string;
    message: string;
    type: NotificationType;
    priority?: NotificationPriority;
    category?: NotificationCategory;
    target_type: NotificationTargetType;
    target_value?: string;
    action_url?: string;
    action_label?: string;
    attachment_url?: string;
    attachment_name?: string;
    attachment_type?: string;
    expires_at?: string;
}
