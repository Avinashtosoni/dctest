import { useState, useEffect } from 'react';
import { Calculator, Printer, Globe, TrendingUp, DollarSign, PieChart, HelpCircle } from 'lucide-react';
import { usePageSEO } from '../../hooks/usePageSEO';

const CURRENCIES = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

export default function RoiCalculator() {
    usePageSEO({
        title: "Marketing ROI Calculator | Forecast Your Ad Spend Returns",
        description: "Calculate your Return on Ad Spend (ROAS) and marketing ROI with our free calculator. Project traffic, leads, and profit based on your budget and CPC.",
        keywords: ["roi calculator", "marketing roi", "roas calculator", "ad budget planner", "marketing metrics"]
    });

    const [currency, setCurrency] = useState(CURRENCIES[0]); // Default to USD
    const [budget, setBudget] = useState(5000);
    const [cpc, setCpc] = useState(2.50);
    const [conversionRate, setConversionRate] = useState(2.5);
    const [saleValue, setSaleValue] = useState(150);
    const [loadingLocation, setLoadingLocation] = useState(true);

    // Derived state for instant validation
    const traffic = Math.floor(budget / (cpc || 0.01));
    const leads = Math.floor(traffic * (conversionRate / 100));
    const revenue = leads * saleValue;
    const profit = revenue - budget;
    const roi = ((profit / (budget || 1)) * 100).toFixed(0);

    useEffect(() => {
        window.scrollTo(0, 0);

        // Auto-detect currency based on IP
        const detectCurrency = async () => {
            try {
                const response = await fetch('https://ipapi.co/json/');
                const data = await response.json();
                const detectedCode = data.currency;

                const foundCurrency = CURRENCIES.find(c => c.code === detectedCode);
                if (foundCurrency) {
                    setCurrency(foundCurrency);
                }
            } catch (error) {
                console.warn('Failed to detect location for currency', error);
            } finally {
                setLoadingLocation(false);
            }
        };

        detectCurrency();
    }, []);

    return (
        <div className="pt-0 pb-16 min-h-screen bg-gray-50">
            {/* Hero */}
            <div className="bg-gray-900 text-white py-20 mb-12 print:hidden relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Marketing ROI Calculator</h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
                        Plan your budget and forecast your returns with precision.
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col lg:flex-row -mt-20 relative z-20 mb-20">

                    {/* Controls */}
                    <div className="p-8 lg:p-12 lg:w-1/2 bg-white print:w-full">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                                <Calculator className="mr-3 text-[#01478c]" /> Input Parameters
                            </h2>
                            {/* Currency Switcher */}
                            <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <select
                                    value={currency.code}
                                    onChange={(e) => {
                                        const selected = CURRENCIES.find(c => c.code === e.target.value);
                                        if (selected) setCurrency(selected);
                                    }}
                                    className="pl-9 pr-4 py-2 border rounded-lg text-sm font-medium bg-gray-50 hover:bg-gray-100 outline-none focus:ring-2 focus:ring-[#01478c]"
                                    disabled={loadingLocation}
                                >
                                    {CURRENCIES.map(c => (
                                        <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="font-bold text-gray-700">Monthly Ad Budget</label>
                                    <span className="text-[#01478c] font-bold">{currency.symbol}{budget.toLocaleString()}</span>
                                </div>
                                <input
                                    type="range" min="500" max="50000" step="100"
                                    value={budget} onChange={(e) => setBudget(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#01478c]"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="font-bold text-gray-700">Cost Per Click (CPC)</label>
                                    <span className="text-[#01478c] font-bold">{currency.symbol}{cpc.toFixed(2)}</span>
                                </div>
                                <input
                                    type="range" min="0.10" max="20.00" step="0.10"
                                    value={cpc} onChange={(e) => setCpc(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#01478c]"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="font-bold text-gray-700">Conversion Rate</label>
                                    <span className="text-[#01478c] font-bold">{conversionRate}%</span>
                                </div>
                                <input
                                    type="range" min="0.1" max="10.0" step="0.1"
                                    value={conversionRate} onChange={(e) => setConversionRate(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#01478c]"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="font-bold text-gray-700">Avg. Sale Value</label>
                                    <span className="text-[#01478c] font-bold">{currency.symbol}{saleValue}</span>
                                </div>
                                <input
                                    type="range" min="10" max="2000" step="10"
                                    value={saleValue} onChange={(e) => setSaleValue(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#01478c]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="p-8 lg:p-12 lg:w-1/2 bg-[#01478c] text-white flex flex-col justify-center print:bg-white print:text-black">
                        <div className="flex justify-between items-start mb-8 print:hidden">
                            <h2 className="text-2xl font-bold">Projected Returns</h2>
                            <button onClick={() => window.print()} className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors">
                                <Printer size={20} />
                            </button>
                        </div>

                        {/* Print Header */}
                        <div className="hidden print:block mb-8 border-b pb-4">
                            <h1 className="text-4xl font-bold text-black mb-2">ROI Projection</h1>
                            <p className="text-gray-500">Based on a budget of {currency.symbol}{budget.toLocaleString()}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm print:bg-gray-100 print:text-black">
                                <div className="text-3xl font-bold mb-1">{traffic.toLocaleString()}</div>
                                <div className="text-xs uppercase tracking-wider opacity-70">Est. Traffic</div>
                            </div>
                            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm print:bg-gray-100 print:text-black">
                                <div className="text-3xl font-bold mb-1">{leads.toLocaleString()}</div>
                                <div className="text-xs uppercase tracking-wider opacity-70">Est. Leads</div>
                            </div>
                            <div className="col-span-2 bg-white/20 p-6 rounded-xl backdrop-blur-md border border-white/10 print:bg-gray-200 print:text-black print:border-none">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <div className="text-sm uppercase tracking-wider opacity-80 mb-2">Projected Revenue</div>
                                        <div className="text-5xl font-bold">{currency.symbol}{revenue.toLocaleString()}</div>
                                    </div>
                                    <div className={`text-xl font-bold ${Number(roi) >= 0 ? 'text-green-300 print:text-green-600' : 'text-red-300 print:text-red-600'}`}>
                                        {roi}% ROI
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p className="text-sm opacity-60 text-center print:hidden">
                            *Estimates based on provided inputs. Actual results may vary based on market conditions.
                        </p>
                    </div>
                </div>

                {/* SEO Content Sections */}
                <div className="grid md:grid-cols-3 gap-8 mb-20 md:mb-32">
                    <div className="md:col-span-2 space-y-16">

                        {/* Intro Section */}
                        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="bg-blue-100 p-3 rounded-xl text-[#01478c]">
                                    <TrendingUp size={32} />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900">Understanding Marketing ROI</h2>
                            </div>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                <strong>Return on Investment (ROI)</strong> is the most critical metric for any marketing campaign.
                                It measures the profitability of your advertising spend. Without tracking ROI, you are essentially
                                flying blind, pouring money into ads without knowing if they are actually generating profit.
                            </p>
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <h3 className="font-bold text-lg mb-3 flex items-center text-gray-800">
                                    <PieChart size={20} className="mr-2 text-green-600" /> The Formula
                                </h3>
                                <p className="font-mono text-lg text-gray-600">
                                    ROI = <span className="inline-block bg-white px-2 py-1 rounded shadow-sm">((Revenue - Ad Cost) / Ad Cost)</span> × 100
                                </p>
                            </div>
                        </div>

                        {/* Glossary */}
                        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="text-2xl font-bold text-gray-900 mb-8">Key Terms Explained</h3>
                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="font-bold text-[#01478c] mb-2 flex items-center"><DollarSign size={18} className="mr-2" /> CPC (Cost Per Click)</h4>
                                    <p className="text-sm text-gray-600 leading-relaxed">The average amount you pay each time a user clicks on your ad. Lower CPC means more traffic for the same budget.</p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#01478c] mb-2 flex items-center"><HelpCircle size={18} className="mr-2" /> Conversion Rate</h4>
                                    <p className="text-sm text-gray-600 leading-relaxed">The percentage of visitors who become paying customers. A 1% increase here can double your profits.</p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#01478c] mb-2 flex items-center"><TrendingUp size={18} className="mr-2" /> Lead Value</h4>
                                    <p className="text-sm text-gray-600 leading-relaxed">The average revenue generated from a single sale. Also known as Average Order Value (AOV).</p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#01478c] mb-2 flex items-center"><PieChart size={18} className="mr-2" /> ROAS</h4>
                                    <p className="text-sm text-gray-600 leading-relaxed">Return on Ad Spend. Specifically looks at revenue vs ad cost, ignoring other overheads.</p>
                                </div>
                            </div>
                        </div>

                        {/* FAQs */}
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h3>
                            {[
                                { q: "What is a 'Good' marketing ROI?", a: "A 5:1 ratio (500% ROI) is generally considered strong for most industries. Anything above 10:1 is exceptional. Below 2:1 is risky." },
                                { q: "Does this calculator include agency fees?", a: "This calculator focuses on Ad Spend ROI (ROAS). To include agency fees, simply add your management fee to the 'Monthly Ad Budget' input." },
                                { q: "How can I improve my Conversion Rate?", a: "Optimizing your landing page speed, using clear calls-to-action (CTAs), and building trust with social proof are the best ways to boost conversion rates." },
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

                    {/* Sidebar / CTA */}
                    <div className="space-y-8">
                        <div className="bg-[#01478c] text-white p-8 rounded-3xl sticky top-24">
                            <h3 className="text-2xl font-bold mb-4">Need Higher ROI?</h3>
                            <p className="mb-6 opacity-90 text-sm leading-relaxed">
                                Stop guessing. Our data-driven strategies have helped clients achieve up to <strong>1200% ROI</strong> on their ad spend.
                            </p>
                            <ul className="space-y-3 mb-8 text-sm">
                                <li className="flex items-center"><div className="w-1.5 h-1.5 bg-[#ff6b35] rounded-full mr-3"></div> Google Ads Optimization</li>
                                <li className="flex items-center"><div className="w-1.5 h-1.5 bg-[#ff6b35] rounded-full mr-3"></div> High-Converting Landing Pages</li>
                                <li className="flex items-center"><div className="w-1.5 h-1.5 bg-[#ff6b35] rounded-full mr-3"></div> Precision Audience Targeting</li>
                            </ul>
                            <button className="w-full py-4 bg-[#ff6b35] text-white rounded-xl font-bold hover:bg-[#e55a2b] transition-all shadow-lg hover:-translate-y-1">
                                Book a Strategy Call
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
