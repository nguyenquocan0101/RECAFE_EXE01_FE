import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authApi from '@/services/api/auth';

interface User {
    id?: string;
    username: string;
    email: string;
    fullName?: string;
    role?: number | string;
    [key: string]: any;
}

interface AuthContextProps {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isStaff: boolean;
    isCustomer: boolean;
    isLoading: boolean;
    error: string | null;
    isLoginModalOpen: boolean;
    loginReason: string | undefined;
    openLoginModal: (reason?: string) => void;
    closeLoginModal: () => void;
    login: (usernameOrEmail: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string, fullName?: string) => Promise<void>;
    logout: () => Promise<void>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
    clearError: () => void;
}



const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [loginReason, setLoginReason] = useState<string | undefined>(undefined);

    const openLoginModal = (reason?: string) => {
        setLoginReason(reason);
        setIsLoginModalOpen(true);
    };
    const closeLoginModal = () => {
        setIsLoginModalOpen(false);
        setLoginReason(undefined);
    };

    const fetchUserProfile = async (authToken: string) => {
        try {
            const profileData = await authApi.getMe();
            // Handle if profile response has a nesting like profileData.data or profileData.user
            const userProfile = profileData?.user || profileData?.data || profileData;
            setUser(userProfile);
        } catch (err: any) {
            console.error('Failed to fetch user profile', err);
            // If fetching me fails, token might be invalid or expired
            handleLogoutState();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchUserProfile(token);
        } else {
            setIsLoading(false);
        }
    }, [token]);

    const handleLogoutState = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        window.location.href = '/';
    };

    const login = async (usernameOrEmail: string, password: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await authApi.login(usernameOrEmail, password);
            // token field first, then fallbacks
            const authToken = data?.token || data?.accessToken || data?.data?.token || data?.data?.accessToken;
            
            if (authToken && typeof authToken === 'string') {
                localStorage.setItem('token', authToken);
                setToken(authToken);
                await fetchUserProfile(authToken);
            } else {
                // Cookie-based: no token in body, user data may be directly in response
                const userObj = data?.user || data?.data || data;
                setUser(userObj);
                setIsLoading(false);
            }
        } catch (err: any) {
            setError(err.message || 'Login failed');
            setIsLoading(false);
            throw err;
        }
    };

    const register = async (username: string, email: string, password: string, fullName?: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await authApi.register(username, email, password, fullName);
            const authToken = data?.token || data?.accessToken || data?.data?.token || data?.data?.accessToken;
            
            if (authToken && typeof authToken === 'string') {
                localStorage.setItem('token', authToken);
                setToken(authToken);
                await fetchUserProfile(authToken);
            } else {
                // Some backends require logging in after registration, or automatically logs in and returns user info
                // If it doesn't return a token, we just automatically log them in via the login service
                try {
                    await login(username, password);
                } catch {
                    // If autologin fails, they can log in manually
                    setIsLoading(false);
                }
            }
        } catch (err: any) {
            setError(err.message || 'Registration failed');
            setIsLoading(false);
            throw err;
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await authApi.logout();
        } catch (err) {
            console.error('API logout failed, clearing client state anyway', err);
        } finally {
            handleLogoutState();
            setIsLoading(false);
        }
    };

    const changePassword = async (currentPassword: string, newPassword: string) => {
        setIsLoading(true);
        setError(null);
        try {
            await authApi.changePassword(currentPassword, newPassword);
            setIsLoading(false);
        } catch (err: any) {
            setError(err.message || 'Change password failed');
            setIsLoading(false);
            throw err;
        }
    };

    const clearError = () => setError(null);

    const role = user?.role;
    const isAdmin = role === 'Admin' || role === 2;
    const isStaff = role === 'Staff' || role === 1;
    const isCustomer = role === 'Customer' || role === 0;

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!user,
                isAdmin,
                isStaff,
                isCustomer,
                isLoading,
                error,
                isLoginModalOpen,
                loginReason,
                openLoginModal,
                closeLoginModal,
                login,
                register,
                logout,
                changePassword,
                clearError
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
