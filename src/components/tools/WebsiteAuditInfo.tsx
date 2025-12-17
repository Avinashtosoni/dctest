import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Search, FileText, Zap, Shield, Database, Layout, X, Check } from 'lucide-react';
import { usePageSEO } from '../../hooks/usePageSEO';

export default function WebsiteAuditInfo() {
    usePageSEO({
        title: "Free Website Audit checklist | Professional Site Review",
        description: "Get a comprehensive 50-point website audit. We manually review your SEO, security, performance, and UX. No bots, just expert analysis.",
        keywords: ["website audit checklist", "manual seo review", "ux audit", "site performance test", "free website analysis"]
    });

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const steps = [
        { icon: Search, title: 'Discovery Analysis', desc: 'We start by crawling your entire website to identify broken links, crawl errors, and indexation issues.' },
        { icon: Zap, title: 'Performance Lab', desc: 'Speed testing across mobile and desktop devices, checking Core Web Vitals and load times.' },
        { icon: Layout, title: 'UX & UI Review', desc: 'Evaluating navigation logic, conversion paths, and mobile responsiveness.' },
        { icon: Database, title: 'Technical SEO', desc: 'Deep dive into schema markup, meta tags, sitemaps, and canonical URLs.' },
        { icon: Shield, title: 'Security Check', desc: 'SSL validation, vulnerability scanning, and malware detection.' },
        { icon: FileText, title: 'Strategy Report', desc: 'You get a 20+ page roadmap detailing every issue and exactly how to fix it.' }
    ];

    return (
        <div className="pt-0 pb-16 overflow-hidden bg-gray-50">
            {/* Hero */}
            <div className="relative bg-gray-900 text-white py-24 mb-16 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-10"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-flex items-center px-4 py-1 rounded-full bg-blue-900/50 border border-blue-500/30 text-blue-300 text-sm font-medium mb-6">
                        <CheckCircle size={14} className="mr-2" /> 100% Free • No Credit Card Required
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">Comprehensive Website Audit</h1>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto font-light">
                        Stop guessing why your traffic isn't converting. Our forensic audit reveals the hidden technical issues holding your business back.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Value Prop */}
                <div className="text-center mb-20 fade-in-up">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">What We Check</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">Most free audits only check meta tags. We go deeper. Our 6-step manual and automated review covers over 200 touchpoints.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
                    {steps.map((step, i) => (
                        <div key={i} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:border-blue-500 hover:shadow-xl transition-all duration-300 group">
                            <div className="w-14 h-14 bg-blue-50 text-[#01478c] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#01478c] group-hover:text-white transition-colors">
                                <step.icon size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                            <p className="text-gray-600 leading-relaxed text-sm">{step.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Comparison Section */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12 mb-24 relative overflow-hidden">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Manual Audit?</h2>
                        <p className="text-gray-500">How we stack up against instant generic tools.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-0 border border-gray-200 rounded-2xl overflow-hidden">
                        {/* Generic Tools */}
                        <div className="bg-gray-50 p-8 border-b md:border-b-0 md:border-r border-gray-200 text-center">
                            <h3 className="text-lg font-bold text-gray-500 mb-6">Generic Instant Tools</h3>
                            <ul className="space-y-4 text-left max-w-xs mx-auto text-gray-400">
                                <li className="flex items-center gap-3"><X size={18} /> Surface-level scan</li>
                                <li className="flex items-center gap-3"><X size={18} /> Lots of false positives</li>
                                <li className="flex items-center gap-3"><X size={18} /> No human context</li>
                                <li className="flex items-center gap-3"><X size={18} /> Generic advice</li>
                            </ul>
                        </div>

                        {/* Our Audit */}
                        <div className="bg-white p-8 text-center relative">
                            <div className="absolute top-0 right-0 bg-[#01478c] text-white text-xs font-bold px-3 py-1 rounded-bl-xl">RECOMMENDED</div>
                            <h3 className="text-lg font-bold text-[#01478c] mb-6">Digital Comrade Audit</h3>
                            <ul className="space-y-4 text-left max-w-xs mx-auto text-gray-800 font-medium">
                                <li className="flex items-center gap-3"><Check size={18} className="text-green-500" /> Human Expert Review</li>
                                <li className="flex items-center gap-3"><Check size={18} className="text-green-500" /> Deep Technical Analysis</li>
                                <li className="flex items-center gap-3"><Check size={18} className="text-green-500" /> Custom Strategy Roadmap</li>
                                <li className="flex items-center gap-3"><Check size={18} className="text-green-500" /> Prioritized Action Items</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Example Report Preview / CTA Section */}
                <div className="bg-[#01478c] rounded-3xl p-12 md:p-20 text-center text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to uncover your potential?</h2>
                        <p className="text-blue-100 mb-10 text-lg max-w-2xl mx-auto">
                            Get your free audit delivered to your inbox within 24 hours. No automation bots, just real expert analysis.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link to="/contact" className="bg-[#ff6b35] text-white px-10 py-4 rounded-xl font-bold hover:bg-[#e55a2b] transition-all hover:shadow-[0_0_30px_rgba(255,107,53,0.5)] transform hover:-translate-y-1">
                                Get Your Free Audit
                            </Link>
                            <Link to="/services" className="bg-transparent border-2 border-white/20 text-white px-10 py-4 rounded-xl font-bold hover:bg-white/10 transition-colors">
                                Explore All Services
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
