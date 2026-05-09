import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Filo — Il passaparola digitale",
  description:
    "Trova professionisti affidabili grazie alle raccomandazioni di persone che conosci. Il passaparola diventa digitale.",
  alternates: { canonical: "https://filo.network" },
  openGraph: {
    title: "Filo — Il passaparola digitale",
    description:
      "Trova professionisti affidabili grazie alle raccomandazioni di persone che conosci.",
    url: "https://filo.network",
  },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Filo",
  url: "https://filo.network",
  logo: "https://filo.network/filo-logo-v2.png",
  description:
    "Social network italiano per raccomandazioni di professionisti di fiducia. Il passaparola diventa digitale.",
  contactPoint: {
    "@type": "ContactPoint",
    email: "filo.networks@gmail.com",
    contactType: "customer support",
    availableLanguage: "Italian",
  },
};

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-6 py-16 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <main className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/filo-logo-v2.png" alt="Filo" className="h-9 w-auto object-contain" />
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            Il social network della fiducia — trova professionisti
            consigliati da persone reali.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-10 flex flex-col gap-3">
          <Link
            href="/login"
            className="flex h-12 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-white shadow-[0_0_24px_rgba(13,148,136,0.4)] transition hover:bg-primary-hover active:scale-[0.98]"
          >
            Accedi
          </Link>
          <Link
            href="/register"
            className="flex h-12 items-center justify-center rounded-2xl border border-border bg-card text-sm font-semibold text-white transition hover:border-teal-500/40 hover:bg-[#1e1e38] active:scale-[0.98]"
          >
            Registrati
          </Link>
        </div>
      </main>
    </div>
  );
}
