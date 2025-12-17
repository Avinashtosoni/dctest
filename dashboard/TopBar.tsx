
import { Search, Bell, Clock, Menu, User, Settings, LogOut, ExternalLink, Activity, FileText, DollarSign, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications, NotificationWithDetails } from '../../context/NotificationContext';

// Helper function for relative time
const timeAgo = (date: Date): string => {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Notification type icon component
const NotificationIcon = ({ type }: { type: string }) => {
    const iconClass = "w-10 h-10 rounded-full flex items-center justify-center";

    switch (type) {
        case 'success':
            return <div className={`${iconClass} bg-green-100`}><CheckCircle className="text-green-600" size={20} /></div>;
        case 'warning':
            return <div className={`${iconClass} bg-yellow-100`}><AlertTriangle className="text-yellow-600" size={20} /></div>;
        case 'error':
            return <div className={`${iconClass} bg-red-100`}><X className="text-red-600" size={20} /></div>;
        case 'payment':
            return <div className={`${iconClass} bg-emerald-100`}><DollarSign className="text-emerald-600" size={20} /></div>;
        case 'report':
            return <div className={`${iconClass} bg-blue-100`}><FileText className="text-blue-600" size={20} /></div>;
        default:
            return <div className={`${iconClass} bg-indigo-100`}><Info className="text-indigo-600" size={20} /></div>;
    }
};

export default function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const { user, signOut } = useAuth();
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const profileDropdownRef = useRef<HTMLDivElement>(null);
    const notificationDropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const handleLogout = async () => {
        setIsProfileOpen(false);
        try {
            await signOut();
            navigate('/login', { replace: true });
        } catch (error) {
            console.error('Error during logout:', error);
            navigate('/login', { replace: true });
        }
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
            if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target as Node)) {
                setIsNotificationOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleNotificationClick = async (notification: NotificationWithDetails) => {
        if (!notification.isRead) {
            await markAsRead(notification.id);
        }
        setIsNotificationOpen(false);
        // Navigate with notification ID for deep linking to full view
        navigate(`/dashboard/notifications?id=${notification.id}`);
    };

    // Get recent notifications (max 5)
    const recentNotifications = notifications.slice(0, 5);

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10 w-full">
            <div className="flex items-center space-x-4">
                <button
                    className="p-1 rounded-md hover:bg-gray-100 lg:hidden"
                    onClick={onMenuClick}
                >
                    <Menu size={20} className="text-gray-600" />
                </button>

                <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
                    <span className="font-medium text-gray-900">Dashboard</span>
                    <span>/</span>
                    <span>Home</span>
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Search size={20} />
                </button>

                <div className="flex items-center space-x-1 bg-gray-50 rounded-full p-1 border border-gray-100">
                    <img src="https://flagcdn.com/w40/us.png" alt="US" className="w-5 h-5 rounded-full object-cover" />
                </div>

                <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                    <Clock size={20} />
                </button>

                {/* Notification Bell with Dropdown */}
                <div className="relative" ref={notificationDropdownRef}>
                    <button
                        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                        className="p-2 text-gray-400 hover:text-gray-600 relative focus:outline-none"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {isNotificationOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200 z-50 overflow-hidden">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wide">Alerts Center</h3>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={() => markAllAsRead()}
                                            className="text-xs text-white/80 hover:text-white transition-colors"
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Notifications List */}
                            <div className="max-h-80 overflow-y-auto">
                                {recentNotifications.length === 0 ? (
                                    <div className="py-8 text-center">
                                        <Bell className="mx-auto text-gray-300 mb-2" size={32} />
                                        <p className="text-sm text-gray-500">No notifications yet</p>
                                    </div>
                                ) : (
                                    recentNotifications.map((notification) => (
                                        <button
                                            key={notification.id}
                                            onClick={() => handleNotificationClick(notification)}
                                            className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-50 text-left ${!notification.isRead ? 'bg-blue-50/50' : ''
                                                }`}
                                        >
                                            <NotificationIcon type={notification.type} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-gray-400 mb-0.5">
                                                    {timeAgo(notification.timestamp)}
                                                </p>
                                                <p className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                                    {notification.title}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate mt-0.5">
                                                    {notification.message}
                                                </p>
                                            </div>
                                            {!notification.isRead && (
                                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                                            )}
                                        </button>
                                    ))
                                )}
                            </div>

                            {/* Footer */}
                            <Link
                                to="/dashboard/notifications"
                                onClick={() => setIsNotificationOpen(false)}
                                className="block py-3 text-center text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-gray-50 transition-colors border-t border-gray-100"
                            >
                                Show All Alerts
                            </Link>
                        </div>
                    )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileDropdownRef}>
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-gray-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                    >
                        <img
                            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </button>

                    {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg py-1 border border-gray-100 animate-in fade-in zoom-in-95 duration-200 z-50">
                            <div className="px-4 py-3 border-b border-gray-100">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                    {user?.email?.split('@')[0] || 'Admin User'}
                                </p>
                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            </div>

                            <div className="py-1">
                                <Link
                                    to="/dashboard/profile"
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                                    onClick={() => setIsProfileOpen(false)}
                                >
                                    <User size={16} className="mr-3 text-gray-400" />
                                    Profile
                                </Link>
                                <Link
                                    to="/dashboard/notifications"
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                                    onClick={() => setIsProfileOpen(false)}
                                >
                                    <Activity size={16} className="mr-3 text-gray-400" />
                                    Activity
                                </Link>
                                <Link
                                    to="/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                                    onClick={() => setIsProfileOpen(false)}
                                >
                                    <ExternalLink size={16} className="mr-3 text-gray-400" />
                                    Public View
                                </Link>
                                <Link
                                    to="/dashboard/settings"
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                                    onClick={() => setIsProfileOpen(false)}
                                >
                                    <Settings size={16} className="mr-3 text-gray-400" />
                                    Settings
                                </Link>
                            </div>

                            <div className="border-t border-gray-100 py-1">
                                <button
                                    onClick={handleLogout}
                                    className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut size={16} className="mr-3" />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
