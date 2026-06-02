import React, { useEffect, useState } from 'react';
import * as adminApi from '@/services/api/admin';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';

// ─── Types ──────────────────────────────────────────────────────────────────

interface Coupon {
    id: string;
    code: string;
    type: number;
    scope: number;
    value: number;
    maxDiscountAmount?: number | null;
    minimumOrderAmount?: number | null;
    usageLimit?: number;
    usageCount?: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
    productIds?: string[] | null;
}

interface Product {
    id: string;
    name: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const SCOPE_LABELS: Record<number, string> = { 0: 'Đơn hàng', 1: 'Sản phẩm', 2: 'Danh mục' };
const TYPE_LABELS: Record<number, string> = { 0: 'Giảm %', 1: 'Giảm tiền' };
const SCOPE_COLORS: Record<number, string> = {
    0: 'bg-blue-50 text-blue-700 border-blue-200',
    1: 'bg-purple-50 text-purple-700 border-purple-200',
    2: 'bg-orange-50 text-orange-700 border-orange-200',
};

const DEFAULT_FORM = {
    code: '',
    type: 0,
    scope: 0,
    value: '',
    maxDiscountAmount: '',
    minimumOrderAmount: '',
    usageLimit: '',
    startDate: '',
    endDate: '',
    isActive: true,
    productIds: [] as string[],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtDate = (d: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const fmtMoney = (v: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

const toLocalDatetimeValue = (iso: string) => {
    if (!iso) return '';
    return iso.slice(0, 16); // "YYYY-MM-DDTHH:mm"
};

// ─── Coupon Form Modal ────────────────────────────────────────────────────────

interface CouponModalProps {
    isOpen: boolean;
    onClose: () => void;
    editTarget: Coupon | null;
    products: Product[];
    onSaveSuccess: () => void;
}

const CouponModal: React.FC<CouponModalProps> = ({ isOpen, onClose, editTarget, products, onSaveSuccess }) => {
    const [form, setForm] = useState(DEFAULT_FORM);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [productSearch, setProductSearch] = useState('');

    useEffect(() => {
        if (editTarget) {
            setForm({
                code: editTarget.code,
                type: editTarget.type,
                scope: editTarget.scope,
                value: String(editTarget.value ?? ''),
                maxDiscountAmount: String(editTarget.maxDiscountAmount ?? ''),
                minimumOrderAmount: String(editTarget.minimumOrderAmount ?? ''),
                usageLimit: String(editTarget.usageLimit ?? ''),
                startDate: toLocalDatetimeValue(editTarget.startDate),
                endDate: toLocalDatetimeValue(editTarget.endDate),
                isActive: editTarget.isActive,
                productIds: editTarget.productIds ?? [],
            });
        } else {
            setForm(DEFAULT_FORM);
        }
        setError('');
        setProductSearch('');
    }, [editTarget, isOpen]);

    const set = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

    const toggleProduct = (id: string) => {
        setForm(prev => ({
            ...prev,
            productIds: prev.productIds.includes(id)
                ? prev.productIds.filter(p => p !== id)
                : [...prev.productIds, id],
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // FE validation: scope=Product requires at least 1 product
        if (Number(form.scope) === 1 && form.productIds.length === 0) {
            setError('Phạm vi "Sản phẩm" yêu cầu phải chọn ít nhất 1 sản phẩm.');
            return;
        }

        setSaving(true);
        try {
            const payload: adminApi.AdminCouponPayload = {
                code: form.code.trim().toUpperCase(),
                type: Number(form.type),
                scope: Number(form.scope),
                value: form.value ? Number(form.value) : undefined,
                maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
                minimumOrderAmount: form.minimumOrderAmount ? Number(form.minimumOrderAmount) : null,
                usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
                startDate: form.startDate ? new Date(form.startDate).toISOString() : '',
                endDate: form.endDate ? new Date(form.endDate).toISOString() : '',
                isActive: form.isActive,
                productIds: form.scope === 1 ? form.productIds : null,
            };

            if (editTarget) {
                await adminApi.updateAdminCoupon(editTarget.id, payload);
            } else {
                await adminApi.createAdminCoupon(payload);
            }
            onSaveSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Lưu thất bại');
        } finally {
            setSaving(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(productSearch.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} zIndex={50}>
            <div className="bg-white rounded w-full max-w-2xl shadow-2xl border border-[#e8ddd5]/50 animate-slide-up max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#e8ddd5]/50 shrink-0">
                    <div>
                        <h2 className="text-base font-extrabold text-[#4b2311]">
                            {editTarget ? 'Chỉnh sửa voucher' : 'Tạo voucher mới'}
                        </h2>
                        <p className="text-xs text-[#68361c]/60 mt-0.5">Điền thông tin voucher giảm giá</p>
                    </div>
                    <button onClick={onClose} className="text-[#68361c]/40 hover:text-[#4b2311] transition-colors bg-transparent border-none cursor-pointer">
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-xs font-semibold">{error}</div>
                    )}

                    {/* Row 1: Code + IsActive */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2 space-y-1.5">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#68361c]/70">Mã voucher *</label>
                            <input
                                required
                                type="text"
                                value={form.code}
                                onChange={e => set('code', e.target.value.toUpperCase())}
                                placeholder="VD: SALE20, ECO10..."
                                maxLength={50}
                                className="w-full bg-white border border-[#e8ddd5] rounded px-3 py-2.5 text-sm font-bold text-[#4b2311] focus:outline-none focus:border-[#657b35] uppercase"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#68361c]/70">Trạng thái</label>
                            <label className="flex items-center gap-2 cursor-pointer mt-3">
                                <button
                                    type="button"
                                    onClick={() => set('isActive', !form.isActive)}
                                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${form.isActive ? 'bg-[#657b35]' : 'bg-[#E3DBD3]'}`}
                                >
                                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${form.isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                                </button>
                                <span className="text-xs font-bold text-[#4b2311]">{form.isActive ? 'Hoạt động' : 'Tắt'}</span>
                            </label>
                        </div>
                    </div>

                    {/* Row 2: Type + Scope */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#68361c]/70">Loại giảm giá *</label>
                            <select
                                value={form.type}
                                onChange={e => set('type', Number(e.target.value))}
                                className="w-full bg-white border border-[#e8ddd5] rounded px-3 py-2.5 text-sm font-medium text-[#4b2311] focus:outline-none focus:border-[#657b35]"
                            >
                                <option value={0}>Giảm % (Phần trăm)</option>
                                <option value={1}>Giảm tiền trực tiếp</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#68361c]/70">Phạm vi áp dụng *</label>
                            <select
                                value={form.scope}
                                onChange={e => set('scope', Number(e.target.value))}
                                className="w-full bg-white border border-[#e8ddd5] rounded px-3 py-2.5 text-sm font-medium text-[#4b2311] focus:outline-none focus:border-[#657b35]"
                            >
                                <option value={0}>Đơn hàng (Order)</option>
                                <option value={1}>Sản phẩm (Product)</option>
                                <option value={2}>Danh mục (Category)</option>
                            </select>
                        </div>
                    </div>

                    {/* Row 3: Value + Max Discount */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#68361c]/70">
                                {form.type === 0 ? 'Giá trị (%)' : 'Số tiền giảm (VNĐ)'}
                            </label>
                            <input
                                type="number"
                                min={0.01}
                                step={form.type === 0 ? 1 : 1000}
                                value={form.value}
                                onChange={e => set('value', e.target.value)}
                                placeholder={form.type === 0 ? 'VD: 20' : 'VD: 50000'}
                                className="w-full bg-white border border-[#e8ddd5] rounded px-3 py-2.5 text-sm text-[#4b2311] focus:outline-none focus:border-[#657b35]"
                            />
                        </div>
                        {form.type === 0 && (
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#68361c]/70">Giảm tối đa (VNĐ)</label>
                                <input
                                    type="number"
                                    min={0}
                                    step={1000}
                                    value={form.maxDiscountAmount}
                                    onChange={e => set('maxDiscountAmount', e.target.value)}
                                    placeholder="VD: 100000 (bỏ trống = không giới hạn)"
                                    className="w-full bg-white border border-[#e8ddd5] rounded px-3 py-2.5 text-sm text-[#4b2311] focus:outline-none focus:border-[#657b35]"
                                />
                            </div>
                        )}
                    </div>

                    {/* Row 4: MinOrder + UsageLimit */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#68361c]/70">Đơn hàng tối thiểu (VNĐ)</label>
                            <input
                                type="number"
                                min={0}
                                step={1000}
                                value={form.minimumOrderAmount}
                                onChange={e => set('minimumOrderAmount', e.target.value)}
                                placeholder="Bỏ trống = không yêu cầu"
                                className="w-full bg-white border border-[#e8ddd5] rounded px-3 py-2.5 text-sm text-[#4b2311] focus:outline-none focus:border-[#657b35]"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#68361c]/70">Giới hạn lượt dùng</label>
                            <input
                                type="number"
                                min={0}
                                value={form.usageLimit}
                                onChange={e => set('usageLimit', e.target.value)}
                                placeholder="Bỏ trống = không giới hạn"
                                className="w-full bg-white border border-[#e8ddd5] rounded px-3 py-2.5 text-sm text-[#4b2311] focus:outline-none focus:border-[#657b35]"
                            />
                        </div>
                    </div>

                    {/* Row 5: Date range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#68361c]/70">Ngày bắt đầu *</label>
                            <input
                                required
                                type="datetime-local"
                                value={form.startDate}
                                onChange={e => set('startDate', e.target.value)}
                                className="w-full bg-white border border-[#e8ddd5] rounded px-3 py-2.5 text-sm text-[#4b2311] focus:outline-none focus:border-[#657b35]"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#68361c]/70">Ngày kết thúc *</label>
                            <input
                                required
                                type="datetime-local"
                                value={form.endDate}
                                onChange={e => set('endDate', e.target.value)}
                                className="w-full bg-white border border-[#e8ddd5] rounded px-3 py-2.5 text-sm text-[#4b2311] focus:outline-none focus:border-[#657b35]"
                            />
                        </div>
                    </div>

                    {/* Product picker — only when scope = Product */}
                    {form.scope === 1 && (
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#68361c]/70">
                                Sản phẩm áp dụng ({form.productIds.length} đã chọn)
                                {form.productIds.length === 0 && (
                                    <span className="ml-2 text-red-500 normal-case tracking-normal font-semibold">— bắt buộc chọn ít nhất 1</span>
                                )}
                            </label>
                            <input
                                type="text"
                                placeholder="Tìm sản phẩm..."
                                value={productSearch}
                                onChange={e => setProductSearch(e.target.value)}
                                className="w-full bg-white border border-[#e8ddd5] rounded px-3 py-2 text-xs text-[#4b2311] focus:outline-none focus:border-[#657b35]"
                            />
                            <div className="max-h-44 overflow-y-auto border border-[#e8ddd5] rounded divide-y divide-[#e8ddd5]/50">
                                {filteredProducts.length === 0 ? (
                                    <p className="text-xs text-[#68361c]/50 text-center py-4">Không tìm thấy sản phẩm</p>
                                ) : filteredProducts.map(p => (
                                    <label key={p.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-[#FAF9F6] cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.productIds.includes(p.id)}
                                            onChange={() => toggleProduct(p.id)}
                                            className="accent-[#657b35]"
                                        />
                                        <span className="text-xs font-medium text-[#4b2311] truncate">{p.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </form>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#e8ddd5]/50 shrink-0">
                    <Button variant="secondary" onClick={onClose} className="!px-5 !py-2.5 !text-xs">Huỷ</Button>
                    <Button onClick={handleSubmit as any} disabled={saving} className="!px-5 !py-2.5 !text-xs">
                        {saving ? 'Đang lưu...' : (editTarget ? 'Cập nhật' : 'Tạo voucher')}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const AdminCoupons: React.FC = () => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [modalOpen, setModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Coupon | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [filterTab, setFilterTab] = useState<'all' | 'active' | 'inactive'>('all');
    const [filterScope, setFilterScope] = useState<number | ''>('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const load = async () => {
        try {
            setLoading(true);
            const [couponData, productData] = await Promise.all([
                adminApi.getAdminCoupons(),
                adminApi.getAdminProducts(),
            ]);
            setCoupons(Array.isArray(couponData) ? couponData : couponData?.data || []);
            setProducts(Array.isArray(productData) ? productData : productData?.data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        const handleOutsideClick = () => setActiveMenuId(null);
        window.addEventListener('click', handleOutsideClick);
        return () => window.removeEventListener('click', handleOutsideClick);
    }, []);

    useEffect(() => { setCurrentPage(1); }, [filterTab, filterScope, searchQuery]);

    const handleToggleActive = async (coupon: Coupon) => {
        try {
            await adminApi.updateAdminCoupon(coupon.id, {
                code: coupon.code,
                type: coupon.type,
                scope: coupon.scope,
                value: coupon.value,
                maxDiscountAmount: coupon.maxDiscountAmount,
                minimumOrderAmount: coupon.minimumOrderAmount,
                usageLimit: coupon.usageLimit,
                startDate: coupon.startDate,
                endDate: coupon.endDate,
                isActive: !coupon.isActive,
                productIds: coupon.productIds,
            });
            setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, isActive: !c.isActive } : c));
        } catch (err: any) {
            alert(`Cập nhật thất bại: ${err.message}`);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await adminApi.deleteAdminCoupon(id);
            setCoupons(prev => prev.filter(c => c.id !== id));
            setDeleteConfirm(null);
        } catch (err: any) {
            alert(`Xoá thất bại: ${err.message}`);
        }
    };

    // Filter logic (client-side)
    const filtered = coupons.filter(c => {
        const matchSearch = c.code.toLowerCase().includes(searchQuery.toLowerCase());
        const matchTab = filterTab === 'all' ? true : filterTab === 'active' ? c.isActive : !c.isActive;
        const matchScope = filterScope === '' ? true : c.scope === filterScope;
        return matchSearch && matchTab && matchScope;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const isExpired = (d: string) => new Date(d) < new Date();

    // Stats
    const totalCount = coupons.length;
    const activeCount = coupons.filter(c => c.isActive).length;
    const expiredCount = coupons.filter(c => isExpired(c.endDate)).length;
    const productScopeCount = coupons.filter(c => c.scope === 1).length;

    return (
        <div className="min-h-screen bg-[#FAF9F6] p-8 animate-slide-up">
            {/* Header */}
            <div className="sticky top-0 z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 -mx-8 -mt-8 px-8 pt-8 pb-5 mb-3 bg-[#FAF9F6] border-b border-[#e8ddd5]/50">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#4b2311] tracking-tight">Quản lý Voucher</h1>
                    <p className="text-[#68361c]/70 text-sm mt-1">Tạo và quản lý mã giảm giá, voucher khuyến mãi cho khách hàng.</p>
                </div>
                <Button onClick={() => { setEditTarget(null); setModalOpen(true); }}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Tạo voucher mới
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {[
                    { label: 'Tổng voucher', value: totalCount, color: 'text-[#4b2311]' },
                    { label: 'Đang hoạt động', value: activeCount, color: 'text-[#657b35]' },
                    { label: 'Đã hết hạn', value: expiredCount, color: 'text-red-600' },
                    { label: 'Scope sản phẩm', value: productScopeCount, color: 'text-purple-600' },
                ].map(s => (
                    <div key={s.label} className="bg-white p-5 rounded border border-[#e8ddd5]/60 shadow-sm hover:shadow-md transition-all">
                        <span className="text-[10px] font-bold text-[#68361c]/50 uppercase tracking-widest block mb-2">{s.label}</span>
                        <span className={`text-3xl font-extrabold ${s.color}`}>{s.value}</span>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2 flex-wrap">
                    {(['all', 'active', 'inactive'] as const).map(tab => (
                        <Button
                            key={tab}
                            variant={filterTab === tab ? 'primary' : 'secondary'}
                            onClick={() => setFilterTab(tab)}
                            className="!px-4 !py-2 !text-xs"
                        >
                            {tab === 'all' ? 'Tất cả' : tab === 'active' ? 'Hoạt động' : 'Tắt'}
                        </Button>
                    ))}
                    <select
                        value={filterScope}
                        onChange={e => setFilterScope(e.target.value === '' ? '' : Number(e.target.value))}
                        className="bg-white border border-[#e8ddd5]/80 rounded px-3 py-2 text-xs font-medium text-[#4b2311] focus:outline-none focus:border-[#657b35]"
                    >
                        <option value="">Tất cả phạm vi</option>
                        <option value={0}>Đơn hàng</option>
                        <option value={1}>Sản phẩm</option>
                        <option value={2}>Danh mục</option>
                    </select>
                </div>
                <div className="relative w-full sm:w-64">
                    <input
                        type="text"
                        placeholder="Tìm mã voucher..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-[#e8ddd5]/80 rounded text-xs font-medium text-[#4b2311] placeholder-[#68361c]/40 focus:outline-none focus:border-[#657b35] transition-all"
                    />
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#68361c]/40">
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </div>
                </div>
            </div>

            {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}

            {/* Table */}
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
                                    <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-widest text-[#5c5652]">Mã voucher</th>
                                    <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-widest text-[#5c5652]">Loại / Phạm vi</th>
                                    <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-widest text-[#5c5652]">Giá trị</th>
                                    <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-widest text-[#5c5652]">Lượt dùng</th>
                                    <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-widest text-[#5c5652]">Thời hạn</th>
                                    <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-widest text-[#5c5652]">Bật/Tắt</th>
                                    <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-widest text-[#5c5652] text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e8ddd5]/30">
                                {paginated.map(c => {
                                    const expired = isExpired(c.endDate);
                                    return (
                                        <tr key={c.id} className="hover:bg-[#FAF9F6]/50 transition-colors group">
                                            {/* Code */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-extrabold text-[#4b2311] tracking-widest text-xs bg-[#FAF6F0] border border-[#e8ddd5] px-2.5 py-1 rounded font-mono">
                                                        {c.code}
                                                    </span>
                                                    {expired && (
                                                        <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                                            Hết hạn
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Type / Scope */}
                                            <td className="px-5 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-bold text-[#68361c]/70">{TYPE_LABELS[c.type] ?? `Type ${c.type}`}</span>
                                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border w-fit uppercase tracking-wider ${SCOPE_COLORS[c.scope] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                                        {SCOPE_LABELS[c.scope] ?? `Scope ${c.scope}`}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Value */}
                                            <td className="px-5 py-4">
                                                <span className="font-bold text-[#4b2311] text-sm">
                                                    {c.type === 0 ? `${c.value}%` : fmtMoney(c.value)}
                                                </span>
                                                {c.maxDiscountAmount && (
                                                    <span className="block text-[10px] text-[#68361c]/60">
                                                        tối đa {fmtMoney(c.maxDiscountAmount)}
                                                    </span>
                                                )}
                                                {c.minimumOrderAmount && (
                                                    <span className="block text-[10px] text-[#68361c]/60">
                                                        đơn từ {fmtMoney(c.minimumOrderAmount)}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Usage */}
                                            <td className="px-5 py-4">
                                                <span className="text-sm font-semibold text-[#4b2311]">
                                                    {c.usageCount ?? 0}
                                                    {c.usageLimit ? ` / ${c.usageLimit}` : ' / ∞'}
                                                </span>
                                            </td>

                                            {/* Date range */}
                                            <td className="px-5 py-4">
                                                <div className="text-xs text-[#68361c]/70 space-y-0.5">
                                                    <div><span className="font-bold">Từ:</span> {fmtDate(c.startDate)}</div>
                                                    <div><span className="font-bold">Đến:</span> <span className={expired ? 'text-red-600 font-bold' : ''}>{fmtDate(c.endDate)}</span></div>
                                                </div>
                                            </td>

                                            {/* Toggle */}
                                            <td className="px-5 py-4">
                                                <button
                                                    onClick={() => handleToggleActive(c)}
                                                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${c.isActive ? 'bg-[#4b2311]' : 'bg-[#E3DBD3]'}`}
                                                >
                                                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${c.isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                                                </button>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-4 text-center">
                                                <div className="relative inline-block text-left" onClick={e => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => setActiveMenuId(activeMenuId === c.id ? null : c.id)}
                                                        className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:bg-stone-50 hover:text-stone-700 transition-all cursor-pointer focus:outline-none border-none bg-transparent"
                                                    >
                                                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                            <circle cx="12" cy="5" r="1" fill="currentColor" />
                                                            <circle cx="12" cy="12" r="1" fill="currentColor" />
                                                            <circle cx="12" cy="19" r="1" fill="currentColor" />
                                                        </svg>
                                                    </button>
                                                    {activeMenuId === c.id && (
                                                        <div className="absolute right-0 mt-1 w-24 bg-white border border-[#e8ddd5] rounded shadow-lg py-1.5 z-20 animate-slide-up">
                                                            <button
                                                                onClick={() => { setEditTarget(c); setModalOpen(true); setActiveMenuId(null); }}
                                                                className="w-full text-left px-4 py-1.5 text-xs font-bold text-[#68361c] hover:bg-[#FAF9F6] focus:outline-none border-none bg-transparent"
                                                            >Sửa</button>
                                                            <button
                                                                onClick={() => { setDeleteConfirm(c.id); setActiveMenuId(null); }}
                                                                className="w-full text-left px-4 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 focus:outline-none border-none bg-transparent"
                                                            >Xoá</button>
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

                    {filtered.length === 0 && (
                        <div className="py-20 text-center flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center border border-[#e8ddd5]/30 mb-3 text-[#68361c]/40">
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l-4-4 4-4M15 10h6M3 12h6" />
                                </svg>
                            </div>
                            <span className="text-sm font-bold text-[#4b2311]">Không tìm thấy voucher nào</span>
                            <span className="text-xs text-[#68361c]/50 mt-1">Thử thay đổi bộ lọc hoặc tạo voucher mới.</span>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 bg-[#FAF7F5] border-t border-[#e8ddd5]/40 flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#888079]">
                                Hiển thị {((currentPage - 1) * itemsPerPage) + 1}–{Math.min(currentPage * itemsPerPage, filtered.length)} / {filtered.length}
                            </span>
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="w-8 h-8 flex items-center justify-center border border-[#e8ddd5]/60 bg-white rounded text-[#68361c]/60 hover:bg-stone-50 disabled:opacity-50 transition-all cursor-pointer"
                                >
                                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                                    </svg>
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-8 h-8 rounded text-xs font-bold transition-all cursor-pointer ${currentPage === page ? 'bg-[#20150E] text-white' : 'border border-[#e8ddd5]/60 bg-white text-[#68361c]/60 hover:bg-stone-50'}`}
                                    >{page}</button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="w-8 h-8 flex items-center justify-center border border-[#e8ddd5]/60 bg-white rounded text-[#68361c]/60 hover:bg-stone-50 disabled:opacity-50 transition-all cursor-pointer"
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

            {/* Coupon Modal */}
            <CouponModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                editTarget={editTarget}
                products={products}
                onSaveSuccess={load}
            />

            {/* Delete Confirm */}
            <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} zIndex={50}>
                {deleteConfirm && (
                    <div className="bg-white rounded w-full max-w-sm shadow-2xl p-6 border border-[#e8ddd5]/50 animate-slide-up">
                        <div className="w-12 h-12 rounded bg-red-50 flex items-center justify-center text-red-600 mb-4">
                            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        </div>
                        <h2 className="text-base font-extrabold text-[#4b2311] mb-1.5">Xác nhận xoá voucher</h2>
                        <p className="text-[#68361c]/70 text-xs mb-5 leading-relaxed">
                            Voucher sẽ bị tắt (soft delete). Bạn có thể bật lại sau. Tiếp tục?
                        </p>
                        <div className="flex justify-end gap-3">
                            <Button variant="secondary" onClick={() => setDeleteConfirm(null)} className="!px-4 !py-2 !text-xs">Huỷ</Button>
                            <Button variant="danger" onClick={() => handleDelete(deleteConfirm)} className="!px-4 !py-2 !text-xs">Xoá</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminCoupons;
