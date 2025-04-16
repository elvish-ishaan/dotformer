"use client";

import { FileUpload } from "@/components/ui/file-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function UploadPage() {
  const router = useRouter();

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
              onUploadSuccess={(file) => {
                toast.success('Upload successful', {
                  description: `File "${file.name}" has been uploaded successfully.`
                });
                // Redirect to files page after successful upload
                setTimeout(() => router.push("/files"), 1500);
              }}
              onUploadError={(error) => {
                toast.error('Upload failed', {
                  description: error
                });
              }}
              // Add more specific options as needed
              accept="image/*,application/pdf"
              maxSize={5 * 1024 * 1024} // 5MB limit
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 