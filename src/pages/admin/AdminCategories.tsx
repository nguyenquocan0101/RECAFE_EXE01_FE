import React, { useEffect, useState } from 'react';
import * as adminApi from '@/services/api/admin';
import { Button } from '@/components/common/Button';

interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    isActive?: boolean;
}

const emptyForm = { name: '', slug: '', description: '', isActive: true };

const AdminCategories: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Category | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const load = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getCategories();
            setCategories(Array.isArray(data) ? data : data?.data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const openCreate = () => {
        setEditTarget(null);
        setForm(emptyForm);
        setModalOpen(true);
    };

    const openEdit = (cat: Category) => {
        setEditTarget(cat);
        setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', isActive: cat.isActive ?? true });
        setModalOpen(true);
    };

    const slugify = (str: string) =>
        str.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const handleNameChange = (name: string) => {
        setForm(f => ({ ...f, name, slug: editTarget ? f.slug : slugify(name) }));
    };

    const handleSave = async () => {
        if (!form.name || !form.slug) return;
        setSaving(true);
        try {
            if (editTarget) {
                await adminApi.updateCategory(editTarget.id, form);
                setCategories(prev => prev.map(c => c.id === editTarget.id ? { ...c, ...form } : c));
            } else {
                await adminApi.createCategory(form);
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
            await adminApi.deleteCategory(id);
            setCategories(prev => prev.filter(c => c.id !== id));
            setDeleteConfirm(null);
        } catch (err: any) {
            alert(`Xoá thất bại: ${err.message}`);
        }
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-[32px] font-bold text-[#4b2311]">Danh mục</h1>
                    <p className="text-[#68361c] text-sm mt-1">{categories.length} danh mục</p>
                </div>
                <Button onClick={openCreate}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Thêm danh mục
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
                                <th className="text-left px-5 py-4 text-[#68361c] font-semibold text-xs uppercase tracking-wider">Slug</th>
                                <th className="text-left px-5 py-4 text-[#68361c] font-semibold text-xs uppercase tracking-wider">Mô tả</th>
                                <th className="text-left px-5 py-4 text-[#68361c] font-semibold text-xs uppercase tracking-wider">Trạng thái</th>
                                <th className="text-right px-5 py-4 text-[#68361c] font-semibold text-xs uppercase tracking-wider">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f0e8e0]">
                            {categories.map((cat) => (
                                <tr key={cat.id} className="hover:bg-[#faf8f6] transition-colors">
                                    <td className="px-5 py-4 font-semibold text-[#4b2311]">{cat.name}</td>
                                    <td className="px-5 py-4 font-mono text-xs text-[#68361c]">{cat.slug}</td>
                                    <td className="px-5 py-4 text-[#68361c] max-w-[240px] truncate">{cat.description || '—'}</td>
                                    <td className="px-5 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cat.isActive !== false ? 'bg-[#657b35]/10 text-[#657b35]' : 'bg-gray-100 text-gray-500'}`}>
                                            {cat.isActive !== false ? 'Hoạt động' : 'Ẩn'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEdit(cat)}
                                                className="px-3 py-1.5 text-xs font-semibold text-[#657b35] border border-[#657b35] rounded-lg hover:bg-[#657b35] hover:text-white transition-colors"
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(cat.id)}
                                                className="px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                                            >
                                                Xoá
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {categories.length === 0 && (
                        <div className="py-16 text-center text-[#68361c] text-sm">Chưa có danh mục nào.</div>
                    )}
                </div>
            )}

            {/* Create / Edit Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-[#f0e8e0]">
                            <h2 className="text-lg font-bold text-[#4b2311]">{editTarget ? 'Sửa danh mục' : 'Thêm danh mục'}</h2>
                            <button onClick={() => setModalOpen(false)} className="text-[#68361c] hover:text-[#4b2311] text-xl leading-none">✕</button>
                        </div>
                        <div className="px-6 py-5 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-[#68361c] uppercase tracking-wider mb-1.5">Tên *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => handleNameChange(e.target.value)}
                                    placeholder="Tên danh mục"
                                    className="w-full px-4 py-2.5 border border-[#e8ddd5] rounded-lg text-[#4b2311] text-sm focus:outline-none focus:border-[#657b35] focus:ring-2 focus:ring-[#657b35]/20"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#68361c] uppercase tracking-wider mb-1.5">Slug *</label>
                                <input
                                    type="text"
                                    value={form.slug}
                                    onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                                    placeholder="ten-danh-muc"
                                    className="w-full px-4 py-2.5 border border-[#e8ddd5] rounded-lg text-[#4b2311] font-mono text-sm focus:outline-none focus:border-[#657b35] focus:ring-2 focus:ring-[#657b35]/20"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#68361c] uppercase tracking-wider mb-1.5">Mô tả</label>
                                <textarea
                                    value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    placeholder="Mô tả ngắn..."
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-[#e8ddd5] rounded-lg text-[#4b2311] text-sm resize-none focus:outline-none focus:border-[#657b35] focus:ring-2 focus:ring-[#657b35]/20"
                                />
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.isActive}
                                    onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                                    className="w-4 h-4 rounded accent-[#657b35]"
                                />
                                <span className="text-sm text-[#4b2311] font-medium">Kích hoạt danh mục</span>
                            </label>
                        </div>
                        <div className="px-6 py-4 border-t border-[#f0e8e0] flex justify-end gap-3">
                            <Button variant="secondary" onClick={() => setModalOpen(false)}>
                                Huỷ
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={saving || !form.name || !form.slug}
                            >
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
                        <p className="text-[#68361c] text-sm mb-6">Bạn có chắc muốn xoá danh mục này? Hành động không thể hoàn tác.</p>
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

export default AdminCategories;
