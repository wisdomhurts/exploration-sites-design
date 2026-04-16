module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/styles.css");
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/fonts");
  return {
    dir: {
      input: "src",
      output: "public",
      includes: "_includes"
    }
  };
};
