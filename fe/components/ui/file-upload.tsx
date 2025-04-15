import React, { useState, useRef, ChangeEvent } from 'react';
import { Button } from "./button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./card";
import { fileService } from "@/lib/services/fileService";

interface FileUploadProps {
  onUploadSuccess: (file: UploadedFile) => void;
  onUploadError: (error: string) => void;
  accept?: string;
  maxSize?: number;  // In bytes
  makePublic?: boolean;
  className?: string;
  allowedTypes?: string[];
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export function FileUpload({
  onUploadSuccess,
  onUploadError,
  accept = "image/*,application/pdf,text/plain",
  maxSize = 10 * 1024 * 1024, // 10MB default
  makePublic = true,
  className,
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFile = e.target.files?.[0];
    
    if (!selectedFile) {
      return;
    }

    // Validate file size
    if (selectedFile.size > maxSize) {
      setError(`File size exceeds the ${maxSize / (1024 * 1024)}MB limit`);
      return;
    }

    // Validate file type
    if (allowedTypes && !allowedTypes.includes(selectedFile.type)) {
      setError(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    setError(null);
    const droppedFile = e.dataTransfer.files?.[0];
    
    if (!droppedFile) {
      return;
    }

    // Validate file size
    if (droppedFile.size > maxSize) {
      setError(`File size exceeds the ${maxSize / (1024 * 1024)}MB limit`);
      return;
    }

    // Validate file type
    if (allowedTypes && !allowedTypes.includes(droppedFile.type)) {
      setError(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
      return;
    }

    setFile(droppedFile);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    setError(null);
    setProgress(0);

    try {
      // Use the file service to upload the file
      const response = await fileService.uploadFile(file, makePublic);
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      setFile(null);
      setProgress(100);
      
      // Notify parent component about successful upload
      if (onUploadSuccess) {
        onUploadSuccess(response);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      
      // Notify parent component about upload error
      if (onUploadError) {
        onUploadError(errorMessage);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Upload File</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={triggerFileInput}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept={accept}
          />
          
          <div className="mb-4">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="mx-auto h-12 w-12 text-gray-400"
            >
              <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
              <path d="M12 12v9"></path>
              <path d="m8 17 4 4 4-4"></path>
            </svg>
          </div>
          
          {file ? (
            <p className="text-sm font-medium">
              Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </p>
          ) : (
            <p className="text-sm text-gray-500">
              Drag and drop a file here, or click to select a file
            </p>
          )}
          
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
          
          {isUploading && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          onClick={() => {
            setFile(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }}
          variant="outline"
          disabled={!file || isUploading}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleUpload}
          disabled={!file || isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </Button>
      </CardFooter>
    </Card>
  );
} 