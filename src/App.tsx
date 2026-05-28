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

export default function App() {
    const { isLoginModalOpen, closeLoginModal, loginReason } = useAuth();

    return (
        <>
            <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} reason={loginReason} />
            <BrowserRouter>
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
