import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { TabShell } from "@/components/TabShell";
import { DeferredShell } from "@/components/DeferredShell";

const geist = Geist({subsets:['latin'],variable:'--font-sans',display:'swap'});

const BASE_URL = "https://filo.network";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Filo — Il passaparola digitale",
    template: "%s | Filo",
  },
  description:
    "Trova professionisti affidabili grazie alle raccomandazioni di persone che conosci. Il passaparola diventa digitale.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.png",
    apple: "/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    title: "Filo",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    type: "website",
    locale: "it_IT",
    siteName: "Filo",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "Filo — Il passaparola digitale",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/api/og"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0D9488",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className={cn("h-full", "font-sans", geist.variable)}>
      <body className="min-h-full antialiased">
        <a href="#main-content" className="skip-link">
          Vai al contenuto principale
        </a>
        <DeferredShell />
        <TabShell>{children}</TabShell>
        <Script
          src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
          strategy="afterInteractive"
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18081144394"
          strategy="afterInteractive"
        />
        <Script
          id="google-ads"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-18081144394');
            `,
          }}
        />
        <Script
          id="sw-registration"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function () {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
