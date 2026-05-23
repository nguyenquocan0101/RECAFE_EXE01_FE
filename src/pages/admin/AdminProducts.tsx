import React, { useEffect, useState } from 'react';
import * as adminApi from '@/services/api/admin';
import { Button } from '@/components/common/Button';

interface Category { id: string; name: string; }
interface Product {
    id: string;
    name: string;
    slug: string;
    sku: string;
    price: number;
    salePrice?: number;
    categoryId: string;
    isActive?: boolean;
    shortDescription?: string;
    description?: string;
    isPersonalizable?: boolean;
    rewardPoints?: number;
}

const emptyForm = {
    name: '', slug: '', sku: '', price: 0, salePrice: '' as string | number,
    categoryId: '', shortDescription: '', description: '',
    isPersonalizable: false, isActive: true, rewardPoints: 0,
};

const AdminProducts: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Product | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        try {
            const [prodData, catData] = await Promise.all([
                adminApi.getProducts(),
                adminApi.getCategories(),
            ]);
            setProducts(Array.isArray(prodData) ? prodData : prodData?.data || []);
            setCategories(Array.isArray(catData) ? catData : catData?.data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const slugify = (str: string) =>
        str.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const openCreate = () => {
        setEditTarget(null);
        setForm({ ...emptyForm, categoryId: categories[0]?.id || '' });
        setModalOpen(true);
    };

    const openEdit = (p: Product) => {
        setEditTarget(p);
        setForm({
            name: p.name, slug: p.slug, sku: p.sku, price: p.price,
            salePrice: p.salePrice ?? '', categoryId: p.categoryId,
            shortDescription: p.shortDescription || '', description: p.description || '',
            isPersonalizable: p.isPersonalizable ?? false, isActive: p.isActive ?? true,
            rewardPoints: p.rewardPoints ?? 0,
        });
        setModalOpen(true);
    };

    const handleSave = async () => {
        if (!form.name || !form.slug || !form.sku || !form.categoryId || form.price <= 0) return;
        setSaving(true);
        const payload = {
            ...form,
            price: Number(form.price),
            salePrice: form.salePrice !== '' ? Number(form.salePrice) : null,
            rewardPoints: Number(form.rewardPoints),
        };
        try {
            if (editTarget) {
                await adminApi.updateProduct(editTarget.id, payload);
                await load();
            } else {
                await adminApi.createProduct(payload);
                await load();
            }
            setModalOpen(false);
        } catch (err: any) {
            alert(`Lỗi: ${err.message}`);
        } finally {
            setSaving(false);
        }
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

    const formatCurrency = (v: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

    const getCategoryName = (id: string) =>
        categories.find(c => c.id === id)?.name || id?.slice(0, 8) || '—';

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-[32px] font-bold text-[#4b2311]">Sản phẩm</h1>
                    <p className="text-[#68361c] text-sm mt-1">{products.length} sản phẩm</p>
                </div>
                <Button onClick={openCreate}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Thêm sản phẩm
                </Button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-4 border-[#657b35] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-[#e8ddd5] overflow-hidden shadow-sm">
                    <table className="w-full text-sm">
                        <thead className="bg-[#f5f0eb]">
                            <tr>
                                <th className="text-left px-5 py-4 text-[#68361c] font-semibold text-xs uppercase tracking-wider">Tên</th>
                                <th className="text-left px-5 py-4 text-[#68361c] font-semibold text-xs uppercase tracking-wider">SKU</th>
                                <th className="text-left px-5 py-4 text-[#68361c] font-semibold text-xs uppercase tracking-wider">Danh mục</th>
                                <th className="text-left px-5 py-4 text-[#68361c] font-semibold text-xs uppercase tracking-wider">Giá</th>
                                <th className="text-left px-5 py-4 text-[#68361c] font-semibold text-xs uppercase tracking-wider">Trạng thái</th>
                                <th className="text-right px-5 py-4 text-[#68361c] font-semibold text-xs uppercase tracking-wider">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f0e8e0]">
                            {products.map((p) => (
                                <tr key={p.id} className="hover:bg-[#faf8f6] transition-colors">
                                    <td className="px-5 py-4 font-semibold text-[#4b2311] max-w-[200px] truncate">{p.name}</td>
                                    <td className="px-5 py-4 font-mono text-xs text-[#68361c]">{p.sku}</td>
                                    <td className="px-5 py-4 text-[#68361c]">{getCategoryName(p.categoryId)}</td>
                                    <td className="px-5 py-4 text-[#4b2311] font-semibold">
                                        {formatCurrency(p.price)}
                                        {p.salePrice && (
                                            <span className="ml-2 text-xs text-[#657b35]">{formatCurrency(p.salePrice)}</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${p.isActive !== false ? 'bg-[#657b35]/10 text-[#657b35]' : 'bg-gray-100 text-gray-500'}`}>
                                            {p.isActive !== false ? 'Hoạt động' : 'Ẩn'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => openEdit(p)} className="px-3 py-1.5 text-xs font-semibold text-[#657b35] border border-[#657b35] rounded-lg hover:bg-[#657b35] hover:text-white transition-colors">Sửa</button>
                                            <button onClick={() => setDeleteConfirm(p.id)} className="px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-600 hover:text-white transition-colors">Xoá</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {products.length === 0 && (
                        <div className="py-16 text-center text-[#68361c] text-sm">Chưa có sản phẩm nào.</div>
                    )}
                </div>
            )}

            {/* Create / Edit Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-[#f0e8e0] sticky top-0 bg-white z-10">
                            <h2 className="text-lg font-bold text-[#4b2311]">{editTarget ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h2>
                            <button onClick={() => setModalOpen(false)} className="text-[#68361c] hover:text-[#4b2311] text-xl">✕</button>
                        </div>
                        <div className="px-6 py-5 space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-xs font-bold text-[#68361c] uppercase tracking-wider mb-1.5">Tên *</label>
                                <input
                                    type="text" value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: editTarget ? f.slug : slugify(e.target.value) }))}
                                    className="w-full px-4 py-2.5 border border-[#e8ddd5] rounded-lg text-[#4b2311] text-sm focus:outline-none focus:border-[#657b35]"
                                />
                            </div>
                            {/* Slug & SKU */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-[#68361c] uppercase tracking-wider mb-1.5">Slug *</label>
                                    <input type="text" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="w-full px-4 py-2.5 border border-[#e8ddd5] rounded-lg text-[#4b2311] font-mono text-sm focus:outline-none focus:border-[#657b35]" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[#68361c] uppercase tracking-wider mb-1.5">SKU *</label>
                                    <input type="text" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} className="w-full px-4 py-2.5 border border-[#e8ddd5] rounded-lg text-[#4b2311] font-mono text-sm focus:outline-none focus:border-[#657b35]" />
                                </div>
                            </div>
                            {/* Price & Sale */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-[#68361c] uppercase tracking-wider mb-1.5">Giá *</label>
                                    <input type="number" min={0} value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} className="w-full px-4 py-2.5 border border-[#e8ddd5] rounded-lg text-[#4b2311] text-sm focus:outline-none focus:border-[#657b35]" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[#68361c] uppercase tracking-wider mb-1.5">Giá KM</label>
                                    <input type="number" min={0} value={form.salePrice} onChange={e => setForm(f => ({ ...f, salePrice: e.target.value }))} placeholder="Tuỳ chọn" className="w-full px-4 py-2.5 border border-[#e8ddd5] rounded-lg text-[#4b2311] text-sm focus:outline-none focus:border-[#657b35]" />
                                </div>
                            </div>
                            {/* Category */}
                            <div>
                                <label className="block text-xs font-bold text-[#68361c] uppercase tracking-wider mb-1.5">Danh mục *</label>
                                <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} className="w-full px-4 py-2.5 border border-[#e8ddd5] rounded-lg text-[#4b2311] text-sm focus:outline-none focus:border-[#657b35]">
                                    <option value="">-- Chọn danh mục --</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            {/* Short desc */}
                            <div>
                                <label className="block text-xs font-bold text-[#68361c] uppercase tracking-wider mb-1.5">Mô tả ngắn</label>
                                <input type="text" value={form.shortDescription} onChange={e => setForm(f => ({ ...f, shortDescription: e.target.value }))} className="w-full px-4 py-2.5 border border-[#e8ddd5] rounded-lg text-[#4b2311] text-sm focus:outline-none focus:border-[#657b35]" />
                            </div>
                            {/* Checkboxes */}
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 accent-[#657b35]" />
                                    <span className="text-sm text-[#4b2311]">Kích hoạt</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={form.isPersonalizable} onChange={e => setForm(f => ({ ...f, isPersonalizable: e.target.checked }))} className="w-4 h-4 accent-[#657b35]" />
                                    <span className="text-sm text-[#4b2311]">Cá nhân hoá</span>
                                </label>
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-[#f0e8e0] flex justify-end gap-3 sticky bottom-0 bg-white">
                            <Button variant="secondary" onClick={() => setModalOpen(false)}>Huỷ</Button>
                            <Button onClick={handleSave} disabled={saving || !form.name || !form.slug || !form.sku || !form.categoryId}>
                                {saving ? 'Đang lưu…' : editTarget ? 'Cập nhật' : 'Tạo mới'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete confirm */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-sm mx-4 shadow-2xl p-6">
                        <h2 className="text-lg font-bold text-[#4b2311] mb-2">Xác nhận xoá</h2>
                        <p className="text-[#68361c] text-sm mb-6">Bạn có chắc muốn xoá sản phẩm này không?</p>
                        <div className="flex justify-end gap-3">
                            <Button variant="secondary" onClick={() => setDeleteConfirm(null)} className="px-4 py-2">Huỷ</Button>
                            <Button variant="danger" onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2">Xoá</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProducts;
