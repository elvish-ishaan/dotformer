"use client";

import { useState, useEffect } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { fileService } from "@/lib/services/fileService";

interface File {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
}

export default function UploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch existing files on component mount
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setIsLoading(true);
        const files = await fileService.getFiles();
        setUploadedFiles(files);
        setError(null);
      } catch (err) {
        setError("Failed to load files. Please try again later.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFiles();
  }, []);

  const handleUploadSuccess = (data: File) => {
    setUploadedFiles(prev => [data, ...prev]);
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await fileService.deleteFile(fileId);
      setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    } catch (err) {
      console.error("Failed to delete file:", err);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">File Upload</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <FileUpload 
            onUploadSuccess={handleUploadSuccess}
            onUploadError={(error) => console.error(error)}
          />
        </div>
        
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Files</CardTitle>
              <CardDescription>Manage your uploaded files</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <svg
                    className="animate-spin h-8 w-8 text-primary mx-auto mb-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <p className="text-gray-500">Loading your files...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-500">{error}</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </Button>
                </div>
              ) : uploadedFiles.length > 0 ? (
                <Tabs defaultValue="all">
                  <TabsList className="mb-4">
                    <TabsTrigger value="all">All Files</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {uploadedFiles.map((file) => (
                        <FileCard 
                          key={file?.id} 
                          file={file} 
                          onDelete={() => handleDeleteFile(file.id)}
                        />
                      ))}
                    </div>
                  </TabsContent>
                  
                </Tabs>
              ) : (
                <div className="text-center py-12">
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
                    className="mx-auto h-12 w-12 text-gray-400 mb-4"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="M9 13h6" />
                    <path d="M12 10v6" />
                  </svg>
                  <p className="text-gray-500">No files uploaded yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

interface FileCardProps {
  file: File;
  onDelete: () => void;
}

function FileCard({ file, onDelete }: FileCardProps) {
  const isImage = file.fileType?.startsWith('image/');
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded bg-gray-100">
            {isImage ? (
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
                className="text-gray-500"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
            ) : (
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
                className="text-gray-500"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {file.fileName || 'Unnamed file'}
            </p>
            <p className="text-sm text-gray-500">
              {isImage ? 'Image' : 'Document'} • {formatFileSize(file.fileSize || 0)}
            </p>
          </div>
          <div className="flex-shrink-0 flex space-x-2">
            <Button size="sm" variant="outline" asChild>
              <a href={file.url} target="_blank" rel="noopener noreferrer">
                View
              </a>
            </Button>
            <Button size="sm" variant="outline" className="text-red-500 hover:text-red-700" onClick={onDelete}>
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
} 