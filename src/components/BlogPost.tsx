import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, User, ArrowLeft, Tag, Mail, Twitter, Linkedin, Facebook, List, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import SEO from './SEO';
import { supabase } from '../lib/supabase';
import { showFormSuccessMessage, showFormErrorMessage } from '../lib/formHelpers';

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    author_name: string;
    author_role: string | null;
    published_at: string | null;
    read_time: string | null;
    featured_image: string | null;
    tags: string[];
    category_name: string | null;
    category_id: string | null;
    table_of_contents: { title: string; id: string }[];
}

export default function BlogPost() {
    const { id } = useParams();
    const [blog, setBlog] = useState<BlogPost | null>(null);
    const [relatedBlogs, setRelatedBlogs] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [readingProgress, setReadingProgress] = useState(0);

    useEffect(() => {
        if (id) {
            fetchBlog(id);
        }
    }, [id]);

    useEffect(() => {
        const handleScroll = () => {
            const totalScroll = document.documentElement.scrollTop;
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scroll = `${totalScroll / windowHeight}`;
            setReadingProgress(Number(scroll) * 100);
        }
        window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);
    }, [blog]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    const fetchBlog = async (slug: string) => {
        try {
            setLoading(true);

            // Fetch the blog post
            const { data: blogData, error: blogError } = await supabase
                .from('blog_posts')
                .select('*')
                .eq('slug', slug)
                .eq('status', 'published')
                .single();

            if (blogError) throw blogError;

            setBlog(blogData);

            // Increment view count
            if (blogData) {
                await supabase
                    .from('blog_posts')
                    .update({ views_count: (blogData.views_count || 0) + 1 })
                    .eq('id', blogData.id);

                // Fetch related blogs from same category
                const { data: relatedData } = await supabase
                    .from('blog_posts')
                    .select('*')
                    .eq('status', 'published')
                    .eq('category_id', blogData.category_id)
                    .neq('id', blogData.id)
                    .limit(3);

                // If not enough related blogs, fetch more
                if (!relatedData || relatedData.length < 3) {
                    const { data: moreBlogs } = await supabase
                        .from('blog_posts')
                        .select('*')
                        .eq('status', 'published')
                        .neq('id', blogData.id)
                        .limit(3);

                    setRelatedBlogs(moreBlogs || []);
                } else {
                    setRelatedBlogs(relatedData || []);
                }
            }
        } catch (error) {
            console.error('Error fetching blog:', error);
        } finally {
            setLoading(false);
        }
    };

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            const offset = 100;
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [isSubmittingNewsletter, setIsSubmittingNewsletter] = useState(false);

    const handleNewsletterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingNewsletter(true);

        try {
            const { error } = await supabase
                .from('form_submissions')
                .insert([{
                    form_type: 'newsletter',
                    email: newsletterEmail,
                    status: 'new'
                }]);

            if (error) throw error;

            await showFormSuccessMessage('newsletter subscription');
            setNewsletterEmail('');
        } catch (error: any) {
            await showFormErrorMessage(error.message);
        } finally {
            setIsSubmittingNewsletter(false);
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

    if (loading) {
        return (
            <div className="pt-32 pb-20 min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-[#01478c]" size={48} />
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="pt-32 pb-20 text-center min-h-screen flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog Post Not Found</h1>
                <Link to="/blog" className="px-6 py-2 bg-[#01478c] text-white rounded-full hover:bg-blue-700 transition-colors">
                    ← Back to Blog
                </Link>
            </div>
        );
    }

    return (
        <div className="pt-0 pb-16 relative">
            <SEO
                title={blog.title}
                description={blog.excerpt || ''}
                image={blog.featured_image || ''}
                type="article"
            />
            <div className="fixed top-20 left-0 w-full h-1 bg-gray-100 z-50">
                <div
                    className="h-full bg-gradient-to-r from-[#01478c] to-blue-400 transition-all duration-100 ease-out"
                    style={{ width: `${readingProgress}%` }}
                ></div>
            </div>

            {/* Hero Section */}
            <div className="bg-gray-900 text-white relative overflow-hidden">
                <div className="absolute inset-0">
                    <img src={blog.featured_image || ''} alt={blog.title} className="w-full h-full object-cover opacity-30" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10 text-center">
                    <Link to="/blog" className="inline-flex items-center text-white/70 hover:text-white mb-8 transition-colors backdrop-blur-sm bg-white/10 px-4 py-2 rounded-full text-sm">
                        <ArrowLeft size={16} className="mr-2" /> Back to Articles
                    </Link>

                    <div className="flex justify-center gap-2 mb-6">
                        <span className="bg-[#01478c] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg ring-2 ring-white/10">
                            {blog.category_name || 'Uncategorized'}
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-8 leading-tight tracking-tight">
                        {blog.title}
                    </h1>

                    <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 text-sm md:text-base text-gray-300">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mr-3 border border-white/10">
                                <User size={20} className="text-blue-300" />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="font-bold text-white">{blog.author_name}</span>
                                {blog.author_role && (
                                    <span className="text-xs text-white/60">{blog.author_role}</span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center">
                            <Calendar size={18} className="mr-2 text-blue-300" /> {formatDate(blog.published_at)}
                        </div>
                        {blog.read_time && (
                            <div className="flex items-center">
                                <Clock size={18} className="mr-2 text-blue-300" /> {blog.read_time}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Sticky Side Panel */}
                <div className="hidden lg:block lg:col-span-3 lg:col-start-1 sticky top-32 self-start space-y-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                        <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden border-2 border-[#01478c]">
                            <div className="w-full h-full flex items-center justify-center bg-blue-50 text-[#01478c] font-bold text-2xl">
                                {blog.author_name.charAt(0)}
                            </div>
                        </div>
                        <h4 className="font-bold text-gray-900">{blog.author_name}</h4>
                        {blog.author_role && (
                            <p className="text-xs text-gray-500 mb-4">{blog.author_role}</p>
                        )}
                    </div>

                    {/* Dynamic Table of Contents */}
                    {blog.table_of_contents && blog.table_of_contents.length > 0 && (
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center mb-4 text-[#01478c] font-bold">
                                <List size={18} className="mr-2" />
                                <span>In This Article</span>
                            </div>
                            <ul className="space-y-3 text-sm text-gray-600">
                                {blog.table_of_contents.map((item, i) => (
                                    <li key={i} onClick={() => scrollToSection(item.id)} className="hover:text-[#01478c] cursor-pointer transition-colors flex items-center">
                                        <span className="w-1.5 h-1.5 bg-gray-300 rounded-full mr-2 hover:bg-[#01478c] transition-colors"></span>
                                        {item.title}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Share Article</p>
                        <div className="flex justify-center gap-4">
                            <button className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-colors duration-300">
                                <Twitter size={18} />
                            </button>
                            <button className="p-2 bg-blue-100 text-blue-800 rounded-full hover:bg-blue-800 hover:text-white transition-colors duration-300">
                                <Linkedin size={18} />
                            </button>
                            <button className="p-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-700 hover:text-white transition-colors duration-300">
                                <Facebook size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-8 bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100">
                    <div
                        className="prose prose-lg max-w-none text-gray-700 prose-headings:text-gray-900 prose-headings:font-bold prose-p:leading-relaxed prose-a:text-[#01478c] hover:prose-a:underline prose-img:rounded-2xl prose-blockquote:border-l-4 prose-blockquote:border-[#01478c] prose-blockquote:bg-blue-50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg"
                        dangerouslySetInnerHTML={{ __html: blog.content }}
                    ></div>

                    <div className="mt-12 pt-8 border-t border-gray-100">
                        <div className="flex flex-wrap items-center gap-3">
                            <Tag size={18} className="text-[#01478c]" />
                            {(blog.tags || []).map(tag => (
                                <span key={tag} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium hover:bg-[#01478c] hover:text-white transition-colors cursor-pointer">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="mt-16 bg-gradient-to-br from-[#01478c] to-blue-700 rounded-2xl p-8 md:p-10 text-center text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full mix-blend-overlay filter blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                        <div className="relative z-10">
                            <Mail size={48} className="mx-auto mb-6 text-blue-200" />
                            <h3 className="text-2xl font-bold mb-3">Subscribe to our Newsletter</h3>
                            <p className="text-blue-100 mb-6 max-w-md mx-auto">Get the latest digital marketing trends and strategies delivered straight to your inbox.</p>
                            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                                <input
                                    type="email"
                                    value={newsletterEmail}
                                    onChange={(e) => setNewsletterEmail(e.target.value)}
                                    required
                                    placeholder="Enter your email"
                                    className="flex-grow px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-300 outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={isSubmittingNewsletter}
                                    className="bg-[#ff6b35] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#e55a2b] transition-all hover:shadow-lg transform hover:-translate-y-1 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmittingNewsletter ? 'Subscribing...' : 'Subscribe'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <h3 className="text-2xl font-bold text-gray-900 mb-8 border-l-4 border-[#01478c] pl-4">Read Next</h3>
                <div className="grid md:grid-cols-3 gap-8">
                    {relatedBlogs.map((related, index) => (
                        <Link
                            to={`/blog/${related.slug}`}
                            key={index}
                            className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
                            onClick={() => window.scrollTo(0, 0)}
                        >
                            <div className="h-48 overflow-hidden relative">
                                <img src={related.featured_image || 'https://via.placeholder.com/800x600'} alt={related.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-[#01478c] uppercase">
                                    {related.tags && related.tags[0] ? related.tags[0] : related.category_name}
                                </div>
                            </div>
                            <div className="p-6">
                                <h4 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#01478c] transition-colors">{related.title}</h4>
                                <div className="flex items-center text-xs text-gray-500 mt-4">
                                    <span className="flex items-center"><Clock size={12} className="mr-1" /> {related.read_time || '5 min read'}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
