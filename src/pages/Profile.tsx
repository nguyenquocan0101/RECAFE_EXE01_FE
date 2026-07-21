import React, { useState, useEffect } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { Button } from '@/components/common/Button'
import { getMyOrders, getOrderById, simulateSepayWebhook, isSepaySimulatorConfigurationError } from '@/services/api/orders'
import { getAddresses } from '@/services/api/addresses'
import { EditProfileModal } from '@/components/profile/EditProfileModal'
import SepayPaymentModal from '@/components/common/SepayPaymentModal'
import ReviewModal from '@/components/reviews/ReviewModal'

interface ReviewTarget {
    orderId: string
    productId: string
    productName: string
    reviewId?: string | null
}

const Profile: React.FC = () => {
    const { language } = useLanguage()
    const { user } = useAuth()
    const { showToast } = useToast()

    // Loading & Data States
    const [orders, setOrders] = useState<any[]>([])
    const [loadingOrders, setLoadingOrders] = useState(false)
    const [addresses, setAddresses] = useState<any[]>([])
    const [loadingAddresses, setLoadingAddresses] = useState(false)

    // Modal Control
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [reviewTarget, setReviewTarget] = useState<ReviewTarget | null>(null)

    // Sepay Payment Modal Control
    const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<any | null>(null)
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
    const [paymentSuccess, setPaymentSuccess] = useState(false)
    const [simulating, setSimulating] = useState(false)

    const handleOpenPaymentModal = (order: any) => {
        setSelectedOrderForPayment(order)
        setPaymentSuccess(false)
        setIsPaymentModalOpen(true)
    }

    const openReview = (order: any, item: any) => {
        setReviewTarget({
            orderId: order.id,
            productId: item.productId,
            productName: item.productName,
            reviewId: item.reviewId || null
        })
    }

    const handleSimulateWebhook = async () => {
        if (!import.meta.env.DEV || !selectedOrderForPayment) return;
        setSimulating(true);
        try {
            await simulateSepayWebhook({
                id: Math.floor(Math.random() * 100000000),
                gateway: 'VietinBank',
                transactionDate: new Date().toISOString(),
                accountNumber: '123456789',
                transferType: 'in',
                transferAmount: selectedOrderForPayment.totalAmount,
                code: selectedOrderForPayment.id,
                content: `RECAFE ${selectedOrderForPayment.orderCode || selectedOrderForPayment.id?.slice(0, 8)}`,
                referenceCode: `SIM-${Date.now()}`
            });
            setPaymentSuccess(true);
            showToast(language === 'vi' ? 'Thanh toán qua Sepay thành công!' : 'Simulated Sepay payment successfully!', 'success');
            fetchOrders(); // Refresh order list
            setTimeout(() => {
                setIsPaymentModalOpen(false);
            }, 2500);
        } catch (err: any) {
            if (isSepaySimulatorConfigurationError(err)) {
                showToast(
                    language === 'vi'
                        ? 'Thiếu VITE_SEPAY_DEV_API_KEY. Hãy cấu hình khóa test trước khi giả lập thanh toán.'
                        : 'VITE_SEPAY_DEV_API_KEY is missing. Configure the test key before simulating payment.',
                    'error'
                );
                return;
            }

            console.warn("Backend webhook API returned error, proceeding with client-side success:", err);
            setPaymentSuccess(true);
            showToast(
                language === 'vi' 
                    ? 'Thanh toán qua Sepay thành công (Chế độ Demo)!' 
                    : 'Simulated Sepay payment successfully (Demo Mode)!', 
                'success'
            );
            fetchOrders();
            setTimeout(() => {
                setIsPaymentModalOpen(false);
            }, 2500);
        } finally {
            setSimulating(false);
        }
    }

    useEffect(() => {
        if (!isPaymentModalOpen || !selectedOrderForPayment?.id || paymentSuccess) return;

        let intervalId: NodeJS.Timeout;

        const checkPaymentStatus = async () => {
            try {
                const response = await getOrderById(selectedOrderForPayment.id);
                const orderData = response?.data;
                if (orderData && (orderData.paymentStatus === 'Paid' || orderData.paymentStatus?.toLowerCase() === 'paid')) {
                    setPaymentSuccess(true);
                    showToast(
                        language === 'vi' 
                            ? 'Thanh toán qua Sepay thành công!' 
                            : 'Sepay payment successfully matched!', 
                        'success'
                    );
                    fetchOrders(); // Refresh order list
                    setTimeout(() => {
                        setIsPaymentModalOpen(false);
                    }, 2500);
                }
            } catch (error) {
                console.error("Error polling order payment status:", error);
            }
        };

        checkPaymentStatus();
        intervalId = setInterval(checkPaymentStatus, 3000);

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [isPaymentModalOpen, selectedOrderForPayment, paymentSuccess, language, showToast]);

    const fetchOrders = async () => {
        setLoadingOrders(true)
        try {
            const data = await getMyOrders()
            setOrders(Array.isArray(data) ? data : data?.data || [])
        } catch (error: any) {
            showToast(error.message || 'Không thể tải lịch sử đơn hàng', 'error')
        } finally {
            setLoadingOrders(false)
        }
    }

    const fetchAddresses = async () => {
        setLoadingAddresses(true)
        try {
            const data = await getAddresses()
            setAddresses(Array.isArray(data) ? data : data?.data || [])
        } catch (error: any) {
            showToast(error.message || 'Không thể tải danh sách địa chỉ', 'error')
        } finally {
            setLoadingAddresses(false)
        }
    }

    useEffect(() => {
        fetchOrders()
        fetchAddresses()
    }, [])

    // Get default address or first address for display
    const defaultAddress = addresses.find(a => a.isDefault) || addresses[0]
    const defaultAddressText = defaultAddress
        ? `${defaultAddress.detailAddress}, ${defaultAddress.ward}, ${defaultAddress.district}, ${defaultAddress.province}`
        : ''
    const defaultPhone = defaultAddress?.phone || user?.phone || ''

    const statusColorMap: Record<string, string> = {
        Pending: 'bg-[#fef3c7] text-[#b45309] border border-[#fde68a]/50',
        Confirmed: 'bg-[#e0e7ff] text-[#3730a3] border border-[#c7d2fe]/50',
        Preparing: 'bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]/50',
        Shipping: 'bg-[#f3e8ff] text-[#6b21a8] border border-[#e9d5ff]/50',
        Completed: 'bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]/50',
        Cancelled: 'bg-[#fef2f2] text-[#991b1b] border border-[#fecaca]/50',
        Returned: 'bg-[#ffedd5] text-[#c2410c] border border-[#fed7aa]/50',
    }

    const statusLabelVi: Record<string, string> = {
        Pending: 'Chờ duyệt',
        Confirmed: 'Đã xác nhận',
        Preparing: 'Chuẩn bị',
        Shipping: 'Đang giao',
        Completed: 'Hoàn thành',
        Cancelled: 'Đã hủy',
        Returned: 'Đã trả hàng',
    }

    return (
        <div className="max-w-[1300px] mx-auto px-6 py-10 min-h-[80vh] font-sans">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#4b2311] tracking-tight">
                        {language === 'vi' ? `Chào ${user?.fullName || user?.username},` : `Hello ${user?.fullName || user?.username},`}
                    </h1>
                    <p className="text-[#9c7a65] mt-1 text-sm font-medium">
                        {language === 'vi' ? 'Chào mừng bạn trở lại với không gian thiết kế bền vững.' : 'Welcome back to your sustainable design space.'}
                    </p>
                </div>

                {/* Metrics Cards (Subtle rounding 'rounded' matching Button) */}
                {/* <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 bg-[#faf9f6] border border-[#e8ddd5] rounded p-3 px-4 shadow-sm">
                        <div className="w-10 h-10 rounded bg-[#ecfdf5] flex items-center justify-center text-[#10b981]">
                            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 6H16" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-[#9c7a65] tracking-wider uppercase">
                                {language === 'vi' ? 'Rác thải đã giảm' : 'Waste Reduced'}
                            </p>
                            <p className="text-sm font-extrabold text-[#4b2311] mt-0.5">
                                2.5kg Cà phê
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-[#faf9f6] border border-[#e8ddd5] rounded p-3 px-4 shadow-sm">
                        <div className="w-10 h-10 rounded bg-[#ecfdf5] flex items-center justify-center text-[#10b981]">
                            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-[#9c7a65] tracking-wider uppercase">
                                {language === 'vi' ? 'Tác động' : 'Impact'}
                            </p>
                            <p className="text-sm font-extrabold text-[#4b2311] mt-0.5">
                                5 Cây xanh
                            </p>
                        </div>
                    </div>
                </div> */}
            </div>

            {/* Main Columns Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* LEFT COLUMN - Order History */}
                <div className="lg:col-span-8 space-y-8">
                    
                    {/* Order History Card (Subtle rounding 'rounded' matching Button) */}
                    <div className="bg-white border border-[#e8ddd5] rounded shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-[#f3ede8]">
                            <h2 className="text-lg font-bold text-[#4b2311]">
                                {language === 'vi' ? 'Lịch sử đơn hàng' : 'Order History'}
                            </h2>
                        </div>

                        <div className="p-6 overflow-x-auto">
                            {loadingOrders ? (
                                <div className="flex flex-col items-center justify-center py-10 gap-3">
                                    <div className="w-8 h-8 rounded-full border-3 border-[#657b35] border-t-transparent animate-spin" />
                                    <span className="text-xs text-[#9c7a65] font-semibold">
                                        {language === 'vi' ? 'Đang tải...' : 'Loading...'}
                                    </span>
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="font-bold text-[#4b2311] text-sm">
                                        {language === 'vi' ? 'Bạn chưa có đơn hàng nào' : 'No orders yet'}
                                    </p>
                                    <p className="text-[#9c7a65] text-xs mt-1">
                                        {language === 'vi' ? 'Khám phá các sản phẩm cà phê tuần hoàn của chúng tôi!' : 'Explore our circular coffee products!'}
                                    </p>
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse text-sm">
                                    <thead>
                                        <tr className="border-b border-[#f3ede8] text-[#9c7a65] font-bold text-xs uppercase tracking-wider">
                                            <th className="pb-3 pr-4 font-semibold">{language === 'vi' ? 'Ngày đặt' : 'Order Date'}</th>
                                            <th className="pb-3 px-4 font-semibold">{language === 'vi' ? 'Mã đơn hàng' : 'Order Code'}</th>
                                            <th className="pb-3 px-4 font-semibold">{language === 'vi' ? 'Sản phẩm' : 'Products'}</th>
                                            <th className="pb-3 px-4 font-semibold text-right">{language === 'vi' ? 'Tổng tiền' : 'Total'}</th>
                                            <th className="pb-3 pl-4 font-semibold text-center">{language === 'vi' ? 'Trạng thái' : 'Status'}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#fdfbf7] text-[#4b2311]">
                                        {orders.map((order) => {
                                            const codeDisplay = order.orderCode || order.id?.slice(0, 8)
                                            const dateDisplay = order.createdAt
                                                ? new Date(order.createdAt).toLocaleDateString('vi-VN', { dateStyle: 'short' })
                                                : '—'
                                            return (
                                                <tr key={order.id} className="hover:bg-[#faf9f6]/40 transition-colors">
                                                    <td className="py-4 pr-4 font-medium text-[#9c7a65]">{dateDisplay}</td>
                                                    <td className="py-4 px-4 font-mono font-bold text-xs text-[#4b2311]">#{codeDisplay}</td>
                                                    <td className="py-4 px-4 font-medium min-w-[220px]">
                                                        {order.orderItems && order.orderItems.length > 0
                                                            ? <div className="space-y-2">
                                                                {order.orderItems
                                                                    .filter((item: any, index: number, items: any[]) => items.findIndex(candidate => candidate.productId === item.productId) === index)
                                                                    .map((item: any) => <div key={item.productId} className="flex items-center justify-between gap-3">
                                                                        <span className="min-w-0 truncate" title={item.productName}>{item.productName} <span className="text-xs text-[#9c7a65]">(x{item.quantity})</span></span>
                                                                        {order.status === 'Completed' && <button type="button" onClick={() => openReview(order, item)} className="min-h-[44px] shrink-0 rounded border border-[#657b35] px-3 text-xs font-bold text-[#657b35] transition-colors hover:bg-[#657b35] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#657b35]">
                                                                            {item.reviewId ? (language === 'vi' ? 'Đã đánh giá' : 'Reviewed') : (language === 'vi' ? 'Đánh giá' : 'Review')}
                                                                        </button>}
                                                                    </div>)}
                                                              </div>
                                                            : '—'}
                                                    </td>
                                                    <td className="py-4 px-4 font-extrabold text-right text-[#657b35]">
                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount || 0)}
                                                    </td>
                                                    <td className="py-4 pl-4 text-center">
                                                        <div className="flex flex-col items-center gap-1.5 justify-center">
                                                            <span className={`inline-block px-3 py-1 rounded text-[10px] font-extrabold tracking-wider uppercase ${statusColorMap[order.status] || 'bg-stone-100 text-stone-700'}`}>
                                                                {language === 'vi' ? (statusLabelVi[order.status] || order.status) : order.status}
                                                            </span>
                                                            {order.paymentMethod === 'BankTransfer' && 
                                                             (order.paymentStatus === 'Unpaid' || order.paymentStatus?.toLowerCase() === 'unpaid') && 
                                                             order.status === 'Pending' && (
                                                                <button
                                                                    onClick={() => handleOpenPaymentModal(order)}
                                                                    className="text-[9px] font-extrabold bg-[#657b35] text-white px-2.5 py-1 rounded-lg hover:bg-[#798e3a] transition-colors border-none cursor-pointer uppercase tracking-wider shadow-sm mt-0.5"
                                                                >
                                                                    {language === 'vi' ? 'Thanh toán' : 'Pay'}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN - Profile Details */}
                <div className="lg:col-span-4 space-y-8">
                    
                    {/* Profile Card (Subtle rounding 'rounded' matching Button, Avatar Removed) */}
                    <div className="bg-white border border-[#e8ddd5] rounded shadow-sm p-6 flex flex-col items-start">
                        <div className="w-full pb-4 border-b border-[#f3ede8] flex justify-between items-center mb-5">
                            <h2 className="text-lg font-bold text-[#4b2311]">
                                {language === 'vi' ? 'Hồ sơ của tôi' : 'My Profile'}
                            </h2>
                        </div>

                        {/* Basic Info (Avatar Removed) */}
                        <div className="w-full mb-6 text-left border-b border-[#f3ede8] pb-5">
                            <h3 className="text-xl font-extrabold text-[#4b2311]">
                                {user?.fullName || user?.username}
                            </h3>
                            <span className="bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]/30 text-[9px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider mt-2 inline-block">
                                ECO VISIONARY
                            </span>
                        </div>

                        {/* Profile Info Details */}
                        <div className="w-full space-y-5 text-sm">
                            <div>
                                <p className="text-[10px] font-black text-[#9c7a65] tracking-wider uppercase mb-1">
                                    {language === 'vi' ? 'Chi tiết tài khoản' : 'Account Details'}
                                </p>
                                <p className="font-bold text-[#4b2311]">{user?.email || '—'}</p>
                                <p className="text-[#9c7a65] font-medium mt-0.5">{defaultPhone || '—'}</p>
                            </div>

                            <div>
                                <p className="text-[10px] font-black text-[#9c7a65] tracking-wider uppercase mb-1">
                                    {language === 'vi' ? 'Địa chỉ giao hàng' : 'Delivery Address'}
                                </p>
                                <p className="font-bold text-[#4b2311] leading-relaxed">
                                    {defaultAddressText || (language === 'vi' ? 'Chưa thiết lập địa chỉ giao hàng' : 'No delivery address configured')}
                                </p>
                            </div>
                        </div>

                        {/* Action Button */}
                        <Button
                            onClick={() => setIsEditModalOpen(true)}
                            variant="primary"
                            className="w-full mt-6"
                        >
                            {language === 'vi' ? 'Chỉnh sửa hồ sơ' : 'Edit Profile'}
                        </Button>
                    </div>
                </div>
            </div>

            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                addresses={addresses}
                loadingAddresses={loadingAddresses}
                fetchAddresses={fetchAddresses}
            />

            {/* Sepay Payment Modal */}
            <SepayPaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                createdOrder={selectedOrderForPayment}
                finalTotal={selectedOrderForPayment?.totalAmount || 0}
                simulating={simulating}
                paymentSuccess={paymentSuccess}
                onSimulateWebhook={handleSimulateWebhook}
            />

            {reviewTarget && <ReviewModal
                isOpen={Boolean(reviewTarget)}
                onClose={() => setReviewTarget(null)}
                orderId={reviewTarget.orderId}
                productId={reviewTarget.productId}
                productName={reviewTarget.productName}
                existingReviewId={reviewTarget.reviewId}
                onSubmitted={() => fetchOrders()}
                onDeleted={() => fetchOrders()}
            />}
        </div>
    )
}

export default Profile
