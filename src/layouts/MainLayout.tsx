import React, { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const MainLayout: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleRedirect = (e: Event) => {
            const customEvent = e as CustomEvent<string>;
            if (customEvent.detail) {
                navigate(customEvent.detail);
            }
        };
        window.addEventListener('app-redirect', handleRedirect);
        return () => {
            window.removeEventListener('app-redirect', handleRedirect);
        };
    }, [navigate]);

    return (
        <>
            <Header />
            <main>
                <Outlet />
            </main>
            <Footer />
        </>
    )
}

export default MainLayout

