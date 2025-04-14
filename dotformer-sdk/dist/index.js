/**
 * Dotformer SDK
 * TypeScript SDK for interacting with the Dotformer API
 *
 * @module dotformer-sdk
 * @version 1.0.0
 */
class DotformerSDK {
    /**
     * Create a new Dotformer SDK instance
     * @param config - Configuration options
     */
    constructor(config) {
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
    _getApiUrl() {
        return `${this.baseUrl}/api/${this.version}`;
    }
    /**
     * Make an API request
     * @private
     */
    async _request(endpoint, options = {}) {
        const url = `${this._getApiUrl()}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            'X-API-Key': this.apiKey,
            ...options.headers
        };
        const config = {
            ...options,
            headers
        };
        try {
            const response = await fetch(url, config);
            const data = await response.json();
            if (!response.ok) {
                const error = new Error(data.error || 'API request failed');
                error.status = response.status;
                error.data = data;
                throw error;
            }
            return data;
        }
        catch (error) {
            // If it's already our error, rethrow it
            if (error.status) {
                throw error;
            }
            // Handle other fetch errors
            const apiError = new Error('API connection error: ' + (error.message || 'Unknown error'));
            apiError.originalError = error;
            throw apiError;
        }
    }
    /**
     * Upload a file to Dotformer
     * @param file - File to upload
     * @param options - Upload options
     */
    async uploadFile(file, options = {}) {
        const formData = new FormData();
        // Handle different file types correctly
        if (Buffer.isBuffer(file)) {
            // For Node.js Buffer, convert to Blob with appropriate filename
            const blob = new Blob([file]);
            formData.append('file', blob, 'file.bin');
        }
        else if (file instanceof File) {
            // File already has filename information
            formData.append('file', file);
        }
        else {
            // For Blob without filename
            formData.append('file', file, 'file.bin');
        }
        if (options.makePublic !== undefined) {
            formData.append('makePublic', options.makePublic.toString());
        }
        return this._request('/files/upload', {
            method: 'POST',
            headers: {
                'X-API-Key': this.apiKey
            },
            body: formData
        });
    }
    /**
     * Get all files for the authenticated user
     */
    async getFiles() {
        return this._request('/files');
    }
    /**
     * Get a specific file
     * @param fileId - ID of the file to retrieve
     * @param options - File options
     */
    async getFile(fileId, options = {}) {
        const query = options.presigned ? '?presigned=true' : '';
        return this._request(`/files/${fileId}${query}`);
    }
    /**
     * Delete a file
     * @param fileId - ID of the file to delete
     */
    async deleteFile(fileId) {
        return this._request(`/files/${fileId}`, {
            method: 'DELETE'
        });
    }
    /**
     * Transform a file
     * @param fileId - ID of the file to transform
     * @param options - Transformation options
     */
    async transformFile(fileId, options = {}) {
        const queryParams = new URLSearchParams();
        // Add all options to query params
        Object.entries(options).forEach(([key, value]) => {
            if (value !== undefined) {
                queryParams.append(key, value.toString());
            }
        });
        const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
        return this._request(`/files/transform/${fileId}${query}`, {
            method: 'POST'
        });
    }
}
export default DotformerSDK;
