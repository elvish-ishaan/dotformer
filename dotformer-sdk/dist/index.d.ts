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
declare class DotformerSDK {
    private apiKey;
    private baseUrl;
    private version;
    /**
     * Create a new Dotformer SDK instance
     * @param config - Configuration options
     */
    constructor(config: SDKConfig);
    /**
     * Get the base API URL
     * @private
     */
    private _getApiUrl;
    /**
     * Make an API request
     * @private
     */
    private _request;
    /**
     * Upload a file to Dotformer
     * @param file - File to upload
     * @param options - Upload options
     */
    uploadFile(file: File | Blob | Buffer, options?: FileOptions): Promise<ApiResponse>;
    /**
     * Get all files for the authenticated user
     */
    getFiles(): Promise<ApiResponse>;
    /**
     * Get a specific file
     * @param fileId - ID of the file to retrieve
     * @param options - File options
     */
    getFile(fileId: string, options?: GetFileOptions): Promise<ApiResponse>;
    /**
     * Delete a file
     * @param fileId - ID of the file to delete
     */
    deleteFile(fileId: string): Promise<ApiResponse>;
    /**
     * Transform a file
     * @param fileId - ID of the file to transform
     * @param options - Transformation options
     */
    transformFile(fileId: string, options?: TransformOptions): Promise<ApiResponse>;
}
export default DotformerSDK;
