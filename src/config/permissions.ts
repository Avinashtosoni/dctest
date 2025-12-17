// Role-Based Access Control Configuration
// Defines all permissions and role-to-permission mappings

import { UserRole } from '../types/auth';

// All available permissions in the system
export const PERMISSIONS = {
    // Profile & Basic
    VIEW_PROFILE: 'view_profile',
    EDIT_PROFILE: 'edit_profile',
    VIEW_NOTIFICATIONS: 'view_notifications',
    VIEW_DASHBOARD: 'view_dashboard',

    // Products & Services
    VIEW_PRODUCTS: 'view_products',
    MANAGE_PRODUCTS: 'manage_products',
    VIEW_SERVICES: 'view_services',
    MANAGE_SERVICES: 'manage_services',
    VIEW_SHOP: 'view_shop',
    VIEW_ACCOUNT: 'view_account',

    // Orders & Subscriptions
    VIEW_ORDERS: 'view_orders',
    MANAGE_ORDERS: 'manage_orders',
    VIEW_SUBSCRIPTIONS: 'view_subscriptions',
    MANAGE_SUBSCRIPTIONS: 'manage_subscriptions',
    VIEW_COUPONS: 'view_coupons',
    MANAGE_COUPONS: 'manage_coupons',

    // Social & Content
    VIEW_SOCIAL_MEDIA: 'view_social_media',
    MANAGE_SOCIAL_MEDIA: 'manage_social_media',
    VIEW_BLOG: 'view_blog',
    MANAGE_BLOG: 'manage_blog',

    // Projects & Portfolio
    VIEW_PORTFOLIO: 'view_portfolio',
    MANAGE_PORTFOLIO: 'manage_portfolio',
    VIEW_PROJECTS: 'view_projects',
    MANAGE_PROJECTS: 'manage_projects',

    // Technical
    VIEW_WIDGETS: 'view_widgets',
    MANAGE_WIDGETS: 'manage_widgets',
    VIEW_WEBSITE: 'view_website',
    MANAGE_WEBSITE: 'manage_website',

    // Business Management
    VIEW_REPORTS: 'view_reports',
    VIEW_TEAM: 'view_team',
    MANAGE_TEAM: 'manage_team',
    VIEW_CUSTOMERS: 'view_customers',
    MANAGE_CUSTOMERS: 'manage_customers',
    VIEW_LEADS: 'view_leads',
    MANAGE_LEADS: 'manage_leads',
    VIEW_PAYMENT: 'view_payment',
    MANAGE_PAYMENT: 'manage_payment',
    VIEW_PROPOSALS: 'view_proposals',
    MANAGE_PROPOSALS: 'manage_proposals',
    VIEW_APPLICATIONS: 'view_applications',
    MANAGE_APPLICATIONS: 'manage_applications',

    // Admin
    VIEW_SETTINGS: 'view_settings',
    MANAGE_SETTINGS: 'manage_settings',
    MANAGE_USERS: 'manage_users',
    MANAGE_ROLES: 'manage_roles',

    // Super Admin Only
    VIEW_AUTHENTICATION: 'view_authentication',
    MANAGE_AUTHENTICATION: 'manage_authentication',
    VIEW_BRANDING: 'view_branding',
    MANAGE_BRANDING: 'manage_branding',
    VIEW_API: 'view_api',
    MANAGE_API: 'manage_api',
    SUPER_ADMIN: 'super_admin',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Role-to-permission mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    'Visitor': [
        PERMISSIONS.VIEW_PROFILE,
        PERMISSIONS.EDIT_PROFILE,
        PERMISSIONS.VIEW_NOTIFICATIONS,
        PERMISSIONS.VIEW_DASHBOARD,
        PERMISSIONS.VIEW_PRODUCTS,
        PERMISSIONS.VIEW_SERVICES,
        PERMISSIONS.VIEW_SHOP,
        PERMISSIONS.VIEW_ACCOUNT,
    ],
    'Customer': [
        PERMISSIONS.VIEW_PROFILE,
        PERMISSIONS.EDIT_PROFILE,
        PERMISSIONS.VIEW_NOTIFICATIONS,
        PERMISSIONS.VIEW_DASHBOARD,
        PERMISSIONS.VIEW_PRODUCTS,
        PERMISSIONS.VIEW_SERVICES,
        PERMISSIONS.VIEW_ORDERS,
        PERMISSIONS.MANAGE_ORDERS,
        PERMISSIONS.VIEW_SHOP,
        PERMISSIONS.VIEW_ACCOUNT,
    ],
    'Client': [
        PERMISSIONS.VIEW_PROFILE,
        PERMISSIONS.EDIT_PROFILE,
        PERMISSIONS.VIEW_NOTIFICATIONS,
        PERMISSIONS.VIEW_DASHBOARD,
        PERMISSIONS.VIEW_PRODUCTS,
        PERMISSIONS.VIEW_SERVICES,
        PERMISSIONS.VIEW_ORDERS,
        PERMISSIONS.MANAGE_ORDERS,
        PERMISSIONS.VIEW_SUBSCRIPTIONS,
        PERMISSIONS.MANAGE_SUBSCRIPTIONS,
        PERMISSIONS.VIEW_SHOP,
        PERMISSIONS.VIEW_ACCOUNT,
    ],
    'Social Media Manager': [
        PERMISSIONS.VIEW_PROFILE,
        PERMISSIONS.EDIT_PROFILE,
        PERMISSIONS.VIEW_NOTIFICATIONS,
        PERMISSIONS.VIEW_DASHBOARD,
        PERMISSIONS.VIEW_SOCIAL_MEDIA,
        PERMISSIONS.MANAGE_SOCIAL_MEDIA,
        PERMISSIONS.VIEW_BLOG,
        PERMISSIONS.MANAGE_BLOG,
    ],
    'Developer': [
        PERMISSIONS.VIEW_PROFILE,
        PERMISSIONS.EDIT_PROFILE,
        PERMISSIONS.VIEW_NOTIFICATIONS,
        PERMISSIONS.VIEW_DASHBOARD,
        PERMISSIONS.VIEW_PROJECTS,
        PERMISSIONS.MANAGE_PROJECTS,
        PERMISSIONS.VIEW_PORTFOLIO,
        PERMISSIONS.MANAGE_PORTFOLIO,
        PERMISSIONS.VIEW_WIDGETS,
        PERMISSIONS.MANAGE_WIDGETS,
        PERMISSIONS.VIEW_WEBSITE,
        PERMISSIONS.MANAGE_WEBSITE,
    ],
    'Admin': [
        PERMISSIONS.VIEW_PROFILE,
        PERMISSIONS.EDIT_PROFILE,
        PERMISSIONS.VIEW_NOTIFICATIONS,
        PERMISSIONS.VIEW_DASHBOARD,
        PERMISSIONS.VIEW_PRODUCTS,
        PERMISSIONS.MANAGE_PRODUCTS,
        PERMISSIONS.VIEW_SERVICES,
        PERMISSIONS.MANAGE_SERVICES,
        PERMISSIONS.VIEW_ORDERS,
        PERMISSIONS.MANAGE_ORDERS,
        PERMISSIONS.VIEW_SUBSCRIPTIONS,
        PERMISSIONS.MANAGE_SUBSCRIPTIONS,
        PERMISSIONS.VIEW_COUPONS,
        PERMISSIONS.MANAGE_COUPONS,
        PERMISSIONS.VIEW_SOCIAL_MEDIA,
        PERMISSIONS.MANAGE_SOCIAL_MEDIA,
        PERMISSIONS.VIEW_BLOG,
        PERMISSIONS.MANAGE_BLOG,
        PERMISSIONS.VIEW_PORTFOLIO,
        PERMISSIONS.MANAGE_PORTFOLIO,
        PERMISSIONS.VIEW_PROJECTS,
        PERMISSIONS.MANAGE_PROJECTS,
        PERMISSIONS.VIEW_WIDGETS,
        PERMISSIONS.MANAGE_WIDGETS,
        PERMISSIONS.VIEW_WEBSITE,
        PERMISSIONS.MANAGE_WEBSITE,
        PERMISSIONS.VIEW_REPORTS,
        PERMISSIONS.VIEW_TEAM,
        PERMISSIONS.MANAGE_TEAM,
        PERMISSIONS.VIEW_CUSTOMERS,
        PERMISSIONS.MANAGE_CUSTOMERS,
        PERMISSIONS.VIEW_LEADS,
        PERMISSIONS.MANAGE_LEADS,
        PERMISSIONS.VIEW_PAYMENT,
        PERMISSIONS.MANAGE_PAYMENT,
        PERMISSIONS.VIEW_PROPOSALS,
        PERMISSIONS.MANAGE_PROPOSALS,
        PERMISSIONS.VIEW_APPLICATIONS,
        PERMISSIONS.MANAGE_APPLICATIONS,
        PERMISSIONS.VIEW_SETTINGS,
        PERMISSIONS.MANAGE_SETTINGS,
        PERMISSIONS.MANAGE_USERS,
        PERMISSIONS.MANAGE_ROLES,
    ],
    'Super Admin': [
        PERMISSIONS.VIEW_PROFILE,
        PERMISSIONS.EDIT_PROFILE,
        PERMISSIONS.VIEW_NOTIFICATIONS,
        PERMISSIONS.VIEW_DASHBOARD,
        PERMISSIONS.VIEW_PRODUCTS,
        PERMISSIONS.MANAGE_PRODUCTS,
        PERMISSIONS.VIEW_SERVICES,
        PERMISSIONS.MANAGE_SERVICES,
        PERMISSIONS.VIEW_ORDERS,
        PERMISSIONS.MANAGE_ORDERS,
        PERMISSIONS.VIEW_SUBSCRIPTIONS,
        PERMISSIONS.MANAGE_SUBSCRIPTIONS,
        PERMISSIONS.VIEW_COUPONS,
        PERMISSIONS.MANAGE_COUPONS,
        PERMISSIONS.VIEW_SOCIAL_MEDIA,
        PERMISSIONS.MANAGE_SOCIAL_MEDIA,
        PERMISSIONS.VIEW_BLOG,
        PERMISSIONS.MANAGE_BLOG,
        PERMISSIONS.VIEW_PORTFOLIO,
        PERMISSIONS.MANAGE_PORTFOLIO,
        PERMISSIONS.VIEW_PROJECTS,
        PERMISSIONS.MANAGE_PROJECTS,
        PERMISSIONS.VIEW_WIDGETS,
        PERMISSIONS.MANAGE_WIDGETS,
        PERMISSIONS.VIEW_WEBSITE,
        PERMISSIONS.MANAGE_WEBSITE,
        PERMISSIONS.VIEW_REPORTS,
        PERMISSIONS.VIEW_TEAM,
        PERMISSIONS.MANAGE_TEAM,
        PERMISSIONS.VIEW_CUSTOMERS,
        PERMISSIONS.MANAGE_CUSTOMERS,
        PERMISSIONS.VIEW_LEADS,
        PERMISSIONS.MANAGE_LEADS,
        PERMISSIONS.VIEW_PAYMENT,
        PERMISSIONS.MANAGE_PAYMENT,
        PERMISSIONS.VIEW_PROPOSALS,
        PERMISSIONS.MANAGE_PROPOSALS,
        PERMISSIONS.VIEW_APPLICATIONS,
        PERMISSIONS.MANAGE_APPLICATIONS,
        PERMISSIONS.VIEW_SETTINGS,
        PERMISSIONS.MANAGE_SETTINGS,
        PERMISSIONS.MANAGE_USERS,
        PERMISSIONS.MANAGE_ROLES,
        PERMISSIONS.VIEW_AUTHENTICATION,
        PERMISSIONS.MANAGE_AUTHENTICATION,
        PERMISSIONS.VIEW_BRANDING,
        PERMISSIONS.MANAGE_BRANDING,
        PERMISSIONS.VIEW_API,
        PERMISSIONS.MANAGE_API,
        PERMISSIONS.SUPER_ADMIN,
    ],
};

// Route to permission mapping for sidebar/navigation
export const ROUTE_PERMISSIONS: Record<string, Permission> = {
    '/dashboard': PERMISSIONS.VIEW_DASHBOARD,
    '/dashboard/profile': PERMISSIONS.VIEW_PROFILE,
    '/dashboard/notifications': PERMISSIONS.VIEW_NOTIFICATIONS,
    '/dashboard/services': PERMISSIONS.VIEW_SERVICES,
    '/dashboard/products': PERMISSIONS.VIEW_PRODUCTS,
    '/dashboard/subscriptions': PERMISSIONS.VIEW_SUBSCRIPTIONS,
    '/dashboard/orders': PERMISSIONS.VIEW_ORDERS,
    '/dashboard/coupons': PERMISSIONS.VIEW_COUPONS,
    '/dashboard/social-media': PERMISSIONS.VIEW_SOCIAL_MEDIA,
    '/dashboard/blog': PERMISSIONS.VIEW_BLOG,
    '/dashboard/portfolio': PERMISSIONS.VIEW_PORTFOLIO,
    '/dashboard/projects': PERMISSIONS.VIEW_PROJECTS,
    '/dashboard/widgets': PERMISSIONS.VIEW_WIDGETS,
    '/dashboard/website': PERMISSIONS.VIEW_WEBSITE,
    '/dashboard/reports': PERMISSIONS.VIEW_REPORTS,
    '/dashboard/team': PERMISSIONS.VIEW_TEAM,
    '/dashboard/customers': PERMISSIONS.VIEW_CUSTOMERS,
    '/dashboard/leads': PERMISSIONS.VIEW_LEADS,
    '/dashboard/payment': PERMISSIONS.VIEW_PAYMENT,
    '/dashboard/proposals': PERMISSIONS.VIEW_PROPOSALS,
    '/dashboard/applications': PERMISSIONS.VIEW_APPLICATIONS,
    '/dashboard/settings': PERMISSIONS.VIEW_SETTINGS,
    '/dashboard/authentication': PERMISSIONS.VIEW_AUTHENTICATION,
    '/dashboard/shop': PERMISSIONS.VIEW_SHOP,
};

// Helper function to check if a role has a permission
export function hasPermission(role: UserRole | null, permission: Permission): boolean {
    if (!role) return false;
    return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

// Helper function to get all permissions for a role
export function getPermissionsForRole(role: UserRole | null): Permission[] {
    if (!role) return [];
    return ROLE_PERMISSIONS[role] ?? [];
}

// Helper to check if user can access a route
export function canAccessRoute(role: UserRole | null, route: string): boolean {
    const requiredPermission = ROUTE_PERMISSIONS[route];
    if (!requiredPermission) return true; // No restriction defined
    return hasPermission(role, requiredPermission);
}
