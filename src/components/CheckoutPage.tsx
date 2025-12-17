import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ShoppingCart,
    CreditCard,
    Banknote,
    Loader2,
    CheckCircle,
    ArrowLeft,
    Shield,
    Package,
    Tag,
    User,
    Lock,
    UserPlus,
    Download
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { initiateRazorpayPayment, getRazorpayKey, formatAmountForRazorpay } from '../lib/razorpay';
import { showToast } from '../lib/sweetalert';
import { generateSecurePassword } from '../lib/passwordGenerator';
import { createInvoiceForOrder } from '../lib/invoice';
import SEO from './SEO';

interface Product {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    short_description: string | null;
    one_time_price: number | null;
    monthly_price: number | null;
    image_url: string | null;
    pricing_type: 'subscription' | 'one_time';
    features: string[];
}

type PaymentMethod = 'razorpay' | 'cash';

interface BillingInfo {
    full_name: string;
    email: string;
    phone: string;
    address_line1: string;
    address_line2: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    notes: string;
}

export default function CheckoutPage() {
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('razorpay');
    const [couponCode, setCouponCode] = useState('');
    const [couponApplied, setCouponApplied] = useState<{ id: string; discount: number } | null>(null);
    const [applyingCoupon, setApplyingCoupon] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');
    const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);

    // Login popup state
    const [showLoginPopup, setShowLoginPopup] = useState(false);
    const [isGuest, setIsGuest] = useState(false);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loggingIn, setLoggingIn] = useState(false);

    // New user account state
    const [newUserCredentials, setNewUserCredentials] = useState<{
        email: string;
        password: string;
        userId: string;
    } | null>(null);

    // Billing form state
    const [billingInfo, setBillingInfo] = useState<BillingInfo>({
        full_name: '',
        email: user?.email || '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'India',
        notes: ''
    });

    const [errors, setErrors] = useState<Partial<BillingInfo>>({});

    useEffect(() => {
        if (productId) {
            fetchProduct();
        }

        // Show login popup if user is not authenticated
        if (!user && !isGuest) {
            setShowLoginPopup(true);
        }

        if (user?.email) {
            setBillingInfo(prev => ({ ...prev, email: user.email || '' }));
            setIsGuest(false);
            setShowLoginPopup(false);
        }
    }, [productId, user, isGuest]);

    const fetchProduct = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('service_packages')
                .select('*')
                .eq('id', productId)
                .single();

            if (error) throw error;
            setProduct(data);
        } catch (error) {
            console.error('Error fetching product:', error);
            showToast.error('Product not found');
            navigate('/store');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async () => {
        if (!loginEmail || !loginPassword) {
            showToast.error('Please enter email and password');
            return;
        }

        setLoggingIn(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: loginEmail,
                password: loginPassword
            });
            if (error) {
                showToast.error(error.message || 'Login failed');
                return;
            }

            showToast.success('Logged in successfully!');
            setShowLoginPopup(false);
        } catch (error: any) {
            console.error('Login error:', error);
            showToast.error('Login failed. Please try again.');
        } finally {
            setLoggingIn(false);
        }
    };

    const handleContinueAsGuest = () => {
        setIsGuest(true);
        setShowLoginPopup(false);
    };

    const createUserAccount = async (orderId: string): Promise<boolean> => {
        if (!isGuest || !billingInfo.email) return false;

        try {
            // Generate secure password
            const generatedPassword = generateSecurePassword(12);

            console.log('[Auto-Registration] Creating account for:', billingInfo.email);

            // Create user account via Supabase Auth
            const { data, error } = await supabase.auth.signUp({
                email: billingInfo.email,
                password: generatedPassword,
                options: {
                    data: {
                        full_name: billingInfo.full_name,
                        phone: billingInfo.phone,
                        created_via: 'checkout',
                        initial_order_id: orderId
                    }
                }
            });

            if (error) {
                console.error('[Auto-Registration] Account creation failed:', error);
                // Don't block checkout if account creation fails
                return false;
            }

            if (!data.user) {
                console.warn('[Auto-Registration] No user data returned');
                return false;
            }

            console.log('[Auto-Registration] Account created successfully:', data.user.id);

            // Update order with new user_id
            const { error: updateError } = await supabase
                .from('orders')
                .update({ user_id: data.user.id })
                .eq('id', orderId);

            if (updateError) {
                console.error('[Auto-Registration] Failed to link order:', updateError);
            }

            // Store credentials for display
            setNewUserCredentials({
                email: billingInfo.email,
                password: generatedPassword,
                userId: data.user.id
            });

            return true;
        } catch (error) {
            console.error('[Auto-Registration] Unexpected error:', error);
            return false;
        }
    };

    const handleAutoLogin = async () => {
        if (!newUserCredentials) return;

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: newUserCredentials.email,
                password: newUserCredentials.password
            });

            if (error) {
                showToast.error('Auto-login failed. Please login manually.');
                return;
            }

            showToast.success('Logged in successfully!');
            navigate('/dashboard/orders');
        } catch (error) {
            console.error('[Auto-Login] Error:', error);
            showToast.error('Login failed. Please try manually.');
        }
    };

    const getPrice = () => {
        if (!product) return 0;
        return product.pricing_type === 'subscription'
            ? (product.monthly_price || 0)
            : (product.one_time_price || 0);
    };

    const getDiscount = () => {
        if (!couponApplied) return 0;
        return couponApplied.discount;
    };

    const getTotalAmount = () => {
        return Math.max(0, getPrice() - getDiscount());
    };

    const formatPrice = (amount: number) => {
        return '₹' + (amount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 });
    };

    const handleInputChange = (field: keyof BillingInfo, value: string) => {
        setBillingInfo(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<BillingInfo> = {};

        if (!billingInfo.full_name.trim()) newErrors.full_name = 'Full name is required';
        if (!billingInfo.email.trim()) newErrors.email = 'Email is required';
        if (!billingInfo.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!billingInfo.address_line1.trim()) newErrors.address_line1 = 'Address is required';
        if (!billingInfo.city.trim()) newErrors.city = 'City is required';
        if (!billingInfo.state.trim()) newErrors.state = 'State is required';
        if (!billingInfo.postal_code.trim()) newErrors.postal_code = 'Postal code is required';
        if (!billingInfo.country.trim()) newErrors.country = 'Country is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const applyCoupon = async () => {
        if (!couponCode.trim()) return;

        setApplyingCoupon(true);
        try {
            const { data, error } = await supabase
                .from('coupons')
                .select('*')
                .eq('code', couponCode.toUpperCase())
                .eq('is_active', true)
                .single();

            if (error || !data) {
                showToast.error('Invalid coupon code');
                return;
            }

            if (data.valid_until && new Date(data.valid_until) < new Date()) {
                showToast.error('Coupon has expired');
                return;
            }

            if (data.max_uses && data.uses_count >= data.max_uses) {
                showToast.error('Coupon usage limit reached');
                return;
            }

            if (data.min_order_amount && getPrice() < data.min_order_amount) {
                showToast.error(`Minimum order amount is ${formatPrice(data.min_order_amount)}`);
                return;
            }

            let discount = 0;
            if (data.discount_type === 'percentage') {
                discount = Math.round((getPrice() * data.discount_value) / 100);
            } else {
                discount = data.discount_value;
            }

            setCouponApplied({ id: data.id, discount });
            showToast.success('Coupon applied successfully!');
        } catch (error) {
            console.error('Error applying coupon:', error);
            showToast.error('Failed to apply coupon');
        } finally {
            setApplyingCoupon(false);
        }
    };

    const createOrder = async (paymentStatus: 'pending' | 'completed', paymentId?: string) => {
        if (!product) return null;

        try {
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    user_id: user?.id || null,
                    package_id: product.id,
                    status: paymentStatus === 'completed' ? 'processing' : 'pending',
                    subtotal: getPrice(),
                    discount_amount: getDiscount(),
                    tax_amount: 0,
                    total_amount: getTotalAmount(),
                    coupon_id: couponApplied?.id || null,
                    coupon_code: couponApplied ? couponCode.toUpperCase() : null,
                    metadata: {
                        billing_info: billingInfo,
                        is_guest: isGuest
                    }
                })
                .select()
                .single();

            if (orderError) throw orderError;

            const { error: paymentError } = await supabase
                .from('payments')
                .insert({
                    user_id: user?.id || null,
                    order_id: order.id,
                    amount: getTotalAmount(),
                    status: paymentStatus,
                    payment_gateway: paymentMethod === 'cash' ? 'manual' : 'razorpay',
                    payment_method: paymentMethod === 'cash' ? 'cash' : 'online',
                    gateway_payment_id: paymentId || null,
                    paid_at: paymentStatus === 'completed' ? new Date().toISOString() : null
                });

            if (paymentError) throw paymentError;

            // Save form submission
            await supabase
                .from('form_submissions')
                .insert({
                    form_name: 'Checkout',
                    form_data: billingInfo,
                    email: billingInfo.email,
                    metadata: {
                        order_id: order.id,
                        product_id: product.id,
                        is_guest: isGuest
                    }
                });

            return order;
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    };

    const handlePayment = async () => {
        if (!product) {
            showToast.error('Product not found');
            return;
        }

        // For guest checkout, user will be null but isGuest will be true
        if (!user && !isGuest) {
            setShowLoginPopup(true);
            return;
        }

        if (!validateForm()) {
            showToast.error('Please fill in all required fields');
            return;
        }

        setProcessing(true);
        try {
            if (paymentMethod === 'cash') {
                const order = await createOrder('pending');
                if (order) {
                    // Create user account for guest checkout
                    if (isGuest) {
                        await createUserAccount(order.id);
                    }

                    // Generate and store invoice
                    const invoiceResult = await createInvoiceForOrder(
                        order.id,
                        user?.id || null,
                        null,
                        billingInfo,
                        product.name,
                        { subtotal: getPrice(), discount: getDiscount(), tax: 0, total: getTotalAmount() }
                    );
                    if (invoiceResult?.pdfUrl) {
                        setInvoiceUrl(invoiceResult.pdfUrl);
                    }

                    setOrderNumber(order.order_number);
                    setOrderComplete(true);
                    showToast.success('Order placed! Awaiting admin approval.');
                }
            } else {
                // Fetch Razorpay key from database
                const razorpayKey = await getRazorpayKey();

                const response = await initiateRazorpayPayment({
                    key: razorpayKey,
                    amount: formatAmountForRazorpay(getTotalAmount()),
                    currency: 'INR',
                    name: 'Digital Comrade',
                    description: product.name,
                    prefill: {
                        email: billingInfo.email,
                        name: billingInfo.full_name,
                        contact: billingInfo.phone
                    },
                    theme: {
                        color: '#01478c'
                    }
                });

                const order = await createOrder('completed', response.razorpay_payment_id);
                if (order) {
                    // Create user account for guest checkout
                    if (isGuest) {
                        await createUserAccount(order.id);
                    }

                    // Generate and store invoice
                    const invoiceResult = await createInvoiceForOrder(
                        order.id,
                        user?.id || null,
                        response.razorpay_payment_id,
                        billingInfo,
                        product.name,
                        { subtotal: getPrice(), discount: getDiscount(), tax: 0, total: getTotalAmount() }
                    );
                    if (invoiceResult?.pdfUrl) {
                        setInvoiceUrl(invoiceResult.pdfUrl);
                    }

                    setOrderNumber(order.order_number);
                    setOrderComplete(true);
                    showToast.success('Payment successful! Order confirmed.');
                }
            }
        } catch (error: any) {
            console.error('Payment error:', error);
            if (error.message !== 'Payment cancelled by user') {
                showToast.error(error.message || 'Payment failed. Please try again.');
            }
        } finally {
            setProcessing(false);
        }
    };

    // Login/Guest Selection Popup
    const LoginPopup = () => (
        <div className={`fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 ${showLoginPopup ? '' : 'hidden'}`}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-in fade-in zoom-in-95 duration-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
                <p className="text-gray-600 mb-6">Sign in to continue with checkout or proceed as guest</p>

                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            placeholder="your@email.com"
                            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            placeholder="••••••••"
                            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={handleLogin}
                        disabled={loggingIn}
                        className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loggingIn ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Signing In...
                            </>
                        ) : (
                            <>
                                <Lock size={20} />
                                Sign In
                            </>
                        )}
                    </button>

                    <button
                        onClick={handleContinueAsGuest}
                        className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                        <UserPlus size={20} />
                        Continue as Guest
                    </button>
                </div>

                <p className="text-center text-sm text-gray-500 mt-4">
                    Don't have an account?{' '}
                    <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
        );
    }

    if (orderComplete) {
        return (
            <div className="min-h-screen bg-gray-50 pt-24 pb-12">
                <SEO title="Order Confirmed - Digital Comrade" />
                <div className="max-w-lg mx-auto px-4">
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={48} className="text-green-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {paymentMethod === 'cash' ? 'Order Placed!' : 'Payment Successful!'}
                        </h1>
                        <p className="text-gray-600 mb-4">
                            {paymentMethod === 'cash'
                                ? 'Your order is pending admin approval for cash payment.'
                                : 'Your order has been confirmed and is being processed.'}
                        </p>
                        <div className="bg-gray-50 rounded-xl p-4 mb-6">
                            <p className="text-sm text-gray-500">Order Number</p>
                            <p className="text-xl font-bold text-gray-900">{orderNumber}</p>
                        </div>

                        {/* New Account Credentials */}
                        {newUserCredentials && (
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border-2 border-blue-200">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                        <User size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">🎉 Account Created!</h3>
                                        <p className="text-sm text-gray-600">Your login credentials</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="bg-white rounded-xl p-3">
                                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Email (Username)</p>
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="font-mono text-sm text-gray-900 flex-1 break-all">
                                                {newUserCredentials.email}
                                            </p>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(newUserCredentials.email);
                                                    showToast.success('Email copied!');
                                                }}
                                                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium"
                                            >
                                                Copy
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl p-3">
                                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Password</p>
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="font-mono text-sm text-gray-900 flex-1 break-all">
                                                {newUserCredentials.password}
                                            </p>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(newUserCredentials.password);
                                                    showToast.success('Password copied!');
                                                }}
                                                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium"
                                            >
                                                Copy
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                                    <p className="text-xs text-yellow-800 flex items-start gap-2">
                                        <span className="text-lg">⚠️</span>
                                        <span><strong>Important:</strong> Save this password! You can change it later from your dashboard.</span>
                                    </p>
                                </div>

                                <button
                                    onClick={handleAutoLogin}
                                    className="w-full mt-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg"
                                >
                                    <Lock size={20} />
                                    Login & View Order
                                </button>
                            </div>
                        )}

                        {/* Download Invoice Button */}
                        {invoiceUrl && (
                            <div className="mb-4">
                                <button
                                    onClick={() => window.open(invoiceUrl, '_blank')}
                                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 shadow-lg"
                                >
                                    <Download size={20} />
                                    Download Invoice (PDF)
                                </button>
                            </div>
                        )}

                        <div className="flex gap-4">
                            <Link
                                to="/store"
                                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors text-center"
                            >
                                Continue Shopping
                            </Link>
                            <Link
                                to="/dashboard"
                                className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors text-center"
                            >
                                View Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return null;
    }

    return (
        <>
            <LoginPopup />
            <div className="min-h-screen bg-gray-50 pt-24 pb-12">
                <SEO title={`Checkout - ${product.name}`} />

                <div className="max-w-6xl mx-auto px-4">
                    <Link
                        to="/store"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                    >
                        <ArrowLeft size={20} />
                        Back to Store
                    </Link>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Left Column - Forms */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Billing Information */}
                            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <User size={20} />
                                    Billing Information
                                </h2>



                                <div className="grid md:grid-cols-2 gap-4">
                                    {/* Full Name */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Full Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={billingInfo.full_name}
                                            onChange={(e) => handleInputChange('full_name', e.target.value)}
                                            className={`w-full px-4 py-3 rounded-xl border ${errors.full_name ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none`}
                                            placeholder="John Doe"
                                        />
                                        {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name}</p>}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={billingInfo.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none`}
                                            placeholder="john@example.com"
                                        />
                                        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            value={billingInfo.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            className={`w-full px-4 py-3 rounded-xl border ${errors.phone ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none`}
                                            placeholder="+91 98765 43210"
                                        />
                                        {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                                    </div>

                                    {/* Address Line 1 */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Address Line 1 <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={billingInfo.address_line1}
                                            onChange={(e) => handleInputChange('address_line1', e.target.value)}
                                            className={`w-full px-4 py-3 rounded-xl border ${errors.address_line1 ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none`}
                                            placeholder="Street address"
                                        />
                                        {errors.address_line1 && <p className="text-xs text-red-500 mt-1">{errors.address_line1}</p>}
                                    </div>

                                    {/* Address Line 2 */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Address Line 2
                                        </label>
                                        <input
                                            type="text"
                                            value={billingInfo.address_line2}
                                            onChange={(e) => handleInputChange('address_line2', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                            placeholder="Apartment, suite, etc (optional)"
                                        />
                                    </div>

                                    {/* City */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            City <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={billingInfo.city}
                                            onChange={(e) => handleInputChange('city', e.target.value)}
                                            className={`w-full px-4 py-3 rounded-xl border ${errors.city ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none`}
                                            placeholder="Mumbai"
                                        />
                                        {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                                    </div>

                                    {/* State */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            State/Province <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={billingInfo.state}
                                            onChange={(e) => handleInputChange('state', e.target.value)}
                                            className={`w-full px-4 py-3 rounded-xl border ${errors.state ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none`}
                                            placeholder="Maharashtra"
                                        />
                                        {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
                                    </div>

                                    {/* Postal Code */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            PIN/Postal Code <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={billingInfo.postal_code}
                                            onChange={(e) => handleInputChange('postal_code', e.target.value)}
                                            className={`w-full px-4 py-3 rounded-xl border ${errors.postal_code ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none`}
                                            placeholder="400001"
                                        />
                                        {errors.postal_code && <p className="text-xs text-red-500 mt-1">{errors.postal_code}</p>}
                                    </div>

                                    {/* Country */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Country <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={billingInfo.country}
                                            onChange={(e) => handleInputChange('country', e.target.value)}
                                            className={`w-full px-4 py-3 rounded-xl border ${errors.country ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none`}
                                        >
                                            <option value="India">India</option>
                                            <option value="United States">United States</option>
                                            <option value="United Kingdom">United Kingdom</option>
                                            <option value="Canada">Canada</option>
                                            <option value="Australia">Australia</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        {errors.country && <p className="text-xs text-red-500 mt-1">{errors.country}</p>}
                                    </div>

                                    {/* Notes */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Order Notes (Optional)
                                        </label>
                                        <textarea
                                            value={billingInfo.notes}
                                            onChange={(e) => handleInputChange('notes', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                            placeholder="Special instructions for your order"
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <CreditCard size={20} />
                                    Payment Method
                                </h3>
                                <div className="space-y-3">
                                    <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'razorpay'
                                        ? 'border-blue-600 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="razorpay"
                                            checked={paymentMethod === 'razorpay'}
                                            onChange={() => setPaymentMethod('razorpay')}
                                            className="w-5 h-5 text-blue-600"
                                        />
                                        <CreditCard size={24} className="text-blue-600" />
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-900">Pay Online</p>
                                            <p className="text-sm text-gray-500">Cards, UPI, Net Banking, Wallets</p>
                                        </div>
                                    </label>
                                    <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'cash'
                                        ? 'border-blue-600 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="cash"
                                            checked={paymentMethod === 'cash'}
                                            onChange={() => setPaymentMethod('cash')}
                                            className="w-5 h-5 text-blue-600"
                                        />
                                        <Banknote size={24} className="text-green-600" />
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-900">Pay in Cash</p>
                                            <p className="text-sm text-gray-500">Pending admin approval</p>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 sticky top-24 space-y-6">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <ShoppingCart size={20} />
                                    Order Summary
                                </h3>

                                {/* Product */}
                                <div className="flex gap-3 pb-4 border-b border-gray-100">
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                        {product.image_url ? (
                                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package size={24} className="text-gray-300" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 text-sm">{product.name}</h4>
                                        <p className="text-xs text-gray-500 mt-0.5">{product.short_description}</p>
                                        <p className="text-sm font-bold text-blue-600 mt-1">
                                            {formatPrice(getPrice())}
                                            {product.pricing_type === 'subscription' && <span className="text-xs font-normal">/mo</span>}
                                        </p>
                                    </div>
                                </div>

                                {/* Coupon */}
                                <div className="border-b border-gray-100 pb-4">
                                    <label className="block text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
                                        <Tag size={14} />
                                        Coupon Code
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="SAVE20"
                                            className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none uppercase"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value)}
                                            disabled={!!couponApplied}
                                        />
                                        <button
                                            onClick={applyCoupon}
                                            disabled={applyingCoupon || !!couponApplied}
                                            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                                        >
                                            {applyingCoupon ? <Loader2 className="animate-spin" size={16} /> : 'Apply'}
                                        </button>
                                    </div>
                                    {couponApplied && (
                                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                                            <CheckCircle size={12} />
                                            Saved {formatPrice(couponApplied.discount)}!
                                        </p>
                                    )}
                                </div>

                                {/* Price Breakdown */}
                                <div className="space-y-2 pb-4 border-b border-gray-100">
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Subtotal</span>
                                        <span>{formatPrice(getPrice())}</span>
                                    </div>
                                    {couponApplied && (
                                        <div className="flex justify-between text-sm text-green-600">
                                            <span>Discount</span>
                                            <span>-{formatPrice(getDiscount())}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-between text-lg font-bold text-gray-900">
                                    <span>Total</span>
                                    <span>{formatPrice(getTotalAmount())}</span>
                                </div>

                                <button
                                    onClick={handlePayment}
                                    disabled={processing}
                                    className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-200"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            {paymentMethod === 'cash' ? 'Place Order' : 'Pay Now'}
                                        </>
                                    )}
                                </button>

                                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                                    <Shield size={14} />
                                    <span>Secure & encrypted payment</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
