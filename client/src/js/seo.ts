// Lightweight, dependency-free SEO tag manager.
// Sets the document title + meta description / OpenGraph / Twitter / canonical
// per route so crawlers and social scrapers see meaningful metadata.

const SITE_URL = "https://motsflex.com";

const DEFAULT_TITLE = "MotsFlex — Générateur de mots fléchés et mots croisés en ligne";
const DEFAULT_DESCRIPTION =
  "MotsFlex est un générateur de mots fléchés et de mots croisés gratuit et open source. Remplissez vos grilles automatiquement, éditez les définitions et exportez en PDF ou SVG.";

type Seo = { title: string; description: string };

// Indexable / public routes get keyword-rich, unique metadata.
const SEO: Record<string, Seo> = {
  home: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  changelog: {
    title: "Journal des modifications — MotsFlex",
    description:
      "Découvrez les dernières nouveautés de MotsFlex, le générateur de mots fléchés et de mots croisés en ligne.",
  },
  grids: {
    title: "Mes grilles — MotsFlex",
    description:
      "Créez et remplissez vos grilles de mots fléchés et de mots croisés avec MotsFlex.",
  },
  books: {
    title: "Mes livres de grilles — MotsFlex",
    description:
      "Organisez vos grilles de mots fléchés en livres et exportez-les en PDF avec MotsFlex.",
  },
  styles: {
    title: "Styles de grilles — MotsFlex",
    description:
      "Personnalisez l'apparence de vos grilles de mots croisés : couleurs, polices et bordures.",
  },
  words: {
    title: "Dictionnaire de mots — MotsFlex",
    description:
      "Gérez votre dictionnaire de mots pour remplir vos grilles de mots fléchés avec MotsFlex.",
  },
  fonts: {
    title: "Polices — MotsFlex",
    description:
      "Choisissez et importez des polices pour vos grilles de mots croisés avec MotsFlex.",
  },
  login: {
    title: "Se connecter — MotsFlex",
    description:
      "Connectez-vous à MotsFlex pour sauvegarder vos grilles de mots fléchés et y accéder depuis n'importe quel appareil.",
  },
  register: {
    title: "Créer un compte — MotsFlex",
    description:
      "Créez un compte MotsFlex pour sauvegarder et synchroniser vos grilles de mots croisés.",
  },
  subscribe: {
    title: "Abonnement — MotsFlex",
    description:
      "Soutenez MotsFlex et débloquez des fonctionnalités supplémentaires pour vos mots fléchés.",
  },
};

function upsertMeta(
  attr: "name" | "property",
  key: string,
  content: string
): void {
  let el = document.head.querySelector<HTMLMetaElement>(
    `meta[${attr}="${key}"]`
  );
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertCanonical(url: string): void {
  let el = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]'
  );
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", url);
}

export function applySeo(seo: Seo, path: string): void {
  if (typeof document === "undefined") return;
  const url = SITE_URL + path;

  document.title = seo.title;
  upsertMeta("name", "description", seo.description);
  upsertMeta("property", "og:title", seo.title);
  upsertMeta("property", "og:description", seo.description);
  upsertMeta("property", "og:url", url);
  upsertMeta("name", "twitter:title", seo.title);
  upsertMeta("name", "twitter:description", seo.description);
  upsertCanonical(url);
}

export function applySeoForRoute(
  name: string | symbol | null | undefined,
  path: string
): void {
  const key = name ? String(name) : "";
  const seo = SEO[key] || { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION };
  applySeo(seo, path);
}
