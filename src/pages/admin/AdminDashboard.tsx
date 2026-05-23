import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as adminApi from '@/services/api/admin';

interface StatCard {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
}

const AdminDashboard: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.allSettled([
            adminApi.getAdminOrders(),
            adminApi.getProducts(),
            adminApi.getCategories(),
        ]).then(([ordersRes, productsRes, categoriesRes]) => {
            if (ordersRes.status === 'fulfilled') setOrders(Array.isArray(ordersRes.value) ? ordersRes.value : ordersRes.value?.data || []);
            if (productsRes.status === 'fulfilled') setProducts(Array.isArray(productsRes.value) ? productsRes.value : productsRes.value?.data || []);
            if (categoriesRes.status === 'fulfilled') setCategories(Array.isArray(categoriesRes.value) ? categoriesRes.value : categoriesRes.value?.data || []);
            setLoading(false);
        });
    }, []);

    const stats: StatCard[] = [
        {
            label: 'Tổng đơn hàng',
            value: loading ? '—' : orders.length,
            color: 'bg-[#657b35]',
            icon: (
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                    <rect x="9" y="3" width="6" height="4" rx="1" />
                </svg>
            ),
        },
        {
            label: 'Sản phẩm',
            value: loading ? '—' : products.length,
            color: 'bg-[#925f3c]',
            icon: (
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
                    <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                </svg>
            ),
        },
        {
            label: 'Danh mục',
            value: loading ? '—' : categories.length,
            color: 'bg-[#68361c]',
            icon: (
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            ),
        },
    ];

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-[32px] font-bold text-[#4b2311] leading-tight">Dashboard</h1>
                <p className="text-[#68361c] text-sm mt-1">Chào mừng trở lại! Đây là tổng quan hoạt động.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm border border-[#e8ddd5] flex items-center gap-4">
                        <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-[#68361c] text-xs font-semibold uppercase tracking-widest">{stat.label}</p>
                            <p className="text-[#4b2311] text-3xl font-bold">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick actions */}
            <div className="mb-8">
                <h2 className="text-xl font-bold text-[#4b2311] mb-4">Thao tác nhanh</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { to: '/admin/orders', label: 'Xem đơn hàng', desc: 'Quản lý và cập nhật trạng thái', color: 'border-[#657b35] hover:bg-[#657b35]' },
                        { to: '/admin/products', label: 'Quản lý sản phẩm', desc: 'Thêm, sửa, xoá sản phẩm', color: 'border-[#925f3c] hover:bg-[#925f3c]' },
                        { to: '/admin/categories', label: 'Quản lý danh mục', desc: 'Tổ chức danh mục sản phẩm', color: 'border-[#68361c] hover:bg-[#68361c]' },
                    ].map((action) => (
                        <Link
                            key={action.to}
                            to={action.to}
                            className={`group block bg-white border-2 ${action.color} rounded-xl p-5 transition-all duration-200 hover:text-white hover:shadow-md hover:scale-[1.02]`}
                        >
                            <p className="font-bold text-[#4b2311] group-hover:text-white transition-colors">{action.label}</p>
                            <p className="text-[#68361c] text-xs mt-1 group-hover:text-white/80 transition-colors">{action.desc}</p>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Recent orders preview */}
            {orders.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-[#4b2311]">Đơn hàng gần đây</h2>
                        <Link to="/admin/orders" className="text-[#657b35] text-sm font-semibold hover:underline">
                            Xem tất cả →
                        </Link>
                    </div>
                    <div className="bg-white rounded-xl border border-[#e8ddd5] overflow-hidden shadow-sm">
                        <table className="w-full text-sm">
                            <thead className="bg-[#f5f0eb]">
                                <tr>
                                    <th className="text-left px-5 py-3 text-[#68361c] font-semibold text-xs uppercase tracking-wider">ID</th>
                                    <th className="text-left px-5 py-3 text-[#68361c] font-semibold text-xs uppercase tracking-wider">Trạng thái</th>
                                    <th className="text-right px-5 py-3 text-[#68361c] font-semibold text-xs uppercase tracking-wider">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#f0e8e0]">
                                {orders.slice(0, 5).map((order: any) => (
                                    <tr key={order.id} className="hover:bg-[#faf8f6] transition-colors">
                                        <td className="px-5 py-3 text-[#4b2311] font-mono text-xs">{order.id?.slice(0, 8)}…</td>
                                        <td className="px-5 py-3">
                                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-[#657b35]/10 text-[#657b35]">
                                                {order.status || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <Link to="/admin/orders" className="text-[#657b35] font-semibold hover:underline text-xs">
                                                Chi tiết
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
