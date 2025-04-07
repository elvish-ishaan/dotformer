import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Navbar */}
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container px-4 md:px-6 mx-auto max-w-6xl">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.29 7 12 12 20.71 7"></polyline>
                <line x1="12" y1="22" x2="12" y2="12"></line>
              </svg>
              <span className="text-xl font-bold">Dotformer</span>
            </div>
            
            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
              <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Documentation</a>
              <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Blog</a>
            </nav>
            
            {/* Auth buttons */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="hidden sm:flex" asChild>
                <a href="/auth/login">Log in</a>
              </Button>
              <Button size="sm" asChild>
                <a href="/auth/sign-up">Sign Up</a>
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

      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_30%,rgba(56,189,248,0.12),transparent)]" />
        <div className="container px-4 md:px-6 mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center">
            <div className="flex-1 space-y-4 md:space-y-6 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
                Transform Your Digital Assets with <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">Dotformer</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-[600px] mx-auto md:mx-0">
                The complete platform for uploading, transforming, and managing your files. Powerful for developers, simple for everyone.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button size="lg" className="font-medium">
                  Get Started Free
                </Button>
                <Button size="lg" variant="outline" className="font-medium">
                  View Demo
                </Button>
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-border/50 bg-card/50 backdrop-blur-sm relative z-10">
                <Image
                  src="/placeholder-dashboard.jpg"
                  width={600}
                  height={400}
                  alt="Platform Dashboard"
                  className="w-full h-auto object-cover"
                  priority
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -z-0" />
              <div className="absolute -top-6 -left-6 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl -z-0" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-card/30">
        <div className="container px-4 md:px-6 mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Powerful Features</h2>
            <p className="text-muted-foreground mt-4 max-w-[700px] mx-auto">
              Everything you need to manage your digital assets in one platform
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <Card className="border-border/50 bg-background/70 backdrop-blur-sm hover:shadow-md transition-all">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400">
                    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
                    <path d="M12 12v9"></path>
                    <path d="m8 17 4 4 4-4"></path>
                  </svg>
                </div>
                <CardTitle>Easy File Upload</CardTitle>
                <CardDescription>
                  Drag and drop or select files for instant upload to secure cloud storage.
                </CardDescription>
              </CardHeader>
            </Card>
            
            {/* Feature 2 */}
            <Card className="border-border/50 bg-background/70 backdrop-blur-sm hover:shadow-md transition-all">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-600 dark:text-teal-400">
                    <path d="M7 22a5 5 0 0 1-2-4"></path>
                    <path d="M7 16.93c.96.43 1.96.74 2.99.91"></path>
                    <path d="M3.34 14A6.8 6.8 0 0 1 2 10c0-4.42 4.48-8 10-8s10 3.58 10 8a7.19 7.19 0 0 1-.33 2"></path>
                    <path d="M5 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path>
                    <path d="M14.33 22h-.09a.35.35 0 0 1-.24-.32v-10a.34.34 0 0 1 .33-.34c.08 0 .15.03.21.08l7.34 6a.33.33 0 0 1-.21.59h-4.49l-2.57 3.85a.35.35 0 0 1-.28.14v0z"></path>
                  </svg>
                </div>
                <CardTitle>Powerful Transformations</CardTitle>
                <CardDescription>
                  Resize, convert formats, and apply effects to your images instantly.
                </CardDescription>
              </CardHeader>
            </Card>
            
            {/* Feature 3 */}
            <Card className="border-border/50 bg-background/70 backdrop-blur-sm hover:shadow-md transition-all">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600 dark:text-purple-400">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                  </svg>
                </div>
                <CardTitle>Developer API</CardTitle>
                <CardDescription>
                  Integrate with our powerful SDK for programmatic access to all features.
                </CardDescription>
              </CardHeader>
            </Card>
            
            {/* Feature 4 */}
            <Card className="border-border/50 bg-background/70 backdrop-blur-sm hover:shadow-md transition-all">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600 dark:text-orange-400">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path>
                    <path d="M12 18V6"></path>
                  </svg>
                </div>
                <CardTitle>Pay-as-You-Go</CardTitle>
                <CardDescription>
                  Cost-effective pricing with no upfront commitments and free tier available.
                </CardDescription>
              </CardHeader>
            </Card>
            
            {/* Feature 5 */}
            <Card className="border-border/50 bg-background/70 backdrop-blur-sm hover:shadow-md transition-all">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400">
                    <path d="M20.91 8.84 8.56 2.23a1.93 1.93 0 0 0-1.81 0L3.1 4.13a2.12 2.12 0 0 0-.05 3.69l12.22 6.93a2 2 0 0 0 1.94 0L21 12.51a2.12 2.12 0 0 0-.09-3.67Z"></path>
                    <path d="m3.09 8.84 12.35-6.61a1.93 1.93 0 0 1 1.81 0l3.65 1.9a2.12 2.12 0 0 1 .1 3.69L8.73 14.75a2 2 0 0 1-1.94 0L3 12.51a2.12 2.12 0 0 1 .09-3.67Z"></path>
                    <line x1="12" y1="22" x2="12" y2="13"></line>
                    <path d="M20 13.5v3.37a2.06 2.06 0 0 1-1.11 1.83l-6 3a2.06 2.06 0 0 1-1.78 0l-6-3A2.06 2.06 0 0 1 4 16.87V13.5"></path>
                  </svg>
                </div>
                <CardTitle>Secure Storage</CardTitle>
                <CardDescription>
                  Enterprise-grade security with optional private files and access controls.
                </CardDescription>
              </CardHeader>
            </Card>
            
            {/* Feature 6 */}
            <Card className="border-border/50 bg-background/70 backdrop-blur-sm hover:shadow-md transition-all">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-600 dark:text-pink-400">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                    <path d="m9 12 2 2 4-4"></path>
                  </svg>
                </div>
                <CardTitle>Enterprise Ready</CardTitle>
                <CardDescription>
                  SSO integration, custom domains, and SLA support for business needs.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section id="testimonials" className="py-20">
        <div className="container px-4 md:px-6 mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Loved by Businesses</h2>
            <p className="text-muted-foreground mt-4 max-w-[700px] mx-auto">
              See what our customers say about Dotformer
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Testimonial 1 */}
            <Card className="border-border/50 bg-background/70 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src="https://i.pravatar.cc/150?img=32" alt="Sarah Johnson" />
                    <AvatarFallback>SJ</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">Sarah Johnson</p>
                    <p className="text-sm text-muted-foreground">CTO, TechGrowth</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="italic text-muted-foreground">
                  "Dotformer has streamlined our image processing workflow completely. What used to take us hours now happens in seconds."
                </p>
              </CardContent>
            </Card>
            
            {/* Testimonial 2 */}
            <Card className="border-border/50 bg-background/70 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src="https://i.pravatar.cc/150?img=68" alt="Michael Chen" />
                    <AvatarFallback>MC</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">Michael Chen</p>
                    <p className="text-sm text-muted-foreground">Developer, Stackify</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="italic text-muted-foreground">
                  "The API is so well designed. I integrated it into our platform in less than a day. The documentation is excellent."
                </p>
              </CardContent>
            </Card>
            
            {/* Testimonial 3 */}
            <Card className="border-border/50 bg-background/70 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src="https://i.pravatar.cc/150?img=47" alt="Lisa Rodriguez" />
                    <AvatarFallback>LR</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">Lisa Rodriguez</p>
                    <p className="text-sm text-muted-foreground">Marketing Director, BrandVibe</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="italic text-muted-foreground">
                  "Our marketing team loves how easy it is to transform images on the fly. No more waiting for designer availability."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-card/40">
        <div className="container px-4 md:px-6 mx-auto max-w-6xl">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-900 dark:to-blue-950 p-8 md:p-10 shadow-xl">
            <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 mix-blend-soft-light"></div>
            <div className="relative z-10 max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
                Ready to Transform Your Workflow?
              </h2>
              <p className="text-lg text-blue-100 mb-8">
                Join thousands of developers and businesses who trust Dotformer for their file transformation needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <Input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="bg-white/10 border-white/20 text-white placeholder:text-blue-200"
                />
                <Button variant="secondary" className="font-medium">
                  Start Free Trial
                </Button>
              </div>
              <p className="text-xs text-blue-200 mt-4">
                No credit card required. 14-day free trial with full access.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container px-4 md:px-6 mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Dotformer</h3>
              <p className="text-sm text-muted-foreground mb-4">
                The complete platform for uploading, transforming, and managing your digital assets.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Features</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Pricing</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">API</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Documentation</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Release Notes</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">About</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Blog</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Careers</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Press</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Terms</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Privacy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Cookies</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Licenses</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Settings</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border/40 text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Dotformer. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
