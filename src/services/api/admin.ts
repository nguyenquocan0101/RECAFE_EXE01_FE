const apiUrl = import.meta.env.VITE_API_URL || '/';

const authHeader = (): Record<string, string> => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const handleResponse = async (res: Response) => {
    if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || `Request failed: ${res.status}`);
    }
    // 204 No Content
    if (res.status === 204) return null;
    return res.json();
};

// ─── Orders ────────────────────────────────────────────────────────────────

export const getAdminOrders = () =>
    fetch(`${apiUrl}api/admin/orders`, {
        headers: { 'Content-Type': 'application/json', ...authHeader() }
    }).then(handleResponse);

export const getAdminOrderById = (id: string) =>
    fetch(`${apiUrl}api/admin/orders/${id}`, {
        headers: { 'Content-Type': 'application/json', ...authHeader() }
    }).then(handleResponse);

export const updateOrderStatus = (id: string, status: string) =>
    fetch(`${apiUrl}api/admin/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ status })
    }).then(handleResponse);

// ─── Review moderation ────────────────────────────────────────────────────

export interface AdminReviewMedia {
    id: string;
    url: string;
    mediaType: string;
}

export interface AdminReview {
    id: string;
    userId: string;
    productId: string;
    orderId: string;
    productName: string;
    reviewerName: string;
    rating: number;
    comment?: string | null;
    isVisible: boolean;
    isVerifiedPurchase: boolean;
    createdAt: string;
    media: AdminReviewMedia[];
}

export interface AdminReviewPage {
    page: number;
    pageSize: number;
    totalReviews: number;
    totalPages: number;
    reviews: AdminReview[];
}

export interface AdminReviewQuery {
    page?: number;
    pageSize?: number;
    isVisible?: boolean;
    productKeyword?: string;
    rating?: number;
}

export const getAdminReviews = (params: AdminReviewQuery = {}) => {
    const query = new URLSearchParams();
    query.set('page', String(params.page || 1));
    query.set('pageSize', String(params.pageSize || 10));
    if (params.isVisible !== undefined) query.set('isVisible', String(params.isVisible));
    if (params.productKeyword?.trim()) query.set('productKeyword', params.productKeyword.trim());
    if (params.rating) query.set('rating', String(params.rating));

    return fetch(`${apiUrl}api/admin/reviews?${query.toString()}`, {
        headers: { 'Content-Type': 'application/json', ...authHeader() }
    }).then(handleResponse);
};

export const setReviewVisibility = (id: string, isVisible: boolean) =>
    fetch(`${apiUrl}api/admin/reviews/${id}/visibility`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ isVisible })
    }).then(handleResponse);

// ─── Categories ────────────────────────────────────────────────────────────

export const getAdminCategories = () =>
    fetch(`${apiUrl}api/admin/categories`, {
        headers: { 'Content-Type': 'application/json', ...authHeader() }
    }).then(handleResponse);

export const createCategory = (data: { name: string; slug: string; description?: string; isActive?: boolean }) =>
    fetch(`${apiUrl}api/admin/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(data)
    }).then(handleResponse);

export const updateCategory = (id: string, data: { name: string; slug: string; description?: string; isActive?: boolean }) =>
    fetch(`${apiUrl}api/admin/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(data)
    }).then(handleResponse);

export const deleteCategory = (id: string) =>
    fetch(`${apiUrl}api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...authHeader() }
    }).then(handleResponse);

// ─── Products ──────────────────────────────────────────────────────────────

export const getAdminProducts = () =>
    fetch(`${apiUrl}api/admin/products`, {
        headers: { 'Content-Type': 'application/json', ...authHeader() }
    }).then(handleResponse);

export const getAdminProductById = (id: string) =>
    fetch(`${apiUrl}api/admin/products/${id}`, {
        headers: { 'Content-Type': 'application/json', ...authHeader() }
    }).then(handleResponse);

const convertToFormData = (data: Record<string, any>): FormData => {
    if (data instanceof FormData) return data;
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            // Map camelCase keys to TitleCase expected by ASP.NET Core
            const titleKey = key === 'sku' ? 'SKU' : (key.charAt(0).toUpperCase() + key.slice(1));
            if (value instanceof File) {
                formData.append(titleKey, value);
            } else if (Array.isArray(value)) {
                value.forEach(item => {
                    formData.append(titleKey, item);
                });
            } else if (typeof value === 'boolean') {
                formData.append(titleKey, value ? 'true' : 'false');
            } else {
                formData.append(titleKey, String(value));
            }
        }
    });
    return formData;
};

export const createProduct = (data: Record<string, any> | FormData) => {
    const isFormData = data instanceof FormData;
    return fetch(`${apiUrl}api/admin/products`, {
        method: 'POST',
        headers: isFormData 
            ? { ...authHeader() } 
            : { 'Content-Type': 'application/json', ...authHeader() },
        body: isFormData ? data : JSON.stringify(data)
    }).then(handleResponse);
};

export const updateProduct = (id: string, data: Record<string, any> | FormData) => {
    const isFormData = data instanceof FormData;
    return fetch(`${apiUrl}api/admin/products/${id}`, {
        method: 'PUT',
        headers: isFormData 
            ? { ...authHeader() } 
            : { 'Content-Type': 'application/json', ...authHeader() },
        body: isFormData ? data : JSON.stringify(data)
    }).then(handleResponse);
};

export const deleteProduct = (id: string) =>
    fetch(`${apiUrl}api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...authHeader() }
    }).then(handleResponse);

export const uploadProductImages = (id: string, files: File[], replaceImages: boolean = true) => {
    const formData = new FormData();
    formData.append('ReplaceImages', replaceImages ? 'true' : 'false');
    files.forEach(file => {
        formData.append('ImageUrls', file);
    });
    return fetch(`${apiUrl}api/admin/products/${id}/images`, {
        method: 'POST',
        headers: { ...authHeader() },
        body: formData
    }).then(handleResponse);
};

export const uploadProduct3DModel = (id: string, file: File) => {
    const formData = new FormData();
    formData.append('File', file);
    return fetch(`${apiUrl}api/admin/products/${id}/model-3d`, {
        method: 'POST',
        headers: { ...authHeader() },
        body: formData
    }).then(handleResponse);
};

// ─── Users ─────────────────────────────────────────────────────────────────

export const getAdminUsers = (params?: { role?: number; isActive?: boolean; keyword?: string }) => {
    const query = new URLSearchParams();
    if (params?.role !== undefined) query.set('role', String(params.role));
    if (params?.isActive !== undefined) query.set('isActive', String(params.isActive));
    if (params?.keyword) query.set('keyword', params.keyword);
    const qs = query.toString();
    return fetch(`${apiUrl}api/admin/users${qs ? `?${qs}` : ''}`, {
        headers: { 'Content-Type': 'application/json', ...authHeader() }
    }).then(handleResponse);
};

export const getAdminUserById = (id: string) =>
    fetch(`${apiUrl}api/admin/users/${id}`, {
        headers: { 'Content-Type': 'application/json', ...authHeader() }
    }).then(handleResponse);

export const updateAdminUser = (id: string, data: { email: string; fullName: string; phone?: string; birthday?: string | null; role: number; isActive: boolean }) =>
    fetch(`${apiUrl}api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(data)
    }).then(handleResponse);

export const setUserActive = (id: string, isActive: boolean) =>
    fetch(`${apiUrl}api/admin/users/${id}/active`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ isActive })
    }).then(handleResponse);

// ─── Public (reused in admin context) ─────────────────────────────────────

export const getCategories = () =>
    fetch(`${apiUrl}api/Categories`, {
        headers: { 'Content-Type': 'application/json', ...authHeader() }
    }).then(handleResponse);

export const getProducts = () =>
    fetch(`${apiUrl}api/Products`, {
        headers: { 'Content-Type': 'application/json', ...authHeader() }
    }).then(handleResponse);

// ─── Coupons ────────────────────────────────────────────────────────────────

export interface AdminCouponPayload {
    code: string;
    type: number;       // 0=Percentage, 1=FixedAmount
    scope: number;      // 0=Order, 1=Product, 2=Category
    value?: number;
    maxDiscountAmount?: number | null;
    minimumOrderAmount?: number | null;
    usageLimit?: number;
    startDate: string;  // ISO datetime
    endDate: string;    // ISO datetime
    isActive?: boolean;
    productIds?: string[] | null;
}

export const getAdminCoupons = (params?: { isActive?: boolean; scope?: number; type?: number; keyword?: string }) => {
    const query = new URLSearchParams();
    if (params?.isActive !== undefined) query.set('isActive', String(params.isActive));
    if (params?.scope !== undefined) query.set('scope', String(params.scope));
    if (params?.type !== undefined) query.set('type', String(params.type));
    if (params?.keyword) query.set('keyword', params.keyword);
    const qs = query.toString();
    return fetch(`${apiUrl}api/admin/coupons${qs ? `?${qs}` : ''}`, {
        headers: { 'Content-Type': 'application/json', ...authHeader() }
    }).then(handleResponse);
};

export const getAdminCouponById = (id: string) =>
    fetch(`${apiUrl}api/admin/coupons/${id}`, {
        headers: { 'Content-Type': 'application/json', ...authHeader() }
    }).then(handleResponse);

export const createAdminCoupon = (data: AdminCouponPayload) =>
    fetch(`${apiUrl}api/admin/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(data)
    }).then(handleResponse);

export const updateAdminCoupon = (id: string, data: AdminCouponPayload) =>
    fetch(`${apiUrl}api/admin/coupons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(data)
    }).then(handleResponse);

export const deleteAdminCoupon = (id: string) =>
    fetch(`${apiUrl}api/admin/coupons/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...authHeader() }
    }).then(handleResponse);
