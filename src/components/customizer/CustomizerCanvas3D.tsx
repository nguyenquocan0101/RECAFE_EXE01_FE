import React, { useState, useEffect, useMemo, Suspense } from 'react'
import { Canvas, useLoader } from '@react-three/fiber'
import { OrbitControls, Stage, Decal, Html, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { ThreeMFLoader } from 'three/examples/jsm/loaders/3MFLoader.js'

// ─── 3D Model Renderers to avoid conditional hooks ───────────────────────────

interface RendererProps {
    url: string;
    material: THREE.Material;
    previewUrl: string | null;
    decalX: number;
    decalY: number;
    decalZ: number;
    decalRot: [number, number, number];
    decalScale: [number, number, number];
    onPointerDown?: (e: any) => void;
    onPointerMove?: (e: any) => void;
    onPointerOver?: (e: any) => void;
    onPointerOut?: (e: any) => void;
}

const DecalOverlay: React.FC<{
    previewUrl: string;
    decalX: number;
    decalY: number;
    decalZ: number;
    decalRot: [number, number, number];
    decalScale: [number, number, number];
}> = ({ previewUrl, decalX, decalY, decalZ, decalRot, decalScale }) => {
    const texture = useLoader(THREE.TextureLoader, previewUrl);
    
    useMemo(() => {
        if (texture) {
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.needsUpdate = true;
        }
    }, [texture]);

    const aspect = useMemo(() => {
        if (texture && texture.image) {
            const w = texture.image.width || 1;
            const h = texture.image.height || 1;
            return w / h;
        }
        return 1.0;
    }, [texture]);

    const adjustedScale: [number, number, number] = useMemo(() => {
        return [
            decalScale[0] * aspect,
            decalScale[1],
            decalScale[2]
        ];
    }, [decalScale, aspect]);

    return (
        <Decal
            position={[decalX, decalY, decalZ]}
            rotation={decalRot}
            scale={adjustedScale}
        >
            <meshStandardMaterial 
                map={texture} 
                transparent 
                roughness={0.8}
                metalness={0.2}
                polygonOffset 
                polygonOffsetFactor={-5} 
            />
        </Decal>
    );
};

const StlModelRenderer: React.FC<RendererProps> = ({ 
    url, 
    material, 
    previewUrl, 
    decalX, 
    decalY, 
    decalZ, 
    decalRot, 
    decalScale,
    onPointerDown,
    onPointerMove,
    onPointerOver,
    onPointerOut
}) => {
    const loadedGeom = useLoader(STLLoader, url);
    
    const geometry = useMemo(() => {
        const g = loadedGeom.clone();
        g.center();
        g.computeVertexNormals();
        g.computeBoundingBox();
        const box = g.boundingBox || new THREE.Box3();
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const s = 1.8 / (maxDim || 1);
        g.scale(s, s, s);
        g.computeBoundingBox();
        g.computeBoundingSphere();
        return g;
    }, [loadedGeom]);

    return (
        <mesh 
            geometry={geometry} 
            material={material} 
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerOver={onPointerOver}
            onPointerOut={onPointerOut}
        >
            {previewUrl && (
                <Suspense fallback={null}>
                    <DecalOverlay
                        previewUrl={previewUrl}
                        decalX={decalX}
                        decalY={decalY}
                        decalZ={decalZ}
                        decalRot={decalRot}
                        decalScale={decalScale}
                    />
                </Suspense>
            )}
        </mesh>
    );
};

const ObjModelRenderer: React.FC<RendererProps> = ({ 
    url, 
    material, 
    previewUrl, 
    decalX, 
    decalY, 
    decalZ, 
    decalRot, 
    decalScale,
    onPointerDown,
    onPointerMove,
    onPointerOver,
    onPointerOut
}) => {
    const obj = useLoader(OBJLoader, url);

    useMemo(() => {
        obj.traverse((child: any) => {
            if (child.isMesh) {
                child.material = material;
                child.castShadow = false;
                child.receiveShadow = false;
            }
        });
    }, [obj, material]);

    const { centerPosition, scale, mainGeometry } = useMemo(() => {
        let targetMesh: THREE.Mesh | null = null;
        obj.traverse((child: any) => {
            if (child.isMesh && !targetMesh) {
                const geom = child.geometry;
                if (geom && geom.attributes && geom.attributes.position && geom.attributes.position.count > 0) {
                    targetMesh = child;
                }
            }
        });

        if (!targetMesh) {
            const box = new THREE.Box3().setFromObject(obj);
            const center = new THREE.Vector3();
            box.getCenter(center);
            const size = new THREE.Vector3();
            box.getSize(size);
            const maxDim = Math.max(size.x, size.y, size.z);
            const s = 1.8 / (maxDim || 1);
            return {
                centerPosition: [-center.x * s, -center.y * s, -center.z * s] as [number, number, number],
                scale: [s, s, s] as [number, number, number],
                mainGeometry: null
            };
        }

        const mesh: THREE.Mesh = targetMesh;
        const g = mesh.geometry.clone();

        const mainMeshBox = new THREE.Box3().setFromObject(mesh);
        const mainMeshCenter = new THREE.Vector3();
        mainMeshBox.getCenter(mainMeshCenter);
        const mainMeshSize = new THREE.Vector3();
        mainMeshBox.getSize(mainMeshSize);

        const maxDim = Math.max(mainMeshSize.x, mainMeshSize.y, mainMeshSize.z);
        const s = 1.8 / (maxDim || 1);

        g.center();
        g.computeVertexNormals();
        g.scale(s, s, s);
        g.computeBoundingBox();
        g.computeBoundingSphere();

        return {
            centerPosition: [-mainMeshCenter.x * s, -mainMeshCenter.y * s, -mainMeshCenter.z * s] as [number, number, number],
            scale: [s, s, s] as [number, number, number],
            mainGeometry: g
        };
    }, [obj]);

    return (
        <group
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerOver={onPointerOver}
            onPointerOut={onPointerOut}
        >
            {/* 1. Render the entire, complete model centered on the main mesh */}
            <primitive object={obj} position={centerPosition} scale={scale} />

            {/* 2. Render invisible decal target mesh centered at (0, 0, 0) */}
            {mainGeometry && (
                <mesh geometry={mainGeometry} castShadow={false} receiveShadow={false}>
                    <meshBasicMaterial transparent={true} opacity={0.0} depthWrite={false} />
                    {previewUrl && (
                        <Suspense fallback={null}>
                            <DecalOverlay
                                previewUrl={previewUrl}
                                decalX={decalX}
                                decalY={decalY}
                                decalZ={decalZ}
                                decalRot={decalRot}
                                decalScale={decalScale}
                            />
                        </Suspense>
                    )}
                </mesh>
            )}
        </group>
    );
};

const ThreeMfModelRenderer: React.FC<RendererProps> = ({ 
    url, 
    material, 
    previewUrl, 
    decalX, 
    decalY, 
    decalZ, 
    decalRot, 
    decalScale,
    onPointerDown,
    onPointerMove,
    onPointerOver,
    onPointerOut
}) => {
    const obj3mf = useLoader(ThreeMFLoader, url);

    useMemo(() => {
        obj3mf.traverse((child: any) => {
            if (child.isMesh) {
                child.material = material;
                child.castShadow = false;
                child.receiveShadow = false;
            }
        });
    }, [obj3mf, material]);

    const { centerPosition, scale, mainGeometry } = useMemo(() => {
        let targetMesh: THREE.Mesh | null = null;
        obj3mf.traverse((child: any) => {
            if (child.isMesh && !targetMesh) {
                const geom = child.geometry;
                if (geom && geom.attributes && geom.attributes.position && geom.attributes.position.count > 0) {
                    targetMesh = child;
                }
            }
        });

        if (!targetMesh) {
            const box = new THREE.Box3().setFromObject(obj3mf);
            const center = new THREE.Vector3();
            box.getCenter(center);
            const size = new THREE.Vector3();
            box.getSize(size);
            const maxDim = Math.max(size.x, size.y, size.z);
            const s = 1.8 / (maxDim || 1);
            return {
                centerPosition: [-center.x * s, -center.y * s, -center.z * s] as [number, number, number],
                scale: [s, s, s] as [number, number, number],
                mainGeometry: null
            };
        }

        const mesh: THREE.Mesh = targetMesh;
        const g = mesh.geometry.clone();

        const mainMeshBox = new THREE.Box3().setFromObject(mesh);
        const mainMeshCenter = new THREE.Vector3();
        mainMeshBox.getCenter(mainMeshCenter);
        const mainMeshSize = new THREE.Vector3();
        mainMeshBox.getSize(mainMeshSize);

        const maxDim = Math.max(mainMeshSize.x, mainMeshSize.y, mainMeshSize.z);
        const s = 1.8 / (maxDim || 1);

        g.center();
        g.computeVertexNormals();
        g.scale(s, s, s);
        g.computeBoundingBox();
        g.computeBoundingSphere();

        return {
            centerPosition: [-mainMeshCenter.x * s, -mainMeshCenter.y * s, -mainMeshCenter.z * s] as [number, number, number],
            scale: [s, s, s] as [number, number, number],
            mainGeometry: g
        };
    }, [obj3mf]);

    return (
        <group
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerOver={onPointerOver}
            onPointerOut={onPointerOut}
        >
            {/* 1. Render the entire, complete model centered on the main mesh */}
            <primitive object={obj3mf} position={centerPosition} scale={scale} />

            {/* 2. Render invisible decal target mesh centered at (0, 0, 0) */}
            {mainGeometry && (
                <mesh geometry={mainGeometry} castShadow={false} receiveShadow={false}>
                    <meshBasicMaterial transparent={true} opacity={0.0} depthWrite={false} />
                    {previewUrl && (
                        <Suspense fallback={null}>
                            <DecalOverlay
                                previewUrl={previewUrl}
                                decalX={decalX}
                                decalY={decalY}
                                decalZ={decalZ}
                                decalRot={decalRot}
                                decalScale={decalScale}
                            />
                        </Suspense>
                    )}
                </mesh>
            )}
        </group>
    );
};

const filterOuterSurfaceOnly = (geometry: THREE.BufferGeometry): THREE.BufferGeometry => {
    // Convert to non-indexed geometry so we can easily filter individual triangles
    const nonIndexed = geometry.index ? geometry.toNonIndexed() : geometry.clone();
    
    const positionAttr = nonIndexed.getAttribute('position');
    const normalAttr = nonIndexed.getAttribute('normal');
    if (!positionAttr || !normalAttr) return geometry;

    const count = positionAttr.count;
    const newPositions: number[] = [];
    const newNormals: number[] = [];
    const newUvs: number[] = [];
    const uvAttr = nonIndexed.getAttribute('uv');

    for (let i = 0; i < count; i += 3) {
        // Average position of the triangle in the horizontal plane (XZ)
        const px = (positionAttr.getX(i) + positionAttr.getX(i + 1) + positionAttr.getX(i + 2)) / 3;
        const pz = (positionAttr.getZ(i) + positionAttr.getZ(i + 1) + positionAttr.getZ(i + 2)) / 3;

        // Average normal of the triangle in the horizontal plane (XZ)
        const nx = (normalAttr.getX(i) + normalAttr.getX(i + 1) + normalAttr.getX(i + 2)) / 3;
        const nz = (normalAttr.getZ(i) + normalAttr.getZ(i + 1) + normalAttr.getZ(i + 2)) / 3;

        // Dot product in the XZ plane between position and normal vector.
        // Outer wall faces: position and normal point in the same direction (dot product > 0).
        // Inner wall faces: position points outward but normal points inward (dot product < 0).
        const dotXZ = px * nx + pz * nz;

        if (dotXZ > 0.0) {
            for (let j = 0; j < 3; j++) {
                const idx = i + j;
                newPositions.push(positionAttr.getX(idx), positionAttr.getY(idx), positionAttr.getZ(idx));
                newNormals.push(normalAttr.getX(idx), normalAttr.getY(idx), normalAttr.getZ(idx));
                if (uvAttr) {
                    newUvs.push(uvAttr.getX(idx), uvAttr.getY(idx));
                }
            }
        }
    }

    const filteredGeom = new THREE.BufferGeometry();
    filteredGeom.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
    filteredGeom.setAttribute('normal', new THREE.Float32BufferAttribute(newNormals, 3));
    if (uvAttr && newUvs.length > 0) {
        filteredGeom.setAttribute('uv', new THREE.Float32BufferAttribute(newUvs, 2));
    }
    
    return filteredGeom;
};

const GltfModelRenderer: React.FC<RendererProps> = ({ 
    url, 
    material, 
    previewUrl, 
    decalX, 
    decalY, 
    decalZ, 
    decalRot, 
    decalScale,
    onPointerDown,
    onPointerMove,
    onPointerOver,
    onPointerOut
}) => {
    const { scene } = useGLTF(url);

    useMemo(() => {
        scene.traverse((child: any) => {
            if (child.isMesh) {
                child.material = material;
                child.castShadow = false;
                child.receiveShadow = false;
            }
        });
    }, [scene, material]);

    const { centerPosition, scale, mainGeometry } = useMemo(() => {
        // 1. Search specifically for a mesh named 'CupBody' (optimized cup body)
        let cupBodyMesh: THREE.Mesh | null = null;
        scene.traverse((child: any) => {
            if (child.isMesh && child.name === 'CupBody') {
                cupBodyMesh = child;
            }
        });

        if (cupBodyMesh) {
            // The optimized model's pivot is already centered at (0, 0, 0) with height Y and size 1.2 x 1.8 x 1.2
            // No auto-centering or scaling is required.
            const g = (cupBodyMesh as THREE.Mesh).geometry.clone();
            g.computeVertexNormals();

            // Filter out all inner wall faces dynamically, keeping only the outer wall for projection
            const outerGeom = filterOuterSurfaceOnly(g);
            outerGeom.computeBoundingBox();
            outerGeom.computeBoundingSphere();

            return {
                centerPosition: [0, 0, 0] as [number, number, number],
                scale: [1, 1, 1] as [number, number, number],
                mainGeometry: outerGeom
            };
        }

        // 2. Fallback to generic auto-centering and scaling for other models
        let targetMesh: THREE.Mesh | null = null;
        scene.traverse((child: any) => {
            if (child.isMesh && !targetMesh) {
                const geom = child.geometry;
                if (geom && geom.attributes && geom.attributes.position && geom.attributes.position.count > 0) {
                    targetMesh = child;
                }
            }
        });

        if (!targetMesh) {
            const box = new THREE.Box3().setFromObject(scene);
            const center = new THREE.Vector3();
            box.getCenter(center);
            const size = new THREE.Vector3();
            box.getSize(size);
            const maxDim = Math.max(size.x, size.y, size.z);
            const s = 1.8 / (maxDim || 1);
            return {
                centerPosition: [-center.x * s, -center.y * s, -center.z * s] as [number, number, number],
                scale: [s, s, s] as [number, number, number],
                mainGeometry: null
            };
        }

        const mesh: THREE.Mesh = targetMesh;
        const g = mesh.geometry.clone();

        const mainMeshBox = new THREE.Box3().setFromObject(mesh);
        const mainMeshCenter = new THREE.Vector3();
        mainMeshBox.getCenter(mainMeshCenter);
        const mainMeshSize = new THREE.Vector3();
        mainMeshBox.getSize(mainMeshSize);

        const maxDim = Math.max(mainMeshSize.x, mainMeshSize.y, mainMeshSize.z);
        const s = 1.8 / (maxDim || 1);

        g.center();
        g.computeVertexNormals();
        g.scale(s, s, s);
        g.computeBoundingBox();
        g.computeBoundingSphere();

        return {
            centerPosition: [-mainMeshCenter.x * s, -mainMeshCenter.y * s, -mainMeshCenter.z * s] as [number, number, number],
            scale: [s, s, s] as [number, number, number],
            mainGeometry: g
        };
    }, [scene]);

    return (
        <group
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerOver={onPointerOver}
            onPointerOut={onPointerOut}
        >
            {/* 1. Render the entire, complete model centered on the main mesh */}
            <primitive object={scene} position={centerPosition} scale={scale} />

            {/* 2. Render invisible decal target mesh centered at (0, 0, 0) */}
            {mainGeometry && (
                <mesh geometry={mainGeometry} castShadow={false} receiveShadow={false}>
                    <meshBasicMaterial transparent={true} opacity={0.0} depthWrite={false} />
                    {previewUrl && (
                        <Suspense fallback={null}>
                            <DecalOverlay
                                previewUrl={previewUrl}
                                decalX={decalX}
                                decalY={decalY}
                                decalZ={decalZ}
                                decalRot={decalRot}
                                decalScale={decalScale}
                            />
                        </Suspense>
                    )}
                </mesh>
            )}
        </group>
    );
};

interface DynamicModelRendererProps {
    url: string;
    material: THREE.Material;
    previewUrl: string | null;
    decalX: number;
    decalY: number;
    decalZ: number;
    decalRot: [number, number, number];
    decalScale: [number, number, number];
    onPointerDown?: (e: any) => void;
    onPointerMove?: (e: any) => void;
    onPointerOver?: (e: any) => void;
    onPointerOut?: (e: any) => void;
}

const DynamicModelRenderer: React.FC<DynamicModelRendererProps> = ({ 
    url, 
    material, 
    previewUrl, 
    decalX, 
    decalY, 
    decalZ, 
    decalRot, 
    decalScale,
    onPointerDown,
    onPointerMove,
    onPointerOver,
    onPointerOut
}) => {
    const lowerUrl = url.toLowerCase();
    
    if (lowerUrl.endsWith('.stl')) {
        return <StlModelRenderer 
            url={url} 
            material={material} 
            previewUrl={previewUrl}
            decalX={decalX}
            decalY={decalY}
            decalZ={decalZ}
            decalRot={decalRot}
            decalScale={decalScale}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerOver={onPointerOver}
            onPointerOut={onPointerOut}
        />;
    }
    if (lowerUrl.endsWith('.obj')) {
        return <ObjModelRenderer 
            url={url} 
            material={material} 
            previewUrl={previewUrl}
            decalX={decalX}
            decalY={decalY}
            decalZ={decalZ}
            decalRot={decalRot}
            decalScale={decalScale}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerOver={onPointerOver}
            onPointerOut={onPointerOut}
        />;
    }
    if (lowerUrl.endsWith('.3mf')) {
        return <ThreeMfModelRenderer 
            url={url} 
            material={material} 
            previewUrl={previewUrl}
            decalX={decalX}
            decalY={decalY}
            decalZ={decalZ}
            decalRot={decalRot}
            decalScale={decalScale}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerOver={onPointerOver}
            onPointerOut={onPointerOut}
        />;
    }
    return <GltfModelRenderer 
        url={url} 
        material={material} 
        previewUrl={previewUrl}
        decalX={decalX}
        decalY={decalY}
        decalZ={decalZ}
        decalRot={decalRot}
        decalScale={decalScale}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
    />;
};

// ─── Cup Mesh with Dynamic Model Render and Decal projection ────────

interface CupMeshProps {
    url?: string;
    previewUrl: string | null;
    positionX: number;
    positionY: number;
    positionZ: number;
    rotationX: number;
    rotationY: number;
    rotationZ: number;
    scale: number;
    onPointerDown?: (e: any) => void;
    onPointerMove?: (e: any) => void;
    onPointerOver?: (e: any) => void;
    onPointerOut?: (e: any) => void;
}

const CupMesh: React.FC<CupMeshProps> = ({ 
    url,
    previewUrl, 
    positionX, 
    positionY, 
    positionZ, 
    rotationX, 
    rotationY, 
    rotationZ, 
    scale,
    onPointerDown,
    onPointerMove,
    onPointerOver,
    onPointerOut
}) => {
    // Map backend ranges (-10..10) to Three.js units (-0.9..0.9)
    const decalX = positionX / 10;
    const decalY = positionY / 10;
    const decalZ = (positionZ / 10) + 0.58; // Radius of cup is ~0.6

    // Restored to the robust deep projection setting to ensure beautiful rendering on the curved cup surface without clipping
    const decalScale: [number, number, number] = [scale * 0.45, scale * 0.45, 1.0];

    const decalRot: [number, number, number] = [
        THREE.MathUtils.degToRad(rotationX),
        THREE.MathUtils.degToRad(rotationY),
        THREE.MathUtils.degToRad(rotationZ)
    ];

    const brownMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: "#4b2311", // Organic coffee grounds color
        roughness: 0.5,
        metalness: 0.1,
    }), []);

    return (
        <group>
            {url ? (
                <Suspense fallback={null}>
                    <DynamicModelRenderer 
                        url={url} 
                        material={brownMaterial} 
                        previewUrl={previewUrl}
                        decalX={decalX}
                        decalY={decalY}
                        decalZ={decalZ}
                        decalRot={decalRot}
                        decalScale={decalScale}
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerOver={onPointerOver}
                        onPointerOut={onPointerOut}
                    />
                </Suspense>
            ) : (
                <mesh 
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerOver={onPointerOver}
                    onPointerOut={onPointerOut}
                >
                    {/* Standard Cylinder Cup Shape */}
                    <cylinderGeometry args={[0.6, 0.48, 0.908, 64]} />
                    <primitive object={brownMaterial} attach="material" />
                    {previewUrl && (
                        <Suspense fallback={null}>
                            <DecalOverlay
                                previewUrl={previewUrl}
                                decalX={decalX}
                                decalY={decalY}
                                decalZ={decalZ}
                                decalRot={decalRot}
                                decalScale={decalScale}
                            />
                        </Suspense>
                    )}
                </mesh>
            )}
        </group>
    );
};

// ─── 3D Loading Placeholder ──────────────────────────────────────────────────

function Loader() {
    return (
        <Html center>
            <div className="flex flex-col items-center gap-2 text-primary font-bold text-sm">
                <div className="w-8 h-8 border-3 border-[#FAF6F0] border-t-primary rounded-full animate-spin" />
                <span>3D Loading...</span>
            </div>
        </Html>
    );
}

// ─── Exported CustomizerCanvas3D Component ───────────────────────────────────

interface CustomizerCanvas3DProps {
    model3DUrl?: string;
    previewUrl: string | null;
    positionX: number;
    positionY: number;
    positionZ: number;
    rotationX: number;
    rotationY: number;
    rotationZ: number;
    scale: number;
    setPositionX: (x: number) => void;
    setPositionY: (y: number) => void;
    language: string;
}

export const CustomizerCanvas3D: React.FC<CustomizerCanvas3DProps> = ({
    model3DUrl,
    previewUrl,
    positionX,
    positionY,
    positionZ,
    rotationX,
    rotationY,
    rotationZ,
    scale,
    setPositionX,
    setPositionY,
    language
}) => {
    const [isDraggingDecal, setIsDraggingDecal] = useState(false);

    // Global listener to release drag safely anywhere on screen
    useEffect(() => {
        const handleGlobalPointerUp = () => {
            setIsDraggingDecal(false);
        };
        window.addEventListener('pointerup', handleGlobalPointerUp);
        return () => {
            window.removeEventListener('pointerup', handleGlobalPointerUp);
        };
    }, []);

    // Cursor Grab/Grabbing custom styles
    useEffect(() => {
        if (isDraggingDecal) {
            document.body.style.cursor = 'grabbing';
        } else {
            if (document.body.style.cursor === 'grabbing') {
                document.body.style.cursor = 'auto';
            }
        }
        return () => {
            if (document.body.style.cursor === 'grabbing') {
                document.body.style.cursor = 'auto';
            }
        };
    }, [isDraggingDecal]);

    const updatePositionFromPointer = (e: any) => {
        if (!e.point || !e.currentTarget) return;
        
        // Transform the world-space intersection point into the local-space of the current event target group/mesh.
        // This resolves unscaled primitive coordinate discrepancies and guarantees perfectly aligned dragging!
        const localPoint = e.currentTarget.worldToLocal(e.point.clone());
        
        // Map local coordinates directly to position sliders multiplied by 10.
        // The normalized cylinder mesh has a radius of 0.6 and height of 1.8.
        const newX = localPoint.x * 10;
        const newY = localPoint.y * 10;
        
        setPositionX(Math.max(-30, Math.min(30, newX)));
        setPositionY(Math.max(-30, Math.min(30, newY)));
    };

    const handlePointerDown = (e: any) => {
        if (!previewUrl) return;
        e.stopPropagation();
        setIsDraggingDecal(true);
        updatePositionFromPointer(e);
    };

    const handlePointerMove = (e: any) => {
        if (!isDraggingDecal) return;
        e.stopPropagation();
        updatePositionFromPointer(e);
    };

    const handlePointerOver = (e: any) => {
        if (previewUrl) {
            document.body.style.cursor = 'grab';
        }
    };

    const handlePointerOut = (e: any) => {
        if (!isDraggingDecal) {
            document.body.style.cursor = 'auto';
        }
    };

    return (
        <div className="flex-1 w-full relative">
            <Canvas
                camera={{ position: [0, 0, 2.5], fov: 45 }}
                style={{ width: '100%', height: '100%' }}
            >
                <ambientLight intensity={0.6} />
                <directionalLight position={[2, 2, 2]} intensity={0.8} />
                
                <Suspense fallback={<Loader />}>
                    <Stage environment="city" intensity={0.6} adjustCamera={1.2} shadows={false}>
                        <CupMesh 
                            url={model3DUrl}
                            previewUrl={previewUrl}
                            positionX={positionX}
                            positionY={positionY}
                            positionZ={positionZ}
                            rotationX={rotationX}
                            rotationY={rotationY}
                            rotationZ={rotationZ}
                            scale={scale}
                            onPointerDown={handlePointerDown}
                            onPointerMove={handlePointerMove}
                            onPointerOver={handlePointerOver}
                            onPointerOut={handlePointerOut}
                        />
                    </Stage>
                    <OrbitControls 
                        enablePan={false} 
                        minDistance={0.5} 
                        maxDistance={6}
                        enabled={!isDraggingDecal}
                    />
                </Suspense>
            </Canvas>

            {/* Interactive guide banner */}
            <div className="absolute bottom-6 left-6 right-6 text-center text-[10px] lg:text-[11px] font-semibold text-text-secondary/70 pointer-events-none flex flex-wrap justify-center gap-x-4 gap-y-1">
                <span>🖱️ {language === 'vi' ? 'Nhấn giữ chuột để xoay cốc' : 'Click & drag to rotate'}</span>
                <span>🎡 {language === 'vi' ? 'Cuộn chuột để thu phóng' : 'Scroll wheel to zoom'}</span>
                {previewUrl && (
                    <span className="text-primary font-bold">🎨 {language === 'vi' ? 'Kéo thả chuột trên cốc để di chuyển ảnh' : 'Drag on cup to move image'}</span>
                )}
            </div>
        </div>
    );
};
