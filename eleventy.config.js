export default function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/_assets");
  eleventyConfig.addPassthroughCopy({ "src/_assets/img/favicon.ico": "favicon.ico" });
  eleventyConfig.addPassthroughCopy({ "src/_assets/img/apple-touch-icon.png": "apple-touch-icon.png" });

  eleventyConfig.addFilter("isoDate", (date) => new Date(date).toISOString());

  eleventyConfig.addFilter("date", (date, format) => {
    const d = (date === "now" || !date) ? new Date() : new Date(date);
    if (format === "%Y" || format === "Y") return String(d.getFullYear());
    return d.toISOString();
  });

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    templateFormats: ["njk", "html", "md"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
}
