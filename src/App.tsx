import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import AdminLayout from '@/layouts/AdminLayout'
import Home from '@/pages/Home'
import ProductListing from '@/pages/ProductListing'
import ProductDetail from '@/pages/ProductDetail'
import EnvironmentalImpact from '@/pages/EnvironmentalImpact'
import Checkout from '@/pages/Checkout'
import Profile from '@/pages/Profile'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminOrders from '@/pages/admin/AdminOrders'
import AdminProducts from '@/pages/admin/AdminProducts'
import AdminCategories from '@/pages/admin/AdminCategories'
import AdminUsers from '@/pages/admin/AdminUsers'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import LoginModal from '@/components/auth/LoginModal'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import ReCafeLoader from '@/components/common/ReCafeLoader'
import ScrollToTop from '@/components/common/ScrollToTop'

export default function App() {
    const { isLoginModalOpen, closeLoginModal, loginReason, isLoading: isAuthLoading, isAuthenticated } = useAuth();
    const { isLoading: isCartLoading } = useCart();
    const [isMinTimeElapsed, setIsMinTimeElapsed] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setIsMinTimeElapsed(true);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    React.useEffect(() => {
        if (isMinTimeElapsed) {
            if (!isAuthLoading) {
                if (isAuthenticated) {
                    if (!isCartLoading) {
                        setIsLoading(false);
                    }
                } else {
                    setIsLoading(false);
                }
            }
        }
    }, [isMinTimeElapsed, isAuthLoading, isAuthenticated, isCartLoading]);

    return (
        <>
            {isLoading && <ReCafeLoader />}
            <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} reason={loginReason} />
            <BrowserRouter>
                <ScrollToTop />
                <Routes>
                    {/* Public routes */}
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/products" element={<ProductListing />} />
                        <Route path="/products/:slug" element={<ProductDetail />} />
                        <Route path="/environmental-impact" element={<EnvironmentalImpact />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/profile" element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        } />
                    </Route>

                    {/* Admin / Staff routes */}
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute allowedRoles={['Admin', 'Staff']}>
                                <AdminLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={
                            <ProtectedRoute allowedRoles={['Admin']}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="orders" element={<AdminOrders />} />
                        <Route path="products" element={
                            <ProtectedRoute allowedRoles={['Admin']}>
                                <AdminProducts />
                            </ProtectedRoute>
                        } />
                        <Route path="categories" element={
                            <ProtectedRoute allowedRoles={['Admin']}>
                                <AdminCategories />
                            </ProtectedRoute>
                        } />
                        <Route path="users" element={
                            <ProtectedRoute allowedRoles={['Admin']}>
                                <AdminUsers />
                            </ProtectedRoute>
                        } />
                    </Route>
                </Routes>
            </BrowserRouter>
        </>
    )
}
