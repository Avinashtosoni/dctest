

import { useState, useEffect } from 'react';
import { Plus, Search, MoreVertical, X, Trash2, Edit2, Image, FileText, BarChart, Loader2, AlertCircle } from 'lucide-react';
import { showDeleteConfirm } from '../../lib/sweetalert';
import { supabase } from '../../lib/supabase';
import Swal from 'sweetalert2';

interface PortfolioItem {
    id: string;
    title: string;
    category: string;
    image: string | null;
    description: string | null;
    client: string;
    role?: string | null;
    duration?: string | null;
    date?: string | null;
    website?: string | null;
    challenge?: string | null;
    solution?: string | null;
    results?: string[];
    tags?: string[];
    technologies?: string[];
    gallery?: string[];
    process?: any;
    testimonial?: any;
    visible?: boolean;
    display_order?: number;
    featured?: boolean;
    created_at?: string;
    updated_at?: string;
}

const categories = ['All', 'SEO & PPC', 'Web Dev & Social', 'App Marketing', 'Email & Content', 'Branding', 'Web Dev'];

export default function PortfolioPage() {
    const [items, setItems] = useState<PortfolioItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [loading, setLoading] = useState(true);

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form Fields
    const [formData, setFormData] = useState<Partial<PortfolioItem>>({
        title: '',
        client: '',
        category: 'SEO & PPC',
        image: '',
        description: '',
        challenge: '',
        solution: '',
        tags: [],
        results: ['']
    });

    useEffect(() => {
        fetchPortfolioItems();
    }, []);

    const fetchPortfolioItems = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('portfolio_items')
                .select('*')
                .order('display_order', { ascending: true });

            if (error) throw error;
            setItems(data || []);
        } catch (error: any) {
            console.error('Error fetching portfolio items:', error);
            Swal.fire('Error', 'Failed to load portfolio items', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = items.filter(item => {
        const matchesFilter = selectedCategory === 'All' || item.category === selectedCategory;
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.client.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const openCreateModal = () => {
        setEditingItem(null);
        setFormData({
            title: '',
            client: '',
            category: 'SEO & PPC',
            image: '',
            description: '',
            challenge: '',
            solution: '',
            tags: [],
            results: ['']
        });
        setIsModalOpen(true);
        setMenuOpenId(null);
    };

    const openEditModal = (item: PortfolioItem) => {
        setEditingItem(item);
        setFormData({ ...item });
        setIsModalOpen(true);
        setMenuOpenId(null);
    };

    const handleDelete = async (id: string) => {
        const confirmed = await showDeleteConfirm('this portfolio item');
        if (confirmed) {
            try {
                const { error } = await supabase
                    .from('portfolio_items')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                setItems(prev => prev.filter(p => p.id !== id));
                Swal.fire('Deleted!', 'Portfolio item has been deleted.', 'success');
            } catch (error: any) {
                console.error('Error deleting portfolio item:', error);
                Swal.fire('Error', 'Failed to delete portfolio item', 'error');
            }
        }
        setMenuOpenId(null);
    };

    const handleResultChange = (index: number, value: string) => {
        const newResults = [...(formData.results || [])];
        newResults[index] = value;
        setFormData({ ...formData, results: newResults });
    };

    const addResultField = () => {
        setFormData({ ...formData, results: [...(formData.results || []), ''] });
    };

    const removeResultField = (index: number) => {
        const newResults = [...(formData.results || [])];
        newResults.splice(index, 1);
        setFormData({ ...formData, results: newResults });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (editingItem) {
                // Update existing item
                const { data, error } = await supabase
                    .from('portfolio_items')
                    .update({
                        title: formData.title,
                        client: formData.client,
                        category: formData.category,
                        image: formData.image,
                        description: formData.description,
                        challenge: formData.challenge,
                        solution: formData.solution,
                        results: formData.results?.filter(r => r.trim() !== ''),
                        tags: formData.tags,
                        role: formData.role,
                        duration: formData.duration,
                        date: formData.date,
                        website: formData.website
                    })
                    .eq('id', editingItem.id)
                    .select()
                    .single();

                if (error) throw error;

                setItems(prev => prev.map(p => p.id === editingItem.id ? data : p));
                Swal.fire('Success!', 'Portfolio item updated successfully', 'success');
            } else {
                // Create new item
                const { data, error } = await supabase
                    .from('portfolio_items')
                    .insert([{
                        title: formData.title,
                        client: formData.client,
                        category: formData.category,
                        image: formData.image || null,
                        description: formData.description,
                        challenge: formData.challenge,
                        solution: formData.solution,
                        results: formData.results?.filter(r => r.trim() !== ''),
                        tags: formData.tags || [],
                        role: formData.role,
                        duration: formData.duration,
                        date: formData.date,
                        website: formData.website,
                        display_order: items.length + 1,
                        visible: true
                    }])
                    .select()
                    .single();

                if (error) throw error;

                setItems(prev => [data, ...prev]);
                Swal.fire('Success!', 'Portfolio item created successfully', 'success');
            }

            setIsModalOpen(false);
        } catch (error: any) {
            console.error('Error saving portfolio item:', error);
            Swal.fire('Error', error.message || 'Failed to save portfolio item', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full space-y-6" onClick={() => setMenuOpenId(null)}>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Portfolio</h1>
                    <p className="text-gray-500">Manage your case studies and success stories</p>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); openCreateModal(); }}
                    className="flex items-center space-x-2 bg-[#01478c] text-white px-5 py-2.5 rounded-xl hover:bg-blue-800 transition-colors font-medium shadow-lg shadow-blue-200"
                >
                    <Plus size={18} />
                    <span>Add Project</span>
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200 p-1 max-w-full no-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === cat
                                ? 'bg-[#01478c] text-white shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search portfolio..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
            )}

            {/* Empty State */}
            {!loading && items.length === 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                    <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No portfolio items yet</h3>
                    <p className="text-gray-500 mb-6">Add your first portfolio project to get started</p>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center space-x-2 bg-[#01478c] text-white px-5 py-2.5 rounded-xl hover:bg-blue-800 transition-colors font-medium"
                    >
                        <Plus size={18} />
                        <span>Add Portfolio Project</span>
                    </button>
                </div>
            )}

            {/* Grid */}
            {!loading && filteredItems.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map(item => (
                        <div key={item.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative flex flex-col h-full">
                            <div className="h-48 overflow-hidden relative">
                                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                <div className="absolute top-2 right-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === item.id ? null : item.id); }}
                                        className="bg-white/90 p-1.5 rounded-full hover:bg-white shadow-sm text-gray-600"
                                    >
                                        <MoreVertical size={16} />
                                    </button>
                                    {menuOpenId === item.id && (
                                        <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-gray-100 z-10 overflow-hidden animate-in fade-in zoom-in duration-200">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); openEditModal(item); }}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                            >
                                                <Edit2 size={14} /> Edit
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                            >
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="absolute top-2 left-2 bg-white/90 px-2 py-1 rounded-md text-xs font-bold text-[#01478c] uppercase tracking-wider shadow-sm">
                                    {item.category}
                                </div>
                            </div>

                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="font-bold text-gray-900 mb-1 truncate">{item.title}</h3>
                                <p className="text-sm text-gray-500 mb-4">{item.client}</p>
                                <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1">{item.description}</p>

                                <div className="flex flex-wrap gap-1 mt-auto">
                                    {(item.results || []).slice(0, 2).map((res, i) => (
                                        <span key={i} className="text-[10px] bg-green-50 text-green-700 px-2 py-1 rounded border border-green-100 truncate max-w-full">
                                            {res}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
                            <h2 className="font-bold text-lg text-gray-900">{editingItem ? 'Edit Portfolio Item' : 'New Portfolio Item'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            required
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.client}
                                        onChange={e => setFormData({ ...formData, client: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {categories.filter(c => c !== 'All').map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                                    <div className="relative">
                                        <Image className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.image || ''}
                                            onChange={e => setFormData({ ...formData, image: e.target.value })}
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Project Description (Summary)</label>
                                <textarea
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none h-20"
                                    value={formData.description || ''}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Challenge</label>
                                    <textarea
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none h-24"
                                        value={formData.challenge || ''}
                                        onChange={e => setFormData({ ...formData, challenge: e.target.value })}
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Solution</label>
                                    <textarea
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none h-24"
                                        value={formData.solution || ''}
                                        onChange={e => setFormData({ ...formData, solution: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Key Results</label>
                                {formData.results?.map((result, index) => (
                                    <div key={index} className="flex gap-2 mb-2">
                                        <div className="relative flex-1">
                                            <BarChart className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                                value={result}
                                                onChange={e => handleResultChange(index, e.target.value)}
                                                placeholder="e.g. 300% Traffic Increase"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeResultField(index)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addResultField}
                                    className="text-sm text-[#01478c] font-medium hover:underline flex items-center mt-2"
                                >
                                    <Plus size={16} className="mr-1" /> Add Result
                                </button>
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-[#01478c] text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition-colors shadow-lg shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                                    {editingItem ? 'Update Portfolio Item' : 'Create Portfolio Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
