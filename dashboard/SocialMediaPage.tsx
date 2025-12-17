import {
    Share2,
    TrendingUp,
    Users,
    MessageCircle,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    Globe,
    CheckCircle2,
    AlertCircle,
    Calendar,
    ExternalLink
} from 'lucide-react';

export default function SocialMediaPage() {
    const clients = [
        {
            id: 'CL-001',
            name: 'TechFlow Solutions',
            platform: 'LinkedIn',
            status: 'Active',
            followers: '12.5k',
            growth: '+5.2%',
            engagement: '4.8%',
            postsPerWeek: 3,
            lastPost: '2 hours ago',
            color: 'bg-blue-600',
            trend: 'up'
        },
        {
            id: 'CL-002',
            name: 'Fresh bites Catering',
            platform: 'Instagram',
            status: 'Active',
            followers: '45.2k',
            growth: '+12.4%',
            engagement: '6.2%',
            postsPerWeek: 5,
            lastPost: '5 hours ago',
            color: 'bg-pink-600',
            trend: 'up'
        },
        {
            id: 'CL-003',
            name: 'Urban Architecture',
            platform: 'Twitter',
            status: 'Warning',
            followers: '8.1k',
            growth: '-1.2%',
            engagement: '2.1%',
            postsPerWeek: 2,
            lastPost: '3 days ago',
            color: 'bg-sky-500',
            trend: 'down'
        },
        {
            id: 'CL-004',
            name: 'Wellness Hub',
            platform: 'Facebook',
            status: 'Active',
            followers: '28.4k',
            growth: '+3.8%',
            engagement: '3.5%',
            postsPerWeek: 4,
            lastPost: '1 day ago',
            color: 'bg-blue-700',
            trend: 'up'
        },
    ];

    return (
        <div className="w-full space-y-6 animate-in fade-in zoom-in-95 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Share2 className="text-blue-600" size={32} />
                        Social Media Manager
                    </h1>
                    <p className="text-gray-500 mt-2 text-lg">Track performance and growth across client accounts.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-6 py-3 bg-white text-gray-700 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition-all flex items-center gap-2">
                        <Calendar size={20} /> Schedule Post
                    </button>
                    <button className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2">
                        <BarChart3 size={20} /> View Reports
                    </button>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Reach', value: '2.4M', change: '+12.5%', icon: Globe, color: 'text-blue-600 bg-blue-50' },
                    { label: 'Avg. Engagement', value: '4.8%', change: '+0.8%', icon: MessageCircle, color: 'text-green-600 bg-green-50' },
                    { label: 'Active Clients', value: '24', change: '+2', icon: Users, color: 'text-purple-600 bg-purple-50' },
                    { label: 'Growth Rate', value: '+8.2%', change: '-1.1%', icon: TrendingUp, color: 'text-orange-600 bg-orange-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${stat.change.startsWith('+') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                }`}>
                                {stat.change.startsWith('+') ? <ArrowUpRight size={12} className="mr-1" /> : <ArrowDownRight size={12} className="mr-1" />}
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                        <p className="text-gray-500 font-medium mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Client Accounts Grid */}
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Client Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {clients.map((client) => (
                    <div key={client.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${client.color} shadow-lg shadow-blue-500/20`}>
                                    <span className="text-lg font-bold">{client.name.charAt(0)}</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{client.name}</h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <span className="font-medium">{client.platform}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            {client.status === 'Active' ? <CheckCircle2 size={14} className="text-green-500" /> : <AlertCircle size={14} className="text-orange-500" />}
                                            {client.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button className="text-gray-400 hover:text-blue-600 transition-colors">
                                <ExternalLink size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="p-4 bg-gray-50 rounded-2xl">
                                <p className="text-xs text-gray-500 font-semibold uppercase">Followers</p>
                                <p className="text-lg font-bold text-gray-900 mt-1">{client.followers}</p>
                                <p className={`text-xs font-bold mt-1 ${client.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                    {client.growth}
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl">
                                <p className="text-xs text-gray-500 font-semibold uppercase">Engagement</p>
                                <p className="text-lg font-bold text-gray-900 mt-1">{client.engagement}</p>
                                <p className="text-xs text-gray-400 font-medium mt-1">Avg. Rate</p>

                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl">
                                <p className="text-xs text-gray-500 font-semibold uppercase">Frequency</p>
                                <p className="text-lg font-bold text-gray-900 mt-1">{client.postsPerWeek}/wk</p>
                                <p className="text-xs text-gray-400 font-medium mt-1">Last: {client.lastPost}</p>
                            </div>
                        </div>

                        {/* Mini Analytics Visualization */}
                        <div className="mt-4 pt-4 border-t border-gray-50">
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="font-semibold text-gray-700">Weekly Reach</span>
                                <span className="text-green-600 font-bold flex items-center text-xs bg-green-50 px-2 py-1 rounded-full">
                                    <TrendingUp size={12} className="mr-1" /> Trending Up
                                </span>
                            </div>
                            <div className="h-16 flex items-end gap-1">
                                {[40, 65, 55, 80, 70, 90, 85].map((h, i) => (
                                    <div
                                        key={i}
                                        className="flex-1 bg-blue-100 rounded-t-lg hover:bg-blue-600 transition-colors cursor-pointer relative group/bar"
                                        style={{ height: `${h}%` }}
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            {h}00 views
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
