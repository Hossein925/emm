
// استفاده از آدرس نسبی برای بهره‌مندی از پروکسی Vite
const API_BASE_URL = '/api';
const ASSETS_BASE_URL = ''; // فایل‌ها نیز از طریق پروکسی سرو می‌شوند

// تابع کمکی برای درخواست‌ها
const fetchJson = async (url: string, options?: RequestInit) => {
    try {
        const fullUrl = `${API_BASE_URL}${url}`;
        const res = await fetch(fullUrl, options);
        
        if (!res.ok) {
            let errorMessage = `API Error: ${res.status} ${res.statusText}`;
            try {
                const errorData = await res.json();
                if (errorData.error) errorMessage = errorData.error;
            } catch (e) {
                // If response is not JSON, use status text
            }
            console.error(`Fetch failed for ${fullUrl}:`, errorMessage);
            throw new Error(errorMessage);
        }
        return res.json();
    } catch (error: any) {
        console.error("Network or API Error:", error);
        throw error;
    }
};

export const api = {
    // دریافت آدرس کامل فایل
    getFileUrl: (path: string) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return `${ASSETS_BASE_URL}${path}`;
    },

    // --- Banners ---
    getBanners: () => fetchJson('/banners'),
    addBanner: (formData: FormData) => fetch(`${API_BASE_URL}/banners`, { method: 'POST', body: formData }),
    updateBanner: (id: string, formData: FormData) => fetch(`${API_BASE_URL}/banners/${id}`, { method: 'PUT', body: formData }),
    deleteBanner: (id: string) => fetchJson(`/banners/${id}`, { method: 'DELETE' }),

    // --- Sections ---
    getSections: () => fetchJson('/sections'),
    addSection: (data: { name: string, icon: string, color_class: string }) => 
        fetchJson('/sections', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }),
    updateSection: (id: string, data: { name: string, icon: string, color_class: string }) => 
        fetchJson(`/sections/${id}`, { 
            method: 'PUT', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }),
    deleteSection: (id: string) => fetchJson(`/sections/${id}`, { method: 'DELETE' }),

    // --- Diseases ---
    getDiseases: () => fetchJson('/diseases'),
    addDisease: (data: { name: string, description: string, section_id: number }) => 
        fetchJson('/diseases', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }),
    updateDisease: (id: string, data: { name: string, description: string }) => 
        fetchJson(`/diseases/${id}`, { 
            method: 'PUT', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }),
    deleteDisease: (id: string) => fetchJson(`/diseases/${id}`, { method: 'DELETE' }),

    // --- Files ---
    getFiles: () => fetchJson('/files'),
    addFile: (formData: FormData) => fetch(`${API_BASE_URL}/files`, { method: 'POST', body: formData }),
    deleteFile: (id: string) => fetchJson(`/files/${id}`, { method: 'DELETE' }),

    // --- Topics ---
    getTopics: () => fetchJson('/topics'),
    addTopic: (data: { name: string, description: string }) => 
        fetchJson('/topics', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }),
    updateTopic: (id: string, data: { name: string, description: string }) => 
        fetchJson(`/topics/${id}`, { 
            method: 'PUT', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }),
    deleteTopic: (id: string) => fetchJson(`/topics/${id}`, { method: 'DELETE' }),
};
