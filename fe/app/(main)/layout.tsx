"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { logout } from "@/lib/redux/slices/authSlice";
import { ReactNode } from "react";
import { CircleDotDashed } from "lucide-react";

export default function MainLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Dashboard Header */}
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container px-4 md:px-6 mx-auto max-w-6xl">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <CircleDotDashed className="size-6 text-primary" />
              <span className="text-xl font-bold">Dotformer</span>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
              <Link href="/files" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Files</Link>
              <Link href="/upload" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Upload</Link>
              <Link href="/transform" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Transform</Link>
              <Link href="/api-keys" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">API Keys</Link>
              <Link href="/billing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Billing</Link>
              <Link href="/settings" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Settings</Link>
            </nav>
            
            {/* User actions */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium hidden md:block">
                Welcome, {user?.name || user?.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
            
            {/* Mobile menu button */}
            <button className="md:hidden p-2 rounded-md hover:bg-accent">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" x2="20" y1="12" y2="12"></line>
                <line x1="4" x2="20" y1="6" y2="6"></line>
                <line x1="4" x2="20" y1="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </header>
      
      {/* Content */}
      <main className="container px-4 md:px-6 mx-auto max-w-6xl py-8">
        {children}
      </main>
    </div>
  );
} 