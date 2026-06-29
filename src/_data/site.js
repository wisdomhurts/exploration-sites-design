// Single source of truth for the site's absolute base URL.
// Used for canonical tags, Open Graph / Twitter URLs, JSON-LD, sitemap + robots.
// Default = the current live production host. When this site moves to the
// primary domain (e.g. https://explorationsites.com), change DEFAULT_URL below
// (or set the SITE_URL env var in Vercel) — every absolute URL updates at once.
const DEFAULT_URL = "https://es-draft-1.vercel.app";

module.exports = {
  url: (process.env.SITE_URL || DEFAULT_URL).replace(/\/$/, ""),
};
