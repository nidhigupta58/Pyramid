import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AccentProvider } from "@/components/providers/accent-provider";
import { DEFAULT_ACCENT, isAccent } from "@/lib/accent";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/components/providers/query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pyramid",
  description: "Task and project workspace",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value === "dark" ? "dark" : "light";
  const accentCookie = cookieStore.get("accent")?.value;
  const accent = isAccent(accentCookie) ? accentCookie : DEFAULT_ACCENT;

  return (
    <html
      lang="en"
      // Server-rendered from the cookie so the correct theme/accent paint on first byte — no FOUC.
      className={`${geistSans.variable} ${geistMono.variable} ${theme === "dark" ? "dark" : ""} h-full antialiased`}
      data-accent={accent}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider defaultTheme={theme}>
          <AccentProvider initialAccent={accent}>
            <QueryProvider>
              <TooltipProvider>
                {children}
                <Toaster />
              </TooltipProvider>
            </QueryProvider>
          </AccentProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
