

import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Calendar, CheckCircle, BarChart, ArrowUpRight, Layout, Cpu, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import SEO from './SEO';
import { supabase } from '../lib/supabase';

export default function PortfolioDetail() {
    const { id } = useParams<{ id: string }>();
    const [project, setProject] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        if (id) {
            fetchProject();
        }
    }, [id]);

    const fetchProject = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('portfolio_items')
                .select('*')
                .eq('id', id)
                .eq('visible', true)
                .single();

            if (error || !data) {
                setNotFound(true);
            } else {
                setProject(data);
            }
        } catch (error) {
            console.error('Error fetching portfolio item:', error);
            setNotFound(true);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
        );
    }

    if (notFound || !project) {
        return <Navigate to="/portfolio" replace />;
    }

    return (
        <div className="min-h-screen bg-white">
            <SEO
                title={`${project.title} | Case Study`}
                description={project.description}
                image={project.image}
            />

            {/* Immersive Hero */}
            <div className="relative h-[70vh] min-h-[500px] w-full overflow-hidden">
                <div className="absolute inset-0">
                    <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                </div>

                <div className="absolute inset-0 flex flex-col justify-end pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
                    <Link to="/portfolio" className="text-white/80 hover:text-white flex items-center mb-8 w-fit group">
                        <div className="bg-white/10 p-2 rounded-full mr-3 group-hover:bg-[#ff6b35] transition-colors">
                            <ArrowLeft size={20} />
                        </div>
                        <span className="font-medium">Back to Projects</span>
                    </Link>

                    <div className="space-y-6">
                        <div className="flex flex-wrap items-center gap-4">
                            <span className="bg-[#ff6b35] text-white px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg shadow-orange-500/20">
                                {project.category}
                            </span>
                            <span className="flex items-center text-gray-300 font-medium bg-white/10 px-4 py-1.5 rounded-full">
                                <Calendar size={16} className="mr-2" /> {project.date}
                            </span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight max-w-4xl">
                            {project.title}
                        </h1>
                        <p className="text-xl text-gray-200 max-w-2xl leading-relaxed">
                            {project.description}
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid lg:grid-cols-12 gap-12">

                    {/* Sticky Sidebar */}
                    <div className="lg:col-span-4 space-y-8 order-2 lg:order-1">
                        <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 sticky top-24">
                            <h3 className="font-bold text-xl mb-6 text-gray-900">Project Stats</h3>

                            <div className="space-y-6">
                                <div className="flex items-start">
                                    <div className="mt-1 mr-4 text-[#01478c]"><Layout size={20} /></div>
                                    <div>
                                        <div className="text-gray-500 text-sm font-medium uppercase tracking-wide">Client</div>
                                        <div className="font-bold text-gray-900 text-lg">{project.client}</div>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="mt-1 mr-4 text-[#01478c]"><CheckCircle size={20} /></div>
                                    <div>
                                        <div className="text-gray-500 text-sm font-medium uppercase tracking-wide">Role</div>
                                        <div className="font-bold text-gray-900 text-lg">{project.role}</div>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="mt-1 mr-4 text-[#01478c]"><Calendar size={20} /></div>
                                    <div>
                                        <div className="text-gray-500 text-sm font-medium uppercase tracking-wide">Duration</div>
                                        <div className="font-bold text-gray-900 text-lg">{project.duration}</div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-200">
                                    <div className="text-gray-500 text-sm font-medium uppercase tracking-wide mb-3">Technologies</div>
                                    <div className="flex flex-wrap gap-2">
                                        {project.technologies.map(tech => (
                                            <span key={tech} className="bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center">
                                                <Cpu size={14} className="mr-1.5 text-gray-400" /> {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {project.website && (
                                    <a href={project.website} target="_blank" rel="noopener noreferrer" className="block w-full bg-[#01478c] text-white text-center font-bold py-4 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-800 transition-all hover:scale-[1.02] flex items-center justify-center mt-6">
                                        Visit Live Site <ExternalLink size={18} className="ml-2" />
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* CTA Box */}
                        <div className="bg-[#0b0f19] text-white p-8 rounded-3xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff6b35] rounded-full blur-[50px] opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
                            <div className="relative z-10">
                                <h4 className="text-xl font-bold mb-3">Inspired?</h4>
                                <p className="text-gray-400 mb-6 text-sm">Let's build something amazing together.</p>
                                <Link to="/contact" className="inline-flex items-center text-[#ff6b35] font-bold hover:text-white transition-colors">
                                    Start a Project <ArrowUpRight size={18} className="ml-2" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-8 space-y-16 order-1 lg:order-2">

                        {/* Results Overview - Highlighted */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            {project.results.slice(0, 4).map((result, i) => (
                                <div key={i} className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex items-center space-x-4 group">
                                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <BarChart size={24} />
                                    </div>
                                    <div className="font-bold text-gray-900 text-lg leading-tight">{result}</div>
                                </div>
                            ))}
                        </div>

                        {/* Story Section */}
                        <div className="space-y-12">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                                    <span className="w-8 h-1 bg-[#ff6b35] mr-4 rounded-full"></span>
                                    The Challenge
                                </h2>
                                <p className="text-xl text-gray-600 leading-relaxed font-light">
                                    {project.challenge}
                                </p>
                            </div>

                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                                    <span className="w-8 h-1 bg-[#01478c] mr-4 rounded-full"></span>
                                    Our Approach
                                </h2>
                                <p className="text-lg text-gray-600 leading-relaxed mb-8">
                                    {project.solution}
                                </p>

                                {/* Process Steps */}
                                <div className="space-y-6">
                                    {project.process.map((step, idx) => (
                                        <div key={idx} className="flex group">
                                            <div className="flex flex-col items-center mr-6">
                                                <div className="w-10 h-10 rounded-full border-2 border-[#01478c] flex items-center justify-center text-[#01478c] font-bold text-lg bg-white z-10 group-hover:bg-[#01478c] group-hover:text-white transition-colors">
                                                    {idx + 1}
                                                </div>
                                                {idx !== project.process.length - 1 && (
                                                    <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                                                )}
                                            </div>
                                            <div className="pb-8">
                                                <h4 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h4>
                                                <p className="text-gray-600">{step.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Gallery Grid */}
                        {project.gallery && project.gallery.length > 0 && (
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-8">Project Gallery</h2>
                                <div className="grid gap-6">
                                    <div className="rounded-3xl overflow-hidden shadow-2xl">
                                        <img src={project.gallery[0]} className="w-full h-auto" alt="Project detail 1" />
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        {project.gallery.slice(1).map((img, i) => (
                                            <div key={i} className="rounded-3xl overflow-hidden shadow-lg h-64">
                                                <img src={img} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" alt={`Project detail ${i + 2}`} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Testimonial */}
                        {project.testimonial && (
                            <div className="bg-gradient-to-br from-[#01478c] to-[#01356a] text-white p-12 rounded-[2.5rem] relative overflow-hidden text-center">
                                <div className="absolute top-0 left-0 text-white/10 transform -translate-x-1/2 -translate-y-1/2">
                                    <svg width="300" height="300" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M14.017 21L14.017 18C14.017 16.8954 13.1216 16 12.017 16H9.01699V12.0169C9.01699 10.9123 9.91243 12.0169 11.017 12.0169H12.017C13.1216 12.0169 14.017 11.1215 14.017 10.0169V5.01686C14.017 3.91229 13.1216 3.01686 12.017 3.01686H6.01699C4.91243 3.01686 4.01699 3.91229 4.01699 5.01686V12.0169C4.01699 13.1215 4.91243 21 6.01699 21H14.017Z" />
                                    </svg>
                                </div>
                                <div className="relative z-10 max-w-2xl mx-auto">
                                    <p className="text-2xl md:text-3xl font-medium leading-relaxed mb-8">"{project.testimonial.quote}"</p>
                                    <div>
                                        <div className="font-bold text-xl">{project.testimonial.author}</div>
                                        <div className="text-blue-200 uppercase tracking-widest text-sm mt-1">{project.testimonial.role}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
