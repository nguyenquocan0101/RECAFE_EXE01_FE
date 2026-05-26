import React, { useEffect, useState } from 'react';
import * as adminApi from '@/services/api/admin';

// UserRole: 0 = Customer, 1 = Staff, 2 = Admin
const ROLE_LABELS: Record<number, string> = { 0: 'Khách hàng', 1: 'Nhân viên', 2: 'Admin' };
const ROLES = [0, 1, 2];

const parseRole = (role: any): number => {
    if (role === 'Admin' || role === 2 || role === '2') return 2;
    if (role === 'Staff' || role === 1 || role === '1') return 1;
    return 0; // Customer
};

const roleColor: Record<number, string> = {
    0: 'bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]/50',
    1: 'bg-[#e0e7ff] text-[#3730a3] border border-[#c7d2fe]/50',
    2: 'bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]/50',
};

const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState<string | null>(null);

    // Search & Filter
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState<'all' | number>('all');
    const [filterActive, setFilterActive] = useState<'all' | boolean>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Modal
    const [editingUser, setEditingUser] = useState<any | null>(null);
    const [form, setForm] = useState<{ email: string; fullName: string; phone: string; birthday: string; role: number; isActive: boolean }>({
        email: '', fullName: '', phone: '', birthday: '', role: 0, isActive: true
    });
    const [formError, setFormError] = useState<string | null>(null);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getAdminUsers();
            const rawUsers = Array.isArray(data) ? data : data?.data || [];
            const mappedUsers = rawUsers.map((u: any) => ({
                ...u,
                role: parseRole(u.role)
            }));
            setUsers(mappedUsers);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadUsers(); }, []);

    // Reset page on filter change
    useEffect(() => { setCurrentPage(1); }, [searchQuery, filterRole, filterActive]);

    // Filter logic
    const filteredUsers = users.filter(u => {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
            (u.fullName || '').toLowerCase().includes(q) ||
            (u.email || '').toLowerCase().includes(q) ||
            (u.username || '').toLowerCase().includes(q) ||
            (u.phone || '').toLowerCase().includes(q);

        const matchesRole = filterRole === 'all' ? true : u.role === filterRole;
        const matchesActive = filterActive === 'all' ? true : u.isActive === filterActive;

        return matchesSearch && matchesRole && matchesActive;
    });

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginated = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Stats
    const totalCount = users.length;
    const activeCount = users.filter(u => u.isActive).length;
    const adminCount = users.filter(u => u.role === 2).length;
    const staffCount = users.filter(u => u.role === 1).length;

    // Toggle Active (quick action)
    const handleToggleActive = async (user: any) => {
        setSaving(user.id);
        try {
            await adminApi.setUserActive(user.id, !user.isActive);
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u));
        } catch (err: any) {
            alert(`Lỗi: ${err.message}`);
        } finally {
            setSaving(null);
        }
    };

    // Open edit modal
    const openEdit = (user: any) => {
        setEditingUser(user);
        setFormError(null);
        setForm({
            email: user.email || '',
            fullName: user.fullName || '',
            phone: user.phone || '',
            birthday: user.birthday ? user.birthday.slice(0, 10) : '',
            role: parseRole(user.role),
            isActive: user.isActive ?? true,
        });
    };

    // Save edit
    const handleSave = async () => {
        if (!editingUser) return;
        if (!form.email.trim() || !form.fullName.trim()) {
            setFormError('Email và Họ tên là bắt buộc.');
            return;
        }
        setSaving(editingUser.id);
        setFormError(null);
        try {
            await adminApi.updateAdminUser(editingUser.id, {
                email: form.email,
                fullName: form.fullName,
                phone: form.phone || undefined,
                birthday: form.birthday ? new Date(form.birthday).toISOString() : null,
                role: parseRole(form.role),
                isActive: form.isActive,
            });
            setUsers(prev => prev.map(u =>
                u.id === editingUser.id
                    ? {
                        ...u,
                        email: form.email,
                        fullName: form.fullName,
                        phone: form.phone || null,
                        birthday: form.birthday || null,
                        role: parseRole(form.role),
                        isActive: form.isActive,
                    }
                    : u
            ));
            setEditingUser(null);
        } catch (err: any) {
            setFormError(err.message);
        } finally {
            setSaving(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAF9F6] p-8 animate-slide-up">
            {/* Header */}
            <div className="sticky top-0 z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 -mx-8 -mt-8 px-8 pt-8 pb-5 mb-3 bg-[#FAF9F6] border-b border-[#e8ddd5]/50">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#4b2311] tracking-tight">Quản lý người dùng</h1>
                    <p className="text-[#68361c]/70 text-sm mt-1">
                        Xem, chỉnh sửa thông tin và quyền hạn của tất cả tài khoản trong hệ thống.
                    </p>
                </div>
                <button
                    onClick={loadUsers}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e8ddd5] rounded text-[#4b2311] text-xs font-semibold hover:bg-[#FAF6F0] shadow-sm transition-all cursor-pointer"
                >
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                    </svg>
                    Làm mới danh sách
                </button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <div className="bg-white p-5 rounded border border-[#e8ddd5]/60 shadow-sm hover:shadow-md transition-all">
                    <span className="text-[10px] font-bold text-[#68361c]/50 uppercase tracking-widest block mb-2">Tổng tài khoản</span>
                    <span className="text-3xl font-extrabold text-[#4b2311]">{totalCount}</span>
                </div>
                <div className="bg-white p-5 rounded border border-[#e8ddd5]/60 shadow-sm hover:shadow-md transition-all">
                    <span className="text-[10px] font-bold text-[#68361c]/50 uppercase tracking-widest block mb-2">Đang hoạt động</span>
                    <span className="text-3xl font-extrabold text-[#657b35]">{activeCount}</span>
                </div>
                <div className="bg-white p-5 rounded border border-[#e8ddd5]/60 shadow-sm hover:shadow-md transition-all">
                    <span className="text-[10px] font-bold text-[#68361c]/50 uppercase tracking-widest block mb-2">Nhân viên</span>
                    <span className="text-3xl font-extrabold text-[#3730a3]">{staffCount}</span>
                </div>
                <div className="bg-white p-5 rounded border border-[#e8ddd5]/60 shadow-sm hover:shadow-md transition-all">
                    <span className="text-[10px] font-bold text-[#68361c]/50 uppercase tracking-widest block mb-2">Admin</span>
                    <span className="text-3xl font-extrabold text-[#065f46]">{adminCount}</span>
                </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                {/* Role tabs */}
                <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                    <button
                        onClick={() => setFilterRole('all')}
                        className={`px-3.5 py-2 text-xs font-bold rounded transition-all border cursor-pointer ${filterRole === 'all' ? 'bg-[#20150E] text-white border-[#20150E]' : 'bg-white text-[#68361c]/70 border-[#e8ddd5] hover:bg-[#FAF6F0]'}`}
                    >
                        Tất cả
                    </button>
                    {ROLES.map(r => (
                        <button
                            key={r}
                            onClick={() => setFilterRole(r)}
                            className={`px-3.5 py-2 text-xs font-bold rounded transition-all border cursor-pointer ${filterRole === r ? 'bg-[#20150E] text-white border-[#20150E]' : 'bg-white text-[#68361c]/70 border-[#e8ddd5] hover:bg-[#FAF6F0]'}`}
                        >
                            {ROLE_LABELS[r]}
                        </button>
                    ))}
                    <div className="w-px h-5 bg-[#e8ddd5] mx-1" />
                    <button
                        onClick={() => setFilterActive(filterActive === true ? 'all' : true)}
                        className={`px-3.5 py-2 text-xs font-bold rounded transition-all border cursor-pointer ${filterActive === true ? 'bg-[#657b35] text-white border-[#657b35]' : 'bg-white text-[#68361c]/70 border-[#e8ddd5] hover:bg-[#FAF6F0]'}`}
                    >
                        Đang hoạt động
                    </button>
                    <button
                        onClick={() => setFilterActive(filterActive === false ? 'all' : false)}
                        className={`px-3.5 py-2 text-xs font-bold rounded transition-all border cursor-pointer ${filterActive === false ? 'bg-[#991b1b] text-white border-[#991b1b]' : 'bg-white text-[#68361c]/70 border-[#e8ddd5] hover:bg-[#FAF6F0]'}`}
                    >
                        Đã khóa
                    </button>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-64">
                    <input
                        type="text"
                        placeholder="Tìm tên, email, số điện thoại..."
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
                                    <th className="px-6 py-4 text-[#5c5652] font-bold text-[11px] uppercase tracking-widest w-[22%]">Họ tên</th>
                                    <th className="px-6 py-4 text-[#5c5652] font-bold text-[11px] uppercase tracking-widest w-[22%]">Email</th>
                                    <th className="px-6 py-4 text-[#5c5652] font-bold text-[11px] uppercase tracking-widest w-[14%]">Điện thoại</th>
                                    <th className="px-6 py-4 text-[#5c5652] font-bold text-[11px] uppercase tracking-widest w-[12%]">Vai trò</th>
                                    <th className="px-6 py-4 text-[#5c5652] font-bold text-[11px] uppercase tracking-widest w-[12%]">Trạng thái</th>
                                    <th className="px-6 py-4 text-[#5c5652] font-bold text-[11px] uppercase tracking-widest w-[18%] text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e8ddd5]/30">
                                {paginated.map(user => (
                                    <tr key={user.id} className="hover:bg-[#FAF9F6]/50 transition-colors group">
                                        {/* Full Name */}
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[#657b35]/10 border border-[#e8ddd5]/60 flex items-center justify-center text-[#657b35] font-black text-xs shrink-0">
                                                    {(user.fullName || user.username || '?').charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="font-semibold text-[#2d2825] text-sm leading-snug group-hover:text-[#657b35] transition-colors block truncate">
                                                        {user.fullName || user.username || '—'}
                                                    </span>
                                                    {user.username && user.fullName && (
                                                        <span className="text-[10px] text-[#888079] font-normal">@{user.username}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Email */}
                                        <td className="px-6 py-5">
                                            <span className="text-[#68361c]/80 font-medium text-xs truncate block max-w-[200px]">{user.email || '—'}</span>
                                        </td>

                                        {/* Phone */}
                                        <td className="px-6 py-5">
                                            <span className="font-mono text-xs text-[#888079]">{user.phone || '—'}</span>
                                        </td>

                                        {/* Role Badge */}
                                        <td className="px-6 py-5">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${roleColor[Number(user.role)] ?? 'bg-stone-100 text-stone-600'}`}>
                                                {ROLE_LABELS[Number(user.role)] ?? `Role ${user.role}`}
                                            </span>
                                        </td>

                                        {/* Active Status */}
                                        <td className="px-6 py-5">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${user.isActive ? 'bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]/50' : 'bg-[#fef2f2] text-[#991b1b] border border-[#fecaca]/50'}`}>
                                                {user.isActive ? 'Hoạt động' : 'Đã khóa'}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-center gap-2">
                                                {/* Edit */}
                                                <button
                                                    onClick={() => openEdit(user)}
                                                    title="Chỉnh sửa"
                                                    className="h-8 px-3 flex items-center gap-1.5 text-[10px] font-bold text-[#4b2311] bg-[#FAF6F0] border border-[#e8ddd5] rounded hover:bg-[#f0e9de] transition-all cursor-pointer"
                                                >
                                                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                    </svg>
                                                    Sửa
                                                </button>

                                                {/* Toggle Active */}
                                                <button
                                                    onClick={() => handleToggleActive(user)}
                                                    disabled={saving === user.id}
                                                    title={user.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                                                    className={`h-8 px-3 flex items-center gap-1.5 text-[10px] font-bold rounded border transition-all cursor-pointer disabled:opacity-50 ${user.isActive
                                                        ? 'text-[#991b1b] bg-[#fef2f2] border-[#fecaca]/60 hover:bg-red-100'
                                                        : 'text-[#065f46] bg-[#ecfdf5] border-[#a7f3d0]/60 hover:bg-green-100'
                                                    }`}
                                                >
                                                    {saving === user.id ? (
                                                        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                            {user.isActive
                                                                ? <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></>
                                                                : <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 019.9-1" /></>
                                                            }
                                                        </svg>
                                                    )}
                                                    {user.isActive ? 'Khóa' : 'Mở khóa'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Empty Fallback */}
                    {filteredUsers.length === 0 && (
                        <div className="py-20 text-center flex flex-col items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center border border-[#e8ddd5]/30 mb-3 text-[#68361c]/40">
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                </svg>
                            </div>
                            <span className="text-sm font-bold text-[#4b2311]">Không tìm thấy người dùng nào</span>
                            <span className="text-xs text-[#68361c]/50 mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</span>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 bg-[#FAF7F5] border-t border-[#e8ddd5]/40 flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#888079]">
                                Hiển thị {((currentPage - 1) * itemsPerPage) + 1} đến {Math.min(currentPage * itemsPerPage, filteredUsers.length)} trong {filteredUsers.length} kết quả
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
                                    >
                                        {page}
                                    </button>
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

            {/* Edit User Modal */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#4b2311]/50 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl border border-[#eaddd2] w-full max-w-md max-h-[90vh] shadow-[0_20px_50px_rgba(75,35,17,0.15)] flex flex-col overflow-hidden animate-scale-up my-auto">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eaddd2]/40 bg-stone-50/50 shrink-0">
                            <div>
                                <h3 className="text-base font-bold text-[#4b2311] tracking-tight">Chỉnh sửa người dùng</h3>
                                <p className="text-[11px] text-[#68361c]/60 font-semibold mt-0.5">@{editingUser.username || editingUser.id?.slice(0, 8)}</p>
                            </div>
                            <button
                                onClick={() => setEditingUser(null)}
                                className="w-8 h-8 rounded-full border border-[#eaddd2] text-[#68361c] hover:bg-neutral-100 flex items-center justify-center transition-colors cursor-pointer text-sm bg-transparent focus:outline-none"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-4 overflow-y-auto">
                            {formError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-xs font-semibold">{formError}</div>
                            )}

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-[#68361c]/50 uppercase tracking-widest block">Họ và tên <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={form.fullName}
                                    onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                                    placeholder="Nguyễn Văn A"
                                    className="w-full px-3 py-2 border border-[#e8ddd5] rounded text-sm text-[#4b2311] bg-white focus:outline-none focus:border-[#657b35] transition-all font-medium"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-[#68361c]/50 uppercase tracking-widest block">Email <span className="text-red-500">*</span></label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                    placeholder="example@recafe.vn"
                                    className="w-full px-3 py-2 border border-[#e8ddd5] rounded text-sm text-[#4b2311] bg-white focus:outline-none focus:border-[#657b35] transition-all font-medium"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-[#68361c]/50 uppercase tracking-widest block">Điện thoại</label>
                                    <input
                                        type="text"
                                        value={form.phone}
                                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                        placeholder="0901234567"
                                        className="w-full px-3 py-2 border border-[#e8ddd5] rounded text-sm text-[#4b2311] bg-white focus:outline-none focus:border-[#657b35] transition-all font-medium"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-[#68361c]/50 uppercase tracking-widest block">Ngày sinh</label>
                                    <input
                                        type="date"
                                        value={form.birthday}
                                        onChange={e => setForm(f => ({ ...f, birthday: e.target.value }))}
                                        className="w-full px-3 py-2 border border-[#e8ddd5] rounded text-sm text-[#4b2311] bg-white focus:outline-none focus:border-[#657b35] transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-[#68361c]/50 uppercase tracking-widest block">Vai trò <span className="text-red-500">*</span></label>
                                    <select
                                        value={form.role}
                                        onChange={e => setForm(f => ({ ...f, role: Number(e.target.value) }))}
                                        className="w-full px-3 py-2 border border-[#e8ddd5] rounded text-sm text-[#4b2311] bg-white focus:outline-none focus:border-[#657b35] transition-all font-bold cursor-pointer"
                                    >
                                        {ROLES.map(r => (
                                            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-[#68361c]/50 uppercase tracking-widest block">Trạng thái</label>
                                    <select
                                        value={form.isActive ? 'true' : 'false'}
                                        onChange={e => setForm(f => ({ ...f, isActive: e.target.value === 'true' }))}
                                        className="w-full px-3 py-2 border border-[#e8ddd5] rounded text-sm text-[#4b2311] bg-white focus:outline-none focus:border-[#657b35] transition-all font-bold cursor-pointer"
                                    >
                                        <option value="true">Hoạt động</option>
                                        <option value="false">Đã khóa</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-[#eaddd2]/40 bg-stone-50/50 flex items-center justify-end gap-2.5 shrink-0">
                            <button
                                onClick={() => setEditingUser(null)}
                                className="px-5 py-2 text-xs font-bold text-[#68361c] bg-white border border-[#e8ddd5] rounded hover:bg-[#FAF6F0] transition-all cursor-pointer"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving === editingUser.id}
                                className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#657b35] hover:bg-[#4b5e26] rounded border-none transition-all cursor-pointer disabled:opacity-60 shadow-sm"
                            >
                                {saving === editingUser.id && (
                                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                )}
                                Lưu thay đổi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
