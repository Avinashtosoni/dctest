import { useState, useEffect, useMemo } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import {
    Download,
    Calendar,
    TrendingUp,
    TrendingDown,
    Users,
    DollarSign,
    RefreshCcw,
    Loader2,
    Package,
    CreditCard,
    ShoppingBag,
    Target,
    AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { showToast } from '../../lib/sweetalert';
import { formatCurrency } from '../../types/ecommerce';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

interface RevenueData {
    month: string;
    revenue: number;
    subscriptions: number;
    orders: number;
}

interface CategoryData {
    name: string;
    value: number;
}

export default function ReportsPage() {
    const { role } = useAuth();
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('6m'); // 1m, 3m, 6m, 1y

    // Stats
    const [stats, setStats] = useState({
        totalRevenue: 0,
        monthlyRevenue: 0,
        mrr: 0,
        arr: 0,
        totalCustomers: 0,
        activeSubscriptions: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        churnRate: 0,
        growthRate: 0
    });

    // Chart data
    const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
    const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
    const [topPackages, setTopPackages] = useState<any[]>([]);

    useEffect(() => {
        fetchData();
    }, [dateRange]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch all payments with completed status
            const { data: payments } = await supabase
                .from('payments')
                .select('*, created_at, amount, status')
                .eq('status', 'completed')
                .order('created_at', { ascending: false });

            // Fetch subscriptions
            const { data: subscriptions } = await supabase
                .from('subscriptions')
                .select('*, package:service_packages(name, category), amount, status, billing_cycle, created_at');

            // Fetch orders
            const { data: orders } = await supabase
                .from('orders')
                .select('*, package:service_packages(name, category), total_amount, status, created_at')
                .eq('status', 'completed');

            // Fetch profiles
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, created_at');

            // Calculate stats
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            // Filter for current month
            const currentMonthPayments = (payments || []).filter(p => {
                const d = new Date(p.created_at);
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            });

            // Calculate MRR from active subscriptions
            const activeSubscriptions = (subscriptions || []).filter(s => s.status === 'active');
            const mrr = activeSubscriptions.reduce((sum, s) => {
                if (s.billing_cycle === 'monthly') return sum + s.amount;
                if (s.billing_cycle === 'quarterly') return sum + (s.amount / 3);
                if (s.billing_cycle === 'yearly') return sum + (s.amount / 12);
                return sum;
            }, 0);

            // Calculate churn
            const cancelledSubs = (subscriptions || []).filter(s => s.status === 'cancelled');
            const totalSubs = subscriptions?.length || 1;
            const churnRate = (cancelledSubs.length / totalSubs) * 100;

            // Previous month for growth calculation
            const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
            const lastMonthPayments = (payments || []).filter(p => {
                const d = new Date(p.created_at);
                return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
            });

            const currentMonthRevenue = currentMonthPayments.reduce((sum, p) => sum + p.amount, 0);
            const lastMonthRevenue = lastMonthPayments.reduce((sum, p) => sum + p.amount, 0);
            const growthRate = lastMonthRevenue > 0
                ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
                : 100;

            const totalRevenue = (payments || []).reduce((sum, p) => sum + p.amount, 0);
            const completedOrders = orders || [];
            const avgOrderValue = completedOrders.length > 0
                ? completedOrders.reduce((sum, o) => sum + o.total_amount, 0) / completedOrders.length
                : 0;

            setStats({
                totalRevenue,
                monthlyRevenue: currentMonthRevenue,
                mrr,
                arr: mrr * 12,
                totalCustomers: profiles?.length || 0,
                activeSubscriptions: activeSubscriptions.length,
                totalOrders: completedOrders.length,
                avgOrderValue,
                churnRate,
                growthRate
            });

            // Generate monthly revenue data
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const months = dateRange === '1m' ? 1 : dateRange === '3m' ? 3 : dateRange === '6m' ? 6 : 12;

            const revenueByMonth: RevenueData[] = [];
            for (let i = months - 1; i >= 0; i--) {
                const targetMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthPayments = (payments || []).filter(p => {
                    const d = new Date(p.created_at);
                    return d.getMonth() === targetMonth.getMonth() && d.getFullYear() === targetMonth.getFullYear();
                });
                const monthSubs = (subscriptions || []).filter(s => {
                    const d = new Date(s.created_at);
                    return d.getMonth() === targetMonth.getMonth() && d.getFullYear() === targetMonth.getFullYear();
                });
                const monthOrders = (orders || []).filter(o => {
                    const d = new Date(o.created_at);
                    return d.getMonth() === targetMonth.getMonth() && d.getFullYear() === targetMonth.getFullYear();
                });

                revenueByMonth.push({
                    month: monthNames[targetMonth.getMonth()],
                    revenue: monthPayments.reduce((sum, p) => sum + p.amount, 0),
                    subscriptions: monthSubs.length,
                    orders: monthOrders.length
                });
            }
            setRevenueData(revenueByMonth);

            // Category distribution
            const categoryMap: Record<string, number> = {};
            (payments || []).forEach(payment => {
                // Get category from related order or subscription
            });
            (subscriptions || []).forEach(sub => {
                const cat = (sub.package as any)?.category || 'other';
                categoryMap[cat] = (categoryMap[cat] || 0) + sub.amount;
            });
            (orders || []).forEach(order => {
                const cat = (order.package as any)?.category || 'other';
                categoryMap[cat] = (categoryMap[cat] || 0) + order.total_amount;
            });

            const categoryLabels: Record<string, string> = {
                social_media: 'Social Media',
                website: 'Website',
                app: 'App Development',
                marketing: 'Marketing',
                design: 'Design',
                other: 'Other'
            };

            setCategoryData(
                Object.entries(categoryMap)
                    .map(([key, value]) => ({
                        name: categoryLabels[key] || key,
                        value
                    }))
                    .sort((a, b) => b.value - a.value)
            );

            // Top packages
            const packageMap: Record<string, { name: string; revenue: number; count: number }> = {};
            (subscriptions || []).forEach(sub => {
                const name = (sub.package as any)?.name || 'Unknown';
                if (!packageMap[name]) packageMap[name] = { name, revenue: 0, count: 0 };
                packageMap[name].revenue += sub.amount;
                packageMap[name].count += 1;
            });
            (orders || []).forEach(order => {
                const name = (order.package as any)?.name || 'Unknown';
                if (!packageMap[name]) packageMap[name] = { name, revenue: 0, count: 0 };
                packageMap[name].revenue += order.total_amount;
                packageMap[name].count += 1;
            });

            setTopPackages(
                Object.values(packageMap)
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 5)
            );

        } catch (error) {
            console.error('Error fetching data:', error);
            showToast.error('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ icon: Icon, title, value, subValue, trend, trendUp, color }: any) => (
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-lg ${color}`}>
                    <Icon size={20} />
                </div>
                {trend !== undefined && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
                        {trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {Math.abs(trend).toFixed(1)}%
                    </div>
                )}
            </div>
            <p className="mt-4 text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{title}</p>
            {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
                        <p className="text-sm text-gray-500">Track your business performance</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                        <option value="1m">Last Month</option>
                        <option value="3m">Last 3 Months</option>
                        <option value="6m">Last 6 Months</option>
                        <option value="1y">Last Year</option>
                    </select>
                    <button
                        onClick={fetchData}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 bg-gray-50 hover:bg-white border border-gray-200 rounded-xl transition-all"
                    >
                        <RefreshCcw size={16} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    icon={DollarSign}
                    title="Monthly Recurring Revenue"
                    value={formatCurrency(stats.mrr, 'INR')}
                    subValue={`ARR: ${formatCurrency(stats.arr, 'INR')}`}
                    color="bg-green-100 text-green-600"
                />
                <StatCard
                    icon={CreditCard}
                    title="This Month's Revenue"
                    value={formatCurrency(stats.monthlyRevenue, 'INR')}
                    trend={stats.growthRate}
                    trendUp={stats.growthRate > 0}
                    color="bg-blue-100 text-blue-600"
                />
                <StatCard
                    icon={Users}
                    title="Active Subscriptions"
                    value={stats.activeSubscriptions}
                    subValue={`${stats.totalCustomers} total customers`}
                    color="bg-purple-100 text-purple-600"
                />
                <StatCard
                    icon={AlertCircle}
                    title="Churn Rate"
                    value={`${stats.churnRate.toFixed(1)}%`}
                    subValue="Subscription cancellations"
                    trend={stats.churnRate}
                    trendUp={false}
                    color="bg-red-100 text-red-600"
                />
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    icon={Target}
                    title="Total Revenue"
                    value={formatCurrency(stats.totalRevenue, 'INR')}
                    color="bg-emerald-100 text-emerald-600"
                />
                <StatCard
                    icon={ShoppingBag}
                    title="Completed Orders"
                    value={stats.totalOrders}
                    subValue={`Avg: ${formatCurrency(stats.avgOrderValue, 'INR')}`}
                    color="bg-orange-100 text-orange-600"
                />
                <StatCard
                    icon={RefreshCcw}
                    title="Active Subscriptions"
                    value={stats.activeSubscriptions}
                    color="bg-indigo-100 text-indigo-600"
                />
                <StatCard
                    icon={Users}
                    title="Total Customers"
                    value={stats.totalCustomers}
                    color="bg-cyan-100 text-cyan-600"
                />
            </div>

            {/* Revenue Chart */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Revenue Overview</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueData}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                            <YAxis
                                stroke="#9ca3af"
                                fontSize={12}
                                tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`}
                            />
                            <Tooltip
                                formatter={(value: number) => [formatCurrency(value, 'INR'), 'Revenue']}
                                contentStyle={{
                                    borderRadius: '12px',
                                    border: '1px solid #e5e7eb',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#6366f1"
                                strokeWidth={2}
                                fill="url(#colorRevenue)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Category Distribution */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-4">Revenue by Category</h3>
                    {categoryData.length > 0 ? (
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number) => formatCurrency(value, 'INR')}
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: '1px solid #e5e7eb'
                                        }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-400">
                            No category data available
                        </div>
                    )}
                </div>

                {/* Subscriptions vs Orders */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-4">Subscriptions vs Orders</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                                <YAxis stroke="#9ca3af" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: '1px solid #e5e7eb'
                                    }}
                                />
                                <Legend />
                                <Bar dataKey="subscriptions" name="Subscriptions" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="orders" name="Orders" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Top Packages */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Top Performing Packages</h3>
                {topPackages.length > 0 ? (
                    <div className="space-y-3">
                        {topPackages.map((pkg, index) => (
                            <div key={pkg.name} className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm`}
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                >
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-medium text-gray-900">{pkg.name}</span>
                                        <span className="font-semibold text-gray-900">{formatCurrency(pkg.revenue, 'INR')}</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full"
                                            style={{
                                                width: `${(pkg.revenue / topPackages[0].revenue) * 100}%`,
                                                backgroundColor: COLORS[index % COLORS.length]
                                            }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">{pkg.count} purchases</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-gray-400">
                        <Package size={40} className="mx-auto mb-3" />
                        <p>No package data available yet</p>
                    </div>
                )}
            </div>
        </div>
    );
}
