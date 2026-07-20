const apiUrl = import.meta.env.VITE_API_URL || '/';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export interface CouponPreviewRequest {
    couponCode: string;
    cartItemIds: string[];
}

export interface CouponPreviewResponse {
    couponCode: string;
    scope: string;
    discountType: string;
    discountValue: number;
    maxDiscountAmount?: number | null;
    eligibleSubtotal: number;
    cartSubtotal: number;
    discountAmount: number;
    shippingFee: number;
    totalAfterDiscount: number;
    applicableCartItemIds: string[];
    inapplicableCartItemIds: string[];
}

export const getCouponErrorMessage = (message: string, language: 'vi' | 'en') => {
    const normalizedMessage = message.toLowerCase();

    if (normalizedMessage.includes('not applicable to selected products')) {
        return language === 'vi'
            ? 'Voucher không áp dụng cho sản phẩm trong giỏ hàng.'
            : 'This voucher does not apply to the products in your cart.';
    }

    if (normalizedMessage.includes('invalid or inactive')) {
        return language === 'vi'
            ? 'Voucher không tồn tại hoặc đã ngừng hoạt động.'
            : 'This voucher does not exist or is no longer active.';
    }

    if (normalizedMessage.includes('expired or is not yet active')) {
        return language === 'vi'
            ? 'Voucher đã hết hạn hoặc chưa đến thời gian sử dụng.'
            : 'This voucher has expired or is not active yet.';
    }

    if (normalizedMessage.includes('maximum usage limit')) {
        return language === 'vi'
            ? 'Voucher đã hết lượt sử dụng.'
            : 'This voucher has reached its usage limit.';
    }

    if (normalizedMessage.includes('eligible subtotal must be at least')) {
        return language === 'vi'
            ? message.replace('Your eligible subtotal must be at least', 'Giá trị sản phẩm áp dụng voucher phải từ').replace(' VND to use this coupon.', ' VND.')
            : message;
    }

    if (normalizedMessage.includes('cart is empty')) {
        return language === 'vi'
            ? 'Giỏ hàng đang trống, không thể áp dụng voucher.'
            : 'Your cart is empty, so the voucher cannot be applied.';
    }

    return message;
};

export const previewCoupon = async (data: CouponPreviewRequest): Promise<CouponPreviewResponse> => {
    const response = await fetch(`${apiUrl}api/coupons/preview`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });

    const json = await response.json().catch(() => null);

    if (!response.ok || json?.success === false) {
        throw new Error(json?.message || `Coupon preview failed: ${response.status}`);
    }

    // Unwrap ApiResponse<T> wrapper
    return (json?.data ?? json) as CouponPreviewResponse;
};
