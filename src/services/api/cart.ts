const apiUrl = import.meta.env.VITE_API_URL || '/';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const getCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        return null; // Return null if not logged in
    }

    const response = await fetch(`${apiUrl}api/cart`, {
        method: 'GET',
        headers: getHeaders()
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to get cart');
    }
    return response.json();
};

export const addCartItem = async (productId: string, quantity: number, variantId: string | null = null, personalizationNote: string | null = null) => {
    const response = await fetch(`${apiUrl}api/cart/items`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
            productId,
            quantity,
            variantId,
            personalizationNote
        })
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to add item to cart');
    }
    return response.json();
};

export const updateCartItem = async (id: string, quantity: number, personalizationNote: string | null = null) => {
    const response = await fetch(`${apiUrl}api/cart/items/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
            quantity,
            personalizationNote
        })
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to update item in cart');
    }
    return response.json();
};

export const removeCartItem = async (id: string) => {
    const response = await fetch(`${apiUrl}api/cart/items/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to remove item from cart');
    }
    return response.json();
};

export const clearCart = async () => {
    const response = await fetch(`${apiUrl}api/cart/clear`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to clear cart');
    }
    return response.json();
};
