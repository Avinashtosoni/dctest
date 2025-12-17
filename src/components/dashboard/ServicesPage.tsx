import { useState, useEffect } from 'react';
import {
    Briefcase,
    Plus,
    Search,
    MoreVertical,
    CheckCircle2,
    XCircle,
    DollarSign,
    Edit3,
    Trash2,
    Star,
    Package,
    Clock,
    Tag,
    Loader2,
    X,
    Save,
    Eye,
    EyeOff
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { showToast, showDeleteConfirm } from '../../lib/sweetalert';
import {
    ServicePackage,
    ServiceCategory,
    PricingType,
    SERVICE_CATEGORY_LABELS,
    formatCurrency,
    CurrencyCode
} from '../../types/ecommerce';

const CATEGORIES: ServiceCategory[] = ['social_media', 'website', 'app', 'marketing', 'design', 'other'];

export default function ServicesPage() {
    const { role } = useAuth();
    const isAdmin = role === 'Admin' || role === 'Super Admin';

    const [packages, setPackages] = useState<ServicePackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<ServiceCategory | 'all'>('all');
    const [typeFilter, setTypeFilter] = useState<PricingType | 'all'>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null);
    const [saving, setSaving] = useState(false);
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        short_description: '',
        category: 'other' as ServiceCategory,
        pricing_type: 'subscription' as PricingType,
        currency: 'INR',
        monthly_price: '',
        quarterly_price: '',
        yearly_price: '',
        one_time_price: '',
        support_duration_days: '30',
        features: [''],
        is_featured: false,
        is_active: true
    });

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        setLoading(true);
        try {
            // For non-admin users, first get their subscribed package IDs
            let subscribedPackageIds: string[] = [];
            if (!isAdmin) {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: subscriptions } = await supabase
                        .from('subscriptions')
                        .select('package_id')
                        .eq('user_id', user.id)
                        .in('status', ['active', 'paused']);
                    subscribedPackageIds = subscriptions?.map(s => s.package_id) || [];
                }
            }

            const { data, error } = await supabase
                .from('service_packages')
                .select('*')
                .eq('pricing_type', 'subscription')
                .order('sort_order', { ascending: true });

            if (error) throw error;

            // Filter packages based on role
            let packageList = data || [];
            if (!isAdmin) {
                packageList = packageList.filter(p => subscribedPackageIds.includes(p.id));
            }
            setPackages(packageList);
        } catch (error) {
            console.error('Error fetching packages:', error);
            showToast.error('Failed to load service packages');
        } finally {
            setLoading(false);
        }
    };

    const filteredPackages = packages.filter(pkg => {
        const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pkg.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || pkg.category === categoryFilter;
        const matchesType = typeFilter === 'all' || pkg.pricing_type === typeFilter;
        return matchesSearch && matchesCategory && matchesType;
    });

    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    };

    const resetForm = () => {
        setFormData({
            name: '',
            slug: '',
            description: '',
            short_description: '',
            category: 'other',
            pricing_type: 'subscription',
            currency: 'INR',
            monthly_price: '',
            quarterly_price: '',
            yearly_price: '',
            one_time_price: '',
            support_duration_days: '30',
            features: [''],
            is_featured: false,
            is_active: true
        });
        setEditingPackage(null);
    };

    const openEditModal = (pkg: ServicePackage) => {
        setEditingPackage(pkg);
        setFormData({
            name: pkg.name,
            slug: pkg.slug,
            description: pkg.description || '',
            short_description: pkg.short_description || '',
            category: pkg.category,
            pricing_type: pkg.pricing_type,
            currency: pkg.currency,
            monthly_price: pkg.monthly_price ? (pkg.monthly_price / 100).toString() : '',
            quarterly_price: pkg.quarterly_price ? (pkg.quarterly_price / 100).toString() : '',
            yearly_price: pkg.yearly_price ? (pkg.yearly_price / 100).toString() : '',
            one_time_price: pkg.one_time_price ? (pkg.one_time_price / 100).toString() : '',
            support_duration_days: pkg.support_duration_days.toString(),
            features: pkg.features.length > 0 ? pkg.features : [''],
            is_featured: pkg.is_featured,
            is_active: pkg.is_active
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAdmin) return;

        setSaving(true);
        try {
            const slug = formData.slug || generateSlug(formData.name);
            const payload = {
                name: formData.name,
                slug,
                description: formData.description || null,
                short_description: formData.short_description || null,
                category: formData.category,
                pricing_type: formData.pricing_type,
                currency: formData.currency,
                monthly_price: formData.monthly_price ? Math.round(parseFloat(formData.monthly_price) * 100) : null,
                quarterly_price: formData.quarterly_price ? Math.round(parseFloat(formData.quarterly_price) * 100) : null,
                yearly_price: formData.yearly_price ? Math.round(parseFloat(formData.yearly_price) * 100) : null,
                one_time_price: formData.one_time_price ? Math.round(parseFloat(formData.one_time_price) * 100) : null,
                support_duration_days: parseInt(formData.support_duration_days) || 30,
                features: formData.features.filter(f => f.trim() !== ''),
                is_featured: formData.is_featured,
                is_active: formData.is_active,
                updated_at: new Date().toISOString()
            };

            if (editingPackage) {
                const { error } = await supabase
                    .from('service_packages')
                    .update(payload)
                    .eq('id', editingPackage.id);
                if (error) throw error;
                showToast.success('Service package updated successfully');
            } else {
                const { error } = await supabase
                    .from('service_packages')
                    .insert(payload);
                if (error) throw error;
                showToast.success('Service package created successfully');
            }

            setIsModalOpen(false);
            resetForm();
            fetchPackages();
        } catch (error: any) {
            console.error('Error saving package:', error);
            showToast.error(error.message || 'Failed to save service package');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (pkg: ServicePackage) => {
        const confirmed = await showDeleteConfirm(`the "${pkg.name}" package`);
        if (!confirmed) return;

        try {
            const { error } = await supabase
                .from('service_packages')
                .delete()
                .eq('id', pkg.id);
            if (error) throw error;
            showToast.success('Package deleted successfully');
            fetchPackages();
        } catch (error) {
            console.error('Error deleting package:', error);
            showToast.error('Failed to delete package');
        }
        setMenuOpenId(null);
    };

    const toggleActive = async (pkg: ServicePackage) => {
        try {
            const { error } = await supabase
                .from('service_packages')
                .update({ is_active: !pkg.is_active })
                .eq('id', pkg.id);
            if (error) throw error;
            showToast.success(`Package ${pkg.is_active ? 'deactivated' : 'activated'}`);
            fetchPackages();
        } catch (error) {
            console.error('Error toggling status:', error);
            showToast.error('Failed to update status');
        }
        setMenuOpenId(null);
    };

    const addFeature = () => {
        setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
    };

    const updateFeature = (index: number, value: string) => {
        const newFeatures = [...formData.features];
        newFeatures[index] = value;
        setFormData(prev => ({ ...prev, features: newFeatures }));
    };

    const removeFeature = (index: number) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }));
    };

    const getDisplayPrice = (pkg: ServicePackage): string => {
        if (pkg.pricing_type === 'one_time' && pkg.one_time_price) {
            return formatCurrency(pkg.one_time_price, pkg.currency as CurrencyCode);
        }
        if (pkg.monthly_price) {
            return `${formatCurrency(pkg.monthly_price, pkg.currency as CurrencyCode)}/mo`;
        }
        return 'Free';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg">
                        <Briefcase size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {isAdmin ? 'Service Packages' : 'My Subscriptions'}
                        </h1>
                        <p className="text-sm text-gray-500">
                            {isAdmin ? 'Manage your service offerings and pricing' : 'Services you are subscribed to'}
                        </p>
                    </div>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => { resetForm(); setIsModalOpen(true); }}
                        className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-lg shadow-blue-200"
                    >
                        <Plus size={18} />
                        <span>Add Package</span>
                    </button>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <Package size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{packages.length}</p>
                            <p className="text-xs text-gray-500">Total Packages</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                            <CheckCircle2 size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{packages.filter(p => p.is_active).length}</p>
                            <p className="text-xs text-gray-500">Active</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                            <Clock size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{packages.filter(p => p.pricing_type === 'subscription').length}</p>
                            <p className="text-xs text-gray-500">Subscriptions</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                            <Star size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{packages.filter(p => p.is_featured).length}</p>
                            <p className="text-xs text-gray-500">Featured</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search packages..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                </div>
                <div className="flex gap-3">
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value as ServiceCategory | 'all')}
                        className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                    >
                        <option value="all">All Categories</option>
                        {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{SERVICE_CATEGORY_LABELS[cat]}</option>
                        ))}
                    </select>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value as PricingType | 'all')}
                        className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                    >
                        <option value="all">All Types</option>
                        <option value="subscription">Subscription</option>
                        <option value="one_time">One-time</option>
                    </select>
                </div>
            </div>

            {/* Packages Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
            ) : filteredPackages.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                    <Package size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {isAdmin ? 'No Packages Found' : 'No Active Subscriptions'}
                    </h3>
                    <p className="text-gray-500">
                        {isAdmin
                            ? 'Get started by adding your first service package.'
                            : 'You don\'t have any active subscriptions. Visit our services page to explore available plans.'}
                    </p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPackages.map(pkg => (
                        <div
                            key={pkg.id}
                            className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${pkg.is_featured ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-100'
                                } ${!pkg.is_active ? 'opacity-60' : ''}`}
                        >
                            {/* Package Header */}
                            <div className="p-5 border-b border-gray-100">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        {pkg.is_featured && (
                                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full flex items-center gap-1">
                                                <Star size={12} /> Featured
                                            </span>
                                        )}
                                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${pkg.pricing_type === 'subscription'
                                            ? 'bg-purple-100 text-purple-700'
                                            : 'bg-green-100 text-green-700'
                                            }`}>
                                            {pkg.pricing_type === 'subscription' ? 'Subscription' : 'One-time'}
                                        </span>
                                    </div>
                                    {isAdmin && (
                                        <div className="relative">
                                            <button
                                                onClick={() => setMenuOpenId(menuOpenId === pkg.id ? null : pkg.id)}
                                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                                            >
                                                <MoreVertical size={18} />
                                            </button>
                                            {menuOpenId === pkg.id && (
                                                <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10">
                                                    <button
                                                        onClick={() => { openEditModal(pkg); setMenuOpenId(null); }}
                                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                    >
                                                        <Edit3 size={14} /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => toggleActive(pkg)}
                                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                    >
                                                        {pkg.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                                                        {pkg.is_active ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(pkg)}
                                                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                    >
                                                        <Trash2 size={14} /> Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">{pkg.name}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2">{pkg.short_description || pkg.description}</p>
                            </div>

                            {/* Pricing */}
                            <div className="px-5 py-4 bg-gray-50">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-gray-900">{getDisplayPrice(pkg)}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                    <Tag size={12} />
                                    <span>{SERVICE_CATEGORY_LABELS[pkg.category]}</span>
                                    {pkg.pricing_type === 'one_time' && (
                                        <>
                                            <span>•</span>
                                            <span>{pkg.support_duration_days} days support</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Features */}
                            <div className="p-5">
                                <ul className="space-y-2">
                                    {pkg.features.slice(0, 4).map((feature, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                            <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                    {pkg.features.length > 4 && (
                                        <li className="text-sm text-blue-600 font-medium">
                                            +{pkg.features.length - 4} more features
                                        </li>
                                    )}
                                </ul>
                            </div>

                            {/* Status */}
                            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                                <span className={`flex items-center gap-1.5 text-xs font-medium ${pkg.is_active ? 'text-green-600' : 'text-gray-400'
                                    }`}>
                                    {pkg.is_active ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                                    {pkg.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {isModalOpen && isAdmin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden my-8">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-600">
                            <h2 className="font-bold text-lg text-white">
                                {editingPackage ? 'Edit Service Package' : 'Create Service Package'}
                            </h2>
                            <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="text-white/80 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Package Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            name: e.target.value,
                                            slug: prev.slug || generateSlug(e.target.value)
                                        }))}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        placeholder="e.g. Social Media Pro"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as ServiceCategory }))}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{SERVICE_CATEGORY_LABELS[cat]}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Pricing Type *</label>
                                    <select
                                        value={formData.pricing_type}
                                        onChange={(e) => setFormData(prev => ({ ...prev, pricing_type: e.target.value as PricingType }))}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    >
                                        <option value="subscription">Subscription</option>
                                        <option value="one_time">One-time Purchase</option>
                                    </select>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                                <input
                                    type="text"
                                    value={formData.short_description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, short_description: e.target.value }))}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="Brief tagline for this package"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Description</label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                                    placeholder="Detailed description of what's included"
                                />
                            </div>

                            {/* Pricing */}
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <DollarSign size={16} /> Pricing
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Currency</label>
                                        <select
                                            value={formData.currency}
                                            onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                                        >
                                            <option value="INR">INR (₹)</option>
                                            <option value="USD">USD ($)</option>
                                        </select>
                                    </div>
                                    {formData.pricing_type === 'subscription' ? (
                                        <>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Monthly Price</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={formData.monthly_price}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, monthly_price: e.target.value }))}
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                                    placeholder="4999.00"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Quarterly Price</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={formData.quarterly_price}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, quarterly_price: e.target.value }))}
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                                    placeholder="13999.00"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Yearly Price</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={formData.yearly_price}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, yearly_price: e.target.value }))}
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                                    placeholder="49990.00"
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">One-time Price *</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    required
                                                    value={formData.one_time_price}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, one_time_price: e.target.value }))}
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                                    placeholder="24999.00"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Support Duration (days)</label>
                                                <input
                                                    type="number"
                                                    value={formData.support_duration_days}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, support_duration_days: e.target.value }))}
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                                    placeholder="30"
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Features */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
                                <div className="space-y-2">
                                    {formData.features.map((feature, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={feature}
                                                onChange={(e) => updateFeature(index, e.target.value)}
                                                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                                                placeholder={`Feature ${index + 1}`}
                                            />
                                            {formData.features.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeFeature(index)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                >
                                                    <X size={18} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={addFeature}
                                    className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                >
                                    <Plus size={14} /> Add Feature
                                </button>
                            </div>

                            {/* Options */}
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_featured}
                                        onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">Featured Package</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">Active</span>
                                </label>
                            </div>
                        </form>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => { setIsModalOpen(false); resetForm(); }}
                                className="px-5 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={saving || !formData.name}
                                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-medium flex items-center gap-2 disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                {editingPackage ? 'Update Package' : 'Create Package'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
