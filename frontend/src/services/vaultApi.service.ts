const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface VaultRecordResponse {
    id: string;
    ciphertext: string;
    iv: string;
    createdAt: string;
    updatedAt: string;
}

export interface SaveVaultEntryDto {
    ciphertext: string;
    iv: string;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = sessionStorage.getItem('auth_token'); // Or read from Auth Context
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    return response.status !== 204 ? await response.json() : ({} as T);
}

export const VaultApi = {
    // Fetch all encrypted records for current user
    getAll: (): Promise<VaultRecordResponse[]> => {
        return request<VaultRecordResponse[]>('/vault');
    },

    // Create a new encrypted record
    create: (dto: SaveVaultEntryDto): Promise<VaultRecordResponse> => {
        return request<VaultRecordResponse>('/vault', {
            method: 'POST',
            body: JSON.stringify(dto),
        });
    },

    // Update an existing record
    update: (id: string, dto: SaveVaultEntryDto): Promise<VaultRecordResponse> => {
        return request<VaultRecordResponse>(`/vault/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(dto),
        });
    },

    // Delete a record
    delete: (id: string): Promise<void> => {
        return request<void>(`/vault/${id}`, {
            method: 'DELETE',
        });
    },
};