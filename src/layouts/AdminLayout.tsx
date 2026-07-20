import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

const AdminLayout: React.FC = () => {
    const { user, isAdmin, isStaff, logout } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleLogout = async () => {
        await logout();
        showToast('Đăng xuất thành công!', 'success');
        navigate('/');
    };

    const navLink = ({ isActive }: { isActive: boolean }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded text-sm font-semibold transition-all duration-150 ${
            isActive
                ? 'bg-[#657b35] text-white'
                : 'text-[#68361c] hover:bg-[#f0ebe4] hover:text-[#4b2311]'
        }`;

    return (
        <div className="flex h-screen overflow-hidden bg-[#f7f4f0] font-sans">
            {/* Sidebar */}
            <aside
                className={`flex flex-col bg-white shadow-sm transition-all duration-300 ${
                    sidebarOpen ? 'w-56' : 'w-14'
                }`}
            >
                {/* Logo + toggle */}
                <div className={`flex items-center py-5 px-3 ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
                    {sidebarOpen && (
                        <img src="/logo.svg" alt="RE:CAFÉ" className="h-12 w-auto pl-2" />
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="bg-transparent text-[#925f3c] hover:text-[#4b2311] transition-colors outline-none"
                        style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                        aria-label="Toggle sidebar"
                    >
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-2 space-y-0.5">
                    {isAdmin && (
                        <NavLink to="/admin" end className={navLink}>
                            <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0">
                                <rect x="3" y="3" width="7" height="7" rx="1" />
                                <rect x="14" y="3" width="7" height="7" rx="1" />
                                <rect x="3" y="14" width="7" height="7" rx="1" />
                                <rect x="14" y="14" width="7" height="7" rx="1" />
                            </svg>
                            {sidebarOpen && <span>Dashboard</span>}
                        </NavLink>
                    )}

                    <NavLink to="/admin/orders" className={navLink}>
                        <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0">
                            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                            <rect x="9" y="3" width="6" height="4" rx="1" />
                            <line x1="9" y1="12" x2="15" y2="12" />
                            <line x1="9" y1="16" x2="13" y2="16" />
                        </svg>
                        {sidebarOpen && <span>Đơn hàng</span>}
                    </NavLink>

                    {isAdmin && (
                        <NavLink to="/admin/reviews" className={navLink}>
                            <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0">
                                <path d="M20 12a8 8 0 11-2.34-5.66" />
                                <path d="M20 4v5h-5" />
                                <path d="M8.5 12.5l2.2 2.2 4.8-5" />
                            </svg>
                            {sidebarOpen && <span>Đánh giá</span>}
                        </NavLink>
                    )}

                    {isAdmin && (
                        <>
                            <NavLink to="/admin/products" className={navLink}>
                                <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0">
                                    <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
                                    <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                                </svg>
                                {sidebarOpen && <span>Sản phẩm</span>}
                            </NavLink>

                            <NavLink to="/admin/categories" className={navLink}>
                                <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0">
                                    <path d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                                {sidebarOpen && <span>Danh mục</span>}
                            </NavLink>

                            <NavLink to="/admin/users" className={navLink}>
                                <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0">
                                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                                </svg>
                                {sidebarOpen && <span>Người dùng</span>}
                            </NavLink>

                            <NavLink to="/admin/coupons" className={navLink}>
                                <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0">
                                    <path d="M9 14l-4-4 4-4" />
                                    <path d="M15 10h6" />
                                    <path strokeLinecap="round" d="M3 12h6" />
                                    <rect x="2" y="5" width="20" height="14" rx="2" />
                                    <circle cx="8" cy="12" r="1" fill="currentColor" />
                                    <line x1="12" y1="8" x2="18" y2="16" strokeLinecap="round" />
                                </svg>
                                {sidebarOpen && <span>Voucher</span>}
                            </NavLink>
                        </>
                    )}
                </nav>

                {/* User footer */}
                <div className="px-2 py-4 space-y-1">
                    {/* Avatar + name */}
                    <div className={`flex items-center gap-2.5 px-3 py-2 ${!sidebarOpen && 'justify-center'}`}>
                        <div className="w-7 h-7 rounded-full bg-[#657b35] flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {user?.username?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        {sidebarOpen && (
                            <div className="min-w-0">
                                <p className="text-[#4b2311] text-xs font-semibold truncate">{user?.username}</p>
                                <p className="text-[#925f3c] text-xs truncate">{user?.role}</p>
                            </div>
                        )}
                    </div>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded bg-transparent text-sm font-semibold text-[#68361c] hover:bg-[#f0ebe4] hover:text-[#4b2311] transition-colors outline-none ${!sidebarOpen && 'justify-center'}`}
                        style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                    >
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0">
                            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        {sidebarOpen && <span>Đăng xuất</span>}
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-auto bg-[#f7f4f0]">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
