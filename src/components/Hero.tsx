import { Search, TrendingUp, Zap, FileText } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { showFormSuccessMessage, showFormErrorMessage } from '../lib/formHelpers';

export default function Hero() {
  const [activeTab, setActiveTab] = useState<'quote' | 'audit'>('quote');

  // Quote Form State
  const [quoteData, setQuoteData] = useState({
    name: '',
    email: '',
    phone: '',
    service: 'Select Service',
    guaranteed_results: false,
    premium_support: false
  });
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);

  // SEO Audit Form State
  const [auditData, setAuditData] = useState({
    website_url: '',
    name: '',
    email: '',
    industry: 'Industry Type',
    phone: ''
  });
  const [isSubmittingAudit, setIsSubmittingAudit] = useState(false);

  // Quote Form Handlers
  const handleQuoteChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setQuoteData({ ...quoteData, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setQuoteData({ ...quoteData, [name]: value });
    }
  };

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingQuote(true);

    try {
      const { error } = await supabase
        .from('form_submissions')
        .insert([{
          form_type: 'quote',
          name: quoteData.name,
          email: quoteData.email,
          phone: quoteData.phone,
          service: quoteData.service !== 'Select Service' ? quoteData.service : null,
          guaranteed_results: quoteData.guaranteed_results,
          premium_support: quoteData.premium_support,
          status: 'new'
        }]);

      if (error) throw error;

      await showFormSuccessMessage('quote request');

      // Reset form
      setQuoteData({
        name: '',
        email: '',
        phone: '',
        service: 'Select Service',
        guaranteed_results: false,
        premium_support: false
      });
    } catch (error: any) {
      await showFormErrorMessage(error.message);
    } finally {
      setIsSubmittingQuote(false);
    }
  };

  // SEO Audit Form Handlers
  const handleAuditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setAuditData({ ...auditData, [e.target.name]: e.target.value });
  };

  const handleAuditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAudit(true);

    try {
      const { error } = await supabase
        .from('form_submissions')
        .insert([{
          form_type: 'seo_audit',
          website_url: auditData.website_url,
          name: auditData.name,
          email: auditData.email,
          industry: auditData.industry !== 'Industry Type' ? auditData.industry : null,
          phone: auditData.phone,
          status: 'new'
        }]);

      if (error) throw error;

      await showFormSuccessMessage('SEO audit request');

      // Reset form
      setAuditData({
        website_url: '',
        name: '',
        email: '',
        industry: 'Industry Type',
        phone: ''
      });
    } catch (error: any) {
      await showFormErrorMessage(error.message);
    } finally {
      setIsSubmittingAudit(false);
    }
  };

  return (
    <section className="bg-gradient-to-br from-red-50 via-white to-blue-50 py-12 md:py-20 relative overflow-hidden">
      <div className="absolute top-20 right-10 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-slow"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="animate-slide-up">
            <div className="inline-flex items-center bg-gradient-to-r from-red-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4 animate-pulse-glow">
              <Zap size={16} className="mr-2" />
              Get Results in 30 Days or Your Money Back!
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              Grow Your Business with
              <span className="bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent"> Data-Driven</span> Digital Marketing
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Transform your online presence with our proven strategies. We deliver measurable results through SEO, social media, PPC, and content marketing.
            </p>

            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex gap-4 mb-6 border-b">
                <button
                  onClick={() => setActiveTab('quote')}
                  className={`pb-4 px-4 font-semibold transition-all flex items-center gap-2 ${activeTab === 'quote'
                    ? 'tab-active text-red-600'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  <Search size={20} />
                  Get Quote
                </button>
                <button
                  onClick={() => setActiveTab('audit')}
                  className={`pb-4 px-4 font-semibold transition-all flex items-center gap-2 ${activeTab === 'audit'
                    ? 'tab-active text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  <FileText size={20} />
                  Free SEO Audit
                </button>
              </div>
              {activeTab === 'quote' && (
                <form onSubmit={handleQuoteSubmit} className="space-y-4 animate-fade-in">
                  <h3 className="text-lg font-semibold text-gray-800">Get Your Free Marketing Quote</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="name"
                      value={quoteData.name}
                      onChange={handleQuoteChange}
                      required
                      placeholder="Your Name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-all"
                    />
                    <input
                      type="email"
                      name="email"
                      value={quoteData.email}
                      onChange={handleQuoteChange}
                      required
                      placeholder="Email Address"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="tel"
                      name="phone"
                      value={quoteData.phone}
                      onChange={handleQuoteChange}
                      required
                      placeholder="Phone Number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition- all"
                    />
                    <select
                      name="service"
                      value={quoteData.service}
                      onChange={handleQuoteChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none bg-white transition-all"
                    >
                      <option>Select Service</option>
                      <option>SEO Services</option>
                      <option>Social Media Marketing</option>
                      <option>PPC Advertising</option>
                      <option>Content Marketing</option>
                      <option>Email Marketing</option>
                      <option>Complete Package</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center text-sm text-gray-600">
                      <input
                        type="checkbox"
                        name="guaranteed_results"
                        checked={quoteData.guaranteed_results}
                        onChange={handleQuoteChange}
                        className="mr-2"
                      />
                      I want guaranteed results
                    </label>
                    <label className="flex items-center text-sm text-gray-600">
                      <input
                        type="checkbox"
                        name="premium_support"
                        checked={quoteData.premium_support}
                        onChange={handleQuoteChange}
                        className="mr-2"
                      />
                      Premium support needed
                    </label>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmittingQuote}
                    className="w-full bg-[#01478c] text-white py-4 rounded-lg hover:shadow-lg hover:shadow-blue-600/50 transition-all font-semibold text-lg flex items-center justify-center transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Search size={20} className="mr-2" />
                    {isSubmittingQuote ? 'Submitting...' : 'Get Free Quote'}
                  </button>
                </form>
              )}

              {activeTab === 'audit' && (
                <form onSubmit={handleAuditSubmit} className="space-y-4 animate-fade-in">
                  <h3 className="text-lg font-semibold text-gray-800">Free Website SEO Audit</h3>
                  <div>
                    <input
                      type="url"
                      name="website_url"
                      value={auditData.website_url}
                      onChange={handleAuditChange}
                      required
                      placeholder="Your Website URL (e.g., www.example.com)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="name"
                      value={auditData.name}
                      onChange={handleAuditChange}
                      required
                      placeholder="Your Name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-all"
                    />
                    <input
                      type="email"
                      name="email"
                      value={auditData.email}
                      onChange={handleAuditChange}
                      required
                      placeholder="Email Address"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <select
                      name="industry"
                      value={auditData.industry}
                      onChange={handleAuditChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none bg-white transition-all"
                    >
                      <option>Industry Type</option>
                      <option>E-commerce</option>
                      <option>SaaS</option>
                      <option>Local Business</option>
                      <option>Agency</option>
                      <option>Education</option>
                      <option>Other</option>
                    </select>
                    <input
                      type="tel"
                      name="phone"
                      value={auditData.phone}
                      onChange={handleAuditChange}
                      required
                      placeholder="Phone Number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmittingAudit}
                    className="w-full bg-gradient-to-r from-blue-600 to-red-600 text-white py-4 rounded-lg hover:shadow-lg hover:shadow-blue-600/50 transition-all font-semibold text-lg flex items-center justify-center transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FileText size={20} className="mr-2" />
                    {isSubmittingAudit ? 'Submitting...' : 'Start Free Audit'}
                  </button>
                </form>
              )}
            </div>

            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center animate-float">
                <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center text-red-600 font-bold">
                  <TrendingUp size={24} />
                </div>
                <div className="ml-3">
                  <div className="font-semibold text-gray-900">98% Success Rate</div>
                  <div className="text-gray-600">Client Satisfaction</div>
                </div>
              </div>
              <div className="border-l pl-6 animate-float-slow">
                <div className="font-semibold text-gray-900">500+ Projects</div>
                <div className="text-gray-600">Delivered Successfully</div>
              </div>
            </div>
          </div>

          <div className="hidden md:block relative">
            <div className="relative animate-float-slow">
              <img
                src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Digital Marketing"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg animate-pulse-glow">
                <div className="text-3xl font-bold bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent">250%</div>
                <div className="text-sm text-gray-600">Average ROI Increase</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
