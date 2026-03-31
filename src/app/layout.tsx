import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PostHogProvider } from "@/components/PostHogProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tambay Games — Filipino Party Games",
  description:
    "Free Filipino party games — Pinoy Henyo, Impostor, and more. Play with friends on one phone!",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="fil">
      <body className={inter.className}>
        <PostHogProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </PostHogProvider>
      </body>
    </html>
  );
};

export default RootLayout;
