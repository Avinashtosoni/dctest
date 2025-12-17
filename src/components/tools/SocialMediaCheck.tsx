import { useState, useEffect } from 'react';
import { Search, Printer, TrendingUp, Users, MessageCircle, Share2, Instagram, Facebook, Youtube, Heart, BarChart2 } from 'lucide-react';
import { usePageSEO } from '../../hooks/usePageSEO';

export default function SocialMediaCheck() {
    usePageSEO({
        title: "Free Social Media Audit Tool | Instagram & Facebook Usage Checker",
        description: "Analyze your social media profile performance. Check engagement rates, follower growth, and get actionable tips for Instagram, Facebook, and YouTube.",
        keywords: ["social media audit", "instagram engagement calculator", "facebook page check", "social media analytics", "influencer audit"]
    });

    const [handle, setHandle] = useState('');
    const [platform, setPlatform] = useState('instagram');
    const [scanning, setScanning] = useState(false);
    const [report, setReport] = useState<any>(null);

    const handleScan = (e: React.FormEvent) => {
        e.preventDefault();
        if (!handle) return;
        setScanning(true);
        setReport(null);

        // Simulate API call
        setTimeout(() => {
            setScanning(false);
            setReport({
                username: handle,
                followers: '12.5k',
                engagementRate: '4.8%',
                avgLikes: '842',
                avgComments: '64',
                growth: [10200, 10800, 11500, 11900, 12500], // Last 5 months
                topPosts: [
                    { type: 'image', likes: 1200, comments: 85, date: '2 days ago' },
                    { type: 'video', likes: 3500, comments: 210, date: '1 week ago' },
                    { type: 'carousel', likes: 980, comments: 45, date: '2 weeks ago' },
                ]
            });
        }, 2000);
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="pt-0 pb-16 min-h-screen bg-gray-50">
            {/* Hero */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-20 mb-12 relative overflow-hidden print:hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Social Media Auditor</h1>
                    <p className="text-xl text-white/90 max-w-2xl mx-auto font-light">
                        Unlock insights into your social performance. Analyze engagement, follower growth, and content effectiveness.
                    </p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Input Card */}
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100 -mt-20 relative z-20 mb-12 print:hidden">
                    <div className="flex gap-4 justify-center mb-6">
                        <button
                            onClick={() => setPlatform('instagram')}
                            className={`p-4 rounded-xl border-2 transition-all ${platform === 'instagram' ? 'border-pink-500 bg-pink-50 text-pink-600' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                        >
                            <Instagram size={28} />
                        </button>
                        <button
                            onClick={() => setPlatform('facebook')}
                            className={`p-4 rounded-xl border-2 transition-all ${platform === 'facebook' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                        >
                            <Facebook size={28} />
                        </button>
                        <button
                            onClick={() => setPlatform('youtube')}
                            className={`p-4 rounded-xl border-2 transition-all ${platform === 'youtube' ? 'border-red-600 bg-red-50 text-red-600' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                        >
                            <Youtube size={28} />
                        </button>
                    </div>

                    <form onSubmit={handleScan} className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
                        <div className="flex-grow relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold text-lg">@</span>
                            <input
                                type="text"
                                placeholder="username"
                                className="w-full pl-10 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-pink-500 focus:ring-0 text-lg outline-none transition-all"
                                value={handle}
                                onChange={(e) => setHandle(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={scanning}
                            className={`px-8 py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-black transition-all hover:shadow-lg min-w-[160px] ${scanning ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {scanning ? 'Auditing...' : 'Check'}
                        </button>
                    </form>
                </div>

                {/* Report Section */}
                {report && (
                    <div className="animate-fade-in">
                        <div className="flex justify-between items-center mb-8 print:hidden">
                            <h2 className="text-2xl font-bold text-gray-900">Audit for <span className="text-pink-600">@{report.username}</span></h2>
                            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors">
                                <Printer size={18} /> Print
                            </button>
                        </div>

                        {/* Print Header */}
                        <div className="hidden print:block mb-8 text-center border-b pb-4">
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">Social Media Audit</h1>
                            <p className="text-gray-500">Platform: {platform.charAt(0).toUpperCase() + platform.slice(1)} | @{report.username}</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                                <Users className="mx-auto text-blue-500 mb-2" size={24} />
                                <div className="text-3xl font-bold text-gray-900">{report.followers}</div>
                                <div className="text-gray-500 text-xs font-bold uppercase">Followers</div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                                <BarChart2 className="mx-auto text-green-500 mb-2" size={24} />
                                <div className="text-3xl font-bold text-gray-900">{report.engagementRate}</div>
                                <div className="text-gray-500 text-xs font-bold uppercase">Engagement Rate</div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                                <Heart className="mx-auto text-pink-500 mb-2" size={24} />
                                <div className="text-3xl font-bold text-gray-900">{report.avgLikes}</div>
                                <div className="text-gray-500 text-xs font-bold uppercase">Avg. Likes</div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                                <MessageCircle className="mx-auto text-purple-500 mb-2" size={24} />
                                <div className="text-3xl font-bold text-gray-900">{report.avgComments}</div>
                                <div className="text-gray-500 text-xs font-bold uppercase">Avg. Comments</div>
                            </div>
                        </div>

                        {/* Recent Performance Simulation */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-12">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Last 5 Months Growth</h3>
                            <div className="h-64 flex items-end justify-between gap-2">
                                {report.growth.map((val: number, i: number) => {
                                    const max = Math.max(...report.growth);
                                    const height = (val / max) * 100;
                                    return (
                                        <div key={i} className="flex-1 flex flex-col justify-end group">
                                            <div
                                                className="bg-purple-100 group-hover:bg-purple-200 rounded-t-lg transition-all relative"
                                                style={{ height: `${height}%` }}
                                            >
                                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {val}
                                                </div>
                                            </div>
                                            <div className="text-center text-xs text-gray-500 mt-2">M-{i + 1}</div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* CTA */}
                        {report.engagementRate.replace('%', '') < 5 && (
                            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
                                <div>
                                    <h4 className="font-bold text-yellow-800 text-lg">Boost Your Engagement?</h4>
                                    <p className="text-yellow-700 text-sm">Your engagement rate is slightly below industry average. We can help you create viral content.</p>
                                </div>
                                <button className="bg-yellow-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-yellow-700 transition-colors whitespace-nowrap">
                                    Talk to an Expert
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* SEO Content Sections */}
                <div className="mt-20 print:hidden space-y-20 mb-20">
                    {/* Section 1: Visual Engagement */}
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="bg-gradient-to-tr from-pink-100 to-purple-100 p-8 rounded-3xl">
                            <img
                                src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=600"
                                alt="Social Media Strategy"
                                className="w-full h-auto rounded-xl shadow-lg transform rotate-2 hover:rotate-0 transition-all duration-500"
                            />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Audit Your Social Media?</h2>
                            <p className="text-gray-600 mb-4 leading-relaxed">
                                Social media is noisy. To stand out, you need to understand what's working and what isn't. An audit helps you:
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-start">
                                    <span className="bg-pink-100 text-pink-600 p-1 rounded-full mr-3 mt-1"><TrendingUp size={16} /></span>
                                    <span className="text-gray-700">Identify top-performing content formats (Video vs Static).</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="bg-pink-100 text-pink-600 p-1 rounded-full mr-3 mt-1"><Users size={16} /></span>
                                    <span className="text-gray-700">Analyze audience demographics and behavior.</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="bg-pink-100 text-pink-600 p-1 rounded-full mr-3 mt-1"><BarChart2 size={16} /></span>
                                    <span className="text-gray-700">Optimize posting times for maximum reach.</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Section 2: Engagement Metrics */}
                    <div className="bg-gray-900 text-white rounded-3xl p-8 md:p-12 text-center">
                        <h2 className="text-3xl font-bold mb-6">Engagement Rate Formula</h2>
                        <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                            The "Golden Metric" of social media. It proves whether people actually care about your content.
                        </p>
                        <div className="inline-block bg-white/10 backdrop-blur-md px-8 py-6 rounded-2xl border border-white/20">
                            <span className="font-mono text-xl md:text-2xl tracking-wide">
                                ((Likes + Comments + Shares) / Followers) × 100
                            </span>
                        </div>
                        <p className="mt-8 text-sm text-gray-500">
                            *A "Good" rate is typically between 1% - 3.5%. Above 6% is viral territory.
                        </p>
                    </div>

                    {/* FAQ Section */}
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Social Media FAQs</h2>
                        <div className="space-y-4">
                            {[
                                { q: "How often should I post on Instagram?", a: "Consistency beats frequency. For most brands, 3-5 high-quality posts per week is better than daily spam. Stories, however, should be daily." },
                                { q: "Why is my engagement dropping?", a: "Algorithms change constantly. Common reasons include: shadowbanning, irrelevant hashtags, poor quality visuals, or simply posting at the wrong time." },
                                { q: "Do fake followers hurt my account?", a: "Yes, drastically. They lower your engagement rate because they don't interact, signaling to the algorithm that your content isn't interesting." },
                            ].map((faq, i) => (
                                <details key={i} className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <summary className="flex justify-between items-center p-6 cursor-pointer list-none font-bold text-gray-800 hover:bg-gray-50 transition-colors">
                                        {faq.q}
                                        <span className="transform group-open:rotate-180 transition-transform duration-200 text-[#01478c]">▼</span>
                                    </summary>
                                    <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                                        {faq.a}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
