import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "BentoGWA | Smart Academic Grade Tracker & Calculator",
  description: "A free, cloud-synced GWA calculator and academic dashboard. Track your grades, visualize trends, and calculate the exact targets needed to achieve your graduation goals.",
  keywords: [
    // Broad & High Traffic
    "GWA calculator", 
    "GPA calculator", 
    "grade tracker", 
    "college grade calculator", 
    "academic dashboard",
    "student grade predictor",
    
    // Philippines / Localized Specific
    "GWA calculator Philippines", 
    "1.0 to 5.0 grade calculator", 
    "university GWA calculator",
    "CHED grading scale calculator",
    "college grading system Philippines",
    
    // Niche & Feature Specific
    "Deans list calculator", 
    "target grade calculator", 
    "what-if grade calculator",
    "semester grade tracker",
    "degree progress tracker",
    "academic planner and tracker",
    
    // Long-tail (What people actually search)
    "how to calculate GWA",
    "compute my semester grades",
    "app to track college grades",
    "GWA calculator with units"
  ],
  authors: [{ name: "Ced1e" }], 
  openGraph: {
    title: "BentoGWA | Smart Academic Grade Tracker",
    description: "Calculate your GWA, predict future grades, and track your degree progress with this free, interactive student dashboard.",
    url: "https://bentogwa.vercel.app", 
    siteName: "BentoGWA",
    images: [
      {
        url: "/og-image.png", 
        width: 1200,
        height: 630,
        alt: "BentoGWA Dashboard Preview",
      },
    ],
    locale: "en_PH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BentoGWA | Smart Academic Grade Tracker",
    description: "Calculate your GWA and track your degree progress instantly.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}