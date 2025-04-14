"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import dotformerShot from "@/public/dotformerShot.png";
import { ImageIcon, Zap, Code, CreditCard, Shield, Building2, Facebook, Twitter, Linkedin, Github } from "lucide-react"

interface User {
  email: string;
  name: string;
  avatar: string;
}

export default function Home() {
  const user = useSelector((state: User) => state.email);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
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
                  src={dotformerShot}
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
                  <ImageIcon className="size-6 text-blue-600 dark:text-blue-400" />
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
                  <Zap className="size-6 text-teal-600 dark:text-teal-400" />
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
                  <Code className="size-6 text-purple-600 dark:text-purple-400" />
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
                  <CreditCard className="size-6 text-orange-600 dark:text-orange-400" />
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
                  <Shield className="size-6 text-green-600 dark:text-green-400" />
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
                  <Building2 className="size-6 text-pink-600 dark:text-pink-400" />
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
                  &quot;Dotformer has streamlined our image processing workflow completely. What used to take us hours now happens in seconds.&quot;
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
                  &quot;The API is so well designed. I integrated it into our platform in less than a day. The documentation is excellent.&quot;
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
                  &quot;Our marketing team loves how easy it is to transform images on the fly. No more waiting for designer availability.&quot;
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
                  <Facebook className="size-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  <Twitter className="size-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  <Linkedin className="size-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  <Github className="size-5" />
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
