module.exports = function(eleventyConfig) {
  // Skip the phantom ACL-locked directory that crashes the watcher
  eleventyConfig.watchIgnores.add("src/assets/globe/**");
  eleventyConfig.ignores.add("src/assets/globe/**");
  eleventyConfig.addPassthroughCopy("src/styles.css");
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/fonts");
  eleventyConfig.addPassthroughCopy("src/assets/hero-globe.js");
  eleventyConfig.addPassthroughCopy("src/assets/three");
  eleventyConfig.addPassthroughCopy("src/assets/world-mask.png");
  eleventyConfig.addPassthroughCopy("src/assets/footer-shader.js");
  // IndexNow ownership key (scripts/indexnow.mjs) — must be served at the site root.
  eleventyConfig.addPassthroughCopy("src/446d45b491bb1d660b1f96d071d35dad.txt");

  // Small image variants made by scripts/build-thumbs.mjs (npm run thumbs). Each
  // filter returns the variant's path if it exists, else the original, so a
  // missing variant costs bytes but never breaks an image.
  const fs = require("fs");
  const path = require("path");
  const variant = (src, to) => {
    if (!src) return src;
    const lead = src.startsWith("/") ? "/" : "";
    return fs.existsSync(path.join("src", to)) ? lead + to : src;
  };
  eleventyConfig.addFilter("thumb", src => src && variant(src,
    path.posix.join(path.posix.dirname(src.replace(/^\//, "")), "thumb", path.posix.basename(src).replace(/\.\w+$/, ".webp"))));
  eleventyConfig.addFilter("site800", src => src && variant(src, src.replace(/^\//, "").replace(/\.avif$/, "-800.avif")));
  eleventyConfig.addFilter("logoSm", src => src && variant(src, src.replace(/^\//, "").replace(/^images\/clients\//, "images/clients/sm/")));

  // Local-currency prices. Every price on the site is CAD in the source; these wrap it
  // in <span class="px" data-cad="…"> and scripts.html swaps the text to USD or AUD
  // (fixed rates in prices.json "fx", clean rounding — the same amounts Stripe charges).
  const cadNumber = v => Number(String(v).replace(/[^\d.]/g, ""));
  const pxSpan = n => `<span class="px" data-cad="${n}">$${n.toLocaleString("en-US")}</span>`;
  eleventyConfig.addFilter("money", v => pxSpan(cadNumber(v)));
  // For prose built in JS data files (FAQ answers): wraps "$1,200"-style amounts and
  // the words "CAD" / "Canadian dollars". Skips market caps like "$2.5B".
  eleventyConfig.addFilter("moneyText", html => String(html)
    .replace(/\$(\d[\d,]*)(?![\d,.]*\s?(?:B|M|K|k)\b)/g, (m, d) => pxSpan(cadNumber(d)))
    .replace(/\bCanadian dollars\b/g, '<span class="fx-name">Canadian dollars</span>')
    .replace(/\bCAD\b/g, '<span class="fx-code">CAD</span>'));
  return {
    dir: {
      input: "src",
      output: "public",
      includes: "_includes"
    }
  };
};
