import { supabase } from './supabase';

/**
 * Session Helper Utilities
 * Provides reliable session validation and user retrieval with automatic refresh
 */

/**
 * Gets a valid session, attempting to refresh if the current one is invalid
 * @throws Error if session cannot be obtained or refreshed
 */
export async function getValidSession() {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
        console.error('[SessionHelper] Error getting session:', error);
        throw new Error('Failed to get session');
    }

    if (!session) {
        // Try to refresh the session
        console.log('[SessionHelper] No session found, attempting refresh...');
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

        if (refreshError) {
            console.error('[SessionHelper] Refresh failed:', refreshError);
            throw new Error('Session expired. Please login again.');
        }

        if (!refreshData.session) {
            throw new Error('Session expired. Please login again.');
        }

        console.log('[SessionHelper] Session refreshed successfully');
        return refreshData.session;
    }

    return session;
}

/**
 * Gets the current user with session validation
 * @throws Error if no valid session or user
 */
export async function getValidUser() {
    const session = await getValidSession();
    return session.user;
}

/**
 * Checks if there is a valid session without throwing
 * @returns boolean indicating if session is valid
 */
export async function hasValidSession(): Promise<boolean> {
    try {
        await getValidSession();
        return true;
    } catch {
        return false;
    }
}

/**
 * Wrapper for database operations that requires authentication
 * Validates session before executing and provides better error handling
 */
export async function withSession<T>(
    operation: () => Promise<T>,
    options?: { silent?: boolean }
): Promise<T | null> {
    try {
        await getValidSession();
        return await operation();
    } catch (error: any) {
        if (!options?.silent) {
            console.error('[SessionHelper] Operation failed:', error.message);
        }
        return null;
    }
}
