/**
 * Dotformer SDK
 * JavaScript SDK for interacting with the Dotformer API
 * 
 * @module dotformer-sdk
 * @version 1.0.0
 */

class DotformerSDK {
  /**
   * Create a new Dotformer SDK instance
   * @param {Object} config - Configuration options
   * @param {string} config.apiKey - Your Dotformer API key
   * @param {string} [config.baseUrl='https://api.dotformer.com'] - API base URL
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
   * @returns {string} The base API URL
   */
  _getApiUrl() {
    return `${this.baseUrl}/api/${this.version}`;
  }
  
  /**
   * Make an API request
   * @private
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} Response data
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
    } catch (error) {
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
   * @param {File|Blob|Buffer} file - File to upload
   * @param {Object} [options] - Upload options
   * @param {boolean} [options.makePublic=true] - Make the file publicly accessible
   * @returns {Promise<Object>} Upload result
   */
  async uploadFile(file, options = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options.makePublic !== undefined) {
      formData.append('makePublic', options.makePublic.toString());
    }
    
    return this._request('/files/upload', {
      method: 'POST',
      headers: {
        // Don't set Content-Type for FormData, browser will set it with boundary
        'X-API-Key': this.apiKey
      },
      body: formData
    });
  }
  
  /**
   * Get all files for the authenticated user
   * @returns {Promise<Object>} Files list
   */
  async getFiles() {
    return this._request('/files');
  }
  
  /**
   * Get a specific file
   * @param {string} fileId - ID of the file to retrieve
   * @param {Object} [options] - File options
   * @param {boolean} [options.presigned=false] - Get a presigned URL for private files
   * @returns {Promise<Object>} File info
   */
  async getFile(fileId, options = {}) {
    const query = options.presigned ? '?presigned=true' : '';
    return this._request(`/files/${fileId}${query}`);
  }
  
  /**
   * Delete a file
   * @param {string} fileId - ID of the file to delete
   * @returns {Promise<Object>} Deletion result
   */
  async deleteFile(fileId) {
    return this._request(`/files/${fileId}`, {
      method: 'DELETE'
    });
  }
  
  /**
   * Transform a file
   * @param {string} fileId - ID of the file to transform
   * @param {Object} [options] - Transformation options
   * @param {number} [options.width] - Target width
   * @param {number} [options.height] - Target height
   * @param {string} [options.format] - Output format (jpeg, png, webp, etc.)
   * @param {number} [options.quality] - Output quality (1-100)
   * @param {string} [options.fit] - Fit method (cover, contain, fill, etc.)
   * @param {boolean} [options.grayscale] - Convert to grayscale
   * @param {number} [options.rotate] - Rotation angle in degrees
   * @returns {Promise<Object>} Transformation result
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

// For CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DotformerSDK;
}

// For ES modules
export default DotformerSDK; 