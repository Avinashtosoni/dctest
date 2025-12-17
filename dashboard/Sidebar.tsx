import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    AppWindow,
    FileSignature,
    User,
    CreditCard,
    Users,
    Target,
    FolderKanban,
    LayoutGrid,
    Briefcase,
    Settings,
    Shield,
    HelpCircle,
    Bell,
    PenTool,
    Share2,
    Globe,
    MessageSquare
} from 'lucide-react';


import { useState } from 'react';
import { ChevronDown, ChevronRight, X, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { Permission, PERMISSIONS } from '../../config/permissions';

interface SubItem {
    label: string;
    path: string;
    active: boolean;
    permission?: Permission;
}

interface MenuItem {
    icon: any;
    label: string;
    path: string;
    permission?: Permission;
    subItems?: SubItem[];
}

const SidebarItem = ({ icon: Icon, label, path, active, subItems }: { icon: any, label: string, path: string, active?: boolean, subItems?: { label: string, path: string, active: boolean }[] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasSubItems = subItems && subItems.length > 0;
    const isParentActive = active || (subItems && subItems.some(item => item.active));

    return (
        <div className="space-y-1">
            <Link
                to={path}
                onClick={(e) => {
                    if (hasSubItems) {
                        setIsOpen(!isOpen);
                        // If path is '#', prevent navigation
                        if (path === '#') e.preventDefault();
                    }
                }}
                className={`flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors cursor-pointer ${isParentActive
                    ? 'text-[#01478c] bg-blue-50'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
            >
                <div className="flex items-center space-x-3">
                    <Icon size={20} />
                    <span>{label}</span>
                </div>
                {hasSubItems && (
                    <div className="text-gray-400">
                        {isOpen || isParentActive ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>
                )}
            </Link>

            {(isOpen || isParentActive) && hasSubItems && (
                <div className="pl-12 space-y-1">
                    {subItems.map((item, index) => (
                        <Link
                            key={index}
                            to={item.path}
                            className={`block px-4 py-2 text-xs font-medium rounded-lg transition-colors ${item.active
                                ? 'text-blue-600 bg-blue-50/50'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
    const location = useLocation();
    const navigate = useNavigate();
    const pathname = location.pathname;
    const { signOut } = useAuth();
    const { hasPermission } = usePermissions();

    const handleLogout = async () => {
        try {
            await signOut();
            navigate('/login', { replace: true });
        } catch (error) {
            console.error('Error during logout:', error);
            navigate('/login', { replace: true });
        }
    };

    // Define all menu items with their required permissions
    const mainMenuItems: MenuItem[] = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', permission: PERMISSIONS.VIEW_DASHBOARD },
        { icon: LayoutGrid, label: 'Shop', path: '/dashboard/shop', permission: PERMISSIONS.VIEW_SHOP },
        { icon: CreditCard, label: 'My Account', path: '/dashboard/account', permission: PERMISSIONS.VIEW_ACCOUNT },
        { icon: User, label: 'My Profile', path: '/dashboard/profile', permission: PERMISSIONS.VIEW_PROFILE },
    ];

    const managementMenuItems: MenuItem[] = [
        { icon: FileText, label: 'Reports', path: '/dashboard/reports', permission: PERMISSIONS.VIEW_REPORTS },
        { icon: AppWindow, label: 'Applications', path: '/dashboard/applications', permission: PERMISSIONS.VIEW_APPLICATIONS },
        {
            icon: Briefcase,
            label: 'Services',
            path: '/dashboard/services',
            permission: PERMISSIONS.VIEW_SERVICES,
            subItems: [
                { label: 'Packages', path: '/dashboard/services', active: pathname === '/dashboard/services', permission: PERMISSIONS.VIEW_SERVICES },
                { label: 'Subscriptions', path: '/dashboard/subscriptions', active: pathname === '/dashboard/subscriptions', permission: PERMISSIONS.VIEW_SUBSCRIPTIONS },
                { label: 'Orders', path: '/dashboard/orders', active: pathname === '/dashboard/orders', permission: PERMISSIONS.VIEW_ORDERS },
                { label: 'Coupons', path: '/dashboard/coupons', active: pathname === '/dashboard/coupons', permission: PERMISSIONS.VIEW_COUPONS },
                { label: 'Products', path: '/dashboard/products', active: pathname === '/dashboard/products', permission: PERMISSIONS.VIEW_PRODUCTS },
            ]
        },
        { icon: FileSignature, label: 'Proposals', path: '/dashboard/proposals', permission: PERMISSIONS.VIEW_PROPOSALS },
        { icon: CreditCard, label: 'Payment', path: '/dashboard/payment', permission: PERMISSIONS.VIEW_PAYMENT },
        { icon: Users, label: 'Team', path: '/dashboard/team', permission: PERMISSIONS.VIEW_TEAM },
        { icon: Users, label: 'Customers', path: '/dashboard/customers', permission: PERMISSIONS.VIEW_CUSTOMERS },
        { icon: Target, label: 'Leads', path: '/dashboard/leads', permission: PERMISSIONS.VIEW_LEADS },
        { icon: MessageSquare, label: 'Messages', path: '/dashboard/messages', permission: PERMISSIONS.VIEW_LEADS }, // Using VIEW_LEADS permission as placeholder for admins
        { icon: FolderKanban, label: 'Projects', path: '/dashboard/projects', permission: PERMISSIONS.VIEW_PROJECTS },
        { icon: Briefcase, label: 'Portfolio', path: '/dashboard/portfolio', permission: PERMISSIONS.VIEW_PORTFOLIO },
        { icon: PenTool, label: 'Blog', path: '/dashboard/blog', permission: PERMISSIONS.VIEW_BLOG },
        { icon: Share2, label: 'Social Media', path: '/dashboard/social-media', permission: PERMISSIONS.VIEW_SOCIAL_MEDIA },
        { icon: LayoutGrid, label: 'Widgets', path: '/dashboard/widgets', permission: PERMISSIONS.VIEW_WIDGETS },
        { icon: Globe, label: 'Website', path: '/dashboard/website', permission: PERMISSIONS.VIEW_WEBSITE },
    ];

    const systemMenuItems: MenuItem[] = [
        { icon: Bell, label: 'Notifications', path: '/dashboard/notifications', permission: PERMISSIONS.VIEW_NOTIFICATIONS },
        { icon: Settings, label: 'Settings', path: '/dashboard/settings', permission: PERMISSIONS.VIEW_SETTINGS },
        { icon: Shield, label: 'Authentication', path: '/dashboard/authentication', permission: PERMISSIONS.VIEW_AUTHENTICATION },
    ];

    // Filter menu items based on permissions
    const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
        return items.filter(item => {
            if (!item.permission) return true;
            return hasPermission(item.permission);
        }).map(item => {
            if (item.subItems) {
                const filteredSubItems = item.subItems.filter(sub => {
                    if (!sub.permission) return true;
                    return hasPermission(sub.permission);
                });
                return { ...item, subItems: filteredSubItems };
            }
            return item;
        }).filter(item => {
            // Remove parent if all sub-items were filtered out
            if (item.subItems && item.subItems.length === 0) return false;
            return true;
        });
    };

    const filteredMainMenu = filterMenuItems(mainMenuItems);
    const filteredManagementMenu = filterMenuItems(managementMenuItems);
    const filteredSystemMenu = filterMenuItems(systemMenuItems);

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden animate-in fade-in"
                    onClick={onClose}
                />
            )}

            <div className={`
                w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0 z-30 overflow-y-auto transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
            `}>
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <img src="/logo.png" alt="Digital Comrade" className="w-8 h-8 object-contain" />
                        <div>
                            <h1 className="text-xl font-bold text-[#01478c] tracking-tight leading-none">Digital</h1>
                            <h1 className="text-xl font-bold text-[#01478c] tracking-tight leading-none">Comrade</h1>
                        </div>
                    </div>
                    {/* Close button for mobile */}
                    <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-1 pb-6">
                    {/* Main Menu Items */}
                    {filteredMainMenu.map((item, index) => (
                        <SidebarItem
                            key={`main-${index}`}
                            icon={item.icon}
                            label={item.label}
                            path={item.path}
                            active={pathname === item.path}
                            subItems={item.subItems}
                        />
                    ))}

                    {/* Management Section */}
                    {filteredManagementMenu.length > 0 && (
                        <>
                            <div className="pt-4 pb-2">
                                <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Management</p>
                            </div>
                            {filteredManagementMenu.map((item, index) => (
                                <SidebarItem
                                    key={`mgmt-${index}`}
                                    icon={item.icon}
                                    label={item.label}
                                    path={item.path}
                                    active={pathname === item.path || (item.subItems && item.subItems.some(sub => sub.active))}
                                    subItems={item.subItems}
                                />
                            ))}
                        </>
                    )}

                    {/* System Section */}
                    {filteredSystemMenu.length > 0 && (
                        <>
                            <div className="pt-4 pb-2">
                                <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">System</p>
                            </div>
                            {filteredSystemMenu.map((item, index) => (
                                <SidebarItem
                                    key={`sys-${index}`}
                                    icon={item.icon}
                                    label={item.label}
                                    path={item.path}
                                    active={pathname === item.path}
                                />
                            ))}
                        </>
                    )}

                    <SidebarItem icon={HelpCircle} label="Help Center" path="#" />
                </nav>


                <div className="p-4 mt-auto space-y-4">
                    <div className="bg-blue-50 p-4 rounded-xl text-center">
                        <div className="mx-auto w-10 h-10 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
                            <LayoutGrid size={20} className="text-[#01478c]" />
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm">Need Help?</h3>
                        <p className="text-xs text-gray-500 mt-1 mb-3">Contact our support team for any queries.</p>
                        <button className="w-full bg-[#01478c] text-white text-xs font-bold py-2 rounded-lg hover:bg-blue-800 transition-colors">
                            CONTACT SUPPORT
                        </button>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    >
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>
        </>
    );
}

