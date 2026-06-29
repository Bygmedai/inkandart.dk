// Sentry browser-observability init — selvhostet så det er CSP-rent (script-src 'self').
// Tidligere et inline <script> i sentry-init.njk → blokeret af den stramme CSP.
// Public DSN (browser-eksponering by design); PII redacted i beforeSend.
(function () {
  if (typeof window.Sentry === 'undefined') return;
  var SENSITIVE = /email|name|phone|address|cookie|auth|payment|ccbill|request_body|access_token|claim_secret|session_token|service_role|api_key|secret|password|bearer/i;
  function redact(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    for (var k in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, k)) {
        if (SENSITIVE.test(k)) { obj[k] = '[Redacted]'; }
        else if (typeof obj[k] === 'object') { obj[k] = redact(obj[k]); }
      }
    }
    return obj;
  }
  window.Sentry.init({
    dsn: "https://0c5109cf8355217aa342a866724892d7@o4511019808456704.ingest.de.sentry.io/4511485071261776",
    environment: "production",
    tracesSampleRate: 0,
    profilesSampleRate: 0,
    sendDefaultPii: false,
    beforeSend: function (event) {
      try {
        if (event.request) { if (event.request.headers) redact(event.request.headers); if (event.request.cookies) event.request.cookies = '[Redacted]'; if (event.request.data) event.request.data = '[Redacted]'; }
        if (event.user) event.user = event.user.id ? { id: event.user.id } : undefined;
        if (event.extra) redact(event.extra);
        if (event.contexts) redact(event.contexts);
        return event;
      } catch (e) { return event; }
    }
  });
})();
