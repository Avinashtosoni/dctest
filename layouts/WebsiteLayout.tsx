import { Outlet, useLocation } from 'react-router-dom';
import Header from '../Header';
import Footer from '../Footer';

export default function WebsiteLayout() {
    const location = useLocation();

    // Hide header on specific service detail pages if needed, matching original logic
    // Original regex was: /^\/services\/[^/]+$/.test(location.pathname);
    const isServiceDetailPage = /^\/services\/[^/]+$/.test(location.pathname);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {!isServiceDetailPage && <Header />}
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
