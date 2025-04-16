import React, { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { FileUpload } from "./ui/file-upload";
import { fileService } from "@/lib/services/fileService";
import { BACKEND_BASE_URL } from "@/lib/constants";
import { Loader2 } from "lucide-react";

interface TransformOptions {
  width?: number;
  height?: number;
  format?: string;
  quality?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  grayscale?: boolean;
  rotate?: number;
  blur?: number;
  sharpen?: number;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

interface UploadResponse {
  success: boolean;
  asset?: {
    id: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    url: string;
  };
  error?: string;
}

export default function ImageTransformer() {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [transformedUrl, setTransformedUrl] = useState<string | null>(null);
  const [isTransforming, setIsTransforming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [transformOptions, setTransformOptions] = useState<TransformOptions>({
    width: 400,
    height: 300,
    format: 'webp',
    quality: 80,
    fit: 'cover',
  });

  // Remove the automatic transformation effect
  // We'll only transform when the user clicks the button
  
  const handleUploadSuccess = (response: any) => {
    console.log('Upload response:', response);
    
    // Check if the response contains the asset property
    if (response.success && response.asset) {
      const file: UploadedFile = {
        id: response.asset.id,
        name: response.asset.fileName,
        size: response.asset.fileSize,
        type: response.asset.fileType,
        url: response.asset.url
      };
      
      setUploadedFile(file);
      setError(null);
      console.log('File set:', file);
    } else {
      setError('Invalid response format from upload service');
      console.error('Invalid upload response format:', response);
    }
  };

  const handleUploadError = (errorMsg: string) => {
    setError(errorMsg);
    setUploadedFile(null);
    setTransformedUrl(null);
  };

  const applyTransformation = async () => {
    if (!uploadedFile || !uploadedFile.id) {
      setError("No file selected or file ID is missing");
      console.error('Cannot transform: Missing file ID', uploadedFile);
      return;
    }
    
    console.log('Applying transformation to file ID:', uploadedFile.id, 'with options:', transformOptions);
    
    setIsTransforming(true);
    setError(null);
    
    try {
      const result = await fileService.transformFile(uploadedFile.id, transformOptions);
      console.log('Transformation result:', result);
      setTransformedUrl(result.transformedUrl);
    } catch (err) {
      console.error('Transformation error:', err);
      setError(err instanceof Error ? err.message : 'Transformation failed');
    } finally {
      setIsTransforming(false);
    }
  };

  const handleOptionChange = (name: keyof TransformOptions, value: string | number | boolean) => {
    setTransformOptions(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const copyUrlToClipboard = () => {
    if (transformedUrl) {
      navigator.clipboard.writeText(transformedUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  // Generate the preview URL with all current options
  const getPreviewUrl = () => {
    if (!transformedUrl) return null;
    
    // For immediate preview, we can directly use the transformed URL 
    // that was returned from the API
    return transformedUrl;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left side: Upload and settings */}
      <div>
        {!uploadedFile ? (
          <FileUpload
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
            accept="image/*"
            allowedTypes={['image/jpeg', 'image/png', 'image/webp', 'image/gif']}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Transform Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Original Image</h3>
                <img 
                  src={uploadedFile.url} 
                  alt="Original" 
                  className="max-w-full h-auto rounded-md border"
                  style={{ maxHeight: '200px', objectFit: 'contain' }}
                />
                <p className="text-xs text-muted-foreground">
                  {uploadedFile.name} ({Math.round(uploadedFile.size / 1024)} KB)
                </p>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="width">Width</Label>
                  <Input
                    id="width"
                    type="number"
                    value={transformOptions.width || ''}
                    onChange={(e) => handleOptionChange('width', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="height">Height</Label>
                  <Input
                    id="height"
                    type="number"
                    value={transformOptions.height || ''}
                    onChange={(e) => handleOptionChange('height', parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="format">Format</Label>
                  <select
                    id="format"
                    value={transformOptions.format || 'webp'}
                    onChange={(e) => handleOptionChange('format', e.target.value)}
                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="webp">WebP</option>
                    <option value="jpeg">JPEG</option>
                    <option value="png">PNG</option>
                    <option value="avif">AVIF</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="quality">Quality (1-100)</Label>
                  <Input
                    id="quality"
                    type="number"
                    min="1"
                    max="100"
                    value={transformOptions.quality || 80}
                    onChange={(e) => handleOptionChange('quality', parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="fit">Fit</Label>
                  <select
                    id="fit"
                    value={transformOptions.fit || 'cover'}
                    onChange={(e) => handleOptionChange('fit', e.target.value as any)}
                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="cover">Cover</option>
                    <option value="contain">Contain</option>
                    <option value="fill">Fill</option>
                    <option value="inside">Inside</option>
                    <option value="outside">Outside</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="rotate">Rotate (degrees)</Label>
                  <Input
                    id="rotate"
                    type="number"
                    min="0"
                    max="360"
                    value={transformOptions.rotate || 0}
                    onChange={(e) => handleOptionChange('rotate', parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  id="grayscale"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  checked={!!transformOptions.grayscale}
                  onChange={(e) => handleOptionChange('grayscale', e.target.checked)}
                />
                <Label htmlFor="grayscale">Grayscale</Label>
              </div>
              
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setUploadedFile(null);
                  setTransformedUrl(null);
                }}
              >
                Upload Different Image
              </Button>
              <Button onClick={applyTransformation}>
                Apply Transformation
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
      
      {/* Right side: Preview and URL */}
      <div>
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Preview & URL</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col">
            {isTransforming ? (
              <div className="flex-grow flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Transforming image...</span>
              </div>
            ) : uploadedFile && transformedUrl ? (
              <div className="space-y-4 flex-grow flex flex-col">
                <div className="flex-grow flex flex-col items-center justify-center">
                  <h3 className="text-sm font-medium mb-2">Transformed Image</h3>
                  <img 
                    src={getPreviewUrl() || ''} 
                    alt="Transformed" 
                    className="max-w-full h-auto rounded-md border"
                    style={{ maxHeight: '300px', objectFit: 'contain' }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="url">Transformation URL</Label>
                  <div className="relative">
                    <Input
                      id="url"
                      readOnly
                      value={transformedUrl}
                      className="pr-16"
                    />
                    <Button
                      size="sm"
                      className="absolute right-1 top-1 h-7"
                      onClick={copyUrlToClipboard}
                    >
                      {copySuccess ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This URL can be used directly in your application
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="flex-grow flex items-center justify-center text-destructive">
                <p>{error}</p>
              </div>
            ) : (
              <div className="flex-grow flex items-center justify-center text-muted-foreground">
                <p>{uploadedFile ? "Click 'Apply Transformation' to see preview" : "Upload an image to see the preview"}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}