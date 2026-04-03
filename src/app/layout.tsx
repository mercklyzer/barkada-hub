import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PostHogProvider } from "@/components/PostHogProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";

const inter = Inter({ subsets: ["latin"] });

const BASE_URL = "https://barkadahub.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Tambay Games — Free Filipino Party Games",
    template: "%s | Tambay Games",
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
  authors: [{ name: "Tambay Games" }],
  creator: "Tambay Games",
  publisher: "Tambay Games",
  openGraph: {
    type: "website",
    locale: "fil_PH",
    alternateLocale: ["en_US"],
    url: BASE_URL,
    siteName: "Tambay Games",
    title: "Tambay Games — Free Filipino Party Games",
    description:
      "Free Filipino party games for barkada — Pinoy Henyo, Who's the Impostor, Werewolf, and more. No login needed.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Tambay Games — Free Filipino Party Games",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tambay Games — Free Filipino Party Games",
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
  name: "Tambay Games",
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
      </body>
    </html>
  );
};

export default RootLayout;
