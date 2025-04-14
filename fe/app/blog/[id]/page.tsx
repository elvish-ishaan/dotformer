"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const articles = {
  architecture: {
    id: "architecture",
    title: "Building a Scalable Image Processing Architecture",
    description: "Learn how we built Dotformer's architecture to handle millions of image transformations daily",
    date: "April 14, 2024",
    readTime: "10 min read",
    tags: ["Architecture", "Scalability", "Performance"],
    content: [
      {
        type: "paragraph",
        text: "In this comprehensive guide, we'll explore the architecture that powers Dotformer's image processing capabilities. Our system is designed to handle millions of image transformations daily while maintaining high performance and reliability. We'll dive deep into each component, discussing design decisions, challenges faced, and solutions implemented."
      },
      {
        type: "heading",
        level: 2,
        text: "System Overview"
      },
      {
        type: "paragraph",
        text: "The Dotformer architecture is built on a microservices-based approach, allowing for independent scaling of different components. This design enables us to handle varying loads efficiently while maintaining system stability. The core system consists of several key components working in harmony."
      },
      {
        type: "heading",
        level: 2,
        text: "Core Components"
      },
      {
        type: "heading",
        level: 3,
        text: "1. Load Balancer"
      },
      {
        type: "paragraph",
        text: "Our load balancer is the first point of contact for all incoming requests. It's built using NGINX with custom Lua modules for advanced routing and load distribution. The load balancer implements several sophisticated features:"
      },
      {
        type: "list",
        items: [
          "Intelligent request distribution based on server health and load",
          "Advanced health checking with custom metrics",
          "Automatic failover and recovery mechanisms",
          "SSL termination with modern cipher suites",
          "Request rate limiting and DDoS protection"
        ]
      },
      {
        type: "heading",
        level: 3,
        text: "2. API Gateway"
      },
      {
        type: "paragraph",
        text: "The API Gateway serves as the central entry point for all API requests. It's built using a custom implementation that provides:"
      },
      {
        type: "list",
        items: [
          "JWT-based authentication with refresh token rotation",
          "Role-based access control with fine-grained permissions",
          "Request validation and sanitization",
          "API versioning and backward compatibility",
          "Request/response transformation",
          "Circuit breaking and fallback mechanisms"
        ]
      },
      {
        type: "heading",
        level: 3,
        text: "3. Image Processing Service"
      },
      {
        type: "paragraph",
        text: "The heart of our system, the Image Processing Service, is built using a combination of technologies to ensure optimal performance:"
      },
      {
        type: "list",
        items: [
          "Custom image processing pipeline with parallel processing",
          "GPU acceleration using CUDA for complex operations",
          "Memory-efficient streaming for large images",
          "Intelligent caching of frequently used transformations",
          "Support for multiple image formats and codecs",
          "Automatic quality optimization based on content type"
        ]
      },
      {
        type: "heading",
        level: 3,
        text: "4. Storage Service"
      },
      {
        type: "paragraph",
        text: "Our storage service implements a multi-layered approach to ensure data durability and availability:"
      },
      {
        type: "list",
        items: [
          "Multi-region storage with automatic replication",
          "Intelligent caching strategy with multiple cache layers",
          "Versioning and backup management",
          "Lifecycle policies for cost optimization",
          "Encryption at rest with key rotation",
          "Access logging and audit trails"
        ]
      },
      {
        type: "heading",
        level: 2,
        text: "Scalability Features"
      },
      {
        type: "paragraph",
        text: "To handle our growing user base and increasing demand, we've implemented several scalability features:"
      },
      {
        type: "list",
        items: [
          "Horizontal scaling of all components using Kubernetes",
          "Auto-scaling based on custom metrics and predictions",
          "Multi-region deployment with global load balancing",
          "Caching at multiple levels (CDN, in-memory, disk)",
          "Database sharding and replication",
          "Message queue for asynchronous processing"
        ]
      },
      {
        type: "heading",
        level: 2,
        text: "Performance Optimizations"
      },
      {
        type: "paragraph",
        text: "Performance is crucial for image processing. Here are the key optimizations we've implemented:"
      },
      {
        type: "list",
        items: [
          "Global CDN integration with edge processing",
          "Advanced image format optimization (WebP, AVIF)",
          "Progressive loading and lazy processing",
          "Connection pooling and keep-alive",
          "Compression at multiple levels",
          "Query optimization and indexing"
        ]
      },
      {
        type: "heading",
        level: 2,
        text: "Monitoring and Observability"
      },
      {
        type: "paragraph",
        text: "To ensure system reliability, we've implemented comprehensive monitoring:"
      },
      {
        type: "list",
        items: [
          "Distributed tracing with OpenTelemetry",
          "Custom metrics collection and visualization",
          "Log aggregation and analysis",
          "Alerting system with multiple notification channels",
          "Performance profiling and optimization",
          "Capacity planning and forecasting"
        ]
      },
      {
        type: "heading",
        level: 2,
        text: "Future Improvements"
      },
      {
        type: "paragraph",
        text: "We're constantly working on improving our architecture. Here are some planned enhancements:"
      },
      {
        type: "list",
        items: [
          "AI-powered image optimization",
          "Edge computing capabilities",
          "Enhanced security features",
          "Improved monitoring and analytics",
          "New image processing algorithms",
          "Expanded format support"
        ]
      }
    ]
  },
  security: {
    id: "security",
    title: "Securing Your Digital Assets: Best Practices",
    description: "A comprehensive guide to implementing security best practices for your digital assets",
    date: "April 12, 2024",
    readTime: "8 min read",
    tags: ["Security", "Best Practices", "Compliance"],
    content: [
      {
        type: "paragraph",
        text: "In today's digital landscape, security is more important than ever. This comprehensive guide will walk you through the security measures we've implemented at Dotformer and the best practices you should follow to protect your digital assets."
      },
      {
        type: "heading",
        level: 2,
        text: "Security Fundamentals"
      },
      {
        type: "paragraph",
        text: "Before diving into specific security measures, it's important to understand the core principles that guide our security strategy:"
      },
      {
        type: "list",
        items: [
          "Defense in depth - multiple layers of security",
          "Least privilege principle",
          "Zero trust architecture",
          "Security by design",
          "Continuous monitoring and improvement"
        ]
      },
      {
        type: "heading",
        level: 2,
        text: "Authentication"
      },
      {
        type: "paragraph",
        text: "Our authentication system implements several layers of security:"
      },
      {
        type: "list",
        items: [
          "Multi-factor authentication with biometric support",
          "OAuth 2.0 with PKCE for third-party authentication",
          "API key management with rotation policies",
          "Session management with automatic timeout",
          "Password policies and secure storage",
          "Account lockout and brute force protection"
        ]
      },
      {
        type: "heading",
        level: 2,
        text: "Authorization"
      },
      {
        type: "paragraph",
        text: "Authorization controls access to resources and actions:"
      },
      {
        type: "list",
        items: [
          "Role-based access control (RBAC)",
          "Attribute-based access control (ABAC)",
          "Resource-level permissions",
          "Time-based access restrictions",
          "Geographic access controls",
          "Audit logging and monitoring"
        ]
      },
      {
        type: "heading",
        level: 2,
        text: "Data Protection"
      },
      {
        type: "paragraph",
        text: "Protecting data is crucial for maintaining trust:"
      },
      {
        type: "list",
        items: [
          "End-to-end encryption",
          "Secure key management with HSM",
          "Data masking and anonymization",
          "Secure backup and recovery",
          "Data retention policies",
          "Secure deletion procedures"
        ]
      },
      {
        type: "heading",
        level: 2,
        text: "Network Security"
      },
      {
        type: "paragraph",
        text: "Network security measures protect against external threats:"
      },
      {
        type: "list",
        items: [
          "Firewall configuration",
          "DDoS protection",
          "Intrusion detection and prevention",
          "VPN and secure tunnels",
          "Network segmentation",
          "Traffic monitoring and analysis"
        ]
      },
      {
        type: "heading",
        level: 2,
        text: "Compliance"
      },
      {
        type: "paragraph",
        text: "We maintain compliance with various standards and regulations:"
      },
      {
        type: "list",
        items: [
          "GDPR compliance",
          "CCPA compliance",
          "SOC 2 certification",
          "ISO 27001 certification",
          "Regular security audits",
          "Compliance documentation"
        ]
      },
      {
        type: "heading",
        level: 2,
        text: "Security Monitoring"
      },
      {
        type: "paragraph",
        text: "Continuous monitoring helps detect and respond to threats:"
      },
      {
        type: "list",
        items: [
          "SIEM integration",
          "Threat intelligence feeds",
          "Vulnerability scanning",
          "Penetration testing",
          "Security incident response",
          "Forensic analysis"
        ]
      },
      {
        type: "heading",
        level: 2,
        text: "Best Practices"
      },
      {
        type: "paragraph",
        text: "Here are some key security best practices to follow:"
      },
      {
        type: "list",
        items: [
          "Regular security training",
          "Security code reviews",
          "Automated security testing",
          "Patch management",
          "Incident response planning",
          "Security documentation"
        ]
      }
    ]
  },
  optimization: {
    id: "optimization",
    title: "Optimizing Image Delivery: A Technical Guide",
    description: "Learn about the latest techniques for optimizing image delivery and performance",
    date: "April 10, 2024",
    readTime: "12 min read",
    tags: ["Performance", "Optimization", "CDN"],
    content: [
      {
        type: "paragraph",
        text: "Image optimization is crucial for modern web applications. This comprehensive guide explores various techniques for optimizing image delivery and improving performance. We'll cover everything from format selection to advanced delivery strategies."
      },
      {
        type: "heading",
        level: 2,
        text: "Image Format Selection"
      },
      {
        type: "paragraph",
        text: "Choosing the right image format is the first step in optimization:"
      },
      {
        type: "list",
        items: [
          "WebP vs JPEG vs PNG comparison",
          "AVIF for modern browsers",
          "HEIC/HEIF for Apple devices",
          "Progressive loading techniques",
          "Responsive images with srcset",
          "Art direction with picture element"
        ]
      },
      {
        type: "heading",
        level: 2,
        text: "Compression Techniques"
      },
      {
        type: "paragraph",
        text: "Advanced compression techniques can significantly reduce file size:"
      },
      {
        type: "list",
        items: [
          "Lossy vs lossless compression",
          "Quality vs size trade-offs",
          "Automatic optimization pipelines",
          "Custom compression profiles",
          "Content-aware compression",
          "Progressive enhancement"
        ]
      },
      {
        type: "heading",
        level: 2,
        text: "Delivery Optimization"
      },
      {
        type: "paragraph",
        text: "Optimizing delivery is crucial for performance:"
      },
      {
        type: "list",
        items: [
          "CDN configuration and optimization",
          "Edge computing capabilities",
          "Caching strategies",
          "Preloading and prefetching",
          "Lazy loading implementation",
          "Connection optimization"
        ]
      },
      {
        type: "heading",
        level: 2,
        text: "Performance Metrics"
      },
      {
        type: "paragraph",
        text: "Measuring performance is key to optimization:"
      },
      {
        type: "list",
        items: [
          "Core Web Vitals monitoring",
          "Custom performance metrics",
          "Real user monitoring",
          "Synthetic testing",
          "Performance budgets",
          "Continuous monitoring"
        ]
      },
      {
        type: "heading",
        level: 2,
        text: "Advanced Techniques"
      },
      {
        type: "paragraph",
        text: "Advanced optimization techniques for maximum performance:"
      },
      {
        type: "list",
        items: [
          "Image sprites and CSS sprites",
          "SVG optimization",
          "Responsive images with art direction",
          "Dynamic image resizing",
          "Content-aware cropping",
          "Automatic format selection"
        ]
      },
      {
        type: "heading",
        level: 2,
        text: "Tools and Services"
      },
      {
        type: "paragraph",
        text: "Essential tools and services for image optimization:"
      },
      {
        type: "list",
        items: [
          "Image optimization libraries",
          "CDN services",
          "Performance monitoring tools",
          "Automation tools",
          "Testing frameworks",
          "Analytics platforms"
        ]
      },
      {
        type: "heading",
        level: 2,
        text: "Best Practices"
      },
      {
        type: "paragraph",
        text: "Key best practices for image optimization:"
      },
      {
        type: "list",
        items: [
          "Regular performance audits",
          "Automated optimization pipelines",
          "Continuous monitoring",
          "Performance testing",
          "Documentation and guidelines",
          "Team training"
        ]
      }
    ]
  }
};

interface ContentBlock {
  type: string;
  text?: string;
  level?: number;
  items?: string[];
}

interface BlogPost {
  id: string;
  title: string;
  description: string;
  date: string;
  readTime: string; 
  tags: string[];
  content: ContentBlock[];
}

export default function BlogPost() {
  const params = useParams();
  const [article, setArticle] = useState<BlogPost | null>(null);

  useEffect(() => {
    if (params?.id) {
      const articleId = params.id as string;
      if (articleId in articles) {
        // Type assertion to BlogPost since we've verified the ID exists
        setArticle(articles[articleId as keyof typeof articles] as unknown as BlogPost);
      }
    }
  }, [params]);

  if (!article) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <Link href="/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>

        <article>
          <header className="mb-12">
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{article.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{article.readTime}</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
            <p className="text-xl text-muted-foreground mb-6">{article.description}</p>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-xs"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
          </header>

          <div className="prose prose-lg max-w-none">
            {article.content.map((block, index) => {
              switch (block.type) {
                case "paragraph":
                  return <p key={index} className="mb-6">{block.text}</p>;
                case "heading":
                  return (
                    <h2
                      key={index}
                      className={`font-bold mb-4 ${
                        block.level === 2
                          ? "text-3xl mt-12"
                          : block.level === 3
                          ? "text-2xl mt-8"
                          : "text-xl mt-6"
                      }`}
                    >
                      {block.text}
                    </h2>
                  );
                case "list":
                  return (
                    <ul key={index} className="list-disc pl-6 mb-6">
                      {block.items?.map((item, itemIndex) => (
                        <li key={itemIndex} className="mb-2">{item}</li>
                      ))}
                    </ul>
                  );
                default:
                  return null;
              }
            })}
          </div>
        </article>

        <div className="mt-16 border-t border-border/50 pt-8">
          <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
          <p className="text-muted-foreground mb-4">
            Subscribe to our newsletter to receive the latest updates and articles.
          </p>
          <div className="flex gap-4">
            <Button>Subscribe</Button>
          </div>
        </div>
      </div>
    </div>
  );
} 