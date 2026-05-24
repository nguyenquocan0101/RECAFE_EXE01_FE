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
    image?: string;
    thumbnailUrl?: string;
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
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const slugify = (str: string) =>
        str.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('Dung lượng hình ảnh không được vượt quá 5MB');
                return;
            }
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
    };

    useEffect(() => {
        if (isOpen) {
            setSelectedImage(null);
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
                setImagePreview(editTarget.thumbnailUrl || editTarget.image || null);
            } else {
                setForm({
                    ...emptyForm,
                    categoryId: categories[0]?.id || '',
                });
                setImagePreview(null);
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

        const formData = new FormData();
        formData.append('CategoryId', form.categoryId);
        formData.append('Name', form.name);
        formData.append('Slug', form.slug);
        formData.append('SKU', form.sku);
        formData.append('Price', String(Number(form.price)));
        if (form.salePrice !== '') {
            formData.append('SalePrice', String(Number(form.salePrice)));
        }
        if (form.shortDescription) {
            formData.append('ShortDescription', form.shortDescription);
        }
        if (form.description) {
            formData.append('Description', form.description);
        }
        if (editTarget?.material) {
            formData.append('Material', editTarget.material);
        }
        if (editTarget?.size) {
            formData.append('Size', editTarget.size);
        }
        if (editTarget?.usageNote) {
            formData.append('UsageNote', editTarget.usageNote);
        }
        formData.append('IsPersonalizable', form.isPersonalizable ? 'true' : 'false');
        formData.append('IsActive', form.isActive ? 'true' : 'false');
        formData.append('RewardPoints', String(Number(form.rewardPoints)));

        if (selectedImage) {
            formData.append('Images', selectedImage);
            if (editTarget) {
                formData.append('ReplaceImages', 'true');
            }
        }

        try {
            if (editTarget) {
                await adminApi.updateProduct(editTarget.id, formData);
            } else {
                await adminApi.createProduct(formData);
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

                    {/* Image Upload */}
                    <div>
                        <label className="block text-[10px] font-bold text-[#68361c]/70 uppercase tracking-widest mb-1.5">Hình ảnh sản phẩm</label>
                        <div className="flex flex-col sm:flex-row gap-4 items-center p-4 bg-[#fcfbf9]/80 border border-[#e8ddd5]/30 rounded">
                            {imagePreview ? (
                                <div className="relative w-20 h-20 border border-[#e8ddd5] rounded overflow-hidden shrink-0 bg-stone-50">
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    <button 
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center text-[10px] hover:bg-black/80 transition-all focus:outline-none"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                <div className="w-20 h-20 border border-dashed border-[#e8ddd5] rounded flex items-center justify-center shrink-0 bg-stone-50 text-[#68361c]/40">
                                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                    </svg>
                                </div>
                            )}
                            <div className="flex-1 text-center sm:text-left">
                                <label className="inline-block px-4 py-2 border border-[#e8ddd5] rounded bg-white text-xs font-bold text-[#68361c] hover:bg-stone-50 cursor-pointer shadow-sm transition-all">
                                    Chọn hình ảnh
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleImageChange} 
                                        className="hidden" 
                                    />
                                </label>
                                <p className="text-[10px] text-[#68361c]/50 mt-1.5">Hỗ trợ JPG, PNG, WEBP. Dung lượng tối đa 5MB.</p>
                            </div>
                        </div>
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
