import {
    Layout,
    Globe,
    Zap,
    Users,
    Activity,
    Server,
    CheckCircle2,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    ExternalLink,
    PieChart,
    Timer
} from 'lucide-react';

import { useState, useEffect } from 'react';
import { testGoogleSearchConsole } from '../../services/apiTester';

interface WebsiteData {
    id: string;
    name: string;
    url: string;
    status: string;
    health: number;
    uptime: string;
    loadTime: string;
    visitors: string;
    bounceRate: string;
    preview: string;
    trend: string;
}

export default function WebsitePage() {
    const [sites, setSites] = useState<WebsiteData[]>([
        {
            id: 'WEB-001',
            name: 'TechFlow Solutions',
            url: 'techflow-solutions.com',
            status: 'Online',
            health: 98,
            uptime: '99.99%',
            loadTime: '0.8s',
            visitors: '12.5k',
            bounceRate: '42%',
            preview: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=300',
            trend: 'up'
        }
    ]);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchGSCSites = async () => {
            const token = localStorage.getItem('gsc_access_token');
            if (token) {
                setLoading(true);
                const result = await testGoogleSearchConsole(token);
                if (result.success && result.data?.siteEntry) {
                    const gscSites = result.data.siteEntry.map((site: any, index: number) => ({
                        id: `GSC-${index}`,
                        name: site.siteUrl.replace('https://', '').replace('http://', '').replace(/\/$/, ''),
                        url: site.siteUrl,
                        status: 'Verified',
                        health: Math.floor(Math.random() * (100 - 80) + 80), // Mock health
                        uptime: '99.9%',
                        loadTime: `${(Math.random() * 1.5 + 0.5).toFixed(1)}s`,
                        visitors: `${Math.floor(Math.random() * 50)}k`,
                        bounceRate: `${Math.floor(Math.random() * 40 + 20)}%`,
                        preview: `https://source.unsplash.com/random/300x200?website&sig=${index}`,
                        trend: Math.random() > 0.5 ? 'up' : 'down'
                    }));
                    setSites(prev => {
                        // Filter out duplicates if any, or just append/replace. 
                        // For now, let's keep the hardcoded one and add GSC ones
                        return [...prev.filter(s => s.id === 'WEB-001'), ...gscSites];
                    });
                }
                setLoading(false);
            }
        };

        fetchGSCSites();
    }, []);

    const getHealthColor = (score: number) => {
        if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
        if (score >= 70) return 'text-orange-600 bg-orange-50 border-orange-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    return (
        <div className="w-full space-y-6 animate-in fade-in zoom-in-95 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Layout className="text-blue-600" size={32} />
                        Website Management
                    </h1>
                    <p className="text-gray-500 mt-2 text-lg">Monitor performance, uptime, and traffic for client sites.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-6 py-3 bg-white text-gray-700 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition-all flex items-center gap-2">
                        <Search size={20} /> Scan Site
                    </button>
                    <button className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2">
                        <Activity size={20} /> View Analytics
                    </button>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Visitors', value: '49.4k', change: '+8.5%', icon: Users, color: 'text-blue-600 bg-blue-50' },
                    { label: 'Avg. Load Time', value: '0.9s', change: '-0.2s', icon: Zap, color: 'text-yellow-600 bg-yellow-50' },
                    { label: 'Overall Uptime', value: '99.98%', change: '+0.01%', icon: Server, color: 'text-green-600 bg-green-50' },
                    { label: 'Bounce Rate', value: '38%', change: '-2.1%', icon: PieChart, color: 'text-purple-600 bg-purple-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${stat.label === 'Avg. Load Time' || stat.label === 'Bounce Rate'
                                ? (stat.change.startsWith('-') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700')
                                : (stat.change.startsWith('+') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700')
                                }`}>
                                {stat.change.startsWith('+') || (stat.label === 'Avg. Load Time' && stat.change.startsWith('+')) ? <ArrowUpRight size={12} className="mr-1" /> : <ArrowDownRight size={12} className="mr-1" />}
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                        <p className="text-gray-500 font-medium mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Client Websites Grid */}
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
                Monitored Websites
                {loading && <div className="text-xs font-normal text-blue-600 bg-blue-50 px-2 py-1 rounded-lg animate-pulse">Syncing with Google Search Console...</div>}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sites.map((site) => (
                    <div key={site.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 group">
                        <div className="flex flex-col sm:flex-row gap-6">
                            {/* Preview Image */}
                            <div className="w-full sm:w-48 h-32 rounded-2xl overflow-hidden relative shrink-0">
                                <img src={site.preview} alt={site.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                                <div className="absolute top-2 left-2">
                                    <span className={`px-2 py-1 rounded-lg text-xs font-bold backdrop-blur-md border ${site.status === 'Online' ? 'bg-green-100/90 text-green-700 border-green-200' : 'bg-orange-100/90 text-orange-700 border-orange-200'
                                        } flex items-center gap-1`}>
                                        {site.status === 'Online' ? <CheckCircle2 size={12} /> : <Timer size={12} />}
                                        {site.status}
                                    </span>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{site.name}</h3>
                                        <a href={`https://${site.url}`} target="_blank" rel="noreferrer" className="text-sm text-gray-500 hover:text-blue-500 flex items-center gap-1 transition-colors">
                                            <Globe size={14} /> {site.url}
                                        </a>
                                    </div>
                                    <div className={`flex flex-col items-end px-3 py-1 rounded-xl border ${getHealthColor(site.health)}`}>
                                        <span className="text-xs font-bold uppercase">Health</span>
                                        <span className="text-lg font-bold">{site.health}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-50 text-center">
                                    <div>
                                        <p className="text-xs text-gray-400 font-semibold uppercase">Uptime</p>
                                        <p className="text-sm font-bold text-gray-900">{site.uptime}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-semibold uppercase">Load Time</p>
                                        <p className="text-sm font-bold text-gray-900">{site.loadTime}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-semibold uppercase">Visitors</p>
                                        <p className="text-sm font-bold text-gray-900">{site.visitors}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                            <button className="flex-1 py-2 text-sm font-bold text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                                <Activity size={16} /> Analytics
                            </button>
                            <button className="flex-1 py-2 text-sm font-bold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
                                <ExternalLink size={16} /> Visit Site
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
