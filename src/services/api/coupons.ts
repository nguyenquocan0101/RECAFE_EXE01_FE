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
