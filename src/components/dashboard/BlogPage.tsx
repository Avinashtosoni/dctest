import { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    Filter,
    FileText,
    Eye,
    Layers,
    Edit3,
    Trash2,
    Save,
    X,
    BarChart,
    Image as ImageIcon,
    Link as LinkIcon,
    Check,
    Loader2
} from 'lucide-react';
import { showDeleteConfirm } from '../../lib/sweetalert';
import { supabase } from '../../lib/supabase';
import Swal from 'sweetalert2';

interface Category {
    id: string;
    name: string;
    slug: string;
    count?: number;
}

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    category_name: string | null;
    category_id: string | null;
    status: 'published' | 'draft' | 'archived';
    author_name: string;
    views_count: number;
    published_at: string | null;
    created_at: string;
    featured_image: string | null;
    content: string;
    excerpt: string | null;
    seo_title: string | null;
    meta_description: string | null;
    keywords: string | null;
    canonical_url: string | null;
    read_time: string | null;
    tags: string[];
    table_of_contents: any[];
}

export default function DashboardBlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Post Modal State
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [formData, setFormData] = useState<Partial<BlogPost>>({
        title: '',
        slug: '',
        category_name: '',
        status: 'draft',
        content: '',
        excerpt: '',
        featured_image: '',
        seo_title: '',
        meta_description: '',
        keywords: '',
        canonical_url: '',
        tags: [],
        table_of_contents: []
    });

    // Category Modal State
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [categoryName, setCategoryName] = useState('');
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    // Fetch data on mount
    useEffect(() => {
        fetchPosts();
        fetchCategories();
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('blog_posts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPosts(data || []);
        } catch (error: any) {
            Swal.fire('Error', error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('blog_categories')
                .select('*')
                .order('name');

            if (error) throw error;
            setCategories(data || []);
        } catch (error: any) {
            console.error('Error fetching categories:', error);
        }
    };

    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (post.category_name || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = statusFilter === 'all' || post.status === statusFilter;
        return matchesSearch && matchesFilter;
    });

    // Stats
    const totalViews = posts.reduce((acc, curr) => acc + (curr.views_count || 0), 0);
    const draftCount = posts.filter(p => p.status === 'draft').length;

    // Calculate read time from content
    const calculateReadTime = (content: string): string => {
        const wordsPerMinute = 200;
        const textContent = content.replace(/<[^>]*>/g, '');
        const wordCount = textContent.split(/\s+/).length;
        const minutes = Math.ceil(wordCount / wordsPerMinute);
        return `${minutes} min read`;
    };

    // Auto-generate slug from title
    const generateSlug = (title: string): string => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
    };

    // --- Post Handlers ---

    const handleOpenPostModal = (post?: BlogPost) => {
        if (post) {
            setEditingPost(post);
            setFormData({
                ...post,
                tags: post.tags || [],
                table_of_contents: post.table_of_contents || []
            });
        } else {
            setEditingPost(null);
            setFormData({
                title: '',
                slug: '',
                category_name: categories[0]?.name || '',
                status: 'draft',
                content: '',
                excerpt: '',
                featured_image: '',
                seo_title: '',
                meta_description: '',
                keywords: '',
                canonical_url: '',
                tags: [],
                table_of_contents: []
            });
        }
        setIsPostModalOpen(true);
    };

    const handleDeletePost = async (id: string) => {
        const confirmed = await showDeleteConfirm('this post');
        if (confirmed) {
            try {
                const { error } = await supabase
                    .from('blog_posts')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                Swal.fire('Deleted!', 'Blog post deleted successfully.', 'success');
                fetchPosts();
            } catch (error: any) {
                Swal.fire('Error', error.message, 'error');
            }
        }
    };

    const handleSavePost = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const slug = formData.slug || generateSlug(formData.title || '');
            const readTime = formData.read_time || calculateReadTime(formData.content || '');

            // Get current user
            const { data: { user } } = await supabase.auth.getUser();

            // Find category_id from category_name
            const category = categories.find(c => c.name === formData.category_name);

            const postData: any = {
                title: formData.title,
                slug,
                excerpt: formData.excerpt,
                content: formData.content,
                category_name: formData.category_name,
                category_id: category?.id || null,
                status: formData.status,
                featured_image: formData.featured_image,
                read_time: readTime,
                seo_title: formData.seo_title,
                meta_description: formData.meta_description,
                keywords: formData.keywords,
                canonical_url: formData.canonical_url,
                tags: formData.tags || [],
                table_of_contents: formData.table_of_contents || [],
                author_id: user?.id,
                author_name: formData.author_name || 'Admin User'
            };

            // Set published_at if status is published and it's a new post
            if (formData.status === 'published' && !editingPost) {
                postData.published_at = new Date().toISOString();
            }

            if (editingPost) {
                // Update existing post
                const { error } = await supabase
                    .from('blog_posts')
                    .update(postData)
                    .eq('id', editingPost.id);

                if (error) throw error;
                Swal.fire('Success!', 'Blog post updated successfully.', 'success');
            } else {
                // Create new post
                const { error } = await supabase
                    .from('blog_posts')
                    .insert([postData]);

                if (error) throw error;
                Swal.fire('Success!', 'Blog post created successfully.', 'success');
            }

            setIsPostModalOpen(false);
            fetchPosts();
        } catch (error: any) {
            Swal.fire('Error', error.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        const slug = editingPost ? formData.slug : generateSlug(title);
        setFormData({ ...formData, title, slug });
    };

    // --- Category Handlers ---

    const handleSaveCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoryName.trim()) return;

        try {
            const slug = generateSlug(categoryName);

            if (editingCategory) {
                const { error } = await supabase
                    .from('blog_categories')
                    .update({ name: categoryName, slug })
                    .eq('id', editingCategory.id);

                if (error) throw error;
                Swal.fire('Success!', 'Category updated successfully.', 'success');
            } else {
                const { error } = await supabase
                    .from('blog_categories')
                    .insert([{ name: categoryName, slug }]);

                if (error) throw error;
                Swal.fire('Success!', 'Category created successfully.', 'success');
            }

            setCategoryName('');
            setEditingCategory(null);
            fetchCategories();
        } catch (error: any) {
            Swal.fire('Error', error.message, 'error');
        }
    };

    const handleEditCategory = (cat: Category) => {
        setCategoryName(cat.name);
        setEditingCategory(cat);
    };

    const handleDeleteCategory = async (id: string) => {
        const confirmed = await showDeleteConfirm('this category');
        if (confirmed) {
            try {
                const { error } = await supabase
                    .from('blog_categories')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
                Swal.fire('Deleted!', 'Category deleted successfully.', 'success');
                fetchCategories();
            } catch (error: any) {
                Swal.fire('Error', error.message, 'error');
            }
        }
    };

    const getStatusStyle = (status: BlogPost['status']) => {
        switch (status) {
            case 'published': return 'bg-emerald-100/80 text-emerald-700 ring-1 ring-emerald-600/20 shadow-sm';
            case 'draft': return 'bg-amber-100/80 text-amber-700 ring-1 ring-amber-600/20 shadow-sm';
            case 'archived': return 'bg-gray-100 text-gray-700 ring-1 ring-gray-600/20 shadow-sm';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="w-full h-96 flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
        );
    }

    return (
        <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-gray-100/50">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Blog Management</h1>
                    <p className="text-gray-500 mt-2 font-medium">Create and optimize your content strategy</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="flex items-center space-x-2 bg-white text-gray-700 border border-gray-200 px-5 py-3 rounded-2xl hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all font-semibold active:scale-95 duration-200"
                    >
                        <Layers size={18} className="text-gray-500" />
                        <span className="hidden md:inline">Categories</span>
                    </button>
                    <button
                        onClick={() => handleOpenPostModal()}
                        className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-2xl hover:brightness-110 shadow-lg shadow-blue-500/30 transition-all font-semibold active:scale-95 duration-200"
                    >
                        <Plus size={20} />
                        <span>Create Post</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Blogs', value: posts.length.toString(), icon: FileText, color: 'text-blue-600', bg: 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100' },
                    { label: 'Total Views', value: totalViews.toLocaleString(), icon: Eye, color: 'text-purple-600', bg: 'bg-gradient-to-br from-purple-50 to-fuchsia-50 border-purple-100' },
                    { label: 'Categories', value: categories.length.toString(), icon: Layers, color: 'text-emerald-600', bg: 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100' },
                    { label: 'Drafts', value: draftCount.toString(), icon: Edit3, color: 'text-amber-600', bg: 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100' },
                ].map((stat, i) => (
                    <div key={i} className={`p-6 rounded-3xl border shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${stat.bg}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3.5 rounded-2xl bg-white shadow-sm ring-1 ring-black/5 ${stat.color}`}>
                                <stat.icon size={24} strokeWidth={2.5} />
                            </div>
                        </div>
                        <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{stat.value}</p>
                        <h3 className="text-gray-500 text-sm font-semibold mt-1">{stat.label}</h3>
                    </div>
                ))}
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 md:border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/30">
                    <h2 className="text-xl font-bold text-gray-900">All Posts</h2>

                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-72 group">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search title or category..."
                                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm transition-all shadow-sm bg-white"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="appearance-none pl-4 pr-10 py-3 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none shadow-sm cursor-pointer hover:border-gray-300 transition-all"
                            >
                                <option value="all">All Status</option>
                                <option value="published">Published</option>
                                <option value="draft">Draft</option>
                            </select>
                            <Filter className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        </div>
                    </div>
                </div>

                {/* Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                                <th className="px-8 py-5">Title</th>
                                <th className="px-6 py-5">Category</th>
                                <th className="px-6 py-5">Status</th>
                                <th className="px-6 py-5">Views</th>
                                <th className="px-6 py-5">Date</th>
                                <th className="px-6 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredPosts.map(post => (
                                <tr key={post.id} className="hover:bg-gray-50/80 transition-all duration-200 group cursor-default">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center space-x-4">
                                            <div className="relative group/img overflow-hidden rounded-xl w-16 h-12 shadow-sm border border-gray-100">
                                                <img src={post.featured_image || 'https://via.placeholder.com/150'} alt="" className="w-full h-full object-cover transform group-hover/img:scale-110 transition-transform duration-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 line-clamp-1 max-w-[240px] group-hover:text-blue-600 transition-colors">{post.title}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">{post.author_name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                                            {post.category_name || 'Uncategorized'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusStyle(post.status)}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${post.status === 'published' ? 'bg-emerald-500' :
                                                post.status === 'draft' ? 'bg-amber-500' : 'bg-gray-400'
                                                }`}></span>
                                            {post.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-sm font-medium text-gray-600">
                                        {post.views_count || 0}
                                    </td>
                                    <td className="px-6 py-5 text-sm text-gray-500">
                                        {formatDate(post.published_at || post.created_at)}
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <button
                                                onClick={() => handleOpenPostModal(post)}
                                                className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                                title="Edit"
                                            >
                                                <Edit3 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeletePost(post.id)}
                                                className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
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

                {/* Mobile View */}
                <div className="md:hidden p-4 space-y-4 bg-gray-50/50">
                    {filteredPosts.map(post => (
                        <div key={post.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                            <div className="flex items-start gap-4">
                                <img src={post.featured_image || 'https://via.placeholder.com/150'} alt="" className="w-20 h-20 rounded-xl object-cover shadow-sm bg-gray-100 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-1.5 leading-snug">{post.title}</h3>
                                        <button onClick={() => handleDeletePost(post.id)} className="text-gray-300 hover:text-red-500 p-1 -mt-1 -mr-1">
                                            <X size={16} />
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        <span className="text-[10px] px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600 font-medium">{post.category_name || 'Uncategorized'}</span>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-medium capitalize ${getStatusStyle(post.status)}`}>
                                            {post.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleOpenPostModal(post)}
                                className="w-full py-2.5 mt-2 bg-gray-50 text-gray-700 font-semibold text-sm rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
                            >
                                Edit Post
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Create/Edit Post Modal */}
            {isPostModalOpen && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-300 scale-100">
                        <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 px-8 py-5 flex items-center justify-between z-10 rounded-t-3xl">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    {editingPost ? 'Edit Blog Post' : 'Create New Post'}
                                </h2>
                                <p className="text-sm text-gray-500">Fill in the details below to manage your content</p>
                            </div>
                            <button onClick={() => setIsPostModalOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSavePost} className="p-8 space-y-10">
                            {/* General Section */}
                            <div className="space-y-6">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <FileText size={14} /> General Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-sm font-semibold text-gray-700">Post Title</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.title}
                                            onChange={handleTitleChange}
                                            className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300"
                                            placeholder="e.g. 10 Essential Web Design Tips"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-semibold text-gray-700">Slug (URL)</label>
                                        <div className="flex group">
                                            <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-sm font-medium group-focus-within:border-blue-500 group-focus-within:ring-4 group-focus-within:ring-blue-500/10 transition-all">
                                                /blog/
                                            </span>
                                            <input
                                                type="text"
                                                value={formData.slug}
                                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                                className="w-full px-5 py-3 rounded-r-xl border border-gray-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                                placeholder="post-url-slug"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-semibold text-gray-700">Author Name</label>
                                        <input
                                            type="text"
                                            value={formData.author_name}
                                            onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                                            className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                            placeholder="Your Name"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-semibold text-gray-700">Category</label>
                                        <div className="relative">
                                            <select
                                                required
                                                value={formData.category_name}
                                                onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                                                className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white appearance-none cursor-pointer hover:border-gray-300"
                                            >
                                                <option value="" disabled>Select Category</option>
                                                {categories.map(cat => (
                                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                                ))}
                                            </select>
                                            <Layers className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-semibold text-gray-700">Status</label>
                                        <div className="relative">
                                            <select
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                                className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white appearance-none cursor-pointer hover:border-gray-300"
                                            >
                                                <option value="draft">Draft</option>
                                                <option value="published">Published</option>
                                                <option value="archived">Archived</option>
                                            </select>
                                            <Check className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 space-y-3">
                                        <label className="text-sm font-semibold text-gray-700">Excerpt</label>
                                        <textarea
                                            rows={2}
                                            value={formData.excerpt}
                                            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                            className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none"
                                            placeholder="Brief summary (150-160 chars)"
                                        />
                                    </div>

                                    <div className="md:col-span-2 space-y-3">
                                        <label className="text-sm font-semibold text-gray-700">Featured Image</label>
                                        <div className="flex gap-4 p-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 hover:bg-blue-50/30 hover:border-blue-200 transition-colors">
                                            <div className="flex-1 space-y-3">
                                                <div className="relative">
                                                    <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                    <input
                                                        type="text"
                                                        value={formData.featured_image}
                                                        onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                                                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white"
                                                        placeholder="Enter image URL..."
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-500 pl-1">Supports Unsplash, direct links, or relative paths.</p>
                                            </div>
                                            {formData.featured_image && (
                                                <div className="w-32 h-20 rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-gray-100 flex-shrink-0">
                                                    <img
                                                        src={formData.featured_image}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => (e.currentTarget.style.display = 'none')}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Content Section */}
                            <div className="space-y-4">
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-gray-700 flex justify-between items-center">
                                        Content
                                        <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">HTML Supported</span>
                                    </label>
                                    <textarea
                                        required
                                        rows={12}
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        className="w-full px-6 py-5 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-mono text-sm leading-relaxed bg-gray-50/30 focus:bg-white"
                                        placeholder="<h1>Start writing your masterpiece...</h1>"
                                    />
                                </div>
                            </div>

                            {/* Advanced SEO Section */}
                            <div className="space-y-6 pt-6 border-t border-gray-100">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <BarChart size={14} /> SEO Configuration
                                </h3>
                                <div className="space-y-6 bg-gray-50 p-8 rounded-3xl border border-gray-100">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-sm font-semibold text-gray-700">SEO Title</label>
                                            <input
                                                type="text"
                                                value={formData.seo_title}
                                                onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                                                className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white"
                                                placeholder="Title shown in Google Search"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-sm font-semibold text-gray-700">Canonical URL</label>
                                            <div className="relative">
                                                <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                <input
                                                    type="text"
                                                    value={formData.canonical_url}
                                                    onChange={(e) => setFormData({ ...formData, canonical_url: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white"
                                                    placeholder="https://original-source.com"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-semibold text-gray-700">Meta Description</label>
                                        <textarea
                                            rows={3}
                                            value={formData.meta_description}
                                            onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                                            className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white resize-none"
                                            placeholder="A brief summary of the post content (150-160 chars recommended)"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-semibold text-gray-700">Keywords</label>
                                        <input
                                            type="text"
                                            value={formData.keywords}
                                            onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                                            className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white"
                                            placeholder="web design, seo, marketing (comma separated)"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
                                <button type="button" onClick={() => setIsPostModalOpen(false)} className="px-8 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold transition-colors">
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:brightness-110 shadow-lg shadow-blue-500/30 font-bold transition-all transform active:scale-95 flex items-center gap-2 disabled:opacity-50"
                                >
                                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    {saving ? 'Saving...' : (editingPost ? 'Save Changes' : 'Publish Post')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Category Management Modal */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                        <div className="border-b border-gray-100 p-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Manage Categories</h2>
                            <button onClick={() => { setIsCategoryModalOpen(false); setEditingCategory(null); setCategoryName(''); }} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Add/Edit Form */}
                            <form onSubmit={handleSaveCategory} className="flex gap-3">
                                <input
                                    type="text"
                                    value={categoryName}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                    placeholder="New Category Name"
                                    className="flex-1 px-5 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    disabled={!categoryName.trim()}
                                    className="px-5 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-colors"
                                >
                                    {editingCategory ? 'Update' : 'Add'}
                                </button>
                                {editingCategory && (
                                    <button
                                        type="button"
                                        onClick={() => { setEditingCategory(null); setCategoryName(''); }}
                                        className="px-4 py-3 text-gray-500 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </form>

                            {/* Category List */}
                            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                {categories.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Layers className="mx-auto h-12 w-12 text-gray-200 mb-3" />
                                        <p className="text-gray-500 font-medium">No categories found</p>
                                    </div>
                                ) : (
                                    categories.map(cat => (
                                        <div key={cat.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors group">
                                            <span className="font-semibold text-gray-700">{cat.name}</span>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                                                <button
                                                    onClick={() => handleEditCategory(cat)}
                                                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCategory(cat.id)}
                                                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
