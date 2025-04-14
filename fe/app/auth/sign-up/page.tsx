"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { register, clearError } from "@/lib/redux/slices/authSlice";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageIcon } from "lucide-react"

export default function SignUp() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  
  const [validationErrors, setValidationErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: "",
  });
  
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when user types
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { ...validationErrors };

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      valid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      valid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      valid = false;
    }

    if (!acceptedTerms) {
      newErrors.terms = "You must accept the terms and conditions";
      valid = false;
    } else {
      newErrors.terms = "";
    }

    setValidationErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

    if (!validateForm()) {
      return;
    }

    // Remove confirmPassword before sending to API
    const { ...registerData } = formData;

    dispatch(register(registerData))
      .unwrap()
      .then(() => {
        // On successful registration, redirect to dashboard
        router.push("/dashboard");
      })
      .catch(() => {
        // Error is handled in the Redux state
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="flex items-center gap-2">
            <ImageIcon className="size-6 text-primary" />
            <span className="text-xl font-bold">Dotformer</span>
          </Link>
        </div>
        
        <Card className="border-border/50 bg-background/70 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
            <CardDescription className="text-center">
              Enter your information to create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-destructive/15 text-destructive text-sm rounded-md">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Name
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                  aria-invalid={!!validationErrors.name}
                  disabled={isLoading}
                  className={validationErrors.name ? "border-destructive" : ""}
                />
                {validationErrors.name && <p className="text-sm text-destructive">{validationErrors.name}</p>}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  aria-invalid={!!validationErrors.email}
                  disabled={isLoading}
                  className={validationErrors.email ? "border-destructive" : ""}
                />
                {validationErrors.email && <p className="text-sm text-destructive">{validationErrors.email}</p>}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  aria-invalid={!!validationErrors.password}
                  disabled={isLoading}
                  className={validationErrors.password ? "border-destructive" : ""}
                />
                {validationErrors.password && <p className="text-sm text-destructive">{validationErrors.password}</p>}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  aria-invalid={!!validationErrors.confirmPassword}
                  disabled={isLoading}
                  className={validationErrors.confirmPassword ? "border-destructive" : ""}
                />
                {validationErrors.confirmPassword && <p className="text-sm text-destructive">{validationErrors.confirmPassword}</p>}
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="terms" 
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => {
                    setAcceptedTerms(checked === true);
                    if (checked) {
                      setValidationErrors(prev => ({ ...prev, terms: "" }));
                    }
                  }}
                />
                <label htmlFor="terms" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  I agree to the <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                </label>
              </div>
              {validationErrors.terms && <p className="text-sm text-destructive">{validationErrors.terms}</p>}
              
              <Button type="submit" className="w-full font-medium" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm text-center">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 