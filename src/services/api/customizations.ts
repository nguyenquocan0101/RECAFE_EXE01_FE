const apiUrl = import.meta.env.VITE_API_URL || '/';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

const getMultipartHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export interface CustomizationData {
    portraitImage: File;
    positionX?: number;
    positionY?: number;
    positionZ?: number;
    rotationX?: number;
    rotationY?: number;
    rotationZ?: number;
    scale?: number;
    engraveDepth?: number;
    note?: string;
}

export interface CustomizationDto {
    id: string;
    productId: string;
    status: 'Queued' | 'Processing' | 'Completed' | 'Failed';
    isMockResult: boolean;
    sourceImageUrl: string;
    previewImageUrl: string;
    resultModelUrl: string;
    baseModel3DUrl: string;
    positionX: number;
    positionY: number;
    positionZ: number;
    rotationX: number;
    rotationY: number;
    rotationZ: number;
    scale: number;
    engraveDepth: number;
    note?: string;
    createdAt: string;
}

export const createCustomization = async (productId: string, data: CustomizationData): Promise<CustomizationDto> => {
    const formData = new FormData();
    formData.append('portraitImage', data.portraitImage);
    
    if (data.positionX !== undefined) formData.append('positionX', String(data.positionX));
    if (data.positionY !== undefined) formData.append('positionY', String(data.positionY));
    if (data.positionZ !== undefined) formData.append('positionZ', String(data.positionZ));
    
    if (data.rotationX !== undefined) formData.append('rotationX', String(data.rotationX));
    if (data.rotationY !== undefined) formData.append('rotationY', String(data.rotationY));
    if (data.rotationZ !== undefined) formData.append('rotationZ', String(data.rotationZ));
    
    if (data.scale !== undefined) formData.append('scale', String(data.scale));
    if (data.engraveDepth !== undefined) formData.append('engraveDepth', String(data.engraveDepth));
    if (data.note !== undefined) formData.append('note', data.note);

    const response = await fetch(`${apiUrl}api/products/${productId}/customizations`, {
        method: 'POST',
        headers: getMultipartHeaders(),
        body: formData
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to create customization');
    }

    const resJson = await response.json();
    return resJson.data || resJson;
};

export const getCustomizations = async (productId: string): Promise<CustomizationDto[]> => {
    const response = await fetch(`${apiUrl}api/products/${productId}/customizations`, {
        method: 'GET',
        headers: getHeaders()
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to load customizations');
    }

    const resJson = await response.json();
    return Array.isArray(resJson) ? resJson : (resJson.data || []);
};

export const getCustomizationBootstrap = async (productId: string): Promise<CustomizationDto | null> => {
    const response = await fetch(`${apiUrl}api/products/${productId}/customizations/bootstrap`, {
        method: 'GET',
        headers: getHeaders()
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to load customization bootstrap data');
    }

    const resJson = await response.json();
    return resJson.data || resJson;
};

export const getCustomizationDetail = async (productId: string, customizationId: string): Promise<CustomizationDto> => {
    const response = await fetch(`${apiUrl}api/products/${productId}/customizations/${customizationId}`, {
        method: 'GET',
        headers: getHeaders()
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to load customization details');
    }

    const resJson = await response.json();
    return resJson.data || resJson;
};
