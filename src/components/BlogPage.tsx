import { Link } from 'react-router-dom';
import { Calendar, Clock, User, ArrowRight, Search, Zap, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import SEO from './SEO';
import { supabase } from '../lib/supabase';

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    author_name: string;
    author_role: string | null;
    published_at: string | null;
    read_time: string | null;
    featured_image: string | null;
    tags: string[];
    category_name: string | null;
}

export default function BlogPage() {
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<string[]>([]);

    useEffect(() => {
        fetchBlogs();
        window.scrollTo(0, 0);
    }, []);

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('blog_posts')
                .select('*')
                .eq('status', 'published')
                .order('published_at', { ascending: false });

            if (error) throw error;

            setBlogs(data || []);

            // Extract unique categories
            const uniqueCategories = ['All', ...new Set((data || []).map(blog => blog.category_name).filter(Boolean) as string[])];
            setCategories(uniqueCategories);
        } catch (error) {
            console.error('Error fetching blogs:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter logic
    const filteredBlogs = blogs.filter(blog => {
        const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (blog.excerpt || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || blog.category_name === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="pt-0 pb-16 min-h-screen bg-gray-50">
            <SEO
                title="Digital Marketing Insights"
                description="Expert strategies, trends, and tutorials to help you scale your business in the digital age."
            />
            {/* Glassmorphism Hero */}
            <div className="bg-[#01478c] text-white py-24 mb-12 relative overflow-hidden perspective-1000">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                {/* Decorative Blobs */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-overlay filter blur-[100px] opacity-20 animate-float"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-overlay filter blur-[100px] opacity-20 animate-float-delayed"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-flex items-center bg-white/10 backdrop-blur-md px-4 py-1 rounded-full text-sm font-medium mb-6 border border-white/20 animate-fade-in text-blue-100">
                        <Zap size={14} className="mr-2 text-yellow-300" />
                        Digital Marketing Intelligence
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 fade-in-up tracking-tight">
                        Insights that <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-300">Drive Growth</span>
                    </h1>
                    <p className="text-xl text-blue-100 max-w-2xl mx-auto fade-in-up delay-100 font-light">
                        Expert strategies, trends, and tutorials to help you scale your business in the digital age.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Search & Filter Section */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 fade-in-up delay-200 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    {/* Category Chips */}
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${selectedCategory === category
                                    ? 'bg-[#01478c] text-white shadow-md transform scale-105'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search articles..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#01478c] focus:border-transparent outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="animate-spin text-[#01478c]" size={48} />
                    </div>
                ) : (
                    <>
                        {/* Blog Grid */}
                        {filteredBlogs.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredBlogs.map((blog, index) => (
                                    <Link
                                        to={`/blog/${blog.slug}`}
                                        key={blog.id}
                                        className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-[0_0_40px_rgba(1,71,140,0.25)] transition-all duration-300 hover:-translate-y-2 border border-gray-100 hover:border-transparent flex flex-col h-full animate-slide-up"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <div className="relative h-56 overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity"></div>
                                            <img
                                                src={blog.featured_image || 'https://via.placeholder.com/800x600'}
                                                alt={blog.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#01478c] uppercase tracking-wide shadow-sm">
                                                {blog.category_name || 'Uncategorized'}
                                            </div>
                                        </div>

                                        <div className="p-8 flex-grow flex flex-col">
                                            <div className="flex items-center text-xs text-gray-500 mb-4 space-x-4 font-medium">
                                                <div className="flex items-center">
                                                    <Calendar size={14} className="mr-1 text-[#01478c]" /> {formatDate(blog.published_at)}
                                                </div>
                                                {blog.read_time && (
                                                    <div className="flex items-center">
                                                        <Clock size={14} className="mr-1 text-[#01478c]" /> {blog.read_time}
                                                    </div>
                                                )}
                                            </div>

                                            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#01478c] transition-colors leading-tight">
                                                {blog.title}
                                            </h3>
                                            <p className="text-gray-600 text-sm mb-6 flex-grow leading-relaxed line-clamp-3">
                                                {blog.excerpt || ''}
                                            </p>

                                            <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-auto">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-gray-600 shadow-inner">
                                                        <User size={14} />
                                                    </div>
                                                    <div className="ml-2 flex flex-col">
                                                        <span className="text-xs font-bold text-gray-900">{blog.author_name}</span>
                                                        {blog.author_role && (
                                                            <span className="text-[10px] text-gray-500">{blog.author_role}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#01478c] group-hover:bg-[#01478c] group-hover:text-white transition-all transform group-hover:scale-110">
                                                    <ArrowRight size={16} />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 text-gray-500">
                                <p className="text-xl">No articles found matching your criteria.</p>
                                <button
                                    onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
                                    className="mt-4 text-[#01478c] font-medium hover:underline"
                                >
                                    Clear filters
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
