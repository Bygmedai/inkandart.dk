/* Residency failsafe — data-driven. Reads the end date from <meta name="residency-until">
   (fed by _data/residency.json) and, if it has passed, adds .residency-over to <html>
   so the CSS hides every .js-residency element. Runs in <head> before paint (no flash),
   external so it passes the strict CSP. No hardcoded dates → reusable for any tenant. */
(function () {
  try {
    var m = document.querySelector('meta[name="residency-until"]');
    if (!m || !m.content) return;
    var end = Date.parse(m.content + 'T23:59:59+02:00');
    if (isFinite(end) && Date.now() > end) {
      document.documentElement.classList.add('residency-over');
    }
  } catch (e) {}
})();
