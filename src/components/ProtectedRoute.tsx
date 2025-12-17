import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import { UserRole } from '../types/auth';
import { canAccessRoute, Permission, hasPermission } from '../config/permissions';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
    requiredPermission?: Permission;
}

export default function ProtectedRoute({ children, allowedRoles, requiredPermission }: ProtectedRouteProps) {
    const { user, role, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!user) {
        // Redirect to login page but save the attempted url
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check role-based access
    if (allowedRoles && role && !allowedRoles.includes(role)) {
        return <Navigate to="/dashboard" replace />;
    }

    // Check permission-based access
    if (requiredPermission && !hasPermission(role, requiredPermission)) {
        return <Navigate to="/dashboard" replace />;
    }

    // Check route-based access (automatic based on route)
    if (!canAccessRoute(role, location.pathname)) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}

