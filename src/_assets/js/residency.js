/* Residency failsafe — hides the "in residence now" flag + ribbon after Koko's
   last day (21 Jul 2026). Runs in <head> before paint (no flash). External so it
   passes the strict CSP (no inline scripts). */
(function () {
  try {
    if (Date.now() > Date.parse('2026-07-22T00:00:00+02:00')) {
      document.documentElement.classList.add('residency-over');
    }
  } catch (e) {}
})();
