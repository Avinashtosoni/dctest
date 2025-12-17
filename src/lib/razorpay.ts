// Razorpay Payment Integration
// Website: https://razorpay.com/docs/api/

declare global {
    interface Window {
        Razorpay: any;
    }
}

export interface RazorpayOptions {
    key: string;
    amount: number; // in paise (INR) or cents
    currency: string;
    name: string;
    description: string;
    order_id?: string;
    prefill?: {
        name?: string;
        email?: string;
        contact?: string;
    };
    notes?: Record<string, string>;
    theme?: {
        color?: string;
    };
    handler?: (response: RazorpayResponse) => void;
    modal?: {
        ondismiss?: () => void;
    };
}

export interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
}

// Load Razorpay script dynamically
export function loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

// Initialize and open Razorpay payment
export async function initiateRazorpayPayment(options: RazorpayOptions): Promise<RazorpayResponse> {
    const loaded = await loadRazorpayScript();

    if (!loaded) {
        throw new Error('Failed to load Razorpay SDK');
    }

    return new Promise((resolve, reject) => {
        const razorpayOptions: RazorpayOptions = {
            ...options,
            handler: (response) => {
                resolve(response);
            },
            modal: {
                ondismiss: () => {
                    reject(new Error('Payment cancelled by user'));
                },
            },
        };

        const razorpay = new window.Razorpay(razorpayOptions);
        razorpay.on('payment.failed', (response: any) => {
            reject(new Error(response.error.description || 'Payment failed'));
        });
        razorpay.open();
    });
}

// Get Razorpay key from database or environment
export async function getRazorpayKey(): Promise<string> {
    try {
        // Import supabase dynamically to avoid circular dependencies
        const { supabase } = await import('./supabase');

        console.log('[Razorpay] Fetching payment gateway configuration...');

        const { data, error } = await supabase
            .from('payment_gateways')
            .select('config, test_config, is_test_mode, is_active')
            .eq('name', 'razorpay')
            .eq('is_active', true)
            .single();

        if (error || !data) {
            console.error('[Razorpay] Failed to fetch config:', error);
            console.warn('[Razorpay] Using fallback environment key');
            return import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_PLACEHOLDER';
        }

        console.log('[Razorpay] Gateway data:', {
            is_test_mode: data.is_test_mode,
            is_active: data.is_active,
            has_config: !!data.config,
            has_test_config: !!data.test_config
        });

        // Get the appropriate config based on test mode
        const config = data.is_test_mode ? data.test_config : data.config;
        const keyId = config?.key_id;

        console.log('[Razorpay] Selected config:', {
            mode: data.is_test_mode ? 'TEST' : 'LIVE',
            key_id_preview: keyId ? keyId.substring(0, 15) + '...' : 'NOT FOUND'
        });

        if (!keyId) {
            console.warn('[Razorpay] key_id not found in config, using fallback');
            return import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_PLACEHOLDER';
        }

        console.log('[Razorpay] ✅ Using key:', keyId.substring(0, 15) + '...');
        return keyId;
    } catch (error) {
        console.error('[Razorpay] Error fetching key:', error);
        return import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_PLACEHOLDER';
    }
}

// Format amount for Razorpay (convert to paise)
export function formatAmountForRazorpay(amount: number): number {
    // Amount in database is stored in paise, so return as is
    return Math.round(amount);
}

// Format amount for display (convert from paise to rupees)
export function formatAmountFromPaise(amount: number): string {
    return (amount / 100).toFixed(2);
}
