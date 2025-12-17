import { useState, useEffect } from 'react';
import {
    ShoppingBag,
    Plus,
    Search,
    Filter,
    CheckCircle2,
    DollarSign,
    Package,
    Edit3,
    Trash2,
    AlertCircle,
    Loader2,
    XCircle,
    Image as ImageIcon
} from 'lucide-react';
import { showDeleteConfirm, showToast } from '../../lib/sweetalert';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface Product {
    id: string;
    name: string;
    slug: string;
    category: string;
    description: string | null;
    short_description: string | null;
    one_time_price: number | null;
    stock: number | null;
    image_url: string | null;
    is_active: boolean;
    product_type: 'product' | 'service';
    created_at: string;
    updated_at: string;
}

const categories = [
    { value: 'social_media', label: 'Social Media' },
    { value: 'website', label: 'Website' },
    { value: 'app', label: 'App' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'design', label: 'Design' },
    { value: 'other', label: 'Other' },
];

export default function ProductsPage() {
    const { role } = useAuth();
    const isAdmin = role === 'Admin' || role === 'Super Admin';

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState<Partial<Product>>({});

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        inStock: 0,
        lowStock: 0,
        totalRevenue: 0
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            // For non-admin users, first get their purchased product IDs
            let purchasedPackageIds: string[] = [];
            if (!isAdmin) {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: orders } = await supabase
                        .from('orders')
                        .select('package_id')
                        .eq('user_id', user.id)
                        .in('status', ['completed', 'processing']);
                    purchasedPackageIds = orders?.map(o => o.package_id) || [];
                }
            }

            const { data, error } = await supabase
                .from('service_packages')
                .select('*')
                .eq('product_type', 'product')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Filter products based on role
            let productList = data || [];
            if (!isAdmin) {
                productList = productList.filter(p => purchasedPackageIds.includes(p.id));
            }
            setProducts(productList);

            // Calculate stats
            const inStock = productList.filter(p => (p.stock ?? 0) > 10).length;
            const lowStock = productList.filter(p => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 10).length;

            setStats({
                total: productList.length,
                inStock,
                lowStock,
                totalRevenue: 0 // Would need orders data for this
            });
        } catch (error) {
            console.error('Error fetching products:', error);
            showToast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const handleDelete = async (id: string) => {
        if (!isAdmin) {
            showToast.error('Only admins can delete products');
            return;
        }

        const confirmed = await showDeleteConfirm('this product');
        if (!confirmed) return;

        try {
            const { error } = await supabase
                .from('service_packages')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setProducts(products.filter(p => p.id !== id));
            showToast.success('Product deleted successfully');
        } catch (error) {
            console.error('Error deleting product:', error);
            showToast.error('Failed to delete product');
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData(product);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingProduct(null);
        setFormData({
            is_active: true,
            product_type: 'product',
            stock: 0,
            category: 'other'
        });
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isAdmin) {
            showToast.error('Only admins can manage products');
            return;
        }

        setSaving(true);
        try {
            // Generate slug from name
            const slug = formData.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || '';

            const payload = {
                name: formData.name,
                slug: editingProduct ? editingProduct.slug : slug + '-' + Date.now(),
                description: formData.description || null,
                short_description: formData.short_description || null,
                category: formData.category,
                one_time_price: formData.one_time_price ? Math.round(Number(formData.one_time_price)) : null,
                stock: formData.stock || 0,
                image_url: formData.image_url || null,
                is_active: formData.is_active ?? true,
                product_type: 'product',
                pricing_type: 'one_time',
                updated_at: new Date().toISOString()
            };

            if (editingProduct) {
                const { error } = await supabase
                    .from('service_packages')
                    .update(payload)
                    .eq('id', editingProduct.id);

                if (error) throw error;
                showToast.success('Product updated successfully');
            } else {
                const { error } = await supabase
                    .from('service_packages')
                    .insert(payload);

                if (error) throw error;
                showToast.success('Product created successfully');
            }

            await fetchProducts();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error saving product:', error);
            showToast.error('Failed to save product');
        } finally {
            setSaving(false);
        }
    };

    const getStockStatus = (stock: number | null) => {
        if (stock === null || stock === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-700 border-red-200' };
        if (stock <= 10) return { label: 'Low Stock', color: 'bg-orange-100 text-orange-700 border-orange-200' };
        return { label: 'In Stock', color: 'bg-green-100 text-green-700 border-green-200' };
    };

    const formatPrice = (price: number | null) => {
        if (!price) return '₹0.00';
        return '₹' + (price / 100).toFixed(2);
    };

    return (
        <div className="w-full space-y-6 animate-in fade-in zoom-in-95 duration-500 relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <ShoppingBag className="text-blue-600" size={32} />
                        {isAdmin ? 'Products' : 'My Products'}
                    </h1>
                    <p className="text-gray-500 mt-2 text-lg">
                        {isAdmin ? 'Manage inventory and product listings.' : 'Products you have purchased.'}
                    </p>
                </div>
                {isAdmin && (
                    <button
                        onClick={handleAddNew}
                        className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
                    >
                        <Plus size={20} /> Add New Product
                    </button>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Products', value: stats.total, icon: Package, color: 'text-blue-600 bg-blue-50' },
                    { label: 'In Stock', value: stats.inStock, icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
                    { label: 'Low Stock', value: stats.lowStock, icon: AlertCircle, color: 'text-orange-600 bg-orange-50' },
                    { label: 'Total Revenue', value: '₹0', icon: DollarSign, color: 'text-purple-600 bg-purple-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                        <p className="text-gray-500 font-medium mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <select
                        className="pl-10 pr-8 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white appearance-none cursor-pointer"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Products List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                    <Package size={64} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {isAdmin ? 'No Products Found' : 'No Purchases Yet'}
                    </h3>
                    <p className="text-gray-500 mb-6">
                        {isAdmin
                            ? 'Get started by adding your first product.'
                            : 'You haven\'t purchased any products yet. Visit our shop to explore available products.'}
                    </p>
                    {isAdmin && (
                        <button
                            onClick={handleAddNew}
                            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all"
                        >
                            <Plus size={20} className="inline mr-2" /> Add Product
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map(product => {
                        const stockStatus = getStockStatus(product.stock);
                        return (
                            <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
                                <div className="relative h-48 overflow-hidden bg-gray-100">
                                    {product.image_url ? (
                                        <img
                                            src={product.image_url}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ImageIcon size={48} className="text-gray-300" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md ${stockStatus.color}`}>
                                            {stockStatus.label}
                                        </span>
                                    </div>
                                    {!product.is_active && (
                                        <div className="absolute top-4 left-4">
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-800 text-white">
                                                Inactive
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{product.name}</h3>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{product.short_description || product.description || 'No description'}</p>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                        <div className="flex flex-col">
                                            <span className="text-lg font-bold text-gray-900">{formatPrice(product.one_time_price)}</span>
                                            <span className="text-xs text-gray-400 font-medium">{product.stock ?? 0} in stock</span>
                                        </div>
                                        {isAdmin && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(product)}
                                                    className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit3 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {editingProduct ? 'Edit Product' : 'Add New Product'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <XCircle size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                    value={formData.name || ''}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Premium Business Cards"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                    value={formData.short_description || ''}
                                    onChange={e => setFormData({ ...formData, short_description: e.target.value })}
                                    placeholder="Brief product description"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
                                        value={formData.category || 'other'}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                        value={formData.one_time_price ? (formData.one_time_price / 100) : ''}
                                        onChange={e => setFormData({ ...formData, one_time_price: parseFloat(e.target.value) * 100 })}
                                        placeholder="e.g. 999.00"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                        value={formData.stock || 0}
                                        onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
                                        value={formData.is_active ? 'active' : 'inactive'}
                                        onChange={e => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                                <input
                                    type="url"
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                    value={formData.image_url || ''}
                                    onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Description</label>
                                <textarea
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                    rows={3}
                                    value={formData.description || ''}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Detailed product description..."
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 text-gray-700 font-bold bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 px-4 py-2 text-white font-bold bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {saving && <Loader2 className="animate-spin" size={16} />}
                                    {editingProduct ? 'Save Changes' : 'Create Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
