import { useState, useEffect } from 'react';
import {
    Ticket,
    Plus,
    Search,
    MoreVertical,
    Calendar,
    Loader2,
    X,
    Save,
    Percent,
    DollarSign,
    Copy,
    CheckCircle,
    XCircle,
    Edit3,
    Trash2,
    Tag,
    Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { showToast, showDeleteConfirm } from '../../lib/sweetalert';
import {
    Coupon,
    DiscountType,
    ServiceCategory,
    SERVICE_CATEGORY_LABELS,
    formatCurrency,
    CurrencyCode
} from '../../types/ecommerce';

export default function CouponsPage() {
    const { role, user } = useAuth();
    const isAdmin = role === 'Admin' || role === 'Super Admin';

    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
    const [saving, setSaving] = useState(false);
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discount_type: 'percentage' as DiscountType,
        discount_value: '',
        max_uses: '',
        max_uses_per_user: '1',
        min_order_amount: '',
        valid_from: '',
        valid_until: '',
        is_active: true
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('coupons')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCoupons(data || []);
        } catch (error) {
            console.error('Error fetching coupons:', error);
            showToast.error('Failed to load coupons');
        } finally {
            setLoading(false);
        }
    };

    const filteredCoupons = coupons.filter(coupon => {
        return coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            coupon.description?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData(prev => ({ ...prev, code }));
    };

    const resetForm = () => {
        setFormData({
            code: '',
            description: '',
            discount_type: 'percentage',
            discount_value: '',
            max_uses: '',
            max_uses_per_user: '1',
            min_order_amount: '',
            valid_from: '',
            valid_until: '',
            is_active: true
        });
        setEditingCoupon(null);
    };

    const openEditModal = (coupon: Coupon) => {
        setEditingCoupon(coupon);
        setFormData({
            code: coupon.code,
            description: coupon.description || '',
            discount_type: coupon.discount_type,
            discount_value: coupon.discount_type === 'percentage'
                ? coupon.discount_value.toString()
                : (coupon.discount_value / 100).toString(),
            max_uses: coupon.max_uses?.toString() || '',
            max_uses_per_user: coupon.max_uses_per_user.toString(),
            min_order_amount: coupon.min_order_amount ? (coupon.min_order_amount / 100).toString() : '',
            valid_from: coupon.valid_from ? new Date(coupon.valid_from).toISOString().slice(0, 16) : '',
            valid_until: coupon.valid_until ? new Date(coupon.valid_until).toISOString().slice(0, 16) : '',
            is_active: coupon.is_active
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAdmin) return;

        setSaving(true);
        try {
            const payload = {
                code: formData.code.toUpperCase(),
                description: formData.description || null,
                discount_type: formData.discount_type,
                discount_value: formData.discount_type === 'percentage'
                    ? parseInt(formData.discount_value)
                    : Math.round(parseFloat(formData.discount_value) * 100),
                max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
                max_uses_per_user: parseInt(formData.max_uses_per_user) || 1,
                min_order_amount: formData.min_order_amount ? Math.round(parseFloat(formData.min_order_amount) * 100) : null,
                valid_from: formData.valid_from || new Date().toISOString(),
                valid_until: formData.valid_until || null,
                is_active: formData.is_active,
                updated_at: new Date().toISOString()
            };

            if (editingCoupon) {
                const { error } = await supabase
                    .from('coupons')
                    .update(payload)
                    .eq('id', editingCoupon.id);
                if (error) throw error;
                showToast.success('Coupon updated successfully');
            } else {
                const { error } = await supabase
                    .from('coupons')
                    .insert({ ...payload, created_by: user?.id });
                if (error) throw error;
                showToast.success('Coupon created successfully');
            }

            setIsModalOpen(false);
            resetForm();
            fetchCoupons();
        } catch (error: any) {
            console.error('Error saving coupon:', error);
            showToast.error(error.message || 'Failed to save coupon');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (coupon: Coupon) => {
        const confirmed = await showDeleteConfirm(`the "${coupon.code}" coupon`);
        if (!confirmed) return;

        try {
            const { error } = await supabase
                .from('coupons')
                .delete()
                .eq('id', coupon.id);
            if (error) throw error;
            showToast.success('Coupon deleted');
            fetchCoupons();
        } catch (error) {
            console.error('Error deleting coupon:', error);
            showToast.error('Failed to delete coupon');
        }
        setMenuOpenId(null);
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const isExpired = (coupon: Coupon) => {
        return coupon.valid_until && new Date(coupon.valid_until) < new Date();
    };

    const isMaxedOut = (coupon: Coupon) => {
        return coupon.max_uses && coupon.uses_count >= coupon.max_uses;
    };

    const formatDate = (date: string | null) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-xl shadow-lg">
                        <Ticket size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
                        <p className="text-sm text-gray-500">Manage discount codes</p>
                    </div>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => { resetForm(); setIsModalOpen(true); }}
                        className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-5 py-2.5 rounded-xl hover:from-orange-600 hover:to-red-700 transition-all font-medium shadow-lg shadow-orange-200"
                    >
                        <Plus size={18} />
                        <span>Create Coupon</span>
                    </button>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <Ticket size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{coupons.length}</p>
                            <p className="text-xs text-gray-500">Total Coupons</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                            <CheckCircle size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">
                                {coupons.filter(c => c.is_active && !isExpired(c) && !isMaxedOut(c)).length}
                            </p>
                            <p className="text-xs text-gray-500">Active</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                            <Users size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">
                                {coupons.reduce((sum, c) => sum + c.uses_count, 0)}
                            </p>
                            <p className="text-xs text-gray-500">Total Uses</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                            <XCircle size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">
                                {coupons.filter(c => isExpired(c) || isMaxedOut(c)).length}
                            </p>
                            <p className="text-xs text-gray-500">Expired/Maxed</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Search coupons..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
            </div>

            {/* Coupons Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
            ) : filteredCoupons.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                    <Ticket size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No coupons found</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCoupons.map(coupon => {
                        const expired = isExpired(coupon);
                        const maxed = isMaxedOut(coupon);
                        const isValid = coupon.is_active && !expired && !maxed;

                        return (
                            <div
                                key={coupon.id}
                                className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${isValid ? 'border-gray-100 hover:shadow-md' : 'border-gray-200 opacity-60'
                                    }`}
                            >
                                {/* Coupon Header with perforated edge effect */}
                                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 relative">
                                    <div className="absolute left-0 top-0 bottom-0 w-4 flex flex-col justify-around">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className="w-4 h-4 bg-white rounded-full -ml-2" />
                                        ))}
                                    </div>
                                    <div className="ml-4 flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-mono font-bold text-xl text-white tracking-wider">
                                                    {coupon.code}
                                                </span>
                                                <button
                                                    onClick={() => copyCode(coupon.code)}
                                                    className="p-1 text-white/70 hover:text-white rounded"
                                                    title="Copy code"
                                                >
                                                    {copiedCode === coupon.code ? <CheckCircle size={16} /> : <Copy size={16} />}
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {coupon.discount_type === 'percentage' ? (
                                                    <span className="flex items-center gap-1 text-white font-semibold">
                                                        <Percent size={14} /> {coupon.discount_value}% OFF
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-white font-semibold">
                                                        {formatCurrency(coupon.discount_value, 'INR')} OFF
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {isAdmin && (
                                            <div className="relative">
                                                <button
                                                    onClick={() => setMenuOpenId(menuOpenId === coupon.id ? null : coupon.id)}
                                                    className="p-1.5 text-white/70 hover:text-white hover:bg-white/20 rounded-lg"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>
                                                {menuOpenId === coupon.id && (
                                                    <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10">
                                                        <button
                                                            onClick={() => { openEditModal(coupon); setMenuOpenId(null); }}
                                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                        >
                                                            <Edit3 size={14} /> Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(coupon)}
                                                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                        >
                                                            <Trash2 size={14} /> Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Coupon Body */}
                                <div className="p-4 space-y-3">
                                    {coupon.description && (
                                        <p className="text-sm text-gray-600">{coupon.description}</p>
                                    )}

                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="flex items-center gap-1.5 text-gray-500">
                                            <Users size={12} />
                                            <span>{coupon.uses_count}{coupon.max_uses ? `/${coupon.max_uses}` : ''} uses</span>
                                        </div>
                                        {coupon.min_order_amount && (
                                            <div className="flex items-center gap-1.5 text-gray-500">
                                                <DollarSign size={12} />
                                                <span>Min {formatCurrency(coupon.min_order_amount, 'INR')}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1.5 text-gray-500">
                                            <Calendar size={12} />
                                            <span>From {formatDate(coupon.valid_from)}</span>
                                        </div>
                                        {coupon.valid_until && (
                                            <div className={`flex items-center gap-1.5 ${expired ? 'text-red-500' : 'text-gray-500'}`}>
                                                <Calendar size={12} />
                                                <span>Until {formatDate(coupon.valid_until)}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Status */}
                                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                                        <span className={`flex items-center gap-1.5 text-xs font-medium ${isValid ? 'text-green-600' : 'text-gray-400'
                                            }`}>
                                            {isValid ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                            {expired ? 'Expired' : maxed ? 'Maxed Out' : !coupon.is_active ? 'Inactive' : 'Active'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create/Edit Modal */}
            {isModalOpen && isAdmin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden my-8">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-orange-500 to-red-600">
                            <h2 className="font-bold text-lg text-white">
                                {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
                            </h2>
                            <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="text-white/80 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Code */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code *</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        required
                                        value={formData.code}
                                        onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono uppercase"
                                        placeholder="SUMMER20"
                                    />
                                    <button
                                        type="button"
                                        onClick={generateCode}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm"
                                    >
                                        Generate
                                    </button>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="Summer sale discount"
                                />
                            </div>

                            {/* Discount */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type *</label>
                                    <select
                                        value={formData.discount_type}
                                        onChange={(e) => setFormData(prev => ({ ...prev, discount_type: e.target.value as DiscountType }))}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {formData.discount_type === 'percentage' ? 'Discount %' : 'Amount (₹)'} *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        max={formData.discount_type === 'percentage' ? 100 : undefined}
                                        value={formData.discount_value}
                                        onChange={(e) => setFormData(prev => ({ ...prev, discount_value: e.target.value }))}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        placeholder={formData.discount_type === 'percentage' ? '20' : '500'}
                                    />
                                </div>
                            </div>

                            {/* Usage Limits */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Total Uses</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.max_uses}
                                        onChange={(e) => setFormData(prev => ({ ...prev, max_uses: e.target.value }))}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        placeholder="Unlimited"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Per User</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.max_uses_per_user}
                                        onChange={(e) => setFormData(prev => ({ ...prev, max_uses_per_user: e.target.value }))}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        placeholder="1"
                                    />
                                </div>
                            </div>

                            {/* Min Order */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Order Amount (₹)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.min_order_amount}
                                    onChange={(e) => setFormData(prev => ({ ...prev, min_order_amount: e.target.value }))}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="No minimum"
                                />
                            </div>

                            {/* Validity */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Valid From</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.valid_from}
                                        onChange={(e) => setFormData(prev => ({ ...prev, valid_from: e.target.value }))}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.valid_until}
                                        onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                                    />
                                </div>
                            </div>

                            {/* Active */}
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">Active</span>
                            </label>
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
                                disabled={saving || !formData.code || !formData.discount_value}
                                className="px-5 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 font-medium flex items-center gap-2 disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                {editingCoupon ? 'Update' : 'Create'} Coupon
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
