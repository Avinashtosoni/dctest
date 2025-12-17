import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFoundPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full text-center space-y-8">
                {/* 404 Graphic */}
                <div className="relative">
                    <h1 className="text-[150px] font-black text-[#01478c] opacity-5 select-none leading-none">
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-4xl md:text-5xl font-bold text-gray-900 bg-gray-50/50 backdrop-blur-sm p-4 rounded-xl">
                            Page Not Found
                        </div>
                    </div>
                </div>

                {/* Message */}
                <div className="space-y-4">
                    <p className="text-xl text-gray-600">
                        Oops! It looks like you've wandered into uncharted digital territory.
                    </p>
                    <p className="text-gray-500">
                        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <Link
                        to="/"
                        className="flex items-center px-6 py-3 bg-[#01478c] text-white rounded-xl hover:bg-[#013a73] transition-colors shadow-lg hover:shadow-xl group"
                    >
                        <Home className="w-5 h-5 mr-2 group-hover:-translate-y-1 transition-transform" />
                        Back to Home
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Go Back
                    </button>
                </div>

                {/* Help Section */}
                <div className="pt-12 border-t border-gray-200 mt-12">
                     <p className="text-sm text-gray-500 mb-4">Looking for something specific?</p>
                     <div className="flex flex-wrap justify-center gap-3">
                        <Link to="/services" className="text-sm text-[#ff6b35] hover:underline flex items-center">
                            <Search className="w-3 h-3 mr-1" /> Our Services
                        </Link>
                        <span className="text-gray-300">|</span>
                        <Link to="/blog" className="text-sm text-[#ff6b35] hover:underline">
                            Read Our Blog
                        </Link>
                         <span className="text-gray-300">|</span>
                        <Link to="/contact" className="text-sm text-[#ff6b35] hover:underline">
                            Contact Support
                        </Link>
                     </div>
                </div>
            </div>
        </div>
    );
}
