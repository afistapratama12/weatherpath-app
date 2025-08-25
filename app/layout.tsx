import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/query-provider";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Weather Route App - Plan Your Journey with Weather Forecasts",
  description: "Plan your routes with real-time weather forecasts. Get weather updates at intervals along your driving, cycling, or walking routes.",
  keywords: ["weather", "route planning", "navigation", "weather forecast", "travel", "journey planner"],
  authors: [{ name: "Weather Route App Team" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#3B82F6",
  openGraph: {
    title: "Weather Route App",
    description: "Plan your journey with weather forecasts along your route",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Weather Route App",
    description: "Plan your journey with weather forecasts along your route",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <QueryProvider>
            {children}
            <Toaster position="top-right" />
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
