import { QueryProvider } from "@/components/query-provider";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { Poppins, Exo_2 } from "next/font/google";
import "@/styles/globals.css";
import "@/styles/landing.css";
import "react-toastify/dist/ReactToastify.css";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { ToastContainer } from "react-toastify";

export const metadata: Metadata = {
  title: { template: "%s | noob.gg", default: "noob.gg" },
  description: "Discover and explore games on noob.gg gaming platform",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "noob.gg",
  },
};

export const viewport = {
  themeColor: "#ffffff",
};

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

const exo2 = Exo_2({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-exo2",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body suppressHydrationWarning className={`${poppins.variable} ${exo2.variable} antialiased`}>
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <QueryProvider>
              <NextIntlClientProvider>{children}</NextIntlClientProvider>
            </QueryProvider>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar newestOnTop closeOnClick pauseOnHover theme="colored" />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
