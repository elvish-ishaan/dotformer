// Define the API base URL
const API_BASE_URL = "http://localhost:5000";

/**
 * Service for handling file operations with the backend API
 */
class FileService {
  /**
   * Upload a file to the server
   * 
   * @param file - The file to upload
   * @param makePublic - Whether to make the file publicly accessible (default: true)
   * @param token - Authentication token
   * @returns Promise with the uploaded file data
   */
  async uploadFile(file: File, makePublic: boolean = true, token?: string): Promise<any> {
    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('makePublic', makePublic.toString());

      // Get auth token from localStorage or cookies if not provided
      const authToken = token || localStorage.getItem('token') || '';

      // Upload file to backend
      const response = await fetch(`${API_BASE_URL}/api/files/upload`, {
        method: 'POST',
        headers: {
          'Authorization': authToken ? `Bearer ${authToken}` : '',
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get a list of files for the current user
   * 
   * @param token - Authentication token
   * @returns Promise with the file list
   */
  async getFiles(token?: string): Promise<any[]> {
    try {
      // Get auth token from localStorage or cookies if not provided
      const authToken = token || localStorage.getItem('token') || '';

      const response = await fetch(`${API_BASE_URL}/api/files`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken ? `Bearer ${authToken}` : '',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch files');
      }

      return data.assets || [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get a single file by ID
   * 
   * @param fileId - The ID of the file to get
   * @param token - Authentication token
   * @returns Promise with the file data
   */
  async getFile(fileId: string, token?: string): Promise<any> {
    try {
      // Get auth token from localStorage or cookies if not provided
      const authToken = token || localStorage.getItem('token') || '';

      const response = await fetch(`${API_BASE_URL}/api/files/${fileId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken ? `Bearer ${authToken}` : '',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch file');
      }

      return data.asset;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a file by ID
   * 
   * @param fileId - The ID of the file to delete
   * @param token - Authentication token
   * @returns Promise indicating success
   */
  async deleteFile(fileId: string, token?: string): Promise<any> {
    try {
      // Get auth token from localStorage or cookies if not provided
      const authToken = token || localStorage.getItem('token') || '';

      const response = await fetch(`${API_BASE_URL}/api/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken ? `Bearer ${authToken}` : '',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete file');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Transform a file using the backend transformation API
   * 
   * @param fileId - The ID of the file to transform
   * @param transformOptions - Options for transformation (width, height, format, etc.)
   * @param token - Authentication token
   * @returns Promise with the transformed file data
   */
  async transformFile(fileId: string, transformOptions: any, token?: string): Promise<any> {
    try {
      // Get auth token from localStorage or cookies if not provided
      const authToken = token || localStorage.getItem('token') || '';

      // Convert options to query params
      const queryParams = new URLSearchParams();
      for (const [key, value] of Object.entries(transformOptions)) {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      }

      const response = await fetch(`${API_BASE_URL}/api/files/transform/${fileId}?${queryParams.toString()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken ? `Bearer ${authToken}` : '',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to transform file');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }
}

// Create singleton instance
export const fileService = new FileService(); 