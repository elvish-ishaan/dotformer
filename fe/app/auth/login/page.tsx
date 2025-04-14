"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { login, clearError } from "@/lib/redux/slices/authSlice";
import { CircleDotDashed, Eye, EyeOff } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    email: "",
    password: "",
  });
  const [successMessage, setSuccessMessage] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  // Check for the registered query parameter
  useEffect(() => {
    const registered = searchParams.get("registered");
    if (registered === "true") {
      setSuccessMessage("Account created successfully! Please log in.");
    }
  }, [searchParams]);

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

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      valid = false;
    }

    setValidationErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }

    dispatch(login(formData))
      .unwrap()
      .then(() => {
        // On successful login, redirect to dashboard
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
            <CircleDotDashed className="size-6 text-primary" />
            <span className="text-xl font-bold">Dotformer</span>
          </Link>
        </div>
        
        <Card className="border-border/50 bg-background/70 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Sign in</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-destructive/15 text-destructive text-sm rounded-md">
                {error}
              </div>
            )}
            
            {successMessage && (
              <div className="mb-4 p-3 bg-green-500/15 text-green-600 dark:text-green-400 text-sm rounded-md">
                {successMessage}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Password
                  </label>
                  <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    aria-invalid={!!validationErrors.password}
                    disabled={isLoading}
                    className={validationErrors.password ? "border-destructive pr-10" : "pr-10"}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {validationErrors.password && <p className="text-sm text-destructive">{validationErrors.password}</p>}
              </div>
              
              <Button type="submit" className="w-full font-medium" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm text-center">
              Don&apos;t have an account?{" "}
              <Link href="/auth/sign-up" className="text-primary font-medium hover:underline">
                Register
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
} 