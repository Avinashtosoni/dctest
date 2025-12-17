import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Hero from './components/Hero';
import Services from './components/Services';
import Benefits from './components/Benefits';
import AppPromotion from './components/AppPromotion';
import HomeBlogSection from './components/HomeBlogSection';
import ServicesPage from './components/ServicesPage';
import ServiceDetail from './components/ServiceDetail';
import PortfolioPage from './components/PortfolioPage';
import PortfolioDetail from './components/PortfolioDetail';
import ContactPage from './components/ContactPage';
import AboutPage from './components/AboutPage';
import PricingPage from './components/PricingPage';
import BlogPage from './components/BlogPage';
import BlogPost from './components/BlogPost';
import TeamDetail from './components/TeamDetail';
import SeoAnalysis from './components/tools/SeoAnalysis';
import SocialMediaCheck from './components/tools/SocialMediaCheck';
import RoiCalculator from './components/tools/RoiCalculator';
import WebsiteAuditInfo from './components/tools/WebsiteAuditInfo';
import ToolsPage from './components/ToolsPage';
import IdCardGenerator from './components/tools/IdCardGenerator';
import PassportPhotoMaker from './components/tools/PassportPhotoMaker';
import PageSpeedTest from './components/tools/PageSpeedTest';

import TrustBadges from './components/TrustBadges';
import NotFoundPage from './components/NotFoundPage';

// Layouts
import WebsiteLayout from './components/layouts/WebsiteLayout';
import DashboardLayout from './components/layouts/DashboardLayout';
import DashboardHome from './components/dashboard/DashboardHome';
import NotificationsPage from './components/dashboard/NotificationsPage';
import ProfilePage from './components/dashboard/ProfilePage';
import SettingsPage from './components/dashboard/SettingsPage';
import ProjectsPage from './components/dashboard/ProjectsPage';
import PaymentPage from './components/dashboard/PaymentPage';
import ReportsPage from './components/dashboard/ReportsPage';
import CustomersPage from './components/dashboard/CustomersPage';
import LeadsPage from './components/dashboard/LeadsPage';
import DashboardBlogPage from './components/dashboard/BlogPage';
import WidgetsPage from './components/dashboard/WidgetsPage';
import AuthenticationPage from './components/dashboard/AuthenticationPage';
import ProposalPage from './components/dashboard/ProposalPage';
import ApplicationsPage from './components/dashboard/ApplicationsPage';
import DashboardServicesPage from './components/dashboard/ServicesPage';
import SubscriptionsPage from './components/dashboard/SubscriptionsPage';
import OrdersPage from './components/dashboard/OrdersPage';
import CouponsPage from './components/dashboard/CouponsPage';
import ProductsPage from './components/dashboard/ProductsPage';
import SocialMediaPage from './components/dashboard/SocialMediaPage';
import WebsitePage from './components/dashboard/WebsitePage';
import TeamPage from './components/dashboard/TeamPage';
import DashboardPortfolioPage from './components/dashboard/PortfolioPage';
import ContactMessagesPage from './components/dashboard/ContactMessagesPage';
import ShopPage from './components/dashboard/ShopPage';
import AccountPage from './components/dashboard/AccountPage';

import StorePage from './components/StorePage';
import CheckoutPage from './components/CheckoutPage';

import SEO from './components/SEO';

function HomePage() {
    return (
        <>
            <SEO
                title="Digital Marketing Agency"
                description="Full-service digital marketing agency specializing in SEO, PPC, Social Media, and Web Development to grow your business."
            />
            <Hero />
            <TrustBadges />
            <Services />
            <Benefits />
            <HomeBlogSection />
            <AppPromotion />
        </>
    );
}


import { AuthProvider } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Website Routes */}
                    <Route element={<WebsiteLayout />}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/services" element={<ServicesPage />} />
                        <Route path="/services/:id" element={<ServiceDetail />} />
                        <Route path="/portfolio" element={<PortfolioPage />} />
                        <Route path="/portfolio/:id" element={<PortfolioDetail />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/pricing" element={<PricingPage />} />
                        <Route path="/blog" element={<BlogPage />} />
                        <Route path="/blog/:id" element={<BlogPost />} />
                        <Route path="/team/:id" element={<TeamDetail />} />

                        {/* Store & Checkout */}
                        <Route path="/store" element={<StorePage />} />
                        <Route path="/checkout/:productId" element={<CheckoutPage />} />

                        {/* Interactive Tools Hub */}
                        <Route path="/tools" element={<ToolsPage />} />
                        <Route path="/tools/id-card-generator" element={<IdCardGenerator />} />
                        <Route path="/tools/passport-photo-maker" element={<PassportPhotoMaker />} />
                        <Route path="/tools/page-speed-test" element={<PageSpeedTest />} />

                        {/* Interactive Tools */}
                        <Route path="/tools/seo-analysis" element={<SeoAnalysis />} />
                        <Route path="/tools/social-media-check" element={<SocialMediaCheck />} />
                        <Route path="/tools/roi-calculator" element={<RoiCalculator />} />
                        <Route path="/free-website-audit" element={<WebsiteAuditInfo />} />

                        {/* Auth Routes */}
                        <Route path="/login" element={<LoginPage />} />

                        {/* Catch-all for website layout */}
                        <Route path="*" element={<NotFoundPage />} />
                    </Route>

                    {/* Dashboard Routes - Protected */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <DashboardLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<DashboardHome />} />
                        <Route path="profile" element={<ProfilePage />} />
                        <Route path="notifications" element={<NotificationsPage />} />
                        <Route path="settings" element={<SettingsPage />} />
                        {/* Example of a restricted route (commented out for now until specific requirements) */}
                        {/* <Route path="admin" element={<ProtectedRoute allowedRoles={['Admin', 'Super Admin']}><AdminPage /></ProtectedRoute>} /> */}
                        <Route path="projects" element={<ProjectsPage />} />
                        <Route path="portfolio" element={<DashboardPortfolioPage />} />
                        <Route path="payment" element={<PaymentPage />} />
                        <Route path="reports" element={<ReportsPage />} />
                        <Route path="customers" element={<CustomersPage />} />
                        <Route path="leads" element={<LeadsPage />} />
                        <Route path="messages" element={<ContactMessagesPage />} />
                        <Route path="blog" element={<DashboardBlogPage />} />
                        <Route path="widgets" element={<WidgetsPage />} />
                        <Route path="authentication" element={<AuthenticationPage />} />
                        <Route path="proposals" element={<ProposalPage />} />
                        <Route path="applications" element={<ApplicationsPage />} />
                        <Route path="services" element={<DashboardServicesPage />} />
                        <Route path="subscriptions" element={<SubscriptionsPage />} />
                        <Route path="orders" element={<OrdersPage />} />
                        <Route path="coupons" element={<CouponsPage />} />
                        <Route path="products" element={<ProductsPage />} />
                        <Route path="social-media" element={<SocialMediaPage />} />
                        <Route path="website" element={<WebsitePage />} />
                        <Route path="team" element={<TeamPage />} />
                        <Route path="shop" element={<ShopPage />} />
                        <Route path="account" element={<AccountPage />} />
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;

