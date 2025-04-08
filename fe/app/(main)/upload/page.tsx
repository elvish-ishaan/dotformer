"use client";

import { FileUpload } from "@/components/ui/file-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UploadPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">File Upload</h1>
      
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Upload New File</CardTitle>
          </CardHeader>
          <CardContent>
            <FileUpload 
              onUploadSuccess={() => {}}
              onUploadError={(error) => console.error(error)}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 