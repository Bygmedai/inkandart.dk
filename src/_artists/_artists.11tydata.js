/**
 * Directory-level data for src/_artists/*.md.
 *
 * Each markdown file paginates over [da, en] → produces 2 pages:
 *   /artister/<slug>/        (DA)
 *   /en/artists/<slug>/      (EN)
 *
 * The `slug` comes from each markdown's own front matter.
 */
export default {
  layout: "layouts/artist.njk",
  tags: ["artist"],
  pagination: {
    data: "siteLocales",
    size: 1,
    alias: "lang",
  },
  siteLocales: ["da", "en"],
  permalink: function (data) {
    const slug = data.slug;
    const lang = data.lang;
    if (lang === "en") return `/en/artists/${slug}/`;
    return `/artister/${slug}/`;
  },
  eleventyComputed: {
    title: function (data) {
      return data.title || `${data.name} · Ink & Art Copenhagen`;
    },
    description: function (data) {
      const name = data.name || "";
      const styles = (data.styles || []).join(", ");
      const role = data.lang === "en"
        ? (data.role?.en || data.role?.da || "")
        : (data.role?.da || "");
      if (data.lang === "en") {
        return `${name} — ${role} at Ink & Art Copenhagen.${styles ? " Specialises in " + styles + "." : ""} Book a session or walk in at Larsbjørnsstræde 13, Copenhagen.`;
      }
      return `${name} — ${role} hos Ink & Art Copenhagen.${styles ? " Specialiseret i " + styles + "." : ""} Book tid eller kig forbi på Larsbjørnsstræde 13, København.`;
    },
    ogImageAlt: function (data) {
      if (!data.portrait?.alt) return null;
      const lang = data.lang || "da";
      return data.portrait.alt[lang] || data.portrait.alt.da || null;
    },
  },
};
