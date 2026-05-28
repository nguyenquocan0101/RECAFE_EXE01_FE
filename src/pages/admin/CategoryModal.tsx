import React, { useEffect, useState } from 'react';
import * as adminApi from '@/services/api/admin';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';

interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    isActive?: boolean;
}

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    editTarget: Category | null;
    onSaveSuccess: () => void;
}

const emptyForm = { name: '', slug: '', description: '', isActive: true };

export const CategoryModal: React.FC<CategoryModalProps> = ({
    isOpen,
    onClose,
    editTarget,
    onSaveSuccess,
}) => {
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    const slugify = (str: string) =>
        str.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const handleNameChange = (name: string) => {
        setForm(f => ({ ...f, name, slug: editTarget ? f.slug : slugify(name) }));
    };

    useEffect(() => {
        if (isOpen) {
            if (editTarget) {
                setForm({
                    name: editTarget.name,
                    slug: editTarget.slug,
                    description: editTarget.description || '',
                    isActive: editTarget.isActive ?? true,
                });
            } else {
                setForm(emptyForm);
            }
        }
    }, [editTarget, isOpen]);

    const handleSave = async () => {
        if (!form.name || !form.slug) return;
        setSaving(true);
        try {
            if (editTarget) {
                await adminApi.updateCategory(editTarget.id, form);
            } else {
                await adminApi.createCategory(form);
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
        <Modal isOpen={isOpen} onClose={onClose} zIndex={50}>
            <div className="bg-white rounded w-full max-w-md mx-4 shadow-2xl border border-[#e8ddd5]/50 animate-slide-up">
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#f0e8e0] sticky top-0 bg-white z-10">
                    <h2 className="text-lg font-extrabold text-[#4b2311]">
                        {editTarget ? 'Sửa thông tin danh mục' : 'Thêm danh mục mới'}
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
                        <label className="block text-[10px] font-bold text-[#68361c]/70 uppercase tracking-widest mb-1.5">Tên danh mục *</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={e => handleNameChange(e.target.value)}
                            placeholder="Ví dụ: Cà phê phin, Thiết bị..."
                            className="w-full px-4 py-2.5 border border-[#e8ddd5] rounded text-[#4b2311] text-sm focus:outline-none focus:border-[#657b35] transition-all"
                        />
                    </div>
                    
                    {/* Slug */}
                    <div>
                        <label className="block text-[10px] font-bold text-[#68361c]/70 uppercase tracking-widest mb-1.5">Đường dẫn slug *</label>
                        <input
                            type="text"
                            value={form.slug}
                            onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                            placeholder="ten-danh-muc"
                            className="w-full px-4 py-2.5 border border-[#e8ddd5] rounded text-[#4b2311] font-mono text-sm focus:outline-none focus:border-[#657b35] transition-all"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-[10px] font-bold text-[#68361c]/70 uppercase tracking-widest mb-1.5">Mô tả danh mục</label>
                        <textarea
                            value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            placeholder="Mô tả tóm tắt cho nhóm sản phẩm này..."
                            rows={3}
                            className="w-full px-4 py-2.5 border border-[#e8ddd5] rounded text-[#4b2311] text-sm focus:outline-none focus:border-[#657b35] resize-none transition-all"
                        />
                    </div>

                    {/* Active Switch Checkbox */}
                    <div className="bg-[#fcfbf9]/80 border border-[#e8ddd5]/30 p-4 rounded">
                        <label className="flex items-center gap-2.5 cursor-pointer select-none">
                            <input 
                                type="checkbox"
                                checked={form.isActive}
                                onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                                className="w-4 h-4 rounded accent-[#657b35] cursor-pointer" 
                            />
                            <span className="text-sm font-semibold text-[#4b2311]">Kích hoạt hoạt động danh mục</span>
                        </label>
                    </div>
                </div>
                <div className="px-6 py-4 border-t border-[#f0e8e0] flex justify-end gap-3 sticky bottom-0 bg-white z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
                    <Button variant="secondary" onClick={onClose} className="px-5">Huỷ</Button>
                    <Button 
                        onClick={handleSave} 
                        disabled={saving || !form.name || !form.slug}
                        className="px-5 bg-[#657b35] hover:bg-[#798e3a] disabled:opacity-50"
                    >
                        {saving ? 'Đang lưu…' : editTarget ? 'Cập nhật' : 'Tạo mới'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
