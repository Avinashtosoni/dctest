import { useState } from 'react';
import {
    Search,
    MoreVertical,
    UserPlus,
    Mail,
    Phone,
    Filter,
    Target,
    BarChart2,
    CheckCircle,
    XCircle,
    Globe,
    Calendar
} from 'lucide-react';

interface Lead {
    id: string;
    name: string;
    email: string;
    phone: string;
    company: string;
    status: 'new' | 'contacted' | 'qualified' | 'lost';
    source: string;
    date: Date;
    avatar: string;
    value: string;
}

const LEADS: Lead[] = [
    {
        id: 'LEAD-001',
        name: 'John Smith',
        email: 'john.smith@acme.inc',
        phone: '+1 (555) 234-5678',
        company: 'Acme Corp',
        status: 'new',
        source: 'Website',
        date: new Date('2023-11-20'),
        avatar: 'https://randomuser.me/api/portraits/men/10.jpg',
        value: '$5,000'
    },
    {
        id: 'LEAD-002',
        name: 'Sarah Johnson',
        email: 's.johnson@techstar.io',
        phone: '+1 (555) 876-5432',
        company: 'TechStar',
        status: 'contacted',
        source: 'LinkedIn',
        date: new Date('2023-11-18'),
        avatar: 'https://randomuser.me/api/portraits/women/24.jpg',
        value: '$12,500'
    },
    {
        id: 'LEAD-003',
        name: 'Robert Davis',
        email: 'r.davis@global.net',
        phone: '+1 (555) 345-6789',
        company: 'Global Systems',
        status: 'qualified',
        source: 'Referral',
        date: new Date('2023-11-15'),
        avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
        value: '$25,000'
    },
    {
        id: 'LEAD-004',
        name: 'Emma Wilson',
        email: 'emma.w@design.co',
        phone: '+1 (555) 987-1234',
        company: 'Modern Specs',
        status: 'lost',
        source: 'Youtube',
        date: new Date('2023-11-10'),
        avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
        value: '$3,800'
    },
    {
        id: 'LEAD-005',
        name: 'Michael Brown',
        email: 'm.brown@construct.org',
        phone: '+1 (555) 654-3210',
        company: 'BuildIt',
        status: 'new',
        source: 'Website',
        date: new Date('2023-11-22'),
        avatar: 'https://randomuser.me/api/portraits/men/33.jpg',
        value: '$8,200'
    },
    {
        id: 'LEAD-006',
        name: 'Lisa Anderson',
        email: 'l.anderson@retail.com',
        phone: '+1 (555) 111-2222',
        company: 'ShopSmart',
        status: 'qualified',
        source: 'Ads',
        date: new Date('2023-11-21'),
        avatar: 'https://randomuser.me/api/portraits/women/11.jpg',
        value: '$15,000'
    }
];

export default function LeadsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredLeads = LEADS.filter(lead => {
        const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.company.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = statusFilter === 'all' || lead.status === statusFilter;
        return matchesSearch && matchesFilter;
    });

    const getStatusStyle = (status: Lead['status']) => {
        switch (status) {
            case 'new': return 'bg-blue-100 text-blue-700 ring-blue-500/30';
            case 'contacted': return 'bg-yellow-100 text-yellow-700 ring-yellow-500/30';
            case 'qualified': return 'bg-green-100 text-green-700 ring-green-500/30';
            case 'lost': return 'bg-gray-100 text-gray-700 ring-gray-500/30';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
                    <p className="text-gray-500">Track and manage your sales pipeline</p>
                </div>
                <button className="flex items-center space-x-2 bg-[#01478c] text-white px-5 py-2.5 rounded-xl hover:bg-blue-800 transition-colors font-medium shadow-lg shadow-blue-200">
                    <UserPlus size={18} />
                    <span>Add Lead</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Leads', value: '156', change: '+12%', icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'New Leads', value: '24', change: '+5.4%', icon: BarChart2, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Qualified', value: '68', change: '+18%', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Lost Leads', value: '12', change: '-2.1%', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${stat.change.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium">{stat.label}</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Leads Table/List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900">Pipeline</h2>

                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search leads..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-200 overflow-x-auto">
                            {['all', 'new', 'contacted', 'qualified', 'lost'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-4 py-1.5 text-xs font-medium rounded-lg capitalize whitespace-nowrap transition-all ${statusFilter === status
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-900'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                <th className="px-6 py-4">Lead Name</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Source</th>
                                <th className="px-6 py-4">Est. Value</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredLeads.map(lead => (
                                <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <img src={lead.avatar} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{lead.name}</p>
                                                <p className="text-xs text-gray-500">{lead.company}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ring-1 ring-inset ${getStatusStyle(lead.status)}`}>
                                            {lead.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center text-xs text-gray-500">
                                                <Mail size={12} className="mr-1.5" />
                                                {lead.email}
                                            </div>
                                            <div className="flex items-center text-xs text-gray-500">
                                                <Phone size={12} className="mr-1.5" />
                                                {lead.phone}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1.5">
                                            <Globe size={14} className="text-gray-400" />
                                            {lead.source}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                        {lead.value}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                            <MoreVertical size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-gray-100">
                    {filteredLeads.map(lead => (
                        <div key={lead.id} className="p-4 space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                    <img src={lead.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                                    <div>
                                        <p className="font-bold text-gray-900">{lead.name}</p>
                                        <p className="text-xs text-gray-500">{lead.company}</p>
                                    </div>
                                </div>
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ring-1 ring-inset ${getStatusStyle(lead.status)}`}>
                                    {lead.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
                                <div className="flex items-center gap-2">
                                    <Mail size={14} className="text-gray-400" />
                                    <span className="truncate">{lead.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone size={14} className="text-gray-400" />
                                    {lead.phone}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Globe size={14} className="text-gray-400" />
                                    {lead.source}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-gray-400" />
                                    {lead.date.toLocaleDateString()}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-2">
                                <div className="font-bold text-gray-900 text-sm">
                                    Est. Value: {lead.value}
                                </div>
                                <button className="text-gray-500 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-lg text-sm font-medium flex items-center bg-gray-50">
                                    <MoreVertical size={14} className="mr-1" /> Actions
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500 bg-gray-50/30">
                    <p>Showing {filteredLeads.length} leads</p>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50" disabled>Previous</button>
                        <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-white">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
