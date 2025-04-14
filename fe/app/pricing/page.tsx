"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Zap, Sparkles, Shield, Cloud, ArrowRight } from "lucide-react";

const features = [
  {
    name: "Free Tier",
    description: "Perfect for getting started",
    price: "0",
    unit: "month",
    features: [
      "100 requests/minute",
      "1GB storage",
      "Basic transformations",
      "Community support",
      "Standard security",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    description: "For growing businesses",
    price: "0.001",
    unit: "per request",
    features: [
      "1000 requests/minute",
      "10GB storage",
      "Advanced transformations",
      "Priority support",
      "Enhanced security",
      "Custom domains",
      "API access",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "For large scale operations",
    price: "Custom",
    unit: "per month",
    features: [
      "Custom rate limits",
      "Unlimited storage",
      "All transformations",
      "24/7 support",
      "Enterprise security",
      "Custom domains",
      "SLA guarantee",
      "Dedicated account manager",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const usageExamples = [
  {
    title: "Image Upload",
    description: "Upload and store your images",
    price: "Free",
    details: "First 1000 uploads per month are free",
  },
  {
    title: "Image Transform",
    description: "Resize, crop, and optimize images",
    price: "$0.001",
    details: "Per transformation",
  },
  {
    title: "Storage",
    description: "Store your files securely",
    price: "$0.01",
    details: "Per GB per month",
  },
];

export default function Pricing() {

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Pay only for what you use. No hidden fees, no surprises.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-16 max-w-5xl mx-auto">
        {features.map((plan) => (
          <Card
            key={plan.name}
            className={`relative overflow-hidden transition-all duration-300 hover:shadow-md ${
              plan.popular
                ? "border-blue-500 shadow-md scale-102 z-10"
                : "border-border/50 hover:border-blue-300"
            }`}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-0.5 rounded-bl-lg text-xs font-medium shadow-md">
                Most Popular
              </div>
            )}
            <CardHeader className="pb-1 px-5 pt-5">
              <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
              <CardDescription className="text-sm">{plan.description}</CardDescription>
              <div className="mt-4 mb-1">
                <span className="text-3xl font-bold">
                  {plan.price === "Custom" ? plan.price : `$${plan.price}`}
                </span>
                {plan.price !== "Custom" && (
                  <span className="text-muted-foreground ml-1 text-base">/{plan.unit}</span>
                )}
              </div>
            </CardHeader>
            <CardContent className="py-3 px-5">
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="pt-2 pb-5 px-5">
              <Button
                className={`w-full py-2 text-sm font-medium ${
                  plan.popular ? "bg-blue-600 hover:bg-blue-700" : "hover:bg-blue-50"
                }`}
                variant={plan.popular ? "default" : "outline"}
                size="default"
              >
                {plan.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="text-center mb-16">
        <h2 className="text-2xl font-bold tracking-tight mb-4">
          Pay-as-You-Go Pricing
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Only pay for what you use. No monthly commitments.
        </p>
        <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
          {usageExamples.map((example) => (
            <Card key={example.title} className="border-border/50 hover:border-blue-300 hover:shadow-sm transition-all duration-300">
              <CardHeader className="px-5 py-4">
                <CardTitle className="text-lg">{example.title}</CardTitle>
                <CardDescription className="text-sm">{example.description}</CardDescription>
              </CardHeader>
              <CardContent className="px-5 pb-4">
                <div className="text-2xl font-bold mb-2">{example.price}</div>
                <p className="text-xs text-muted-foreground">
                  {example.details}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="bg-muted/50 rounded-xl p-8 mb-16 shadow-sm max-w-6xl mx-auto">
        <h2 className="text-xl font-bold mb-6 text-center">Why Choose Our Pricing?</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-start gap-3 group">
            <div className="p-2 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors duration-300">
              <Zap className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold mb-1 text-base">Cost Effective</h3>
              <p className="text-xs text-muted-foreground">
                Only pay for what you use, with no minimum commitments
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 group">
            <div className="p-2 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors duration-300">
              <Sparkles className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold mb-1 text-base">Flexible</h3>
              <p className="text-xs text-muted-foreground">
                Scale up or down based on your needs
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 group">
            <div className="p-2 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors duration-300">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold mb-1 text-base">Transparent</h3>
              <p className="text-xs text-muted-foreground">
                Clear pricing with no hidden fees
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 group">
            <div className="p-2 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors duration-300">
              <Cloud className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold mb-1 text-base">Reliable</h3>
              <p className="text-xs text-muted-foreground">
                Enterprise-grade infrastructure
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 shadow-sm max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-3">Ready to Get Started?</h2>
        <p className="text-muted-foreground mb-6 text-base">
          Join thousands of businesses using Dotformer
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="default" className="py-2 px-4 text-sm font-medium">
            Start Free Trial
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button size="default" variant="outline" className="py-2 px-4 text-sm font-medium">
            Contact Sales
          </Button>
        </div>
      </div>
    </div>
  );
} 