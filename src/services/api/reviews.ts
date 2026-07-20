const apiUrl = import.meta.env.VITE_API_URL || '/';

export interface ReviewMedia {
    id: string;
    url: string;
    mediaType: 'image' | 'video' | string;
}

export interface Review {
    id: string;
    productId: string;
    productName: string;
    reviewerName: string;
    rating: number;
    comment?: string | null;
    isVerifiedPurchase: boolean;
    createdAt: string;
    media: ReviewMedia[];
}

export interface ReviewPage {
    productId: string;
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<string, number>;
    page: number;
    pageSize: number;
    totalPages: number;
    reviews: Review[];
}

export interface ReviewQuery {
    page?: number;
    pageSize?: number;
    rating?: number;
    withMedia?: boolean;
}

const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = async <T>(response: Response): Promise<T | null> => {
    if (!response.ok) {
        const error = await response.json().catch(() => null);
        const validationMessage = error?.errors
            ? Object.values(error.errors).flat().join(' ')
            : null;
        throw new Error(validationMessage || error?.message || `Request failed: ${response.status}`);
    }

    if (response.status === 204) return null;
    const body = await response.json();
    return body?.data ?? body;
};

export const getProductReviews = async (productId: string, query: ReviewQuery = {}) => {
    const params = new URLSearchParams();
    params.set('page', String(query.page || 1));
    params.set('pageSize', String(query.pageSize || 5));
    if (query.rating) params.set('rating', String(query.rating));
    if (query.withMedia) params.set('withMedia', 'true');

    const response = await fetch(`${apiUrl}api/reviews/product/${productId}?${params.toString()}`);
    return handleResponse<ReviewPage>(response);
};

export const getMyReview = async (reviewId: string) => {
    const response = await fetch(`${apiUrl}api/reviews/${reviewId}`, {
        headers: getAuthHeaders()
    });
    return handleResponse<Review>(response);
};

export const createReview = async (payload: {
    orderId: string;
    productId: string;
    rating: number;
    comment?: string;
    files: File[];
}) => {
    const formData = new FormData();
    formData.append('OrderId', payload.orderId);
    formData.append('ProductId', payload.productId);
    formData.append('Rating', String(payload.rating));
    if (payload.comment?.trim()) formData.append('Comment', payload.comment.trim());
    payload.files.forEach(file => formData.append('Files', file, file.name));

    const response = await fetch(`${apiUrl}api/reviews`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
    });
    return handleResponse<Review>(response);
};

export const deleteReview = async (reviewId: string) => {
    const response = await fetch(`${apiUrl}api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    return handleResponse<null>(response);
};
