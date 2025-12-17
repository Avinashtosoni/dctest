import { Smartphone, Apple } from 'lucide-react';

export default function AppPromotion() {
  return (
    <section className="py-16 bg-gradient-to-br from-[#01478c] to-[#0158ad]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Manage Your Campaigns On-The-Go
            </h2>
            <p className="text-lg mb-6 opacity-90">
              Download our mobile app to track campaign performance, view analytics, and communicate with your account manager anytime, anywhere.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-[#ff6b35] rounded-full mr-3"></div>
                Real-time campaign analytics and reporting
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-[#ff6b35] rounded-full mr-3"></div>
                Instant notifications for important updates
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-[#ff6b35] rounded-full mr-3"></div>
                Direct messaging with your account manager
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-[#ff6b35] rounded-full mr-3"></div>
                Quick access to performance metrics
              </li>
            </ul>
            <div className="flex flex-wrap gap-4">
              <button className="bg-black text-white px-6 py-3 rounded-lg flex items-center hover:bg-gray-800 transition-colors">
                <Apple size={24} className="mr-2" />
                <div className="text-left">
                  <div className="text-xs">Download on the</div>
                  <div className="font-semibold">App Store</div>
                </div>
              </button>
              <button className="bg-black text-white px-6 py-3 rounded-lg flex items-center hover:bg-gray-800 transition-colors">
                <Smartphone size={24} className="mr-2" />
                <div className="text-left">
                  <div className="text-xs">Get it on</div>
                  <div className="font-semibold">Google Play</div>
                </div>
              </button>
            </div>
          </div>

          <div className="hidden md:block relative">
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <img
                src="https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Mobile App"
                className="rounded-2xl shadow-2xl"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-[#ff6b35] text-white p-4 rounded-xl shadow-lg">
              <div className="text-2xl font-bold">50K+</div>
              <div className="text-sm">Active Users</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
