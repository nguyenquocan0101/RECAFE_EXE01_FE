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
    const body = data instanceof FormData ? data : convertToFormData(data);
    return fetch(`${apiUrl}api/admin/products`, {
        method: 'POST',
        headers: { ...authHeader() },
        body
    }).then(handleResponse);
};

export const updateProduct = (id: string, data: Record<string, any> | FormData) => {
    const body = data instanceof FormData ? data : convertToFormData(data);
    return fetch(`${apiUrl}api/admin/products/${id}`, {
        method: 'PUT',
        headers: { ...authHeader() },
        body
    }).then(handleResponse);
};

export const deleteProduct = (id: string) =>
    fetch(`${apiUrl}api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...authHeader() }
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
