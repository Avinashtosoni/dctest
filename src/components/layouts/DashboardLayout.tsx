import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../dashboard/Sidebar';
import TopBar from '../dashboard/TopBar';
import { NotificationProvider } from '../../context/NotificationContext';
import NotificationDrawer from '../dashboard/NotificationDrawer';

export default function DashboardLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <NotificationProvider>
            <div className="min-h-screen bg-gray-50 font-sans flex text-left">
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                <div className="flex-1 flex flex-col min-h-screen lg:ml-64 w-full transition-all duration-300">
                    <TopBar onMenuClick={() => setIsSidebarOpen(true)} />
                    <main className="flex-grow p-4 md:p-6 w-full max-w-[100vw] overflow-x-hidden">
                        <Outlet />
                    </main>
                </div>
                <NotificationDrawer />
            </div>
        </NotificationProvider>
    );
}
