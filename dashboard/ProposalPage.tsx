import { useState } from 'react';
import {
    FileText,
    Plus,
    Search,
    Filter,
    Download,
    CheckCircle2,
    Clock,
    DollarSign,
    FileSignature,
    Trash2,
    Edit3
} from 'lucide-react';
import { showDeleteConfirm } from '../../lib/sweetalert';

interface Proposal {
    id: string;
    client: string;
    title: string;
    value: string;
    date: string;
    status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected';
    email: string;
}

export default function ProposalPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
    const [formData, setFormData] = useState<Partial<Proposal>>({});

    // Initial correct mock data
    const initialProposals: Proposal[] = [
        { id: 'PROP-1001', client: 'TechSolutions Inc', title: 'Enterprise CRM Integration', value: '$45,000', date: 'Oct 24, 2023', status: 'Sent', email: 'john@techsolutions.com' },
        { id: 'PROP-1002', client: 'Global Retailers', title: 'E-commerce Platform Refactor', value: '$28,000', date: 'Oct 22, 2023', status: 'Accepted', email: 'sarah@globalretail.com' },
        { id: 'PROP-1003', client: 'StartupHub', title: 'Mobile App MVP', value: '$15,000', date: 'Oct 20, 2023', status: 'Draft', email: 'mike@startuphub.com' },
        { id: 'PROP-1004', client: 'Creative Agency', title: 'SEO Optimization Package', value: '$5,000', date: 'Oct 18, 2023', status: 'Rejected', email: 'admin@creative.com' },
        { id: 'PROP-1005', client: 'Alpha Logistics', title: 'Fleet Management Dashboard', value: '$32,500', date: 'Oct 15, 2023', status: 'Sent', email: 'ops@alphalogistics.com' },
    ];

    // Using state for proposals to allow "adds"
    const [data, setData] = useState<Proposal[]>(initialProposals);

    // Filter Logic
    const filteredProposals = data.filter(proposal => {
        const matchesSearch = proposal.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
            proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            proposal.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || proposal.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Accepted': return 'bg-green-100 text-green-700 border-green-200';
            case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
            case 'Sent': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Draft': return 'bg-gray-100 text-gray-700 border-gray-200';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const handleDelete = async (id: string) => {
        const confirmed = await showDeleteConfirm('this proposal');
        if (confirmed) {
            setData(data.filter(p => p.id !== id));
        }
    };

    const handleEdit = (proposal: Proposal) => {
        setEditingProposal(proposal);
        setFormData(proposal);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingProposal(null);
        setFormData({ status: 'Draft', date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) });
        setIsModalOpen(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingProposal) {
            setData(data.map(p => p.id === editingProposal.id ? { ...p, ...formData } as Proposal : p));
        } else {
            const newProposal: Proposal = {
                id: `PROP-${1000 + data.length + 1}`,
                client: formData.client || 'New Client',
                title: formData.title || 'New Proposal',
                value: formData.value || '$0',
                date: formData.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                status: formData.status as any || 'Draft',
                email: formData.email || ''
            };
            setData([newProposal, ...data]);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="w-full space-y-6 animate-in fade-in zoom-in-95 duration-500 relative">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-gray-100/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <FileSignature className="text-blue-600" size={32} />
                        Proposals
                    </h1>
                    <p className="text-gray-500 mt-2 text-lg">Manage, track, and send proposals to your clients.</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2">
                        <Download size={20} /> Export Report
                    </button>
                    <button
                        onClick={handleAddNew}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                    >
                        <Plus size={20} /> Create Proposal
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Proposals', value: data.length.toString(), icon: FileText, color: 'text-blue-600 bg-blue-50', border: 'border-blue-100' },
                    { label: 'Total Value', value: '$125,500', icon: DollarSign, color: 'text-green-600 bg-green-50', border: 'border-green-100' },
                    { label: 'Accepted', value: data.filter(p => p.status === 'Accepted').length.toString(), icon: CheckCircle2, color: 'text-indigo-600 bg-indigo-50', border: 'border-indigo-100' },
                    { label: 'Pending', value: data.filter(p => p.status === 'Sent').length.toString(), icon: Clock, color: 'text-orange-600 bg-orange-50', border: 'border-orange-100' },
                ].map((stat, index) => (
                    <div key={index} className={`bg-white p-6 rounded-2xl shadow-sm border ${stat.border} hover:shadow-md transition-shadow`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">+12% this month</span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                        <p className="text-gray-500 font-medium mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search proposals by client, title, or ID..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <select
                            className="pl-10 pr-8 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white appearance-none cursor-pointer"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All">All Status</option>
                            <option value="Draft">Draft</option>
                            <option value="Sent">Sent</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Check if empty */}
            {filteredProposals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                    <div className="p-6 bg-gray-50 rounded-full mb-4">
                        <FileSignature className="text-gray-400" size={48} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">No Proposals Found</h3>
                    <p className="text-gray-500 mb-6">Try adjusting your search or filters.</p>
                    <button onClick={() => { setSearchTerm(''); setStatusFilter('All'); }} className="text-blue-600 font-semibold hover:underline">
                        Clear all filters
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-12">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Proposal ID</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Value</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredProposals.map((proposal) => (
                                    <tr key={proposal.id} className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-mono text-sm text-gray-500">{proposal.id}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900">{proposal.client}</span>
                                                <span className="text-xs text-gray-500">{proposal.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-bold text-gray-900">{proposal.value}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {proposal.date}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(proposal.status)}`}>
                                                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                                {proposal.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(proposal)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit3 size={18} />
                                                </button>
                                                <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Download PDF">
                                                    <Download size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(proposal.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {editingProposal ? 'Edit Proposal' : 'Create Proposal'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <Trash2 className="rotate-45" size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                    value={formData.client || ''}
                                    onChange={e => setFormData({ ...formData, client: e.target.value })}
                                    placeholder="e.g. Acme Corp"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                    value={formData.title || ''}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Website Redesign"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                        value={formData.value || ''}
                                        onChange={e => setFormData({ ...formData, value: e.target.value })}
                                        placeholder="e.g. $12,000"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
                                        value={formData.status || 'Draft'}
                                        onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                    >
                                        <option value="Draft">Draft</option>
                                        <option value="Sent">Sent</option>
                                        <option value="Accepted">Accepted</option>
                                        <option value="Rejected">Rejected</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Client Email</label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                    value={formData.email || ''}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="client@example.com"
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 text-gray-700 font-bold bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 text-white font-bold bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
                                >
                                    {editingProposal ? 'Save Changes' : 'Create Proposal'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
