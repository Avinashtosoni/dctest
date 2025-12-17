import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { NotificationType, CreateNotificationPayload, NotificationPriority, NotificationCategory } from '../types/notifications';

// Re-export for backward compatibility
export type { NotificationType };
export type NotificationAttachment = {
    name: string;
    type: 'image' | 'video' | 'file';
    url: string;
};

export interface NotificationSender {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
}

// Extended notification with joined data for UI
export interface NotificationWithDetails {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    timestamp: Date;
    isRead: boolean;
    notificationId: string;
    attachment?: NotificationAttachment;
    // New fields
    priority?: NotificationPriority;
    category?: NotificationCategory;
    sender?: NotificationSender;
    actionUrl?: string;
    actionLabel?: string;
}

interface NotificationContextType {
    notifications: NotificationWithDetails[];
    unreadCount: number;
    isDrawerOpen: boolean;
    loading: boolean;
    openDrawer: () => void;
    closeDrawer: () => void;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    addNotification: (notification: Omit<NotificationWithDetails, 'id' | 'timestamp' | 'isRead' | 'notificationId'>) => void;
    createAdminNotification: (payload: CreateNotificationPayload) => Promise<boolean>;
    refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationWithDetails[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        if (!user) {
            setNotifications([]);
            setLoading(false);
            return;
        }

        try {
            // Validate session before fetching
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                console.log('[NotificationContext] No valid session, skipping fetch');
                setNotifications([]);
                setLoading(false);
                return;
            }

            // Step 1: Fetch user_notifications (status)
            const { data: userNotifs, error: userNotifError } = await supabase
                .from('user_notifications')
                .select('id, notification_id, is_read, read_at, created_at')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(50);

            if (userNotifError) {
                console.error('[NotificationContext] Error fetching user notifications:', userNotifError);
                throw userNotifError;
            }

            if (!userNotifs || userNotifs.length === 0) {
                setNotifications([]);
                setLoading(false);
                return;
            }

            // Step 2: Fetch the actual notifications details
            const notificationIds = [...new Set(userNotifs.map(un => un.notification_id))];

            const { data: notifDetails, error: notifError } = await supabase
                .from('notifications')
                .select(`
                    id,
                    title,
                    message,
                    type,
                    priority,
                    category,
                    created_by,
                    action_url,
                    action_label,
                    attachment_url,
                    attachment_name,
                    attachment_type,
                    metadata,
                    created_at
                `)
                .in('id', notificationIds);

            if (notifError) {
                console.error('[NotificationContext] Error fetching notification details:', notifError);
                throw notifError;
            }

            // Create a lookup map for notifications
            const notifMap = new Map(notifDetails?.map(n => [n.id, n]) || []);

            // Step 3: Fetch sender profiles
            const senderIds = [...new Set((notifDetails || [])
                .map(n => n.created_by)
                .filter(Boolean))];

            let senderProfiles: Record<string, NotificationSender> = {};
            if (senderIds.length > 0) {
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('id, email, full_name, avatar_url')
                    .in('id', senderIds);

                (profiles || []).forEach((p: any) => {
                    senderProfiles[p.id] = {
                        id: p.id,
                        email: p.email,
                        full_name: p.full_name,
                        avatar_url: p.avatar_url
                    };
                });
            }

            // Step 4: Combine everything
            const mapped: NotificationWithDetails[] = userNotifs.map((item: any) => {
                const notif = notifMap.get(item.notification_id);

                // Skip if notification detail is missing (shouldn't happen with integrity, but good for safety)
                if (!notif) return null;

                const attachment = notif.attachment_url ? {
                    name: notif.attachment_name || 'Attachment',
                    type: (notif.attachment_type?.includes('image') ? 'image' :
                        notif.attachment_type?.includes('video') ? 'video' : 'file') as 'image' | 'video' | 'file',
                    url: notif.attachment_url
                } : notif.metadata?.attachment;

                return {
                    id: item.id,
                    notificationId: notif.id,
                    title: notif.title || 'Notification',
                    message: notif.message || '',
                    type: notif.type || 'info',
                    timestamp: new Date(item.created_at), // Use interaction time or creation time as preferred
                    isRead: item.is_read,
                    attachment,
                    priority: notif.priority,
                    category: notif.category,
                    sender: notif.created_by ? senderProfiles[notif.created_by] : undefined,
                    actionUrl: notif.action_url,
                    actionLabel: notif.action_label
                };
            }).filter(Boolean) as NotificationWithDetails[];

            setNotifications(mapped);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Fetch on mount and when user changes
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Subscribe to realtime updates
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel('user_notifications_changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'user_notifications',
                    filter: `user_id=eq.${user.id}`,
                },
                () => {
                    fetchNotifications();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, fetchNotifications]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const openDrawer = () => setIsDrawerOpen(true);
    const closeDrawer = () => setIsDrawerOpen(false);

    const markAsRead = async (id: string) => {
        try {
            const { error } = await supabase
                .from('user_notifications')
                .update({ is_read: true, read_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;

            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        if (!user) return;
        try {
            const { error } = await supabase
                .from('user_notifications')
                .update({ is_read: true, read_at: new Date().toISOString() })
                .eq('user_id', user.id)
                .eq('is_read', false);

            if (error) throw error;

            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            const { error } = await supabase
                .from('user_notifications')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    // For local/immediate notifications (backwards compatibility)
    const addNotification = (notif: Omit<NotificationWithDetails, 'id' | 'timestamp' | 'isRead' | 'notificationId'>) => {
        const newNotif: NotificationWithDetails = {
            ...notif,
            id: Math.random().toString(36).substr(2, 9),
            notificationId: '',
            timestamp: new Date(),
            isRead: false,
        };
        setNotifications(prev => [newNotif, ...prev]);
    };

    // Admin function to create notification
    const createAdminNotification = async (payload: CreateNotificationPayload): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('notifications')
                .insert({
                    title: payload.title,
                    message: payload.message,
                    type: payload.type,
                    priority: payload.priority || 'normal',
                    category: payload.category || 'general',
                    target_type: payload.target_type,
                    target_value: payload.target_value || null,
                    action_url: payload.action_url || null,
                    action_label: payload.action_label || null,
                    attachment_url: payload.attachment_url || null,
                    attachment_name: payload.attachment_name || null,
                    attachment_type: payload.attachment_type || null,
                    expires_at: payload.expires_at || null,
                    created_by: user?.id,
                });

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error creating notification:', error);
            return false;
        }
    };


    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            isDrawerOpen,
            loading,
            openDrawer,
            closeDrawer,
            markAsRead,
            markAllAsRead,
            deleteNotification,
            addNotification,
            createAdminNotification,
            refreshNotifications: fetchNotifications,
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
