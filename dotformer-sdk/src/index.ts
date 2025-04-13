/**
 * Dotformer SDK
 * TypeScript SDK for interacting with the Dotformer API
 * 
 * @module dotformer-sdk
 * @version 1.0.0
 */

interface SDKConfig {
  apiKey: string;
  baseUrl?: string;
}

interface FileOptions {
  makePublic?: boolean;
}

interface GetFileOptions {
  presigned?: boolean;
}

interface TransformOptions {
  width?: number;
  height?: number;
  format?: string;
  quality?: number;
  fit?: string;
  grayscale?: boolean;
  rotate?: number;
}

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}

class DotformerSDK {
  private apiKey: string;
  private baseUrl: string;
  private version: string;

  /**
   * Create a new Dotformer SDK instance
   * @param config - Configuration options
   */
  constructor(config: SDKConfig) {
    if (!config.apiKey) {
      throw new Error('API key is required');
    }
    
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.dotformer.com';
    this.version = 'v1';
  }
  
  /**
   * Get the base API URL
   * @private
   */
  private _getApiUrl(): string {
    return `${this.baseUrl}/api/${this.version}`;
  }
  
  /**
   * Make an API request
   * @private
   */
  private async _request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this._getApiUrl()}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      'X-API-Key': this.apiKey,
      ...options.headers
    };
    
    const config: RequestInit = {
      ...options,
      headers
    };
    
    try {
      const response = await fetch(url, config);
      const data: ApiResponse<T> = await response.json();
      
      if (!response.ok) {
        const error = new Error(data.error || 'API request failed');
        (error as any).status = response.status;
        (error as any).data = data;
        throw error;
      }
      
      return data as T;
    } catch (error) {
      // If it's already our error, rethrow it
      if ((error as any).status) {
        throw error;
      }
      
      // Handle other fetch errors
      const apiError = new Error('API connection error: ' + ((error as Error).message || 'Unknown error'));
      (apiError as any).originalError = error;
      throw apiError;
    }
  }
  
  /**
   * Upload a file to Dotformer
   * @param file - File to upload
   * @param options - Upload options
   */
  async uploadFile(file: File | Blob | Buffer, options: FileOptions = {}): Promise<ApiResponse> {
    const formData = new FormData();
    
    // Handle different file types correctly
    if (Buffer.isBuffer(file)) {
      // For Node.js Buffer, convert to Blob with appropriate filename
      const blob = new Blob([file]);
      formData.append('file', blob, 'file.bin');
    } else if (file instanceof File) {
      // File already has filename information
      formData.append('file', file);
    } else {
      // For Blob without filename
      formData.append('file', file, 'file.bin');
    }
    
    if (options.makePublic !== undefined) {
      formData.append('makePublic', options.makePublic.toString());
    }
    
    return this._request<ApiResponse>('/files/upload', {
      method: 'POST',
      headers: {
        'X-API-Key': this.apiKey
      },
      body: formData as any
    });
  }
  
  /**
   * Get all files for the authenticated user
   */
  async getFiles(): Promise<ApiResponse> {
    return this._request<ApiResponse>('/files');
  }
  
  /**
   * Get a specific file
   * @param fileId - ID of the file to retrieve
   * @param options - File options
   */
  async getFile(fileId: string, options: GetFileOptions = {}): Promise<ApiResponse> {
    const query = options.presigned ? '?presigned=true' : '';
    return this._request<ApiResponse>(`/files/${fileId}${query}`);
  }
  
  /**
   * Delete a file
   * @param fileId - ID of the file to delete
   */
  async deleteFile(fileId: string): Promise<ApiResponse> {
    return this._request<ApiResponse>(`/files/${fileId}`, {
      method: 'DELETE'
    });
  }
  
  /**
   * Transform a file
   * @param fileId - ID of the file to transform
   * @param options - Transformation options
   */
  async transformFile(fileId: string, options: TransformOptions = {}): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    
    // Add all options to query params
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    return this._request<ApiResponse>(`/files/transform/${fileId}${query}`, {
      method: 'POST'
    });
  }
}

export default DotformerSDK;