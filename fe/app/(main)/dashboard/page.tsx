"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { fetchUserProfile } from "@/lib/redux/slices/authSlice";
import billingService from "@/lib/services/billingService";
import { fileService } from "@/lib/services/fileService";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileCount, setFileCount] = useState(0);
  const [apiUsage, setApiUsage] = useState(0);
  const [storageUsage, setStorageUsage] = useState({ value: 0, formatted: '0 Bytes' });

  // Fetch user profile if we have a token but no user data
  useEffect(() => {
    if (token && !user) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, token, user]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch files to get count
        console.time('files')
        const files = await fileService.getFiles();
        console.timeEnd('files')
        if(files.length > 0){
          setFileCount(files.length);
        }
        // Fetch usage stats
        const usageStats = await billingService.getCurrentUsage();
        
        // Set API usage
        const apiRequests = usageStats.usageByOperation.api?.total || 0;
        setApiUsage(apiRequests);
        
        // Set storage usage
        const storage = usageStats.usageByOperation.storage?.total || 0;
        const formattedStorage = billingService.formatBytes(storage);
        setStorageUsage({ value: storage, formatted: formattedStorage });
        
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  // Loading state
  if (isLoading && !error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading dashboard data...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="bg-destructive/10 p-4 rounded-md mb-4">
          <p className="text-destructive font-medium">{error}</p>
        </div>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Files Card */}
        <Card>
          <CardHeader>
            <CardTitle>Files</CardTitle>
            <CardDescription>Your file statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2">{fileCount}</div>
            <p className="text-muted-foreground">Total files uploaded</p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/files">View All Files</Link>
            </Button>
          </CardFooter>
        </Card>
        
        {/* API Usage Card */}
        <Card>
          <CardHeader>
            <CardTitle>API Usage</CardTitle>
            <CardDescription>Your API usage statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2">{apiUsage}</div>
            <p className="text-muted-foreground">API requests this month</p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/api-keys">Manage API Keys</Link>
            </Button>
          </CardFooter>
        </Card>
        
        {/* Storage Usage Card */}
        <Card>
          <CardHeader>
            <CardTitle>Storage</CardTitle>
            <CardDescription>Total storage used</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2">{storageUsage.formatted}</div>
            <p className="text-muted-foreground">Of your storage quota</p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/billing">View Usage Details</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Quick Actions Section */}
      <h2 className="text-xl font-bold mt-8 mb-4">Quick Actions</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Button className="h-auto py-4" asChild>
          <Link href="/upload">
            <span className="flex flex-col">
              <span className="text-base font-medium">Upload File</span>
              <span className="text-xs text-muted-foreground">Add new files to your account</span>
            </span>
          </Link>
        </Button>
        
        <Button variant="outline" className="h-auto py-4" asChild>
          <Link href="/api-keys">
            <span className="flex flex-col">
              <span className="text-base font-medium">Create API Key</span>
              <span className="text-xs text-muted-foreground">Generate new API keys for your apps</span>
            </span>
          </Link>
        </Button>
        
        <Button variant="outline" className="h-auto py-4" asChild>
          <Link href="/billing">
            <span className="flex flex-col">
              <span className="text-base font-medium">View Billing</span>
              <span className="text-xs text-muted-foreground">Check your current usage and billing</span>
            </span>
          </Link>
        </Button>
      </div>
    </>
  );
}