import React, { useEffect, useState, useRef } from 'react';
import * as adminApi from '@/services/api/admin';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';

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
    images?: { imageUrl: string }[] | null;
    model3DUrl?: string | null;
}

const Model3DViewer = React.lazy(() => import('@/components/product/Model3DViewer'));

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
    material: '', size: '',
};

export const ProductModal: React.FC<ProductModalProps> = ({
    isOpen,
    onClose,
    editTarget,
    categories,
    onSaveSuccess,
}) => {
    const [form, setForm] = useState(() => {
        if (editTarget) {
            const matchedCategory = categories.find(c => c.name === editTarget.categoryName);
            const resolvedCategoryId = editTarget.categoryId && editTarget.categoryId !== '00000000-0000-0000-0000-000000000000'
                ? editTarget.categoryId
                : (matchedCategory ? matchedCategory.id : (categories[0]?.id || ''));

            return {
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
                material: editTarget.material || '',
                size: editTarget.size || '',
            };
        }
        return {
            ...emptyForm,
            categoryId: categories[0]?.id || '',
        };
    });
    const [saving, setSaving] = useState(false);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [replaceOldImages, setReplaceOldImages] = useState(true);
    const [previewSelectedImageIdx, setPreviewSelectedImageIdx] = useState(0);
    const [model3DUrl, setModel3DUrl] = useState<string | null>(null);
    const [uploading3D, setUploading3D] = useState(false);
    const [show3DPreview, setShow3DPreview] = useState(false);
    const [error3D, setError3D] = useState<string | null>(null);
    const file3DInputRef = useRef<HTMLInputElement>(null);

    const slugify = (str: string) =>
        str.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const invalidFile = files.find(file => file.size > 5 * 1024 * 1024);
        if (invalidFile) {
            alert('Dung lượng mỗi hình ảnh không được vượt quá 5MB');
            return;
        }

        if (selectedImages.length + files.length > 5) {
            alert('Tối đa chỉ được tải lên 5 hình ảnh');
            return;
        }

        const newFiles = [...selectedImages, ...files];
        setSelectedImages(newFiles);

        const newPreviews: string[] = [];
        let loadedCount = 0;
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                newPreviews.push(reader.result as string);
                loadedCount++;
                if (loadedCount === files.length) {
                    setImagePreviews(prev => [...prev, ...newPreviews]);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const handleRemoveSelectedImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const previewImages = imagePreviews.length > 0
        ? imagePreviews
        : (editTarget?.images && editTarget.images.length > 0
            ? editTarget.images.map(img => img.imageUrl)
            : (editTarget?.thumbnailUrl ? [editTarget.thumbnailUrl] : (editTarget?.image ? [editTarget.image] : ['/assets/re_cup.png'])));

    useEffect(() => {
        setPreviewSelectedImageIdx(0);
    }, [previewImages.length]);

    useEffect(() => {
        if (isOpen) {
            setSelectedImages([]);
            setImagePreviews([]);
            setReplaceOldImages(true);
            setPreviewSelectedImageIdx(0);
            setShow3DPreview(false);
            setError3D(null);
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
                    material: editTarget.material || '',
                    size: editTarget.size || '',
                });
                setModel3DUrl(editTarget.model3DUrl || null);
            } else {
                setForm({
                    ...emptyForm,
                    categoryId: categories[0]?.id || '',
                });
                setModel3DUrl(null);
            }
        }
    }, [editTarget, categories, isOpen]);

    const handle3DFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editTarget) return;

        const MAX_SIZE = 25 * 1024 * 1024; // 25MB
        const ACCEPTED_EXTS = ['.glb', '.gltf', '.stl', '.obj', '.3mf'];
        const ext = '.' + file.name.split('.').pop()?.toLowerCase();
        
        if (!ACCEPTED_EXTS.includes(ext)) {
            setError3D('Chỉ chấp nhận file .glb, .gltf, .stl, .obj hoặc .3mf');
            return;
        }
        if (file.size > MAX_SIZE) {
            setError3D(`File quá lớn (tối đa 25MB, file của bạn: ${(file.size / 1024 / 1024).toFixed(1)}MB)`);
            return;
        }

        setError3D(null);
        setUploading3D(true);
        try {
            const res = await adminApi.uploadProduct3DModel(editTarget.id, file);
            const url = res?.data?.model3DUrl || res?.model3DUrl || res?.url || '';
            setModel3DUrl(url);
            onSaveSuccess();
        } catch (err: any) {
            setError3D(err.message || 'Upload thất bại');
        } finally {
            setUploading3D(false);
        }
    };

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
            material: form.material || null,
            size: form.size || null,
            usageNote: editTarget?.usageNote || null,
            isPersonalizable: !!form.isPersonalizable,
            isActive: !!form.isActive,
            rewardPoints: Number(form.rewardPoints)
        };

        try {
            let productId = editTarget?.id;
            if (editTarget) {
                await adminApi.updateProduct(editTarget.id, payload);
            } else {
                const res = await adminApi.createProduct(payload);
                productId = res?.id;
            }

            if (productId && selectedImages.length > 0) {
                await adminApi.uploadProductImages(productId, selectedImages, replaceOldImages);
            }

            onSaveSuccess();
            onClose();
        } catch (err: any) {
            alert(`Lỗi: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} zIndex={50} className="animate-fade-in">
            <div className="bg-white rounded w-full max-w-[95vw] xl:max-w-[1350px] shadow-2xl h-[90vh] flex flex-col overflow-hidden border border-[#e8ddd5]/50 animate-slide-up">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0e8e0] bg-white shrink-0">
                    <h2 className="text-lg font-extrabold text-[#4b2311]">
                        {editTarget ? 'Sửa thông tin sản phẩm' : 'Thêm sản phẩm mới'}
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="w-8 h-8 rounded flex items-center justify-center text-[#68361c]/50 hover:bg-stone-50 hover:text-[#4b2311] transition-all text-lg font-bold focus:outline-none border-0 bg-transparent shadow-none"
                    >
                        ✕
                    </button>
                </div>

                {/* Split Panel Area */}
                <div className="flex flex-col lg:flex-row flex-grow overflow-hidden">
                    
                    {/* Left Column: Form Fields */}
                    <div className="w-full lg:w-[45%] p-6 overflow-y-auto border-r border-[#f0e8e0] space-y-4">
                        <div className="text-xs font-bold text-[#68361c] uppercase tracking-widest pb-2 border-b border-[#e8ddd5]/30">
                            Thông tin sản phẩm
                        </div>

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

                        {/* Material & Size */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-[#68361c]/70 uppercase tracking-widest mb-1.5">Chất liệu</label>
                                <input
                                    type="text"
                                    value={form.material}
                                    onChange={e => setForm(f => ({ ...f, material: e.target.value }))}
                                    placeholder="Ví dụ: Gỗ + Bã cà phê tái chế"
                                    className="w-full px-4 py-2.5 border border-[#e8ddd5] rounded text-[#4b2311] text-sm focus:outline-none focus:border-[#657b35] transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-[#68361c]/70 uppercase tracking-widest mb-1.5">Kích thước</label>
                                <input
                                    type="text"
                                    value={form.size}
                                    onChange={e => setForm(f => ({ ...f, size: e.target.value }))}
                                    placeholder="Ví dụ: H: 25cm | D: 12cm"
                                    className="w-full px-4 py-2.5 border border-[#e8ddd5] rounded text-[#4b2311] text-sm focus:outline-none focus:border-[#657b35] transition-all"
                                />
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

                        {/* Existing Images Display */}
                        {(() => {
                            const existingImages = editTarget?.images && editTarget.images.length > 0
                                ? editTarget.images.map(img => img.imageUrl)
                                : (editTarget?.image ? [editTarget.image] : []);
                            if (existingImages.length === 0) return null;
                            return (
                                <div>
                                    <label className="block text-[10px] font-bold text-[#68361c]/70 uppercase tracking-widest mb-1.5">Hình ảnh hiện tại</label>
                                    <div className="flex flex-wrap gap-2.5 p-3 bg-stone-50 border border-[#e8ddd5]/30 rounded">
                                        {existingImages.map((url, idx) => (
                                            <div key={idx} className="w-16 h-16 border border-[#e8ddd5] rounded overflow-hidden bg-white shrink-0 shadow-sm">
                                                <img src={url} alt={`Existing view ${idx + 1}`} className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Image Upload */}
                        <div>
                            <label className="block text-[10px] font-bold text-[#68361c]/70 uppercase tracking-widest mb-1.5">Hình ảnh tải lên mới (tối đa 5 ảnh) </label>
                            <div className="flex flex-col gap-4 p-4 bg-[#fcfbf9]/80 border border-[#e8ddd5]/30 rounded">
                                {/* Previews grid of new selected images */}
                                {imagePreviews.length > 0 && (
                                    <div className="flex flex-wrap gap-3">
                                        {imagePreviews.map((preview, idx) => (
                                            <div key={idx} className="relative w-20 h-20 border border-[#e8ddd5] rounded overflow-hidden shrink-0 bg-stone-50 shadow-sm animate-slide-up">
                                                <img src={preview} alt={`New preview ${idx + 1}`} className="w-full h-full object-cover" />
                                                <button 
                                                    type="button"
                                                    onClick={() => handleRemoveSelectedImage(idx)}
                                                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center text-[10px] hover:bg-black/80 transition-all focus:outline-none border-0 outline-none p-0 cursor-pointer shadow"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex flex-col sm:flex-row gap-4 items-center">
                                    <label className="inline-block px-4 py-2 border border-[#e8ddd5] rounded bg-white text-xs font-bold text-[#68361c] hover:bg-stone-50 cursor-pointer shadow-sm transition-all shrink-0">
                                        Chọn hình ảnh
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            multiple 
                                            onChange={handleImagesChange} 
                                            className="hidden" 
                                        />
                                    </label>
                                    <p className="text-[10px] text-[#68361c]/50">Hỗ trợ JPG, PNG, WEBP. Tối đa 5 hình, mỗi hình dưới 5MB.</p>
                                </div>

                                {/* Replace old images option */}
                                {editTarget && selectedImages.length > 0 && (
                                    <label className="flex items-center gap-2.5 mt-2 cursor-pointer select-none">
                                        <input 
                                            type="checkbox" 
                                            checked={replaceOldImages} 
                                            onChange={e => setReplaceOldImages(e.target.checked)} 
                                            className="w-4 h-4 rounded accent-[#657b35] cursor-pointer" 
                                        />
                                        <span className="text-xs font-semibold text-[#4b2311]">Thay thế toàn bộ ảnh cũ bằng ảnh mới này</span>
                                    </label>
                                )}
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

                        {/* 3D Model Section (Only shown in Edit mode) */}
                        {editTarget && (
                            <div className="bg-[#fcfbf9]/80 border border-[#e8ddd5]/30 p-4 rounded space-y-3">
                                <div className="text-xs font-bold text-[#68361c] uppercase tracking-widest pb-1 border-b border-[#e8ddd5]/20 flex items-center gap-1.5">
                                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25" />
                                    </svg>
                                    Mô hình 3D (3D Model)
                                </div>

                                {model3DUrl ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-white border border-[#e8ddd5] rounded-xl shadow-sm">
                                            <div className="min-w-0 flex-1 mr-2">
                                                <span className="block text-[8px] font-bold text-[#657b35] uppercase tracking-widest">ĐANG SỬ DỤNG</span>
                                                <span className="block text-xs font-bold text-[#4b2311] truncate" title={model3DUrl}>
                                                    {model3DUrl.split('/').pop() || 'model.glb'}
                                                </span>
                                            </div>
                                            <div className="flex gap-2 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => setShow3DPreview(!show3DPreview)}
                                                    className="px-3 py-1.5 bg-[#657b35] hover:bg-[#52642a] text-white text-xs font-bold rounded-lg border-0 cursor-pointer shadow flex items-center gap-1 transition-all"
                                                >
                                                    <span className="material-symbols-outlined text-sm">{show3DPreview ? 'visibility_off' : 'visibility'}</span>
                                                    {show3DPreview ? 'Đóng xem' : 'Xem 3D'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setModel3DUrl(null)}
                                                    className="px-3 py-1.5 bg-white hover:bg-[#FAF9F6] border border-[#eaddd2] text-xs font-bold text-[#68361c] rounded-lg cursor-pointer shadow-sm flex items-center gap-1 transition-all"
                                                >
                                                    <span className="material-symbols-outlined text-sm">upload_file</span>
                                                    Thay thế
                                                </button>
                                            </div>
                                        </div>

                                        {/* Embedded 3D Viewer right inside ProductModal! */}
                                        {show3DPreview && (
                                            <div className="relative w-full h-[320px] border border-[#e8ddd5] rounded-xl overflow-hidden shadow-inner bg-[#FAF9F6] animate-slide-up">
                                                <React.Suspense fallback={
                                                    <div className="flex items-center justify-center h-full">
                                                        <div className="w-8 h-8 border-4 border-[#657b35] border-t-transparent rounded-full animate-spin" />
                                                    </div>
                                                }>
                                                    <Model3DViewer url={model3DUrl} height="100%" />
                                                </React.Suspense>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div 
                                            onClick={() => file3DInputRef.current?.click()}
                                            className="border-2 border-dashed border-[#eaddd2] hover:border-[#657b35] rounded-xl p-6 text-center cursor-pointer transition bg-white flex flex-col items-center gap-2"
                                        >
                                            <input 
                                                type="file" 
                                                ref={file3DInputRef} 
                                                onChange={handle3DFileChange}
                                                accept=".glb,.gltf,.stl,.obj,.3mf"
                                                className="hidden" 
                                            />
                                            <span className="material-symbols-outlined text-3xl text-[#68361c]/50">cloud_upload</span>
                                            <span className="text-xs font-bold text-[#4b2311]">
                                                {uploading3D ? 'Đang upload mô hình 3D...' : 'Chọn file 3D hoặc kéo thả vào đây'}
                                            </span>
                                            <span className="text-[9px] text-[#68361c]/50 font-semibold uppercase">
                                                GLB, GLTF, STL, OBJ, 3MF (Tối đa 25MB)
                                            </span>
                                        </div>
                                        {error3D && (
                                            <div className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 flex items-center gap-1.5 animate-slide-up">
                                                <span className="material-symbols-outlined text-sm">error</span>
                                                {error3D}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Real-time Live Preview (ProductDetail style) */}
                    <div className="w-full lg:w-[55%] p-8 overflow-y-auto bg-[#fcfbf9] space-y-6 select-none relative">
                        
                        {/* Preview Watermark Badge */}
                        <div className="absolute top-4 right-4 bg-[#657b35] text-white text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded shadow-sm opacity-90 z-20 pointer-events-none">
                            Xem trước trực tiếp (Live Preview)
                        </div>

                        {/* Breadcrumbs Navigation mockup */}
                        <nav className="breadcrumb-nav text-[10px] text-stone-400 space-x-1.5 select-none shrink-0 mb-4">
                            <span>Trang chủ</span>
                            <span>›</span>
                            <span>Sản phẩm</span>
                            <span>›</span>
                            <span className="text-[#68361c] font-bold">{form.name || 'Tên sản phẩm'}</span>
                        </nav>

                        {/* Detail Layout Grid mockup */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                            
                            {/* Images Gallery */}
                            <div className="md:col-span-7 flex gap-3.5 select-none">
                                {/* Thumbnail bar */}
                                <div className="flex flex-col gap-2 w-14 shrink-0">
                                    {previewImages.map((img, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            className={`w-14 h-14 border rounded overflow-hidden p-0 bg-white transition-all focus:outline-none ${previewSelectedImageIdx === idx ? 'border-[#657b35] ring-2 ring-[#657b35]' : 'border-stone-200 opacity-60 hover:opacity-100'}`}
                                            onClick={() => setPreviewSelectedImageIdx(idx)}
                                        >
                                            <img src={img} alt="thumb" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                                {/* Main image */}
                                <div className="flex-1 bg-white rounded border border-[#e8ddd5]/60 overflow-hidden flex items-center justify-center aspect-square shadow-sm max-h-[300px]">
                                    <img src={previewImages[previewSelectedImageIdx] || '/assets/re_cup.png'} alt="main" className="w-full h-full object-cover" />
                                </div>
                            </div>

                            {/* Product Info Block */}
                            <div className="md:col-span-5 flex flex-col">
                                {/* Tag Badge */}
                                <span className="inline-flex items-center px-2.5 py-1 rounded bg-[#657b35]/5 text-[#657b35] text-[8px] font-extrabold tracking-widest uppercase mb-4 self-start">
                                    {form.isPersonalizable 
                                        ? 'THIẾT KẾ RIÊNG'
                                        : (form.rewardPoints 
                                            ? 'MỚI VỀ' 
                                            : 'BỘ SƯU TẬP MỚI')}
                                </span>

                                {/* Product Name */}
                                <h1 className="text-xl font-extrabold text-[#4b2311] tracking-tight leading-snug mb-3">
                                    {form.name || 'Tên sản phẩm...'}
                                </h1>

                                {/* Price block */}
                                <div className="flex items-baseline gap-2.5 mb-4 pb-4 border-b border-[#eaddd2]/60">
                                    {form.salePrice !== '' ? (
                                        <>
                                            <span className="text-lg font-extrabold text-[#657b35]">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(form.salePrice))}
                                            </span>
                                            <span className="text-xs text-[#68361c]/50 line-through">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(form.price))}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-lg font-extrabold text-[#4b2311]">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(form.price))}
                                        </span>
                                    )}
                                    <span className="text-[9px] font-bold text-[#68361c]/70 border-l border-[#eaddd2]/60 pl-3 uppercase tracking-wider">
                                        ø 500g bã cà phê
                                    </span>
                                </div>

                                {/* Short Desc / Description */}
                                <div className="mb-4">
                                    <h3 className="text-[9px] font-bold uppercase tracking-widest text-[#68361c]/60 mb-2">
                                        MÔ TẢ CHI TIẾT
                                    </h3>
                                    <p className="text-[#68361c] text-[11px] leading-relaxed max-h-[80px] overflow-y-auto pr-1">
                                        {form.description || form.shortDescription || 'Sản phẩm làm từ bã cà phê tái chế chất lượng cao.'}
                                    </p>
                                </div>

                                {/* Specs grid */}
                                <div className="grid grid-cols-2 gap-3 p-3 bg-white border border-[#eaddd2]/60 rounded-xl mb-4 shadow-sm">
                                    <div className="space-y-0.5">
                                        <span className="block text-[8px] font-bold uppercase tracking-wider text-[#68361c]/60">
                                            CHẤT LIỆU
                                        </span>
                                        <span className="block text-[11px] font-bold text-[#4b2311] truncate">
                                            {form.material || 'Bã cà phê tái chế'}
                                        </span>
                                    </div>
                                    <div className="space-y-0.5">
                                        <span className="block text-[8px] font-bold uppercase tracking-wider text-[#68361c]/60">
                                            KÍCH THƯỚC
                                        </span>
                                        <span className="block text-[11px] font-bold text-[#4b2311] truncate">
                                            {form.size || 'Tiêu chuẩn'}
                                        </span>
                                    </div>
                                </div>

                                {/* Warning note */}
                                <div className="bg-white border border-[#eaddd2]/60 rounded-xl p-3 flex items-start gap-2.5 mb-4 shadow-sm">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#657b35] text-white shrink-0 text-[10px] font-bold">
                                        !
                                    </div>
                                    <div>
                                        <h4 className="text-[#657b35] font-bold text-[10px]">
                                            Lưu ý sử dụng
                                        </h4>
                                        <p className="text-[#68361c]/80 text-[8px] leading-relaxed">
                                            LƯU Ý: Sản phẩm chỉ dùng để trưng bày, không dùng đựng thực phẩm.
                                        </p>
                                    </div>
                                </div>

                                {/* Action buttons */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <button disabled className="w-full bg-[#657b35] text-white font-bold py-2.5 rounded-xl opacity-50 cursor-not-allowed uppercase tracking-widest text-[9px] flex items-center justify-center gap-1 border-0">
                                        Thêm vào giỏ hàng
                                    </button>
                                    <button disabled className="w-full bg-[#68361c] text-white font-bold py-2.5 rounded-xl opacity-50 cursor-not-allowed uppercase tracking-widest text-[9px] flex items-center justify-center gap-1 border-0">
                                        Mua ngay
                                    </button>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-[#f0e8e0] flex justify-end gap-3 sticky bottom-0 bg-white z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.02)] shrink-0">
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
        </Modal>
    );
};
