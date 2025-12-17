import { Link } from 'react-router-dom';
import { Search, Calculator, BarChart2, Globe, ArrowRight, CheckCircle, CreditCard, Camera, Zap } from 'lucide-react';
import SEO from './SEO';

const tools = [
    {
        id: 'seo-analysis',
        name: 'SEO Analysis',
        description: 'Get a comprehensive SEO score and actionable insights to improve your ranking.',
        icon: Search,
        path: '/tools/seo-analysis',
        color: 'bg-blue-500',
        gradient: 'from-blue-500 to-cyan-500'
    },
    {
        id: 'social-media-check',
        name: 'Social Media Health',
        description: 'Audit your social presence and get tips to boost engagement and reach.',
        icon: Globe,
        path: '/tools/social-media-check',
        color: 'bg-purple-500',
        gradient: 'from-purple-500 to-pink-500'
    },
    {
        id: 'roi-calculator',
        name: 'ROI Calculator',
        description: 'Calculate your potential return on ad spend and campaign profitability.',
        icon: Calculator,
        path: '/tools/roi-calculator',
        color: 'bg-green-500',
        gradient: 'from-green-500 to-emerald-500'
    },
    {
        id: 'website-audit',
        name: 'Free Website Audit',
        description: 'Full technical scan of your website performance, security, and mobile-friendliness.',
        icon: BarChart2,
        path: '/free-website-audit',
        color: 'bg-orange-500',
        gradient: 'from-orange-500 to-red-500'
    },
    {
        id: 'id-card-generator',
        name: 'ID Card Generator',
        description: 'Create professional ID cards instantly. Customize fields, layout, and download.',
        icon: CreditCard,
        path: '/tools/id-card-generator',
        color: 'bg-indigo-500',
        gradient: 'from-indigo-500 to-violet-500'
    },
    {
        id: 'passport-photo',
        name: 'Passport Photo Maker',
        description: 'Generate printable passport photo sheets (4x6, A4) from a single selfie.',
        icon: Camera,
        path: '/tools/passport-photo-maker',
        color: 'bg-rose-500',
        gradient: 'from-rose-500 to-pink-500'
    },
    {
        id: 'page-speed',
        name: 'Website Speed Test',
        description: 'Instant loading speed analysis with Core Web Vitals and optimization tips.',
        icon: Zap,
        path: '/tools/page-speed-test',
        color: 'bg-yellow-500',
        gradient: 'from-yellow-400 to-orange-500'
    }
];

export default function ToolsPage() {
    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12">
            <SEO
                title="Free Digital Marketing Tools"
                description="Use our free tools including SEO Analyzer, ROI Calculator, and Page Speed Test to optimize your business."
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Hero Section */}
                <div className="text-center mb-16 fade-in-up">
                    <span className="text-[#ff6b35] font-bold tracking-wider uppercase text-sm">Free Resources</span>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 mt-2">
                        Powerful Tools for <span className="text-[#01478c]">Growth</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Stop guessing. Use our free interactive tools to analyze, optimize, and scale your digital presence today.
                    </p>
                </div>

                {/* Tools Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {tools.map((tool) => (
                        <Link
                            key={tool.id}
                            to={tool.path}
                            className="group bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:border-[#ff6b35]/20 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                        >
                            {/* Hover Gradient Overlay */}
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-10 rounded-bl-[100px] transition-opacity`}></div>

                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-white bg-gradient-to-br ${tool.gradient} shadow-lg group-hover:scale-110 transition-transform`}>
                                <tool.icon size={28} />
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#01478c] transition-colors">{tool.name}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed mb-6">
                                {tool.description}
                            </p>

                            <div className="flex items-center text-[#ff6b35] font-bold text-sm group-hover:translate-x-1 transition-transform">
                                Try Now <ArrowRight size={16} className="ml-2" />
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Value Prop Section */}
                <div className="mt-24 bg-[#01478c] rounded-3xl p-8 md:p-16 text-white relative overflow-hidden text-center">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="relative z-10 max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold mb-6">Why Use Our Tools?</h2>
                        <div className="grid sm:grid-cols-3 gap-8 text-left">
                            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/10">
                                <CheckCircle className="text-[#ff6b35] mb-4" size={28} />
                                <h4 className="font-bold text-lg mb-2">Instant Results</h4>
                                <p className="text-white/70 text-sm">No waiting. Get your reports and calculations generated in seconds.</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/10">
                                <CheckCircle className="text-[#ff6b35] mb-4" size={28} />
                                <h4 className="font-bold text-lg mb-2">Actionable Data</h4>
                                <p className="text-white/70 text-sm">Don't just get numbers. Get clear next steps to improve your business.</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/10">
                                <CheckCircle className="text-[#ff6b35] mb-4" size={28} />
                                <h4 className="font-bold text-lg mb-2">Completely Free</h4>
                                <p className="text-white/70 text-sm">Professional grade tools available to you at zero cost.</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
