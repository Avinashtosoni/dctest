import { useState, useEffect } from 'react';
import {
    X,
    Loader2,
    CreditCard,
    Banknote,
    CheckCircle,
    User,
    MapPin,
    Phone,
    Mail,
    Package,
    Download,
    Tag
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../../lib/sweetalert';
import { initiateRazorpayPayment, getRazorpayKey, formatAmountForRazorpay } from '../../lib/razorpay';
import { createInvoiceForOrder } from '../../lib/invoice';

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
}

type PaymentMethod = 'razorpay' | 'cash';

interface CheckoutModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function CheckoutModal({ product, isOpen, onClose, onSuccess }: CheckoutModalProps) {
    const { user } = useAuth();
    const [step, setStep] = useState<'billing' | 'payment' | 'success'>('billing');
    const [processing, setProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('razorpay');

    // Coupon state
    const [couponCode, setCouponCode] = useState('');
    const [couponApplied, setCouponApplied] = useState<{ id: string; discount: number } | null>(null);
    const [applyingCoupon, setApplyingCoupon] = useState(false);

    // Order result
    const [orderNumber, setOrderNumber] = useState('');
    const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);

    // Billing form
    const [billingInfo, setBillingInfo] = useState<BillingInfo>({
        full_name: '',
        email: user?.email || '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'India'
    });

    const [errors, setErrors] = useState<Partial<BillingInfo>>({});

    // Reset on open/close
    useEffect(() => {
        if (isOpen) {
            setStep('billing');
            setOrderNumber('');
            setInvoiceUrl(null);
            setCouponApplied(null);
            setCouponCode('');
            if (user?.email) {
                setBillingInfo(prev => ({ ...prev, email: user.email || '' }));
            }
        }
    }, [isOpen, user]);

    if (!isOpen || !product) return null;

    const getPrice = () => {
        return product.pricing_type === 'subscription'
            ? (product.monthly_price || 0)
            : (product.one_time_price || 0);
    };

    const getDiscount = () => couponApplied?.discount || 0;
    const getTotalAmount = () => Math.max(0, getPrice() - getDiscount());

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
        if (!billingInfo.full_name.trim()) newErrors.full_name = 'Required';
        if (!billingInfo.email.trim()) newErrors.email = 'Required';
        if (!billingInfo.phone.trim()) newErrors.phone = 'Required';
        if (!billingInfo.address_line1.trim()) newErrors.address_line1 = 'Required';
        if (!billingInfo.city.trim()) newErrors.city = 'Required';
        if (!billingInfo.state.trim()) newErrors.state = 'Required';
        if (!billingInfo.postal_code.trim()) newErrors.postal_code = 'Required';
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
                showToast.error('Coupon expired');
                return;
            }

            let discount = 0;
            if (data.discount_type === 'percentage') {
                discount = Math.round((getPrice() * data.discount_value) / 100);
            } else {
                discount = data.discount_value;
            }

            setCouponApplied({ id: data.id, discount });
            showToast.success('Coupon applied!');
        } catch (error) {
            showToast.error('Failed to apply coupon');
        } finally {
            setApplyingCoupon(false);
        }
    };

    const createOrder = async (paymentStatus: 'pending' | 'completed', paymentId?: string) => {
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
                metadata: { billing_info: billingInfo }
            })
            .select()
            .single();

        if (orderError) throw orderError;

        await supabase.from('payments').insert({
            user_id: user?.id || null,
            order_id: order.id,
            amount: getTotalAmount(),
            status: paymentStatus,
            payment_gateway: paymentMethod === 'cash' ? 'manual' : 'razorpay',
            payment_method: paymentMethod === 'cash' ? 'cash' : 'online',
            gateway_payment_id: paymentId || null,
            paid_at: paymentStatus === 'completed' ? new Date().toISOString() : null
        });

        return order;
    };

    const handleProceedToPayment = () => {
        if (!validateForm()) {
            showToast.error('Please fill all required fields');
            return;
        }
        setStep('payment');
    };

    const handlePayment = async () => {
        setProcessing(true);
        try {
            if (paymentMethod === 'cash') {
                const order = await createOrder('pending');
                console.log('[Checkout] Order created:', order.id, order.order_number);

                // Generate invoice
                console.log('[Checkout] Creating invoice for order:', order.id);
                const invoiceResult = await createInvoiceForOrder(
                    order.id,
                    user?.id || null,
                    null,
                    billingInfo,
                    product.name,
                    { subtotal: getPrice(), discount: getDiscount(), tax: 0, total: getTotalAmount() }
                );
                console.log('[Checkout] Invoice result:', invoiceResult);

                if (invoiceResult?.pdfUrl) {
                    setInvoiceUrl(invoiceResult.pdfUrl);
                } else {
                    console.warn('[Checkout] Invoice generation failed - no PDF URL returned');
                }

                setOrderNumber(order.order_number);
                setStep('success');
                showToast.success('Order placed! Awaiting approval.');
            } else {
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
                    theme: { color: '#01478c' }
                });

                const order = await createOrder('completed', response.razorpay_payment_id);

                // Generate invoice
                const invoiceResult = await createInvoiceForOrder(
                    order.id,
                    user?.id || null,
                    response.razorpay_payment_id,
                    billingInfo,
                    product.name,
                    { subtotal: getPrice(), discount: getDiscount(), tax: 0, total: getTotalAmount() }
                );
                if (invoiceResult?.pdfUrl) setInvoiceUrl(invoiceResult.pdfUrl);

                setOrderNumber(order.order_number);
                setStep('success');
                showToast.success('Payment successful!');
            }
        } catch (error: any) {
            if (error.message !== 'Payment cancelled by user') {
                showToast.error(error.message || 'Payment failed');
            }
        } finally {
            setProcessing(false);
        }
    };

    const handleClose = () => {
        if (step === 'success' && onSuccess) {
            onSuccess();
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-600">
                    <div>
                        <h2 className="font-bold text-lg text-white">
                            {step === 'success' ? 'Order Confirmed!' : 'Checkout'}
                        </h2>
                        <p className="text-blue-100 text-sm">{product.name}</p>
                    </div>
                    <button onClick={handleClose} className="text-white/80 hover:text-white p-2">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {step === 'billing' && (
                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <User size={18} /> Billing Information
                            </h3>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                    <input
                                        type="text"
                                        value={billingInfo.full_name}
                                        onChange={(e) => handleInputChange('full_name', e.target.value)}
                                        className={`w-full px-4 py-2.5 rounded-xl border ${errors.full_name ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none`}
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <Mail size={14} className="inline mr-1" />Email *
                                    </label>
                                    <input
                                        type="email"
                                        value={billingInfo.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        className={`w-full px-4 py-2.5 rounded-xl border ${errors.email ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none`}
                                        placeholder="john@example.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <Phone size={14} className="inline mr-1" />Phone *
                                    </label>
                                    <input
                                        type="tel"
                                        value={billingInfo.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        className={`w-full px-4 py-2.5 rounded-xl border ${errors.phone ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none`}
                                        placeholder="+91 98765 43210"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <MapPin size={14} className="inline mr-1" />Address *
                                    </label>
                                    <input
                                        type="text"
                                        value={billingInfo.address_line1}
                                        onChange={(e) => handleInputChange('address_line1', e.target.value)}
                                        className={`w-full px-4 py-2.5 rounded-xl border ${errors.address_line1 ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none`}
                                        placeholder="Street address"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                                    <input
                                        type="text"
                                        value={billingInfo.city}
                                        onChange={(e) => handleInputChange('city', e.target.value)}
                                        className={`w-full px-4 py-2.5 rounded-xl border ${errors.city ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none`}
                                        placeholder="Mumbai"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                                    <input
                                        type="text"
                                        value={billingInfo.state}
                                        onChange={(e) => handleInputChange('state', e.target.value)}
                                        className={`w-full px-4 py-2.5 rounded-xl border ${errors.state ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none`}
                                        placeholder="Maharashtra"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code *</label>
                                    <input
                                        type="text"
                                        value={billingInfo.postal_code}
                                        onChange={(e) => handleInputChange('postal_code', e.target.value)}
                                        className={`w-full px-4 py-2.5 rounded-xl border ${errors.postal_code ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none`}
                                        placeholder="400001"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                    <input
                                        type="text"
                                        value={billingInfo.country}
                                        onChange={(e) => handleInputChange('country', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                        placeholder="India"
                                    />
                                </div>
                            </div>

                            {/* Coupon */}
                            <div className="pt-4 border-t border-gray-100">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <Tag size={14} className="inline mr-1" />Coupon Code
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                        placeholder="Enter code"
                                        disabled={!!couponApplied}
                                    />
                                    <button
                                        onClick={applyCoupon}
                                        disabled={applyingCoupon || !!couponApplied}
                                        className="px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 disabled:opacity-50"
                                    >
                                        {applyingCoupon ? <Loader2 size={16} className="animate-spin" /> : 'Apply'}
                                    </button>
                                </div>
                                {couponApplied && (
                                    <p className="text-sm text-green-600 mt-1">✓ Coupon applied! Saving {formatPrice(couponApplied.discount)}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 'payment' && (
                        <div className="space-y-6">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <CreditCard size={18} /> Payment Method
                            </h3>

                            <div className="grid md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => setPaymentMethod('razorpay')}
                                    className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${paymentMethod === 'razorpay'
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <CreditCard size={24} className={paymentMethod === 'razorpay' ? 'text-blue-600' : 'text-gray-400'} />
                                    <div className="text-left">
                                        <p className="font-bold text-gray-900">Pay Online</p>
                                        <p className="text-xs text-gray-500">Card, UPI, NetBanking</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setPaymentMethod('cash')}
                                    className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${paymentMethod === 'cash'
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <Banknote size={24} className={paymentMethod === 'cash' ? 'text-blue-600' : 'text-gray-400'} />
                                    <div className="text-left">
                                        <p className="font-bold text-gray-900">Cash/Manual</p>
                                        <p className="text-xs text-gray-500">Pay later (Admin approval)</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle size={48} className="text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h3>
                            <p className="text-gray-600 mb-4">
                                {paymentMethod === 'cash'
                                    ? 'Your order is pending admin approval.'
                                    : 'Payment successful! Order confirmed.'}
                            </p>
                            <div className="bg-gray-50 rounded-xl p-4 mb-6 inline-block">
                                <p className="text-sm text-gray-500">Order Number</p>
                                <p className="text-xl font-bold text-gray-900">{orderNumber}</p>
                            </div>

                            {invoiceUrl && (
                                <button
                                    onClick={() => window.open(invoiceUrl, '_blank')}
                                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
                                >
                                    <Download size={20} />
                                    Download Invoice
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer with Order Summary */}
                {step !== 'success' && (
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Package size={18} className="text-gray-400" />
                                    <span className="font-medium text-gray-900">{product.name}</span>
                                </div>
                                <div className="text-sm text-gray-500">
                                    {couponApplied && (
                                        <span className="line-through mr-2">{formatPrice(getPrice())}</span>
                                    )}
                                    <span className="text-lg font-bold text-gray-900">{formatPrice(getTotalAmount())}</span>
                                    {product.pricing_type === 'subscription' && <span className="text-gray-500">/mo</span>}
                                </div>
                            </div>

                            {step === 'billing' && (
                                <button
                                    onClick={handleProceedToPayment}
                                    className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all"
                                >
                                    Continue to Payment
                                </button>
                            )}

                            {step === 'payment' && (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setStep('billing')}
                                        className="px-4 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-all"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handlePayment}
                                        disabled={processing}
                                        className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {processing ? (
                                            <><Loader2 size={18} className="animate-spin" /> Processing...</>
                                        ) : (
                                            <>{paymentMethod === 'razorpay' ? 'Pay Now' : 'Place Order'}</>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {step === 'success' && (
                    <div className="px-6 py-4 border-t border-gray-100">
                        <button
                            onClick={handleClose}
                            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all"
                        >
                            Done
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
