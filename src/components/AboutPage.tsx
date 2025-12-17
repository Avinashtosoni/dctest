import { Award, Target, Shield, Heart, Zap, Milestone, Users, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

import SEO from './SEO';

export default function AboutPage() {
    const [team, setTeam] = useState<any[]>([]);
    const [loadingTeam, setLoadingTeam] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchTeamMembers();
    }, []);

    const fetchTeamMembers = async () => {
        try {
            setLoadingTeam(true);
            const { data, error } = await supabase
                .from('team_members')
                .select('*')
                .eq('visible', true)
                .order('display_order', { ascending: true });

            if (error) throw error;
            setTeam(data || []);
        } catch (error) {
            console.error('Error fetching team members:', error);
        } finally {
            setLoadingTeam(false);
        }
    };

    const stats = [
        { label: 'Years Experience', value: '10+' },
        { label: 'Projects Completed', value: '500+' },
        { label: 'Team Members', value: '25+' },
        { label: 'Client Retention', value: '98%' },
    ];

    const timeline = [
        { year: '2020', title: 'The Beginning', desc: 'Digital Comrade was founded with a laptop and a vision to disrupt the agency model.' },
        { year: '2021', title: 'First Major Win', desc: 'Secured our first Fortune 500 client and expanded the team to 10 members.' },
        { year: '2022', title: 'Going Global', desc: 'Opened our second office and started serving clients in Bihar and Jharkhand.' },
        { year: '2023', title: 'Tech Innovation', desc: 'Launched our proprietary analytics dashboard giving clients real-time ROI tracking.' },
        { year: '2024', title: 'Industry Leader', desc: 'Recognized as Top Digital Agency by TechReview and crossed 500+ successful projects.' },
    ];

    const partners = [
        { name: 'TechCorp', logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=100&fit=crop&auto=format' },
        { name: 'GlobalSystems', logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=100&fit=crop&auto=format' }, // Placeholders for demo
        { name: 'NextGen', logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=100&fit=crop&auto=format' },
        { name: 'FutureWorks', logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=100&fit=crop&auto=format' },
        { name: 'Innovate', logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=100&fit=crop&auto=format' },
    ];

    return (
        <div className="pt-0 pb-16 overflow-hidden">
            <SEO
                title="About Us"
                description="Learn about Digital Comrade, our mission, team, and history of driving digital growth for businesses worldwide."
            />
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-800 text-white py-32 mb-24 overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-float"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-float-delayed"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-400/20 backdrop-blur-sm text-blue-200 font-medium text-sm mb-8 fade-in-up">
                        <Users size={16} className="mr-2" /> Building The Future Since 2020
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold mb-8 fade-in-up tracking-tight">
                        We Are <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Digital Comrade.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto fade-in-up delay-100 font-light leading-relaxed">
                        A team of relentless innovators, data scientists, and creative storytellers dedicated to scaling your business through digital excellence.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Mission & Vision Split */}
                <div className="grid lg:grid-cols-2 gap-16 mb-32 items-center">
                    <div className="fade-in-up delay-200 space-y-8">
                        <div>
                            <div className="w-12 h-12 bg-blue-100 text-[#01478c] rounded-xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                                <Target size={28} />
                            </div>
                            <h2 className="text-4xl font-bold text-gray-900 mb-6">Driven By Purpose, Backed By Data.</h2>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                Our mission is to democratize digital growth. We believe that every business, regardless of size, deserves access to world-class marketing strategies that drive tangible ROI.
                            </p>
                        </div>
                        <div className="pl-6 border-l-4 border-blue-200">
                            <p className="text-xl font-medium text-[#01478c] italic">
                                "We don't just chase metrics; we chase impact. If it doesn't grow your business, we don't do it."
                            </p>
                            <div className="mt-4 text-sm font-bold text-gray-500">- The Digital Comrade Pledge</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 fade-in-up delay-300">
                        {stats.map((stat, index) => (
                            <div key={index} className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 hover:border-transparent transition-all hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(1,71,140,0.2)] text-center group">
                                <div className="text-4xl md:text-5xl font-extrabold text-[#01478c] mb-2 group-hover:scale-110 transition-transform">{stat.value}</div>
                                <div className="text-gray-500 font-medium uppercase tracking-wide text-xs">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Our Journey Timeline */}
                <div className="mb-32">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-50 text-purple-600 font-medium text-sm mb-4">
                            <Milestone size={16} className="mr-2" /> Our History
                        </div>
                        <h2 className="text-4xl font-bold text-gray-900">The Journey So Far</h2>
                    </div>

                    <div className="relative">
                        {/* Vertical Line */}
                        <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-100 via-purple-100 to-transparent hidden md:block"></div>

                        <div className="space-y-12 md:space-y-0">
                            {timeline.map((item, index) => (
                                <div key={index} className={`flex flex-col md:flex-row items-center justify-between w-full ${index % 2 === 0 ? 'md:flex-row-reverse' : ''} group`}>
                                    <div className="w-full md:w-5/12"></div>

                                    <div className="z-10 bg-white border-4 border-blue-50 w-12 h-12 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:border-purple-200 transition-all duration-300 mb-6 md:mb-0">
                                        <div className="w-4 h-4 bg-[#01478c] rounded-full"></div>
                                    </div>

                                    <div className="w-full md:w-5/12">
                                        <div className={`bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:border-transparent transition-all hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(147,51,234,0.3)] relative ${index % 2 === 0 ? 'text-left' : 'text-left md:text-right'}`}>
                                            <span className="text-5xl font-bold text-gray-100 absolute top-4 right-4 opacity-50 select-none group-hover:text-purple-50 transition-colors">{item.year}</span>
                                            <h3 className="text-2xl font-bold text-[#01478c] mb-3 relative z-10">{item.title}</h3>
                                            <p className="text-gray-600 relative z-10">{item.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Core Values */}
                <div className="mb-32">
                    <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Core Values</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-blue-50 p-10 rounded-3xl hover-grow transition-all hover:shadow-[0_0_40px_rgba(37,99,235,0.4)] border border-blue-100 hover:border-transparent group">
                            <div className="w-14 h-14 bg-white text-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-md group-hover:rotate-12 transition-transform">
                                <Shield size={28} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Radical Transparency</h3>
                            <p className="text-gray-600 leading-relaxed">No black boxes. No hidden fees. You get 24/7 access to the same dashboards we use, so you always know exactly where your budget is going.</p>
                        </div>
                        <div className="bg-purple-50 p-10 rounded-3xl hover-grow transition-all hover:shadow-[0_0_40px_rgba(147,51,234,0.4)] border border-purple-100 hover:border-transparent group">
                            <div className="w-14 h-14 bg-white text-purple-600 rounded-2xl flex items-center justify-center mb-8 shadow-md group-hover:rotate-12 transition-transform">
                                <Award size={28} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Relentless Excellence</h3>
                            <p className="text-gray-600 leading-relaxed">Good enough is the enemy of great. We A/B test everything and constantly refine our strategies to squeeze every ounce of performance.</p>
                        </div>
                        <div className="bg-orange-50 p-10 rounded-3xl hover-grow transition-all hover:shadow-[0_0_40px_rgba(249,115,22,0.4)] border border-orange-100 hover:border-transparent group">
                            <div className="w-14 h-14 bg-white text-orange-600 rounded-2xl flex items-center justify-center mb-8 shadow-md group-hover:rotate-12 transition-transform">
                                <Heart size={28} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Client Obsession</h3>
                            <p className="text-gray-600 leading-relaxed">We don't want to be a vendor; we want to be a partner. We care about your business growth as much as you do.</p>
                        </div>
                    </div>
                </div>

                {/* Team Section */}
                <div className="mb-32">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-50 text-green-600 font-medium text-sm mb-4">
                            <Zap size={16} className="mr-2" /> The Dream Team
                        </div>
                        <h2 className="text-4xl font-bold text-gray-900">Meet The Minds Behind The Magic</h2>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {loadingTeam ? (
                            // Loading skeleton
                            [1, 2, 3, 4].map((i) => (
                                <div key={i} className="rounded-3xl overflow-hidden bg-gray-200 animate-pulse">
                                    <div className="w-full h-96 bg-gray-300"></div>
                                    <div className="p-6">
                                        <div className="h-6 bg-gray-300 rounded mb-2"></div>
                                        <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            team.map((member, index) => (
                                <Link to={`/team/${member.id}`} key={index} className="group relative overflow-hidden rounded-3xl hover-grow fade-in-up hover:shadow-[0_0_40px_rgba(1,71,140,0.5)] cursor-pointer block" style={{ animationDelay: `${index * 100}ms` }}>
                                    <img src={member.image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400'} alt={member.name} className="w-full h-96 object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#01478c] via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                                    <div className="absolute bottom-0 left-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                        <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                                        <p className="text-blue-200 text-sm font-medium tracking-wide uppercase">{member.role}</p>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                {/* Trusted Partners */}
                <div className="bg-gray-50 rounded-[3rem] p-16 text-center mb-16">
                    <p className="text-gray-500 font-medium uppercase tracking-widest mb-10">Trusted By Industry Leaders</p>
                    <div className="flex flex-wrap justify-center gap-12 items-center opacity-60">
                        {partners.map((partner, index) => (
                            <div key={index} className="grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300 transform hover:scale-110 cursor-pointer">
                                <div className="text-2xl font-bold text-gray-400 hover:text-[#01478c] transition-colors">{partner.name}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center pb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Want to Join Our Journey?</h2>
                    <div className="flex justify-center gap-4">
                        <Link to="/contact" className="bg-[#01478c] text-white px-8 py-4 rounded-full font-bold hover:bg-[#01356b] transition-all hover:shadow-[0_0_30px_rgba(1,71,140,0.5)] flex items-center">
                            Partner With Us <ArrowRight size={20} className="ml-2" />
                        </Link>
                        <Link to="/contact" className="bg-white text-gray-700 border border-gray-200 px-8 py-4 rounded-full font-bold hover:bg-gray-50 transition-colors">
                            Join The Team
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
