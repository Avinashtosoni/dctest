import { useState, useEffect } from 'react';
import {
    Search,
    MoreVertical,
    Mail,
    Phone,
    Users,
    UserCheck,
    TrendingUp,
    Loader2,
    RefreshCcw,
    X,
    CreditCard,
    Calendar,
    Package,
    DollarSign,
    Eye,
    ShoppingBag,
    Star
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { showToast } from '../../lib/sweetalert';
import { formatCurrency, CurrencyCode } from '../../types/ecommerce';

interface CustomerWithStats {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    avatar_url: string | null;
    role: string;
    created_at: string;
    // Computed stats
    subscription_count: number;
    active_subscriptions: number;
    order_count: number;
    total_payments: number;
    ltv: number;
}

export default function CustomersPage() {
    const { role } = useAuth();
    const isAdmin = role === 'Admin' || role === 'Super Admin';

    const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'subscribed' | 'no_subscription'>('all');
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithStats | null>(null);
    const [customerDetails, setCustomerDetails] = useState<any>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        withSubscriptions: 0,
        totalLtv: 0,
        avgLtv: 0
    });

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            // Fetch all profiles
            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (profilesError) throw profilesError;

            // Fetch subscription counts per user
            const { data: subscriptions, error: subsError } = await supabase
                .from('subscriptions')
                .select('user_id, status');

            // Fetch order counts per user
            const { data: orders, error: ordersError } = await supabase
                .from('orders')
                .select('user_id, total_amount, status');

            // Fetch payment totals per user
            const { data: payments, error: paymentsError } = await supabase
                .from('payments')
                .select('user_id, amount, status');

            // Combine data
            const customersWithStats: CustomerWithStats[] = (profiles || []).map(profile => {
                const userSubs = (subscriptions || []).filter(s => s.user_id === profile.id);
                const userOrders = (orders || []).filter(o => o.user_id === profile.id && o.status === 'completed');
                const userPayments = (payments || []).filter(p => p.user_id === profile.id && p.status === 'completed');

                const totalPayments = userPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

                return {
                    id: profile.id,
                    email: profile.email,
                    full_name: profile.full_name,
                    phone: profile.phone,
                    avatar_url: profile.avatar_url,
                    role: profile.role,
                    created_at: profile.created_at,
                    subscription_count: userSubs.length,
                    active_subscriptions: userSubs.filter(s => s.status === 'active').length,
                    order_count: userOrders.length,
                    total_payments: userPayments.length,
                    ltv: totalPayments
                };
            });

            setCustomers(customersWithStats);

            // Calculate stats
            const withSubs = customersWithStats.filter(c => c.active_subscriptions > 0);
            const totalLtv = customersWithStats.reduce((sum, c) => sum + c.ltv, 0);

            setStats({
                total: customersWithStats.length,
                withSubscriptions: withSubs.length,
                totalLtv,
                avgLtv: customersWithStats.length > 0 ? totalLtv / customersWithStats.length : 0
            });
        } catch (error) {
            console.error('Error fetching customers:', error);
            showToast.error('Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomerDetails = async (customer: CustomerWithStats) => {
        setSelectedCustomer(customer);
        setLoadingDetails(true);
        try {
            // Fetch subscriptions
            const { data: subs } = await supabase
                .from('subscriptions')
                .select('*, package:service_packages(name, slug)')
                .eq('user_id', customer.id)
                .order('created_at', { ascending: false });

            // Fetch orders
            const { data: orders } = await supabase
                .from('orders')
                .select('*, package:service_packages(name, slug)')
                .eq('user_id', customer.id)
                .order('created_at', { ascending: false });

            // Fetch payments
            const { data: payments } = await supabase
                .from('payments')
                .select('*')
                .eq('user_id', customer.id)
                .order('created_at', { ascending: false })
                .limit(10);

            setCustomerDetails({
                subscriptions: subs || [],
                orders: orders || [],
                payments: payments || []
            });
        } catch (error) {
            console.error('Error fetching customer details:', error);
            showToast.error('Failed to load customer details');
        } finally {
            setLoadingDetails(false);
        }
    };

    const filteredCustomers = customers.filter(customer => {
        const matchesSearch =
            customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.phone?.includes(searchTerm);

        let matchesStatus = true;
        if (statusFilter === 'subscribed') {
            matchesStatus = customer.active_subscriptions > 0;
        } else if (statusFilter === 'no_subscription') {
            matchesStatus = customer.active_subscriptions === 0;
        }

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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg">
                        <Users size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
                        <p className="text-sm text-gray-500">Manage your customers and view their activity</p>
                    </div>
                </div>
                <button
                    onClick={fetchCustomers}
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
                            <Users size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            <p className="text-xs text-gray-500">Total Customers</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                            <UserCheck size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.withSubscriptions}</p>
                            <p className="text-xs text-gray-500">With Subscriptions</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                            <DollarSign size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalLtv, 'INR')}</p>
                            <p className="text-xs text-gray-500">Total LTV</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.avgLtv, 'INR')}</p>
                            <p className="text-xs text-gray-500">Average LTV</p>
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
                        placeholder="Search by name, email, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                >
                    <option value="all">All Customers</option>
                    <option value="subscribed">With Active Subscription</option>
                    <option value="no_subscription">No Active Subscription</option>
                </select>
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="animate-spin text-blue-600" size={32} />
                    </div>
                ) : filteredCustomers.length === 0 ? (
                    <div className="text-center py-20">
                        <Users size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">No customers found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subscriptions</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Orders</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">LTV</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                                    <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredCustomers.map(customer => (
                                    <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {customer.avatar_url ? (
                                                    <img
                                                        src={customer.avatar_url}
                                                        alt={customer.full_name || ''}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                                        {(customer.full_name || customer.email || '?')[0].toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-gray-900">{customer.full_name || 'No Name'}</p>
                                                    <p className="text-xs text-gray-500 capitalize">{customer.role}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="text-sm text-gray-900 flex items-center gap-1.5">
                                                    <Mail size={12} className="text-gray-400" />
                                                    {customer.email}
                                                </p>
                                                {customer.phone && (
                                                    <p className="text-sm text-gray-600 flex items-center gap-1.5">
                                                        <Phone size={12} className="text-gray-400" />
                                                        {customer.phone}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {customer.active_subscriptions > 0 ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                    <RefreshCcw size={10} />
                                                    {customer.active_subscriptions} Active
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-sm">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {customer.order_count > 0 ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                    <ShoppingBag size={10} />
                                                    {customer.order_count} Orders
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-sm">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-gray-900">{formatCurrency(customer.ltv, 'INR')}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600">{formatDate(customer.created_at)}</p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="relative inline-block">
                                                <button
                                                    onClick={() => setMenuOpenId(menuOpenId === customer.id ? null : customer.id)}
                                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>
                                                {menuOpenId === customer.id && (
                                                    <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10">
                                                        <button
                                                            onClick={() => { fetchCustomerDetails(customer); setMenuOpenId(null); }}
                                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                        >
                                                            <Eye size={14} /> View Details
                                                        </button>
                                                        <a
                                                            href={`mailto:${customer.email}`}
                                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                        >
                                                            <Mail size={14} /> Send Email
                                                        </a>
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

            {/* Customer Detail Modal */}
            {selectedCustomer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden my-8">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-indigo-600 to-purple-600">
                            <h2 className="font-bold text-lg text-white">Customer Details</h2>
                            <button onClick={() => { setSelectedCustomer(null); setCustomerDetails(null); }} className="text-white/80 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        {loadingDetails ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="animate-spin text-blue-600" size={32} />
                            </div>
                        ) : (
                            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                                {/* Customer Header */}
                                <div className="flex items-center gap-4">
                                    {selectedCustomer.avatar_url ? (
                                        <img
                                            src={selectedCustomer.avatar_url}
                                            alt={selectedCustomer.full_name || ''}
                                            className="w-16 h-16 rounded-xl object-cover"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                                            {(selectedCustomer.full_name || selectedCustomer.email || '?')[0].toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-bold text-xl text-gray-900">{selectedCustomer.full_name || 'No Name'}</h3>
                                        <p className="text-gray-500">{selectedCustomer.email}</p>
                                        {selectedCustomer.phone && (
                                            <p className="text-gray-500 text-sm">{selectedCustomer.phone}</p>
                                        )}
                                    </div>
                                    <div className="ml-auto text-right">
                                        <p className="text-xs text-gray-500">Lifetime Value</p>
                                        <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedCustomer.ltv, 'INR')}</p>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-xl text-center">
                                        <p className="text-2xl font-bold text-gray-900">{selectedCustomer.active_subscriptions}</p>
                                        <p className="text-xs text-gray-500">Active Subscriptions</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl text-center">
                                        <p className="text-2xl font-bold text-gray-900">{selectedCustomer.order_count}</p>
                                        <p className="text-xs text-gray-500">Orders</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl text-center">
                                        <p className="text-2xl font-bold text-gray-900">{selectedCustomer.total_payments}</p>
                                        <p className="text-xs text-gray-500">Payments</p>
                                    </div>
                                </div>

                                {/* Subscriptions */}
                                {customerDetails?.subscriptions?.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <RefreshCcw size={16} /> Subscriptions
                                        </h4>
                                        <div className="space-y-2">
                                            {customerDetails.subscriptions.map((sub: any) => (
                                                <div key={sub.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{sub.package?.name || 'Unknown Package'}</p>
                                                        <p className="text-xs text-gray-500 capitalize">{sub.billing_cycle} • {sub.status}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold text-gray-900">{formatCurrency(sub.amount, 'INR')}</p>
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${sub.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                                            }`}>
                                                            {sub.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Recent Orders */}
                                {customerDetails?.orders?.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <ShoppingBag size={16} /> Orders
                                        </h4>
                                        <div className="space-y-2">
                                            {customerDetails.orders.slice(0, 5).map((order: any) => (
                                                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <p className="font-mono text-sm font-medium text-gray-900">{order.order_number}</p>
                                                        <p className="text-xs text-gray-500">{order.package?.name || 'Unknown'}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold text-gray-900">{formatCurrency(order.total_amount, 'INR')}</p>
                                                        <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Recent Payments */}
                                {customerDetails?.payments?.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <CreditCard size={16} /> Recent Payments
                                        </h4>
                                        <div className="space-y-2">
                                            {customerDetails.payments.slice(0, 5).map((payment: any) => (
                                                <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <p className="font-mono text-sm font-medium text-gray-900">{payment.payment_number}</p>
                                                        <p className="text-xs text-gray-500 capitalize">{payment.payment_gateway || 'N/A'}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold text-gray-900">{formatCurrency(payment.amount, 'INR')}</p>
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${payment.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                            {payment.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {(!customerDetails?.subscriptions?.length && !customerDetails?.orders?.length && !customerDetails?.payments?.length) && (
                                    <div className="text-center py-10 text-gray-500">
                                        <Package size={40} className="mx-auto mb-3 text-gray-300" />
                                        <p>No purchase history yet</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
