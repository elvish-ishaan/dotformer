"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Trash2, Download, Share2, Search, Filter, UploadCloud } from 'lucide-react';
import { fileService } from '@/lib/services/fileService';
import { formatFileSize } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface File {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  createdAt: string;
  updatedAt: string;
  url: string;
  userId: string;
}

export default function FilesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  //fetching user files from backend
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setIsLoading(true);
        const files = await fileService.getFiles();
        setFiles(files);
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

  const handleDeleteFile = async (fileId: string) => {
    try {
      await fileService.deleteFile(fileId);
      setFiles(prev => prev.filter(file => file.id !== fileId));
    } catch (err) {
      console.error("Failed to delete file:", err);
    }
  };

  const filteredFiles = files?.filter(file => 
    file.fileName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Files</h1>
          <p className="text-muted-foreground">
            Manage and organize your .dot files and other documents
          </p>
        </div>
        <Button 
          className="flex items-center gap-2"
          onClick={() => router.push('/upload')}
        >
          <UploadCloud className="h-4 w-4" />
          Upload File
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Files</CardTitle>
          <CardDescription>
            You have {files?.length} files stored in your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading your files...</p>
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
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Last Modified</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFiles?.length > 0 ? (
                  filteredFiles?.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell>{file.fileName}</TableCell>
                      <TableCell>{formatFileSize(file.fileSize)}</TableCell>
                      <TableCell>{new Date(file.updatedAt).toLocaleDateString()}</TableCell>
                      <TableCell>{file.fileType}</TableCell>
                      <TableCell className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <a href={file.url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteFile(file.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No files found matching your search
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 