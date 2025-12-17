

import { ArrowRight, Filter, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from './SEO';
import { supabase } from '../lib/supabase';

const categories = ['All', 'SEO & PPC', 'Web Dev & Social', 'App Marketing', 'Email & Content', 'Branding', 'Web Dev'];

export default function PortfolioPage() {
    const [filter, setFilter] = useState('All');
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [portfolioData, setPortfolioData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchPortfolio();
    }, []);

    const fetchPortfolio = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('portfolio_items')
                .select('*')
                .eq('visible', true)
                .order('display_order', { ascending: true });

            if (error) throw error;
            setPortfolioData(data || []);
        } catch (error) {
            console.error('Error fetching portfolio:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProjects = filter === 'All' ? portfolioData : portfolioData.filter(p => p.category === filter);

    return (
        <div className="pt-0 pb-24 overflow-hidden bg-gray-50/50">
            <SEO
                title="Our Portfolio | Digital Comrade"
                description="Explore our success stories. From SEO wins to stunning web makeovers, see how we drive results for our clients."
            />

            {/* Hero Section */}
            <div className="relative bg-[#0b0f19] text-white pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-1/2 -right-1/2 w-[1000px] h-[1000px] rounded-full bg-gradient-to-b from-blue-600/20 to-transparent blur-3xl" />
                    <div className="absolute -bottom-1/2 -left-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-t from-orange-500/10 to-transparent blur-3xl" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <span className="inline-block py-1 px-3 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6 animate-fade-in-up">
                        Our Work Speaks Volumes
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight animate-fade-in-up delay-100">
                        Selected <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-[#ff6b35]">Masterpieces</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto animate-fade-in-up delay-200">
                        We don't just deliver projects; we engineer success stories. Explore how we've helped brands transcend their limits.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
                {/* Filters */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="animate-spin text-blue-600" size={40} />
                    </div>
                ) : (
                    <>
                        <div className="flex flex-wrap justify-center gap-2 mb-16 bg-white p-2 rounded-2xl shadow-lg border border-gray-100 w-fit mx-auto animate-fade-in-up delay-300">
                            {categories.map((cat, index) => (
                                <button
                                    key={index}
                                    onClick={() => setFilter(cat)}
                                    className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${filter === cat
                                        ? 'bg-[#01478c] text-white shadow-md transform scale-105'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-[#01478c]'
                                        } `}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Project Grid */}
                        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                            {filteredProjects.map((project, index) => (
                                <Link
                                    to={`/portfolio/${project.id}`}
                                    key={index}
                                    onMouseEnter={() => setHoveredId(project.id)}
                                    onMouseLeave={() => setHoveredId(null)}
                                    className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 ease-out hover:-translate-y-2 fade-in-up"
                                >
                                    <div className="relative h-[400px] overflow-hidden">
                                        <img
                                            src={project.image}
                                            alt={project.title}
                                            className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

                                        <div className="absolute top-6 left-6">
                                            <span className="bg-white/90 backdrop-blur-md text-gray-900 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                                                {project.category}
                                            </span>
                                        </div>

                                        <div className={`absolute bottom - 6 left - 6 right - 6 transform transition - all duration - 500 ${hoveredId === project.id ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-100'} `}>
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <h3 className="text-3xl font-bold text-white mb-2 leading-tight">{project.title}</h3>
                                                    <p className="text-gray-200 line-clamp-2 max-w-md text-sm">{project.description}</p>
                                                </div>
                                                <div className="bg-[#ff6b35] p-3 rounded-full text-white transform rotate-45 group-hover:rotate-0 transition-transform duration-500 shadow-lg">
                                                    <ArrowRight size={20} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats Bar */}
                                    <div className="bg-white p-6 border-t border-gray-100 flex justify-between items-center text-sm">
                                        <div className="flex gap-6 text-gray-500 font-medium">
                                            <span className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                {project.results[0]}
                                            </span>
                                            <span className="hidden sm:flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                                {project.client}
                                            </span>
                                        </div>
                                        <span className="text-[#01478c] font-bold group-hover:underline">View Case Study</span>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {filteredProjects.length === 0 && (
                            <div className="text-center py-20">
                                <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-900">No projects found</h3>
                                <p className="text-gray-500">Try adjusting your filters.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div >
    );
}
