"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { useEffect } from "react";
import type { ComponentProps } from "react";

const THEME_COOKIE = "theme";

/** Mirrors next-themes' own (localStorage) choice to a cookie, so SSR can paint it next visit. */
function ThemeCookieSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!resolvedTheme) return;
    document.cookie = `${THEME_COOKIE}=${resolvedTheme}; path=/; max-age=31536000; samesite=lax`;
  }, [resolvedTheme]);

  return null;
}

// Light/dark only. Class-based ("dark" on <html>), matching what shadcn's generated CSS expects.
export function ThemeProvider({ children, ...props }: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false} {...props}>
      <ThemeCookieSync />
      {children}
    </NextThemesProvider>
  );
}
