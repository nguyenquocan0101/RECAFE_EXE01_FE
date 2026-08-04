const apiUrl = import.meta.env.VITE_API_URL || '/';

const authHeader = (): Record<string, string> => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = async <T>(response: Response): Promise<T> => {
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
        const error = new Error(payload?.message || `Request failed: ${response.status}`) as Error & { status?: number };
        error.status = response.status;
        throw error;
    }
    return (payload?.data ?? payload) as T;
};

export interface ProductStoryAdmin {
    id: string;
    productId: string;
    coffeeTypeId: string;
    slug: string;
    productName: string;
    productSlug: string;
    coffeeTypeName: string;
    coffeeTypeSlug: string;
    contentHtmlVi: string;
    contentHtmlEn: string;
    isPublished: boolean;
    createdAt: string;
    updatedAt?: string | null;
    landingPageUrl: string;
    sharedQrCount: number;
}

export interface ProductStoryPage {
    page: number;
    pageSize: number;
    totalStories: number;
    totalPages: number;
    stories: ProductStoryAdmin[];
}

export interface CoffeeTypeOption {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
    displayOrder: number;
}

export interface ProductStoryPayload {
    productId: string;
    coffeeTypeId: string;
    contentHtmlVi: string;
    contentHtmlEn: string;
}

const jsonHeaders = () => ({ 'Content-Type': 'application/json', ...authHeader() });

export const getAdminProductStories = async (params: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    isPublished?: boolean;
} = {}) => {
    const query = new URLSearchParams();
    query.set('page', String(params.page || 1));
    query.set('pageSize', String(params.pageSize || 20));
    if (params.keyword?.trim()) query.set('keyword', params.keyword.trim());
    if (params.isPublished !== undefined) query.set('isPublished', String(params.isPublished));

    const response = await fetch(`${apiUrl}api/admin/product-stories?${query.toString()}`, { headers: jsonHeaders() });
    return handleResponse<ProductStoryPage>(response);
};

export const getAdminProductStory = async (id: string) => {
    const response = await fetch(`${apiUrl}api/admin/product-stories/${id}`, { headers: jsonHeaders() });
    return handleResponse<ProductStoryAdmin>(response);
};

export const createProductStory = async (payload: ProductStoryPayload) => {
    const response = await fetch(`${apiUrl}api/admin/product-stories`, {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify(payload),
    });
    return handleResponse<ProductStoryAdmin>(response);
};

export const updateProductStory = async (id: string, payload: Pick<ProductStoryPayload, 'contentHtmlVi' | 'contentHtmlEn'>) => {
    const response = await fetch(`${apiUrl}api/admin/product-stories/${id}`, {
        method: 'PUT',
        headers: jsonHeaders(),
        body: JSON.stringify(payload),
    });
    return handleResponse<ProductStoryAdmin>(response);
};

export const setProductStoryPublication = async (id: string, isPublished: boolean) => {
    const response = await fetch(`${apiUrl}api/admin/product-stories/${id}/publication`, {
        method: 'PATCH',
        headers: jsonHeaders(),
        body: JSON.stringify({ isPublished }),
    });
    return handleResponse<ProductStoryAdmin>(response);
};

export const getActiveCoffeeTypes = async () => {
    const response = await fetch(`${apiUrl}api/admin/product-stories/coffee-types`, { headers: jsonHeaders() });
    return handleResponse<CoffeeTypeOption[]>(response);
};

export const getCoffeeTypes = async () => {
    const response = await fetch(`${apiUrl}api/admin/coffee-types`, { headers: jsonHeaders() });
    return handleResponse<CoffeeTypeOption[]>(response);
};

export const createCoffeeType = async (payload: Pick<CoffeeTypeOption, 'name' | 'slug' | 'displayOrder'>) => {
    const response = await fetch(`${apiUrl}api/admin/coffee-types`, {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify(payload),
    });
    return handleResponse<CoffeeTypeOption>(response);
};

export const updateCoffeeType = async (id: string, payload: Pick<CoffeeTypeOption, 'name' | 'slug' | 'displayOrder'>) => {
    const response = await fetch(`${apiUrl}api/admin/coffee-types/${id}`, {
        method: 'PUT',
        headers: jsonHeaders(),
        body: JSON.stringify(payload),
    });
    return handleResponse<CoffeeTypeOption>(response);
};

export const setCoffeeTypeActive = async (id: string, isActive: boolean) => {
    const response = await fetch(`${apiUrl}api/admin/coffee-types/${id}/active`, {
        method: 'PATCH',
        headers: jsonHeaders(),
        body: JSON.stringify({ isActive }),
    });
    return handleResponse<CoffeeTypeOption>(response);
};
