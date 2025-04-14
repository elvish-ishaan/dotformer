"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CircleDotDashed } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const pathname = usePathname();
  
  // Check if the current path is part of the auth section
  const isAuthPage = pathname.startsWith("/auth");
  
  // Don't show navbar on auth pages
  if (isAuthPage) {
    return null;
  }

  return (
    <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
      <div className="container px-4 md:px-6 mx-auto max-w-6xl">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <CircleDotDashed/>
              <span className="text-xl font-bold">Dotformer</span>
            </Link>
          </div>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink href="/#features">Features</NavLink>
            <NavLink href="/#testimonials">Testimonials</NavLink>
            <NavLink href="/pricing">Pricing</NavLink>
            <NavLink href="/documentation">Documentation</NavLink>
            <NavLink href="/blog">Blog</NavLink>
          </nav>
          
          {/* Auth buttons */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="hidden sm:flex" asChild>
              <Link href="/auth/login">Log in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/auth/sign-up">Sign Up</Link>
            </Button>
          </div>
          
          {/* Mobile menu button - visible on smaller screens */}
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
  );
}

// Helper component for navigation links
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href || (href.startsWith('/#') && pathname === '/');
  
  return (
    <Link 
      href={href} 
      className={cn(
        "text-sm font-medium transition-colors",
        isActive 
          ? "text-foreground" 
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </Link>
  );
} 