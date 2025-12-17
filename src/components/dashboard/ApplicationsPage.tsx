import {
    LayoutGrid,
    Search,
    Filter,
    ArrowUpRight,
    Users,
    Activity,
    Clock,
    Zap,
    Image as ImageIcon,
    Search as SearchIcon,
    Calculator,
    Share2,
    CreditCard,
    BarChart3,
    Smartphone,
    Loader2,
    AlertCircle,
    Plus,
    X,
    Edit2,
    Trash2,
    MoreVertical
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import Swal from 'sweetalert2';
import { showDeleteConfirm } from '../../lib/sweetalert';

interface Application {
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
    users: number;
    trend: string | null;
    status: 'Active' | 'Maintenance' | 'Inactive';
    color: string | null;
    url: string | null;
    visible: boolean;
    display_order: number;
    created_at?: string;
    updated_at?: string;
}

interface DashboardStats {
    total_monthly_usage: number;
    active_users_today: number;
    avg_session_seconds: number;
    success_rate: number;
}

// Icon mapping for lucide-react
const iconMap: Record<string, any> = {
    ImageIcon,
    CreditCard,
    SearchIcon,
    Share2,
    Calculator,
    BarChart3,
    Smartphone,
    LayoutGrid,
};

const iconOptions = ['ImageIcon', 'CreditCard', 'SearchIcon', 'Share2', 'Calculator', 'BarChart3', 'Smartphone', 'LayoutGrid'];
const colorOptions = [
    { label: 'Blue', value: 'text-blue-600 bg-blue-50' },
    { label: 'Purple', value: 'text-purple-600 bg-purple-50' },
    { label: 'Green', value: 'text-green-600 bg-green-50' },
    { label: 'Pink', value: 'text-pink-600 bg-pink-50' },
    { label: 'Orange', value: 'text-orange-600 bg-orange-50' },
    { label: 'Indigo', value: 'text-indigo-600 bg-indigo-50' },
    { label: 'Red', value: 'text-red-600 bg-red-50' },
];

export default function ApplicationsPage() {
    const [apps, setApps] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats | null>(null);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingApp, setEditingApp] = useState<Application | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

    // Form data
    const [formData, setFormData] = useState<Partial<Application>>({
        name: '',
        description: '',
        icon: 'LayoutGrid',
        status: 'Active',
        color: 'text-blue-600 bg-blue-50',
        url: '',
        visible: true
    });

    useEffect(() => {
        fetchApplications();
        fetchDashboardStats();
    }, []);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            // Fetch from analytics view to get real metrics
            const { data, error } = await supabase
                .from('application_analytics')
                .select('*')
                .order('id');

            if (error) throw error;

            // Map analytics data to Application format
            const appsData = data?.map((app: any) => ({
                id: app.id,
                name: app.name,
                description: app.description,
                icon: app.icon,
                users: app.monthly_active_users || 0,
                trend: app.trend || '+0%',
                status: app.status,
                color: app.color,
                url: app.url,
                visible: true,
                display_order: 0
            })) || [];

            setApps(appsData);
        } catch (error: any) {
            console.error('Error fetching applications:', error);
            Swal.fire('Error', 'Failed to load applications', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchDashboardStats = async () => {
        try {
            const { data, error } = await supabase
                .from('application_dashboard_stats')
                .select('*')
                .single();

            if (error) throw error;
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const openCreateModal = () => {
        setEditingApp(null);
        setFormData({
            name: '',
            description: '',
            icon: 'LayoutGrid',
            status: 'Active',
            color: 'text-blue-600 bg-blue-50',
            url: '',
            visible: true
        });
        setIsModalOpen(true);
    };

    const openEditModal = (app: Application) => {
        setEditingApp(app);
        setFormData(app);
        setIsModalOpen(true);
        setMenuOpenId(null);
    };

    const handleDelete = async (id: string) => {
        const confirmed = await showDeleteConfirm('this application');
        if (confirmed) {
            try {
                const { error } = await supabase
                    .from('applications')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                setApps(prev => prev.filter(a => a.id !== id));
                Swal.fire('Deleted!', 'Application has been deleted.', 'success');
            } catch (error: any) {
                console.error('Error deleting application:', error);
                Swal.fire('Error', 'Failed to delete application', 'error');
            }
        }
        setMenuOpenId(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (editingApp) {
                // Update existing app
                const { data, error } = await supabase
                    .from('applications')
                    .update({
                        name: formData.name,
                        description: formData.description,
                        icon: formData.icon,
                        status: formData.status,
                        color: formData.color,
                        url: formData.url,
                        visible: formData.visible
                    })
                    .eq('id', editingApp.id)
                    .select()
                    .single();

                if (error) throw error;

                await fetchApplications(); // Refresh to get updated analytics
                Swal.fire('Success!', 'Application updated successfully', 'success');
            } else {
                // Create new app
                const { data, error } = await supabase
                    .from('applications')
                    .insert([{
                        name: formData.name,
                        description: formData.description,
                        icon: formData.icon,
                        status: formData.status,
                        color: formData.color,
                        url: formData.url,
                        visible: formData.visible,
                        display_order: apps.length + 1
                    }])
                    .select()
                    .single();

                if (error) throw error;

                await fetchApplications(); // Refresh to get new app
                Swal.fire('Success!', 'Application created successfully', 'success');
            }

            setIsModalOpen(false);
        } catch (error: any) {
            console.error('Error saving application:', error);
            Swal.fire('Error', error.message || 'Failed to save application', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Format session duration
    const formatDuration = (seconds: number | null) => {
        if (!seconds) return '0s';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    };

    return (
        <div className="w-full space-y-8 animate-in fade-in zoom-in-95 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <LayoutGrid className="text-blue-600" size={32} />
                        Applications
                    </h1>
                    <p className="text-gray-500 mt-2 text-lg">Monitor usage and manage your integrated tools.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={openCreateModal}
                        className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Add New App
                    </button>
                </div>
            </div>

            {/* Analytics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    {
                        label: 'Total App Usage',
                        value: stats?.total_monthly_usage?.toLocaleString() || '0',
                        sub: 'Runs this month',
                        icon: Zap,
                        color: 'text-yellow-600 bg-yellow-50'
                    },
                    {
                        label: 'Active Users',
                        value: stats?.active_users_today?.toLocaleString() || '0',
                        sub: 'Unique users today',
                        icon: Users,
                        color: 'text-blue-600 bg-blue-50'
                    },
                    {
                        label: 'Avg. Session',
                        value: formatDuration(stats?.avg_session_seconds || 0),
                        sub: 'Time per tool',
                        icon: Clock,
                        color: 'text-indigo-600 bg-indigo-50'
                    },
                    {
                        label: 'Success Rate',
                        value: `${stats?.success_rate || 0}%`,
                        sub: 'Completed tasks',
                        icon: Activity,
                        color: 'text-green-600 bg-green-50'
                    },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                        <p className="text-sm font-semibold text-gray-500 mt-1">{stat.label}</p>
                        <p className="text-xs text-gray-400 mt-2">{stat.sub}</p>
                    </div>
                ))}
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                </div>
            ) : apps.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                    <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications yet</h3>
                    <p className="text-gray-500 mb-6">Add your first application to get started</p>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all"
                    >
                        <Plus size={18} />
                        Add Application
                    </button>
                </div>
            ) : (
                <>
                    {/* Apps Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {apps.map((app) => (
                            <div key={app.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group">
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`p-4 rounded-2xl ${app.color || 'text-gray-600 bg-gray-50'} group-hover:scale-110 transition-transform duration-300`}>
                                        {iconMap[app.icon || 'LayoutGrid'] ?
                                            (() => {
                                                const Icon = iconMap[app.icon || 'LayoutGrid'];
                                                return <Icon size={32} />;
                                            })()
                                            : <LayoutGrid size={32} />
                                        }
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${app.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' :
                                                app.status === 'Maintenance' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                    'bg-gray-50 text-gray-700 border-gray-200'
                                            }`}>
                                            {app.status}
                                        </span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === app.id ? null : app.id); }}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <MoreVertical size={16} className="text-gray-600" />
                                        </button>
                                        {menuOpenId === app.id && (
                                            <div className="absolute right-6 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 z-10 overflow-hidden">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); openEditModal(app); }}
                                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                >
                                                    <Edit2 size={14} /> Edit
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(app.id); }}
                                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                >
                                                    <Trash2 size={14} /> Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{app.name}</h3>
                                <p className="text-gray-500 text-sm mb-6 line-clamp-2">{app.description}</p>

                                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                    <div>
                                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Monthly Users</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="font-bold text-gray-900">{app.users}</span>
                                            <span className="text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded flex items-center">
                                                <ArrowUpRight size={10} className="mr-0.5" /> {app.trend}
                                            </span>
                                        </div>
                                    </div>
                                    {app.url && (
                                        <a
                                            href={app.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 bg-gray-50 text-gray-700 font-bold rounded-xl text-sm hover:bg-blue-600 hover:text-white transition-all"
                                        >
                                            Open App
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="font-bold text-lg text-gray-900">{editingApp ? 'Edit Application' : 'New Application'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Application Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.name || ''}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Maintenance">Maintenance</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none h-20"
                                    value={formData.description || ''}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                                    <select
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.icon}
                                        onChange={e => setFormData({ ...formData, icon: e.target.value })}
                                    >
                                        {iconOptions.map(icon => (
                                            <option key={icon} value={icon}>{icon}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                                    <select
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.color}
                                        onChange={e => setFormData({ ...formData, color: e.target.value })}
                                    >
                                        {colorOptions.map(color => (
                                            <option key={color.value} value={color.value}>{color.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">URL (Optional)</label>
                                <input
                                    type="url"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.url || ''}
                                    onChange={e => setFormData({ ...formData, url: e.target.value })}
                                    placeholder="https://"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="visible"
                                    checked={formData.visible}
                                    onChange={e => setFormData({ ...formData, visible: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <label htmlFor="visible" className="text-sm font-medium text-gray-700">Visible to users</label>
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                                    {editingApp ? 'Update Application' : 'Create Application'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
