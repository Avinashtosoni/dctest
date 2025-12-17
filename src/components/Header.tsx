
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LayoutDashboard, Settings, LogOut, Activity } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="Digital Comrade Logo" className="w-12 h-12 object-contain" />
            <span className="text-2xl font-bold text-[#01478c]">Digital Comrade</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/services" className="text-gray-700 hover:text-[#01478c] font-medium transition-colors">
              Our Services
            </Link>
            <Link to="/portfolio" className="text-gray-700 hover:text-[#01478c] font-medium transition-colors">
              Portfolio
            </Link>
            <Link to="/pricing" className="text-gray-700 hover:text-[#01478c] font-medium transition-colors">
              Pricing
            </Link>
            <Link to="/store" className="text-gray-700 hover:text-[#01478c] font-medium transition-colors">
              Store
            </Link>
            <Link to="/blog" className="text-gray-700 hover:text-[#01478c] font-medium transition-colors">
              Blog
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-[#01478c] font-medium transition-colors">
              About Us
            </Link>

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-200 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all">
                    <img
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg py-1 border border-gray-100 animate-in fade-in zoom-in-95 duration-200 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user.email?.split('@')[0] || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/dashboard/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User size={16} className="mr-3 text-gray-400" />
                        Profile
                      </Link>
                      <Link
                        to="/dashboard/notifications"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Activity size={16} className="mr-3 text-gray-400" />
                        Activity
                      </Link>
                      <Link
                        to="/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <LayoutDashboard size={16} className="mr-3 text-gray-400" />
                        Dashboard
                      </Link>
                      <Link
                        to="/dashboard/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings size={16} className="mr-3 text-gray-400" />
                        Settings
                      </Link>
                    </div>

                    <div className="border-t border-gray-100 py-1">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={16} className="mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="bg-[#01478c] text-white px-6 py-2 rounded-lg hover:bg-[#013a72] transition-colors font-medium">
                Login
              </Link>
            )}
          </nav>

          <button
            className="md:hidden text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link to="/services" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-[#01478c] font-medium">
                Our Services
              </Link>
              <Link to="/portfolio" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-[#01478c] font-medium">
                Portfolio
              </Link>
              <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-[#01478c] font-medium">
                Pricing
              </Link>
              <Link to="/store" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-[#01478c] font-medium">
                Store
              </Link>
              <Link to="/blog" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-[#01478c] font-medium">
                Blog
              </Link>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-[#01478c] font-medium">
                About Us
              </Link>

              {user ? (
                <>
                  <div className="border-t border-gray-100 my-2 pt-2">
                    <p className="text-xs text-gray-400 font-semibold mb-2 uppercase tracking-wider">Account</p>
                    <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-2 text-gray-700 hover:text-[#01478c] font-medium py-2">
                      <LayoutDashboard size={18} />
                      <span>Dashboard</span>
                    </Link>
                    <Link to="/dashboard/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-2 text-gray-700 hover:text-[#01478c] font-medium py-2">
                      <User size={18} />
                      <span>Profile</span>
                    </Link>
                    <button onClick={handleLogout} className="flex items-center space-x-2 text-red-600 font-medium py-2 w-full text-left">
                      <LogOut size={18} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              ) : (
                <Link to="/login" className="bg-[#01478c] text-white px-6 py-2 rounded-lg hover:bg-[#013a72] transition-colors font-medium block text-center">
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-[#01478c] text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-8 text-sm">
            <Link to="/tools" className="hover:text-[#ff6b35] transition-colors">Our Tools</Link>
            <Link to="/tools/seo-analysis" className="hover:text-[#ff6b35] transition-colors">SEO </Link>
            <Link to="/tools/social-media-check" className="hover:text-[#ff6b35] transition-colors">Social Media</Link>
            <Link to="services/seo-optimization" className="hover:text-[#ff6b35] transition-colors">Our Services</Link>
            <Link to="/tools/roi-calculator" className="hover:text-[#ff6b35] transition-colors">ROI Calculator</Link>

          </div>
        </div>
      </div>
    </header>
  );
}

