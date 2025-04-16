import { fetchWithAuth } from '@/lib/auth/authUtils';
import { BACKEND_BASE_URL } from '../constants';

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  key?: string;
  createdAt: string;
  lastUsed: string | null;
  isActive: boolean;
}

export interface ApiKeyWithValue {
  apiKey: ApiKey;
  value: string;
}

// Make sure this URL points to your backend server
const API_BASE_URL = BACKEND_BASE_URL;

/**
 * Fetches all API keys for the authenticated user
 */
export async function getApiKeys(): Promise<{ success: boolean; apiKeys?: ApiKey[]; error?: string }> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/api-keys`);
    
    // Clone the response to avoid "body already read" errors
    const responseClone = response.clone();
    
    // Log the actual response data for debugging
    try {
      const responseData = await responseClone.json();
      return responseData;
    } catch (e) {
      console.log('Could not parse response data for logging:', e);
    }
    
    // Handle successful empty response (204 No Content)
    if (response.status === 204) {
      return { success: true, apiKeys: [] };
    }
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API keys fetch error:', errorData);
      return { 
        success: false, 
        error: errorData.error || `Failed to fetch API keys (${response.status})` 
      };
    }
    
    const data = await response.json();
    console.log('API keys fetched successfully, count:', data.apiKeys?.length || 0);
    return data;
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch API keys' 
    };
  }
}

/**
 * Creates a new API key for the authenticated user
 */
export async function createApiKey(name: string, expiresInDays?: number): Promise<{ 
  success: boolean; 
  apiKey?: ApiKey; 
  error?: string 
}> {
  try {
    
    const requestBody = { name, expiresInDays };
    console.log('Request body:', JSON.stringify(requestBody));
    
    const response = await fetchWithAuth(`${API_BASE_URL}/api-keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    console.log('API key creation response status:', response.status);
    console.log('Response headers:', Object.fromEntries([...response.headers.entries()]));
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API key creation error:', errorData);
      return { 
        success: false, 
        error: errorData.error || `Failed to create API key (${response.status})` 
      };
    }
    
    try {
      const data = await response.json();
      console.log('API key created successfully:', data.success);
      
      return data;
    } catch (parseError) {
      console.error('Error parsing API key creation response:', parseError);
      // If we can't parse the response but it was successful, return a generic success
      return { 
        success: true,
        error: 'API key created, but response could not be parsed' 
      };
    }
  } catch (error) {
    console.error('Error creating API key:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create API key' 
    };
  }
}

/**
 * Deletes an API key
 */
export async function deleteApiKey(keyId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/api-keys/${keyId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return { 
        success: false, 
        error: errorData.error || `Failed to delete API key (${response.status})` 
      };
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting API key:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete API key' 
    };
  }
}

/**
 * Updates an API key (name or active status)
 */
export async function updateApiKey(
  keyId: string, 
  updateData: { name?: string; isActive?: boolean }
): Promise<{ success: boolean; apiKey?: ApiKey; error?: string }> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/api-keys/${keyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return { 
        success: false, 
        error: errorData.error || `Failed to update API key (${response.status})` 
      };
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating API key:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update API key' 
    };
  }
} 