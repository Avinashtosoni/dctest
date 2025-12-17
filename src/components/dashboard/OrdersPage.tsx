import { useState, useEffect } from 'react';
import {
    ShoppingBag,
    Search,
    MoreVertical,
    Calendar,
    Package,
    Loader2,
    X,
    CheckCircle,
    Clock,
    XCircle,
    RefreshCcw,
    DollarSign,
    FileText,
    Eye,
    Download
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { showToast, showConfirm } from '../../lib/sweetalert';
import { downloadInvoice } from '../../lib/invoice';
import {
    Order,
    OrderStatus,
    ORDER_STATUS_LABELS,
    formatCurrency,
    CurrencyCode
} from '../../types/ecommerce';

const STATUS_COLORS: Record<OrderStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-gray-100 text-gray-700',
    refunded: 'bg-purple-100 text-purple-700'
};

export default function OrdersPage() {
    const { role } = useAuth();
    const isAdmin = role === 'Admin' || role === 'Super Admin';

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        revenue: 0,
        pending: 0
    });

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            console.log('[OrdersPage] Fetching orders... isAdmin:', isAdmin, 'role:', role);

            // Build query
            let query = supabase
                .from('orders')
                .select(`
                    *,
                    package:service_packages(id, name, slug, category),
                    user:profiles(id, email, full_name)
                `);

            // Filter by user_id for non-admin users
            if (!isAdmin) {
                const { data: { user } } = await supabase.auth.getUser();
                console.log('[OrdersPage] Non-admin user, filtering by user_id:', user?.id);
                if (user) {
                    query = query.eq('user_id', user.id);
                }
            } else {
                console.log('[OrdersPage] Admin user, fetching all orders');
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;

            const ordersData = data || [];
            console.log('[OrdersPage] Fetched orders count:', ordersData.length);
            setOrders(ordersData);

            // Calculate stats
            const completed = ordersData.filter(o => o.status === 'completed');
            const pending = ordersData.filter(o => o.status === 'pending' || o.status === 'processing');
            const revenue = completed.reduce((sum, o) => sum + o.total_amount, 0);

            setStats({
                total: ordersData.length,
                completed: completed.length,
                revenue,
                pending: pending.length
            });
        } catch (error) {
            console.error('Error fetching orders:', error);
            showToast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.user as any)?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.user as any)?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.package as any)?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const updateStatus = async (id: string, newStatus: OrderStatus) => {
        try {
            const updates: any = {
                status: newStatus,
                updated_at: new Date().toISOString()
            };

            if (newStatus === 'completed') {
                const order = orders.find(o => o.id === id);
                if (order) {
                    const pkg = await supabase
                        .from('service_packages')
                        .select('support_duration_days')
                        .eq('id', order.package_id)
                        .single();

                    const supportDays = pkg.data?.support_duration_days || 30;
                    updates.support_starts_at = new Date().toISOString();
                    updates.support_ends_at = new Date(Date.now() + supportDays * 24 * 60 * 60 * 1000).toISOString();
                }
            }

            const { error } = await supabase
                .from('orders')
                .update(updates)
                .eq('id', id);

            if (error) throw error;
            showToast.success(`Order marked as ${newStatus}`);
            fetchOrders();
        } catch (error) {
            console.error('Error updating order:', error);
            showToast.error('Failed to update order');
        }
        setMenuOpenId(null);
    };

    const handleRefund = async (order: Order) => {
        const confirmed = await showConfirm(
            'Refund Order?',
            `This will mark order ${order.order_number} as refunded. Make sure to process the actual refund through your payment gateway.`
        );
        if (confirmed) {
            await updateStatus(order.id, 'refunded');
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
                    <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl shadow-lg">
                        <ShoppingBag size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
                        <p className="text-sm text-gray-500">Manage one-time purchase orders</p>
                    </div>
                </div>
                <button
                    onClick={fetchOrders}
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
                            <ShoppingBag size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            <p className="text-xs text-gray-500">Total Orders</p>
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
                        placeholder="Search by order number, customer, or package..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                </select>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="animate-spin text-blue-600" size={32} />
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-20">
                        <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">No orders found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Package</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Support Until</th>
                                    <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredOrders.map(order => (
                                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-mono font-medium text-gray-900">{order.order_number}</p>
                                                <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900">{(order.user as any)?.full_name || 'Unknown'}</p>
                                                <p className="text-xs text-gray-500">{(order.user as any)?.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900">{(order.package as any)?.name || 'Unknown Package'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-gray-900">{formatCurrency(order.total_amount, order.currency as CurrencyCode)}</p>
                                            {order.discount_amount > 0 && (
                                                <p className="text-xs text-green-600">-{formatCurrency(order.discount_amount, order.currency as CurrencyCode)} discount</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                                                {ORDER_STATUS_LABELS[order.status].label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {order.support_ends_at ? (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Calendar size={14} className="text-gray-400" />
                                                    <span className={new Date(order.support_ends_at) < new Date() ? 'text-red-600' : 'text-gray-600'}>
                                                        {formatDate(order.support_ends_at)}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="relative inline-block">
                                                <button
                                                    onClick={() => setMenuOpenId(menuOpenId === order.id ? null : order.id)}
                                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>
                                                {menuOpenId === order.id && (
                                                    <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10">
                                                        <button
                                                            onClick={() => { setSelectedOrder(order); setMenuOpenId(null); }}
                                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                        >
                                                            <Eye size={14} /> View Details
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                setMenuOpenId(null);
                                                                const pdfUrl = await downloadInvoice(order.id);
                                                                if (pdfUrl) {
                                                                    window.open(pdfUrl, '_blank');
                                                                } else {
                                                                    showToast.error('Invoice not available. It will be generated when the order is processed.');
                                                                }
                                                            }}
                                                            className="w-full px-4 py-2 text-left text-sm text-indigo-600 hover:bg-indigo-50 flex items-center gap-2"
                                                        >
                                                            <Download size={14} /> Download Invoice
                                                        </button>
                                                        {order.status === 'pending' && (
                                                            <button
                                                                onClick={() => updateStatus(order.id, 'processing')}
                                                                className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                                                            >
                                                                <Clock size={14} /> Mark Processing
                                                            </button>
                                                        )}
                                                        {(order.status === 'pending' || order.status === 'processing') && (
                                                            <>
                                                                <button
                                                                    onClick={() => updateStatus(order.id, 'completed')}
                                                                    className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                                                                >
                                                                    <CheckCircle size={14} /> Complete
                                                                </button>
                                                                <button
                                                                    onClick={() => updateStatus(order.id, 'cancelled')}
                                                                    className="w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                                                                >
                                                                    <XCircle size={14} /> Cancel
                                                                </button>
                                                            </>
                                                        )}
                                                        {order.status === 'completed' && (
                                                            <button
                                                                onClick={() => handleRefund(order)}
                                                                className="w-full px-4 py-2 text-left text-sm text-purple-600 hover:bg-purple-50 flex items-center gap-2"
                                                            >
                                                                <RefreshCcw size={14} /> Refund
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
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-green-600 to-emerald-600">
                            <h2 className="font-bold text-lg text-white">Order Details</h2>
                            <button onClick={() => setSelectedOrder(null)} className="text-white/80 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500">Order Number</p>
                                    <p className="font-mono font-bold text-lg text-gray-900">{selectedOrder.order_number}</p>
                                </div>
                                <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${STATUS_COLORS[selectedOrder.status]}`}>
                                    {ORDER_STATUS_LABELS[selectedOrder.status].label}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Customer</p>
                                    <p className="font-medium text-gray-900">{(selectedOrder.user as any)?.full_name}</p>
                                    <p className="text-sm text-gray-500">{(selectedOrder.user as any)?.email}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Package</p>
                                    <p className="font-medium text-gray-900">{(selectedOrder.package as any)?.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Subtotal</p>
                                    <p className="font-medium text-gray-900">{formatCurrency(selectedOrder.subtotal, selectedOrder.currency as CurrencyCode)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Discount</p>
                                    <p className="font-medium text-green-600">-{formatCurrency(selectedOrder.discount_amount, selectedOrder.currency as CurrencyCode)}</p>
                                    {selectedOrder.coupon_code && (
                                        <p className="text-xs text-gray-500">Code: {selectedOrder.coupon_code}</p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Tax</p>
                                    <p className="font-medium text-gray-900">{formatCurrency(selectedOrder.tax_amount, selectedOrder.currency as CurrencyCode)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Total</p>
                                    <p className="font-bold text-xl text-gray-900">{formatCurrency(selectedOrder.total_amount, selectedOrder.currency as CurrencyCode)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Order Date</p>
                                    <p className="text-sm text-gray-700">{formatDateTime(selectedOrder.created_at)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Support Period</p>
                                    {selectedOrder.support_starts_at && selectedOrder.support_ends_at ? (
                                        <p className="text-sm text-gray-700">
                                            {formatDate(selectedOrder.support_starts_at)} - {formatDate(selectedOrder.support_ends_at)}
                                        </p>
                                    ) : (
                                        <p className="text-sm text-gray-400">Not started</p>
                                    )}
                                </div>
                            </div>

                            {selectedOrder.notes && (
                                <div className="pt-4 border-t border-gray-100">
                                    <p className="text-xs text-gray-500 mb-1">Notes</p>
                                    <p className="text-sm text-gray-700">{selectedOrder.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
