export type UserRole =
    | 'Visitor'
    | 'Customer'
    | 'Client'
    | 'Social Media Manager'
    | 'Developer'
    | 'Admin'
    | 'Super Admin';

export interface Profile {
    id: string;
    email: string | null;
    role: UserRole;
    created_at: string;
    updated_at: string;
    full_name?: string;
    avatar_url?: string;
    job_title?: string;
    bio?: string;
    phone?: string;
    status?: 'Active' | 'On Leave';
    social_links?: {
        linkedin?: string;
        twitter?: string;
        github?: string;
        website?: string;
    };
    skills?: string[];
    location?: string;
    company?: string;
    website?: string;
}
