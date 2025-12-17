import { useState, useEffect } from 'react';
import {
    User,
    CreditCard,
    Package,
    ShoppingBag,
    Download,
    Clock,
    CheckCircle,
    RefreshCcw,
    Loader2,
    ChevronRight,
    Mail,
    Phone,
    MapPin,
    FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { showToast } from '../../lib/sweetalert';
import { downloadInvoice } from '../../lib/invoice';
import { formatCurrency } from '../../types/ecommerce';

interface Order {
    id: string;
    order_number: string;
    status: string;
    total_amount: number;
    created_at: string;
    package: { name: string }[] | null;
}

interface Payment {
    id: string;
    payment_number: string;
    amount: number;
    status: string;
    payment_method: string;
    created_at: string;
}

interface Subscription {
    id: string;
    status: string;
    current_period_start: string;
    current_period_end: string;
    package: { name: string }[] | null;
}

interface Invoice {
    id: string;
    invoice_number: string;
    total_amount: number;
    status: string;
    pdf_url: string | null;
    created_at: string;
    order_id: string | null;
}

interface Profile {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    avatar_url: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
}

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-gray-100 text-gray-700',
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-700',
    failed: 'bg-red-100 text-red-700'
};

export default function AccountPage() {
    const { user, role } = useAuth();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'payments' | 'invoices' | 'subscriptions' | 'profile'>('overview');

    // Data states
    const [profile, setProfile] = useState<Profile | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);

    // Stats
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalSpent: 0,
        activeSubscriptions: 0
    });

    useEffect(() => {
        if (user?.id) {
            fetchAllData();
        }
    }, [user?.id]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchProfile(),
                fetchOrders(),
                fetchPayments(),
                fetchSubscriptions(),
                fetchInvoices()
            ]);
        } finally {
            setLoading(false);
        }
    };

    const fetchProfile = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user?.id)
            .single();
        if (data) setProfile(data);
    };

    const fetchOrders = async () => {
        const { data } = await supabase
            .from('orders')
            .select('id, order_number, status, total_amount, created_at, package:service_packages(name)')
            .eq('user_id', user?.id)
            .order('created_at', { ascending: false })
            .limit(10);

        if (data) {
            setOrders(data);
            const completed = data.filter(o => o.status === 'completed');
            const totalSpent = completed.reduce((sum, o) => sum + o.total_amount, 0);
            setStats(prev => ({ ...prev, totalOrders: data.length, totalSpent }));
        }
    };

    const fetchPayments = async () => {
        const { data } = await supabase
            .from('payments')
            .select('id, payment_number, amount, status, payment_method, created_at')
            .eq('user_id', user?.id)
            .order('created_at', { ascending: false })
            .limit(10);
        if (data) setPayments(data);
    };

    const fetchSubscriptions = async () => {
        const { data } = await supabase
            .from('subscriptions')
            .select('id, status, current_period_start, current_period_end, package:service_packages(name)')
            .eq('user_id', user?.id)
            .order('created_at', { ascending: false });

        if (data) {
            setSubscriptions(data);
            const active = data.filter(s => s.status === 'active').length;
            setStats(prev => ({ ...prev, activeSubscriptions: active }));
        }
    };

    const fetchInvoices = async () => {
        const { data } = await supabase
            .from('invoices')
            .select('id, invoice_number, total_amount, status, pdf_url, created_at, order_id')
            .eq('user_id', user?.id)
            .order('created_at', { ascending: false })
            .limit(20);
        if (data) setInvoices(data);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleDownloadInvoice = async (orderId: string) => {
        const pdfUrl = await downloadInvoice(orderId);
        if (pdfUrl) {
            window.open(pdfUrl, '_blank');
        } else {
            showToast.error('Invoice not available yet');
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: User },
        { id: 'orders', label: 'My Orders', icon: ShoppingBag },
        { id: 'payments', label: 'Payments', icon: CreditCard },
        { id: 'invoices', label: 'Invoices', icon: FileText },
        { id: 'subscriptions', label: 'Subscriptions', icon: RefreshCcw },
        { id: 'profile', label: 'Profile', icon: User }
    ] as const;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                        {profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">{profile?.full_name || 'Welcome!'}</h1>
                        <p className="text-blue-100">{user?.email}</p>
                        <span className="inline-block mt-1 px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
                            {role}
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                            <ShoppingBag size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                            <p className="text-sm text-gray-500">Total Orders</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                            <CreditCard size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalSpent, 'INR')}</p>
                            <p className="text-sm text-gray-500">Total Spent</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                            <RefreshCcw size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.activeSubscriptions}</p>
                            <p className="text-sm text-gray-500">Active Subscriptions</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="border-b border-gray-100">
                    <div className="flex gap-1 p-2 overflow-x-auto">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-6">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <ShoppingBag size={18} /> Recent Orders
                                </h3>
                                {orders.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No orders yet. <a href="/dashboard/shop" className="text-blue-600 hover:underline">Start shopping!</a></p>
                                ) : (
                                    <div className="space-y-3">
                                        {orders.slice(0, 3).map(order => (
                                            <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <Package size={20} className="text-gray-400" />
                                                    <div>
                                                        <p className="font-medium text-gray-900">{order.package?.[0]?.name || 'Product'}</p>
                                                        <p className="text-xs text-gray-500">{order.order_number} • {formatDate(order.created_at)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                                                        {order.status}
                                                    </span>
                                                    <span className="font-bold text-gray-900">{formatCurrency(order.total_amount, 'INR')}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Orders Tab */}
                    {activeTab === 'orders' && (
                        <div>
                            <h3 className="font-bold text-gray-900 mb-4">Order History</h3>
                            {orders.length === 0 ? (
                                <div className="text-center py-12">
                                    <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-500">No orders found</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {orders.map(order => (
                                        <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                                    <Package size={24} className="text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{order.package?.[0]?.name || 'Product'}</p>
                                                    <p className="text-sm text-gray-500">{order.order_number}</p>
                                                    <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                                                    {order.status}
                                                </span>
                                                <span className="font-bold text-gray-900">{formatCurrency(order.total_amount, 'INR')}</span>
                                                <button
                                                    onClick={() => handleDownloadInvoice(order.id)}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Download Invoice"
                                                >
                                                    <Download size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Payments Tab */}
                    {activeTab === 'payments' && (
                        <div>
                            <h3 className="font-bold text-gray-900 mb-4">Payment History</h3>
                            {payments.length === 0 ? (
                                <div className="text-center py-12">
                                    <CreditCard size={48} className="mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-500">No payments found</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {payments.map(payment => (
                                        <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${payment.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'
                                                    }`}>
                                                    {payment.status === 'completed' ? (
                                                        <CheckCircle size={24} className="text-green-600" />
                                                    ) : (
                                                        <Clock size={24} className="text-yellow-600" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{payment.payment_number}</p>
                                                    <p className="text-sm text-gray-500 capitalize">{payment.payment_method || 'Online'}</p>
                                                    <p className="text-xs text-gray-400">{formatDate(payment.created_at)}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-gray-900">{formatCurrency(payment.amount, 'INR')}</p>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[payment.status]}`}>
                                                    {payment.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Invoices Tab */}
                    {activeTab === 'invoices' && (
                        <div>
                            <h3 className="font-bold text-gray-900 mb-4">My Invoices</h3>
                            {invoices.length === 0 ? (
                                <div className="text-center py-12">
                                    <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-500">No invoices found</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {invoices.map(invoice => (
                                        <div key={invoice.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${invoice.status === 'paid' ? 'bg-green-100' : 'bg-yellow-100'
                                                    }`}>
                                                    <FileText size={24} className={invoice.status === 'paid' ? 'text-green-600' : 'text-yellow-600'} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{invoice.invoice_number}</p>
                                                    <p className="text-sm text-gray-500">{formatDate(invoice.created_at)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[invoice.status] || 'bg-gray-100 text-gray-700'}`}>
                                                    {invoice.status}
                                                </span>
                                                <span className="font-bold text-gray-900">{formatCurrency(invoice.total_amount, 'INR')}</span>
                                                {invoice.pdf_url ? (
                                                    <button
                                                        onClick={() => window.open(invoice.pdf_url!, '_blank')}
                                                        className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                                                    >
                                                        <Download size={16} />
                                                        Download
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleDownloadInvoice(invoice.order_id || '')}
                                                        className="px-4 py-2 bg-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
                                                        disabled={!invoice.order_id}
                                                    >
                                                        <Download size={16} />
                                                        Generate
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Subscriptions Tab */}
                    {activeTab === 'subscriptions' && (
                        <div>
                            <h3 className="font-bold text-gray-900 mb-4">My Subscriptions</h3>
                            {subscriptions.length === 0 ? (
                                <div className="text-center py-12">
                                    <RefreshCcw size={48} className="mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-500">No subscriptions found</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {subscriptions.map(sub => (
                                        <div key={sub.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${sub.status === 'active' ? 'bg-green-100' : 'bg-gray-100'
                                                    }`}>
                                                    <RefreshCcw size={24} className={sub.status === 'active' ? 'text-green-600' : 'text-gray-400'} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{sub.package?.[0]?.name || 'Subscription'}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {formatDate(sub.current_period_start)} - {formatDate(sub.current_period_end)}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[sub.status]}`}>
                                                {sub.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="max-w-2xl">
                            <h3 className="font-bold text-gray-900 mb-4">Profile Information</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                    <Mail size={20} className="text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium text-gray-900">{user?.email}</p>
                                    </div>
                                </div>
                                {profile?.full_name && (
                                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                        <User size={20} className="text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-500">Full Name</p>
                                            <p className="font-medium text-gray-900">{profile.full_name}</p>
                                        </div>
                                    </div>
                                )}
                                {profile?.phone && (
                                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                        <Phone size={20} className="text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-500">Phone</p>
                                            <p className="font-medium text-gray-900">{profile.phone}</p>
                                        </div>
                                    </div>
                                )}
                                {(profile?.address || profile?.city) && (
                                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                        <MapPin size={20} className="text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-500">Address</p>
                                            <p className="font-medium text-gray-900">
                                                {[profile.address, profile.city, profile.state, profile.country].filter(Boolean).join(', ')}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                <a
                                    href="/dashboard/profile"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
                                >
                                    Edit Profile <ChevronRight size={16} />
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
