import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as adminApi from '@/services/api/admin';
import { Button } from '@/components/common/Button';

interface Category { id: string; name: string; }
interface Product { id: string; name: string; }
interface Order { id: string; status: string; totalAmount?: number; createdAt?: string; }

const AdminDashboard: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.allSettled([
            adminApi.getAdminOrders(),
            adminApi.getAdminProducts(),
            adminApi.getAdminCategories(),
        ]).then(([ordersRes, productsRes, categoriesRes]) => {
            if (ordersRes.status === 'fulfilled') setOrders(Array.isArray(ordersRes.value) ? ordersRes.value : ordersRes.value?.data || []);
            if (productsRes.status === 'fulfilled') setProducts(Array.isArray(productsRes.value) ? productsRes.value : productsRes.value?.data || []);
            if (categoriesRes.status === 'fulfilled') setCategories(Array.isArray(categoriesRes.value) ? categoriesRes.value : categoriesRes.value?.data || []);
            setLoading(false);
        });
    }, []);

    // Deterministic status styling
    const getStatusStyle = (status: string) => {
        const s = status?.toLowerCase() || '';
        if (s.includes('completed') || s.includes('giao') || s.includes('thành công')) {
            return 'bg-green-50 text-green-700 border-green-200/50';
        }
        if (s.includes('pending') || s.includes('chờ') || s.includes('xử lý')) {
            return 'bg-amber-50 text-amber-700 border-amber-200/50';
        }
        if (s.includes('cancelled') || s.includes('huỷ')) {
            return 'bg-red-50 text-red-700 border-red-200/50';
        }
        return 'bg-[#FAF6F0] text-[#888079] border-[#e8ddd5]/20';
    };

    const getStatusText = (status: string) => {
        const s = status?.toLowerCase() || '';
        if (s.includes('completed')) return 'Đã hoàn thành';
        if (s.includes('pending')) return 'Chờ xử lý';
        if (s.includes('cancelled')) return 'Đã huỷ';
        return status || 'Mới';
    };

    return (
        <div className="min-h-screen bg-[#FAF9F6] p-8 animate-slide-up">
            {/* Header section */}
            <div className="sticky top-0 z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 -mx-8 -mt-8 px-8 pt-8 pb-5 mb-3 bg-[#FAF9F6] border-b border-[#e8ddd5]/50">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#4b2311] tracking-tight">Tổng quan quản trị</h1>
                    <p className="text-[#68361c]/70 text-sm mt-1">Chào mừng trở lại! Xem hiệu suất hoạt động, đơn hàng gần đây và quản lý kho hàng của bạn.</p>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                <div className="bg-white p-5 rounded border border-[#e8ddd5]/60 shadow-sm transition-all hover:shadow-md">
                    <span className="text-[10px] font-bold text-[#68361c]/50 uppercase tracking-widest block mb-2">Tổng số đơn hàng</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-[#4b2311]">{loading ? '—' : orders.length}</span>
                        <span className="text-xs font-semibold text-stone-400">hoá đơn</span>
                    </div>
                </div>
                <div className="bg-white p-5 rounded border border-[#e8ddd5]/60 shadow-sm transition-all hover:shadow-md">
                    <span className="text-[10px] font-bold text-[#68361c]/50 uppercase tracking-widest block mb-2">Tổng số sản phẩm</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-[#925f3c]">{loading ? '—' : products.length}</span>
                        <span className="text-xs font-semibold text-stone-400">mặt hàng</span>
                    </div>
                </div>
                <div className="bg-white p-5 rounded border border-[#e8ddd5]/60 shadow-sm transition-all hover:shadow-md">
                    <span className="text-[10px] font-bold text-[#68361c]/50 uppercase tracking-widest block mb-2">Danh mục hoạt động</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-[#657b35]">{loading ? '—' : categories.length}</span>
                        <span className="text-xs font-semibold text-stone-400">phân loại</span>
                    </div>
                </div>
            </div>

            {/* Quick Actions Row */}
            <div className="mb-10">
                <h2 className="text-xs font-bold text-[#68361c]/50 uppercase tracking-widest mb-4">Lối tắt thao tác nhanh</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {[
                        { to: '/admin/orders', label: 'Xem đơn hàng', desc: 'Kiểm tra, cập nhật trạng thái đơn hàng & in hóa đơn', actionText: 'Quản lý đơn hàng', color: 'border-l-[#657b35] hover:border-l-4' },
                        { to: '/admin/products', label: 'Quản lý kho hàng', desc: 'Thêm mới, cập nhật giá, tồn kho & cá nhân hoá sản phẩm', actionText: 'Vào kho sản phẩm', color: 'border-l-[#925f3c] hover:border-l-4' },
                        { to: '/admin/categories', label: 'Tổ chức danh mục', desc: 'Cấu hình đường dẫn slug & nhóm các sản phẩm đặc trưng', actionText: 'Chỉnh sửa danh mục', color: 'border-l-[#68361c] hover:border-l-4' },
                    ].map((action) => (
                        <div key={action.to} className={`bg-white rounded border border-[#e8ddd5]/60 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${action.color} border-l-2`}>
                            <div>
                                <h3 className="font-extrabold text-[#4b2311] text-sm leading-snug">{action.label}</h3>
                                <p className="text-[#68361c]/60 text-xs mt-1.5 leading-relaxed">{action.desc}</p>
                            </div>
                            <div className="mt-5">
                                <Link to={action.to}>
                                    <Button variant="secondary" className="!w-full !justify-center !text-xs !py-2">
                                        {action.actionText}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Orders Preview */}
            {!loading && orders.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xs font-bold text-[#68361c]/50 uppercase tracking-widest">Đơn hàng mới nhận gần đây</h2>
                        <Link to="/admin/orders" className="text-xs font-bold text-[#657b35] hover:text-[#4b2311] transition-colors flex items-center gap-1.5">
                            Xem tất cả hoá đơn
                            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </Link>
                    </div>

                    <div className="bg-white rounded border border-[#e8ddd5]/60 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#FAF7F5] border-b border-[#e8ddd5]/40">
                                        <th className="px-6 py-4 text-[#5c5652] tracking-wider font-bold text-[11px] uppercase tracking-widest w-[20%]">Mã đơn hàng</th>
                                        <th className="px-6 py-4 text-[#5c5652] tracking-wider font-bold text-[11px] uppercase tracking-widest w-[30%]">Thời gian lập</th>
                                        <th className="px-6 py-4 text-[#5c5652] tracking-wider font-bold text-[11px] uppercase tracking-widest w-[25%]">Trạng thái giao nhận</th>
                                        <th className="px-6 py-4 text-[#5c5652] tracking-wider font-bold text-[11px] uppercase tracking-widest w-[15%] text-right">Tổng thanh toán</th>
                                        <th className="px-6 py-4 text-[#5c5652] tracking-wider font-bold text-[11px] uppercase tracking-widest w-[10%] text-center">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#e8ddd5]/30">
                                    {orders.slice(0, 5).map((order) => (
                                        <tr key={order.id} className="hover:bg-[#FAF9F6]/50 transition-colors group">
                                            {/* Order ID */}
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-[#888079] font-bold text-xs tracking-wider group-hover:text-[#657b35] transition-colors">
                                                    #{order.id?.slice(0, 8).toUpperCase()}
                                                </span>
                                            </td>

                                            {/* Created At Date */}
                                            <td className="px-6 py-4 text-xs font-medium text-[#888079]">
                                                {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN', {
                                                    year: 'numeric', month: '2-digit', day: '2-digit',
                                                    hour: '2-digit', minute: '2-digit'
                                                }) : '—'}
                                            </td>

                                            {/* Status Badge */}
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider border ${getStatusStyle(order.status)}`}>
                                                    {getStatusText(order.status)}
                                                </span>
                                            </td>

                                            {/* Total amount formatted */}
                                            <td className="px-6 py-4 text-right text-xs font-bold text-[#4b2311]">
                                                {order.totalAmount ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount) : '—'}
                                            </td>

                                            {/* Detail Link Button */}
                                            <td className="px-6 py-4 text-center">
                                                <Link to="/admin/orders">
                                                    <Button variant="secondary" className="!px-3.5 !py-1 !text-[10px] !font-bold">
                                                        Chi tiết
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
