import React, { useEffect, useState } from 'react';
import * as adminApi from '@/services/api/admin';

const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const statusColor: Record<string, string> = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Processing: 'bg-blue-100 text-blue-800',
    Shipped: 'bg-purple-100 text-purple-800',
    Delivered: 'bg-green-100 text-green-800',
    Cancelled: 'bg-red-100 text-red-800',
};

const AdminOrders: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

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

    useEffect(() => { loadOrders(); }, []);

    const handleStatusChange = async (orderId: string, status: string) => {
        setUpdating(orderId);
        try {
            await adminApi.updateOrderStatus(orderId, status);
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
        } catch (err: any) {
            alert(`Cập nhật thất bại: ${err.message}`);
        } finally {
            setUpdating(null);
        }
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-[32px] font-bold text-[#4b2311]">Quản lý đơn hàng</h1>
                    <p className="text-[#68361c] text-sm mt-1">{orders.length} đơn hàng tổng cộng</p>
                </div>
                <button
                    onClick={loadOrders}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e8ddd5] rounded-lg text-[#4b2311] text-sm font-semibold hover:bg-[#f5f0eb] transition-colors"
                >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                    </svg>
                    Làm mới
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-4 border-[#657b35] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-[#68361c]">
                    <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="mb-4 opacity-40">
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                        <rect x="9" y="3" width="6" height="4" rx="1" />
                    </svg>
                    <p className="font-semibold">Chưa có đơn hàng nào</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-[#e8ddd5] overflow-hidden shadow-sm">
                    <table className="w-full text-sm">
                        <thead className="bg-[#f5f0eb]">
                            <tr>
                                <th className="text-left px-5 py-4 text-[#68361c] font-semibold text-xs uppercase tracking-wider">Mã đơn</th>
                                <th className="text-left px-5 py-4 text-[#68361c] font-semibold text-xs uppercase tracking-wider">Khách hàng</th>
                                <th className="text-left px-5 py-4 text-[#68361c] font-semibold text-xs uppercase tracking-wider">Ngày tạo</th>
                                <th className="text-left px-5 py-4 text-[#68361c] font-semibold text-xs uppercase tracking-wider">Tổng tiền</th>
                                <th className="text-left px-5 py-4 text-[#68361c] font-semibold text-xs uppercase tracking-wider">Trạng thái</th>
                                <th className="text-right px-5 py-4 text-[#68361c] font-semibold text-xs uppercase tracking-wider">Cập nhật</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f0e8e0]">
                            {orders.map((order: any) => (
                                <tr key={order.id} className="hover:bg-[#faf8f6] transition-colors">
                                    <td className="px-5 py-4">
                                        <button
                                            onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                                            className="font-mono text-xs text-[#657b35] hover:underline"
                                        >
                                            {order.id?.slice(0, 8)}…
                                        </button>
                                    </td>
                                    <td className="px-5 py-4 text-[#4b2311] font-medium">
                                        {order.customerName || order.userId?.slice(0, 8) || 'N/A'}
                                    </td>
                                    <td className="px-5 py-4 text-[#68361c]">
                                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : '—'}
                                    </td>
                                    <td className="px-5 py-4 text-[#4b2311] font-semibold">
                                        {order.totalAmount != null
                                            ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)
                                            : '—'}
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor[order.status] || 'bg-gray-100 text-gray-700'}`}>
                                            {order.status || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <select
                                                value={order.status || ''}
                                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                disabled={updating === order.id}
                                                className="text-xs border border-[#e8ddd5] rounded-lg px-2 py-1.5 text-[#4b2311] bg-white focus:outline-none focus:border-[#657b35] disabled:opacity-50"
                                            >
                                                <option value="">-- Chọn --</option>
                                                {ORDER_STATUSES.map(s => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                            {updating === order.id && (
                                                <div className="w-4 h-4 border-2 border-[#657b35] border-t-transparent rounded-full animate-spin" />
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Order detail expand */}
            {selectedOrder && (
                <div className="mt-6 bg-white border border-[#e8ddd5] rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-[#4b2311]">Chi tiết đơn #{selectedOrder.id?.slice(0, 8)}</h3>
                        <button onClick={() => setSelectedOrder(null)} className="text-[#68361c] hover:text-[#4b2311]">✕</button>
                    </div>
                    <pre className="text-xs text-[#68361c] bg-[#faf8f6] rounded-lg p-4 overflow-auto max-h-60">
                        {JSON.stringify(selectedOrder, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
