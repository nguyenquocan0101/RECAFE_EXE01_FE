import React from 'react'
import { createRoot } from 'react-dom/client'
import App from '@/App'
import { LanguageProvider } from '@/context/LanguageContext'
import { AuthProvider } from '@/context/AuthContext'
import { ToastProvider } from '@/context/ToastContext'
import '@/styles/global.css'

createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <LanguageProvider>
            <AuthProvider>
                <ToastProvider>
                    <App />
                </ToastProvider>
            </AuthProvider>
        </LanguageProvider>
    </React.StrictMode>
)
