"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CopyIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const codeSnippets = {
  upload: `// Upload a file
const response = await fetch('${process.env.NEXT_PUBLIC_API_URL}/files/upload', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${token}\`,
  },
  body: formData
});`,

  transform: `// Transform an image
const response = await fetch('${process.env.NEXT_PUBLIC_API_URL}/files/transform/{fileId}?width=800&height=600&format=webp', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${token}\`,
  }
});`,

  list: `// List files
const response = await fetch('${process.env.NEXT_PUBLIC_API_URL}/files', {
  headers: {
    'Authorization': \`Bearer \${token}\`,
  }
});`,

  delete: `// Delete a file
const response = await fetch('${process.env.NEXT_PUBLIC_API_URL}/files/{fileId}', {
  method: 'DELETE',
  headers: {
    'Authorization': \`Bearer \${token}\`,
  }
});`
};

const sdkSnippets = {
  setup: `// Install the SDK
npm install @dotformer/sdk

// Import and initialize
import { FileService } from '@dotformer/sdk';

// Initialize with your API key
const fileService = new FileService({
  apiKey: 'YOUR_API_KEY'
});`,

  upload: `// Upload a file
const result = await fileService.uploadFile(file, {
  makePublic: true // optional, defaults to true
});`,

  transform: `// Transform an image
const result = await fileService.transformFile(fileId, {
  width: 800,
  height: 600,
  format: 'webp',
  quality: 80,
  fit: 'cover',
  background: '#ffffff'
});`,

  list: `// List files
const files = await fileService.getFiles();`,

  delete: `// Delete a file
await fileService.deleteFile(fileId);`
};

export default function Documentation() {
  const [activeTab, setActiveTab] = useState("api");
  const [activeSnippet, setActiveSnippet] = useState("upload");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Code copied to clipboard!");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">API Documentation</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            All API requests require authentication using a Bearer token. You can get your API key from the dashboard.
          </p>
          <div className="flex items-center gap-2 mb-4">
            <Button variant="outline" size="sm" asChild>
              <a href="/dashboard/api-keys" className="text-sm">
                Create API Key
              </a>
            </Button>
            <span className="text-sm text-muted-foreground">or</span>
            <Button variant="outline" size="sm" asChild>
              <a href="/dashboard" className="text-sm">
                Go to Dashboard
              </a>
            </Button>
          </div>
          <pre className="bg-muted p-4 rounded-md mb-4">
            <code>Authorization: Bearer YOUR_API_KEY</code>
          </pre>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="api">REST API</TabsTrigger>
          <TabsTrigger value="sdk">SDK</TabsTrigger>
        </TabsList>

        <TabsContent value="api">
          <Tabs value={activeSnippet} onValueChange={setActiveSnippet}>
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="transform">Transform</TabsTrigger>
              <TabsTrigger value="list">List Files</TabsTrigger>
              <TabsTrigger value="delete">Delete</TabsTrigger>
            </TabsList>

            {Object.entries(codeSnippets).map(([key, code]) => (
              <TabsContent key={key} value={key}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      {key.charAt(0).toUpperCase() + key.slice(1)} File
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(code)}
                      >
                        <CopyIcon className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                      <code>{code}</code>
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>

        <TabsContent value="sdk">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>SDK Installation</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                <code>{sdkSnippets.setup}</code>
              </pre>
            </CardContent>
          </Card>

          <Tabs value={activeSnippet} onValueChange={setActiveSnippet}>
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="transform">Transform</TabsTrigger>
              <TabsTrigger value="list">List Files</TabsTrigger>
              <TabsTrigger value="delete">Delete</TabsTrigger>
            </TabsList>

            {Object.entries(sdkSnippets).map(([key, code]) => {
              if (key === 'setup') return null;
              return (
                <TabsContent key={key} value={key}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        {key.charAt(0).toUpperCase() + key.slice(1)} File
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(code)}
                        >
                          <CopyIcon className="h-4 w-4" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                        <code>{code}</code>
                      </pre>
                    </CardContent>
                  </Card>
                </TabsContent>
              );
            })}
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
} 