import "./globals.css";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { cn } from "../lib/utils";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: "E-Commerce - Tableau de bord Admin",
  description: "Application E-Commerce avec Next.js et Supabase - Gestion des produits, commandes et clients",
  keywords: ["e-commerce", "admin", "dashboard", "gestion", "produits"],
  authors: [{ name: "E-Commerce Team" }],
  openGraph: {
    title: "E-Commerce Admin Dashboard",
    description: "Gestion de votre boutique e-commerce",
    url: "https://e-commerce-admin.example.com",
    siteName: "E-Commerce Admin",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "E-Commerce Admin Dashboard",
    description: "Gestion de votre boutique e-commerce",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#063c2B" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
      </head>
      <body className="font-poppins antialiased bg-shop_light_bg text-darkColor">
        {children}
      </body>
    </html>
  );
}