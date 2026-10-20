import type { Metadata } from "next";
import { SupabaseClient } from "@supabase/supabase-js";
import { Geist } from "next/font/google";
import { cn } from "@repo/ui";
import { Container } from "lucide-react";
import Footer from "../components/organisms/footer";
import Header from "../components/organisms/header";
import "../app/globals.css";
import { ThemeProvider } from "@/components/templates/theme-provider";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "E-Commerce Projet",
  description: "Premiere application E-Commerce",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <body className="font-poppins antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
        <header>
          <Header />
        </header>
        {children}
        <footer>
          <Footer />
        </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
