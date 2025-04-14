import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Tag } from "lucide-react";
import Link from "next/link";

const articles = [
  {
    id: "architecture",
    title: "Building a Scalable Image Processing Architecture",
    description: "Learn how we built Dotformer's architecture to handle millions of image transformations daily",
    date: "April 14, 2024",
    readTime: "10 min read",
    tags: ["Architecture", "Scalability", "Performance"]
  },
  {
    id: "security",
    title: "Securing Your Digital Assets: Best Practices",
    description: "A comprehensive guide to implementing security best practices for your digital assets",
    date: "April 12, 2024",
    readTime: "8 min read",
    tags: ["Security", "Best Practices", "Compliance"]
  },
  {
    id: "optimization",
    title: "Optimizing Image Delivery: A Technical Guide",
    description: "Learn about the latest techniques for optimizing image delivery and performance",
    date: "April 10, 2024",
    readTime: "12 min read",
    tags: ["Performance", "Optimization", "CDN"]
  }
];

export default function BlogPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Blog</h1>
        <p className="text-xl text-muted-foreground mb-12">
          Insights, tutorials, and best practices from the Dotformer team
        </p>

        <div className="grid gap-8">
          {articles.map((article) => (
            <Card key={article.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
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
                <CardTitle className="text-2xl">
                  <Link href={`/blog/${article.id}`} className="hover:underline">
                    {article.title}
                  </Link>
                </CardTitle>
                <CardDescription className="text-lg mt-2">
                  {article.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          ))}
        </div>

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