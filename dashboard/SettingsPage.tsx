import { useState, useEffect } from 'react';
import { Save, User, Lock, Bell, Globe, Moon, Shield, Users, Plus, Trash2, Edit3, XCircle, Key, FileText, Loader2, ToggleLeft, ToggleRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { NotificationTemplate, NotificationType } from '../../types/notifications';
import { useAuth } from '../../context/AuthContext';
import { showToast, showDeleteConfirm } from '../../lib/sweetalert';
import { UserRole } from '../../types/auth';

interface UserData {
    id: string;
    full_name: string | null;
    email: string | null;
    role: UserRole;
    status: string | null;
    updated_at: string;
    avatar_url: string | null;
}

interface RoleData {
    id: string;
    name: string;
    description: string | null;
    permissions: string[];
    created_at: string;
    updated_at: string;
}

export default function SettingsPage() {
    const { role } = useAuth();
    const isAdmin = role === 'Admin' || role === 'Super Admin';
    const [activeTab, setActiveTab] = useState('general');

    const tabs = [
        { id: 'general', label: 'General', icon: <Globe size={18} /> },
        { id: 'account', label: 'Account', icon: <User size={18} /> },
        { id: 'security', label: 'Security', icon: <Shield size={18} /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
        { id: 'users', label: 'Users', icon: <Users size={18} /> },
        { id: 'roles', label: 'Roles', icon: <Key size={18} /> },
        ...(isAdmin ? [{ id: 'templates', label: 'Notification Templates', icon: <FileText size={18} /> }] : []),
    ];

    // Users Management State
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [userFormData, setUserFormData] = useState<Partial<UserData>>({});
    const [users, setUsers] = useState<UserData[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [savingUser, setSavingUser] = useState(false);

    // Role Management State
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<RoleData | null>(null);
    const [roleFormData, setRoleFormData] = useState<Partial<RoleData>>({});
    const [roles, setRoles] = useState<RoleData[]>([]);
    const [loadingRoles, setLoadingRoles] = useState(false);
    const [savingRole, setSavingRole] = useState(false);
    const [userCounts, setUserCounts] = useState<Record<string, number>>({});

    const availablePermissions = [
        { id: 'view_dashboard', label: 'View Dashboard' },
        { id: 'manage_users', label: 'Manage Users' },
        { id: 'manage_content', label: 'Manage Content' },
        { id: 'manage_settings', label: 'Manage Settings' },
        { id: 'view_reports', label: 'View Reports' },
    ];

    // Notification Templates State
    const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
    const [loadingTemplates, setLoadingTemplates] = useState(false);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
    const [templateFormData, setTemplateFormData] = useState<Partial<NotificationTemplate>>({});
    const [savingTemplate, setSavingTemplate] = useState(false);

    const triggerEvents = [
        { id: 'profile_update', label: 'Profile Update' },
        { id: 'signup', label: 'User Signup' },
        { id: 'purchase', label: 'Purchase Complete' },
        { id: 'billing', label: 'Billing Reminder' },
        { id: 'service_update', label: 'Service Update' },
        { id: 'system', label: 'System Notification' },
    ];

    // Fetch templates when tab is active
    useEffect(() => {
        if (activeTab === 'templates' && isAdmin) {
            fetchTemplates();
        }
    }, [activeTab, isAdmin]);

    // Fetch users when tab is active
    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers();
        }
    }, [activeTab]);

    // Fetch roles when tab is active
    useEffect(() => {
        if (activeTab === 'roles') {
            fetchRoles();
        }
    }, [activeTab]);

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, email, role, status, updated_at, avatar_url')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);

            // Calculate user counts per role
            const counts: Record<string, number> = {};
            (data || []).forEach(user => {
                counts[user.role] = (counts[user.role] || 0) + 1;
            });
            setUserCounts(counts);
        } catch (error) {
            console.error('Error fetching users:', error);
            showToast.error('Failed to load users.');
        } finally {
            setLoadingUsers(false);
        }
    };

    const fetchRoles = async () => {
        setLoadingRoles(true);
        try {
            const { data, error } = await supabase
                .from('roles')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;
            setRoles(data || []);
        } catch (error) {
            console.error('Error fetching roles:', error);
            showToast.error('Failed to load roles.');
        } finally {
            setLoadingRoles(false);
        }
    };

    const fetchTemplates = async () => {
        setLoadingTemplates(true);
        try {
            const { data, error } = await supabase
                .from('notification_templates')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTemplates(data || []);
        } catch (error) {
            console.error('Error fetching templates:', error);
        } finally {
            setLoadingTemplates(false);
        }
    };

    const handleAddTemplate = () => {
        setEditingTemplate(null);
        setTemplateFormData({ type: 'info', is_active: true });
        setIsTemplateModalOpen(true);
    };

    const handleEditTemplate = (template: NotificationTemplate) => {
        setEditingTemplate(template);
        setTemplateFormData(template);
        setIsTemplateModalOpen(true);
    };

    const handleSaveTemplate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingTemplate(true);
        try {
            if (editingTemplate) {
                const { error } = await supabase
                    .from('notification_templates')
                    .update({
                        name: templateFormData.name,
                        title_template: templateFormData.title_template,
                        message_template: templateFormData.message_template,
                        type: templateFormData.type,
                        trigger_event: templateFormData.trigger_event,
                        is_active: templateFormData.is_active,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', editingTemplate.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('notification_templates')
                    .insert({
                        name: templateFormData.name,
                        title_template: templateFormData.title_template,
                        message_template: templateFormData.message_template,
                        type: templateFormData.type,
                        trigger_event: templateFormData.trigger_event,
                        is_active: templateFormData.is_active ?? true,
                    });
                if (error) throw error;
            }
            await fetchTemplates();
            setIsTemplateModalOpen(false);
        } catch (error) {
            console.error('Error saving template:', error);
            showToast.error('Failed to save template.');
        } finally {
            setSavingTemplate(false);
        }
    };

    const handleDeleteTemplate = async (id: string) => {
        const confirmed = await showDeleteConfirm('this template');
        if (!confirmed) return;
        try {
            const { error } = await supabase
                .from('notification_templates')
                .delete()
                .eq('id', id);
            if (error) throw error;
            setTemplates(templates.filter(t => t.id !== id));
        } catch (error) {
            console.error('Error deleting template:', error);
        }
    };

    const toggleTemplateActive = async (template: NotificationTemplate) => {
        try {
            const { error } = await supabase
                .from('notification_templates')
                .update({ is_active: !template.is_active, updated_at: new Date().toISOString() })
                .eq('id', template.id);
            if (error) throw error;
            setTemplates(templates.map(t => t.id === template.id ? { ...t, is_active: !t.is_active } : t));
        } catch (error) {
            console.error('Error toggling template:', error);
        }
    };


    // User Handlers
    const handleEditUser = (user: UserData) => {
        setEditingUser(user);
        setUserFormData(user);
        setIsUserModalOpen(true);
    };

    const handleDeleteUser = async (id: string) => {
        const confirmed = await showDeleteConfirm('this user');
        if (!confirmed) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setUsers(users.filter(u => u.id !== id));
            showToast.success('User deleted successfully.');
        } catch (error) {
            console.error('Error deleting user:', error);
            showToast.error('Failed to delete user.');
        }
    };

    const handleSaveUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return; // Only editing is supported

        setSavingUser(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: userFormData.full_name,
                    role: userFormData.role,
                    status: userFormData.status,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', editingUser.id);

            if (error) throw error;
            await fetchUsers();
            setIsUserModalOpen(false);
            showToast.success('User updated successfully.');
        } catch (error) {
            console.error('Error saving user:', error);
            showToast.error('Failed to save user.');
        } finally {
            setSavingUser(false);
        }
    };

    // Role Handlers
    const handleEditRole = (role: RoleData) => {
        setEditingRole(role);
        setRoleFormData(role);
        setIsRoleModalOpen(true);
    };

    const handleAddRole = () => {
        setEditingRole(null);
        setRoleFormData({ permissions: [] });
        setIsRoleModalOpen(true);
    };

    const handleDeleteRole = async (id: string) => {
        const confirmed = await showDeleteConfirm('this role');
        if (!confirmed) return;

        try {
            const { error } = await supabase
                .from('roles')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setRoles(roles.filter(r => r.id !== id));
            showToast.success('Role deleted successfully.');
        } catch (error) {
            console.error('Error deleting role:', error);
            showToast.error('Failed to delete role.');
        }
    };

    const handleSaveRole = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingRole(true);

        try {
            if (editingRole) {
                const { error } = await supabase
                    .from('roles')
                    .update({
                        name: roleFormData.name,
                        description: roleFormData.description,
                        permissions: roleFormData.permissions || [],
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', editingRole.id);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('roles')
                    .insert({
                        name: roleFormData.name,
                        description: roleFormData.description,
                        permissions: roleFormData.permissions || [],
                    });

                if (error) throw error;
            }
            await fetchRoles();
            setIsRoleModalOpen(false);
            showToast.success(editingRole ? 'Role updated successfully.' : 'Role created successfully.');
        } catch (error) {
            console.error('Error saving role:', error);
            showToast.error('Failed to save role.');
        } finally {
            setSavingRole(false);
        }
    };

    const togglePermission = (permissionId: string) => {
        const currentPermissions = roleFormData.permissions || [];
        if (currentPermissions.includes(permissionId)) {
            setRoleFormData({ ...roleFormData, permissions: currentPermissions.filter((p: string) => p !== permissionId) });
        } else {
            setRoleFormData({ ...roleFormData, permissions: [...currentPermissions, permissionId] });
        }
    };


    return (
        <div className="w-full space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-500">Manage your dashboard preferences</p>
                </div>
                <button className="flex items-center space-x-2 bg-[#01478c] text-white px-6 py-2.5 rounded-xl hover:bg-blue-800 transition-colors font-medium shadow-lg shadow-blue-200">
                    <Save size={18} />
                    <span>Save Changes</span>
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
                {/* Sidebar Tabs */}
                <div className="w-full md:w-64 border-r border-gray-100 bg-gray-50/50 p-4 space-y-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === tab.id
                                ? 'bg-white text-[#01478c] shadow-sm border border-gray-100'
                                : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'
                                }`}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 p-8">
                    {activeTab === 'general' && (
                        <div className="space-y-6 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4">General Settings</h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Dashboard Name</label>
                                            <input
                                                type="text"
                                                defaultValue="Digital Comrade Admin"
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
                                            <input
                                                type="email"
                                                defaultValue="support@digitalcomrade.com"
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                                        <select className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none">
                                            <option>Pacific Time (US & Canada)</option>
                                            <option>Eastern Time (US & Canada)</option>
                                            <option>UTC</option>
                                            <option>London</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Appearance</h3>
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-white rounded-lg shadow-sm">
                                            <Moon size={20} className="text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Dark Mode</p>
                                            <p className="text-sm text-gray-500">Enable dark theme for dashboard</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'account' && (
                        <div className="space-y-6 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Account Information</h3>
                            <div className="flex items-center space-x-6">
                                <img
                                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                    alt="Profile"
                                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-100"
                                />
                                <div className="space-y-2">
                                    <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 text-sm">
                                        Change Photo
                                    </button>
                                    <p className="text-xs text-gray-500">JPG, GIF or PNG. Max size of 800K</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                    <input type="text" defaultValue="Tom" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                    <input type="text" defaultValue="Cook" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input type="email" defaultValue="tom.cook@example.com" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                                    <textarea rows={3} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Write a few sentences about yourself..."></textarea>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-6 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Security Settings</h3>

                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start space-x-3">
                                <Lock className="text-blue-600 mt-0.5" size={20} />
                                <div>
                                    <h4 className="text-sm font-bold text-blue-900">Password Requirements</h4>
                                    <p className="text-xs text-blue-700 mt-1">Minimum 8 characters long, uppercase & symbol required.</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                    <input type="password" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                    <input type="password" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                    <input type="password" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                                        <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="space-y-6 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Notification Preferences</h3>
                            <div className="space-y-4">
                                {[
                                    { title: 'Email Notifications', desc: 'Receive daily summaries and alerts' },
                                    { title: 'Push Notifications', desc: 'Get real-time updates on your browser' },
                                    { title: 'Marketing Communications', desc: 'Receive updates about new products and features' },
                                    { title: 'Security Alerts', desc: 'Get notified about suspicious activities' }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                                        <div>
                                            <p className="font-medium text-gray-900">{item.title}</p>
                                            <p className="text-sm text-gray-500">{item.desc}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" defaultChecked={idx === 3} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Users</h3>
                                    <p className="text-gray-500 text-sm">Manage platform access. Users register via the login page.</p>
                                </div>
                            </div>

                            {loadingUsers ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="animate-spin text-blue-600" size={32} />
                                </div>
                            ) : users.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <Users size={48} className="mx-auto mb-4 text-gray-300" />
                                    <p>No users found.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {users.map((user: UserData) => (
                                        <div key={user.id} className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all group">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
                                                        alt={user.full_name || 'User'}
                                                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                                    />
                                                    <div>
                                                        <h4 className="font-bold text-gray-900">{user.full_name || 'Unnamed User'}</h4>
                                                        <p className="text-xs text-gray-500">{user.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleEditUser(user)}
                                                        className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                                    >
                                                        <Edit3 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${user.role === 'Admin' || user.role === 'Super Admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                        user.role === 'Developer' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                            'bg-gray-50 text-gray-700 border-gray-200'
                                                        }`}>
                                                        {user.role}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${user.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                                                        }`}>
                                                        {user.status || 'Active'}
                                                    </span>
                                                </div>
                                                <span className="text-gray-400 text-xs">Updated: {new Date(user.updated_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'roles' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Roles & Permissions</h3>
                                    <p className="text-gray-500 text-sm">Define what users can see and do.</p>
                                </div>
                                <button
                                    onClick={handleAddRole}
                                    className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                                >
                                    <Plus size={18} /> Add Role
                                </button>
                            </div>

                            {loadingRoles ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="animate-spin text-blue-600" size={32} />
                                </div>
                            ) : roles.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <Key size={48} className="mx-auto mb-4 text-gray-300" />
                                    <p>No roles found. Create one to get started.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {roles.map((roleItem: RoleData) => (
                                        <div key={roleItem.id} className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-md transition-all group">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold text-gray-900 text-lg">{roleItem.name}</h4>
                                                    <p className="text-gray-500 text-sm mt-1">{roleItem.description}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEditRole(roleItem)}
                                                        className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                                    >
                                                        <Edit3 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteRole(roleItem.id)}
                                                        className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Permissions</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {roleItem.permissions.map((perm: string) => (
                                                        <span key={perm} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                                                            {availablePermissions.find(p => p.id === perm)?.label || perm}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center text-sm text-gray-500">
                                                <span className="text-xs">{roleItem.id.substring(0, 8)}...</span>
                                                <span>{userCounts[roleItem.name] || 0} Users assigned</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Notification Templates Tab */}
                    {activeTab === 'templates' && isAdmin && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Notification Templates</h3>
                                    <p className="text-gray-500 text-sm">Manage system-generated notification templates.</p>
                                </div>
                                <button
                                    onClick={handleAddTemplate}
                                    className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                                >
                                    <Plus size={18} /> Add Template
                                </button>
                            </div>

                            {loadingTemplates ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="animate-spin text-blue-600" size={32} />
                                </div>
                            ) : templates.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                                    <p>No templates found. Create one to get started.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {templates.map(template => (
                                        <div key={template.id} className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-md transition-all group">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h4 className="font-bold text-gray-900 text-lg">{template.name}</h4>
                                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${template.is_active
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-gray-100 text-gray-500'
                                                            }`}>
                                                            {template.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${template.type === 'success' ? 'bg-green-50 text-green-600' :
                                                            template.type === 'warning' ? 'bg-yellow-50 text-yellow-600' :
                                                                template.type === 'error' ? 'bg-red-50 text-red-600' :
                                                                    'bg-blue-50 text-blue-600'
                                                            }`}>
                                                            {template.type}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-1"><strong>Trigger:</strong> {triggerEvents.find(t => t.id === template.trigger_event)?.label || template.trigger_event}</p>
                                                    <p className="text-sm text-gray-600 mb-1"><strong>Title:</strong> {template.title_template}</p>
                                                    <p className="text-sm text-gray-500 truncate"><strong>Message:</strong> {template.message_template}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => toggleTemplateActive(template)}
                                                        className={`p-2 rounded-lg transition-colors ${template.is_active ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-gray-400 bg-gray-50 hover:bg-gray-100'}`}
                                                        title={template.is_active ? 'Deactivate' : 'Activate'}
                                                    >
                                                        {template.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditTemplate(template)}
                                                        className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                                    >
                                                        <Edit3 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteTemplate(template.id)}
                                                        className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <h4 className="font-bold text-blue-900 mb-2">Template Placeholders</h4>
                                <p className="text-sm text-blue-700">Use these placeholders in your templates:</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {['{{user_name}}', '{{item_name}}', '{{amount}}', '{{due_date}}', '{{service_name}}'].map(ph => (
                                        <code key={ph} className="px-2 py-1 bg-white text-blue-800 rounded text-xs font-mono">{ph}</code>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* User Modal */}
            {isUserModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">
                                Edit User
                            </h2>
                            <button onClick={() => setIsUserModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <XCircle size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveUser} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                    value={userFormData.full_name || ''}
                                    onChange={e => setUserFormData({ ...userFormData, full_name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-gray-50"
                                    value={userFormData.email || ''}
                                    disabled
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                    <select
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
                                        value={userFormData.role || 'Visitor'}
                                        onChange={e => setUserFormData({ ...userFormData, role: e.target.value as UserRole })}
                                    >
                                        <option value="Visitor">Visitor</option>
                                        <option value="Customer">Customer</option>
                                        <option value="Client">Client</option>
                                        <option value="Social Media Manager">Social Media Manager</option>
                                        <option value="Developer">Developer</option>
                                        <option value="Admin">Admin</option>
                                        <option value="Super Admin">Super Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
                                        value={userFormData.status || 'Active'}
                                        onChange={e => setUserFormData({ ...userFormData, status: e.target.value })}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                        <option value="On Leave">On Leave</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsUserModalOpen(false)}
                                    className="flex-1 px-4 py-2 text-gray-700 font-bold bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingUser}
                                    className="flex-1 px-4 py-2 text-white font-bold bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {savingUser && <Loader2 className="animate-spin" size={16} />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Role Modal */}
            {isRoleModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingRole ? 'Edit Role' : 'Create Role'}
                            </h2>
                            <button onClick={() => setIsRoleModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <XCircle size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveRole} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                    value={roleFormData.name || ''}
                                    onChange={e => setRoleFormData({ ...roleFormData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                    rows={2}
                                    value={roleFormData.description || ''}
                                    onChange={e => setRoleFormData({ ...roleFormData, description: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                                <div className="space-y-2 max-h-48 overflow-y-auto p-2 border border-gray-100 rounded-xl bg-gray-50">
                                    {availablePermissions.map(perm => (
                                        <label key={perm.id} className="flex items-center space-x-3 p-2 bg-white rounded-lg border border-gray-100 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                checked={(roleFormData.permissions || []).includes(perm.id)}
                                                onChange={() => togglePermission(perm.id)}
                                            />
                                            <span className="text-sm text-gray-700">{perm.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsRoleModalOpen(false)}
                                    className="flex-1 px-4 py-2 text-gray-700 font-bold bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingRole}
                                    className="flex-1 px-4 py-2 text-white font-bold bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {savingRole && <Loader2 className="animate-spin" size={16} />}
                                    {editingRole ? 'Save Role' : 'Create Role'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Template Modal */}
            {isTemplateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-600">
                            <h2 className="text-xl font-bold text-white">
                                {editingTemplate ? 'Edit Template' : 'Create Template'}
                            </h2>
                            <button onClick={() => setIsTemplateModalOpen(false)} className="text-white/80 hover:text-white">
                                <XCircle size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveTemplate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                    value={templateFormData.name || ''}
                                    onChange={e => setTemplateFormData({ ...templateFormData, name: e.target.value })}
                                    placeholder="e.g., Profile Update"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Trigger Event</label>
                                    <select
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none bg-white"
                                        value={templateFormData.trigger_event || ''}
                                        onChange={e => setTemplateFormData({ ...templateFormData, trigger_event: e.target.value })}
                                        required
                                    >
                                        <option value="">Select trigger...</option>
                                        {triggerEvents.map(te => (
                                            <option key={te.id} value={te.id}>{te.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none bg-white"
                                        value={templateFormData.type || 'info'}
                                        onChange={e => setTemplateFormData({ ...templateFormData, type: e.target.value as NotificationType })}
                                    >
                                        <option value="info">Info</option>
                                        <option value="success">Success</option>
                                        <option value="warning">Warning</option>
                                        <option value="error">Error</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title Template</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                    value={templateFormData.title_template || ''}
                                    onChange={e => setTemplateFormData({ ...templateFormData, title_template: e.target.value })}
                                    placeholder="e.g., Profile Updated"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message Template</label>
                                <textarea
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                    rows={3}
                                    value={templateFormData.message_template || ''}
                                    onChange={e => setTemplateFormData({ ...templateFormData, message_template: e.target.value })}
                                    placeholder="e.g., Hello {{user_name}}, your profile was updated."
                                    required
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={templateFormData.is_active ?? true}
                                        onChange={e => setTemplateFormData({ ...templateFormData, is_active: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                                <span className="text-sm text-gray-700">Template is active</span>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsTemplateModalOpen(false)}
                                    className="flex-1 px-4 py-2 text-gray-700 font-bold bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingTemplate}
                                    className="flex-1 px-4 py-2 text-white font-bold bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {savingTemplate && <Loader2 className="animate-spin" size={16} />}
                                    {editingTemplate ? 'Save Template' : 'Create Template'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
