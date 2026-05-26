import React from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { useToast } from '@/context/ToastContext'

interface SepayPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    createdOrder: any;
    finalTotal: number;
    simulating: boolean;
    paymentSuccess: boolean;
    onSimulateWebhook: () => Promise<void>;
}

const SepayPaymentModal: React.FC<SepayPaymentModalProps> = ({
    isOpen,
    onClose,
    createdOrder,
    finalTotal,
    simulating,
    paymentSuccess,
    onSimulateWebhook
}) => {
    const { language } = useLanguage()
    const { showToast } = useToast()

    if (!isOpen) return null

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text)
        showToast(
            language === 'vi' ? `Đã sao chép ${label}!` : `Copied ${label}!`,
            'success'
        )
    }

    return (
        <div className="fixed inset-0 bg-[#4b2311]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-[32px] border border-[#eaddd2] max-w-2xl w-full overflow-hidden shadow-[0_20px_50px_rgba(75,35,17,0.12)] flex flex-col relative max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-5 border-b border-[#eaddd2]/40 bg-stone-50/50 shrink-0">
                    <h3 className="text-xl font-bold text-[#4b2311] tracking-tight">
                        {language === 'vi' ? 'Thanh Toán Đơn Hàng' : 'Payment Instruction'}
                    </h3>
                    {!paymentSuccess && (
                        <button 
                            onClick={onClose} 
                            className="w-8 h-8 rounded-full border border-[#eaddd2] text-[#68361c] hover:bg-neutral-100 flex items-center justify-center transition-colors cursor-pointer text-sm p-0 focus:outline-none bg-transparent"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    {paymentSuccess ? (
                        <div className="flex flex-col items-center justify-center py-10 space-y-6 text-center animate-scale-up">
                            <div className="w-20 h-20 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center text-emerald-500 shadow-sm relative">
                                <span className="material-symbols-outlined text-4xl animate-pulse">check_circle</span>
                                <span className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping"></span>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-2xl font-black text-[#657b35]">
                                    {language === 'vi' ? 'THANH TOÁN THÀNH CÔNG!' : 'PAYMENT SUCCESSFUL!'}
                                </h4>
                                <p className="text-sm font-semibold text-[#68361c] max-w-sm">
                                    {language === 'vi' 
                                        ? 'Sepay đã xác thực giao dịch chuyển khoản thành công. Đơn hàng của bạn đã được duyệt!' 
                                        : 'Sepay has successfully matched your payment transfer. Your order is confirmed.'}
                                </p>
                            </div>
                            <span className="inline-block text-[10px] font-bold text-[#68361c]/50 uppercase tracking-widest animate-pulse">
                                {language === 'vi' ? 'Tự động chuyển hướng về trang chủ...' : 'Redirecting to homepage...'}
                            </span>
                        </div>
                    ) : (
                        <>
                            {/* Alert banner */}
                            <div className="bg-[#657b35]/5 border border-[#657b35]/15 rounded-2xl p-4 text-xs font-semibold text-[#657b35] flex items-start gap-3">
                                <span className="material-symbols-outlined text-lg shrink-0 mt-0.5">info</span>
                                <p>
                                    {language === 'vi' 
                                        ? 'Đơn hàng của bạn đã được tạo trên hệ thống. Hãy quét mã QR bên dưới hoặc chuyển khoản chính xác để hoàn tất thanh toán.' 
                                        : 'Your order has been created. Please scan the QR code below or transfer the exact amount to confirm payment.'}
                                </p>
                            </div>

                            {/* VietQR layout */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                                {/* QR code card */}
                                <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-[#fcfbf9] rounded-[24px] group">
                                    <img 
                                        src={createdOrder?.paymentQrUrl || `https://img.vietqr.io/image/vietinbank-123456789-qr_only.png?amount=${finalTotal}&addInfo=RECAFE%20${createdOrder?.id?.slice(0, 8)}&accountName=RE%20CAFE%20VIETNAM`} 
                                        alt="VietQR Payment Code" 
                                        className="w-48 h-48 object-contain rounded-xl group-hover:scale-105 transition-transform duration-300 bg-white"
                                    />
                                    <span className="text-[9px] font-extrabold text-[#657b35] mt-3 uppercase tracking-wider flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                                        {language === 'vi' ? 'Quét QR qua App Ngân hàng' : 'Scan via Mobile Banking App'}
                                    </span>
                                </div>

                                {/* Details fields */}
                                <div className="md:col-span-7 space-y-3.5 text-xs text-[#68361c]">
                                    {/* Bank */}
                                    <div className="flex justify-between items-center py-2.5 border-b border-[#eaddd2]/40">
                                        <span className="font-bold text-[#68361c]/70 uppercase tracking-wider text-[10px]">Ngân hàng</span>
                                        <span className="font-bold text-[#4b2311] text-right">VietinBank (ICB)</span>
                                    </div>

                                    {/* Account number */}
                                    <div className="flex justify-between items-center py-2.5 border-b border-[#eaddd2]/40">
                                        <span className="font-bold text-[#68361c]/70 uppercase tracking-wider text-[10px]">Số tài khoản</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-bold text-[#4b2311]">123456789</span>
                                            <button 
                                                onClick={() => handleCopy('123456789', language === 'vi' ? 'số tài khoản' : 'account number')}
                                                className="text-[10px] font-bold text-[#657b35] hover:underline cursor-pointer border-none bg-transparent"
                                            >
                                                {language === 'vi' ? 'Sao chép' : 'Copy'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Account name */}
                                    <div className="flex justify-between items-center py-2.5 border-b border-[#eaddd2]/40">
                                        <span className="font-bold text-[#68361c]/70 uppercase tracking-wider text-[10px]">Chủ tài khoản</span>
                                        <span className="font-extrabold text-[#4b2311] uppercase">RE:CAFE VIETNAM</span>
                                    </div>

                                    {/* Amount */}
                                    <div className="flex justify-between items-center py-2.5 border-b border-[#eaddd2]/40">
                                        <span className="font-bold text-[#68361c]/70 uppercase tracking-wider text-[10px]">Số tiền</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-black text-[#657b35] text-sm">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finalTotal)}
                                            </span>
                                            <button 
                                                onClick={() => handleCopy(String(finalTotal), language === 'vi' ? 'số tiền' : 'amount')}
                                                className="text-[10px] font-bold text-[#657b35] hover:underline cursor-pointer border-none bg-transparent"
                                            >
                                                {language === 'vi' ? 'Sao chép' : 'Copy'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Transfer message */}
                                    <div className="flex justify-between items-center py-2.5 border-b border-[#eaddd2]/40">
                                        <span className="font-bold text-[#68361c]/70 uppercase tracking-wider text-[10px]">Nội dung</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-bold bg-amber-50 px-2 py-1 rounded text-[#4b2311] border border-[#eaddd2]/60">
                                                {`RECAFE ${createdOrder?.id?.slice(0, 8)}`}
                                            </span>
                                            <button 
                                                onClick={() => handleCopy(`RECAFE ${createdOrder?.id?.slice(0, 8)}`, language === 'vi' ? 'nội dung chuyển khoản' : 'memo')}
                                                className="text-[10px] font-bold text-[#657b35] hover:underline cursor-pointer border-none bg-transparent"
                                            >
                                                {language === 'vi' ? 'Sao chép' : 'Copy'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Simulator Box */}
                            <div className="pt-6 border-t border-[#eaddd2]/40 space-y-4">
                                <div className="flex items-center gap-2">
                                    <span className="h-px bg-[#eaddd2] flex-1"></span>
                                    <span className="text-[9px] font-bold text-[#68361c]/50 uppercase tracking-widest shrink-0">  cổng thanh toán Sepay</span>
                                    <span className="h-px bg-[#eaddd2] flex-1"></span>
                                </div>

                                <button 
                                    onClick={onSimulateWebhook}
                                    disabled={simulating}
                                    className="w-full bg-[#657b35] hover:bg-[#798e3a] disabled:opacity-50 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-lg transition-all border-none cursor-pointer uppercase tracking-wider text-[11px] flex items-center justify-center gap-2"
                                >
                                    {simulating ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>ĐANG KÍCH HOẠT WEBHOOK...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-sm">bolt</span>
                                            <span> Đã thanh toán</span>
                                        </>
                                    )}
                                </button>
                                {/* <p className="text-[10px] font-medium text-center text-[#68361c]/70">
                                    * Hệ thống sẽ gửi một request `POST /api/sepay-webhook` chứa `code: ${createdOrder?.id}` để   giao dịch ngân hàng thành công thực tế.
                                </p> */}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default SepayPaymentModal
