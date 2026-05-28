import React, { Suspense, useRef, useState, useCallback } from 'react'
import { Canvas, useLoader } from '@react-three/fiber'
import { OrbitControls, Stage, useGLTF, Html, useProgress } from '@react-three/drei'
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { ThreeMFLoader } from 'three/examples/jsm/loaders/3MFLoader'

// ─── Loading overlay ────────────────────────────────────────────────────────

function Loader() {
    const { progress } = useProgress()
    return (
        <Html center>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                color: '#657b35',
                fontFamily: 'inherit',
            }}>
                <div style={{
                    width: '36px',
                    height: '36px',
                    border: '3px solid #e8ddd5',
                    borderTop: '3px solid #657b35',
                    borderRadius: '50%',
                    animation: 'spin3d 0.8s linear infinite',
                }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px', color: '#4b2311' }}>
                    {Math.round(progress)}%
                </span>
            </div>
        </Html>
    )
}

// ─── Model Renderer (Supports GLTF, GLB, STL, OBJ, 3MF) ─────────────────────

function ModelRenderer({ url }: { url: string }) {
    const lowerUrl = url.toLowerCase();
    
    const brownMaterial = React.useMemo(() => new THREE.MeshStandardMaterial({
        color: '#4b2311',
        roughness: 0.45,
        metalness: 0.1
    }), []);

    if (lowerUrl.endsWith('.stl')) {
        const geometry = useLoader(STLLoader, url);
        geometry.center();
        
        const box = geometry.boundingBox || new THREE.Box3();
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 1.8 / (maxDim || 1);
        
        return (
            <mesh geometry={geometry} scale={[scale, scale, scale]} material={brownMaterial} />
        );
    }
    
    if (lowerUrl.endsWith('.obj')) {
        const obj = useLoader(OBJLoader, url);
        
        React.useMemo(() => {
            obj.traverse((child: any) => {
                if (child.isMesh) {
                    child.material = brownMaterial;
                }
            });
        }, [obj, brownMaterial]);

        const box = new THREE.Box3().setFromObject(obj);
        const center = new THREE.Vector3();
        box.getCenter(center);
        
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 1.8 / (maxDim || 1);
        
        return (
            <primitive 
                object={obj} 
                position={[-center.x * scale, -center.y * scale, -center.z * scale]} 
                scale={[scale, scale, scale]} 
            />
        );
    }
    
    if (lowerUrl.endsWith('.3mf')) {
        const obj3mf = useLoader(ThreeMFLoader, url);
        
        React.useMemo(() => {
            obj3mf.traverse((child: any) => {
                if (child.isMesh) {
                    child.material = brownMaterial;
                }
            });
        }, [obj3mf, brownMaterial]);

        const box = new THREE.Box3().setFromObject(obj3mf);
        const center = new THREE.Vector3();
        box.getCenter(center);
        
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 1.8 / (maxDim || 1);
        
        return (
            <primitive 
                object={obj3mf} 
                position={[-center.x * scale, -center.y * scale, -center.z * scale]} 
                scale={[scale, scale, scale]} 
            />
        );
    }
    
    // Default fallback to GLTF/GLB with full centering & scaling
    const { scene } = useGLTF(url);
    
    React.useMemo(() => {
        scene.traverse((child: any) => {
            if (child.isMesh) {
                child.material = brownMaterial;
            }
        });
    }, [scene, brownMaterial]);

    const box = new THREE.Box3().setFromObject(scene);
    const center = new THREE.Vector3();
    box.getCenter(center);
    
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 1.8 / (maxDim || 1);
    
    return (
        <primitive 
            object={scene} 
            position={[-center.x * scale, -center.y * scale, -center.z * scale]} 
            scale={[scale, scale, scale]} 
        />
    );
}

// ─── Main Viewer ─────────────────────────────────────────────────────────────

interface Model3DViewerProps {
    url: string
    height?: string | number
}

export const Model3DViewer: React.FC<Model3DViewerProps> = ({ url, height = '420px' }) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [loadError, setLoadError] = useState(false)

    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen()
            setIsFullscreen(true)
        } else {
            document.exitFullscreen()
            setIsFullscreen(false)
        }
    }, [])

    if (loadError) {
        return (
            <div style={{
                height,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#FAF6F0',
                borderRadius: '12px',
                gap: '8px',
                color: '#c83a42',
            }}>
                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Không thể tải model 3D</span>
            </div>
        )
    }

    return (
        <>
            <style>{`
                @keyframes spin3d {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .model3d-container:-webkit-full-screen { width: 100vw; height: 100vh; }
                .model3d-container:-moz-full-screen { width: 100vw; height: 100vh; }
                .model3d-container:fullscreen { width: 100vw; height: 100vh; }
            `}</style>
            <div
                ref={containerRef}
                className="model3d-container"
                style={{
                    position: 'relative',
                    height,
                    background: 'linear-gradient(135deg, #FAF6F0 0%, #F0EBE3 100%)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid #e8ddd5',
                }}
            >
                {/* Hint label */}
                <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: 'rgba(255,255,255,0.85)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '20px',
                    padding: '4px 10px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: '#4b2311',
                    letterSpacing: '0.3px',
                    border: '1px solid #e8ddd5',
                    pointerEvents: 'none',
                }}>
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" />
                    </svg>
                    Kéo để xoay · Cuộn để zoom
                </div>

                {/* Fullscreen button */}
                <button
                    onClick={toggleFullscreen}
                    title={isFullscreen ? 'Thoát toàn màn hình' : 'Xem toàn màn hình'}
                    style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        zIndex: 10,
                        width: '32px',
                        height: '32px',
                        background: 'rgba(255,255,255,0.85)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid #e8ddd5',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#4b2311',
                        transition: 'background 0.15s',
                    }}
                >
                    {isFullscreen ? (
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                        </svg>
                    ) : (
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                        </svg>
                    )}
                </button>

                {/* R3F Canvas */}
                <Canvas
                    camera={{ position: [0, 0, 3.0], fov: 50 }}
                    style={{ width: '100%', height: '100%' }}
                    onError={() => setLoadError(true)}
                >
                    <Suspense fallback={<Loader />}>
                        <Stage environment="city" intensity={0.5} adjustCamera={1.5}>
                            <ModelRenderer url={url} />
                        </Stage>
                        <OrbitControls
                            enablePan={false}
                            minDistance={0.5}
                            maxDistance={12}
                            autoRotate={true}
                            autoRotateSpeed={1.5}
                        />
                    </Suspense>
                </Canvas>
            </div>
        </>
    )
}

export default Model3DViewer
