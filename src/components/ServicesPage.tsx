import { Link } from 'react-router-dom';
import { servicesData } from '../data/services';
import { ArrowRight, CheckCircle, Zap, Code, BarChart, Search, Globe, Star, Hexagon, Layers, RefreshCw } from 'lucide-react';
import { useEffect } from 'react';

import SEO from './SEO';

export default function ServicesPage() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const process = [
        { icon: Search, title: 'Discovery', desc: 'We dive deep into your business model, audience, and competitors.' },
        { icon: Layers, title: 'Strategy', desc: 'Crafting a custom roadmap tailored to your specific KPIs and goals.' },
        { icon: Code, title: 'Execution', desc: 'Deploying campaigns and building assets with pixel-perfect precision.' },
        { icon: RefreshCw, title: 'Optimization', desc: 'Continuous testing and refining to maximize ROI and scale results.' },
    ];

    const techStack = [
        { name: 'Google Ads', icon: Search },
        { name: 'React', icon: Code },
        { name: 'HubSpot', icon: Layers },
        { name: 'Shopify', icon: Globe },
        { name: 'Analytics', icon: BarChart },
        { name: 'Figma', icon: Star },
    ];

    return (
        <div className="pt-0 pb-16 overflow-hidden perspective-1000">
            <SEO
                title="Our Services"
                description="Explore our digital marketing services including SEO, PPC, Social Media Management, and Custom Web Development."
            />
            {/* Hero */}
            <div className="relative bg-[#01478c] text-white py-28 mb-24 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-delayed"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/20 border border-blue-400/30 backdrop-blur-sm text-blue-100 font-medium text-sm mb-6 fade-in-up">
                        <Zap size={16} className="mr-2 text-yellow-400" /> Powering 500+ Businesses Globally
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 fade-in-up tracking-tight">
                        Digital Solutions That <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-200">Scale.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto fade-in-up delay-100 font-light leading-relaxed mb-10">
                        From high-converting websites to dominant SEO strategies, we build the digital infrastructure that drives your revenue growth.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto fade-in-up delay-200">
                        {[
                            { label: 'Revenue Generated', value: '$10M+' },
                            { label: 'Active Clients', value: '150+' },
                            { label: 'Avg. ROI', value: '350%' },
                            { label: 'Team Experts', value: '25+' }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 hover:bg-white/20 transition-all hover:scale-105 duration-300 shadow-lg">
                                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                                <div className="text-blue-200 text-xs font-medium uppercase tracking-wide">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Our Process (The Growth Blueprint) - MOVED TO FIRST */}
                <div className="mb-32">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-50 text-purple-600 font-medium text-sm mb-4">
                            <RefreshCw size={16} className="mr-2" /> How We Work
                        </div>
                        <h2 className="text-4xl font-bold text-gray-900">The Growth Blueprint</h2>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {process.map((step, index) => (
                            <div key={index} className="relative group text-center perspective-500">
                                {/* Connector Line */}
                                {index < process.length - 1 && (
                                    <div className="hidden md:block absolute top-12 left-1/2 w-full h-1 bg-gray-100 -z-10">
                                        <div className="h-full bg-blue-500 w-0 group-hover:w-full transition-all duration-700"></div>
                                    </div>
                                )}

                                <div className="w-24 h-24 bg-white rounded-3xl border-4 border-gray-100 flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:border-blue-500 transition-all duration-500 relative z-10 group-hover:shadow-[0_20px_50px_rgba(37,99,235,0.3)] transform-style-3d group-hover:rotate-y-12 group-hover:rotate-x-12">
                                    <step.icon size={32} className="text-gray-400 group-hover:text-blue-600 transition-colors transform translate-z-10" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed px-4">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Why Choose Us & Tech Stack - MOVED TO SECOND */}
                <div className="bg-gray-50 rounded-[3rem] p-12 md:p-20 mb-32 relative overflow-hidden">
                    <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
                        <div>
                            <div className="inline-flex items-center px-4 py-2 rounded-full bg-orange-100 text-[#ff6b35] font-medium text-sm mb-6">
                                <Star size={16} className="mr-2" /> Why Partner With Us
                            </div>
                            <h2 className="text-4xl font-bold text-gray-900 mb-6">We Speak Your Language. We Also Speak Code.</h2>
                            <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                                We combine marketing psychology with engineering precision. Our integrated approach ensures that every creative campaign is backed by solid technical infrastructure.
                            </p>

                            <div className="grid sm:grid-cols-2 gap-4 mb-8">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-1">
                                    <div className="font-bold text-gray-900 mb-1 flex items-center"><CheckCircle size={18} className="text-green-500 mr-2" /> Data-Driven</div>
                                    <div className="text-sm text-gray-500">Every decision backed by analytics.</div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-1">
                                    <div className="font-bold text-gray-900 mb-1 flex items-center"><CheckCircle size={18} className="text-green-500 mr-2" /> Full-Stack</div>
                                    <div className="text-sm text-gray-500">From React to SEO, we do it all.</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-8 shadow-2xl relative overflow-hidden border border-gray-100 hover:shadow-[0_0_50px_rgba(0,0,0,0.1)] transition-all perspective-1000">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">Our Technology Stack</h3>
                            <div className="grid grid-cols-3 gap-6">
                                {techStack.map((tech, i) => (
                                    <div key={i} className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 hover:bg-blue-50 transition-all duration-300 group cursor-default transform-style-3d hover:shadow-lg hover:rotate-2">
                                        <div className="transform transition-transform duration-300 group-hover:translate-z-10 group-hover:scale-110">
                                            <tech.icon size={32} className="text-gray-400 group-hover:text-blue-600 mb-2 transition-colors" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-600">{tech.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Services Grid (Our Expertise) - MOVED TO LAST */}
                <div className="mb-32">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-600 font-medium text-sm mb-4">
                            <Hexagon size={16} className="mr-2" /> What We Do Best
                        </div>
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Expertise</h2>
                        <p className="text-xl text-gray-600">Everything you need to dominate your market.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {servicesData.map((service, index) => {
                            const Icon = service.icon;
                            return (
                                <div key={index} className="group bg-white rounded-2xl p-8 shadow-lg transition-all duration-500 hover:-translate-y-2 border border-gray-100 hover:border-transparent hover:shadow-[0_0_40px_rgba(1,71,140,0.35)] fade-in-up perspective-1000" style={{ animationDelay: `${index * 100}ms` }}>

                                    {/* 3D Icon Container */}
                                    <div className="w-20 h-20 mx-auto mb-6 relative transform-style-3d transition-transform duration-500 group-hover:rotate-y-12">
                                        <div className={`absolute inset-0 ${service.color} opacity-20 rounded-2xl transform translate-z-[-10px] scale-90`}></div>
                                        <div className={`w-full h-full ${service.color} rounded-2xl flex items-center justify-center shadow-lg transform translate-z-10 group-hover:scale-110 transition-transform`}>
                                            <Icon size={36} className="drop-shadow-md" />
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">{service.title}</h3>
                                    <p className="text-gray-600 mb-6 line-clamp-2 text-center">{service.description}</p>

                                    <div className="mb-6 space-y-2">
                                        {service.features.slice(0, 3).map((feature, i) => (
                                            <div key={i} className="flex items-center text-sm text-gray-500">
                                                <div className="w-1.5 h-1.5 bg-[#ff6b35] rounded-full mr-2"></div>
                                                {feature}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="text-center">
                                        <Link
                                            to={`/services/${service.id}`}
                                            className="inline-flex items-center text-[#01478c] font-bold hover:text-[#ff6b35] transition-colors group/link"
                                        >
                                            Explore Service <ArrowRight size={16} className="ml-2 group-hover/link:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center bg-[#01478c] text-white rounded-[3rem] p-16 relative overflow-hidden group perspective-1000">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full translate-x-1/2 translate-y-1/2 group-hover:scale-150 transition-transform duration-700"></div>

                    <div className="relative z-10 transform-style-3d group-hover:translate-z-10 transition-transform duration-500">
                        <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Digital Presence?</h2>
                        <p className="text-blue-100 mb-10 max-w-2xl mx-auto text-lg">
                            Stop guessing and start growing. Book a free consultation today and let's map out your path to market dominance.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link
                                to="/contact"
                                className="inline-block bg-[#ff6b35] text-white px-10 py-5 rounded-xl font-bold hover:bg-[#e55a2b] transition-all hover:shadow-[0_0_30px_rgba(255,107,53,0.5)] hover:-translate-y-1 hover:scale-105"
                            >
                                Get Your Free Proposal
                            </Link>
                            <Link
                                to="/portfolio"
                                className="inline-block bg-transparent border-2 border-white/20 text-white px-10 py-5 rounded-xl font-bold hover:bg-white/10 transition-all hover:-translate-y-1 hover:border-white"
                            >
                                View Case Studies
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
