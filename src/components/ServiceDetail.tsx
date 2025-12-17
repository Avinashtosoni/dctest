import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Award, ArrowUpRight, Star, Plus, Minus, Wrench, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { servicesData } from '../data/services';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import SEO from './SEO';

export default function ServiceDetail() {
    const { id } = useParams();
    const service = servicesData.find(s => s.id === id);
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        setIsMobileMenuOpen(false); // Close menu on route change

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [id]);

    if (!service) {
        return (
            <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Not Found</h2>
                <Link to="/" className="text-[#01478c] hover:underline flex items-center">
                    <ArrowLeft size={20} className="mr-2" /> Back to Home
                </Link>
            </div>
        );
    }

    const Icon = service.icon;

    return (
        <div className="min-h-screen bg-white pb-24">
            <SEO
                title={service.title}
                description={service.subtitle}
            />
            {/* 1. Hero Section with Integrated Header */}
            <div className={`relative bg-gradient-to-br ${service.gradient} text-white overflow-hidden`}>
                <div className={`absolute top-0 right-0 w-96 h-96 ${service.blobColor} rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float`}></div>
                <div className={`absolute bottom-0 left-0 w-96 h-96 ${service.blobColor} rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-delayed`}></div>

                {/* Sticky Navbar */}
                <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-lg shadow-sm py-4' : 'bg-transparent py-8'}`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                        {/* Logo Area */}
                        <Link to="/" className={`flex items-center space-x-2 group ${isScrolled ? 'text-[#01478c]' : 'text-white'}`}>
                            <div className="bg-white p-1 rounded-lg">
                                <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                            </div>
                            <span className="text-xl font-bold tracking-tight hidden sm:block">Digital Comrade</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center justify-center flex-1 mx-8">
                            <nav className={`flex items-center space-x-1 px-2 py-1.5 rounded-full border shadow-sm transition-all ${isScrolled ? 'bg-gray-100/50 border-gray-200' : 'bg-white/10 border-white/10 backdrop-blur-md'}`}>
                                {[
                                    { name: 'Home', path: '/' },
                                    { name: 'Services', path: '/services' },
                                    { name: 'Portfolio', path: '/portfolio' },
                                    { name: 'Pricing', path: '/pricing' },
                                    { name: 'Blog', path: '/blog' },
                                    { name: 'About', path: '/about' }
                                ].map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${isScrolled
                                            ? 'text-gray-600 hover:text-[#01478c] hover:bg-white'
                                            : 'text-white/90 hover:text-white hover:bg-white/10'
                                            }`}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center gap-3">
                            {/* Desktop CTA */}
                            <Link to="/contact" className={`hidden md:inline-flex px-5 py-2.5 rounded-full font-bold text-sm hover:shadow-lg hover:scale-105 transition-all ${isScrolled ? 'bg-[#ff6b35] text-white' : 'bg-white text-[#01478c]'}`}>
                                Get Quote
                            </Link>

                            {/* Mobile Menu Trigger */}
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className={`md:hidden p-2 rounded-full backdrop-blur-md border transition-colors ${isScrolled ? 'bg-gray-100 text-gray-900 border-gray-200' : 'bg-white/10 text-white border-white/10 hover:bg-white/20'}`}
                                aria-label="Open Service Menu"
                            >
                                <Menu size={24} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Hero Content - Added padding-top to account for fixed header if needed, but hero usually large enough */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 relative z-10 text-center">
                    <div className="inline-flex items-center justify-center p-4 bg-white/10 backdrop-blur-md rounded-2xl mb-8 border border-white/20 shadow-2xl animate-float">
                        <Icon size={56} className="text-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-6 tracking-tight fade-in-up">{service.title}</h1>
                    <p className="text-lg md:text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto font-light leading-relaxed fade-in-up delay-100">{service.subtitle}</p>

                    <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center fade-in-up delay-200">
                        <button className="px-8 py-4 bg-white text-[#01478c] rounded-full font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                            Get Free Proposal
                        </button>
                        <button className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center">
                            <Star className="mr-2" size={20} /> View Case Studies
                        </button>
                    </div>
                </div>

                {/* Desktop Service Switcher (Bottom of Hero) - Hidden on Mobile */}
                <div className="hidden md:block border-t border-white/10 bg-black/10 backdrop-blur-md">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-center py-4 gap-2">
                            {servicesData.map((s) => (
                                <Link
                                    key={s.id}
                                    to={`/services/${s.id}`}
                                    className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${s.id === service.id
                                        ? 'bg-white text-[#01478c] shadow-md'
                                        : 'text-white/80 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    {s.title}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Drawer Navigation */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden flex justify-end">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsMobileMenuOpen(false)}></div>

                    {/* Drawer */}
                    <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col animate-slide-left">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg text-gray-900">Our Services</h3>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-white rounded-full text-gray-500 hover:text-gray-900 shadow-sm border border-gray-200">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {servicesData.map((s) => (
                                <Link
                                    key={s.id}
                                    to={`/services/${s.id}`}
                                    className={`flex items-center p-3 rounded-xl font-medium transition-all ${s.id === service.id
                                        ? 'bg-[#01478c]/5 text-[#01478c] border border-[#01478c]/10'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <span className={`w-2 h-2 rounded-full mr-3 ${s.id === service.id ? 'bg-[#01478c]' : 'bg-gray-300'}`}></span>
                                    {s.title}
                                </Link>
                            ))}
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-gray-50">
                            <button className="w-full py-3 bg-[#01478c] text-white rounded-xl font-bold text-sm">
                                Get a Quote
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. Brand Ticker (Full Width) */}
            {service.brandIcons && (
                <div className="border-b border-gray-100 bg-gray-50/50 overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <p className="text-center text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6">Platforms We Master</p>
                        <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-80 grayscale hover:grayscale-0 transition-all duration-500">
                            {service.brandIcons.map((brand, i) => (
                                <div key={i} className="flex items-center gap-2 group cursor-default">
                                    <brand.icon size={28} style={{ color: brand.color }} className="group-hover:scale-110 transition-transform" />
                                    <span className="font-bold text-gray-700 hidden sm:block">{brand.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 3. Bento Grid - Impact & Why (Modern Layout) */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)]">

                    {/* Intro Block - Full Width on Mobile */}
                    <div className="md:col-span-2 md:row-span-2 bg-gray-900 rounded-3xl p-8 md:p-10 text-white flex flex-col justify-center relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${service.gradient} opacity-20 rounded-full blur-3xl group-hover:opacity-30 transition-opacity`}></div>
                        <h2 className="text-2xl md:text-3xl font-bold mb-4 relative z-10">Why {service.title}?</h2>
                        <p className="text-gray-300 text-base md:text-lg leading-relaxed relative z-10">{service.longDescription}</p>
                    </div>

                    {/* Stat Blocks - Stack on Mobile */}
                    {service.impactStats?.map((stat, i) => (
                        <div key={i} className="bg-gray-50 rounded-3xl p-6 md:p-8 flex flex-col justify-center items-center hover:bg-white hover:shadow-xl border border-gray-100 transition-all duration-300 group">
                            <div className={`text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${service.gradient} mb-2 group-hover:scale-110 transition-transform`}>
                                {stat.value}<span className="text-2xl">{stat.suffix}</span>
                            </div>
                            <div className="text-gray-500 font-medium uppercase tracking-wide text-xs">{stat.label}</div>
                        </div>
                    ))}

                    {/* "Why It Matters" Keypoints - Stack on Mobile */}
                    {service.whyMatters?.map((item, i) => (
                        <div key={i} className={`md:col-span-${i === 0 ? '2' : '1'} bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm hover:border-[#ff6b35] transition-colors relative overflow-hidden`}>
                            <div className="absolute top-4 right-4 text-gray-200">
                                <CheckCircle size={40} />
                            </div>
                            <h3 className="font-bold text-xl text-gray-900 mb-2 relative z-10">{item.title}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed relative z-10">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* 4. NEW: Success Stories (Internal Case Studies) */}
            {service.caseStudies && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 border-t border-gray-100">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                        <div>
                            <span className="text-[#ff6b35] font-bold tracking-wider uppercase text-sm">Success Stories</span>
                            <h2 className="text-3xl font-bold text-gray-900 mt-2">See What's Possible</h2>
                        </div>
                        <Link to="/portfolio" className="text-[#01478c] font-bold hover:underline flex items-center group">
                            View all Case Studies <ArrowUpRight size={18} className="ml-1 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {service.caseStudies.map((study, i) => (
                            <div key={i} className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10"></div>
                                <img src={study.image} alt={study.title} className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute bottom-0 left-0 p-6 z-20 text-white w-full">
                                    <div className="flex gap-2 mb-3">
                                        {study.tags.map((tag, t) => (
                                            <span key={t} className="text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-2 py-1 rounded-md border border-white/10">{tag}</span>
                                        ))}
                                    </div>
                                    <div className="text-3xl font-bold mb-1 text-white">{study.result}</div>
                                    <p className="text-white/80 text-sm font-medium">{study.client} • {study.title}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 5. Dark Mode Charts Section (Full Width, Scrollable on Mobile) */}
            {service.graphData && (
                <div className="bg-[#0f172a] py-16 md:py-24 text-white overflow-hidden relative">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]"></div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold mb-4">Data-Driven Growth</h2>
                            <p className="text-gray-400 max-w-2xl mx-auto text-lg">We don't guess. We track, analyze, and optimize for exponential results.</p>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
                            {/* Chart 1 */}
                            <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white/10">
                                <div className="flex items-center justify-between mb-8">
                                    <h4 className="font-bold text-xl">Projected Follower Growth</h4>
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                        <span className="text-xs text-gray-400">Organic</span>
                                    </div>
                                </div>
                                <div className="h-64 md:h-72 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={service.graphData}>
                                            <defs>
                                                <linearGradient id="colorFollowersDark" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                                            <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} stroke="#94a3b8" />
                                            <YAxis fontSize={12} tickLine={false} axisLine={false} stroke="#94a3b8" />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #334155', color: '#fff' }}
                                            />
                                            <Area type="monotone" dataKey="followers" stroke="#3b82f6" fillOpacity={1} fill="url(#colorFollowersDark)" strokeWidth={3} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Chart 2 */}
                            <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white/10">
                                <div className="flex items-center justify-between mb-8">
                                    <h4 className="font-bold text-xl">Engagement Velocity</h4>
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                        <span className="text-xs text-gray-400">Interactions</span>
                                    </div>
                                </div>
                                <div className="h-64 md:h-72 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={service.graphData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                                            <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} stroke="#94a3b8" />
                                            <YAxis fontSize={12} tickLine={false} axisLine={false} stroke="#94a3b8" />
                                            <Tooltip
                                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                                contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #334155', color: '#fff' }}
                                            />
                                            <Bar dataKey="engagement" fill="#10b981" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 6. Strategy Pipeline (Horizontal Scroll / Modern) */}
            {service.strategySteps && (
                <div className="py-16 md:py-24 bg-gray-50 text-center">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="mb-16">
                            <h2 className="text-3xl font-bold text-gray-900">Our Strategy Pipeline</h2>
                            <div className="h-1 w-20 bg-[#ff6b35] mx-auto mt-4 rounded-full"></div>
                        </div>

                        <div className="relative">
                            {/* Connecting Line (Desktop) */}
                            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0"></div>

                            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                                {service.strategySteps.map((step, index) => (
                                    <div key={index} className="relative z-10 group bg-transparent">
                                        <div className="w-16 h-16 mx-auto bg-white border-4 border-white shadow-lg rounded-full flex items-center justify-center text-xl font-bold text-[#01478c] mb-6 group-hover:scale-110 group-hover:border-[#ff6b35] transition-all duration-300 relative z-20">
                                            {step.id}
                                        </div>
                                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full hover:shadow-md transition-shadow relative z-10">
                                            <h4 className="font-bold text-gray-900 mb-2">{step.title}</h4>
                                            <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 7. Content & Deep Dive (Two Column) */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="grid lg:grid-cols-3 gap-16">
                    <div className="lg:col-span-2 space-y-12">
                        {/* Services List */}
                        {service.subServices && (
                            <div>
                                <h3 className="text-2xl font-bold mb-6">What We Deliver</h3>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {service.subServices.map((sub, i) => (
                                        <div key={i} className="flex items-start p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                            <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
                                            <div>
                                                <h4 className="font-bold text-gray-900">{sub.title}</h4>
                                                <p className="text-sm text-gray-500 mt-1">{sub.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* SEO Content */}
                        {service.seoContent && (
                            <div className="prose prose-lg max-w-none text-gray-600">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4 not-prose">Expert Insights</h3>
                                <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
                                    <p className="text-lg leading-relaxed mb-8 font-medium italic text-gray-700 border-l-4 border-[#ff6b35] pl-4">
                                        "{service.seoContent.intro}"
                                    </p>
                                    <div className="space-y-8">
                                        {service.seoContent.sections.map((section, idx) => (
                                            <div key={idx}>
                                                <h4 className="text-xl font-bold text-gray-900 mb-2">{section.title}</h4>
                                                <p className="leading-relaxed text-base">
                                                    {section.content}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* FAQs */}
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold mb-6">Common Questions</h3>
                            {service.faqs?.map((faq, index) => (
                                <div key={index} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                    <button
                                        onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                                        className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="font-bold text-gray-900">{faq.q}</span>
                                        {openFaqIndex === index ? <Minus size={20} className="text-[#ff6b35]" /> : <Plus size={20} className="text-gray-400" />}
                                    </button>
                                    <div className={`px-6 pb-6 text-gray-600 text-sm leading-relaxed ${openFaqIndex === index ? 'block' : 'hidden'}`}>
                                        {faq.a}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar Area (Now just testimonials or secondary info) */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Testimonial Card */}
                        {service.testimonials && service.testimonials[0] && (
                            <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white p-8 rounded-3xl relative overflow-hidden text-center">
                                <Star size={80} className="absolute -top-4 -right-4 text-white/5" />
                                <div className="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-6">
                                    <Award size={32} className="text-[#ff6b35]" />
                                </div>
                                <p className="text-lg italic text-gray-300 mb-6">"{service.testimonials[0].quote}"</p>
                                <div className="font-bold">{service.testimonials[0].author}</div>
                                <div className="text-sm text-gray-400">{service.testimonials[0].role}</div>
                                <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">{service.testimonials[0].company}</div>
                            </div>
                        )}

                        {/* Tools Cloud */}
                        <div className="bg-white border border-gray-200 p-8 rounded-3xl">
                            <div className="flex items-center mb-6 text-gray-900">
                                <Wrench className="mr-3" size={20} />
                                <h4 className="font-bold text-lg">Tools Stack</h4>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {service.tools?.map((tool, i) => (
                                    <span key={i} className="px-3 py-1 bg-gray-100 rounded-md text-xs font-semibold text-gray-600 border border-gray-200">
                                        {tool}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 8. Related Services Breakdown */}
            <div className="bg-gray-50 py-16 md:py-24 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8">Explore Other Services</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {servicesData.filter(s => s.id !== service.id).slice(0, 3).map((s) => (
                            <Link key={s.id} to={`/services/${s.id}`} className="group p-6 bg-white rounded-2xl border border-gray-200 hover:border-[#ff6b35] hover:shadow-lg transition-all">
                                <div className="p-3 bg-blue-50 rounded-xl inline-block mb-4 group-hover:bg-[#ff6b35]/10 group-hover:text-[#ff6b35] transition-colors text-[#01478c]">
                                    <s.icon size={24} />
                                </div>
                                <h4 className="font-bold text-lg text-gray-900 mb-2">{s.title}</h4>
                                <p className="text-sm text-gray-500">{s.subtitle}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* 9. Sticky Bottom CTA (Mobile & Desktop) */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-lg border-t border-gray-200 z-50 animate-slide-up">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className="hidden md:block">
                        <div className="font-bold text-gray-900">Ready to scale?</div>
                        <div className="text-sm text-gray-500">Book your free 30-minute strategy session.</div>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <button className="flex-1 md:flex-none px-6 py-3 bg-[#ff6b35] text-white rounded-xl font-bold hover:bg-[#e55a2b] transition-all shadow-lg hover:shadow-[#ff6b35]/30">
                            Book Strategy Call
                        </button>
                    </div>
                </div>
            </div>

            {/* Spacer for sticky CTA */}
            <div className="h-24"></div>
        </div>
    );
}
