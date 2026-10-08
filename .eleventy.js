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
  return {
    dir: {
      input: "src",
      output: "public",
      includes: "_includes"
    }
  };
};
