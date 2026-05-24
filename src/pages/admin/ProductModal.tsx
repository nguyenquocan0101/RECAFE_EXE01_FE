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
    categoryName?: string;
    isActive?: boolean;
    shortDescription?: string;
    description?: string;
    material?: string;
    size?: string;
    usageNote?: string;
    isPersonalizable?: boolean;
    rewardPoints?: number;
}

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    editTarget: Product | null;
    categories: Category[];
    onSaveSuccess: () => void;
}

const emptyForm = {
    name: '', slug: '', sku: '', price: 0, salePrice: '' as string | number,
    categoryId: '', shortDescription: '', description: '',
    isPersonalizable: false, isActive: true, rewardPoints: 0,
};

export const ProductModal: React.FC<ProductModalProps> = ({
    isOpen,
    onClose,
    editTarget,
    categories,
    onSaveSuccess,
}) => {
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    const slugify = (str: string) =>
        str.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    useEffect(() => {
        if (isOpen) {
            if (editTarget) {
                const matchedCategory = categories.find(c => c.name === editTarget.categoryName);
                const resolvedCategoryId = editTarget.categoryId && editTarget.categoryId !== '00000000-0000-0000-0000-000000000000'
                    ? editTarget.categoryId
                    : (matchedCategory ? matchedCategory.id : (categories[0]?.id || ''));

                setForm({
                    name: editTarget.name,
                    slug: editTarget.slug,
                    sku: editTarget.sku,
                    price: editTarget.price,
                    salePrice: editTarget.salePrice ?? '',
                    categoryId: resolvedCategoryId,
                    shortDescription: editTarget.shortDescription || '',
                    description: editTarget.description || '',
                    isPersonalizable: editTarget.isPersonalizable ?? false,
                    isActive: editTarget.isActive ?? true,
                    rewardPoints: editTarget.rewardPoints ?? 0,
                });
            } else {
                setForm({
                    ...emptyForm,
                    categoryId: categories[0]?.id || '',
                });
            }
        }
    }, [editTarget, categories, isOpen]);

    const handleSave = async () => {
        if (!form.name.trim()) {
            alert('Vui lòng nhập Tên sản phẩm');
            return;
        }
        if (!form.slug.trim()) {
            alert('Vui lòng nhập Đường dẫn slug');
            return;
        }
        if (!form.sku.trim()) {
            alert('Vui lòng nhập Mã SKU');
            return;
        }
        if (!form.categoryId) {
            alert('Vui lòng chọn Danh mục sản phẩm');
            return;
        }
        if (form.price < 0) {
            alert('Giá gốc không được nhỏ hơn 0');
            return;
        }
        setSaving(true);
        const payload = {
            categoryId: form.categoryId,
            name: form.name,
            slug: form.slug,
            sku: form.sku,
            price: Number(form.price),
            salePrice: form.salePrice !== '' ? Number(form.salePrice) : null,
            shortDescription: form.shortDescription || null,
            description: form.description || null,
            material: editTarget?.material ?? null,
            size: editTarget?.size ?? null,
            usageNote: editTarget?.usageNote ?? null,
            isPersonalizable: form.isPersonalizable,
            isActive: form.isActive,
            rewardPoints: Number(form.rewardPoints),
        };
        try {
            if (editTarget) {
                await adminApi.updateProduct(editTarget.id, payload);
            } else {
                await adminApi.createProduct(payload);
            }
            onSaveSuccess();
            onClose();
        } catch (err: any) {
            alert(`Lỗi: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto border border-[#e8ddd5]/50 animate-slide-up">
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#f0e8e0] sticky top-0 bg-white z-10">
                    <h2 className="text-lg font-extrabold text-[#4b2311]">
                        {editTarget ? 'Sửa thông tin sản phẩm' : 'Thêm sản phẩm mới'}
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="w-8 h-8 rounded flex items-center justify-center text-[#68361c]/50 hover:bg-stone-50 hover:text-[#4b2311] transition-all text-lg font-bold focus:outline-none outline-none border-none border-0 bg-transparent shadow-none"
                    >
                        ✕
                    </button>
                </div>
                <div className="px-6 py-5 space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-[10px] font-bold text-[#68361c]/70 uppercase tracking-widest mb-1.5">Tên sản phẩm *</label>
                        <input
                            type="text" value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: editTarget ? f.slug : slugify(e.target.value) }))}
                            placeholder="Ví dụ: Cà Phê Arabica Robusta Premium"
                            className="w-full px-4 py-2.5 border border-[#e8ddd5] rounded text-[#4b2311] text-sm focus:outline-none focus:border-[#657b35] transition-all"
                        />
                    </div>
                    
                    {/* Slug & SKU */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-[#68361c]/70 uppercase tracking-widest mb-1.5">Đường dẫn slug *</label>
                            <input type="text" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="w-full px-4 py-2.5 border border-[#e8ddd5] rounded text-[#4b2311] font-mono text-sm focus:outline-none focus:border-[#657b35] transition-all" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-[#68361c]/70 uppercase tracking-widest mb-1.5">Mã SKU *</label>
                            <input type="text" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} placeholder="Ví dụ: ROBUSTA-PREM-250" className="w-full px-4 py-2.5 border border-[#e8ddd5] rounded text-[#4b2311] font-mono text-sm focus:outline-none focus:border-[#657b35] transition-all" />
                        </div>
                    </div>

                    {/* Price & Sale Price */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-[#68361c]/70 uppercase tracking-widest mb-1.5">Giá gốc (VND) *</label>
                            <input type="number" min={0} value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} className="w-full px-4 py-2.5 border border-[#e8ddd5] rounded text-[#4b2311] text-sm focus:outline-none focus:border-[#657b35] transition-all" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-[#68361c]/70 uppercase tracking-widest mb-1.5">Giá khuyến mãi (VND)</label>
                            <input type="number" min={0} value={form.salePrice} onChange={e => setForm(f => ({ ...f, salePrice: e.target.value }))} placeholder="Không bắt buộc" className="w-full px-4 py-2.5 border border-[#e8ddd5] rounded text-[#4b2311] text-sm focus:outline-none focus:border-[#657b35] transition-all" />
                        </div>
                    </div>

                    {/* Category & Reward Points */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-[#68361c]/70 uppercase tracking-widest mb-1.5">Danh mục sản phẩm *</label>
                            <div className="relative">
                                <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} className="w-full pl-4 pr-10 py-2.5 bg-white border border-[#e8ddd5] rounded text-[#4b2311] text-sm focus:outline-none focus:border-[#657b35] cursor-pointer appearance-none">
                                    <option value="">-- Chọn danh mục --</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#68361c]/60">
                                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-[#68361c]/70 uppercase tracking-widest mb-1.5">Điểm tích lũy</label>
                            <input type="number" min={0} value={form.rewardPoints} onChange={e => setForm(f => ({ ...f, rewardPoints: Number(e.target.value) }))} className="w-full px-4 py-2.5 border border-[#e8ddd5] rounded text-[#4b2311] text-sm focus:outline-none focus:border-[#657b35] transition-all" />
                        </div>
                    </div>

                    {/* Short Description */}
                    <div>
                        <label className="block text-[10px] font-bold text-[#68361c]/70 uppercase tracking-widest mb-1.5">Mô tả ngắn</label>
                        <input type="text" value={form.shortDescription} onChange={e => setForm(f => ({ ...f, shortDescription: e.target.value }))} placeholder="Mô tả tóm tắt sản phẩm..." className="w-full px-4 py-2.5 border border-[#e8ddd5] rounded text-[#4b2311] text-sm focus:outline-none focus:border-[#657b35] transition-all" />
                    </div>

                    {/* Full Description */}
                    <div>
                        <label className="block text-[10px] font-bold text-[#68361c]/70 uppercase tracking-widest mb-1.5">Mô tả chi tiết</label>
                        <textarea 
                            value={form.description} 
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} 
                            placeholder="Nhập thông tin chi tiết về sản phẩm..." 
                            rows={3} 
                            className="w-full px-4 py-2.5 border border-[#e8ddd5] rounded text-[#4b2311] text-sm focus:outline-none focus:border-[#657b35] resize-none transition-all"
                        />
                    </div>

                    {/* Checkboxes */}
                    <div className="flex gap-6 bg-[#fcfbf9]/80 border border-[#e8ddd5]/30 p-4 rounded">
                        <label className="flex items-center gap-2.5 cursor-pointer select-none">
                            <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 rounded accent-[#657b35] cursor-pointer" />
                            <span className="text-sm font-semibold text-[#4b2311]">Kích hoạt sản phẩm</span>
                        </label>
                        <label className="flex items-center gap-2.5 cursor-pointer select-none">
                            <input type="checkbox" checked={form.isPersonalizable} onChange={e => setForm(f => ({ ...f, isPersonalizable: e.target.checked }))} className="w-4 h-4 rounded accent-[#657b35] cursor-pointer" />
                            <span className="text-sm font-semibold text-[#4b2311]">Cho phép cá nhân hoá</span>
                        </label>
                    </div>
                </div>
                <div className="px-6 py-4 border-t border-[#f0e8e0] flex justify-end gap-3 sticky bottom-0 bg-white z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
                    <Button variant="secondary" onClick={onClose} className="px-5">Huỷ</Button>
                    <Button 
                        onClick={handleSave} 
                        disabled={saving}
                        className="px-5 bg-[#657b35] hover:bg-[#798e3a] disabled:opacity-50"
                    >
                        {saving ? 'Đang lưu…' : editTarget ? 'Cập nhật' : 'Tạo mới'}
                    </Button>
                </div>
            </div>
        </div>
    );
};
