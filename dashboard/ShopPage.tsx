import { useState, useEffect } from 'react';
import {
    Store,
    Search,
    Star,
    ShoppingCart,
    Loader2,
    Package,
    Filter,
    Tag
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { showToast } from '../../lib/sweetalert';
import CheckoutModal from './CheckoutModal';

interface Product {
    id: string;
    name: string;
    slug: string;
    category: string;
    description: string | null;
    short_description: string | null;
    one_time_price: number | null;
    monthly_price: number | null;
    yearly_price: number | null;
    stock: number | null;
    image_url: string | null;
    is_active: boolean;
    is_featured: boolean;
    product_type: 'product' | 'service';
    pricing_type: 'subscription' | 'one_time';
    features: string[];
}

const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'social_media', label: 'Social Media' },
    { value: 'website', label: 'Website' },
    { value: 'app', label: 'App' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'design', label: 'Design' },
    { value: 'other', label: 'Other' },
];

export default function ShopPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState<'all' | 'product' | 'service'>('all');

    // Checkout modal state
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [showCheckout, setShowCheckout] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('service_packages')
                .select('*')
                .eq('is_active', true)
                .order('is_featured', { ascending: false })
                .order('sort_order', { ascending: true });

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
            showToast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.description?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
        const matchesType = typeFilter === 'all' || product.product_type === typeFilter;
        return matchesSearch && matchesCategory && matchesType;
    });

    const formatPrice = (price: number | null) => {
        if (!price) return '₹0';
        return '₹' + (price / 100).toLocaleString('en-IN');
    };

    const handleBuyNow = (product: Product) => {
        setSelectedProduct(product);
        setShowCheckout(true);
    };

    const handleCheckoutSuccess = () => {
        // Optionally refresh products or show a success state
        showToast.success('Thank you for your purchase!');
    };

    // Stats
    const stats = {
        total: products.length,
        products: products.filter(p => p.product_type === 'product').length,
        services: products.filter(p => p.product_type === 'service').length,
        featured: products.filter(p => p.is_featured).length
    };

    return (
        <>
            {/* Checkout Modal */}
            <CheckoutModal
                product={selectedProduct}
                isOpen={showCheckout}
                onClose={() => setShowCheckout(false)}
                onSuccess={handleCheckoutSuccess}
            />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl shadow-lg">
                            <Store size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Shop</h1>
                            <p className="text-sm text-gray-500">Browse and purchase products & services</p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                <Package size={20} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                <p className="text-xs text-gray-500">Total Items</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                                <ShoppingCart size={20} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.products}</p>
                                <p className="text-xs text-gray-500">Products</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                <Tag size={20} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.services}</p>
                                <p className="text-xs text-gray-500">Services</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
                                <Star size={20} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.featured}</p>
                                <p className="text-xs text-gray-500">Featured</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search products & services..."
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3">
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <select
                                className="pl-10 pr-8 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white appearance-none cursor-pointer"
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value as any)}
                            >
                                <option value="all">All Types</option>
                                <option value="product">Products</option>
                                <option value="service">Services</option>
                            </select>
                        </div>
                        <select
                            className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            {categories.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="animate-spin text-blue-600" size={40} />
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                        <Package size={64} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Products Found</h3>
                        <p className="text-gray-500">Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProducts.map((product) => (
                            <div
                                key={product.id}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group"
                            >
                                {/* Image */}
                                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50">
                                    {product.image_url ? (
                                        <img
                                            src={product.image_url}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Package size={48} className="text-blue-200" />
                                        </div>
                                    )}
                                    {product.is_featured && (
                                        <div className="absolute top-3 left-3">
                                            <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                                                <Star size={12} fill="currentColor" /> Featured
                                            </span>
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${product.product_type === 'product'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {product.product_type === 'product' ? 'Product' : 'Service'}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <div className="text-xs text-blue-600 font-bold uppercase tracking-wide mb-2">
                                        {product.category.replace('_', ' ')}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                        {product.name}
                                    </h3>
                                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                                        {product.short_description || product.description || 'Premium quality product/service.'}
                                    </p>

                                    {/* Features */}
                                    {product.features && product.features.length > 0 && (
                                        <ul className="space-y-1 mb-4">
                                            {product.features.slice(0, 2).map((feature, i) => (
                                                <li key={i} className="text-xs text-gray-600 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                                                    {feature}
                                                </li>
                                            ))}
                                            {product.features.length > 2 && (
                                                <li className="text-xs text-blue-600 font-medium">
                                                    +{product.features.length - 2} more
                                                </li>
                                            )}
                                        </ul>
                                    )}

                                    {/* Price & Action */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <div>
                                            {product.pricing_type === 'subscription' ? (
                                                <div>
                                                    <span className="text-xl font-bold text-gray-900">
                                                        {formatPrice(product.monthly_price)}
                                                    </span>
                                                    <span className="text-gray-500 text-sm">/mo</span>
                                                </div>
                                            ) : (
                                                <span className="text-xl font-bold text-gray-900">
                                                    {formatPrice(product.one_time_price)}
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleBuyNow(product)}
                                            className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-200"
                                        >
                                            <ShoppingCart size={16} />
                                            {product.pricing_type === 'subscription' ? 'Subscribe' : 'Buy'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
