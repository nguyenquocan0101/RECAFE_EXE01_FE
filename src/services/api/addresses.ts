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

export interface AddressPayload {
    id?: string;
    receiverName: string;
    phone: string;
    province: string;
    district: string;
    ward: string;
    detailAddress: string;
    isDefault?: boolean;
}

export const getAddresses = async () => {
    const response = await fetch(`${apiUrl}api/addresses`, {
        method: 'GET',
        headers: getHeaders()
    });
    return handleResponse(response);
};

export const createAddress = async (data: AddressPayload) => {
    const response = await fetch(`${apiUrl}api/addresses`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(response);
};

export const updateAddress = async (id: string, data: AddressPayload) => {
    const response = await fetch(`${apiUrl}api/addresses/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(response);
};

export const deleteAddress = async (id: string) => {
    const response = await fetch(`${apiUrl}api/addresses/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    return handleResponse(response);
};

export const setDefaultAddress = async (id: string) => {
    const response = await fetch(`${apiUrl}api/addresses/${id}/set-default`, {
        method: 'PUT',
        headers: getHeaders()
    });
    return handleResponse(response);
};
