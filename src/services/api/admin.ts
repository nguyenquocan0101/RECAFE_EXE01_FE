const apiUrl = import.meta.env.VITE_API_URL || '';

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

export const createProduct = (data: Record<string, any>) =>
    fetch(`${apiUrl}api/admin/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(data)
    }).then(handleResponse);

export const updateProduct = (id: string, data: Record<string, any>) =>
    fetch(`${apiUrl}api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(data)
    }).then(handleResponse);

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
