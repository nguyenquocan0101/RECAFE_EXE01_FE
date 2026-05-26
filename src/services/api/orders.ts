const apiUrl = import.meta.env.VITE_API_URL || '/';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

const handleResponse = async (res: Response) => {
    if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || `Request failed: ${res.status}`);
    }
    if (res.status === 204) return null;
    return res.json();
};

export interface CreateAddressPayload {
    receiverName: string;
    phone: string;
    province: string;
    district: string;
    ward: string;
    detailAddress: string;
    isDefault?: boolean;
}

export interface CheckoutOrderPayload {
    shippingAddress: CreateAddressPayload;
    note?: string | null;
    couponCode?: string | null;
    paymentMethod: number; // 0, 1, 2, 3
    cartItemIds?: string[] | null;
}

export interface CreateOrderPayload {
    shippingAddressId: string; // uuid
    note?: string | null;
    couponCode?: string | null;
    paymentMethod: number; // 0, 1, 2, 3
    cartItemIds?: string[] | null;
}

export interface SepayWebhookPayload {
    id: number;
    gateway?: string | null;
    transactionDate?: string | null;
    accountNumber?: string | null;
    subAccount?: string | null;
    transferType?: string | null;
    transferAmount: number;
    accumulated?: number;
    code?: string | null;
    content?: string | null;
    referenceCode?: string | null;
    paymentChannel?: string | null;
}

export const createOrder = async (data: CreateOrderPayload) => {
    const response = await fetch(`${apiUrl}api/orders`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(response);
};

export const checkoutOrder = async (data: CheckoutOrderPayload) => {
    const response = await fetch(`${apiUrl}api/orders/checkout`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(response);
};

export const simulateSepayWebhook = async (data: SepayWebhookPayload) => {
    const response = await fetch(`${apiUrl}api/sepay-webhook`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Apikey sandbox_sepay_api_key_123456'
        },
        body: JSON.stringify(data)
    });
    return handleResponse(response);
};
