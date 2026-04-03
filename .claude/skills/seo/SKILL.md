---
name: seo
description: Improve SEO for the Barkada Hub Next.js 16 App Router project. Use this skill whenever the user asks about search engine optimization, metadata, Open Graph, social sharing previews, sitemaps, robots.txt, structured data, JSON-LD, page discoverability, search rankings, or wants more traffic. Trigger this skill even when the user phrases it casually — "make it show up on Google", "improve how it looks when shared", "add meta tags", or "is the SEO good?" are all good reasons to activate this skill.
---

# SEO for Barkada Hub

This skill guides SEO improvements for the Barkada Hub Next.js 16 (App Router) project at `/Users/lyzer/app-ideas/mini-games/tambay-games`.

## Project Context

- **Framework**: Next.js 16 App Router (metadata exported from route files)
- **Current state**: Only a basic `title` + `description` in `src/app/layout.tsx`
- **Pages**: `/` (home), `/henyo`, `/impostor`, `/werewolf`
- **Audience**: Global — party game players of all backgrounds (not exclusively Filipino)
- **Language**: English only
- **Base URL**: `https://barkadahub.com`

---

## The Core SEO Checklist

Work through these in order, skipping anything already done:

### 1. Root Layout Metadata (`src/app/layout.tsx`)

The root layout should set site-wide defaults. Expand the existing `metadata` export to include Open Graph, Twitter, and canonical base URL. These serve as fallbacks for all pages.

```ts
import type { Metadata } from "next";

const BASE_URL = "https://barkadahub.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Barkada Hub — Free Party Games",
    template: "%s | Barkada Hub",
  },
  description:
    "Free party games — Pinoy Henyo, Who's the Impostor, Werewolf, and more. No login needed. Play with friends on one phone!",
  keywords: ["party games", "Pinoy Henyo", "barkada games", "Who's the Impostor", "Werewolf game", "free party games", "group games"],
  authors: [{ name: "Barkada Hub" }],
  creator: "Barkada Hub",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "Barkada Hub",
    title: "Barkada Hub — Free Party Games",
    description:
      "Free party games — Pinoy Henyo, Who's the Impostor, Werewolf, and more. No login needed.",
    images: [
      {
        url: "/og-image.png", // 1200×630px, create this
        width: 1200,
        height: 630,
        alt: "Barkada Hub — Free Party Games",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Barkada Hub — Free Party Games",
    description:
      "Free party games — Pinoy Henyo, Who's the Impostor, Werewolf, and more.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};
```

**Why `metadataBase` matters**: Without it, Next.js can't resolve relative image URLs in OG tags. Always set it.

**Why `template`**: Lets each game page just set its own title (`"Pinoy Henyo"`) and get `"Pinoy Henyo | Barkada Hub"` automatically.

---

### 2. Per-Page Metadata (each game page)

Each game page is a `"use client"` component, which means you can't export `metadata` from the page file itself — metadata exports only work in Server Components. The solution is a thin server-side wrapper:

**Pattern**: Keep the existing page file as-is (it's a client component), but add a `metadata` export at the top of the same file only if it's a server component, OR create a separate metadata export in a layout or a server-component wrapper.

The cleanest approach for App Router: add `export const metadata: Metadata` to each game page file. Even though the default export renders a client component, the `metadata` export is evaluated server-side.

```ts
// src/app/henyo/page.tsx
import type { Metadata } from "next";
import { HenyoGame } from "@/components/henyo/HenyoGame";

export const metadata: Metadata = {
  title: "Pinoy Henyo",
  description:
    "The classic guessing game. Hold the phone to your forehead — your partner answers Yes, No, or Maybe. Free, no login needed.",
  openGraph: {
    title: "Pinoy Henyo — Barkada Hub",
    description:
      "Hold the phone to your forehead. Your partner says Yes, No, or Maybe. A classic party guessing game.",
    url: "https://barkadahub.com/henyo",
  },
};

const HenyoPage = () => <HenyoGame />;
export default HenyoPage;
```

Write similar metadata for `/impostor` and `/werewolf` — tailor the description to each game's mechanics.

**Game-specific metadata to write:**

| Page | Title | Key description angle |
|------|-------|----------------------|
| `/henyo` | Pinoy Henyo | Guessing game, 2 players, hold phone to forehead |
| `/impostor` | Who's the Impostor? | 4–12 players, one player gets a different word, vote them out |
| `/werewolf` | Werewolf | 4–15 players, hidden roles, night kills, daytime votes |

---

### 3. Sitemap (`src/app/sitemap.ts`)

Next.js 13+ supports a `sitemap.ts` file that generates `/sitemap.xml` automatically.

```ts
// src/app/sitemap.ts
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
    priority: 0.8,
  },
  {
    url: `${BASE_URL}/impostor`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    url: `${BASE_URL}/werewolf`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  },
];

export default sitemap;
```

---

### 4. Robots (`src/app/robots.ts`)

```ts
// src/app/robots.ts
import type { MetadataRoute } from "next";

const robots = (): MetadataRoute.Robots => ({
  rules: {
    userAgent: "*",
    allow: "/",
  },
  sitemap: "https://barkadahub.com/sitemap.xml",
});

export default robots;
```

---

### 5. JSON-LD Structured Data

Structured data helps Google understand the content and can enable rich results. For a games site, use the `VideoGame` schema (or `Game` schema). Add it as a `<script>` tag inside the page component.

Create a reusable component:

```tsx
// src/components/JsonLd.tsx
interface JsonLdProps {
  data: Record<string, unknown>;
}

const JsonLd = ({ data }: JsonLdProps) => (
  <script
    type="application/ld+json"
    // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is safe here
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
  />
);

export default JsonLd;
```

Add to the home page layout or `layout.tsx`:

```tsx
// In src/app/layout.tsx body, add the WebSite schema
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Barkada Hub",
      url: "https://barkadahub.com",
      description: "Free party games for groups — play with friends, no login needed.",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://barkadahub.com/?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    }),
  }}
/>
```

For each game page, add a `SoftwareApplication` schema:

```ts
// Example for /henyo
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Pinoy Henyo",
  applicationCategory: "Game",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "PHP" },
  description: "Classic guessing game. 2 players, hold phone to forehead.",
  url: "https://barkadahub.com/henyo",
}
```

---

### 6. OG Image

Create a static `public/og-image.png` (1200×630px) showing the Barkada Hub branding. Alternatively, use Next.js's `opengraph-image.tsx` convention:

```tsx
// src/app/opengraph-image.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Barkada Hub — Free Party Games";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const Image = () =>
  new ImageResponse(
    (
      <div
        style={{
          background: "#0038a8",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: 72,
          fontWeight: "bold",
        }}
      >
        🎮 Barkada Hub
        <span style={{ fontSize: 32, marginTop: 16, opacity: 0.8 }}>
          Free Party Games for Groups
        </span>
      </div>
    ),
    { ...size }
  );

export default Image;
```

When using `opengraph-image.tsx`, remove the `/og-image.png` reference from metadata and let Next.js auto-link it.

---

## Implementation Order

If doing a full SEO pass, go in this order:

1. Confirm the production base URL with the user
2. Update `src/app/layout.tsx` (root metadata + JSON-LD WebSite schema)
3. Add `metadata` exports to each game page (`henyo`, `impostor`, `werewolf`)
4. Create `src/app/sitemap.ts`
5. Create `src/app/robots.ts`
6. Add game-specific JSON-LD to each game page
7. Create OG image (static PNG or `opengraph-image.tsx`)

## Verification

After implementing, check:
- `https://barkadahub.com/sitemap.xml` returns valid XML
- `https://barkadahub.com/robots.txt` is readable
- Run through [Google's Rich Results Test](https://search.google.com/test/rich-results) for structured data
- Use [opengraph.xyz](https://www.opengraph.xyz) or Twitter Card Validator to preview social cards

## Caveats

- **Client components can't export `metadata`** — but adding a named `export const metadata` to a page file alongside a default client component export is fine in Next.js 16 App Router; the metadata is extracted statically.
- **Dynamic metadata**: For pages with dynamic content (e.g., word categories), use `generateMetadata()` instead of a static `metadata` export.
- **`lang="fil"`** is already set in the root `<html>` tag — good for accessibility and SEO. Keep it.