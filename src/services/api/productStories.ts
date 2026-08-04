const apiUrl = import.meta.env.VITE_API_URL || '/';

export interface ProductStoryPublic {
    slug: string;
    productName: string;
    productSlug: string;
    coffeeTypeName: string;
    coffeeTypeSlug: string;
    contentHtmlVi: string;
    contentHtmlEn: string;
    landingPageUrl: string;
    updatedAt?: string | null;
}

export class ApiRequestError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = 'ApiRequestError';
        this.status = status;
    }
}

const request = async (slug: string, signal?: AbortSignal): Promise<ProductStoryPublic> => {
    const response = await fetch(`${apiUrl}api/product-stories/${encodeURIComponent(slug)}`, { signal });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
        throw new ApiRequestError(payload?.message || 'Unable to load this product story.', response.status);
    }

    return (payload?.data ?? payload) as ProductStoryPublic;
};

export const getProductStory = request;
