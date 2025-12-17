import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Star, ShoppingCart, Loader2, Package } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import SEO from './SEO';

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
    { value: 'all', label: 'All' },
    { value: 'social_media', label: 'Social Media' },
    { value: 'website', label: 'Website' },
    { value: 'app', label: 'App' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'design', label: 'Design' },
    { value: 'other', label: 'Other' },
];

export default function StorePage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState<'all' | 'product' | 'service'>('all');

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
        // Allow guest checkout - navigate directly to checkout page
        navigate(`/checkout/${product.id}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12">
            <SEO
                title="Store - Digital Comrade"
                description="Browse our products and services. Get professional digital marketing solutions."
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
                        <ShoppingBag size={18} />
                        <span>Our Store</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Products & Services
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Discover our premium digital marketing solutions and products designed to grow your business.
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search products & services..."
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-4">
                            <select
                                className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value as any)}
                            >
                                <option value="all">All Types</option>
                                <option value="product">Products</option>
                                <option value="service">Services</option>
                            </select>
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
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="animate-spin text-blue-600" size={48} />
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                        <Package size={64} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Products Found</h3>
                        <p className="text-gray-500">Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProducts.map((product) => (
                            <div
                                key={product.id}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group"
                            >
                                {/* Image */}
                                <div className="relative h-56 overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50">
                                    {product.image_url ? (
                                        <img
                                            src={product.image_url}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Package size={64} className="text-blue-200" />
                                        </div>
                                    )}
                                    {product.is_featured && (
                                        <div className="absolute top-4 left-4">
                                            <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                                                <Star size={12} fill="currentColor" /> Featured
                                            </span>
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${product.product_type === 'product'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {product.product_type === 'product' ? 'Product' : 'Service'}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <div className="text-xs text-blue-600 font-bold uppercase tracking-wide mb-2">
                                        {product.category.replace('_', ' ')}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                        {product.name}
                                    </h3>
                                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                                        {product.short_description || product.description || 'Premium quality product/service.'}
                                    </p>

                                    {/* Features */}
                                    {product.features && product.features.length > 0 && (
                                        <ul className="space-y-1 mb-4">
                                            {product.features.slice(0, 3).map((feature, i) => (
                                                <li key={i} className="text-xs text-gray-600 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    {/* Price & Action */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <div>
                                            {product.pricing_type === 'subscription' ? (
                                                <div>
                                                    <span className="text-2xl font-bold text-gray-900">
                                                        {formatPrice(product.monthly_price)}
                                                    </span>
                                                    <span className="text-gray-500 text-sm">/mo</span>
                                                </div>
                                            ) : (
                                                <span className="text-2xl font-bold text-gray-900">
                                                    {formatPrice(product.one_time_price)}
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleBuyNow(product)}
                                            className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-200"
                                        >
                                            <ShoppingCart size={18} />
                                            {product.pricing_type === 'subscription' ? 'Subscribe' : 'Buy Now'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
