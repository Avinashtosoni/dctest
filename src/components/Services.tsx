import { Search, Share2, Target, FileText, Mail, BarChart3, Megaphone, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const services = [
  {
    id: 'seo-optimization',
    icon: Search,
    title: 'SEO Optimization',
    description: 'Rank higher on Google with our proven SEO strategies and get organic traffic.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    shadowColor: 'hover:shadow-blue-500/40' // Dynamic shadow
  },
  {
    id: 'social-media-marketing',
    icon: Share2,
    title: 'Social Media Marketing',
    description: 'Build your brand presence across all social platforms with engaging content.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    shadowColor: 'hover:shadow-purple-500/40'
  },
  {
    id: 'web-development',
    icon: Globe,
    title: 'Web Development',
    description: 'Create stunning, conversion-optimized websites that drive results.',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
    shadowColor: 'hover:shadow-cyan-500/40'
  },
  {
    id: 'Android App Designing',
    icon: Megaphone,
    title: 'Brand Strategy',
    description: 'Build a powerful brand identity that resonates with your audience.',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    shadowColor: 'hover:shadow-orange-500/40'
  },
  {
    id: 'analytics-reporting',
    icon: BarChart3,
    title: 'Analytics & Reporting',
    description: 'Track your success with detailed reports and actionable insights.',
    color: 'text-teal-600',
    bgColor: 'bg-teal-100',
    shadowColor: 'hover:shadow-teal-500/40'
  },
  {
    id: 'ppc-advertising',
    icon: Target,
    title: 'PPC Advertising',
    description: 'Get instant results with targeted Google Ads and Facebook Ads campaigns.',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    shadowColor: 'hover:shadow-red-500/40'
  },
  {
    id: 'content-marketing',
    icon: FileText,
    title: 'Content Marketing',
    description: 'Create compelling content that converts visitors into loyal customers.',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    shadowColor: 'hover:shadow-green-500/40'
  },
  {
    id: 'email-marketing',
    icon: Mail,
    title: 'Email Marketing',
    description: 'Nurture leads and boost sales with personalized email campaigns.',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    shadowColor: 'hover:shadow-yellow-500/40'
  },



];

export default function Services() {
  return (
    <section id="services" className="py-20 bg-white perspective-1000">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-slide-down">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Our Digital Marketing Services
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive solutions to elevate your online presence and drive business growth
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className={`group bg-white p-8 rounded-2xl border border-gray-100 hover:border-transparent transition-all duration-500 hover:-translate-y-2 hover:scale-105 ${service.shadowColor} shadow-lg`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* 3D Icon Container */}
                <div className="w-16 h-16 mb-6 relative transform-style-3d transition-transform duration-500 group-hover:rotate-y-12 group-hover:rotate-x-12">
                  <div className={`absolute inset-0 ${service.bgColor} opacity-50 rounded-xl transform translate-z-[-5px] scale-90 transition-all group-hover:scale-100`}></div>
                  <div className={`w-full h-full ${service.bgColor} rounded-xl flex items-center justify-center shadow-sm transform translate-z-10 group-hover:scale-110 transition-transform`}>
                    <Icon size={32} className={`${service.color} drop-shadow-sm`} />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">{service.description}</p>
                <Link
                  to={`/services/${service.id}`}
                  className="text-[#01478c] font-bold text-sm hover:text-[#ff6b35] transition-colors inline-flex items-center group/link"
                >
                  Learn More <span className="ml-1 group-hover/link:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
