import React, { useEffect, useState } from 'react';
import * as adminApi from '@/services/api/admin';
import { Button } from '@/components/common/Button';
import { CategoryModal } from './CategoryModal';

interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    isActive?: boolean;
}

interface Product {
    id: string;
    categoryId: string;
}

const AdminCategories: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Category | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Search and Filter states
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [filterTab, setFilterTab] = useState<'all' | 'active' | 'archived'>('all');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const itemsPerPage = 6;

    const load = async () => {
        try {
            setLoading(true);
            const [catData, prodData] = await Promise.all([
                adminApi.getAdminCategories(),
                adminApi.getAdminProducts()
            ]);
            setCategories(Array.isArray(catData) ? catData : catData?.data || []);
            setProducts(Array.isArray(prodData) ? prodData : prodData?.data || []);
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

    // Deterministic curated imagery from Unsplash for cafe categories
    const getCategoryImage = (id: string) => {
        const catImages = [
            'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=120&h=120', // Coffee Latte
            'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=120&h=120', // Coffee Table Cup
            'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&q=80&w=120&h=120', // Espresso mug on tray
            'https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&q=80&w=120&h=120', // Pour over dripper
            'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=120&h=120', // Roasted coffee beans
        ];
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
            hash = id.charCodeAt(i) + ((hash << 5) - hash);
        }
        return catImages[Math.abs(hash) % catImages.length];
    };

    const openCreate = () => {
        setEditTarget(null);
        setModalOpen(true);
    };

    const openEdit = (cat: Category) => {
        setEditTarget(cat);
        setModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await adminApi.deleteCategory(id);
            setCategories(prev => prev.filter(c => c.id !== id));
            setDeleteConfirm(null);
        } catch (err: any) {
            alert(`Xoá thất bại: ${err.message}`);
        }
    };

    const handleToggleActive = async (category: Category) => {
        const payload = {
            name: category.name,
            slug: category.slug,
            description: category.description || undefined,
            isActive: category.isActive !== false ? false : true
        };
        try {
            await adminApi.updateCategory(category.id, payload);
            setCategories(prev => prev.map(c => c.id === category.id ? { ...c, isActive: payload.isActive } : c));
        } catch (err: any) {
            alert(`Cập nhật trạng thái thất bại: ${err.message}`);
        }
    };

    const getProductCount = (categoryId: string) => {
        return products.filter(p => p.categoryId === categoryId).length;
    };

    // Filter Logic
    const filteredCategories = categories.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              c.slug.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesTab = filterTab === 'all' 
            ? true 
            : filterTab === 'active' 
                ? c.isActive !== false 
                : c.isActive === false;

        return matchesSearch && matchesTab;
    });

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filterTab, searchQuery]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
    const paginatedCategories = filteredCategories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Summary Statistics
    const totalCategoriesCount = categories.length;
    const activeCategoriesCount = categories.filter(c => c.isActive !== false).length;
    const archivedCategoriesCount = categories.filter(c => c.isActive === false).length;
    const totalAssocProducts = products.length;

    return (
        <div className="min-h-screen bg-[#FAF9F6] p-8 animate-slide-up">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#4b2311] tracking-tight">Quản lý danh mục</h1>
                    <p className="text-[#68361c]/70 text-sm mt-1">Tạo và tổ chức các nhóm sản phẩm cà phê, đồ uống, và các thiết bị pha chế.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button onClick={openCreate}>
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Thêm danh mục
                    </Button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <div className="bg-white p-5 rounded border border-[#e8ddd5]/60 shadow-sm transition-all hover:shadow-md">
                    <span className="text-[10px] font-bold text-[#68361c]/50 uppercase tracking-widest block mb-2">Tổng số danh mục</span>
                    <span className="text-3xl font-extrabold text-[#4b2311]">{totalCategoriesCount}</span>
                </div>
                <div className="bg-white p-5 rounded border border-[#e8ddd5]/60 shadow-sm transition-all hover:shadow-md">
                    <span className="text-[10px] font-bold text-[#68361c]/50 uppercase tracking-widest block mb-2">Danh mục đang hoạt động</span>
                    <span className="text-3xl font-extrabold text-[#657b35]">{activeCategoriesCount}</span>
                </div>
                <div className="bg-white p-5 rounded border border-[#e8ddd5]/60 shadow-sm transition-all hover:shadow-md">
                    <span className="text-[10px] font-bold text-[#68361c]/50 uppercase tracking-widest block mb-2">Danh mục lưu trữ</span>
                    <span className="text-3xl font-extrabold text-[#925f3c]">{archivedCategoriesCount < 10 ? `0${archivedCategoriesCount}` : archivedCategoriesCount}</span>
                </div>
                <div className="bg-white p-5 rounded border border-[#e8ddd5]/60 shadow-sm transition-all hover:shadow-md">
                    <span className="text-[10px] font-bold text-[#68361c]/50 uppercase tracking-widest block mb-2">Sản phẩm đã phân loại</span>
                    <span className="text-3xl font-extrabold text-[#4b2311]">{totalAssocProducts.toLocaleString()}</span>
                </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
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
                        variant={filterTab === 'active' ? 'primary' : 'secondary'} 
                        onClick={() => setFilterTab('active')}
                        className="!px-4 !py-2 !text-xs"
                    >
                        Hoạt động
                    </Button>
                    <Button 
                        variant={filterTab === 'archived' ? 'primary' : 'secondary'} 
                        onClick={() => setFilterTab('archived')}
                        className="!px-4 !py-2 !text-xs"
                    >
                        Tạm ẩn
                    </Button>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                    <input
                        type="text"
                        placeholder="Tìm danh mục, slug..."
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
                                    <th className="px-6 py-4 text-[#5c5652] tracking-wider font-bold text-[11px] uppercase tracking-widest w-[33%]">Danh mục</th>
                                    <th className="px-6 py-4 text-[#5c5652] tracking-wider font-bold text-[11px] uppercase tracking-widest w-[20%]">Đường dẫn</th>
                                    <th className="px-6 py-4 text-[#5c5652] tracking-wider font-bold text-[11px] uppercase tracking-widest w-[27%]">Mô tả</th>
                                    <th className="px-6 py-4 text-[#5c5652] tracking-wider font-bold text-[11px] uppercase tracking-widest w-[12%]">Số sản phẩm</th>
                                    <th className="px-6 py-4 text-[#5c5652] tracking-wider font-bold text-[11px] uppercase tracking-widest w-[6%]">Hiển thị</th>
                                    <th className="px-6 py-4 text-[#5c5652] tracking-wider font-bold text-[11px] uppercase tracking-widest w-[4%] text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e8ddd5]/30">
                                {paginatedCategories.map((cat) => {
                                    const count = getProductCount(cat.id);
                                    return (
                                        <tr key={cat.id} className="hover:bg-[#FAF9F6]/50 transition-colors group">
                                            {/* Category Info */}
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <img 
                                                        src={getCategoryImage(cat.id)} 
                                                        alt={cat.name} 
                                                        className="w-12 h-12 object-cover rounded border border-[#e8ddd5]/30 shadow-sm shrink-0" 
                                                    />
                                                    <div className="min-w-0">
                                                        <h4 className="font-semibold text-[#2d2825] text-sm leading-snug group-hover:text-[#657b35] transition-colors truncate" title={cat.name}>
                                                            {cat.name}
                                                        </h4>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Slug */}
                                            <td className="px-6 py-5">
                                                <span className="text-[#888079] font-medium text-xs tracking-wider">{cat.slug}</span>
                                            </td>

                                            {/* Description */}
                                            <td className="px-6 py-5">
                                                <span className="text-xs text-[#888079] block max-w-[240px] truncate" title={cat.description || ''}>
                                                    {cat.description || <span className="text-[#888079]/30 italic">Chưa có mô tả</span>}
                                                </span>
                                            </td>

                                            {/* Products count pill */}
                                            <td className="px-6 py-5">
                                                <span className="bg-[#FAF6F0] text-[#888079] font-bold px-3 py-1 text-[9px] rounded-full uppercase tracking-widest border border-[#e8ddd5]/20">
                                                    {count < 10 ? `0${count}` : count} sản phẩm
                                                </span>
                                            </td>

                                            {/* Visibility Toggle */}
                                            <td className="px-6 py-5">
                                                <button
                                                    onClick={() => handleToggleActive(cat)}
                                                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none outline-none ${cat.isActive !== false ? 'bg-[#4b2311]' : 'bg-[#E3DBD3]'}`}
                                                >
                                                    <span
                                                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${cat.isActive !== false ? 'translate-x-4' : 'translate-x-0'}`}
                                                    />
                                                </button>
                                            </td>

                                            {/* Actions Menu Dropdown */}
                                            <td className="px-6 py-5 text-center">
                                                <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
                                                    <button 
                                                        onClick={() => setActiveMenuId(activeMenuId === cat.id ? null : cat.id)}
                                                        className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:bg-stone-50 hover:text-stone-700 transition-all cursor-pointer focus:outline-none outline-none border-none border-0 bg-transparent shadow-none"
                                                    >
                                                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                            <circle cx="12" cy="5" r="1" fill="currentColor" />
                                                            <circle cx="12" cy="12" r="1" fill="currentColor" />
                                                            <circle cx="12" cy="19" r="1" fill="currentColor" />
                                                        </svg>
                                                    </button>
                                                    {activeMenuId === cat.id && (
                                                        <div className="absolute right-0 mt-1 w-24 bg-white border border-[#e8ddd5] rounded shadow-lg py-1.5 z-20 animate-slide-up">
                                                            <button 
                                                                onClick={() => { openEdit(cat); setActiveMenuId(null); }} 
                                                                className="w-full text-left px-4 py-1.5 text-xs font-bold text-[#68361c] hover:bg-[#FAF9F6] focus:outline-none outline-none border-none border-0 bg-transparent shadow-none"
                                                            >
                                                                Sửa
                                                            </button>
                                                            <button 
                                                                onClick={() => { setDeleteConfirm(cat.id); setActiveMenuId(null); }} 
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
                    {filteredCategories.length === 0 && (
                        <div className="py-20 text-center flex flex-col items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center border border-[#e8ddd5]/30 mb-3 text-[#68361c]/40">
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                </svg>
                            </div>
                            <span className="text-sm font-bold text-[#4b2311]">Không tìm thấy danh mục nào</span>
                            <span className="text-xs text-[#68361c]/50 mt-1">Vui lòng thử đổi từ khóa tìm kiếm hoặc cài đặt bộ lọc.</span>
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 bg-[#FAF7F5] border-t border-[#e8ddd5]/40 flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#888079]">
                                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredCategories.length)} of {filteredCategories.length} results
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

            {/* Category Modal Component */}
            <CategoryModal 
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                editTarget={editTarget}
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
                        <h2 className="text-base font-extrabold text-[#4b2311] mb-1.5">Xác nhận xoá danh mục</h2>
                        <p className="text-[#68361c]/70 text-xs mb-5 leading-relaxed">Bạn có chắc muốn xoá danh mục này? Hành động này không thể hoàn tác và toàn bộ sản phẩm thuộc danh mục này sẽ mất phân loại.</p>
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

export default AdminCategories;
