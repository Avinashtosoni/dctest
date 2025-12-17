import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { UserRole } from '../types/auth';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    role: UserRole | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<UserRole | null>(null);
    const [loading, setLoading] = useState(true);

    // Track if we're currently signing out to prevent race conditions
    const isSigningOut = useRef(false);
    // Track mounted state to prevent state updates on unmounted component
    const isMounted = useRef(true);

    const fetchRole = useCallback(async (userId: string): Promise<UserRole | null> => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single();

            if (error) {
                // Don't treat "no rows" as an error - user might not have a profile yet
                if (error.code === 'PGRST116') {
                    console.warn('Profile not found for user:', userId);
                    return 'Visitor' as UserRole;
                }
                console.error('Error fetching role:', error);
                return null;
            }
            return data?.role as UserRole || 'Visitor' as UserRole;
        } catch (error) {
            console.error('Unexpected error fetching role:', error);
            return null;
        }
    }, []);

    useEffect(() => {
        isMounted.current = true;

        // Get initial session
        const initSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('Error getting session:', error);
                    if (isMounted.current) {
                        setLoading(false);
                    }
                    return;
                }

                if (isMounted.current) {
                    setSession(session);
                    setUser(session?.user ?? null);

                    if (session?.user) {
                        const userRole = await fetchRole(session.user.id);
                        if (isMounted.current) {
                            setRole(userRole);
                        }
                    } else {
                        setRole(null);
                    }

                    setLoading(false);
                }
            } catch (error) {
                console.error('Error initializing session:', error);
                if (isMounted.current) {
                    setLoading(false);
                }
            }
        };

        initSession();

        // Listen for changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            // Skip if we're in the middle of signing out
            if (isSigningOut.current) {
                return;
            }

            console.log('Auth state changed:', event, session?.user?.email);

            if (!isMounted.current) return;

            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                const userRole = await fetchRole(session.user.id);
                if (isMounted.current) {
                    setRole(userRole);
                }
            } else {
                setRole(null);
            }

            if (isMounted.current) {
                setLoading(false);
            }
        });

        return () => {
            isMounted.current = false;
            subscription.unsubscribe();
        };
    }, [fetchRole]);

    const signOut = useCallback(async () => {
        isSigningOut.current = true;

        try {
            // Clear local state first
            setSession(null);
            setUser(null);
            setRole(null);

            // Then sign out from Supabase
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Error signing out:', error);
            }
        } catch (error) {
            console.error('Error during signOut:', error);
        } finally {
            isSigningOut.current = false;
        }
    }, []);

    const value = {
        session,
        user,
        role,
        loading,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
