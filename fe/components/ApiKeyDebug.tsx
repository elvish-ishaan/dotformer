"use client";

import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { getAuthToken, setAuthToken } from '@/lib/auth/authUtils';

export default function ApiKeyDebug() {
  const [token, setToken] = useState(getAuthToken() || '');
  const [showDebug, setShowDebug] = useState(false);

  const handleSetToken = () => {
    if (token.trim()) {
      setAuthToken(token.trim());
      alert('Token set successfully!');
    }
  };
  
  const toggleDebug = () => {
    setShowDebug(!showDebug);
    if (!showDebug) {
      setToken(getAuthToken() || '');
    }
  };

  // Only show the debug component in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (!showDebug) {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        className="fixed bottom-4 right-4 opacity-30 hover:opacity-100"
        onClick={toggleDebug}
      >
        Debug
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex justify-between items-center">
            API Debug Tools
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0"
              onClick={toggleDebug}
            >
              X
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <label className="text-xs font-medium block">
              Auth Token
            </label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={token} 
                onChange={(e) => setToken(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm"
                placeholder="Enter auth token"
              />
              <Button size="sm" className="h-9" onClick={handleSetToken}>Set</Button>
            </div>
            <div className="text-xs text-muted-foreground">
              Current token: {getAuthToken() ? 'Present' : 'None'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 