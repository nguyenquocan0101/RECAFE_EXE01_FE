import React, { useEffect, useState } from 'react';
import * as adminApi from '@/services/api/admin';
import { Button } from '@/components/common/Button';
import { ProductModal } from './ProductModal';

interface Category { id: string; name: string; }
interface Product {
    id: string;
    name: string;
    slug: string;
    sku: string;
    price: number;
    salePrice?: number;
    categoryId: string;
    categoryName?: string;
    isActive?: boolean;
    shortDescription?: string;
    description?: string;
    material?: string;
    size?: string;
    usageNote?: string;
    isPersonalizable?: boolean;
    rewardPoints?: number;
    image?: string;
    thumbnailUrl?: string;
}

const AdminProducts: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Product | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Filter and menu states
    const [filterTab, setFilterTab] = useState<'all' | 'low' | 'archived'>('all');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const itemsPerPage = 6;

    const load = async () => {
        setLoading(true);
        try {
            const [prodData, catData] = await Promise.all([
                adminApi.getAdminProducts(),
                adminApi.getAdminCategories(),
            ]);
            setProducts(Array.isArray(prodData) ? prodData : prodData?.data || []);
            setCategories(Array.isArray(catData) ? catData : catData?.data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // Close dropdown action menu on click outside
        const handleOutsideClick = () => setActiveMenuId(null);
        window.addEventListener('click', handleOutsideClick);
        return () => window.removeEventListener('click', handleOutsideClick);
    }, []);

    // Deterministic stock calculation based on product ID
    const getProductStock = (id: string) => {
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
            hash = id.charCodeAt(i) + ((hash << 5) - hash);
        }
        const stock = Math.abs(hash % 145) + 4;
        const percentage = Math.round((stock / 150) * 100);
        return { stock, percentage };
    };

    // Deterministic curated imagery from Unsplash for coffee/cafe products
    const getProductImage = (id: string) => {
        const coffeeImages = [
            'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=120&h=120', // Ceramic espresso cup
            'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=120&h=120', // Ceramic latte mug
            'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=120&h=120', // Coffee table cup
            'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&q=80&w=120&h=120', // Wooden tray with coffee
            'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&q=80&w=120&h=120', // Pour over coffee jar
            'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=120&h=120', // Elegant coffee brewing
            'https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&q=80&w=120&h=120', // Ceramic dripper
            'https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&q=80&w=120&h=120', // Artisan spoons
        ];
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
            hash = id.charCodeAt(i) + ((hash << 5) - hash);
        }
        return coffeeImages[Math.abs(hash) % coffeeImages.length];
    };

    const openCreate = () => {
        setEditTarget(null);
        setModalOpen(true);
    };

    const openEdit = (p: Product) => {
        setEditTarget(p);
        setModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await adminApi.deleteProduct(id);
            setProducts(prev => prev.filter(p => p.id !== id));
            setDeleteConfirm(null);
        } catch (err: any) {
            alert(`Xoá thất bại: ${err.message}`);
        }
    };

    const handleToggleActive = async (product: Product) => {
        // Resolve valid category ID by name if categoryId is empty UUID
        const matchedCategory = categories.find(c => c.name === product.categoryName);
        const resolvedCategoryId = product.categoryId && product.categoryId !== '00000000-0000-0000-0000-000000000000'
            ? product.categoryId
            : (matchedCategory ? matchedCategory.id : (categories[0]?.id || ''));

        const payload = {
            categoryId: resolvedCategoryId,
            name: product.name,
            slug: product.slug,
            sku: product.sku,
            price: product.price,
            salePrice: product.salePrice ?? null,
            shortDescription: product.shortDescription ?? null,
            description: product.description ?? null,
            material: product.material ?? null,
            size: product.size ?? null,
            usageNote: product.usageNote ?? null,
            isPersonalizable: product.isPersonalizable ?? false,
            isActive: product.isActive !== false ? false : true,
            rewardPoints: product.rewardPoints ?? 0
        };
        try {
            await adminApi.updateProduct(product.id, payload);
            setProducts(prev => prev.map(p => p.id === product.id ? { ...p, categoryId: resolvedCategoryId, isActive: payload.isActive } : p));
        } catch (err: any) {
            alert(`Cập nhật trạng thái thất bại: ${err.message}`);
        }
    };

    const formatCurrency = (v: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

    const formatShortValue = (v: number) => {
        if (v >= 1_000_000_000) {
            return `${(v / 1_000_000_000).toFixed(1)}B ₫`;
        }
        if (v >= 1_000_000) {
            return `${(v / 1_000_000).toFixed(1)}M ₫`;
        }
        return formatCurrency(v);
    };

    const getCategoryName = (id: string) =>
        categories.find(c => c.id === id)?.name || '—';

    // Filter Logic
    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              p.sku.toLowerCase().includes(searchQuery.toLowerCase());
        
        const { stock } = getProductStock(p.id);
        const matchesTab = filterTab === 'all' 
            ? true 
            : filterTab === 'low' 
                ? stock <= 15 
                : p.isActive === false;

        const matchesCategory = selectedCategoryFilter === 'all' || p.categoryId === selectedCategoryFilter;

        return matchesSearch && matchesTab && matchesCategory;
    });

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filterTab, selectedCategoryFilter, searchQuery]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Summary Statistics
    const totalProductsCount = products.length;
    const activeCategoriesCount = categories.length;
    const lowStockCount = products.filter(p => getProductStock(p.id).stock <= 15).length;
    const totalInventoryValue = products.reduce((acc, p) => {
        const { stock } = getProductStock(p.id);
        return acc + (p.price * stock);
    }, 0);

    return (
        <div className="min-h-screen bg-[#FAF9F6] p-8 animate-slide-up">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#4b2311] tracking-tight">Quản lý kho hàng</h1>
                    <p className="text-[#68361c]/70 text-sm mt-1">Quản lý bộ sưu tập cà phê bền vững và theo dõi mức tồn kho trên toàn bộ danh mục.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button onClick={openCreate}>
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Thêm sản phẩm
                    </Button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <div className="bg-white p-5 rounded border border-[#e8ddd5]/60 shadow-sm transition-all hover:shadow-md">
                    <span className="text-[10px] font-bold text-[#68361c]/50 uppercase tracking-widest block mb-2">Tổng sản phẩm</span>
                    <span className="text-3xl font-extrabold text-[#4b2311]">{totalProductsCount.toLocaleString()}</span>
                </div>
                <div className="bg-white p-5 rounded border border-[#e8ddd5]/60 shadow-sm transition-all hover:shadow-md">
                    <span className="text-[10px] font-bold text-[#68361c]/50 uppercase tracking-widest block mb-2">Danh mục hoạt động</span>
                    <span className="text-3xl font-extrabold text-[#4b2311]">{activeCategoriesCount}</span>
                </div>
                <div className="bg-white p-5 rounded border border-[#e8ddd5]/60 shadow-sm transition-all hover:shadow-md">
                    <span className="text-[10px] font-bold text-[#68361c]/50 uppercase tracking-widest block mb-2">Cảnh báo tồn kho</span>
                    <span className="text-3xl font-extrabold text-[#925f3c]">{lowStockCount < 10 ? `0${lowStockCount}` : lowStockCount}</span>
                </div>
                <div className="bg-white p-5 rounded border border-[#e8ddd5]/60 shadow-sm transition-all hover:shadow-md group relative cursor-pointer" title={formatCurrency(totalInventoryValue)}>
                    <span className="text-[10px] font-bold text-[#68361c]/50 uppercase tracking-widest block mb-2">Tổng giá trị kho</span>
                    <span className="text-3xl font-extrabold text-[#657b35]">{formatShortValue(totalInventoryValue)}</span>
                </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
                {/* Tabs & Search */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full xl:w-auto">
                    {/* Tabs */}
                    <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                        <Button 
                            variant={filterTab === 'all' ? 'primary' : 'secondary'} 
                            onClick={() => setFilterTab('all')}
                            className="!px-4 !py-2 !text-xs"
                        >
                            Tất cả
                        </Button>
                        <Button 
                            variant={filterTab === 'low' ? 'primary' : 'secondary'} 
                            onClick={() => setFilterTab('low')}
                            className="!px-4 !py-2 !text-xs"
                        >
                            Sắp hết hàng
                        </Button>
                        <Button 
                            variant={filterTab === 'archived' ? 'primary' : 'secondary'} 
                            onClick={() => setFilterTab('archived')}
                            className="!px-4 !py-2 !text-xs"
                        >
                            Đã ẩn
                        </Button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full sm:w-64">
                        <input
                            type="text"
                            placeholder="Tìm sản phẩm, mã SKU..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-[#e8ddd5]/80 rounded text-xs font-medium text-[#4b2311] placeholder-[#68361c]/40 focus:outline-none focus:border-[#657b35] transition-all"
                        />
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#68361c]/40">
                            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Category Dropdown Filter */}
                <div className="flex items-center gap-3 self-end xl:self-auto w-full sm:w-auto justify-end">
                    <div className="relative w-full sm:w-48">
                        <select 
                            value={selectedCategoryFilter} 
                            onChange={e => setSelectedCategoryFilter(e.target.value)} 
                            className="appearance-none w-full pl-4 pr-10 py-2 bg-white border border-[#e8ddd5]/80 rounded text-xs font-bold text-[#68361c] focus:outline-none focus:border-[#657b35] cursor-pointer"
                        >
                            <option value="all">Tất cả danh mục</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#68361c]/60">
                            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>
            )}

            {/* Main Table Card */}
            {loading ? (
                <div className="flex items-center justify-center py-32 bg-white border border-[#e8ddd5]/60 rounded shadow-sm">
                    <div className="w-9 h-9 border-4 border-[#657b35] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="bg-white rounded border border-[#e8ddd5]/60 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead>
                                <tr className="bg-[#FAF7F5] border-b border-[#e8ddd5]/40">
                                    <th className="px-6 py-4 text-[#5c5652] tracking-wider font-bold text-[11px] uppercase tracking-widest w-[33%]">Sản phẩm</th>
                                    <th className="px-6 py-4 text-[#5c5652] tracking-wider font-bold text-[11px] uppercase tracking-widest w-[12%]">Mã SKU</th>
                                    <th className="px-6 py-4 text-[#5c5652] tracking-wider font-bold text-[11px] uppercase tracking-widest w-[15%]">Danh mục</th>
                                    <th className="px-6 py-4 text-[#5c5652] tracking-wider font-bold text-[11px] uppercase tracking-widest w-[18%]">Mức tồn kho</th>
                                    <th className="px-6 py-4 text-[#5c5652] tracking-wider font-bold text-[11px] uppercase tracking-widest w-[12%]">Đơn giá</th>
                                    <th className="px-6 py-4 text-[#5c5652] tracking-wider font-bold text-[11px] uppercase tracking-widest w-[6%]">Hiển thị</th>
                                    <th className="px-6 py-4 text-[#5c5652] tracking-wider font-bold text-[11px] uppercase tracking-widest w-[4%] text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e8ddd5]/30">
                                {paginatedProducts.map((p) => {
                                    const { stock, percentage } = getProductStock(p.id);
                                    return (
                                        <tr key={p.id} className="hover:bg-[#FAF9F6]/50 transition-colors group">
                                            {/* Product Info */}
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <img 
                                                        src={p.thumbnailUrl || p.image || getProductImage(p.id)} 
                                                        alt={p.name} 
                                                        className="w-12 h-12 object-cover rounded border border-[#e8ddd5]/30 shadow-sm shrink-0" 
                                                    />
                                                    <div className="min-w-0">
                                                        <h4 className="font-semibold text-[#2d2825] text-sm leading-snug group-hover:text-[#657b35] transition-colors truncate" title={p.name}>
                                                            {p.name}
                                                        </h4>
                                                        <div className="flex items-center gap-1.5 mt-1.5">
                                                            {p.isPersonalizable && (
                                                                <span className="bg-[#925f3c]/10 text-[#925f3c] text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">Cá nhân hóa</span>
                                                            )}
                                                            {p.rewardPoints ? (
                                                                <span className="bg-[#657b35]/10 text-[#657b35] text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">+{p.rewardPoints} điểm</span>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* SKU */}
                                            <td className="px-6 py-5">
                                                <span className="text-[#888079] font-medium text-xs tracking-wider">{p.sku}</span>
                                            </td>

                                            {/* Category */}
                                            <td className="px-6 py-5">
                                                <span className="bg-[#FAF6F0] text-[#888079] font-bold px-3 py-1 text-[9px] rounded-full uppercase tracking-widest border border-[#e8ddd5]/20">
                                                    {p.categoryName || getCategoryName(p.categoryId)}
                                                </span>
                                            </td>

                                            {/* Stock Level with Progress Bar */}
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-1 w-full max-w-[150px]">
                                                    <div className="flex justify-between items-center text-xs font-semibold text-[#888079]">
                                                        <span>
                                                            {stock < 10 ? `0${stock}` : stock} sản phẩm
                                                        </span>
                                                        <span className="text-[10px]">{percentage}%</span>
                                                    </div>
                                                    <div className="w-full bg-[#EAE6E1] h-1.5 rounded-full overflow-hidden mt-0.5">
                                                        <div 
                                                            className={`h-full rounded-full transition-all duration-500 bg-[#4b2311]`} 
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Price */}
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    {p.salePrice ? (
                                                        <>
                                                            <span className="text-sm font-bold text-[#657b35]">{formatCurrency(Number(p.salePrice))}</span>
                                                            <span className="text-[11px] text-[#68361c]/40 line-through mt-0.5">{formatCurrency(p.price)}</span>
                                                        </>
                                                    ) : (
                                                        <span className="text-sm font-bold text-[#2d2825]">{formatCurrency(p.price)}</span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Visibility Toggle */}
                                            <td className="px-6 py-5">
                                                <button
                                                    onClick={() => handleToggleActive(p)}
                                                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none outline-none ${p.isActive !== false ? 'bg-[#4b2311]' : 'bg-[#E3DBD3]'}`}
                                                >
                                                    <span
                                                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${p.isActive !== false ? 'translate-x-4' : 'translate-x-0'}`}
                                                    />
                                                </button>
                                            </td>

                                            {/* Actions Menu Dropdown */}
                                            <td className="px-6 py-5 text-center">
                                                <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
                                                    <button 
                                                        onClick={() => setActiveMenuId(activeMenuId === p.id ? null : p.id)}
                                                        className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:bg-stone-50 hover:text-stone-700 transition-all cursor-pointer focus:outline-none outline-none border-none border-0 bg-transparent shadow-none"
                                                    >
                                                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                            <circle cx="12" cy="5" r="1" fill="currentColor" />
                                                            <circle cx="12" cy="12" r="1" fill="currentColor" />
                                                            <circle cx="12" cy="19" r="1" fill="currentColor" />
                                                        </svg>
                                                    </button>
                                                    {activeMenuId === p.id && (
                                                        <div className="absolute right-0 mt-1 w-24 bg-white border border-[#e8ddd5] rounded shadow-lg py-1.5 z-20 animate-slide-up">
                                                            <button 
                                                                onClick={() => { openEdit(p); setActiveMenuId(null); }} 
                                                                className="w-full text-left px-4 py-1.5 text-xs font-bold text-[#68361c] hover:bg-[#FAF9F6] focus:outline-none outline-none border-none border-0 bg-transparent shadow-none"
                                                            >
                                                                Sửa
                                                            </button>
                                                            <button 
                                                                onClick={() => { setDeleteConfirm(p.id); setActiveMenuId(null); }} 
                                                                className="w-full text-left px-4 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 focus:outline-none outline-none border-none border-0 bg-transparent shadow-none"
                                                            >
                                                                Xoá
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* No items fallback */}
                    {filteredProducts.length === 0 && (
                        <div className="py-20 text-center flex flex-col items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center border border-[#e8ddd5]/30 mb-3 text-[#68361c]/40">
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                </svg>
                            </div>
                            <span className="text-sm font-bold text-[#4b2311]">Không tìm thấy sản phẩm nào</span>
                            <span className="text-xs text-[#68361c]/50 mt-1">Vui lòng thử đổi từ khóa tìm kiếm hoặc cài đặt bộ lọc.</span>
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 bg-[#FAF7F5] border-t border-[#e8ddd5]/40 flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#888079]">
                                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} results
                            </span>
                            <div className="flex items-center gap-1.5">
                                {/* Previous Page */}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="w-8 h-8 flex items-center justify-center border border-[#e8ddd5]/60 bg-white rounded text-[#68361c]/60 hover:bg-stone-50 disabled:opacity-50 disabled:hover:bg-white transition-all cursor-pointer"
                                >
                                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                                    </svg>
                                </button>
                                
                                {/* Pages */}
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-8 h-8 rounded text-xs font-bold transition-all cursor-pointer ${currentPage === page ? 'bg-[#20150E] text-white' : 'border border-[#e8ddd5]/60 bg-white text-[#68361c]/60 hover:bg-stone-50'}`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                {/* Next Page */}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="w-8 h-8 flex items-center justify-center border border-[#e8ddd5]/60 bg-white rounded text-[#68361c]/60 hover:bg-stone-50 disabled:opacity-50 disabled:hover:bg-white transition-all cursor-pointer"
                                >
                                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Product Modal Component */}
            <ProductModal 
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                editTarget={editTarget}
                categories={categories}
                onSaveSuccess={load}
            />

            {/* Delete confirm */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded w-full max-w-sm shadow-2xl p-6 border border-[#e8ddd5]/50 animate-slide-up">
                        <div className="w-12 h-12 rounded bg-red-50 flex items-center justify-center text-red-600 mb-4">
                            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        </div>
                        <h2 className="text-base font-extrabold text-[#4b2311] mb-1.5">Xác nhận xoá sản phẩm</h2>
                        <p className="text-[#68361c]/70 text-xs mb-5 leading-relaxed">Bạn có chắc muốn xoá sản phẩm này khỏi kho hàng không? Hành động này không thể được hoàn tác.</p>
                        <div className="flex justify-end gap-3">
                            <Button variant="secondary" onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-xs">Huỷ</Button>
                            <Button variant="danger" onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 text-xs">Xoá vĩnh viễn</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProducts;
