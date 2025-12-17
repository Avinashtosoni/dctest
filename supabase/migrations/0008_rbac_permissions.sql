-- Migration: Add Editor role and update roles with comprehensive permissions
-- This migration adds RBAC permissions for all user roles

-- Step 1: Add 'Editor' to user_role enum
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'Editor' AFTER 'Social Media Manager';

-- Step 2: Clear existing role permissions and update with comprehensive RBAC
-- First, update existing roles with their specific permissions

-- Visitor: Basic access - Profile, Notifications, View Products/Services
UPDATE public.roles SET 
    permissions = ARRAY[
        'view_profile',
        'edit_profile', 
        'view_notifications',
        'view_products',
        'view_services',
        'view_dashboard'
    ],
    description = 'Basic user with limited viewing access to products and services',
    updated_at = now()
WHERE name = 'Visitor';

-- Customer: Visitor + Order management  
UPDATE public.roles SET 
    permissions = ARRAY[
        'view_profile',
        'edit_profile',
        'view_notifications',
        'view_products',
        'view_services',
        'view_dashboard',
        'view_orders',
        'manage_orders'
    ],
    description = 'Customer with order management capabilities',
    updated_at = now()
WHERE name = 'Customer';

-- Client: Customer + Subscription management
UPDATE public.roles SET 
    permissions = ARRAY[
        'view_profile',
        'edit_profile',
        'view_notifications',
        'view_products',
        'view_services',
        'view_dashboard',
        'view_orders',
        'manage_orders',
        'view_subscriptions',
        'manage_subscriptions'
    ],
    description = 'Subscription-based client with service management access',
    updated_at = now()
WHERE name = 'Client';

-- Social Media Manager: Social media and blog access
UPDATE public.roles SET 
    permissions = ARRAY[
        'view_profile',
        'edit_profile',
        'view_notifications',
        'view_dashboard',
        'view_social_media',
        'manage_social_media',
        'view_blog',
        'manage_blog'
    ],
    description = 'Manages social media and blog content',
    updated_at = now()
WHERE name = 'Social Media Manager';

-- Insert Editor role if it doesn't exist
INSERT INTO public.roles (name, description, permissions)
VALUES (
    'Editor',
    'Content editor with blog and portfolio management',
    ARRAY[
        'view_profile',
        'edit_profile',
        'view_notifications',
        'view_dashboard',
        'view_blog',
        'manage_blog',
        'view_portfolio',
        'manage_portfolio'
    ]
) ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    permissions = EXCLUDED.permissions,
    updated_at = now();

-- Developer: Technical access
UPDATE public.roles SET 
    permissions = ARRAY[
        'view_profile',
        'edit_profile',
        'view_notifications',
        'view_dashboard',
        'view_projects',
        'manage_projects',
        'view_portfolio',
        'manage_portfolio',
        'view_widgets',
        'manage_widgets',
        'view_website',
        'manage_website'
    ],
    description = 'Developer with technical and project management access',
    updated_at = now()
WHERE name = 'Developer';

-- Admin: Everything except Authentication, Branding, API
UPDATE public.roles SET 
    permissions = ARRAY[
        'view_profile',
        'edit_profile',
        'view_notifications',
        'view_dashboard',
        'view_products',
        'manage_products',
        'view_services',
        'manage_services',
        'view_orders',
        'manage_orders',
        'view_subscriptions',
        'manage_subscriptions',
        'view_coupons',
        'manage_coupons',
        'view_social_media',
        'manage_social_media',
        'view_blog',
        'manage_blog',
        'view_portfolio',
        'manage_portfolio',
        'view_projects',
        'manage_projects',
        'view_widgets',
        'manage_widgets',
        'view_website',
        'manage_website',
        'view_reports',
        'view_team',
        'manage_team',
        'view_customers',
        'manage_customers',
        'view_leads',
        'manage_leads',
        'view_payment',
        'manage_payment',
        'view_proposals',
        'manage_proposals',
        'view_applications',
        'manage_applications',
        'view_settings',
        'manage_settings',
        'manage_users',
        'manage_roles'
    ],
    description = 'Administrator with full access except authentication and branding settings',
    updated_at = now()
WHERE name = 'Admin';

-- Super Admin: Full access to everything
UPDATE public.roles SET 
    permissions = ARRAY[
        'view_profile',
        'edit_profile',
        'view_notifications',
        'view_dashboard',
        'view_products',
        'manage_products',
        'view_services',
        'manage_services',
        'view_orders',
        'manage_orders',
        'view_subscriptions',
        'manage_subscriptions',
        'view_coupons',
        'manage_coupons',
        'view_social_media',
        'manage_social_media',
        'view_blog',
        'manage_blog',
        'view_portfolio',
        'manage_portfolio',
        'view_projects',
        'manage_projects',
        'view_widgets',
        'manage_widgets',
        'view_website',
        'manage_website',
        'view_reports',
        'view_team',
        'manage_team',
        'view_customers',
        'manage_customers',
        'view_leads',
        'manage_leads',
        'view_payment',
        'manage_payment',
        'view_proposals',
        'manage_proposals',
        'view_applications',
        'manage_applications',
        'view_settings',
        'manage_settings',
        'manage_users',
        'manage_roles',
        'view_authentication',
        'manage_authentication',
        'view_branding',
        'manage_branding',
        'view_api',
        'manage_api',
        'super_admin'
    ],
    description = 'Super Administrator with unrestricted access to all features',
    updated_at = now()
WHERE name = 'Super Admin';
