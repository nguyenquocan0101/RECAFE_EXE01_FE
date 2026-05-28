import React, { useEffect, useState } from 'react';
import * as adminApi from '@/services/api/admin';
import { Modal } from '@/components/common/Modal';

const ORDER_STATUSES = ['Pending', 'Confirmed', 'Preparing', 'Shipping', 'Completed', 'Cancelled', 'Returned'];

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
    Pending: ['Confirmed', 'Cancelled'],
    Confirmed: ['Preparing', 'Cancelled'],
    Preparing: ['Shipping', 'Cancelled'],
    Shipping: ['Completed', 'Returned'],
    Completed: [],
    Cancelled: [],
    Returned: [],
};

const statusColor: Record<string, string> = {
    Pending: 'bg-[#fef3c7] text-[#b45309] border border-[#fde68a]/50',
    Confirmed: 'bg-[#e0e7ff] text-[#3730a3] border border-[#c7d2fe]/50',
    Preparing: 'bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]/50',
    Shipping: 'bg-[#f3e8ff] text-[#6b21a8] border border-[#e9d5ff]/50',
    Completed: 'bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]/50',
    Cancelled: 'bg-[#fef2f2] text-[#991b1b] border border-[#fecaca]/50',
    Returned: 'bg-[#ffedd5] text-[#c2410c] border border-[#fed7aa]/50',
};

const statusLabelVi: Record<string, string> = {
    Pending: 'Chờ duyệt',
    Confirmed: 'Đã xác nhận',
    Preparing: 'Đang chuẩn bị',
    Shipping: 'Đang giao hàng',
    Completed: 'Đã hoàn thành',
    Cancelled: 'Đã hủy',
    Returned: 'Đã trả hàng',
};

const AdminOrders: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

    // Search and Filter states
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [filterTab, setFilterTab] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const itemsPerPage = 8;

    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getAdminOrders();
            setOrders(Array.isArray(data) ? data : data?.data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
        // Close action menu on click outside
        const handleOutsideClick = () => setActiveMenuId(null);
        window.addEventListener('click', handleOutsideClick);
        return () => window.removeEventListener('click', handleOutsideClick);
    }, []);


    const handleStatusChange = async (orderId: string, status: string) => {
        setUpdating(orderId);
        try {
            await adminApi.updateOrderStatus(orderId, status);
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder((prev: any) => ({ ...prev, status }));
            }
        } catch (err: any) {
            alert(`Cập nhật thất bại: ${err.message}`);
        } finally {
            setUpdating(null);
        }
    };

    const getPaymentMethodLabel = (method: any) => {
        if (method === 0 || method === 'COD' || method === '0') return 'Thanh toán khi nhận hàng (COD)';
        if (method === 1 || method === 'BankTransfer' || method === '1') return 'Chuyển khoản VietQR (Sepay)';
        if (method === 2 || method === 'EWallet' || method === '2') return 'Ví điện tử';
        if (method === 3 || method === 'OnlineGateway' || method === '3') return 'Cổng thanh toán online';
        return String(method || 'Chưa xác định');
    };

    // Filter Logic
    const filteredOrders = orders.filter(order => {
        const orderIdString = order.id ? order.id.toLowerCase() : '';
        const orderCodeString = order.orderCode ? order.orderCode.toLowerCase() : '';
        const customerNameString = order.customerName ? order.customerName.toLowerCase() : '';
        const receiverNameString = order.shippingAddress?.receiverName ? order.shippingAddress.receiverName.toLowerCase() : '';
        
        const matchesSearch = 
            orderIdString.includes(searchQuery.toLowerCase()) || 
            orderCodeString.includes(searchQuery.toLowerCase()) || 
            customerNameString.includes(searchQuery.toLowerCase()) ||
            receiverNameString.includes(searchQuery.toLowerCase());
        
        const matchesTab = filterTab === 'all' ? true : order.status === filterTab;

        return matchesSearch && matchesTab;
    });

    // Reset pagination on filter or search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filterTab, searchQuery]);

    // Pagination
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Summary Statistics
    const totalOrdersCount = orders.length;
    const pendingOrdersCount = orders.filter(o => o.status === 'Pending' || o.status === 'Confirmed' || o.status === 'Preparing' || o.status === 'Shipping').length;
    const completedOrdersCount = orders.filter(o => o.status === 'Completed').length;
    const totalRevenue = orders
        .filter(o => o.status !== 'Cancelled')
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return (
        <div className="min-h-screen bg-[#FAF9F6] p-8 animate-slide-up">
            {/* Header */}
            <div className="sticky top-0 z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 -mx-8 -mt-8 px-8 pt-8 pb-5 mb-3 bg-[#FAF9F6] border-b border-[#e8ddd5]/50">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#4b2311] tracking-tight">Quản lý đơn hàng</h1>
                    <p className="text-[#68361c]/70 text-sm mt-1">
                        Theo dõi trạng thái giao hàng, duyệt thanh toán qua Sepay và chăm sóc đơn hàng cà phê tuần hoàn.
                    </p>
                </div>
                <div>
                    <button
                        onClick={loadOrders}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e8ddd5] rounded-none text-[#4b2311] text-xs font-semibold hover:bg-[#FAF6F0] shadow-sm transition-all cursor-pointer"
                    >
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                        </svg>
                        Làm mới danh sách
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <div className="bg-white p-5 rounded border border-[#e8ddd5]/60 shadow-sm transition-all hover:shadow-md">
                    <span className="text-[10px] font-bold text-[#68361c]/50 uppercase tracking-widest block mb-2">Tổng số đơn hàng</span>
                    <span className="text-3xl font-extrabold text-[#4b2311]">{totalOrdersCount}</span>
                </div>
                <div className="bg-white p-5 rounded border border-[#e8ddd5]/60 shadow-sm transition-all hover:shadow-md">
                    <span className="text-[10px] font-bold text-[#68361c]/50 uppercase tracking-widest block mb-2">Đơn đang chờ xử lý</span>
                    <span className="text-3xl font-extrabold text-[#b45309]">{pendingOrdersCount}</span>
                </div>
                <div className="bg-white p-5 rounded border border-[#e8ddd5]/60 shadow-sm transition-all hover:shadow-md">
                    <span className="text-[10px] font-bold text-[#68361c]/50 uppercase tracking-widest block mb-2">Doanh thu thuần</span>
                    <span className="text-3xl font-extrabold text-[#657b35]">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRevenue)}
                    </span>
                </div>
                <div className="bg-white p-5 rounded border border-[#e8ddd5]/60 shadow-sm transition-all hover:shadow-md">
                    <span className="text-[10px] font-bold text-[#68361c]/50 uppercase tracking-widest block mb-2">Đã hoàn thành</span>
                    <span className="text-3xl font-extrabold text-[#4b2311]">{completedOrdersCount}</span>
                </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                {/* Tabs */}
                <div className="flex items-center gap-1.5 flex-wrap shrink-0 self-start sm:self-auto">
                    <button
                        onClick={() => setFilterTab('all')}
                        className={`px-3.5 py-2 text-xs font-bold rounded-none transition-all border cursor-pointer ${filterTab === 'all' ? 'bg-[#20150E] text-white border-[#20150E]' : 'bg-white text-[#68361c]/70 border-[#e8ddd5] hover:bg-[#FAF6F0]'}`}
                    >
                        Tất cả
                    </button>
                    {ORDER_STATUSES.map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterTab(status)}
                            className={`px-3.5 py-2 text-xs font-bold rounded-none transition-all border cursor-pointer ${filterTab === status ? 'bg-[#20150E] text-white border-[#20150E]' : 'bg-white text-[#68361c]/70 border-[#e8ddd5] hover:bg-[#FAF6F0]'}`}
                        >
                            {statusLabelVi[status]}
                        </button>
                    ))}
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                    <input
                        type="text"
                        placeholder="Tìm mã đơn, tên khách..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-[#e8ddd5]/80 rounded-none text-xs font-medium text-[#4b2311] placeholder-[#68361c]/40 focus:outline-none focus:border-[#657b35] transition-all"
                    />
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#68361c]/40">
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                    {error}
                </div>
            )}

            {/* Main Table Card */}
            {loading ? (
                <div className="flex items-center justify-center py-32 bg-white border border-[#e8ddd5]/60 rounded-none shadow-sm">
                    <div className="w-9 h-9 border-4 border-[#657b35] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="bg-white rounded-none border border-[#e8ddd5]/60 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead>
                                <tr className="bg-[#FAF7F5] border-b border-[#e8ddd5]/40">
                                    <th className="px-6 py-5 text-[#5c5652] tracking-wider font-bold text-[11px] uppercase tracking-widest w-[15%]">Mã đơn</th>
                                    <th className="px-6 py-5 text-[#5c5652] tracking-wider font-bold text-[11px] uppercase tracking-widest w-[25%]">Khách hàng</th>
                                    <th className="px-6 py-5 text-[#5c5652] tracking-wider font-bold text-[11px] uppercase tracking-widest w-[18%]">Ngày tạo</th>
                                    <th className="px-6 py-5 text-[#5c5652] tracking-wider font-bold text-[11px] uppercase tracking-widest w-[15%]">Tổng tiền</th>
                                    <th className="px-6 py-5 text-[#5c5652] tracking-wider font-bold text-[11px] uppercase tracking-widest w-[17%]">Trạng thái</th>
                                    <th className="px-6 py-5 text-[#5c5652] tracking-wider font-bold text-[11px] uppercase tracking-widest w-[10%] text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e8ddd5]/30">
                                {paginatedOrders.map((order) => {
                                    const codeDisplay = order.orderCode || order.id?.slice(0, 8);
                                    const receiver = order.shippingAddress?.receiverName || order.customerName || 'Khách vãng lai';
                                    const dateDisplay = order.createdAt 
                                        ? new Date(order.createdAt).toLocaleDateString('vi-VN', { dateStyle: 'medium' }) 
                                        : '—';

                                    return (
                                        <tr key={order.id} className="hover:bg-[#FAF9F6]/50 transition-colors group">
                                            {/* Order Code */}
                                            <td className="px-6 py-6.5">
                                                <button
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="font-mono font-bold text-xs text-[#657b35] hover:underline cursor-pointer border-none bg-transparent"
                                                >
                                                    #{codeDisplay}
                                                </button>
                                            </td>

                                            {/* Customer Name */}
                                            <td className="px-6 py-6.5">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-[#2d2825] text-sm leading-snug group-hover:text-[#657b35] transition-colors">{receiver}</span>
                                                    {order.shippingAddress?.phone && (
                                                        <span className="text-[10px] text-[#888079] font-normal tracking-wide mt-0.5">{order.shippingAddress.phone}</span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Created At */}
                                            <td className="px-6 py-6.5">
                                                <span className="text-[#888079] font-medium text-xs tracking-wider">{dateDisplay}</span>
                                            </td>

                                            {/* Total Amount */}
                                            <td className="px-6 py-6.5 text-[#2d2825] font-bold text-sm">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount || 0)}
                                            </td>

                                            {/* Status Badge */}
                                            <td className="px-6 py-6.5">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColor[order.status] || 'bg-stone-100 text-stone-700'}`}>
                                                    {statusLabelVi[order.status] || order.status}
                                                </span>
                                            </td>

                                            {/* Actions Menu */}
                                            <td className="px-6 py-6.5 text-center">
                                                <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => setActiveMenuId(activeMenuId === order.id ? null : order.id)}
                                                        className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:bg-stone-50 hover:text-stone-700 transition-all cursor-pointer focus:outline-none outline-none border-none border-0 bg-transparent shadow-none"
                                                    >
                                                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                            <circle cx="12" cy="5" r="1" fill="currentColor" />
                                                            <circle cx="12" cy="12" r="1" fill="currentColor" />
                                                            <circle cx="12" cy="19" r="1" fill="currentColor" />
                                                        </svg>
                                                    </button>
                                                    {activeMenuId === order.id && (
                                                        <div className="absolute right-0 mt-1 w-36 bg-white border border-[#e8ddd5] rounded shadow-lg py-1.5 z-20 animate-slide-up">
                                                            <button
                                                                onClick={() => { setSelectedOrder(order); setActiveMenuId(null); }}
                                                                className="w-full text-left px-4 py-2 text-xs font-bold text-[#68361c] hover:bg-[#FAF9F6] focus:outline-none outline-none border-none border-0 bg-transparent cursor-pointer shadow-none flex items-center gap-1.5"
                                                            >
                                                                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                                    <circle cx="12" cy="12" r="3" />
                                                                </svg>
                                                                Xem chi tiết
                                                            </button>
                                                            {ALLOWED_TRANSITIONS[order.status]?.map(status => (
                                                                <button
                                                                    key={status}
                                                                    onClick={() => { handleStatusChange(order.id, status); setActiveMenuId(null); }}
                                                                    className="w-full text-left px-4 py-2 text-xs font-bold text-[#657b35] hover:bg-[#FAF9F6] focus:outline-none outline-none border-none border-0 bg-transparent cursor-pointer shadow-none flex items-center gap-1.5"
                                                                >
                                                                    ➔ {statusLabelVi[status] || status}
                                                                </button>
                                                            ))}
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

                    {/* Empty Fallback */}
                    {filteredOrders.length === 0 && (
                        <div className="py-20 text-center flex flex-col items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center border border-[#e8ddd5]/30 mb-3 text-[#68361c]/40">
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                </svg>
                            </div>
                            <span className="text-sm font-bold text-[#4b2311]">Không tìm thấy đơn hàng nào</span>
                            <span className="text-xs text-[#68361c]/50 mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</span>
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 bg-[#FAF7F5] border-t border-[#e8ddd5]/40 flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#888079]">
                                Hiển thị {((currentPage - 1) * itemsPerPage) + 1} đến {Math.min(currentPage * itemsPerPage, filteredOrders.length)} trong tổng số {filteredOrders.length} kết quả
                            </span>
                            <div className="flex items-center gap-1.5">
                                {/* Previous */}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="w-8 h-8 flex items-center justify-center border border-[#e8ddd5]/60 bg-white rounded-none text-[#68361c]/60 hover:bg-stone-50 disabled:opacity-50 disabled:hover:bg-white transition-all cursor-pointer"
                                >
                                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                                    </svg>
                                </button>
                                
                                {/* Pages */}
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-8 h-8 rounded-none text-xs font-bold transition-all cursor-pointer ${currentPage === page ? 'bg-[#20150E] text-white' : 'border border-[#e8ddd5]/60 bg-white text-[#68361c]/60 hover:bg-stone-50'}`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                {/* Next */}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="w-8 h-8 flex items-center justify-center border border-[#e8ddd5]/60 bg-white rounded-none text-[#68361c]/60 hover:bg-stone-50 disabled:opacity-50 disabled:hover:bg-white transition-all cursor-pointer"
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

            {/* Absolute Premium Order Detail Modal */}
            <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} zIndex={50}>
                {selectedOrder && (
                    <div className="bg-white rounded-[32px] border border-[#eaddd2] max-w-3xl w-full overflow-hidden shadow-[0_30px_70px_rgba(32,21,14,0.35),_0_0_100px_rgba(0,0,0,0.1)] flex flex-col relative max-h-[90vh] animate-scale-up">
                        
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-8 py-5 border-b border-[#eaddd2]/40 bg-stone-50/50 shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-[#4b2311] tracking-tight">
                                    Chi tiết đơn hàng #{selectedOrder.orderCode || selectedOrder.id?.slice(0, 8)}
                                </h3>
                                <p className="text-xs text-[#68361c]/60 font-semibold mt-0.5">
                                    Tạo ngày: {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('vi-VN') : '—'}
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                {/* Inline Status modification */}
                                <div className="flex items-center gap-2">
                                    {ALLOWED_TRANSITIONS[selectedOrder.status]?.length > 0 ? (
                                        <select
                                            value={selectedOrder.status}
                                            onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                                            disabled={updating === selectedOrder.id}
                                            className="text-xs border border-[#e8ddd5] rounded-none px-3 py-1.5 text-[#4b2311] bg-white focus:outline-none focus:border-[#657b35] disabled:opacity-50 font-bold cursor-pointer"
                                        >
                                            <option value={selectedOrder.status}>{statusLabelVi[selectedOrder.status]}</option>
                                            {ALLOWED_TRANSITIONS[selectedOrder.status].map(s => (
                                                <option key={s} value={s}>{statusLabelVi[s] || s}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span className="bg-[#FAF6F0] text-[#888079] font-bold px-3 py-1.5 text-xs rounded border border-[#e8ddd5]/20 block text-center">
                                            {statusLabelVi[selectedOrder.status] || selectedOrder.status}
                                        </span>
                                    )}
                                    {updating === selectedOrder.id && (
                                        <div className="w-4 h-4 border-2 border-[#657b35] border-t-transparent rounded-full animate-spin shrink-0" />
                                    )}
                                </div>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="w-8 h-8 rounded-full border border-[#eaddd2] text-[#68361c] hover:bg-neutral-100 flex items-center justify-center transition-colors cursor-pointer text-sm p-0 focus:outline-none bg-transparent"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto px-8 pt-3 pb-5 space-y-5">
                            
                            {/* Visual Status Tracker Flow */}
                            <div className="bg-[#FAF7F5] rounded-none p-4">
                                <span className="text-[9px] font-bold text-[#68361c]/50 uppercase tracking-widest block mb-3">Trình theo dõi trạng thái</span>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 relative">
                                    {/* Visual timeline connector line */}
                                    <div className="hidden sm:block absolute left-4 right-4 top-[14px] h-0.5 bg-[#e8ddd5]/70 -z-0"></div>
                                    
                                    {ORDER_STATUSES.filter(s => s !== 'Cancelled' && s !== 'Returned').map((status, index) => {
                                        const steps = ['Pending', 'Confirmed', 'Preparing', 'Shipping', 'Completed'];
                                        const currentStepIndex = steps.indexOf(selectedOrder.status);
                                        const isCompleted = steps.indexOf(status) <= currentStepIndex && selectedOrder.status !== 'Cancelled' && selectedOrder.status !== 'Returned';
                                        const isCurrent = selectedOrder.status === status;

                                        return (
                                            <div key={status} className="flex sm:flex-col items-center gap-2 z-10 shrink-0">
                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                                                    isCompleted 
                                                        ? 'bg-[#657b35] text-white shadow-sm' 
                                                        : 'bg-white text-stone-400 border border-[#e8ddd5]/80'
                                                } ${isCurrent ? 'ring-2 ring-[#657b35]/15 scale-105' : ''}`}>
                                                    {isCompleted && !isCurrent ? '✓' : `0${index + 1}`}
                                                </div>
                                                <span className={`text-[9px] font-bold uppercase tracking-wider ${isCompleted ? 'text-[#4b2311]' : 'text-stone-400'}`}>
                                                    {statusLabelVi[status]}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {selectedOrder.status === 'Cancelled' && (
                                    <div className="mt-2.5 bg-red-50 border border-red-100 rounded p-2 text-red-700 text-xs font-bold flex items-center gap-2">
                                        ✕ Đơn hàng này đã bị hủy bỏ.
                                    </div>
                                )}
                                {selectedOrder.status === 'Returned' && (
                                    <div className="mt-2.5 bg-orange-50 border border-orange-100 rounded p-2 text-orange-700 text-xs font-bold flex items-center gap-2">
                                        ↺ Đơn hàng này đã bị trả lại.
                                    </div>
                                )}
                            </div>

                            {/* Split Information Details grid */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                                {/* Left Side: Order Items table */}
                                <div className="md:col-span-7 space-y-5">
                                    <h4 className="text-xs font-extrabold text-[#4b2311] uppercase tracking-wider pb-1.5 border-b border-[#eaddd2]/30">
                                        Sản phẩm đã mua ({selectedOrder.orderItems?.length || 0})
                                    </h4>
                                    
                                    <div className="space-y-3.5 max-h-64 overflow-y-auto pr-1">
                                        {selectedOrder.orderItems?.map((item: any) => (
                                            <div key={item.id} className="flex items-center justify-between gap-3 p-4 bg-white border border-[#e8ddd5]/50 rounded-xl shadow-sm hover:shadow transition-shadow text-xs">
                                                <div className="min-w-0">
                                                    <h5 className="font-bold text-[#4b2311] truncate" title={item.productName}>
                                                        {item.productName}
                                                    </h5>
                                                    <p className="text-[9px] font-medium text-[#68361c]/60 mt-0.5">
                                                        {item.variantName ? `Phân loại: ${item.variantName}` : 'Phân loại tiêu chuẩn'}
                                                    </p>
                                                </div>
                                                <div className="shrink-0 text-right text-xs">
                                                    <span className="font-bold text-[#4b2311] block">
                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.unitPrice || 0)}
                                                    </span>
                                                    <span className="text-[9px] font-semibold text-[#68361c]/50 block mt-0.5">
                                                        Số lượng: x{item.quantity}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}

                                        {(!selectedOrder.orderItems || selectedOrder.orderItems.length === 0) && (
                                            <p className="text-xs text-stone-400 italic">Không có thông tin mặt hàng.</p>
                                        )}
                                    </div>

                                    {/* Cost breakdown */}
                                    <div className="bg-[#FAF7F5]/60 border border-[#e8ddd5]/45 rounded-xl p-5 text-xs text-[#68361c] space-y-3 mt-5 shadow-sm">
                                        <div className="flex justify-between">
                                            <span>Tạm tính</span>
                                            <span className="font-bold text-[#4b2311]">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.subtotal || selectedOrder.totalAmount || 0)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Phí ship Xanh</span>
                                            <span className="font-bold text-[#4b2311]">
                                                {selectedOrder.shippingFee === 0 ? 'Miễn phí' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.shippingFee || 0)}
                                            </span>
                                        </div>
                                        {selectedOrder.discountAmount > 0 && (
                                            <div className="flex justify-between text-[#657b35] font-bold">
                                                <span>Giảm giá {selectedOrder.couponCode ? `(${selectedOrder.couponCode})` : ''}</span>
                                                <span>-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.discountAmount)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-baseline pt-2.5 border-t border-[#eaddd2]/40 text-[#4b2311] font-bold">
                                            <span className="uppercase tracking-wider text-[9px]">Tổng thanh toán</span>
                                            <span className="text-sm font-black text-[#657b35]">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.totalAmount || 0)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Shipping & Payment details */}
                                <div className="md:col-span-5 space-y-6 text-xs text-[#68361c]">
                                    {/* Shipping details */}
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-extrabold text-[#4b2311] uppercase tracking-wider pb-1 border-b border-[#eaddd2]/30">
                                            Địa chỉ giao hàng
                                        </h4>
                                        <div className="space-y-3 text-xs pt-1">
                                            <div className="flex justify-between font-bold text-[#4b2311]">
                                                <span>Người nhận</span>
                                                <span>{selectedOrder.shippingAddress?.receiverName || 'Khách vãng lai'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Điện thoại</span>
                                                <span className="font-mono font-bold text-[#4b2311]">{selectedOrder.shippingAddress?.phone || '—'}</span>
                                            </div>
                                            <div className="pt-3 border-t border-[#eaddd2]/30 flex justify-between gap-4 text-[#68361c]/80">
                                                <span className="font-bold text-[#4b2311] shrink-0">Địa chỉ</span>
                                                <span className="text-right leading-relaxed font-semibold">
                                                    {selectedOrder.shippingAddress ? (
                                                        <span>
                                                            {selectedOrder.shippingAddress.detailAddress}, {selectedOrder.shippingAddress.ward}, {selectedOrder.shippingAddress.district}, {selectedOrder.shippingAddress.province}
                                                        </span>
                                                    ) : (
                                                        <span className="italic font-normal text-stone-400">Không có thông tin địa chỉ</span>
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Info */}
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-extrabold text-[#4b2311] uppercase tracking-wider pb-1 border-b border-[#eaddd2]/30">
                                            Phương thức & Ghi chú
                                        </h4>
                                        <div className="space-y-3 font-medium">
                                            <div className="flex justify-between py-2 border-b border-stone-100/60">
                                                <span>Thanh toán</span>
                                                <span className="font-bold text-[#4b2311]">
                                                    {getPaymentMethodLabel(selectedOrder.paymentMethod)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b border-stone-100/60">
                                                <span>Trạng thái tiền</span>
                                                <span className="font-bold text-[#657b35]">
                                                    {selectedOrder.paymentStatus || 'Chưa thanh toán'}
                                                </span>
                                            </div>
                                            {selectedOrder.note && (
                                                <div className="pt-2">
                                                    <span className="text-[9px] text-[#68361c]/50 uppercase tracking-widest block mb-1">Ghi chú đơn hàng</span>
                                                    <p className="bg-[#FAF7F5] border border-[#e8ddd5]/40 rounded-xl p-3.5 text-[10px] text-[#4b2311] font-semibold leading-relaxed mt-2.5 shadow-sm">
                                                        {selectedOrder.note}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-8 py-4 border-t border-[#eaddd2]/40 bg-stone-50/50 flex justify-end shrink-0">
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="bg-[#4b2311] hover:bg-[#68361c] text-white font-extrabold px-6 py-2.5 rounded text-xs uppercase tracking-wider border-none cursor-pointer transition-all shadow-md shadow-[#4b2311]/15"
                            >
                                Đóng lại
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminOrders;
