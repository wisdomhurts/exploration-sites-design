module.exports = function(eleventyConfig) {
  // Skip the phantom ACL-locked directory that crashes the watcher
  eleventyConfig.watchIgnores.add("src/assets/globe/**");
  eleventyConfig.ignores.add("src/assets/globe/**");
  // Whole-dollar amount with thousands separators: "2,500" | money -> "2,500"; 2083.33 -> "2,083"
  eleventyConfig.addFilter("money", (n) =>
    Math.round(Number(String(n).replace(/,/g, ""))).toLocaleString("en-US"));
  eleventyConfig.addPassthroughCopy("src/styles.css");
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/fonts");
  eleventyConfig.addPassthroughCopy("src/assets/hero-globe.js");
  eleventyConfig.addPassthroughCopy("src/assets/three");
  eleventyConfig.addPassthroughCopy("src/assets/world-mask.png");
  eleventyConfig.addPassthroughCopy("src/assets/footer-shader.js");
  return {
    dir: {
      input: "src",
      output: "public",
      includes: "_includes"
    }
  };
};
