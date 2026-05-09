import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lista d'attesa",
  description:
    "Unisciti a Filo, il social network italiano del passaparola digitale. Iscriviti alla lista d'attesa e scopri professionisti affidabili raccomandati da persone che conosci.",
  alternates: { canonical: "https://filo.network/waitlist" },
  openGraph: {
    title: "Filo — Iscriviti alla lista d'attesa",
    description:
      "Unisciti a Filo, il social network italiano del passaparola digitale.",
    url: "https://filo.network/waitlist",
  },
};

export default function WaitlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
