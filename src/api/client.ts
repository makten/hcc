/**
 * API Client for Home Control Center Backend
 * 
 * This module provides a unified interface for communicating with the backend API.
 * It can be used instead of localStorage for persistent storage.
 */

// API base URL - can be configured via environment variable or falls back to relative URL
const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Check if we should use the API (backend mode) or localStorage (standalone mode)
export const USE_BACKEND_API = import.meta.env.VITE_USE_BACKEND === 'true' ||
    window.location.port !== '5173';

interface ApiResponse<T> {
    data?: T;
    error?: string;
}

async function apiCall<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { error: errorData.error || `HTTP ${response.status}` };
        }

        const data = await response.json();
        return { data };
    } catch (error) {
        console.error('API call failed:', error);
        return { error: error instanceof Error ? error.message : 'Network error' };
    }
}

// ============================================
// User API
// ============================================

export const userApi = {
    async getAll() {
        return apiCall<any[]>('/users');
    },

    async getById(id: string) {
        return apiCall<any>(`/users/${id}`);
    },

    async create(userData: any) {
        return apiCall<any>('/users', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    },

    async update(id: string, updates: any) {
        return apiCall<{ success: boolean }>(`/users/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(updates),
        });
    },

    async updatePin(id: string, pinHash: { hash: string; salt: string } | null) {
        return apiCall<{ success: boolean }>(`/users/${id}/pin`, {
            method: 'PATCH',
            body: JSON.stringify({ pinHash }),
        });
    },

    async updateBiometric(id: string, enabled: boolean, credentialId?: string) {
        return apiCall<{ success: boolean }>(`/users/${id}/biometric`, {
            method: 'PATCH',
            body: JSON.stringify({ enabled, credentialId }),
        });
    },

    async recordLogin(id: string) {
        return apiCall<{ success: boolean; lastLogin: string }>(`/users/${id}/login`, {
            method: 'PATCH',
        });
    },

    async delete(id: string) {
        return apiCall<{ success: boolean }>(`/users/${id}`, {
            method: 'DELETE',
        });
    },

    async getPinHash(id: string) {
        return apiCall<{ hasPin: boolean; pinHash?: { hash: string; salt: string } }>(
            `/users/${id}/verify-pin`,
            { method: 'POST' }
        );
    },
};

// ============================================
// Config API
// ============================================

export const configApi = {
    async getAll() {
        return apiCall<Record<string, any>>('/config');
    },

    async get(key: string) {
        return apiCall<any>(`/config/${key}`);
    },

    async set(key: string, value: any) {
        return apiCall<{ success: boolean }>(`/config/${key}`, {
            method: 'PUT',
            body: JSON.stringify(value),
        });
    },

    async delete(key: string) {
        return apiCall<{ success: boolean }>(`/config/${key}`, {
            method: 'DELETE',
        });
    },
};

// ============================================
// Scene API
// ============================================

export const sceneApi = {
    async getAll() {
        return apiCall<any[]>('/scenes');
    },

    async create(sceneData: any) {
        return apiCall<{ id: string; name: string }>('/scenes', {
            method: 'POST',
            body: JSON.stringify(sceneData),
        });
    },

    async update(id: string, updates: any) {
        return apiCall<{ success: boolean }>(`/scenes/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(updates),
        });
    },

    async delete(id: string) {
        return apiCall<{ success: boolean }>(`/scenes/${id}`, {
            method: 'DELETE',
        });
    },
};

// ============================================
// Audit API
// ============================================

export const auditApi = {
    async getRecent(limit: number = 100) {
        return apiCall<any[]>(`/audit?limit=${limit}`);
    },
};

// ============================================
// Health Check
// ============================================

export const healthApi = {
    async check() {
        return apiCall<{ status: string; timestamp: string }>('/health');
    },
};

export default {
    user: userApi,
    config: configApi,
    scene: sceneApi,
    audit: auditApi,
    health: healthApi,
    USE_BACKEND_API,
};
