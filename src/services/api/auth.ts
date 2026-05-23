const apiUrl = import.meta.env.VITE_API_URL || '';

export const login = async (usernameOrEmail: string, password: string) => {
    const response = await fetch(`${apiUrl}api/Auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            usernameOrEmail,
            password
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Login failed');
    }

    const data = await response.json();
    return data;
};

export const register = async (username: string, email: string, password: string, fullName?: string) => {
    const response = await fetch(`${apiUrl}api/Auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username,
            email,
            password,
            fullName: fullName || null
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Registration failed');
    }

    const data = await response.json();
    return data;
};

export const logout = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiUrl}api/Auth/logout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Logout failed');
    }

    return true;
};

export const getMe = async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');

    const response = await fetch(`${apiUrl}api/Auth/me`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to fetch profile info');
    }

    const data = await response.json();
    return data;
};

export const changePassword = async (currentPassword: string, newPassword: string) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');

    const response = await fetch(`${apiUrl}api/Auth/change-password`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            currentPassword,
            newPassword
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to change password');
    }

    return true;
};
