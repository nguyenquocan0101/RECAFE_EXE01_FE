import React, { createContext, useContext, useState } from 'react'
import viTranslations from '../locales/vi-VN.json'
import enTranslations from '../locales/en-US.json'

type Language = 'vi' | 'en'

interface LanguageContextProps {
    language: Language
    toggleLanguage: () => void
    t: (key: string) => string
}

const translations: Record<Language, Record<string, string>> = {
    vi: viTranslations,
    en: enTranslations
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined)

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>(() => {
        const saved = localStorage.getItem('re_cafe_lang')
        return (saved === 'vi' || saved === 'en') ? saved : 'vi'
    })

    const toggleLanguage = () => {
        setLanguage(prev => {
            const next = prev === 'vi' ? 'en' : 'vi'
            localStorage.setItem('re_cafe_lang', next)
            return next
        })
    }

    const t = (key: string): string => {
        return translations[language][key] || key
    }

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export const useLanguage = () => {
    const context = useContext(LanguageContext)
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider')
    }
    return context
}
