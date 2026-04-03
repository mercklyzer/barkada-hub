import type { Metadata } from "next";
import { WerewolfGame } from "@/components/werewolf/WerewolfGame";

export const metadata: Metadata = {
  title: "Werewolf Game",
  description:
    "Play Werewolf online — the classic social deduction party game for 4–15 players. Hidden roles, night kills, and daytime votes. Will the villagers survive? Free, no login needed.",
  keywords: [
    "Werewolf game online",
    "Mafia game Philippines",
    "social deduction game",
    "Filipino Werewolf game",
    "barkada werewolf",
    "party game hidden roles",
    "lobo lobo game",
  ],
  openGraph: {
    title: "Werewolf Game — Barkada Hub",
    description:
      "Hidden roles, night kills, and daytime votes. Can the villagers find the werewolves before it's too late? Free social deduction game for 4–15 players.",
    url: "https://barkadahub.com/werewolf",
  },
  twitter: {
    card: "summary_large_image",
    title: "Werewolf Game — Barkada Hub",
    description:
      "Hidden roles, night kills, and daytime votes. Can the villagers find the werewolves? Free social deduction game for barkada.",
  },
  alternates: {
    canonical: "https://barkadahub.com/werewolf",
  },
};

const werewolfSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Werewolf Game",
  applicationCategory: "Game",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "PHP" },
  description:
    "Classic social deduction game for 4–15 players. Players are secretly assigned roles — werewolves hunt villagers at night while villagers vote to eliminate suspects during the day.",
  url: "https://barkadahub.com/werewolf",
  inLanguage: ["fil", "en"],
};

const WerewolfPage = () => {
  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data is safe
        dangerouslySetInnerHTML={{ __html: JSON.stringify(werewolfSchema) }}
      />
      <WerewolfGame />
    </>
  );
};

export default WerewolfPage;
