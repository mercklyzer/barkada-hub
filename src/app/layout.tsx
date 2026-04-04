import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { PostHogProvider } from "@/components/PostHogProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";

const inter = Inter({ subsets: ["latin"] });

const BASE_URL = "https://barkadahub.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Barkada Hub — Free Party Games",
    template: "%s | Barkada Hub",
  },
  description:
    "Free Filipino party games for barkada — Pinoy Henyo, Who's the Impostor, Werewolf, and more. No login needed. Play on one phone!",
  keywords: [
    "Filipino party games",
    "Pinoy Henyo online",
    "barkada games",
    "Who's the Impostor game",
    "Werewolf game Filipino",
    "free party games Philippines",
    "online group games",
    "Pinoy games 2025",
    "laruan para sa barkada",
    "henyo game",
  ],
  authors: [{ name: "Barkada Hub" }],
  creator: "Barkada Hub",
  publisher: "Barkada Hub",
  openGraph: {
    type: "website",
    locale: "fil_PH",
    alternateLocale: ["en_US"],
    url: BASE_URL,
    siteName: "Barkada Hub",
    title: "Barkada Hub — Free Party Games",
    description:
      "Free Filipino party games for barkada — Pinoy Henyo, Who's the Impostor, Werewolf, and more. No login needed.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Barkada Hub — Free Filipino Party Games",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Barkada Hub — Free Filipino Party Games",
    description:
      "Free Filipino party games for barkada — Pinoy Henyo, Who's the Impostor, Werewolf, and more. No login needed.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Barkada Hub",
  url: "https://barkadahub.com",
  description:
    "Free Filipino party games for barkada — Pinoy Henyo, Who's the Impostor, Werewolf, and more.",
  inLanguage: ["fil", "en"],
  audience: {
    "@type": "Audience",
    geographicArea: {
      "@type": "Country",
      name: "Philippines",
    },
  },
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="fil">
      <body className={inter.className}>
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data is safe
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <PostHogProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </PostHogProvider>
        <Analytics />
      </body>
    </html>
  );
};

export default RootLayout;
