import React, { useState, useRef, useCallback } from 'react'
import * as adminApi from '@/services/api/admin'

interface Upload3DModalProps {
    productId: string
    productName: string
    onClose: () => void
    onSuccess: (model3DUrl: string) => void
}

const MAX_SIZE_BYTES = 25 * 1024 * 1024 // 25MB
const ACCEPTED_EXTS = ['.glb', '.gltf']

export const Upload3DModal: React.FC<Upload3DModalProps> = ({
    productId,
    productName,
    onClose,
    onSuccess,
}) => {
    const [file, setFile] = useState<File | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const validateFile = (f: File): string | null => {
        const ext = '.' + f.name.split('.').pop()?.toLowerCase()
        if (!ACCEPTED_EXTS.includes(ext)) return `Chỉ chấp nhận file .glb hoặc .gltf`
        if (f.size > MAX_SIZE_BYTES) return `File quá lớn (tối đa 25MB, file của bạn: ${(f.size / 1024 / 1024).toFixed(1)}MB)`
        return null
    }

    const handleFile = (f: File) => {
        const err = validateFile(f)
        if (err) { setError(err); setFile(null); return }
        setError(null)
        setFile(f)
    }

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const dropped = e.dataTransfer.files[0]
        if (dropped) handleFile(dropped)
    }, [])

    const handleUpload = async () => {
        if (!file) return
        setUploading(true)
        setError(null)
        try {
            const res = await adminApi.uploadProduct3DModel(productId, file)
            const url = res?.data?.model3DUrl || res?.model3DUrl || res?.url || ''
            onSuccess(url)
            onClose()
        } catch (err: any) {
            setError(err.message || 'Upload thất bại')
        } finally {
            setUploading(false)
        }
    }

    const formatSize = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2)} MB`

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 60,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', padding: '1rem',
            }}
            onClick={e => { if (e.target === e.currentTarget) onClose() }}
        >
            <div style={{
                background: '#fff',
                borderRadius: '16px',
                border: '1px solid #e8ddd5',
                boxShadow: '0 24px 64px rgba(75,35,17,0.18)',
                width: '100%',
                maxWidth: '440px',
                padding: '28px',
                animation: 'slideUp 0.2s ease',
            }}>
                <style>{`
                    @keyframes slideUp {
                        from { opacity:0; transform:translateY(12px); }
                        to   { opacity:1; transform:translateY(0); }
                    }
                `}</style>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '8px',
                                background: '#657b35', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-9 5.25-9-5.25v-2.25" />
                                </svg>
                            </div>
                            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#4b2311', margin: 0 }}>
                                Upload Model 3D
                            </h2>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#68361c', opacity: 0.7, margin: 0, paddingLeft: '40px' }}>
                            {productName}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            width: '28px', height: '28px', borderRadius: '8px',
                            border: '1px solid #e8ddd5', background: '#FAF9F6',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#68361c', flexShrink: 0,
                        }}
                    >
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Drop zone */}
                <div
                    onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    style={{
                        border: `2px dashed ${isDragging ? '#657b35' : file ? '#657b35' : '#d4c9bc'}`,
                        borderRadius: '12px',
                        padding: '28px 20px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: isDragging ? '#f0f5e8' : file ? '#f5f8f0' : '#FAFAF8',
                        transition: 'all 0.15s',
                        marginBottom: '16px',
                    }}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept=".glb,.gltf"
                        style={{ display: 'none' }}
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                    />

                    {file ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                            <div style={{
                                width: '44px', height: '44px', borderRadius: '10px',
                                background: '#657b35', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <svg width="22" height="22" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25" />
                                </svg>
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#4b2311' }}>{file.name}</span>
                            <span style={{ fontSize: '0.72rem', color: '#888079' }}>{formatSize(file.size)}</span>
                            <span style={{ fontSize: '0.68rem', color: '#657b35', fontWeight: 600 }}>Click để đổi file khác</span>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                                width: '44px', height: '44px', borderRadius: '10px',
                                background: '#f0ebe3', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <svg width="22" height="22" fill="none" stroke="#68361c" strokeWidth="1.5" viewBox="0 0 24 24" style={{ opacity: 0.6 }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                </svg>
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#4b2311' }}>
                                Kéo thả hoặc click để chọn
                            </span>
                            <span style={{ fontSize: '0.72rem', color: '#888079' }}>
                                Chỉ nhận <strong>.glb</strong> hoặc <strong>.gltf</strong> · Tối đa 25MB
                            </span>
                        </div>
                    )}
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: '#fef2f2', border: '1px solid #fecaca',
                        borderRadius: '8px', padding: '10px 12px',
                        marginBottom: '16px',
                    }}>
                        <svg width="14" height="14" fill="none" stroke="#dc2626" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                        <span style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 600 }}>{error}</span>
                    </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button
                        onClick={onClose}
                        disabled={uploading}
                        style={{
                            padding: '8px 18px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700,
                            border: '1px solid #e8ddd5', background: '#FAF9F6', color: '#68361c',
                            cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.6 : 1,
                        }}
                    >
                        Huỷ
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        style={{
                            padding: '8px 20px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700,
                            border: 'none', background: !file || uploading ? '#d4c9bc' : '#657b35',
                            color: !file || uploading ? '#888' : '#fff',
                            cursor: !file || uploading ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', gap: '6px',
                            transition: 'background 0.15s',
                        }}
                    >
                        {uploading ? (
                            <>
                                <div style={{
                                    width: '12px', height: '12px',
                                    border: '2px solid rgba(255,255,255,0.4)',
                                    borderTop: '2px solid #fff',
                                    borderRadius: '50%',
                                    animation: 'slideUp 0.8s linear infinite',
                                }} />
                                Đang upload...
                            </>
                        ) : 'Upload Model 3D'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Upload3DModal
