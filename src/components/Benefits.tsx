import { Shield, Clock, Award, HeadphonesIcon, TrendingUp, Users, Lightbulb, CheckCircle } from 'lucide-react';

const benefits = [
  {
    icon: Shield,
    title: '100% Transparency',
    description: 'Complete visibility into your campaigns with real-time reporting',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    shadowColor: 'hover:shadow-blue-500/40'
  },
  {
    icon: Clock,
    title: '24/7 Support',
    description: 'Round-the-clock assistance from our dedicated team',
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    shadowColor: 'hover:shadow-green-500/40'
  },
  {
    icon: Award,
    title: 'Certified Experts',
    description: 'Google & Facebook certified digital marketing professionals',
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    shadowColor: 'hover:shadow-purple-500/40'
  },
  {
    icon: HeadphonesIcon,
    title: 'Dedicated Manager',
    description: 'Personal account manager for all your needs',
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    shadowColor: 'hover:shadow-orange-500/40'
  },
  {
    icon: TrendingUp,
    title: 'Proven Results',
    description: 'Average 250% ROI increase within 6 months',
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    shadowColor: 'hover:shadow-red-500/40'
  },
  {
    icon: Users,
    title: '500+ Happy Clients',
    description: 'Trusted by businesses across 20+ industries',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50',
    shadowColor: 'hover:shadow-indigo-500/40'
  },
  {
    icon: Lightbulb,
    title: 'Custom Strategies',
    description: 'Tailored solutions for your unique business goals',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    shadowColor: 'hover:shadow-yellow-500/40'
  },
  {
    icon: CheckCircle,
    title: 'Money-Back Guarantee',
    description: 'No results in 30 days? Get your money back',
    color: 'text-teal-500',
    bgColor: 'bg-teal-50',
    shadowColor: 'hover:shadow-teal-500/40'
  },
];

export default function Benefits() {
  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden perspective-1000">
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 animate-slide-down">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            Why Choose Digital Comrade?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We combine expertise, technology, and dedication to deliver exceptional results that scale your business.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className={`group bg-white rounded-2xl p-8 text-center transition-all duration-500 hover:-translate-y-2 animate-slide-up hover:shadow-[0_0_40px_rgba(0,0,0,0.1)] ${benefit.shadowColor}`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* 3D Icon Container */}
                <div className="w-20 h-20 mx-auto mb-6 relative transform-style-3d transition-transform duration-500 group-hover:rotate-y-12 group-hover:rotate-x-12">
                  <div className={`absolute inset-0 ${benefit.bgColor} opacity-50 rounded-2xl transform translate-z-[-10px] scale-90 transition-all group-hover:scale-100`}></div>
                  <div className={`w-full h-full ${benefit.bgColor} rounded-2xl flex items-center justify-center shadow-lg transform translate-z-10 group-hover:scale-110 transition-transform`}>
                    <Icon size={36} className={`${benefit.color} drop-shadow-sm`} />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
