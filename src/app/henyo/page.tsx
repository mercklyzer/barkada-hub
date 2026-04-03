import type { Metadata } from "next";
import { HenyoGame } from "@/components/henyo/HenyoGame";

export const metadata: Metadata = {
  title: "Pinoy Henyo",
  description:
    "Play Pinoy Henyo online — the classic Filipino guessing game from Eat Bulaga! Hold the phone to your forehead and let your barkada answer Oo, Hindi, or Pwede. Free, no login needed.",
  keywords: [
    "Pinoy Henyo",
    "henyo game online",
    "Filipino guessing game",
    "Eat Bulaga henyo",
    "barkada guessing game",
    "pinoy party game",
  ],
  openGraph: {
    title: "Pinoy Henyo — Barkada Hub",
    description:
      "Hold your phone to your forehead — your barkada answers Oo, Hindi, or Pwede. The classic Filipino guessing game, free online!",
    url: "https://barkadahub.com/henyo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pinoy Henyo — Barkada Hub",
    description:
      "Hold your phone to your forehead — your barkada answers Oo, Hindi, or Pwede. Free online!",
  },
  alternates: {
    canonical: "https://barkadahub.com/henyo",
  },
};

const henyoSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Pinoy Henyo",
  applicationCategory: "Game",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "PHP" },
  description:
    "The classic Filipino guessing game. Hold the phone to your forehead — your partner answers Oo, Hindi, or Pwede.",
  url: "https://barkadahub.com/henyo",
  inLanguage: ["fil", "en"],
};

const HenyoPage = () => {
  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data is safe
        dangerouslySetInnerHTML={{ __html: JSON.stringify(henyoSchema) }}
      />
      <HenyoGame />
    </>
  );
};

export default HenyoPage;
