import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { cn } from "@repo/ui";
import Footer from "../components/organisms/footer";
import Header from "../components/organisms/header";
import "../app/globals.css";
import { ThemeProvider } from "@/components/templates/theme-provider";

// Configuration de la police Poppins
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Tej Patta",
  description: "Spices",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={cn("font-sans", poppins.variable)} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}