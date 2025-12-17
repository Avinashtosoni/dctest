import { useState } from 'react';
import { Search, Loader2, Gauge, Smartphone, Monitor, AlertCircle, Zap } from 'lucide-react';
import { testGooglePageSpeed } from '../../services/apiTester';

export default function PageSpeedTest() {
    const [url, setUrl] = useState('');
    const [apiKey, setApiKey] = useState(''); // Optional: Allow user to input their own key for real data
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            // If we have an API key, try to fetch real data
            if (apiKey) {
                const apiResult = await testGooglePageSpeed(apiKey, url);
                if (apiResult.success) {
                    setResult(apiResult.data.lighthouseResult);
                } else {
                    throw new Error(apiResult.message);
                }
            } else {
                // Mock Simulation for Demo purposes if no key provided
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Deterministic mock based on URL length to make it feel somewhat "real"
                const score = Math.max(50, Math.min(99, Math.floor(url.length * 1.5) % 40 + 60));

                setResult({
                    categories: {
                        performance: { score: score / 100 }
                    },
                    audits: {
                        'largest-contentful-paint': { displayValue: `${(Math.random() * 2 + 1).toFixed(1)}s`, score: Math.random() },
                        'first-input-delay': { displayValue: `${Math.floor(Math.random() * 100)}ms`, score: Math.random() },
                        'cumulative-layout-shift': { displayValue: (Math.random() * 0.1).toFixed(3), score: Math.random() }
                    }
                });
            }
        } catch (err: any) {
            setError(err.message || 'Failed to analyze website. Please check the URL and try again.');
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 0.9) return 'text-green-500 ring-green-500';
        if (score >= 0.5) return 'text-orange-500 ring-orange-500';
        return 'text-red-500 ring-red-500';
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-12 animate-in fade-in-up">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
                        <Gauge className="text-white" size={32} />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Website Speed Test</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Analyze your website's performance and get actionable insights to improve load times and user experience.
                    </p>
                </div>

                {/* Input Section */}
                <div className="bg-white rounded-3xl p-8 shadow-lg shadow-gray-200/50 border border-gray-100 mb-8 animate-in fade-in-up delay-100">
                    <form onSubmit={handleAnalyze} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="url"
                                    required
                                    placeholder="https://example.com"
                                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-lg"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Optional API Key Input for savvy users */}
                        <div>
                            <details className="text-sm text-gray-500 cursor-pointer">
                                <summary className="hover:text-blue-600 transition-colors">Advanced: Use my own PageSpeed API Key</summary>
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        placeholder="Enter Google PageSpeed API Key (Optional)"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Leave empty to use the demo simulation.</p>
                                </div>
                            </details>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !url}
                            className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-2
                                ${loading || !url
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:shadow-blue-500/25 hover:scale-[1.01]'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" /> Analyzing...
                                </>
                            ) : (
                                <>
                                    Analyze Website <Zap size={20} fill="currentColor" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                {/* Results Section */}
                {result && (
                    <div className="space-y-6 animate-in fade-in-up delay-200">

                        {/* Overall Score */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Performance Score</h3>
                            <div className={`relative w-40 h-40 rounded-full border-8 flex items-center justify-center mb-4 ${getScoreColor(result.categories.performance.score)}`}>
                                <span className="text-5xl font-black text-gray-900">
                                    {Math.round(result.categories.performance.score * 100)}
                                </span>
                            </div>
                            <div className="flex gap-8 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div> 0-49
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-orange-500"></div> 50-89
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div> 90-100
                                </div>
                            </div>
                        </div>

                        {/* Core Vital Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                {
                                    label: 'Largest Contentful Paint',
                                    desc: 'Loading performance',
                                    value: result.audits['largest-contentful-paint'].displayValue,
                                    score: result.audits['largest-contentful-paint'].score,
                                    icon: AlertCircle
                                },
                                {
                                    label: 'First Input Delay',
                                    desc: 'Interactivity',
                                    value: result.audits['first-input-delay'].displayValue || 'N/A', // FID might be missing in lab data sometimes
                                    score: result.audits['first-input-delay'].score || 1,
                                    icon: Smartphone
                                },
                                {
                                    label: 'Cumulative Layout Shift',
                                    desc: 'Visual stability',
                                    value: result.audits['cumulative-layout-shift'].displayValue,
                                    score: result.audits['cumulative-layout-shift'].score,
                                    icon: Monitor
                                }
                            ].map((metric, i) => (
                                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-2 rounded-lg ${metric.score < 0.5 ? 'bg-red-50 text-red-600' : metric.score < 0.9 ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>
                                            <metric.icon size={20} />
                                        </div>
                                        <span className={`text-sm font-bold px-2 py-1 rounded-full ${metric.score < 0.5 ? 'bg-red-100 text-red-700' : metric.score < 0.9 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                                            {metric.score < 0.5 ? 'Poor' : metric.score < 0.9 ? 'Needs Improvement' : 'Good'}
                                        </span>
                                    </div>
                                    <h4 className="text-gray-500 text-sm font-medium mb-1">{metric.label}</h4>
                                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                                    <p className="text-xs text-gray-400 mt-2">{metric.desc}</p>
                                </div>
                            ))}
                        </div>

                        {/* Actionable Recommendations (Mocked for Demo, usually from audits) */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Optimization Opportunities</h3>
                            <div className="space-y-4">
                                {[
                                    { title: 'Reduce unused JavaScript', save: '1.2s', impact: 'High' },
                                    { title: 'Serve images in next-gen formats', save: '0.8s', impact: 'Medium' },
                                    { title: 'Eliminate render-blocking resources', save: '0.5s', impact: 'High' },
                                    { title: 'Minify CSS', save: '0.15s', impact: 'Low' }
                                ].map((rec, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <AlertCircle className="text-amber-500" size={20} />
                                            <span className="font-medium text-gray-800">{rec.title}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm text-gray-500">Save {rec.save}</span>
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${rec.impact === 'High' ? 'bg-red-100 text-red-700' :
                                                rec.impact === 'Medium' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                                                }`}>
                                                {rec.impact}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}
