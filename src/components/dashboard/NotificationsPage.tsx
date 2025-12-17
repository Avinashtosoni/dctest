import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNotifications, NotificationType } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import {
    Bell, Check, Trash2, Info, AlertTriangle, CheckCircle, XCircle, Plus, X, Filter,
    Paperclip, FileText, Image as ImageIcon, Calendar, Users, User, Shield, Loader2, Send,
    Zap, Tag, Link2, Clock, Upload, ExternalLink
} from 'lucide-react';
import { NotificationTargetType, NotificationPriority, NotificationCategory } from '../../types/notifications';
import { Profile, UserRole } from '../../types/auth';
import { showToast } from '../../lib/sweetalert';

function timeAgo(date: Date) {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
}

function formatDate(date: Date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

const NotificationIcon = ({ type, size = 20 }: { type: NotificationType, size?: number }) => {
    switch (type) {
        case 'success': return <div className={`p-2 bg-green-100 text-green-600 rounded-lg`}><CheckCircle size={size} /></div>;
        case 'warning': return <div className={`p-2 bg-yellow-100 text-yellow-600 rounded-lg`}><AlertTriangle size={size} /></div>;
        case 'error': return <div className={`p-2 bg-red-100 text-red-600 rounded-lg`}><XCircle size={size} /></div>;
        default: return <div className={`p-2 bg-blue-100 text-blue-600 rounded-lg`}><Info size={size} /></div>;
    }
};

const ROLES: UserRole[] = ['Visitor', 'Customer', 'Client', 'Social Media Manager', 'Developer', 'Admin', 'Super Admin'];
const PRIORITIES: { value: NotificationPriority; label: string; color: string }[] = [
    { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-600' },
    { value: 'normal', label: 'Normal', color: 'bg-blue-100 text-blue-600' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-600' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-600' },
];
const CATEGORIES: { value: NotificationCategory; label: string; icon: any }[] = [
    { value: 'general', label: 'General', icon: Bell },
    { value: 'order', label: 'Order', icon: FileText },
    { value: 'shipping', label: 'Shipping', icon: Send },
    { value: 'payment', label: 'Payment', icon: Tag },
    { value: 'promotion', label: 'Promotion', icon: Zap },
    { value: 'account', label: 'Account', icon: User },
    { value: 'system', label: 'System', icon: Shield },
];

export default function NotificationsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { notifications, markAllAsRead, markAsRead, deleteNotification, createAdminNotification, loading } = useNotifications();
    const { role } = useAuth();
    const isAdmin = role === 'Admin' || role === 'Super Admin';

    const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [sending, setSending] = useState(false);
    const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic');

    // Auto-select notification from URL parameter (deep link from dropdown)
    useEffect(() => {
        const notificationId = searchParams.get('id');
        if (notificationId && notifications.length > 0) {
            setSelectedId(notificationId);
            // Clear the URL parameter after selecting
            setSearchParams({}, { replace: true });
        }
    }, [searchParams, notifications, setSearchParams]);

    // Auto-mark notification as read when selected/opened
    useEffect(() => {
        if (selectedId) {
            const selectedNotif = notifications.find(n => n.id === selectedId);
            if (selectedNotif && !selectedNotif.isRead) {
                markAsRead(selectedId);
            }
        }
    }, [selectedId, notifications, markAsRead]);



    // Form State - Basic
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState<NotificationType>('info');
    const [targetType, setTargetType] = useState<NotificationTargetType>('everyone');
    const [targetRole, setTargetRole] = useState<UserRole>('Visitor');
    const [targetUserId, setTargetUserId] = useState('');
    const [users, setUsers] = useState<Profile[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    // Form State - Advanced
    const [priority, setPriority] = useState<NotificationPriority>('normal');
    const [category, setCategory] = useState<NotificationCategory>('general');
    const [actionUrl, setActionUrl] = useState('');
    const [actionLabel, setActionLabel] = useState('');
    const [expiresAt, setExpiresAt] = useState('');

    // Attachment State
    const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
    const [uploadingAttachment, setUploadingAttachment] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch users for user selection
    useEffect(() => {
        if (targetType === 'user' && users.length === 0) {
            setLoadingUsers(true);
            supabase
                .from('profiles')
                .select('id, email, full_name, role')
                .then(({ data }) => {
                    setUsers((data as Profile[]) || []);
                    setLoadingUsers(false);
                });
        }
    }, [targetType, users.length]);

    // Select first notification by default if none selected and list not empty
    useEffect(() => {
        if (!selectedId && notifications.length > 0) {
            setSelectedId(notifications[0].id);
        }
    }, [notifications, selectedId]);

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.isRead;
        if (filter === 'read') return n.isRead;
        return true;
    });

    const selectedNotification = notifications.find(n => n.id === selectedId);

    const resetForm = () => {
        setTitle('');
        setMessage('');
        setType('info');
        setTargetType('everyone');
        setTargetRole('Visitor');
        setTargetUserId('');
        setPriority('normal');
        setCategory('general');
        setActionUrl('');
        setActionLabel('');
        setExpiresAt('');
        setAttachmentFile(null);
        setActiveTab('basic');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Limit to 5MB
            if (file.size > 5 * 1024 * 1024) {
                showToast.error('File size must be less than 5MB');
                return;
            }
            setAttachmentFile(file);
        }
    };

    const uploadAttachment = async (): Promise<{ url: string; name: string; type: string } | null> => {
        if (!attachmentFile) return null;

        setUploadingAttachment(true);
        try {
            const fileExt = attachmentFile.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
            const filePath = `notification-attachments/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('attachments')
                .upload(filePath, attachmentFile);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('attachments')
                .getPublicUrl(filePath);

            return {
                url: publicUrl,
                name: attachmentFile.name,
                type: attachmentFile.type.startsWith('image/') ? 'image' : 'file'
            };
        } catch (error) {
            console.error('Error uploading attachment:', error);
            showToast.error('Failed to upload attachment');
            return null;
        } finally {
            setUploadingAttachment(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);

        let targetValue: string | undefined = undefined;
        if (targetType === 'role') {
            targetValue = targetRole;
        } else if (targetType === 'user') {
            targetValue = targetUserId;
        }

        // Upload attachment if exists
        let attachment: { url: string; name: string; type: string } | null = null;
        if (attachmentFile) {
            attachment = await uploadAttachment();
        }

        const success = await createAdminNotification({
            title,
            message,
            type,
            priority,
            category,
            target_type: targetType,
            target_value: targetValue,
            action_url: actionUrl || undefined,
            action_label: actionLabel || undefined,
            attachment_url: attachment?.url,
            attachment_name: attachment?.name,
            attachment_type: attachment?.type,
            expires_at: expiresAt || undefined,
        });

        setSending(false);

        if (success) {
            setIsModalOpen(false);
            resetForm();
            showToast.success('Notification sent successfully!');
        } else {
            showToast.error('Failed to create notification. Make sure you have Admin privileges.');
        }
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        deleteNotification(id);
        if (selectedId === id) {
            setSelectedId(null);
        }
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 shrink-0">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 text-[#01478c] rounded-xl">
                        <Bell size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
                        <p className="text-sm text-gray-500">Manage your alerts</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    {isAdmin && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center space-x-2 bg-[#01478c] text-white px-4 py-2 rounded-xl hover:bg-blue-800 transition-colors font-medium text-sm shadow-md"
                        >
                            <Plus size={16} />
                            <span>Send Notification</span>
                        </button>
                    )}
                    <button
                        onClick={markAllAsRead}
                        className="flex items-center space-x-2 text-gray-600 hover:text-[#01478c] bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 px-3 py-2 rounded-xl transition-all font-medium text-sm"
                    >
                        <Check size={16} />
                        <span>Mark all read</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area - Split View */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex min-h-0">

                {/* Left Pane: List */}
                <div className="w-1/3 border-r border-gray-100 flex flex-col min-w-[320px]">
                    {/* Filters */}
                    <div className="border-b border-gray-100 px-4 flex items-center space-x-4 shrink-0 bg-white z-10">
                        {['all', 'unread', 'read'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f as any)}
                                className={`py-4 text-sm font-medium border-b-2 transition-colors capitalize ${filter === f
                                    ? 'border-[#01478c] text-[#01478c]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    {/* Scrollable List */}
                    <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="animate-spin text-blue-600" size={24} />
                            </div>
                        ) : filteredNotifications.length === 0 ? (
                            <div className="text-center py-20 px-4">
                                <div className="mx-auto w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                    <Filter size={20} className="text-gray-300" />
                                </div>
                                <p className="text-gray-500 text-sm">No notifications found.</p>
                            </div>
                        ) : (
                            filteredNotifications.map(notif => {
                                // Check if system notification for meta text
                                const isSystemNotification = notif.category === 'system' || !notif.sender;

                                return (
                                    <div
                                        key={notif.id}
                                        onClick={() => setSelectedId(notif.id)}
                                        className={`p-4 cursor-pointer transition-all relative hover:bg-gray-50 ${selectedId === notif.id ? 'bg-blue-50/60 border-r-2 border-r-blue-500' : 'bg-white'
                                            } ${!notif.isRead ? 'border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Always use Type Icon in list view */}
                                            <div className="mt-0.5 shrink-0">
                                                <NotificationIcon type={notif.type} size={16} />
                                            </div>
                                            <div className="overflow-hidden flex-1 min-w-0">
                                                <div className="flex justify-between items-start gap-2 mb-1">
                                                    <h3 className={`text-sm font-semibold truncate ${!notif.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                                                        {notif.title}
                                                    </h3>
                                                    {/* Priority indicator */}
                                                    {notif.priority === 'urgent' && (
                                                        <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-1.5 animate-pulse"></span>
                                                    )}
                                                    {notif.priority === 'high' && (
                                                        <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0 mt-1.5"></span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 truncate mb-1.5">{notif.message}</p>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="text-[10px] text-gray-400">{timeAgo(notif.timestamp)}</p>
                                                    {/* Show sender name or System */}
                                                    {isSystemNotification ? (
                                                        <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">System</span>
                                                    ) : notif.sender && (
                                                        <span className="text-[10px] text-gray-400">
                                                            • {notif.sender.full_name || notif.sender.email?.split('@')[0]}
                                                        </span>
                                                    )}
                                                    {notif.category && notif.category !== 'general' && notif.category !== 'system' && (
                                                        <span className="text-[10px] text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded capitalize">
                                                            {notif.category}
                                                        </span>
                                                    )}
                                                    {notif.attachment && (
                                                        <Paperclip size={10} className="text-gray-400" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }))
                        }
                    </div>
                </div>

                {/* Right Pane: Details */}
                <div className="flex-1 bg-gray-50/50 flex flex-col overflow-hidden">
                    {selectedNotification ? (
                        <div className="h-full flex flex-col overflow-y-auto p-4 md:p-8">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 max-w-3xl w-full mx-auto">
                                {/* Detail Header */}
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center space-x-4">
                                        <NotificationIcon type={selectedNotification.type} size={28} />
                                        <div>
                                            <h2 className="text-xl md:text-2xl font-bold text-gray-900">{selectedNotification.title}</h2>
                                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                                                <span className="inline-flex items-center text-sm text-gray-500">
                                                    <Calendar size={14} className="mr-1" />
                                                    {formatDate(selectedNotification.timestamp)}
                                                </span>
                                                {/* Priority Badge */}
                                                {selectedNotification.priority && (
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${selectedNotification.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                                        selectedNotification.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                                            selectedNotification.priority === 'normal' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {selectedNotification.priority.charAt(0).toUpperCase() + selectedNotification.priority.slice(1)}
                                                    </span>
                                                )}
                                                {/* Category Badge */}
                                                {selectedNotification.category && (
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600">
                                                        {selectedNotification.category.charAt(0).toUpperCase() + selectedNotification.category.slice(1)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        {!selectedNotification.isRead && (
                                            <button
                                                onClick={() => markAsRead(selectedNotification.id)}
                                                className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                                title="Mark as Read"
                                            >
                                                <Check size={20} />
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => handleDelete(selectedNotification.id, e)}
                                            className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>

                                {/* Sender Info Section - Only show for non-system notifications */}
                                {selectedNotification.sender && selectedNotification.category !== 'system' && (
                                    <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl border border-gray-100">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-semibold">Sent by</p>
                                        <div className="flex items-center gap-3">
                                            {selectedNotification.sender.avatar_url ? (
                                                <img
                                                    src={selectedNotification.sender.avatar_url}
                                                    alt={selectedNotification.sender.full_name || 'Sender'}
                                                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                                    {(selectedNotification.sender.full_name || selectedNotification.sender.email || '?').charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {selectedNotification.sender.full_name || 'Admin'}
                                                </p>
                                                <p className="text-sm text-gray-500">{selectedNotification.sender.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* System Generated Section - Show for system notifications */}
                                {(selectedNotification.category === 'system' || !selectedNotification.sender) && (
                                    <div className="mb-6 p-4 bg-gradient-to-r from-slate-50 to-gray-100 rounded-xl border border-gray-200">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-semibold">Generated by</p>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-[#01478c] rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                                DC
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">System Generated</p>
                                                <p className="text-sm text-gray-500">Digital Comrade Automated Notification</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Divider */}
                                <div className="h-px bg-gray-100 w-full mb-6"></div>

                                {/* Message Body */}
                                <div className="prose prose-blue max-w-none text-gray-700">
                                    <p className="whitespace-pre-wrap leading-relaxed text-base">{selectedNotification.message}</p>
                                </div>

                                {/* Action Button */}
                                {selectedNotification.actionUrl && (
                                    <div className="mt-6">
                                        <a
                                            href={selectedNotification.actionUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md"
                                        >
                                            <ExternalLink size={16} />
                                            {selectedNotification.actionLabel || 'View Details'}
                                        </a>
                                    </div>
                                )}

                                {/* Attachment Section */}
                                {selectedNotification.attachment && (
                                    <div className="mt-8 pt-6 border-t border-gray-100">
                                        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                                            <Paperclip size={16} className="mr-2" />
                                            Attachment
                                        </h4>
                                        {/* Image Preview */}
                                        {selectedNotification.attachment.type === 'image' && (
                                            <div className="mb-4 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                                                <img
                                                    src={selectedNotification.attachment.url}
                                                    alt={selectedNotification.attachment.name}
                                                    className="max-w-full max-h-80 object-contain mx-auto"
                                                />
                                            </div>
                                        )}
                                        <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200 max-w-md">
                                            {selectedNotification.attachment.type === 'image' ? (
                                                <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mr-4 shrink-0">
                                                    <ImageIcon size={24} />
                                                </div>
                                            ) : selectedNotification.attachment.type === 'video' ? (
                                                <div className="h-12 w-12 bg-pink-100 text-pink-600 rounded-lg flex items-center justify-center mr-4 shrink-0">
                                                    <Zap size={24} />
                                                </div>
                                            ) : (
                                                <div className="h-12 w-12 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mr-4 shrink-0">
                                                    <FileText size={24} />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0 mr-4">
                                                <p className="text-sm font-medium text-gray-900 truncate">{selectedNotification.attachment.name}</p>
                                                <p className="text-xs text-gray-500 uppercase">{selectedNotification.attachment.type}</p>
                                            </div>
                                            <a
                                                href={selectedNotification.attachment.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 font-medium whitespace-nowrap"
                                            >
                                                Download
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Bell size={40} className="text-gray-300" />
                            </div>
                            <p className="text-lg font-medium">Select a notification to view details</p>
                            <p className="text-sm text-gray-400 mt-1">Click on any notification from the list</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Admin Create Modal - Enhanced */}
            {isModalOpen && isAdmin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-600">
                            <h2 className="font-bold text-lg text-white flex items-center gap-2">
                                <Send size={20} />
                                Send Notification
                            </h2>
                            <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="text-white/80 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="border-b border-gray-100 px-6">
                            <div className="flex gap-6">
                                <button
                                    onClick={() => setActiveTab('basic')}
                                    className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'basic'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Basic Settings
                                </button>
                                <button
                                    onClick={() => setActiveTab('advanced')}
                                    className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'advanced'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Advanced Options
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleCreate} className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
                            {activeTab === 'basic' && (
                                <>
                                    {/* Target Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Send To</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setTargetType('everyone')}
                                                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 border transition-all ${targetType === 'everyone'
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                                                    }`}
                                            >
                                                <Users size={16} />
                                                Everyone
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setTargetType('role')}
                                                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 border transition-all ${targetType === 'role'
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                                                    }`}
                                            >
                                                <Shield size={16} />
                                                By Role
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setTargetType('user')}
                                                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 border transition-all ${targetType === 'user'
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                                                    }`}
                                            >
                                                <User size={16} />
                                                Specific User
                                            </button>
                                        </div>
                                    </div>

                                    {/* Role Selection */}
                                    {targetType === 'role' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Select Role</label>
                                            <select
                                                value={targetRole}
                                                onChange={(e) => setTargetRole(e.target.value as UserRole)}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            >
                                                {ROLES.map(r => (
                                                    <option key={r} value={r}>{r}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* User Selection */}
                                    {targetType === 'user' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Select User</label>
                                            {loadingUsers ? (
                                                <div className="flex items-center gap-2 text-gray-500 text-sm">
                                                    <Loader2 className="animate-spin" size={16} /> Loading users...
                                                </div>
                                            ) : (
                                                <select
                                                    value={targetUserId}
                                                    onChange={(e) => setTargetUserId(e.target.value)}
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                    required
                                                >
                                                    <option value="">-- Select a user --</option>
                                                    {users.map(u => (
                                                        <option key={u.id} value={u.id}>
                                                            {u.full_name || u.email} ({u.role})
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                    )}

                                    {/* Title */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            value={title}
                                            onChange={e => setTitle(e.target.value)}
                                            placeholder="e.g. Important Announcement"
                                        />
                                    </div>

                                    {/* Type & Priority */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                                            <div className="grid grid-cols-4 gap-1">
                                                {['info', 'success', 'warning', 'error'].map(t => (
                                                    <button
                                                        key={t}
                                                        type="button"
                                                        onClick={() => setType(t as NotificationType)}
                                                        className={`px-2 py-2 rounded-lg text-xs font-bold uppercase transition-all border ${type === t
                                                            ? 'bg-gray-900 text-white border-gray-900'
                                                            : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                                                            }`}
                                                    >
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                                            <div className="grid grid-cols-4 gap-1">
                                                {PRIORITIES.map(p => (
                                                    <button
                                                        key={p.value}
                                                        type="button"
                                                        onClick={() => setPriority(p.value)}
                                                        className={`px-2 py-2 rounded-lg text-xs font-bold transition-all border ${priority === p.value
                                                            ? `${p.color} border-current`
                                                            : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                                                            }`}
                                                    >
                                                        {p.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Category */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                        <div className="flex flex-wrap gap-2">
                                            {CATEGORIES.map(c => (
                                                <button
                                                    key={c.value}
                                                    type="button"
                                                    onClick={() => setCategory(c.value)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all border ${category === c.value
                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                                                        }`}
                                                >
                                                    <c.icon size={12} />
                                                    {c.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Message */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                        <textarea
                                            required
                                            rows={4}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                                            value={message}
                                            onChange={e => setMessage(e.target.value)}
                                            placeholder="Enter notification details..."
                                        />
                                    </div>
                                </>
                            )}

                            {activeTab === 'advanced' && (
                                <>
                                    {/* Action Button */}
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <Link2 size={16} />
                                            Action Button (Optional)
                                        </h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Button Label</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                                                    value={actionLabel}
                                                    onChange={e => setActionLabel(e.target.value)}
                                                    placeholder="e.g. View Order"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">URL</label>
                                                <input
                                                    type="url"
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                                                    value={actionUrl}
                                                    onChange={e => setActionUrl(e.target.value)}
                                                    placeholder="https://..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expiry */}
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <Clock size={16} />
                                            Expiry Date (Optional)
                                        </h4>
                                        <input
                                            type="datetime-local"
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                                            value={expiresAt}
                                            onChange={e => setExpiresAt(e.target.value)}
                                        />
                                        <p className="text-xs text-gray-500 mt-2">Notification will be hidden after this date.</p>
                                    </div>

                                    {/* Attachment */}
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <Paperclip size={16} />
                                            Attachment (Optional)
                                        </h4>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            className="hidden"
                                            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                                        />
                                        {attachmentFile ? (
                                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                                        {attachmentFile.type.startsWith('image/') ? <ImageIcon size={18} /> : <FileText size={18} />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{attachmentFile.name}</p>
                                                        <p className="text-xs text-gray-500">{(attachmentFile.size / 1024).toFixed(1)} KB</p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setAttachmentFile(null)}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="w-full py-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition-all flex flex-col items-center gap-2 text-gray-500"
                                            >
                                                <Upload size={24} className="text-gray-400" />
                                                <span className="text-sm font-medium">Click to upload file</span>
                                                <span className="text-xs text-gray-400">Max 5MB • Images, PDF, Docs, Excel</span>
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </form>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                            <button
                                type="submit"
                                onClick={handleCreate}
                                disabled={sending || uploadingAttachment || !title || !message}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-colors shadow-lg shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {sending || uploadingAttachment ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        {uploadingAttachment ? 'Uploading...' : 'Sending...'}
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} />
                                        Send Notification
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
