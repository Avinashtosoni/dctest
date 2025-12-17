import { useState, useEffect } from 'react';
import {
    Search,
    MoreVertical,
    DollarSign,
    CreditCard,
    Calendar,
    X,
    Loader2,
    RefreshCcw,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    Eye,
    Download
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { showToast } from '../../lib/sweetalert';
import {
    Payment,
    PaymentStatus,
    PAYMENT_STATUS_LABELS,
    formatCurrency,
    CurrencyCode
} from '../../types/ecommerce';

const STATUS_COLORS: Record<PaymentStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    refunded: 'bg-purple-100 text-purple-700',
    cancelled: 'bg-gray-100 text-gray-700'
};

const STATUS_ICONS: Record<PaymentStatus, React.ReactNode> = {
    pending: <Clock size={14} />,
    processing: <RefreshCcw size={14} className="animate-spin" />,
    completed: <CheckCircle size={14} />,
    failed: <XCircle size={14} />,
    refunded: <RefreshCcw size={14} />,
    cancelled: <XCircle size={14} />
};

export default function PaymentPage() {
    const { role } = useAuth();
    const isAdmin = role === 'Admin' || role === 'Super Admin';

    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all');
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        revenue: 0,
        pending: 0
    });

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            // Build query
            let query = supabase
                .from('payments')
                .select(`
                    *,
                    order:orders(id, order_number),
                    subscription:subscriptions(id, package:service_packages(name)),
                    user:profiles(id, email, full_name)
                `);

            // Filter by user_id for non-admin users
            if (!isAdmin) {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    query = query.eq('user_id', user.id);
                }
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;

            const paymentsData = data || [];
            setPayments(paymentsData);

            // Calculate stats
            const completed = paymentsData.filter(p => p.status === 'completed');
            const pending = paymentsData.filter(p => p.status === 'pending' || p.status === 'processing');
            const revenue = completed.reduce((sum, p) => sum + p.amount, 0);

            setStats({
                total: paymentsData.length,
                completed: completed.length,
                revenue,
                pending: pending.length
            });
        } catch (error) {
            console.error('Error fetching payments:', error);
            showToast.error('Failed to load payments');
        } finally {
            setLoading(false);
        }
    };

    const filteredPayments = payments.filter(payment => {
        const matchesSearch =
            payment.payment_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (payment.user as any)?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (payment.user as any)?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.gateway_payment_id?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const formatDate = (date: string | null) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatDateTime = (date: string | null) => {
        if (!date) return '—';
        return new Date(date).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl shadow-lg">
                        <CreditCard size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
                        <p className="text-sm text-gray-500">View all payment transactions</p>
                    </div>
                </div>
                <button
                    onClick={fetchPayments}
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
                            <CreditCard size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            <p className="text-xs text-gray-500">Total Payments</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                            <CheckCircle size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                            <p className="text-xs text-gray-500">Completed</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                            <DollarSign size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.revenue, 'INR')}</p>
                            <p className="text-xs text-gray-500">Total Revenue</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
                            <Clock size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                            <p className="text-xs text-gray-500">Pending</p>
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
                        placeholder="Search by payment ID, customer, or gateway ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | 'all')}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {/* Payments Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="animate-spin text-blue-600" size={32} />
                    </div>
                ) : filteredPayments.length === 0 ? (
                    <div className="text-center py-20">
                        <CreditCard size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">No payments found</p>
                        <p className="text-sm text-gray-400 mt-1">Payments will appear here when customers make purchases</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Gateway</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredPayments.map(payment => (
                                    <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-mono font-medium text-gray-900">{payment.payment_number}</p>
                                                {payment.gateway_payment_id && (
                                                    <p className="text-xs text-gray-500 font-mono">{payment.gateway_payment_id.slice(0, 20)}...</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                                    {((payment.user as any)?.full_name || (payment.user as any)?.email || '?')[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{(payment.user as any)?.full_name || 'Unknown'}</p>
                                                    <p className="text-xs text-gray-500">{(payment.user as any)?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-gray-900">{formatCurrency(payment.amount, payment.currency as CurrencyCode)}</p>
                                            {payment.refunded_amount > 0 && (
                                                <p className="text-xs text-purple-600">Refunded: {formatCurrency(payment.refunded_amount, payment.currency as CurrencyCode)}</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900 capitalize">{payment.payment_gateway || 'N/A'}</p>
                                                {payment.payment_method && (
                                                    <p className="text-xs text-gray-500 capitalize">{payment.payment_method}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[payment.status]}`}>
                                                {STATUS_ICONS[payment.status]}
                                                {PAYMENT_STATUS_LABELS[payment.status].label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar size={14} className="text-gray-400" />
                                                {formatDate(payment.paid_at || payment.created_at)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="relative inline-block">
                                                <button
                                                    onClick={() => setMenuOpenId(menuOpenId === payment.id ? null : payment.id)}
                                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>
                                                {menuOpenId === payment.id && (
                                                    <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10">
                                                        <button
                                                            onClick={() => { setSelectedPayment(payment); setMenuOpenId(null); }}
                                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                        >
                                                            <Eye size={14} /> View Details
                                                        </button>
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
            {selectedPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-emerald-600 to-teal-600">
                            <h2 className="font-bold text-lg text-white">Payment Details</h2>
                            <button onClick={() => setSelectedPayment(null)} className="text-white/80 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500">Payment Number</p>
                                    <p className="font-mono font-bold text-lg text-gray-900">{selectedPayment.payment_number}</p>
                                </div>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${STATUS_COLORS[selectedPayment.status]}`}>
                                    {STATUS_ICONS[selectedPayment.status]}
                                    {PAYMENT_STATUS_LABELS[selectedPayment.status].label}
                                </span>
                            </div>

                            <div className="text-center py-4 bg-gray-50 rounded-xl">
                                <p className="text-3xl font-bold text-gray-900">{formatCurrency(selectedPayment.amount, selectedPayment.currency as CurrencyCode)}</p>
                                {selectedPayment.refunded_amount > 0 && (
                                    <p className="text-sm text-purple-600 mt-1">
                                        Refunded: {formatCurrency(selectedPayment.refunded_amount, selectedPayment.currency as CurrencyCode)}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Customer</p>
                                    <p className="font-medium text-gray-900">{(selectedPayment.user as any)?.full_name}</p>
                                    <p className="text-sm text-gray-500">{(selectedPayment.user as any)?.email}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Payment Gateway</p>
                                    <p className="font-medium text-gray-900 capitalize">{selectedPayment.payment_gateway || 'N/A'}</p>
                                    {selectedPayment.payment_method && (
                                        <p className="text-sm text-gray-500 capitalize">{selectedPayment.payment_method}</p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Gateway Payment ID</p>
                                    <p className="text-sm text-gray-700 font-mono break-all">{selectedPayment.gateway_payment_id || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Gateway Order ID</p>
                                    <p className="text-sm text-gray-700 font-mono break-all">{selectedPayment.gateway_order_id || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Created</p>
                                    <p className="text-sm text-gray-700">{formatDateTime(selectedPayment.created_at)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Paid At</p>
                                    <p className="text-sm text-gray-700">{formatDateTime(selectedPayment.paid_at)}</p>
                                </div>
                            </div>

                            {selectedPayment.failure_reason && (
                                <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                                    <div className="flex items-center gap-2 text-red-700 mb-1">
                                        <AlertCircle size={14} />
                                        <span className="font-medium text-sm">Payment Failed</span>
                                    </div>
                                    <p className="text-sm text-red-600">{selectedPayment.failure_reason}</p>
                                    {selectedPayment.failure_code && (
                                        <p className="text-xs text-red-500 font-mono mt-1">Code: {selectedPayment.failure_code}</p>
                                    )}
                                </div>
                            )}

                            {selectedPayment.refund_reason && (
                                <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                                    <div className="flex items-center gap-2 text-purple-700 mb-1">
                                        <RefreshCcw size={14} />
                                        <span className="font-medium text-sm">Refund Reason</span>
                                    </div>
                                    <p className="text-sm text-purple-600">{selectedPayment.refund_reason}</p>
                                </div>
                            )}

                            {(selectedPayment.order as any)?.order_number && (
                                <div className="pt-4 border-t border-gray-100">
                                    <p className="text-xs text-gray-500 mb-1">Related Order</p>
                                    <p className="font-mono text-gray-900">{(selectedPayment.order as any).order_number}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
