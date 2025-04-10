import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/lib/redux/provider";
import ApiKeyDebug from '@/components/ApiKeyDebug';
import { Toaster } from 'sonner';
import { cn } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dotformer - Transform Your Digital Assets",
  description: "Upload, transform, and manage your digital assets with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn("min-h-screen bg-background font-sans antialiased", geistSans.variable, geistMono.variable)}>
        <ReduxProvider>
          {children}
          <ApiKeyDebug />
          <Toaster position="top-right" />
        </ReduxProvider>
      </body>
    </html>
  );
}
