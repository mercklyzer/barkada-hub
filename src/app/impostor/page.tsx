import type { Metadata } from "next";
import { ImpostorGame } from "@/components/impostor/ImpostorGame";

export const metadata: Metadata = {
  title: "Who's the Impostor?",
  description:
    "Play Who's the Impostor online — a Filipino barkada party game for 4–12 players. Everyone gets the same word except one impostor. Can your group vote them out? Free, no login needed.",
  keywords: [
    "Who's the Impostor game",
    "impostor game Philippines",
    "barkada impostor game",
    "Filipino word game",
    "group party game Philippines",
    "among us inspired game",
  ],
  openGraph: {
    title: "Who's the Impostor? — Barkada Hub",
    description:
      "Everyone gets the same word — except the impostor. Can your barkada figure out who doesn't belong? Free party game, no login needed.",
    url: "https://barkadahub.com/impostor",
  },
  twitter: {
    card: "summary_large_image",
    title: "Who's the Impostor? — Barkada Hub",
    description:
      "Everyone gets the same word — except the impostor. Can your barkada figure out who doesn't belong?",
  },
  alternates: {
    canonical: "https://barkadahub.com/impostor",
  },
};

const impostorSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Who's the Impostor?",
  applicationCategory: "Game",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "PHP" },
  description:
    "4–12 players each get a word — but one player (the impostor) gets a different word. Give clues without revealing your word, then vote out the impostor.",
  url: "https://barkadahub.com/impostor",
  inLanguage: ["fil", "en"],
};

const ImpostorPage = () => {
  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data is safe
        dangerouslySetInnerHTML={{ __html: JSON.stringify(impostorSchema) }}
      />
      <ImpostorGame />
    </>
  );
};

export default ImpostorPage;
