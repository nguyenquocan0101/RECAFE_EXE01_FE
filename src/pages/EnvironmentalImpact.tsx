import React, { useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'

interface Partner {
    id: number
    name: string
    addressVI: string
    addressEN: string
    donatedVI: string
    donatedEN: string
    mapUrl: string
    lat: number
    lng: number
    x: number // Map coordinates percentage
    y: number
}

const EnvironmentalImpact: React.FC = () => {
    const { t, language } = useLanguage()
    const [viewMode, setViewMode] = useState<'map' | 'list'>('map')
    const [searchQuery, setSearchQuery] = useState('')
    const [activePartnerId, setActivePartnerId] = useState(1)

    const partners: Partner[] = [
        {
            id: 1,
            name: 'Passio Coffee',
            addressVI: 'Lô T2-4, Đường D1, Khu Công Nghệ Cao, P. Tân Phú, TP. Thủ Đức, TP. HCM',
            addressEN: 'Lot T2-4, D1 Road, High-Tech Park, Tan Phu Ward, Thu Duc City, HCMC',
            donatedVI: '1.200kg đã đóng góp',
            donatedEN: '1,200kg donated',
            mapUrl: 'https://www.google.com/maps/place/Passio+Coffee/@10.8416878,106.8067476,17z/data=!3m1!4b1!4m6!3m5!1s0x3175276d9724ca93:0xdd707f9d67a751dd!8m2!3d10.8416878!4d106.8093225!16s%2Fg%2F11k0szmxkw?entry=ttu&g_ep=EgoyMDI2MDYxMy4wIKXMDSoASAFQAw%3D%3D',
            lat: 10.8416878,
            lng: 106.8093225,
            x: 52,
            y: 72
        },
        {
            id: 2,
            name: 'Deer Coffee - Nhà Văn Hóa Sinh Viên',
            addressVI: 'Nhà Văn hóa Sinh viên TP.HCM, Lưu Hữu Phước, Đông Hòa, Dĩ An, Bình Dương',
            addressEN: 'Student Cultural House, Luu Huu Phuoc, Dong Hoa, Di An, Binh Duong',
            donatedVI: '850kg đã đóng góp',
            donatedEN: '850kg donated',
            mapUrl: 'https://www.google.com/maps/place/Deer+Coffee+-+Nh%C3%A0+V%C4%83n+H%C3%B3a+Sinh+Vi%C3%AAn/@10.8742508,106.8018667,15.35z/data=!4m22!1m15!4m14!1m6!1m2!1s0x3174d9004b8b550d:0x72c24bde5dadf6af!2zRGVlciBDb2ZmZWUgLSBOaMOgIFbEg24gSMOzYSBTaW5oIFZpw6puLCBWUkcyKzI3WCwgTMawdSBI4buvdSBQaMaw4bubYywgxJDDtG5nIEjDsmEsIEjhu5MgQ2jDrSBNaW5oLCBWaeG7h3QgTmFt!2m2!1d106.8006972!2d10.8751671!1m6!1m2!1s0x3174d9004b8b550d:0x72c24bde5dadf6af!2zRGVlciBDb2ZmZWUgLSBOaMOgIFbEg24gSMOzYSBTaW5oIFZpw6puLCBWUkcyKzI3WCwgTMawdSBI4buvdSBQaMaw4bubYywgxJDDtG5nIEjDsmEsIEjhu5MgQ2jDrSBNaW5oLCBWaeG7h3QgTmFt!2m2!1d106.8006972!2d10.8751671!3m5!1s0x3174d9004b8b550d:0x72c24bde5dadf6af!8m2!3d10.8751671!4d106.8006972!16s%2Fg%2F11vrtgdxfj?entry=ttu&g_ep=EgoyMDI2MDYxMy4wIKXMDSoASAFQAw%3D%3D',
            lat: 10.8751671,
            lng: 106.8006972,
            x: 48,
            y: 22
        },
        {
            id: 3,
            name: 'Deer Coffee - S202 Vinhome Grand Park',
            addressVI: 'Tòa S2.02, Vinhomes Grand Park, Long Thạnh Mỹ, TP. Thủ Đức, TP. HCM',
            addressEN: 'Building S2.02, Vinhomes Grand Park, Long Thanh My, Thu Duc City, HCMC',
            donatedVI: '640kg đã đóng góp',
            donatedEN: '640kg donated',
            mapUrl: 'https://www.google.com/maps/place/Deer+Coffee+-+S202+Vinhome+Grand+Park/@10.8386929,106.8294557,17z/data=!4m14!1m7!3m6!1s0x3175213625bfe0dd:0xe6e71005aac28bbf!2sDeer+Coffee+-+S202+Vinhome+Grand+Park!8m2!3d10.8386929!4d106.8320306!16s%2Fg%2F11l5frh63d!3m5!1s0x3175213625bfe0dd:0xe6e71005aac28bbf!8m2!3d10.8386929!4d106.8320306!16s%2Fg%2F11l5frh63d?entry=ttu&g_ep=EgoyMDI2MDYxMy4wIKXMDSoASAFQAw%3D%3D',
            lat: 10.8386929,
            lng: 106.8320306,
            x: 54,
            y: 45
        },
        {
            id: 4,
            name: 'Trà Sữa Betea - Nhà Văn Hóa Sinh Viên',
            addressVI: 'Nhà Văn hóa Sinh viên TP.HCM, Lưu Hữu Phước, Đông Hòa, Dĩ An, Bình Dương',
            addressEN: 'Student Cultural House, Luu Huu Phuoc, Dong Hoa, Di An, Binh Duong',
            donatedVI: '520kg đã đóng góp',
            donatedEN: '520kg donated',
            mapUrl: 'https://www.google.com/maps/place/Tr%C3%A0+S%E1%BB%AFa+Betea+-+Nh%C3%A0+V%C4%83n+Ho%C3%A1+Sinh+Vi%C3%AAn/@10.8762916,106.7999108,17.08z/data=!4m22!1m15!4m14!1m6!1m2!1s0x3174d9cdadd2291d:0x7908c5de59d72e65!2zVHLDoCBT4buvYSBCZXRlYSAtIE5ow6AgVsSDbiBIb8OhIFNpbmggVmnDqm4sIFPDom4gVHLGsOG7m2MgTmjDoCBWxINuIEhvw6EsIEzGsHUgSOG7r3UgUGjGsOG7m2MgVMOibiBM4bqtcCwgxJDDtG5nIEjDsmEsIEjhu5MgQ2jDrSBNaW5oIDc1MzAwLCBWaeG7h3QgTmFt!2m2!1d106.8011427!2d10.8756599!1m6!1m2!1s0x3174d9cdadd2291d:0x7908c5de59d72e65!2zVHLDoCBT4buvYSBCZXRlYSAtIE5ow6AgVsSDbiBIb8OhIFNpbmggVmnDqm4sIFPDom4gVHLGsOG7m2MgTmjDoCBWxINuIEhvw6EsIEzGsHUgSOG7r3UgUGjGsOG7m2MgVMOibiBM4bqtcCwgxJDDtG5nIEjDsmEsIEjhu5MgQ2jDrSBNaW5oIDc1MzAwLCBWaeG7h3QgTmFt!2m2!1d106.8011427!2d10.8756599!3m5!1s0x3174d9cdadd2291d:0x7908c5de59d72e65!8m2!3d10.8756599!4d106.8011427!16s%2Fg%2F11wr1rfy_d?entry=ttu&g_ep=EgoyMDI2MDYxMy4wIKXMDSoASAFQAw%3D%3D',
            lat: 10.8756599,
            lng: 106.8011427,
            x: 46,
            y: 20
        }
    ]

    const filteredPartners = partners.filter(p => {
        const address = language === 'vi' ? p.addressVI : p.addressEN
        return p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
               address.toLowerCase().includes(searchQuery.toLowerCase())
    })

    const activePartner = partners.find(p => p.id === activePartnerId) || partners[0]

    // Journal stories data
    const journalStories = [
        {
            id: 1,
            tag: language === 'vi' ? 'Không gian xanh' : 'Circular Home',
            title: language === 'vi' ? 'Cách xây dựng thói quen buổi sáng không rác thải' : 'How to Build a Zero-Waste Morning Routine',
            desc: language === 'vi' 
                ? 'Những thay đổi nhỏ trong cách chọn và xử lý bã cà phê sáng sẽ mang lại tác động lớn. Tìm hiểu các mẹo nhỏ để khép kín chu trình.'
                : 'Small changes in how you source and dispose of your morning brew can have a massive impact. Discover simple tips to close the loop.',
            image: '/assets/re_tray.png'
        },
        {
            id: 2,
            tag: language === 'vi' ? 'Mẹo Sinh Thái' : 'Eco-Tips',
            title: language === 'vi' ? '5 Cách tận dụng bã cà phê cho vườn nhà' : '5 Ways Grounds Benefit Your Garden',
            desc: language === 'vi'
                ? 'Từ tăng cường nitơ đến xua đuổi côn trùng tự nhiên, bã cà phê chính là nguồn dinh dưỡng quý giá cho cây trồng của bạn.'
                : 'From nitrogen boosts to organic pest control, discover why your leftover grounds are liquid gold for your plants and garden.',
            image: '/assets/coffee_grounds.png'
        },
        {
            id: 3,
            tag: language === 'vi' ? 'Triết lý thiết kế' : 'Design Philosophy',
            title: language === 'vi' ? 'Tính thẩm mỹ của sự hồi sinh' : 'The Aesthetics of Rebirth',
            desc: language === 'vi'
                ? 'Tại sao chúng tôi tin rằng tương lai của ngành trang trí nhà cửa cao cấp nằm ở vật liệu tái chế thay vì khai thác tài nguyên mới.'
                : 'Why we believe the future of luxury home decor lies in upcycled bio-composites and circular design practices.',
            image: '/assets/bloom_clock.png'
        }
    ]

    return (
        <div className="page-impact">

            {/* Hero Section */}
            <section className="impact-hero">
                <div className="impact-hero-bg">
                    <img src="/assets/coffee_mountains.png" alt="Coffee farm mountains" />
                    <div className="impact-hero-overlay"></div>
                </div>

                <div className="impact-hero-container">
                    <div className="impact-hero-text">
                        <span className="impact-hero-tag">{t('impact.heroTag')}</span>
                        <h1 className="impact-hero-title" dangerouslySetInnerHTML={{ __html: t('impact.heroTitle') }}></h1>
                        <p className="impact-hero-desc">{t('impact.heroDesc')}</p>
                        <button className="btn btn-primary" onClick={() => alert('Đang tải báo cáo phát triển bền vững 2024...')}>
                            {t('impact.readMission')}
                            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="floating-impact-tag">
                    <h4>100%</h4>
                    <p>{t('impact.floatingTag')}</p>
                </div>
            </section>

            {/* Metrics Row */}
            <section className="impact-metrics-row">
                <div className="impact-metrics-container">
                    <div className="impact-metric-card">
                        <div className="impact-metric-icon">
                            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                            </svg>
                        </div>
                        <h3>1k</h3>
                        <h4>{t('impact.metricRecycledTitle')}</h4>
                        <p>{t('impact.metricRecycledDesc')}</p>
                    </div>

                    <div className="impact-metric-card">
                        <div className="impact-metric-icon">
                            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                        </div>
                        <h3>5</h3>
                        <h4>{t('impact.metricItemsTitle')}</h4>
                        <p>{t('impact.metricItemsDesc')}</p>
                    </div>

                    <div className="impact-metric-card">
                        <div className="impact-metric-icon">
                            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                        </div>
                        <h3>3</h3>
                        <h4>{t('impact.metricPartnersTitle')}</h4>
                        <p>{t('impact.metricPartnersDesc')}</p>
                    </div>
                </div>
            </section>

            {/* Waste to Worth section */}
            <section className="waste-to-worth-section">
                <div className="waste-container">
                    <div className="waste-header">
                        <h2>{t('impact.worthTitle')}</h2>
                    </div>

                    <div className="waste-grid">
                        <div className="waste-left-col">
                            <div className="waste-card-large">
                                <div className="waste-card-img">
                                    <img src="/assets/coffee_grounds.png" alt="Collection" />
                                </div>
                                <div className="waste-card-content">
                                    <h3>{t('impact.step1Title')}</h3>
                                    <p>{t('impact.step1Desc')}</p>
                                </div>
                            </div>

                            <div className="waste-card-large">
                                <div className="waste-card-img">
                                    <img src="/assets/re_cup.png" alt="Refining" />
                                </div>
                                <div className="waste-card-content">
                                    <h3>{t('impact.step2Title')}</h3>
                                    <p>{t('impact.step2Desc')}</p>
                                </div>
                            </div>

                            <div className="waste-card-large">
                                <div className="waste-card-img">
                                    <img src="/assets/re_vase.png" alt="Design" />
                                </div>
                                <div className="waste-card-content">
                                    <h3>{t('impact.step3Title')}</h3>
                                    <p>{t('impact.step3Desc')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="waste-lifecycle-card">
                            <div className="lifecycle-icon">
                                <svg viewBox="0 0 24 24">
                                    <path d="M12 2.248c5.385 0 9.752 4.367 9.752 9.752s-4.367 9.752-9.752 9.752c-5.385 0-9.752-4.367-9.752-9.752s4.367-9.752 9.752-9.752zm0-2.248c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 5.625c1.171 0 2.125.953 2.125 2.125s-.954 2.125-2.125 2.125-2.125-.953-2.125-2.125.954-2.125 2.125-2.125zm0-2.25c-2.416 0-4.375 1.959-4.375 4.375s1.959 4.375 4.375 4.375 4.375-1.959 4.375-4.375-1.959-4.375-4.375-4.375z"></path>
                                </svg>
                            </div>
                            <h3>{t('impact.lifecycleTitle')}</h3>
                            <p>{t('impact.lifecycleDesc')}</p>
                            <a href="#lifecycle" className="lifecycle-link" onClick={(e) => { e.preventDefault(); alert(t('impact.lifecycleLink')); }}>
                                {t('impact.lifecycleLink')}
                                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                    <polyline points="12 5 19 12 12 19"></polyline>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Interactive Partners Map Section */}
            <section className="partners-map-section">
                <div className="partners-map-container">
                    <div className="partners-map-header">
                        <div className="partners-map-title">
                            <h3>{t('impact.partnerTag')}</h3>
                            <h2>{t('impact.partnerTitle')}</h2>
                            <p>{t('impact.partnerSub')}</p>
                        </div>
                        <div className="toggle-view-buttons">
                            <button
                                className={`toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
                                onClick={() => setViewMode('map')}
                            >
                                {language === 'vi' ? 'Bản đồ' : 'Map View'}
                            </button>
                            <button
                                className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                                onClick={() => setViewMode('list')}
                            >
                                {language === 'vi' ? 'Danh sách' : 'List View'}
                            </button>
                        </div>
                    </div>

                    <div className="partners-interactive-grid">
                        {/* Sidebar */}
                        <div className="partners-list-panel">
                            <div className="search-partner-input">
                                <div className="search-partner-input-wrapper">
                                    <input
                                        type="text"
                                        placeholder={t('impact.searchPlaceholder')}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="11" cy="11" r="8"></circle>
                                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                    </svg>
                                </div>
                            </div>
                            <div className="partners-scroll-list">
                                {filteredPartners.map(p => (
                                    <div
                                        key={p.id}
                                        className={`partner-list-card ${activePartnerId === p.id ? 'active' : ''}`}
                                        onClick={() => {
                                            setActivePartnerId(p.id)
                                            setViewMode('map')
                                        }}
                                    >
                                        <h4>{p.name}</h4>
                                        <span className="address">
                                            {language === 'vi' ? p.addressVI : p.addressEN}
                                        </span>
                                        <div className="donated-metric" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path>
                                                </svg>
                                                {language === 'vi' ? p.donatedVI : p.donatedEN}
                                            </div>
                                            <a
                                                href={p.mapUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                style={{
                                                    color: 'var(--primary)',
                                                    textDecoration: 'underline',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 600,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '2px'
                                                }}
                                            >
                                                {language === 'vi' ? 'Bản đồ' : 'Map'}
                                                <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                                                </svg>
                                            </a>
                                        </div>
                                    </div>
                                ))}
                                {filteredPartners.length === 0 && (
                                    <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>{language === 'vi' ? 'Không tìm thấy đối tác.' : 'No partners found.'}</p>
                                )}
                            </div>
                        </div>

                        {/* Map Panel */}
                        <div className="map-display-panel" style={{ overflow: 'hidden' }}>
                            {viewMode === 'map' ? (
                                <div style={{ width: '100%', height: '100%', minHeight: '560px', position: 'relative' }}>
                                    <iframe
                                        title={activePartner.name}
                                        src={`https://maps.google.com/maps?q=${activePartner.lat},${activePartner.lng}&z=16&output=embed`}
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0, minHeight: '560px', width: '100%', height: '100%' }}
                                        allowFullScreen
                                        loading="lazy"
                                    ></iframe>
                                </div>
                            ) : (
                                <div style={{ padding: '3rem', height: '100%', backgroundColor: 'var(--white)' }}>
                                    <h3 style={{ marginBottom: '2rem' }}>{t('impact.allPartnersTable')}</h3>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '2px solid var(--border)', paddingBottom: '1rem' }}>
                                                <th style={{ padding: '1rem 0' }}>{t('impact.tableColName')}</th>
                                                <th>{t('impact.tableColLocation')}</th>
                                                <th>{t('impact.tableColDonated')}</th>
                                                <th>{language === 'vi' ? 'Bản đồ' : 'Map'}</th>
                                                <th>{t('impact.tableColStatus')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {partners.map(p => (
                                                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                    <td style={{ padding: '1.2rem 0', fontWeight: 'bold' }}>{p.name}</td>
                                                    <td>{language === 'vi' ? p.addressVI : p.addressEN}</td>
                                                    <td style={{ color: 'var(--accent)', fontWeight: 700 }}>
                                                        {language === 'vi' ? p.donatedVI.replace(' đã đóng góp', '') : p.donatedEN.replace(' donated', '')}
                                                    </td>
                                                    <td>
                                                        <a 
                                                            href={p.mapUrl} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            style={{
                                                                color: 'var(--primary)',
                                                                textDecoration: 'underline',
                                                                fontWeight: 600,
                                                                fontSize: '0.9rem',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '4px'
                                                            }}
                                                        >
                                                            {language === 'vi' ? 'Xem' : 'View'}
                                                            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                                                            </svg>
                                                        </a>
                                                    </td>
                                                    <td><span style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700 }}>{t('impact.active')}</span></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Circular Journal stories section */}
            <section className="circular-journal-section">
                <div className="journal-container">
                    <div className="journal-header">
                        <h2>{t('impact.journalTitle')}</h2>
                        <a href="#all-stories" className="view-all-btn" onClick={(e) => { e.preventDefault(); alert('Đang chuyển hướng đến tất cả bài viết...'); }}>
                            {t('home.viewAll')}
                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </a>
                    </div>

                    <div className="journal-grid">
                        {journalStories.map(story => (
                            <div key={story.id} className="journal-card">
                                <div className="journal-card-img">
                                    <img src={story.image} alt={story.title} />
                                </div>
                                <div className="journal-card-content">
                                    <span className="journal-card-tag">{story.tag}</span>
                                    <h3>{story.title}</h3>
                                    <p>{story.desc}</p>
                                    <a href={`#story-${story.id}`} className="read-story-btn" onClick={(e) => { e.preventDefault(); alert(`Đang đọc bài viết: ${story.title}`); }}>{t('impact.readStory')}</a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    )
}

export default EnvironmentalImpact
