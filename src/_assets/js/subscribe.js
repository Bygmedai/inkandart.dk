// Newsletter signup — POSTs email to /api/subscribe (Shopify customer + consent).
// CSP-clean: external file, same-origin fetch. Honeypot ("company") for bots.
(function () {
  var form = document.getElementById("newsletter-form");
  if (!form) return;
  var statusEl = form.querySelector("[data-nl-status]");
  var btn = form.querySelector('button[type="submit"]');
  var en = form.getAttribute("data-lang") === "en";
  var MSG = en
    ? { ok: "Thanks — you're on the list.", already: "You're already on the list.", err: "Something went wrong. Try again, or DM us on Instagram.", bad: "Enter a valid email.", sending: "Sending…" }
    : { ok: "Tak — du er på listen.", already: "Du er allerede på listen.", err: "Noget gik galt. Prøv igen, eller skriv til os på Instagram.", bad: "Indtast en gyldig email.", sending: "Sender…" };
  var RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var f = new FormData(form);
    var email = String(f.get("email") || "").trim();
    var honeypot = String(f.get("company") || "").trim();
    if (!RE.test(email)) { say(MSG.bad, true); return; }
    setBusy(true); say(MSG.sending, false);
    fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, company: honeypot })
    })
      .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
      .then(function (d) {
        if (d && d.ok) { form.reset(); say(d.already ? MSG.already : MSG.ok, false); }
        else { say(MSG.err, true); }
      })
      .catch(function () { say(MSG.err, true); })
      .then(function () { setBusy(false); });
  });

  function say(m, isErr) {
    if (!statusEl) return;
    statusEl.textContent = m;
    statusEl.classList.toggle("is-error", !!isErr);
  }
  function setBusy(b) { if (btn) btn.disabled = b; form.setAttribute("aria-busy", b ? "true" : "false"); }
})();
