import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { SplashScreen } from "@/components/SplashScreen";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Filo",
  description:
    "Filo è un social network dove le persone condividono raccomandazioni di professionisti di fiducia.",
  icons: {
    icon: "/filo-logo-3d.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className={cn("h-full", "font-sans", geist.variable)}>
      <body className="min-h-full antialiased">
        <SplashScreen />
        {children}
      </body>
    </html>
  );
}
