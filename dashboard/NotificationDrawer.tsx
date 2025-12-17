import { X, Check, Trash2, FileText, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { useNotifications, NotificationType } from '../../context/NotificationContext';
import { Link } from 'react-router-dom';

function timeAgo(date: Date) {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

const TypeIndicator = ({ type }: { type: NotificationType }) => {
    switch (type) {
        case 'success': return <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>;
        case 'warning': return <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2"></div>;
        case 'error': return <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>;
        default: return <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>;
    }
};

export default function NotificationDrawer() {
    const { isDrawerOpen, closeDrawer, notifications, markAllAsRead, markAsRead, deleteNotification } = useNotifications();

    if (!isDrawerOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            <div
                className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
                onClick={closeDrawer}
            ></div>

            <div className="relative w-full max-w-sm bg-white shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                    <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={markAllAsRead}
                            className="text-xs text-blue-600 font-medium hover:text-blue-800"
                        >
                            Mark all read
                        </button>
                        <button onClick={closeDrawer} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
                    {notifications.length === 0 ? (
                        <div className="text-center py-10 opacity-50">
                            <p>No notifications</p>
                        </div>
                    ) : (
                        notifications.map(notif => (
                            <div
                                key={notif.id}
                                className={`group relative p-3 rounded-xl border transition-all ${notif.isRead ? 'bg-white border-gray-100' : 'bg-blue-50/30 border-blue-100'
                                    }`}
                            >
                                <div className="flex items-start space-x-3">
                                    <TypeIndicator type={notif.type} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h4 className={`text-sm font-semibold truncate ${notif.isRead ? 'text-gray-700' : 'text-gray-900'}`}>{notif.title}</h4>
                                            <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{timeAgo(notif.timestamp)}</span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1 leading-snug">{notif.message}</p>

                                        {/* Attachment Preview */}
                                        {notif.attachment && (
                                            <div className="mt-3 p-2 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                                                <div className="flex items-center space-x-2 truncate">
                                                    {notif.attachment.type === 'image' ? <ImageIcon size={16} className="text-purple-500" /> : <FileText size={16} className="text-orange-500" />}
                                                    <span className="text-xs font-medium text-gray-700 truncate">{notif.attachment.name}</span>
                                                </div>
                                                <a href={notif.attachment.url} className="text-blue-600 hover:underline text-xs flex-shrink-0">View</a>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="mt-2 flex items-center space-x-4">
                                            {!notif.isRead && (
                                                <button onClick={() => markAsRead(notif.id)} className="text-xs text-blue-600 hover:text-blue-700 font-medium">Mark read</button>
                                            )}
                                            <button onClick={() => deleteNotification(notif.id)} className="text-xs text-gray-400 hover:text-red-500">Delete</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <Link to="/dashboard/notifications" onClick={closeDrawer} className="block w-full text-center text-sm font-semibold text-[#01478c] hover:underline">
                        View All Notifications
                    </Link>
                </div>
            </div>
        </div>
    );
}
