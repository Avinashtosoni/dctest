import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, User, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    author_name: string;
    published_at: string | null;
    read_time: string | null;
    featured_image: string | null;
    tags: string[];
    category_name: string | null;
}

export default function HomeBlogSection() {
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLatestBlogs();
    }, []);

    const fetchLatestBlogs = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('blog_posts')
                .select('*')
                .eq('status', 'published')
                .order('published_at', { ascending: false })
                .limit(6);

            if (error) throw error;
            setBlogs(data || []);
        } catch (error) {
            console.error('Error fetching blogs:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Latest From The Blog</h2>
                        <p className="text-gray-600">Trends, strategies, and insights to keep you ahead.</p>
                    </div>
                    <Link to="/blog" className="hidden md:flex items-center text-[#01478c] font-bold hover:text-[#ff6b35] transition-colors">
                        View All Articles <ArrowRight size={18} className="ml-2" />
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="animate-spin text-[#01478c]" size={48} />
                    </div>
                ) : (
                    <>
                        {/* Horizontal Scroll Container - Hide Scrollbar but allow scroll */}
                        <div className="flex overflow-x-auto pb-8 gap-8 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                            {blogs.map((blog, index) => (
                                <Link
                                    to={`/blog/${blog.slug}`}
                                    key={index}
                                    className="flex-shrink-0 w-[300px] md:w-[350px] snap-center group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-[0_0_30px_rgba(1,71,140,0.25)] transition-all duration-300 hover:-translate-y-2 border border-gray-100 hover:border-transparent flex flex-col"
                                >
                                    <div className="h-48 relative overflow-hidden">
                                        <img
                                            src={blog.featured_image || 'https://via.placeholder.com/800x600'}
                                            alt={blog.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-[#01478c] uppercase">
                                            {blog.tags && blog.tags[0] ? blog.tags[0] : blog.category_name}
                                        </div>
                                    </div>
                                    <div className="p-6 flex flex-col flex-grow">
                                        <div className="text-xs text-gray-500 mb-3 flex items-center">
                                            <Calendar size={12} className="mr-1" /> {formatDate(blog.published_at)}
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#01478c] transition-colors">
                                            {blog.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-grow">{blog.excerpt || ''}</p>
                                        <div className="flex items-center mt-auto">
                                            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mr-2">
                                                <User size={12} />
                                            </div>
                                            <span className="text-xs font-medium text-gray-500">{blog.author_name}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}

                            {/* "View More" Card */}
                            <Link
                                to="/blog"
                                className="flex-shrink-0 w-[200px] snap-center bg-gradient-to-br from-[#01478c] to-blue-600 rounded-2xl shadow-lg flex flex-col items-center justify-center text-white p-8 hover:scale-105 transition-transform"
                            >
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
                                    <ArrowRight size={24} />
                                </div>
                                <span className="font-bold text-lg">Read All Posts</span>
                            </Link>
                        </div>

                        <div className="mt-8 text-center md:hidden">
                            <Link to="/blog" className="inline-flex items-center text-[#01478c] font-bold">
                                View All Articles <ArrowRight size={18} className="ml-2" />
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}
