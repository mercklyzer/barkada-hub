"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type UILanguage = "filipino" | "english";

interface LanguageContextValue {
  language: UILanguage;
  setLanguage: (lang: UILanguage) => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<UILanguage, string>> = {
  "nav.home": { filipino: "Tahanan", english: "Home" },
  "nav.games": { filipino: "Mga Laro", english: "Games" },
  "common.play": { filipino: "MAGLARO", english: "PLAY" },
  "common.back": { filipino: "Bumalik", english: "Back" },
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<UILanguage>("filipino");

  useEffect(() => {
    const stored = localStorage.getItem("ui_language") as UILanguage | null;
    if (stored === "filipino" || stored === "english") {
      setLanguageState(stored);
    }
  }, []);

  const setLanguage = (lang: UILanguage) => {
    setLanguageState(lang);
    localStorage.setItem("ui_language", lang);
  };

  const t = (key: string): string => {
    return translations[key]?.[language] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
