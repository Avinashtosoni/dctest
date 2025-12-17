import { useState, useEffect } from 'react';
import {
    Shield,
    Globe,
    CreditCard,
    Share2,
    Mail,
    CheckCircle2,
    AlertTriangle,
    RefreshCw,
    Key,
    Server,
    Save,
    Eye,
    EyeOff,
    Loader2,
    ToggleLeft,
    ToggleRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { showToast, showSuccess } from '../../lib/sweetalert';

interface IntegrationStatus {
    connected: boolean;
    lastChecked: string;
    loading: boolean;
    error?: string;
    details?: string;
}

interface PaymentGateway {
    id: string;
    name: string;
    display_name: string;
    description: string;
    is_active: boolean;
    is_test_mode: boolean;
    config: Record<string, string>;
    test_config: Record<string, string>;
    supported_methods: string[];
    supported_currencies: string[];
    webhook_url?: string;
    webhook_secret?: string;
}

export default function AuthenticationPage() {
    const { role } = useAuth();
    const isAdmin = role === 'Admin' || role === 'Super Admin';

    const [activeTab, setActiveTab] = useState('google');
    const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
    const [formValues, setFormValues] = useState<Record<string, string>>({
        'google_client_id': '',
        'google_login_secret': '',
        'pagespeed_key': ''
    });
    const [saving, setSaving] = useState<Record<string, boolean>>({});

    // Payment gateways from database
    const [paymentGateways, setPaymentGateways] = useState<PaymentGateway[]>([]);
    const [loadingGateways, setLoadingGateways] = useState(true);
    const [gatewayConfigs, setGatewayConfigs] = useState<Record<string, Record<string, string>>>({});

    const [integrationStatus, setIntegrationStatus] = useState<Record<string, IntegrationStatus>>({
        'google_login': { connected: false, lastChecked: 'Never', loading: false },
        'google_webmaster': { connected: false, lastChecked: 'Never', loading: false },
    });

    useEffect(() => {
        fetchPaymentGateways();
    }, []);

    const fetchPaymentGateways = async () => {
        setLoadingGateways(true);
        try {
            const { data, error } = await supabase
                .from('payment_gateways')
                .select('*')
                .order('sort_order');

            if (error) throw error;

            setPaymentGateways(data || []);

            // Initialize configs
            const configs: Record<string, Record<string, string>> = {};
            (data || []).forEach(gateway => {
                // Load the appropriate config based on current mode
                const currentConfig = gateway.is_test_mode ? gateway.test_config : gateway.config;

                configs[gateway.name] = {
                    ...(currentConfig || {}),
                    is_test_mode: gateway.is_test_mode ? 'true' : 'false',
                    is_active: gateway.is_active ? 'true' : 'false',
                    webhook_secret: gateway.webhook_secret || ''
                };

                // Update integration status
                setIntegrationStatus(prev => ({
                    ...prev,
                    [gateway.name]: {
                        connected: gateway.is_active,
                        lastChecked: 'Synced',
                        loading: false
                    }
                }));
            });
            setGatewayConfigs(configs);
        } catch (error) {
            console.error('Error fetching payment gateways:', error);
            showToast.error('Failed to load payment gateways');
        } finally {
            setLoadingGateways(false);
        }
    };

    const handleInputChange = (id: string, value: string) => {
        setFormValues(prev => ({ ...prev, [id]: value }));
    };

    const handleGatewayConfigChange = (gatewayName: string, field: string, value: string) => {
        // If changing test mode, reload the appropriate config
        if (field === 'is_test_mode') {
            const gateway = paymentGateways.find(g => g.name === gatewayName);
            if (gateway) {
                const newIsTestMode = value === 'true';
                const configToLoad = newIsTestMode ? gateway.test_config : gateway.config;

                setGatewayConfigs(prev => ({
                    ...prev,
                    [gatewayName]: {
                        ...(configToLoad || {}),
                        is_test_mode: value,
                        is_active: prev[gatewayName]?.is_active || 'false',
                        webhook_secret: gateway.webhook_secret || ''
                    }
                }));
                return;
            }
        }

        setGatewayConfigs(prev => ({
            ...prev,
            [gatewayName]: {
                ...prev[gatewayName],
                [field]: value
            }
        }));
    };

    const toggleSecret = (id: string) => {
        setShowSecrets(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const saveGatewayConfig = async (gateway: PaymentGateway) => {
        setSaving(prev => ({ ...prev, [gateway.name]: true }));
        try {
            const config = gatewayConfigs[gateway.name] || {};
            const isTestMode = config.is_test_mode === 'true';
            const isActive = config.is_active === 'true';

            // Separate test and live configs
            const { is_test_mode, is_active, webhook_secret, ...restConfig } = config;

            const updateData: any = {
                is_test_mode: isTestMode,
                is_active: isActive,
                webhook_secret: webhook_secret || null,
                updated_at: new Date().toISOString()
            };

            // Store in appropriate config field
            if (isTestMode) {
                updateData.test_config = restConfig;
            } else {
                updateData.config = restConfig;
            }

            const { error } = await supabase
                .from('payment_gateways')
                .update(updateData)
                .eq('id', gateway.id);

            if (error) throw error;

            showSuccess('Configuration saved successfully');
            setIntegrationStatus(prev => ({
                ...prev,
                [gateway.name]: {
                    connected: isActive,
                    lastChecked: 'Just now',
                    loading: false
                }
            }));

            // Refresh data
            fetchPaymentGateways();
        } catch (error) {
            console.error('Error saving gateway config:', error);
            showToast.error('Failed to save configuration');
        } finally {
            setSaving(prev => ({ ...prev, [gateway.name]: false }));
        }
    };

    const toggleGatewayActive = async (gateway: PaymentGateway) => {
        const newActive = !gateway.is_active;
        handleGatewayConfigChange(gateway.name, 'is_active', newActive ? 'true' : 'false');

        try {
            const { error } = await supabase
                .from('payment_gateways')
                .update({ is_active: newActive, updated_at: new Date().toISOString() })
                .eq('id', gateway.id);

            if (error) throw error;

            showToast.success(`${gateway.display_name} ${newActive ? 'enabled' : 'disabled'}`);
            fetchPaymentGateways();
        } catch (error) {
            console.error('Error toggling gateway:', error);
            showToast.error('Failed to update gateway');
        }
    };

    const testConnection = (id: string) => {
        setIntegrationStatus(prev => ({
            ...prev,
            [id]: { ...prev[id], loading: true, error: undefined }
        }));

        // Mock API call for now (real implementation would verify API keys)
        setTimeout(() => {
            const isSuccess = Math.random() > 0.2; // 80% success chance
            setIntegrationStatus(prev => ({
                ...prev,
                [id]: {
                    connected: isSuccess,
                    lastChecked: 'Just now',
                    loading: false,
                    error: isSuccess ? undefined : 'Connection timed out or invalid credentials'
                }
            }));
        }, 1500);
    };

    const tabs = [
        { id: 'google', label: 'Google Services', icon: <Globe size={18} /> },
        { id: 'payment', label: 'Payment Gateways', icon: <CreditCard size={18} /> },
        { id: 'social', label: 'Social APIs', icon: <Share2 size={18} /> },
        { id: 'email', label: 'Email Configuration', icon: <Mail size={18} /> },
    ];

    const renderSecretInput = (id: string, label: string, placeholder: string, defaultValue = '') => (
        <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">{label}</label>
            <div className="relative">
                <input
                    type={showSecrets[id] ? "text" : "password"}
                    defaultValue={defaultValue}
                    onChange={(e) => handleInputChange(id, e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono"
                    placeholder={placeholder}
                />
                <button
                    type="button"
                    onClick={() => toggleSecret(id)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                    {showSecrets[id] ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>
        </div>
    );

    const renderGatewaySecretInput = (gatewayName: string, field: string, label: string, placeholder: string) => {
        const id = `${gatewayName}_${field}`;
        const value = gatewayConfigs[gatewayName]?.[field] || '';

        return (
            <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">{label}</label>
                <div className="relative">
                    <input
                        type={showSecrets[id] ? "text" : "password"}
                        value={value}
                        onChange={(e) => handleGatewayConfigChange(gatewayName, field, e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono"
                        placeholder={placeholder}
                    />
                    <button
                        type="button"
                        onClick={() => toggleSecret(id)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        {showSecrets[id] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
            </div>
        );
    };

    const renderPaymentGatewayCard = (gateway: PaymentGateway) => {
        const status = integrationStatus[gateway.name] || { connected: gateway.is_active, lastChecked: 'Never', loading: false };
        const isSaving = saving[gateway.name];
        const config = gatewayConfigs[gateway.name] || {};
        const isTestMode = config.is_test_mode === 'true';

        return (
            <div key={gateway.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                            {gateway.display_name}
                            {isTestMode && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">
                                    Test Mode
                                </span>
                            )}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">{gateway.description}</p>
                    </div>
                    <button
                        onClick={() => toggleGatewayActive(gateway)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${gateway.is_active
                            ? 'bg-green-50 text-green-700 hover:bg-green-100'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {gateway.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        {gateway.is_active ? 'Active' : 'Inactive'}
                    </button>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-50">
                    {/* Mode Toggle */}
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium text-gray-700">Mode:</label>
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => handleGatewayConfigChange(gateway.name, 'is_test_mode', 'true')}
                                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${isTestMode ? 'bg-white text-yellow-700 shadow-sm' : 'text-gray-500'
                                    }`}
                            >
                                Test
                            </button>
                            <button
                                onClick={() => handleGatewayConfigChange(gateway.name, 'is_test_mode', 'false')}
                                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${!isTestMode ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'
                                    }`}
                            >
                                Live
                            </button>
                        </div>
                    </div>

                    {/* Gateway-specific fields */}
                    {gateway.name === 'razorpay' && (
                        <>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase">Key ID</label>
                                <input
                                    type="text"
                                    value={config.key_id || ''}
                                    onChange={(e) => handleGatewayConfigChange(gateway.name, 'key_id', e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono"
                                    placeholder={isTestMode ? "rzp_test_..." : "rzp_live_..."}
                                />
                            </div>
                            {renderGatewaySecretInput(gateway.name, 'key_secret', 'Key Secret', 'Razorpay Secret Key')}
                            {renderGatewaySecretInput(gateway.name, 'webhook_secret', 'Webhook Secret', 'whsec_...')}
                        </>
                    )}

                    {gateway.name === 'stripe' && (
                        <>
                            {renderGatewaySecretInput(gateway.name, 'publishable_key', 'Publishable Key', isTestMode ? 'pk_test_...' : 'pk_live_...')}
                            {renderGatewaySecretInput(gateway.name, 'secret_key', 'Secret Key', isTestMode ? 'sk_test_...' : 'sk_live_...')}
                            {renderGatewaySecretInput(gateway.name, 'webhook_secret', 'Webhook Secret', 'whsec_...')}
                        </>
                    )}

                    {gateway.name === 'paypal' && (
                        <>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase">Client ID</label>
                                <input
                                    type="text"
                                    value={config.client_id || ''}
                                    onChange={(e) => handleGatewayConfigChange(gateway.name, 'client_id', e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono"
                                    placeholder="AX..."
                                />
                            </div>
                            {renderGatewaySecretInput(gateway.name, 'client_secret', 'Client Secret', 'PayPal Client Secret')}
                        </>
                    )}

                    {gateway.name === 'manual' && (
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Bank Details / Instructions</label>
                            <textarea
                                value={config.instructions || ''}
                                onChange={(e) => handleGatewayConfigChange(gateway.name, 'instructions', e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                placeholder="Bank Name: XYZ Bank&#10;Account Number: 1234567890&#10;IFSC: XYZB0001234"
                                rows={4}
                            />
                        </div>
                    )}

                    {/* Supported methods */}
                    <div className="pt-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Supported Methods</p>
                        <div className="flex flex-wrap gap-2">
                            {gateway.supported_methods.map(method => (
                                <span key={method} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs capitalize">
                                    {method.replace('_', ' ')}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {status.error && (
                    <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-100 flex items-center gap-2">
                        <AlertTriangle size={14} />
                        {status.error}
                    </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <p className="text-xs text-gray-400">
                        Currencies: {gateway.supported_currencies.join(', ')}
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => testConnection(gateway.name)}
                            disabled={status.loading}
                            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-lg text-xs hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            <RefreshCw size={14} className={status.loading ? "animate-spin" : ""} />
                            Test
                        </button>
                        <button
                            onClick={() => saveGatewayConfig(gateway)}
                            disabled={isSaving}
                            className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg text-xs hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            Save Config
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderIntegrationCard = (id: string, title: string, description: string, fields: React.ReactNode) => {
        const status = integrationStatus[id] || { connected: false, lastChecked: 'Never', loading: false };

        return (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                            {title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">{description}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${status.loading ? 'bg-gray-100 text-gray-600 border-gray-200' :
                        status.connected ? 'bg-green-50 text-green-700 border-green-200' :
                            'bg-red-50 text-red-700 border-red-200'
                        }`}>
                        {status.loading ? <RefreshCw size={12} className="animate-spin" /> :
                            status.connected ? <CheckCircle2 size={12} /> :
                                <AlertTriangle size={12} />}
                        {status.loading ? 'Testing...' : status.connected ? 'Connected' : 'Disconnected'}
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-50">
                    {fields}
                </div>

                {status.error && (
                    <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-100 flex items-center gap-2">
                        <AlertTriangle size={14} />
                        {status.error}
                    </div>
                )}

                {status.details && (
                    <div className="p-3 bg-green-50 text-green-700 text-xs rounded-lg border border-green-100 flex items-center gap-2">
                        <CheckCircle2 size={14} />
                        {status.details}
                    </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <p className="text-xs text-gray-400">Last Checked: {status.lastChecked}</p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => testConnection(id)}
                            disabled={status.loading}
                            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-lg text-xs hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            <RefreshCw size={14} className={status.loading ? "animate-spin" : ""} />
                            Test Connection
                        </button>
                        <button className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg text-xs hover:bg-blue-700 transition-colors flex items-center gap-2">
                            <Save size={14} />
                            Save Config
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full space-y-6 animate-in fade-in zoom-in-95 duration-500">
            {/* Header */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Shield className="text-blue-600" /> API & Integrations
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Manage external services, API keys, and connection credentials.</p>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === tab.id
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            {tab.icon}
                            <span className="hidden md:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Google Services */}
                {activeTab === 'google' && (
                    <>
                        {renderIntegrationCard('google_login', 'Google Login', 'Enable "Sign in with Google" for users.', (
                            <>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Client ID</label>
                                    <input
                                        type="text"
                                        value={formValues['google_client_id'] || ''}
                                        onChange={(e) => handleInputChange('google_client_id', e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono"
                                        placeholder="123456789-abc..."
                                    />
                                </div>
                                {renderSecretInput('google_login_secret', 'Client Secret', 'Google Client Secret', formValues['google_login_secret'])}
                            </>
                        ))}

                        {renderIntegrationCard('google_webmaster', 'Google Search Console', 'Fetch search analytics and sitemap data.', (
                            <>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Service Account Email (Optional)</label>
                                    <input
                                        type="text"
                                        onChange={(e) => handleInputChange('gsc_email', e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        placeholder="service-account@project.iam.gserviceaccount.com"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">OAuth Access Token (For Testing)</label>
                                    <input
                                        type="text"
                                        onChange={(e) => handleInputChange('gsc_token', e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono"
                                        placeholder="ya29.a0..."
                                    />
                                    <p className="text-[10px] text-gray-400">
                                        Use OAuth Playground or gcloud to get a temporary token for testing "Real Data".
                                        Service Account Keys require backend processing.
                                    </p>
                                </div>
                            </>
                        ))}

                        {renderIntegrationCard('google_pagespeed', 'PageSpeed Insights', 'Analyze website performance metrics.', (
                            <>
                                {renderSecretInput('pagespeed_key', 'API Key', 'Google Cloud API Key', formValues['pagespeed_key'])}
                            </>
                        ))}

                        {renderIntegrationCard('google_mybusiness', 'Google My Business', 'Manage business locations and reviews.', (
                            <>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Location ID</label>
                                    <input type="text" className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono" placeholder="locations/12345..." />
                                </div>
                                {renderSecretInput('gmb_token', 'Access Token', 'OAuth2 Access Token')}
                            </>
                        ))}
                    </>
                )}

                {/* Payment Gateways - Now from Database */}
                {activeTab === 'payment' && (
                    <>
                        {loadingGateways ? (
                            <div className="col-span-2 flex items-center justify-center py-20">
                                <Loader2 className="animate-spin text-blue-600" size={32} />
                            </div>
                        ) : paymentGateways.length === 0 ? (
                            <div className="col-span-2 text-center py-20 text-gray-500">
                                <CreditCard size={48} className="mx-auto mb-4 text-gray-300" />
                                <p>No payment gateways configured</p>
                                <p className="text-sm">Run the database migration to add gateways</p>
                            </div>
                        ) : (
                            paymentGateways.map(gateway => renderPaymentGatewayCard(gateway))
                        )}
                    </>
                )}

                {/* Social APIs */}
                {activeTab === 'social' && (
                    <>
                        {renderIntegrationCard('graph_api', 'Meta Graph API', 'Facebook, Instagram, and WhatsApp Business.', (
                            <>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">App ID</label>
                                    <input type="text" className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono" placeholder="1234567890" />
                                </div>
                                {renderSecretInput('meta_app_secret', 'App Secret', 'Meta App Secret')}
                                {renderSecretInput('meta_access_token', 'System User Access Token', 'Long-lived Access Token')}
                            </>
                        ))}

                        {renderIntegrationCard('linkedin', 'LinkedIn API', 'Post updates and fetch company stats.', (
                            <>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Client ID</label>
                                    <input type="text" className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono" placeholder="77..." />
                                </div>
                                {renderSecretInput('linkedin_secret', 'Client Secret', 'LinkedIn Client Secret')}
                            </>
                        ))}

                        {renderIntegrationCard('twitter', 'X (Twitter) API', 'Post tweets and manage interactions.', (
                            <>
                                {renderSecretInput('twitter_api_key', 'API Key', 'Consumer Key')}
                                {renderSecretInput('twitter_api_secret', 'API Key Secret', 'Consumer Secret')}
                                {renderSecretInput('twitter_bearer', 'Bearer Token', 'OAuth 2.0 Bearer Token')}
                            </>
                        ))}
                    </>
                )}

                {/* Email Configuration */}
                {activeTab === 'email' && (
                    <>
                        {renderIntegrationCard('smtp', 'SMTP Configuration', 'Outgoing email server settings.', (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-500 uppercase">Host</label>
                                        <div className="relative">
                                            <Server size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input type="text" className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="smtp.gmail.com" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-500 uppercase">Port</label>
                                        <input type="number" className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="587" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Username / Email</label>
                                    <input type="email" className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="notifications@example.com" />
                                </div>
                                {renderSecretInput('smtp_password', 'Password', 'SMTP Password / App Password')}
                                <div className="flex items-center gap-4 pt-2">
                                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                                        <span>Use TLS/SSL</span>
                                    </label>
                                </div>
                            </>
                        ))}

                        {renderIntegrationCard('imap', 'IMAP Configuration', 'Incoming email settings for reading replies.', (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-500 uppercase">Host</label>
                                        <div className="relative">
                                            <Server size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input type="text" className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="imap.gmail.com" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-500 uppercase">Port</label>
                                        <input type="number" className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="993" />
                                    </div>
                                </div>
                                {renderSecretInput('imap_password', 'Password', 'IMAP Password', 'Same as SMTP')}
                            </>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}
