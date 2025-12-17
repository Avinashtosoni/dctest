// E-commerce System Types

// =============================================
// ENUMS
// =============================================

export type PricingType = 'subscription' | 'one_time';
export type BillingCycle = 'monthly' | 'quarterly' | 'yearly';
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'expired' | 'past_due';
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
export type ServiceCategory = 'social_media' | 'website' | 'app' | 'marketing' | 'design' | 'other';
export type PaymentGatewayType = 'razorpay' | 'stripe' | 'paypal' | 'manual';
export type DiscountType = 'percentage' | 'fixed';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'void' | 'overdue';

// =============================================
// SERVICE PACKAGES
// =============================================

export interface ServicePackage {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    short_description: string | null;
    category: ServiceCategory;
    pricing_type: PricingType;

    // Pricing in paise/cents
    currency: string;
    monthly_price: number | null;
    quarterly_price: number | null;
    yearly_price: number | null;
    one_time_price: number | null;

    // Support for one-time
    support_duration_days: number;

    // Features
    features: string[];

    // Display
    icon: string | null;
    image_url: string | null;
    is_featured: boolean;
    is_active: boolean;
    sort_order: number;

    // Limits
    max_users: number | null;

    metadata: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export interface CreateServicePackagePayload {
    name: string;
    slug?: string;
    description?: string;
    short_description?: string;
    category: ServiceCategory;
    pricing_type: PricingType;
    currency?: string;
    monthly_price?: number;
    quarterly_price?: number;
    yearly_price?: number;
    one_time_price?: number;
    support_duration_days?: number;
    features?: string[];
    icon?: string;
    image_url?: string;
    is_featured?: boolean;
    is_active?: boolean;
    sort_order?: number;
    max_users?: number;
}

// =============================================
// SUBSCRIPTIONS
// =============================================

export interface Subscription {
    id: string;
    user_id: string;
    package_id: string;

    status: SubscriptionStatus;
    billing_cycle: BillingCycle;

    amount: number;
    currency: string;

    current_period_start: string;
    current_period_end: string | null;
    next_billing_date: string | null;

    trial_ends_at: string | null;

    cancelled_at: string | null;
    cancel_at_period_end: boolean;
    cancellation_reason: string | null;

    payment_gateway: PaymentGatewayType | null;
    gateway_subscription_id: string | null;
    gateway_customer_id: string | null;

    metadata: Record<string, any>;
    created_at: string;
    updated_at: string;

    // Joined
    package?: ServicePackage;
    user?: {
        id: string;
        email: string;
        full_name: string | null;
    };
}

// =============================================
// ORDERS
// =============================================

export interface Order {
    id: string;
    order_number: string;
    user_id: string;
    package_id: string;

    status: OrderStatus;

    subtotal: number;
    discount_amount: number;
    tax_amount: number;
    total_amount: number;
    currency: string;

    coupon_id: string | null;
    coupon_code: string | null;

    support_starts_at: string | null;
    support_ends_at: string | null;

    notes: string | null;
    admin_notes: string | null;

    metadata: Record<string, any>;
    created_at: string;
    updated_at: string;

    // Joined
    package?: ServicePackage;
    user?: {
        id: string;
        email: string;
        full_name: string | null;
    };
    coupon?: Coupon;
}

export interface CreateOrderPayload {
    user_id: string;
    package_id: string;
    subtotal: number;
    discount_amount?: number;
    tax_amount?: number;
    total_amount: number;
    currency?: string;
    coupon_id?: string;
    coupon_code?: string;
    notes?: string;
}

// =============================================
// PAYMENTS
// =============================================

export interface Payment {
    id: string;
    payment_number: string;
    user_id: string;

    order_id: string | null;
    subscription_id: string | null;

    amount: number;
    currency: string;

    status: PaymentStatus;

    payment_gateway: PaymentGatewayType | null;
    payment_method: string | null;

    gateway_payment_id: string | null;
    gateway_order_id: string | null;
    gateway_signature: string | null;
    gateway_response: Record<string, any>;

    failure_reason: string | null;
    failure_code: string | null;

    refunded_amount: number;
    refund_reason: string | null;
    refunded_at: string | null;

    paid_at: string | null;
    created_at: string;
    updated_at: string;

    // Joined
    order?: Order;
    subscription?: Subscription;
    user?: {
        id: string;
        email: string;
        full_name: string | null;
    };
}

// =============================================
// COUPONS
// =============================================

export interface Coupon {
    id: string;
    code: string;
    description: string | null;

    discount_type: DiscountType;
    discount_value: number;

    max_uses: number | null;
    uses_count: number;
    max_uses_per_user: number;

    min_order_amount: number | null;
    valid_from: string;
    valid_until: string | null;

    applicable_packages: string[];
    applicable_categories: ServiceCategory[] | null;

    is_active: boolean;
    created_by: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateCouponPayload {
    code: string;
    description?: string;
    discount_type: DiscountType;
    discount_value: number;
    max_uses?: number;
    max_uses_per_user?: number;
    min_order_amount?: number;
    valid_from?: string;
    valid_until?: string;
    applicable_packages?: string[];
    applicable_categories?: ServiceCategory[];
    is_active?: boolean;
}

// =============================================
// PAYMENT GATEWAYS
// =============================================

export interface PaymentGateway {
    id: string;
    name: PaymentGatewayType;
    display_name: string;
    description: string | null;

    is_active: boolean;
    is_test_mode: boolean;

    config: {
        api_key?: string;
        secret_key?: string;
        webhook_secret?: string;
        [key: string]: any;
    };
    test_config: {
        api_key?: string;
        secret_key?: string;
        webhook_secret?: string;
        [key: string]: any;
    };

    webhook_url: string | null;
    webhook_secret: string | null;

    supported_methods: string[];
    supported_currencies: string[];

    transaction_fee_percent: number;
    transaction_fee_fixed: number;

    icon_url: string | null;
    sort_order: number;

    created_at: string;
    updated_at: string;
}

export interface UpdatePaymentGatewayPayload {
    is_active?: boolean;
    is_test_mode?: boolean;
    config?: {
        api_key?: string;
        secret_key?: string;
        webhook_secret?: string;
    };
    test_config?: {
        api_key?: string;
        secret_key?: string;
        webhook_secret?: string;
    };
}

// =============================================
// INVOICES
// =============================================

export interface Invoice {
    id: string;
    invoice_number: string;
    user_id: string;

    order_id: string | null;
    subscription_id: string | null;
    payment_id: string | null;

    billing_name: string | null;
    billing_email: string | null;
    billing_address: {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        postal_code?: string;
        country?: string;
    };

    subtotal: number;
    discount_amount: number;
    tax_rate: number;
    tax_amount: number;
    total_amount: number;
    currency: string;

    status: InvoiceStatus;

    invoice_date: string;
    due_date: string | null;
    paid_at: string | null;

    line_items: InvoiceLineItem[];

    pdf_url: string | null;
    notes: string | null;

    created_at: string;
    updated_at: string;
}

export interface InvoiceLineItem {
    description: string;
    quantity: number;
    unit_price: number;
    amount: number;
}

// =============================================
// ANALYTICS & REPORTS
// =============================================

export interface RevenueMetrics {
    total_revenue: number;
    mrr: number; // Monthly Recurring Revenue
    arr: number; // Annual Recurring Revenue
    avg_order_value: number;
    total_orders: number;
    total_subscriptions: number;
    active_subscriptions: number;
    churn_rate: number;
}

export interface RevenueByPeriod {
    period: string;
    revenue: number;
    orders: number;
    subscriptions: number;
}

export interface TopService {
    package_id: string;
    package_name: string;
    total_revenue: number;
    total_sales: number;
}

// =============================================
// UTILITY TYPES
// =============================================

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£'
};

export const formatCurrency = (amount: number, currency: CurrencyCode = 'INR'): string => {
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    // Amount is in paise/cents, convert to main unit
    const value = amount / 100;
    return `${symbol}${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, string> = {
    social_media: 'Social Media',
    website: 'Website',
    app: 'App Development',
    marketing: 'Marketing',
    design: 'Design',
    other: 'Other'
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, { label: string; color: string }> = {
    pending: { label: 'Pending', color: 'yellow' },
    processing: { label: 'Processing', color: 'blue' },
    completed: { label: 'Completed', color: 'green' },
    cancelled: { label: 'Cancelled', color: 'gray' },
    refunded: { label: 'Refunded', color: 'red' }
};

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, { label: string; color: string }> = {
    active: { label: 'Active', color: 'green' },
    paused: { label: 'Paused', color: 'yellow' },
    cancelled: { label: 'Cancelled', color: 'gray' },
    expired: { label: 'Expired', color: 'red' },
    past_due: { label: 'Past Due', color: 'orange' }
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, { label: string; color: string }> = {
    pending: { label: 'Pending', color: 'yellow' },
    processing: { label: 'Processing', color: 'blue' },
    completed: { label: 'Completed', color: 'green' },
    failed: { label: 'Failed', color: 'red' },
    refunded: { label: 'Refunded', color: 'purple' },
    cancelled: { label: 'Cancelled', color: 'gray' }
};
