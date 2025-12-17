
import { Shield, Award } from 'lucide-react';

export default function TrustBadges() {
  const partners = [
    { name: 'Google Partner', color: 'text-gray-500' },
    { name: 'Meta Business', color: 'text-blue-600' },
    { name: 'Shopify Partners', color: 'text-green-600' },
    { name: 'HubSpot', color: 'text-orange-500' },
    { name: 'Semrush', color: 'text-orange-600' },
    { name: 'WordPress', color: 'text-blue-700' },
    // Duplicates for seamless loop logic if needed, but we handle it in render
  ];

  // Create a doubled array for seamless infinite scroll
  const marqueePartners = [...partners, ...partners, ...partners];

  return (
    <section className="py-12 bg-white border-b border-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Trusted by industry leaders and startups alike
          </p>
        </div>

        {/* Marquee Container */}
        <div className="relative w-full overflow-hidden mask-linear-gradient-to-r from-transparent via-black to-transparent">
          {/* Gradient Masks for smooth fade out at edges */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10"></div>

          <div className="flex animate-marquee pause-on-hover hover:cursor-pointer items-center gap-16">
            {marqueePartners.map((partner, i) => (
              <div key={i} className={`flex-shrink-0 text-2xl font-bold flex items-center gap-2 ${partner.color} opacity-70 hover:opacity-100 transition-opacity duration-300`}>
                <Shield size={22} className="inline-block opacity-50" />
                {partner.name}
              </div>
            ))}
          </div>
        </div>

        {/* Additional Trust Indicators */}
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <div className="inline-flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-100">
            <Shield size={16} className="mr-2" /> 100% Money-Back Guarantee
          </div>
          <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
            <Award size={16} className="mr-2" /> Top Rated Agency 2025
          </div>
        </div>

      </div>
    </section>
  );
}

