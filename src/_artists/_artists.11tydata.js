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
    addAllPagesToCollections: true,
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
      if (data.description) return data.description;
      const name = data.name || "";
      const lang = data.lang || "da";
      const role = (lang === "en" ? data.role?.en : data.role?.da) || data.role?.da || "";
      const styles = Array.isArray(data.styles) ? data.styles.join(", ") : "";
      if (lang === "en") {
        return `${name} — ${role} at Ink & Art Copenhagen on Larsbjørnsstræde 13. Specialises in ${styles}. Book a session or walk in.`;
      }
      return `${name} — ${role} hos Ink & Art Copenhagen på Larsbjørnsstræde 13. Specialiseret i ${styles}. Book en tid eller kig forbi.`;
    },
  },
};
