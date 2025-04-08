"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { fetchUserProfile } from "@/lib/redux/slices/authSlice";

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth);

  // Fetch user profile if we have a token but no user data
  useEffect(() => {
    if (token && !user) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, token, user]);

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>Files</CardTitle>
            <CardDescription>Your file statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2">0</div>
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
            <div className="text-4xl font-bold mb-2">0</div>
            <p className="text-muted-foreground">API requests this month</p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/api-keys">Manage API Keys</Link>
            </Button>
          </CardFooter>
        </Card>
        
        {/* Quick Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" asChild>
              <Link href="/upload">Upload File</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/api-keys/new">Create API Key</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}