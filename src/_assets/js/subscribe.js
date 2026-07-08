// Email capture → /api/subscribe (Shopify customer + consent).
// Generic: every form with [data-subscribe] is wired.
//   data-source  → server-side tag set (footer | kinky-sundae | …)
//   data-lang    → "en" for English copy
//   data-reveal  → CSS selector shown on success (e.g. member-price note)
// CSP-clean: external file, same-origin fetch. Honeypot ("company") for bots.
(function () {
  var forms = document.querySelectorAll("form[data-subscribe]");
  if (!forms.length) return;
  var RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  Array.prototype.forEach.call(forms, wire);

  function wire(form) {
    var statusEl = form.querySelector("[data-nl-status]");
    var btn = form.querySelector('[type="submit"]');
    var revealSel = form.getAttribute("data-reveal");
    var en = form.getAttribute("data-lang") === "en";
    var source = form.getAttribute("data-source") || "footer";
    var MSG = en
      ? { ok: "Thanks — you're on the list.", already: "You're already on the list.", err: "Something went wrong. Try again, or DM us on Instagram.", bad: "Enter a valid email.", sending: "Sending…" }
      : { ok: "Tak — du er på listen.", already: "Du er allerede på listen.", err: "Noget gik galt. Prøv igen, eller skriv til os på Instagram.", bad: "Indtast en gyldig email.", sending: "Sender…" };

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
        body: JSON.stringify({ email: email, company: honeypot, source: source })
      })
        .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
        .then(function (d) {
          if (d && d.ok) {
            form.reset();
            say(d.already ? MSG.already : MSG.ok, false);
            if (revealSel) { var el = document.querySelector(revealSel); if (el) el.hidden = false; }
          } else { say(MSG.err, true); }
        })
        .catch(function () { say(MSG.err, true); })
        .then(function () { setBusy(false); });
    });

    function say(m, isErr) { if (!statusEl) return; statusEl.textContent = m; statusEl.classList.toggle("is-error", !!isErr); }
    function setBusy(b) { if (btn) btn.disabled = b; form.setAttribute("aria-busy", b ? "true" : "false"); }
  }
})();
