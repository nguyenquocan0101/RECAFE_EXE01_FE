import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import ProductListing from './pages/ProductListing'
import ProductDetail from './pages/ProductDetail'
import EnvironmentalImpact from './pages/EnvironmentalImpact'

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<ProductListing />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/environmental-impact" element={<EnvironmentalImpact />} />
            </Routes>
        </BrowserRouter>
    )
}
