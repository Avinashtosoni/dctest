// Custom hook for permission checking
import { useAuth } from '../context/AuthContext';
import { hasPermission, getPermissionsForRole, canAccessRoute, Permission, PERMISSIONS } from '../config/permissions';

export function usePermissions() {
    const { role } = useAuth();

    return {
        // Check if user has a specific permission
        hasPermission: (permission: Permission) => hasPermission(role, permission),

        // Get all permissions for current user
        permissions: getPermissionsForRole(role),

        // Check if user can access a route
        canAccessRoute: (route: string) => canAccessRoute(role, route),

        // Current user role
        role,

        // Permission constants for easy access
        PERMISSIONS,

        // Helper checks for common scenarios
        isAdmin: role === 'Admin' || role === 'Super Admin',
        isSuperAdmin: role === 'Super Admin',
    };
}

export default usePermissions;
