import type { MetadataRoute } from "next";

const BASE_URL = "https://barkadahub.com";

const sitemap = (): MetadataRoute.Sitemap => [
  {
    url: BASE_URL,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1,
  },
  {
    url: `${BASE_URL}/henyo`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.9,
  },
  {
    url: `${BASE_URL}/impostor`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.9,
  },
  {
    url: `${BASE_URL}/werewolf`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.9,
  },
];

export default sitemap;
