import { useState, useEffect } from 'react';
import {
    RefreshCcw,
    Search,
    Filter,
    MoreVertical,
    Calendar,
    User,
    Package,
    Loader2,
    X,
    PauseCircle,
    PlayCircle,
    XCircle,
    Clock,
    CreditCard,
    TrendingUp,
    AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { showToast, showConfirm } from '../../lib/sweetalert';
import {
    Subscription,
    SubscriptionStatus,
    BillingCycle,
    SUBSCRIPTION_STATUS_LABELS,
    formatCurrency,
    CurrencyCode
} from '../../types/ecommerce';

const STATUS_COLORS: Record<SubscriptionStatus, string> = {
    active: 'bg-green-100 text-green-700',
    paused: 'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-gray-100 text-gray-700',
    expired: 'bg-red-100 text-red-700',
    past_due: 'bg-orange-100 text-orange-700'
};

export default function SubscriptionsPage() {
    const { role } = useAuth();
    const isAdmin = role === 'Admin' || role === 'Super Admin';

    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | 'all'>('all');
    const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        mrr: 0,
        churnRate: 0
    });

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('subscriptions')
                .select(`
                    *,
                    package:service_packages(id, name, slug, category),
                    user:profiles(id, email, full_name)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const subs = data || [];
            setSubscriptions(subs);

            // Calculate stats
            const active = subs.filter(s => s.status === 'active');
            const cancelled = subs.filter(s => s.status === 'cancelled');
            const mrr = active.reduce((sum, s) => {
                if (s.billing_cycle === 'monthly') return sum + s.amount;
                if (s.billing_cycle === 'quarterly') return sum + (s.amount / 3);
                if (s.billing_cycle === 'yearly') return sum + (s.amount / 12);
                return sum;
            }, 0);

            setStats({
                total: subs.length,
                active: active.length,
                mrr,
                churnRate: subs.length > 0 ? (cancelled.length / subs.length) * 100 : 0
            });
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
            showToast.error('Failed to load subscriptions');
        } finally {
            setLoading(false);
        }
    };

    const filteredSubscriptions = subscriptions.filter(sub => {
        const matchesSearch =
            (sub.user as any)?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (sub.user as any)?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (sub.package as any)?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const updateStatus = async (id: string, newStatus: SubscriptionStatus) => {
        try {
            const updates: any = {
                status: newStatus,
                updated_at: new Date().toISOString()
            };

            if (newStatus === 'cancelled') {
                updates.cancelled_at = new Date().toISOString();
            }

            const { error } = await supabase
                .from('subscriptions')
                .update(updates)
                .eq('id', id);

            if (error) throw error;
            showToast.success(`Subscription ${newStatus}`);
            fetchSubscriptions();
        } catch (error) {
            console.error('Error updating subscription:', error);
            showToast.error('Failed to update subscription');
        }
        setMenuOpenId(null);
    };

    const handleCancel = async (sub: Subscription) => {
        const confirmed = await showConfirm(
            'Cancel Subscription?',
            'This will immediately cancel the subscription. The user will lose access at the end of their current billing period.'
        );
        if (confirmed) {
            await updateStatus(sub.id, 'cancelled');
        }
    };

    const formatDate = (date: string | null) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getBillingCycleLabel = (cycle: BillingCycle) => {
        switch (cycle) {
            case 'monthly': return 'Monthly';
            case 'quarterly': return 'Quarterly';
            case 'yearly': return 'Yearly';
            default: return cycle;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-xl shadow-lg">
                        <RefreshCcw size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
                        <p className="text-sm text-gray-500">Manage active and past subscriptions</p>
                    </div>
                </div>
                <button
                    onClick={fetchSubscriptions}
                    className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 bg-gray-50 hover:bg-white border border-gray-200 px-4 py-2 rounded-xl transition-all font-medium text-sm"
                >
                    <RefreshCcw size={16} />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <RefreshCcw size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            <p className="text-xs text-gray-500">Total Subscriptions</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                            <PlayCircle size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                            <p className="text-xs text-gray-500">Active</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.mrr, 'INR')}</p>
                            <p className="text-xs text-gray-500">MRR</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                            <AlertCircle size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.churnRate.toFixed(1)}%</p>
                            <p className="text-xs text-gray-500">Churn Rate</p>
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
                        placeholder="Search by customer or package..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as SubscriptionStatus | 'all')}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="expired">Expired</option>
                    <option value="past_due">Past Due</option>
                </select>
            </div>

            {/* Subscriptions Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="animate-spin text-blue-600" size={32} />
                    </div>
                ) : filteredSubscriptions.length === 0 ? (
                    <div className="text-center py-20">
                        <RefreshCcw size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">No subscriptions found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Package</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Billing</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Next Bill</th>
                                    <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredSubscriptions.map(sub => (
                                    <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                                    {((sub.user as any)?.full_name || (sub.user as any)?.email || '?')[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{(sub.user as any)?.full_name || 'Unknown'}</p>
                                                    <p className="text-xs text-gray-500">{(sub.user as any)?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900">{(sub.package as any)?.name || 'Unknown Package'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-gray-900">{formatCurrency(sub.amount, sub.currency as CurrencyCode)}</p>
                                            <p className="text-xs text-gray-500">{getBillingCycleLabel(sub.billing_cycle)}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[sub.status]}`}>
                                                {SUBSCRIPTION_STATUS_LABELS[sub.status].label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar size={14} />
                                                {formatDate(sub.next_billing_date)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="relative inline-block">
                                                <button
                                                    onClick={() => setMenuOpenId(menuOpenId === sub.id ? null : sub.id)}
                                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>
                                                {menuOpenId === sub.id && (
                                                    <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10">
                                                        <button
                                                            onClick={() => { setSelectedSubscription(sub); setMenuOpenId(null); }}
                                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                        >
                                                            <CreditCard size={14} /> View Details
                                                        </button>
                                                        {sub.status === 'active' && (
                                                            <>
                                                                <button
                                                                    onClick={() => updateStatus(sub.id, 'paused')}
                                                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                                >
                                                                    <PauseCircle size={14} /> Pause
                                                                </button>
                                                                <button
                                                                    onClick={() => handleCancel(sub)}
                                                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                                >
                                                                    <XCircle size={14} /> Cancel
                                                                </button>
                                                            </>
                                                        )}
                                                        {sub.status === 'paused' && (
                                                            <button
                                                                onClick={() => updateStatus(sub.id, 'active')}
                                                                className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                                                            >
                                                                <PlayCircle size={14} /> Resume
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedSubscription && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="font-bold text-lg text-gray-900">Subscription Details</h2>
                            <button onClick={() => setSelectedSubscription(null)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                                    {((selectedSubscription.user as any)?.full_name || '?')[0]}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{(selectedSubscription.user as any)?.full_name}</h3>
                                    <p className="text-sm text-gray-500">{(selectedSubscription.user as any)?.email}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Package</p>
                                    <p className="font-medium text-gray-900">{(selectedSubscription.package as any)?.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Status</p>
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[selectedSubscription.status]}`}>
                                        {SUBSCRIPTION_STATUS_LABELS[selectedSubscription.status].label}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Amount</p>
                                    <p className="font-semibold text-gray-900">{formatCurrency(selectedSubscription.amount, selectedSubscription.currency as CurrencyCode)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Billing Cycle</p>
                                    <p className="font-medium text-gray-900">{getBillingCycleLabel(selectedSubscription.billing_cycle)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Current Period</p>
                                    <p className="text-sm text-gray-700">
                                        {formatDate(selectedSubscription.current_period_start)} - {formatDate(selectedSubscription.current_period_end)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Next Billing</p>
                                    <p className="text-sm text-gray-700">{formatDate(selectedSubscription.next_billing_date)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Payment Gateway</p>
                                    <p className="font-medium text-gray-900 capitalize">{selectedSubscription.payment_gateway || 'Not set'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Gateway ID</p>
                                    <p className="text-sm text-gray-600 font-mono">{selectedSubscription.gateway_subscription_id || '—'}</p>
                                </div>
                            </div>

                            {selectedSubscription.cancelled_at && (
                                <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                                    <p className="text-sm text-red-700">
                                        <strong>Cancelled:</strong> {formatDate(selectedSubscription.cancelled_at)}
                                    </p>
                                    {selectedSubscription.cancellation_reason && (
                                        <p className="text-sm text-red-600 mt-1">Reason: {selectedSubscription.cancellation_reason}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
