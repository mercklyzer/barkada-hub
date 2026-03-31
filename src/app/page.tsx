"use client";

import { useState } from "react";
import { Footer } from "@/components/home/Footer";
import { Games } from "@/components/home/Games";
import { Hero } from "@/components/home/Hero";
import { Nav } from "@/components/home/Nav";
import { Stats } from "@/components/home/Stats";
import type { Filter, Lang } from "@/lib/home/games";

const HomePage = () => {
  const [lang, setLang] = useState<Lang>("en");
  const [filter, setFilter] = useState<Filter>("all");

  return (
    <>
      <Nav lang={lang} onLangChange={setLang} />
      <Hero lang={lang} />
      <Stats />
      <Games filter={filter} onFilterChange={setFilter} />
      <Footer />
    </>
  );
};

export default HomePage;
