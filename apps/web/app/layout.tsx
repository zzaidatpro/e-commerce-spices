import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { cn } from "@repo/ui";
import Footer from "../components/organisms/footer";
import Header from "../components/organisms/header";
import "../app/globals.css";
import { ThemeProvider } from "@/components/templates/theme-provider";
import { getRoleSite } from "@/lib/session-role";
import { RoleProvider } from '@/lib/role-context';

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Tej Patta",
  description: "Spices",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { role } = await getRoleSite();

  return (
    <html lang="fr" className={cn("font-sans", poppins.variable)} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <RoleProvider role={role}>
          <Header role={role} />
          {children}
          <Footer role={role} />
          </RoleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}