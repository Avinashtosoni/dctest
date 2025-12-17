import { CheckCircle, HelpCircle } from 'lucide-react';
import { useEffect } from 'react';

import SEO from './SEO';

export default function PricingPage() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const plans = [
        {
            name: 'Starter',
            price: '₹999',
            period: '/month',
            description: 'Perfect for small businesses just getting started.',
            features: ['SEO Audit & Strategy', '5 Social Media Posts/mo', 'Google Business Profile', 'Monthly Reporting', 'Email Support'],
            cta: 'Get Started',
            popular: false
        },
        {
            name: 'Professional',
            price: '₹1,499',
            period: '/month',
            description: 'Comprehensive growth solution for established brands.',
            features: ['Advanced SEO & Backlinks', '12 Social Media Posts/mo', 'Content Marketing (2 Blogs)', 'PPC Campaign Management', 'Bi-Weekly Reporting', 'Priority Support'],
            cta: 'Choose Professional',
            popular: true
        },
        {
            name: 'Enterprise',
            price: 'Custom',
            period: '',
            description: 'Tailored solutions for large-scale operations.',
            features: ['Full-Service Digital Marketing', 'Unlimited Social Media', 'Custom Web Development', 'Dedicated Account Manager', '24/7 Support', 'Real-Time Dashboard'],
            cta: 'Contact Sales',
            popular: false
        }
    ];

    return (
        <div className="pt-0 pb-16 overflow-hidden">
            <SEO
                title="Pricing Plans"
                description="Transparent pricing for digital marketing packages. Choose from Starter, Professional, or Enterprise plans."
            />
            {/* Hero */}
            <div className="relative bg-[#01478c] text-white py-24 mb-16 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 fade-in-up">Transparent Pricing</h1>
                    <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto fade-in-up delay-100 font-light">
                        Choose the perfect plan to fuel your growth. No hidden fees, cancel anytime.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-3 gap-8 items-center">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`relative bg-white rounded-2xl shadow-xl p-8 border hover:border-transparent hover:-translate-y-4 transition-all duration-300 hover:shadow-[0_0_40px_rgba(1,71,140,0.5)] fade-in-up ${plan.popular
                                ? 'border-[#ff6b35] md:-mt-8 md:mb-8 z-10 shadow-[0_0_30px_rgba(1,71,140,0.3)]'
                                : 'border-gray-100'
                                }`}
                            style={{ animationDelay: `${index * 150}ms` }}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#ff6b35] text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wide">
                                    Most Popular
                                </div>
                            )}
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                            <p className="text-gray-500 mb-6 text-sm">{plan.description}</p>
                            <div className="flex items-baseline mb-6">
                                <span className="text-4xl font-extrabold text-[#01478c]">{plan.price}</span>
                                <span className="text-gray-500 ml-1">{plan.period}</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start">
                                        <CheckCircle size={20} className="text-green-500 mr-3 flex-shrink-0" />
                                        <span className="text-gray-600 text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <button className={`w-full py-4 rounded-lg font-bold transition-all hover-grow ${plan.popular
                                ? 'bg-[#ff6b35] text-white hover:bg-[#e55a2b]'
                                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                }`}>
                                {plan.cta}
                            </button>
                        </div>
                    ))}
                </div>

                {/* FAQ Section */}
                <div className="mt-24 max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Common Questions</h2>
                    <div className="space-y-6">
                        <div className="bg-gray-50 p-6 rounded-xl">
                            <h3 className="font-bold text-gray-900 mb-2 flex items-center"><HelpCircle size={18} className="mr-2 text-[#01478c]" /> Can I switch plans later?</h3>
                            <p className="text-gray-600 ml-6">Absolutely! You can upgrade or downgrade your plan at any time based on your business needs.</p>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-xl">
                            <h3 className="font-bold text-gray-900 mb-2 flex items-center"><HelpCircle size={18} className="mr-2 text-[#01478c]" /> Is there a long-term contract?</h3>
                            <p className="text-gray-600 ml-6">For our Starter and Professional plans, we operate on a month-to-month basis. Custom Enterprise plans may have annual agreements.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
