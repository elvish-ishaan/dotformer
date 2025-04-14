"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CopyIcon, AlertCircle, Clock, Shield, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const codeSnippets = {
  upload: `// Upload a file
const response = await fetch('${process.env.NEXT_PUBLIC_API_URL}/files/upload', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${token}\`,
    'Content-Type': 'multipart/form-data'
  },
  body: formData
});

// Handle response
if (!response.ok) {
  const error = await response.json();
  throw new Error(error.message);
}

const data = await response.json();
console.log(data); // { id: string, url: string, size: number, type: string }`,

  transform: `// Transform an image
const response = await fetch('${process.env.NEXT_PUBLIC_API_URL}/files/transform/{fileId}', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${token}\`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    width: 800,
    height: 600,
    format: 'webp',
    quality: 80,
    fit: 'cover',
    background: '#ffffff'
  })
});

// Handle response
if (!response.ok) {
  const error = await response.json();
  throw new Error(error.message);
}

const data = await response.json();
console.log(data); // { id: string, url: string, size: number, type: string }`,

  list: `// List files with pagination
const response = await fetch('${process.env.NEXT_PUBLIC_API_URL}/files?page=1&limit=10', {
  headers: {
    'Authorization': \`Bearer \${token}\`,
  }
});

// Handle response
if (!response.ok) {
  const error = await response.json();
  throw new Error(error.message);
}

const data = await response.json();
console.log(data); // { items: File[], total: number, page: number, limit: number }`,

  delete: `// Delete a file
const response = await fetch('${process.env.NEXT_PUBLIC_API_URL}/files/{fileId}', {
  method: 'DELETE',
  headers: {
    'Authorization': \`Bearer \${token}\`,
  }
});

// Handle response
if (!response.ok) {
  const error = await response.json();
  throw new Error(error.message);
}

// Success - no content returned`
};

const sdkSnippets = {
  setup: `// Install the SDK
npm install @dotformer/sdk

// Import and initialize
import { FileService } from '@dotformer/sdk';

// Initialize with your API key
const fileService = new FileService({
  apiKey: 'YOUR_API_KEY',
  baseUrl: '${process.env.NEXT_PUBLIC_API_URL}' // optional
});`,

  upload: `// Upload a file with options
const result = await fileService.uploadFile(file, {
  makePublic: true, // optional, defaults to true
  folder: 'products', // optional, organize files in folders
  metadata: { // optional, add custom metadata
    productId: '123',
    category: 'electronics'
  }
});

console.log(result); // { id: string, url: string, size: number, type: string }`,

  transform: `// Transform an image with options
const result = await fileService.transformFile(fileId, {
  width: 800,
  height: 600,
  format: 'webp',
  quality: 80,
  fit: 'cover',
  background: '#ffffff',
  crop: { // optional, crop the image
    x: 100,
    y: 100,
    width: 400,
    height: 400
  },
  effects: { // optional, apply effects
    blur: 5,
    brightness: 1.2,
    contrast: 1.1
  }
});

console.log(result); // { id: string, url: string, size: number, type: string }`,

  list: `// List files with filters and pagination
const files = await fileService.getFiles({
  page: 1,
  limit: 10,
  folder: 'products', // optional, filter by folder
  type: 'image', // optional, filter by file type
  search: 'product', // optional, search in filename
  sort: 'createdAt', // optional, sort by field
  order: 'desc' // optional, sort order
});

console.log(files); // { items: File[], total: number, page: number, limit: number }`,

  delete: `// Delete a file
await fileService.deleteFile(fileId);

// Delete multiple files
await fileService.deleteFiles([fileId1, fileId2]);`
};

const errorCodes = {
  "400": "Bad Request - The request was invalid or cannot be served",
  "401": "Unauthorized - Authentication failed or not provided",
  "403": "Forbidden - The request is understood but refused",
  "404": "Not Found - The requested resource doesn't exist",
  "429": "Too Many Requests - Rate limit exceeded",
  "500": "Internal Server Error - Something went wrong on our end"
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
          <CardTitle>Getting Started</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Welcome to the Dotformer API documentation. This guide will help you integrate our services into your application.
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
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            All API requests require authentication using a Bearer token. Include your API key in the Authorization header:
          </p>
          <pre className="bg-muted p-4 rounded-md mb-4">
            <code>Authorization: Bearer YOUR_API_KEY</code>
          </pre>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Shield className="h-4 w-4" />
            <span>Keep your API key secure and never expose it in client-side code</span>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Rate Limiting</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Clock className="h-4 w-4" />
            <span>Free tier: 100 requests/minute</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Zap className="h-4 w-4" />
            <span>Pro tier: 1000 requests/minute</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Rate limits are applied per API key. Exceeding the limit will result in a 429 status code.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Error Handling</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            All errors return a JSON response with a message and status code:
          </p>
          <pre className="bg-muted p-4 rounded-md mb-4">
            <code>{`{
  "status": 400,
  "message": "Invalid request parameters",
  "errors": [
    {
      "field": "width",
      "message": "Width must be a positive number"
    }
  ]
}`}</code>
          </pre>
          <div className="space-y-2">
            {Object.entries(errorCodes).map(([code, message]) => (
              <div key={code} className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm">
                  <span className="font-mono">{code}</span> - {message}
                </span>
              </div>
            ))}
          </div>
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

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            <li className="flex items-start gap-2">
              <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium">Secure API Keys</p>
                <p className="text-sm text-muted-foreground">
                  Never expose your API keys in client-side code. Use environment variables or a backend service to handle API calls.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium">Handle Rate Limits</p>
                <p className="text-sm text-muted-foreground">
                  Implement exponential backoff when you hit rate limits. Monitor your usage to stay within limits.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium">Error Handling</p>
                <p className="text-sm text-muted-foreground">
                  Always handle API errors gracefully. Check response status codes and provide meaningful error messages to users.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <Zap className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium">Optimize Performance</p>
                <p className="text-sm text-muted-foreground">
                  Use appropriate image sizes and formats. Consider implementing caching for frequently accessed files.
                </p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
} 