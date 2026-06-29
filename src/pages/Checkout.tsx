import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '@/context/CartContext'
import { useLanguage } from '@/context/LanguageContext'
import { useToast } from '@/context/ToastContext'
import { checkoutOrder, simulateSepayWebhook, getOrderById } from '@/services/api/orders'
import { previewCoupon, type CouponPreviewResponse } from '@/services/api/coupons'
import SepayPaymentModal from '@/components/common/SepayPaymentModal'

const Checkout: React.FC = () => {
    const { t, language } = useLanguage()
    const { showToast } = useToast()
    const navigate = useNavigate()
    const { 
        cartItems, 
        cartCount, 
        cartTotal, 
        updateQuantity, 
        removeFromCart,
        clearCart
    } = useCart()

    const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | 'cod'>('bank')

    // Voucher state machine
    const [voucherInput, setVoucherInput] = useState('')
    const [voucherStatus, setVoucherStatus] = useState<'idle' | 'checking' | 'applied' | 'invalid' | 'stale'>('idle')
    const [voucherPreview, setVoucherPreview] = useState<CouponPreviewResponse | null>(null)
    const [voucherErrorMsg, setVoucherErrorMsg] = useState('')
    
    // Address fields
    const [firstName, setFirstName] = useState('An')
    const [lastName, setLastName] = useState('Nguyen Quoc')
    const [streetAddress, setStreetAddress] = useState('Le Van Viet')
    const [phone, setPhone] = useState('0359261605')
    const [province, setProvince] = useState('Ho Chi Minh')
    const [district, setDistrict] = useState('Quan 9')
    const [ward, setWard] = useState('Tan Phu')
    const [submitting, setSubmitting] = useState(false)

    // Payment state variables
    const [createdOrder, setCreatedOrder] = useState<any | null>(null)
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
    const [simulating, setSimulating] = useState(false)
    const [paymentSuccess, setPaymentSuccess] = useState(false)

    // Polling order status to check for payment success
    useEffect(() => {
        if (!isPaymentModalOpen || !createdOrder?.id || paymentSuccess) return;

        let intervalId: NodeJS.Timeout;

        const checkPaymentStatus = async () => {
            try {
                const response = await getOrderById(createdOrder.id);
                const orderData = response?.data;
                if (orderData && (orderData.paymentStatus === 'Paid' || orderData.paymentStatus?.toLowerCase() === 'paid')) {
                    setPaymentSuccess(true);
                    showToast(
                        language === 'vi' 
                            ? 'Thanh toán qua Sepay thành công!' 
                            : 'Sepay payment successfully matched!', 
                        'success'
                    );
                    await clearCart();
                    
                    setTimeout(() => {
                        setIsPaymentModalOpen(false);
                        navigate('/profile');
                    }, 2500);
                }
            } catch (error) {
                console.error("Error polling order payment status:", error);
            }
        };

        // Poll immediately and then every 3 seconds
        checkPaymentStatus();
        intervalId = setInterval(checkPaymentStatus, 3000);

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [isPaymentModalOpen, createdOrder, paymentSuccess, navigate, clearCart, language, showToast]);

    const ecoShippingDisplay = cartTotal === 0 ? 0 : 30000;
    const ecoShipping = 0;
    const voucherDiscount = (voucherStatus === 'applied' || voucherStatus === 'stale') ? (voucherPreview?.discountAmount ?? 0) : 0;
    // Calculate final total based on currency (VND)
    const finalTotal = Math.max(0, cartTotal - voucherDiscount + ecoShipping);
    const displayTotal = Math.max(0, cartTotal - voucherDiscount + ecoShippingDisplay);

    const handleApplyVoucher = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = voucherInput.trim();
        if (!code) return;

        setVoucherStatus('checking');
        setVoucherErrorMsg('');
        try {
            const data = await previewCoupon({
                couponCode: code,
                cartItemIds: cartItems.map(item => item.id)
            });
            setVoucherPreview(data);
            setVoucherStatus('applied');
            showToast(
                language === 'vi' ? `Áp dụng voucher thành công!` : `Voucher applied!`,
                'success'
            );
        } catch (err: any) {
            setVoucherPreview(null);
            setVoucherStatus('invalid');
            setVoucherErrorMsg(err.message || (language === 'vi' ? 'Mã giảm giá không hợp lệ' : 'Invalid coupon code'));
        }
    };

    const handleRemoveVoucher = () => {
        setVoucherInput('');
        setVoucherPreview(null);
        setVoucherStatus('idle');
        setVoucherErrorMsg('');
    };

    const markVoucherStale = () => {
        if (voucherStatus === 'applied') {
            setVoucherStatus('stale');
        }
    };

    const handleConfirmOrder = async () => {
        if (!firstName || !lastName || !streetAddress || !phone || !province || !district || !ward) {
            showToast(language === 'vi' ? 'Vui lòng điền đầy đủ thông tin giao hàng!' : 'Please fill all delivery details!', 'error');
            return;
        }

        setSubmitting(true);
        try {
            const mappedPaymentMethod = paymentMethod === 'cod' ? 0 : paymentMethod === 'bank' ? 1 : 2;
            const payload = {
                shippingAddress: {
                    receiverName: `${firstName} ${lastName}`,
                    phone: phone,
                    province: province,
                    district: district,
                    ward: ward,
                    detailAddress: streetAddress,
                    isDefault: false
                },
                note: `Họ tên: ${firstName} ${lastName} | SĐT: ${phone} | Địa chỉ: ${streetAddress}, ${ward}, ${district}, ${province}`,
                couponCode: voucherStatus === 'applied' ? voucherInput : null,
                paymentMethod: mappedPaymentMethod,
                cartItemIds: cartItems.map(item => item.id)
            };

            const data = await checkoutOrder(payload);
            const orderObj = data?.data || data;
            const qrUrl = orderObj.paymentQrUrl || orderObj.data?.paymentQrUrl;
            
            setCreatedOrder({
                ...orderObj,
                paymentQrUrl: qrUrl
            });

            if (paymentMethod === 'bank') {
                setIsPaymentModalOpen(true);
            } else {
                showToast(language === 'vi' ? 'Đặt hàng thành công! Cảm ơn hành động xanh của bạn.' : 'Order placed successfully! Thank you for choosing green.', 'success');
                await clearCart();
                navigate('/profile');
            }
        } catch (err: any) {
            console.warn("Backend order creation failed, falling back to Demo Mode:", err);

            // If checkout failed due to voucher, reset voucher to stale so user sees the issue
            const errMsg: string = err.message || '';
            const isVoucherErr = /coupon|voucher|discount/i.test(errMsg);
            if (isVoucherErr && voucherStatus === 'applied') {
                setVoucherStatus('stale');
                showToast(
                    language === 'vi'
                        ? `Voucher không còn hợp lệ: ${errMsg}. Vui lòng áp dụng lại.`
                        : `Voucher error: ${errMsg}. Please re-apply.`,
                    'error'
                );
                setSubmitting(false);
                return;
            }
            
            showToast(
                language === 'vi' 
                    ? `Lỗi đặt hàng API: ${err.message}. Đã tự động chuyển sang chế độ Demo!` 
                    : `API checkout failed: ${err.message}. Transitioned to Demo Mode!`, 
                'info'
            );

            // Generate a beautiful mock order object
            const mockId = 'demo-' + Math.floor(10000000 + Math.random() * 90000000).toString();
            const mockOrderObj = {
                id: mockId,
                totalAmount: finalTotal,
                status: 'Pending',
                createdAt: new Date().toISOString()
            };
            setCreatedOrder(mockOrderObj);

            if (paymentMethod === 'bank') {
                setIsPaymentModalOpen(true);
            } else {
                showToast(language === 'vi' ? 'Đặt hàng thành công (Demo)! Cảm ơn hành động xanh của bạn.' : 'Order placed successfully (Demo)! Thank you for choosing green.', 'success');
                await clearCart();
                navigate('/profile');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleSimulateWebhook = async () => {
        if (!createdOrder) return;
        setSimulating(true);
        
        const webhookPayload = {
            id: Math.floor(Math.random() * 100000000),
            gateway: 'VietinBank',
            transactionDate: new Date().toISOString(),
            accountNumber: '123456789',
            transferType: 'in',
            transferAmount: finalTotal,
            code: createdOrder.id,
            content: `RECAFE ${createdOrder.id?.slice(0, 8)}`,
            referenceCode: `SIM-${Date.now()}`
        };

        try {
            await simulateSepayWebhook(webhookPayload);
            setPaymentSuccess(true);
            showToast(language === 'vi' ? '  thanh toán qua Sepay thành công!' : 'Simulated Sepay payment successfully!', 'success');
            await clearCart();
            
            setTimeout(() => {
                setIsPaymentModalOpen(false);
                navigate('/profile');
            }, 2500);
        } catch (err: any) {
            console.warn("Backend webhook API returned error, proceeding with rich client-side simulation:", err);
            
            setPaymentSuccess(true);
            showToast(
                language === 'vi' 
                    ? '  thanh toán qua Sepay thành công (Chế độ Demo)!' 
                    : 'Simulated Sepay payment successfully (Demo Mode)!', 
                'success'
            );
            await clearCart();
            
            setTimeout(() => {
                setIsPaymentModalOpen(false);
                navigate('/profile');
            }, 2500);
        } finally {
            setSimulating(false);
        }
    };

    return (
        <div className="bg-[#fcfaf8] min-h-screen text-[#4b2311] font-sans">
            {/* Breadcrumbs */}
            <nav className="breadcrumb-nav">
                <Link to="/">{t('detail.breadcrumbsHome') || (language === 'vi' ? 'Trang chủ' : 'Home')}</Link>
                <span className="breadcrumb-separator">›</span>
                <Link to="/products">{t('detail.breadcrumbsProducts') || (language === 'vi' ? 'Sản phẩm' : 'Products')}</Link>
                <span className="breadcrumb-separator">›</span>
                <span>{language === 'vi' ? 'Thanh toán' : 'Checkout'}</span>
            </nav>

            {/* Main container */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
                {/* Checkout Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Right Column (4/12) - Summary Panel (placed first in DOM to stack at the very top on mobile) */}
                    <div className="lg:col-span-4 lg:order-2">
                        <div className="bg-white border border-[#eaddd2]/60 rounded-3xl p-8 shadow-[0_10px_30px_rgba(75,35,17,0.02)] flex flex-col gap-6">
                            <h2 className="text-xl font-bold text-[#4b2311] tracking-tight">
                                {language === 'vi' ? 'Tóm Tắt Đơn Hàng' : 'Summary'}
                            </h2>

                            {/* Detailed charges */}
                            <div className="flex flex-col gap-4 border-b border-[#eaddd2]/50 pb-6 text-sm text-[#68361c] font-medium">
                                <div className="flex justify-between">
                                    <span>{language === 'vi' ? 'Tạm tính' : 'Subtotal'}</span>
                                    <span className="font-bold text-[#4b2311]">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cartTotal)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>{language === 'vi' ? 'Phí vận chuyển Xanh' : 'Eco-Shipping'}</span>
                                    <span className="font-bold text-[#4b2311]">
                                        {ecoShippingDisplay === 0 
                                            ? (language === 'vi' ? 'Miễn phí' : 'Free')
                                            : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(ecoShippingDisplay)
                                        }
                                    </span>
                                </div>
                                {voucherDiscount > 0 && (
                                    <div className="flex justify-between text-[#657b35] font-bold">
                                        <span>{language === 'vi' ? `Giảm giá (${voucherInput})` : `Discount (${voucherInput})`}</span>
                                        <span>
                                            -{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(voucherDiscount)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Voucher Section */}
                            {voucherStatus === 'stale' && (
                                <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-4 py-2.5 text-xs font-bold text-orange-700">
                                    <span className="material-symbols-outlined text-sm">warning</span>
                                    <span>{language === 'vi' ? 'Giỏ hàng thay đổi – vui lòng áp dụng lại voucher' : 'Cart changed – please re-apply voucher'}</span>
                                </div>
                            )}

                            {voucherStatus === 'applied' && voucherPreview && (
                                <div className="flex flex-col gap-1.5 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-xs">
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-1.5 font-bold text-green-700">
                                            <span className="material-symbols-outlined text-sm">check_circle</span>
                                            {voucherInput}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleRemoveVoucher}
                                            className="text-[10px] font-bold text-green-600 hover:text-red-500 transition-colors uppercase tracking-wider border-none bg-transparent cursor-pointer"
                                        >
                                            {language === 'vi' ? 'Bỏ' : 'Remove'}
                                        </button>
                                    </div>
                                    {voucherPreview.inapplicableCartItemIds.length > 0 && (
                                        <p className="text-[10px] text-green-600/80">
                                            {language === 'vi'
                                                ? `Áp dụng cho ${voucherPreview.applicableCartItemIds.length}/${voucherPreview.applicableCartItemIds.length + voucherPreview.inapplicableCartItemIds.length} sản phẩm`
                                                : `Applied to ${voucherPreview.applicableCartItemIds.length}/${voucherPreview.applicableCartItemIds.length + voucherPreview.inapplicableCartItemIds.length} items`
                                            }
                                        </p>
                                    )}
                                </div>
                            )}

                            {voucherStatus !== 'applied' && (
                                <form onSubmit={handleApplyVoucher} className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={voucherInput}
                                        onChange={(e) => setVoucherInput(e.target.value)}
                                        placeholder={language === 'vi' ? 'Nhập mã voucher' : 'Enter voucher code'}
                                        className="flex-1 bg-white border border-[#eaddd2] rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#657b35] text-[#4b2311] disabled:opacity-60"
                                        disabled={voucherStatus === 'checking'}
                                    />
                                    <button
                                        type="submit"
                                        disabled={voucherStatus === 'checking' || !voucherInput.trim()}
                                        className="bg-[#657b35] hover:bg-[#798e3a] disabled:opacity-50 text-white font-extrabold px-6 rounded-xl text-xs transition-colors border-none cursor-pointer uppercase tracking-wider flex items-center gap-1"
                                    >
                                        {voucherStatus === 'checking'
                                            ? <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                                            : (language === 'vi' ? 'Áp dụng' : 'Apply')
                                        }
                                    </button>
                                </form>
                            )}

                            {voucherStatus === 'invalid' && voucherErrorMsg && (
                                <p className="text-xs font-semibold text-red-600 -mt-2">{voucherErrorMsg}</p>
                            )}

                            {/* Final Total */}
                            <div className="flex justify-between items-baseline pt-6 border-t border-[#eaddd2]/50">
                                <span className="font-bold text-sm text-[#4b2311] uppercase tracking-wide">{language === 'vi' ? 'TỔNG CỘNG' : 'Total'}</span>
                                <div className="text-right">
                                    <span className="text-3xl font-black text-[#657b35] tracking-tight">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(displayTotal)}
                                    </span>
                                    <span className="block text-[8px] font-bold text-[#68361c] uppercase tracking-widest mt-1">
                                        VND (VAT INCLUDED)
                                    </span>
                                </div>
                            </div>

                            {/* Payment Selector */}
                            <div className="flex flex-col gap-3 -mt-2">
                                <span className="block text-[10px] font-bold uppercase tracking-wider text-[#68361c]/80">{language === 'vi' ? 'CHỌN PHƯƠNG THỨC THANH TOÁN' : 'SELECT PAYMENT'}</span>
                                
                                <div className="flex flex-col gap-2">
                                    {/* Credit Card */}
                                    {/* <label className={`relative flex items-center px-4 py-2.5 border rounded-xl bg-white cursor-pointer select-none transition-all hover:bg-neutral-50 ${paymentMethod === 'card' ? 'border-[#657b35] bg-[#657b35]/5 shadow-sm shadow-[#657b35]/5' : 'border-[#eaddd2]'}`}>
                                        <input 
                                            type="radio" 
                                            name="payment-checkout" 
                                            checked={paymentMethod === 'card'} 
                                            onChange={() => setPaymentMethod('card')}
                                            className="sr-only" 
                                        />
                                        <div className={`flex-1 flex items-center justify-between ${paymentMethod === 'card' ? 'text-[#657b35]' : 'text-[#4b2311]'}`}>
                                            <div className="flex items-center gap-3">
                                                <span className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${paymentMethod === 'card' ? 'border-[#657b35]' : 'border-[#eaddd2]'}`}>
                                                    {paymentMethod === 'card' && <span className="w-2.5 h-2.5 rounded-full bg-[#657b35]" />}
                                                </span>
                                                <span className="text-sm font-bold">{language === 'vi' ? 'Thẻ tín dụng' : 'Credit Card'}</span>
                                            </div>
                                            <span className="material-symbols-outlined opacity-60 text-lg">credit_card</span>
                                        </div>
                                    </label> */}

                                    {/* Bank Transfer */}
                                    <label className={`relative flex items-center px-4 py-2.5 border rounded-xl bg-white cursor-pointer select-none transition-all hover:bg-neutral-50 ${paymentMethod === 'bank' ? 'border-[#657b35] bg-[#657b35]/5 shadow-sm shadow-[#657b35]/5' : 'border-[#eaddd2]'}`}>
                                        <input 
                                            type="radio" 
                                            name="payment-checkout" 
                                            checked={paymentMethod === 'bank'} 
                                            onChange={() => setPaymentMethod('bank')}
                                            className="sr-only" 
                                        />
                                        <div className={`flex-1 flex items-center justify-between ${paymentMethod === 'bank' ? 'text-[#657b35]' : 'text-[#4b2311]'}`}>
                                            <div className="flex items-center gap-3">
                                                <span className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${paymentMethod === 'bank' ? 'border-[#657b35]' : 'border-[#eaddd2]'}`}>
                                                    {paymentMethod === 'bank' && <span className="w-2.5 h-2.5 rounded-full bg-[#657b35]" />}
                                                </span>
                                                <span className="text-sm font-bold">{language === 'vi' ? 'Chuyển khoản ngân hàng' : 'Bank Transfer'}</span>
                                            </div>
                                            <span className="material-symbols-outlined opacity-60 text-lg">account_balance</span>
                                        </div>
                                    </label>

                                    {/* Cash on Delivery */}
                                    <label className={`relative flex items-center px-4 py-2.5 border rounded-xl bg-white cursor-pointer select-none transition-all hover:bg-neutral-50 ${paymentMethod === 'cod' ? 'border-[#657b35] bg-[#657b35]/5 shadow-sm shadow-[#657b35]/5' : 'border-[#eaddd2]'}`}>
                                        <input 
                                            type="radio" 
                                            name="payment-checkout" 
                                            checked={paymentMethod === 'cod'} 
                                            onChange={() => setPaymentMethod('cod')}
                                            className="sr-only" 
                                        />
                                        <div className={`flex-1 flex items-center justify-between ${paymentMethod === 'cod' ? 'text-[#657b35]' : 'text-[#4b2311]'}`}>
                                            <div className="flex items-center gap-3">
                                                <span className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${paymentMethod === 'cod' ? 'border-[#657b35]' : 'border-[#eaddd2]'}`}>
                                                    {paymentMethod === 'cod' && <span className="w-2.5 h-2.5 rounded-full bg-[#657b35]" />}
                                                </span>
                                                <span className="text-sm font-bold">{language === 'vi' ? 'Thanh toán khi nhận hàng' : 'Cash on Delivery'}</span>
                                            </div>
                                            <span className="material-symbols-outlined opacity-60 text-lg">local_shipping</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Secure Button */}
                            <div className="pt-4">
                                <button 
                                    onClick={handleConfirmOrder}
                                    disabled={submitting || cartItems.length === 0 || voucherStatus === 'stale'}
                                    className="w-full bg-[#657b35] hover:bg-[#798e3a] disabled:opacity-50 text-white font-extrabold py-4 rounded-2xl transition-all shadow-xl shadow-[#657b35]/15 border-none cursor-pointer uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                                >
                                    <span>{submitting ? (language === 'vi' ? 'ĐANG ĐẶT HÀNG...' : 'PROCESSING...') : (language === 'vi' ? 'XÁC NHẬN ĐƠN HÀNG' : 'CONFIRM ORDER')}</span>
                                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </button>
                            </div>

                            <div className="flex items-center justify-center gap-2 text-[9px] font-bold text-[#68361c]/70 tracking-widest uppercase text-center pt-2">
                                <span className="material-symbols-outlined text-sm font-light">lock</span>
                                <span>{language === 'vi' ? 'Bảo mật giao dịch tuyệt đối' : 'END-TO-END SECURE PAYMENT'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Left Column (8/12) (placed second in DOM, visually first on desktop via lg:order-1) */}
                    <div className="lg:col-span-8 space-y-8 lg:order-1">
                        {/* Page Title & Subtitle inside Left Column */}
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-bold text-[#4b2311] tracking-tight mb-2">
                                {language === 'vi' ? 'Xác Nhận & Thanh Toán' : 'Review & Pay'}
                            </h1>
                            <p className="text-sm text-[#68361c]/80 font-medium">
                                {language === 'vi' ? 'Mỗi giao dịch đóng góp vào kinh tế tuần hoàn và môi trường xanh.' : 'Every purchase contributes to a circular coffee economy.'}
                            </p>
                        </div>

                        {/* Your Selection */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-baseline pb-1">
                                <h2 className="text-xl font-bold text-[#4b2311] tracking-tight">
                                    {language === 'vi' ? 'Đơn hàng của bạn' : 'Your Selection'}
                                </h2>
                                <span className="text-xs font-semibold text-[#68361c]/60">
                                    {cartCount} {language === 'vi' ? 'Sản phẩm' : 'Items'}
                                </span>
                            </div>

                            {cartItems.length === 0 ? (
                                <div className="bg-white border border-[#eaddd2]/60 rounded-2xl p-10 text-center space-y-4">
                                    <span className="material-symbols-outlined text-4xl opacity-30 text-[#68361c]">shopping_bag</span>
                                    <p className="text-sm font-semibold text-[#68361c]">
                                        {language === 'vi' ? 'Giỏ hàng của bạn đang trống.' : 'Your shopping cart is currently empty.'}
                                    </p>
                                    <Link to="/products" className="inline-block bg-[#657b35] hover:bg-[#798e3a] text-white text-xs uppercase tracking-widest font-extrabold py-3 px-6 rounded-xl transition-all">
                                        {language === 'vi' ? 'Xem sản phẩm' : 'Browse products'}
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="bg-white border border-[#eaddd2]/50 rounded-2xl p-6 flex gap-6 items-center justify-between transition-shadow hover:shadow-[0_4px_20px_rgba(75,35,17,0.03)]">
                                            {/* Left Side: Image + Info */}
                                            <div className="flex gap-6 items-center flex-1 min-w-0">
                                                {/* Thumbnail */}
                                                <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 bg-neutral-100 border border-[#eaddd2]/20">
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                </div>

                                                {/* Details info */}
                                                <div className="flex-1 min-w-0 space-y-3">
                                                    <div className="space-y-1">
                                                        <h3 className="font-bold text-[#4b2311] text-lg truncate">
                                                            {item.name}
                                                        </h3>
                                                        <p className="text-sm font-medium text-[#68361c]/70">
                                                            {item.material || (language === 'vi' ? 'Bã cà phê tái chế' : 'Upcycled grounds')} | {item.size || 'Standard'}
                                                        </p>
                                                    </div>

                                                    {/* Quantity incrementer */}
                                                    <div className="detail-quantity-selector">
                                                        <button onClick={() => { updateQuantity(item.id, item.quantity - 1); markVoucherStale(); }}>−</button>
                                                        <input 
                                                            type="number" 
                                                            value={item.quantity}
                                                            onChange={(e) => { updateQuantity(item.id, Math.max(0, Number(e.target.value))); markVoucherStale(); }}
                                                        />
                                                        <button onClick={() => { updateQuantity(item.id, item.quantity + 1); markVoucherStale(); }}>+</button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right Side: Price (top) and REMOVE (bottom) */}
                                            <div className="flex flex-col items-end justify-between h-24 shrink-0 pl-4">
                                                <span className="font-bold text-lg text-[#4b2311]">
                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                                                        (item.salePrice && item.salePrice > 0 ? item.salePrice : item.price) * item.quantity
                                                    )}
                                                </span>
                                                
                                                <button 
                                                    onClick={() => { removeFromCart(item.id); markVoucherStale(); }}
                                                    className="text-[11px] font-bold uppercase tracking-widest text-[#68361c]/50 hover:text-red-600 transition-colors border-none bg-transparent cursor-pointer p-0"
                                                >
                                                    {language === 'vi' ? 'XÓA' : 'REMOVE'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Delivery Address Form */}
                        <div className="space-y-4 pt-4">
                            <h2 className="text-xl font-bold text-[#4b2311] tracking-tight pb-1">
                                {language === 'vi' ? 'Địa Chỉ Giao Hàng' : 'Delivery Address'}
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#68361c]/80">{language === 'vi' ? 'TÊN' : 'FIRST NAME'}</label>
                                    <input 
                                        type="text" 
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full bg-white border border-[#eaddd2] rounded-xl px-4 py-3 text-sm text-[#4b2311] placeholder:text-text-muted/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#68361c]/80">{language === 'vi' ? 'HỌ' : 'LAST NAME'}</label>
                                    <input 
                                        type="text" 
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="w-full bg-white border border-[#eaddd2] rounded-xl px-4 py-3 text-sm text-[#4b2311] placeholder:text-text-muted/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#68361c]/80">{language === 'vi' ? 'ĐỊA CHỈ NHÀ / ĐƯỜNG' : 'STREET ADDRESS'}</label>
                                    <input 
                                        type="text" 
                                        value={streetAddress}
                                        onChange={(e) => setStreetAddress(e.target.value)}
                                        className="w-full bg-white border border-[#eaddd2] rounded-xl px-4 py-3 text-sm text-[#4b2311] placeholder:text-text-muted/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#68361c]/80">{language === 'vi' ? 'SỐ ĐIỆN THOẠI' : 'PHONE NUMBER'}</label>
                                    <input 
                                        type="text" 
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full bg-white border border-[#eaddd2] rounded-xl px-4 py-3 text-sm text-[#4b2311] placeholder:text-text-muted/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#68361c]/80">{language === 'vi' ? 'TỈNH / THÀNH PHỐ' : 'PROVINCE'}</label>
                                    <input 
                                        type="text" 
                                        value={province}
                                        onChange={(e) => setProvince(e.target.value)}
                                        className="w-full bg-white border border-[#eaddd2] rounded-xl px-4 py-3 text-sm text-[#4b2311] focus:outline-none focus:border-primary"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#68361c]/80">{language === 'vi' ? 'QUẬN / HUYỆN' : 'DISTRICT'}</label>
                                    <input 
                                        type="text" 
                                        value={district}
                                        onChange={(e) => setDistrict(e.target.value)}
                                        className="w-full bg-white border border-[#eaddd2] rounded-xl px-4 py-3 text-sm text-[#4b2311] focus:outline-none focus:border-primary"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#68361c]/80">{language === 'vi' ? 'PHƯỜNG / XÃ' : 'WARD'}</label>
                                    <input 
                                        type="text" 
                                        value={ward}
                                        onChange={(e) => setWard(e.target.value)}
                                        className="w-full bg-white border border-[#eaddd2] rounded-xl px-4 py-3 text-sm text-[#4b2311] focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Premium Sepay VietQR Payment Instruction Modal */}
            <SepayPaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                createdOrder={createdOrder}
                finalTotal={finalTotal}
                simulating={simulating}
                paymentSuccess={paymentSuccess}
                onSimulateWebhook={handleSimulateWebhook}
            />
        </div>
    )
}

export default Checkout
