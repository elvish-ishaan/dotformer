"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Copy, 
  Key, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  Loader2,
  X,
  LogIn,
  Eye,
  EyeOff,
  ClipboardCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { getApiKeys, createApiKey, deleteApiKey, ApiKey } from '@/lib/services/apiKeyService';
import { getAuthToken, setAuthToken } from '@/lib/auth/authUtils';
import { useAppSelector } from '@/lib/redux/hooks';

export default function ApiKeysPage() {
  const router = useRouter();
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [visibleKeyId, setVisibleKeyId] = useState<string | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [apiKeyValues, setApiKeyValues] = useState<Record<string, string>>({});
  
  // Get auth state from Redux
  const authState = useAppSelector((state) => state.auth);
  
  // For testing - set a test token if needed
  useEffect(() => {
    // Only for development testing - comment out in production
    if (process.env.NODE_ENV === 'development' && !getAuthToken()) {
      const testToken = 'test_token_for_development';
      setAuthToken(testToken);
      console.log('Set test auth token for development');
    }
  }, []);
  
  const fetchApiKeys = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getApiKeys();
      if (result.success && result.apiKeys) {
        setApiKeys(result?.apiKeys);
        router.refresh();
      } else {
        setError(result.error || 'Failed to fetch API keys');
        toast.error(result.error || 'Failed to fetch API keys');
        
        if (result.error === 'Authentication required') {
          setIsAuthenticated(false);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const token = getAuthToken();
    setIsAuthenticated(!!token || authState.isAuthenticated);
    
    if (!token && !authState.isAuthenticated) {
      setError('You need to be logged in to manage API keys');
    } else {
      fetchApiKeys();
    }
  }, [authState.isAuthenticated, fetchApiKeys]);
  
  // Reset state when dialog closes
  useEffect(() => {
    if (!isDialogOpen) {
      // Reset form after a short delay (to allow for animations)
      setTimeout(() => {
        setNewKeyName('');
        setGeneratedKey(null);
        setShowKey(false);
        setIsCopied(false);
      }, 300);
    }
  }, [isDialogOpen]);
  
  const handleLoginRedirect = () => {
    router.push('/auth/login?redirect=/api-keys');
  };
  
  const handleCreateKey = async () => {
    if (!newKeyName.trim() || !isAuthenticated) return;
    
    setIsCreating(true);
    setError(null);
    
    try {
      const result = await createApiKey(newKeyName);
      
      if (result.success && result.apiKey?.value && result.apiKey?.apiKey) {
        const { value, apiKey } = result.apiKey;
        
        // Set the generated key value to show in the UI
        setGeneratedKey(value);
        
        // Store the actual key value
        setApiKeyValues(prev => ({
          ...prev,
          [apiKey.id]: value
        }));
        
        // Add the new key to the list
        setApiKeys(prevKeys => [
          apiKey,
          ...prevKeys
        ]);
        
        toast.success('API key created successfully');
        
        // The dialog will remain open to show the generated key
        // No auto-close here - user must click "Done" to close it
      } else {
        setError(result.error || 'Failed to create API key');
        toast.error(result.error || 'Failed to create API key');
        
        // If authentication error, prompt to login
        if (result.error === 'Authentication required') {
          setIsAuthenticated(false);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyKey = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      toast.success('API key copied to clipboard');
      setIsCopied(true);
      
      // Reset copied state after 3 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 3000);
    }
  };
  
  const toggleKeyVisibility = () => {
    setShowKey(!showKey);
  };
  
  const handleCloseDialog = () => {
    // Only clear the generated key when the user explicitly clicks "Done"
    setGeneratedKey(null);
    setNewKeyName('');
    setIsDialogOpen(false);
    setShowKey(false);
    setIsCopied(false);
    
    // Show a toast with copy option one more time
    if (generatedKey) {
      toast.success('API key created', {
        description: 'You can find it in your list of API keys',
        action: {
          label: 'Copy key',
          onClick: () => {
            navigator.clipboard.writeText(generatedKey);
            toast.success('Key copied to clipboard');
          },
        },
        duration: 6000,
      });
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    setIsDeleting(keyId);
    setError(null);
    
    try {
      const result = await deleteApiKey(keyId);
      
      if (result.success) {
        // Remove the deleted key from the list
        setApiKeys(prevKeys => prevKeys.filter(key => key.id !== keyId));
        toast.success('API key deleted successfully');
      } else {
        setError(result.error || 'Failed to delete API key');
        toast.error(result.error || 'Failed to delete API key');
        
        // If authentication error, prompt to login
        if (result.error === 'Authentication required') {
          setIsAuthenticated(false);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsDeleting(null);
    }
  };

  const toggleApiKeyVisibility = (keyId: string) => {
    if (visibleKeyId === keyId) {
      setVisibleKeyId(null);
    } else {
      setVisibleKeyId(keyId);
    }
  };
  
  const copyApiKeyPrefix = (prefix: string) => {
    navigator.clipboard.writeText(prefix);
    toast.success('API key prefix copied to clipboard');
  };

  const getMaskedKeyDisplay = (key: ApiKey) => {
    if (visibleKeyId === key.id) {
      // Show the actual key value if we have it stored
      const actualKey = apiKeyValues[key.id];
      if (actualKey) {
        return <span className="text-green-600">{actualKey}</span>;
      }
      // If we don't have the actual key, show the prefix with masked value
      return <span>{key.prefix}••••••••••••••</span>;
    }
    return <span>{key.prefix}••••••••••••••</span>;
  };

  // Check if user is not authenticated
  if (isAuthenticated === false) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
            <p className="text-muted-foreground">
              Manage API keys for accessing the Dotformer API
            </p>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              You need to be logged in to manage API keys
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AlertTriangle className="h-16 w-16 text-amber-500 mb-4" />
            <p className="text-center mb-6">
              Please log in to view and manage your API keys
            </p>
            <Button onClick={handleLoginRedirect} className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
          <p className="text-muted-foreground">
            Manage API keys for accessing the Dotformer API
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
              <DialogDescription>
                Generate a new API key to access Dotformer from your applications.
              </DialogDescription>
            </DialogHeader>
            {!generatedKey ? (
              <>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="key-name">API Key Name</Label>
                    <Input 
                      id="key-name" 
                      placeholder="e.g., Development, Production" 
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateKey}
                    disabled={isCreating || !newKeyName.trim()}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Generate Key'
                    )}
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <div className="space-y-4 py-4">
                  <div className="rounded-md bg-amber-50 p-4 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-800">Important</h4>
                      <p className="text-sm text-amber-700 mt-1">
                        This API key will only be displayed once. Please copy it and store it in a secure location.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="generated-key" className="flex justify-between">
                      <span>Your API Key</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-5 px-1 text-xs flex gap-1 items-center"
                        onClick={toggleKeyVisibility}
                      >
                        {showKey ? (
                          <>
                            <EyeOff className="h-3 w-3" /> Hide
                          </>
                        ) : (
                          <>
                            <Eye className="h-3 w-3" /> Show
                          </>
                        )}
                      </Button>
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        id="generated-key" 
                        value={showKey ? generatedKey : generatedKey?.replace(/./g, '•')} 
                        readOnly 
                        className="font-mono text-sm"
                        type={showKey ? "text" : "password"}
                      />
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={handleCopyKey}
                        className={isCopied ? "bg-green-100 text-green-700 border-green-300" : ""}
                      >
                        {isCopied ? (
                          <ClipboardCheck className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCloseDialog}>Done</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
          <CardDescription>
            You have {apiKeys.length} active API key{apiKeys.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-4 flex items-start gap-3">
              <X className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800">Error</h4>
                <p className="text-sm text-red-700 mt-1">
                  {error}
                </p>
              </div>
            </div>
          )}
          
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No API keys found. Create one to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>API Key</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((apiKey) => (
                  <TableRow key={apiKey.id}>
                    <TableCell className="font-medium">{apiKey.name}</TableCell>
                    <TableCell className="font-mono text-sm flex items-center gap-2">
                      <Key className="h-3.5 w-3.5 text-muted-foreground" />
                      {getMaskedKeyDisplay(apiKey)}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-6 w-6 ml-1"
                        onClick={() => toggleApiKeyVisibility(apiKey.id)}
                        aria-label={visibleKeyId === apiKey.id ? "Hide API key" : "Show API key"}
                      >
                        {visibleKeyId === apiKey.id ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => {
                          // In a real app, you might copy the full key if visible
                          // For now, we'll just copy the prefix
                          copyApiKeyPrefix(apiKey.prefix);
                          setCopiedKeyId(apiKey.id);
                          setTimeout(() => setCopiedKeyId(null), 2000);
                        }}
                        aria-label="Copy API key prefix"
                      >
                        {copiedKeyId === apiKey.id ? (
                          <ClipboardCheck className="h-3.5 w-3.5 text-green-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      {new Date(apiKey.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {apiKey.lastUsed 
                        ? new Date(apiKey.lastUsed).toLocaleDateString() 
                        : 'Never used'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteKey(apiKey.id)}
                        disabled={isDeleting === apiKey.id}
                      >
                        {isDeleting === apiKey.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="border-t bg-muted/50 p-4 text-sm text-muted-foreground">
          API keys provide full access to your account. Keep them secure!
        </CardFooter>
      </Card>
    </div>
  );
}