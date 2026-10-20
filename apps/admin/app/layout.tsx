import "./globals.css";
import type { Metadata } from "next";
import { SupabaseClient } from "@supabase/supabase-js";
import { Geist } from "next/font/google";
import { cn } from "@repo/ui";
import {Toaster} from "@repo/ui"

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "E-Commerce Projet",
  description: "Premiere application E-Commerce",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>)
{
  return (
    <html lang="fr" className={cn("font-sans", geist.variable)}>
      <body className="font-poppins antialiased">{children}
    

      </body>
    </html>
  );
}