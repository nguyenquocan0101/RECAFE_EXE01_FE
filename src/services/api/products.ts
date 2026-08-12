const apiUrl = import.meta.env.VITE_API_URL || '/';

export interface ProductViewCountResponse {
    viewCount: number;
}

export const incrementProductView = async (productId: string): Promise<number> => {
    const response = await fetch(`${apiUrl}api/products/${encodeURIComponent(productId)}/view`, {
        method: 'POST',
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(payload?.message || 'Unable to register product view.');
    }

    const data = (payload?.data ?? payload) as ProductViewCountResponse;
    return data.viewCount;
};
