(function() {
  'use strict';
  const STORAGE_KEY = 'inkandart-consent-v1';
  const banner = document.getElementById('cookie-banner');
  const stored = localStorage.getItem(STORAGE_KEY);

  // Default-denied Consent Mode v2 — must run before any analytics loads
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  gtag('consent', 'default', {
    ad_storage: 'denied',
    analytics_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 500
  });

  // --- GA4 (lazy, consent-gated). Measurement ID from <meta name="ga-id"> (site.gaId).
  //     No inline scripts → passes the strict CSP. ---
  function gaId() {
    var m = document.querySelector('meta[name="ga-id"]');
    return m && m.content && m.content.indexOf('G-') === 0 ? m.content : '';
  }
  var gaLoaded = false;
  function loadGA() {
    var id = gaId();
    if (gaLoaded || !id) return;
    gaLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', id, { anonymize_ip: true });
  }

  // Returning visitor who already accepted → restore granted + load.
  if (stored === 'accept') {
    gtag('consent', 'update', { analytics_storage: 'granted' });
    loadGA();
  }

  // Conversion events: any [data-ga-event] click. Inert until GA loads (consent).
  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('[data-ga-event]') : null;
    if (!el) return;
    gtag('event', el.getAttribute('data-ga-event'), {
      event_category: 'engagement',
      event_label: el.getAttribute('data-ga-label') || el.getAttribute('href') || ''
    });
  });

  if (!stored && banner) {
    banner.hidden = false;
  }

  if (banner) {
    banner.addEventListener('click', function(e) {
      const choice = e.target && e.target.dataset && e.target.dataset.consent;
      if (!choice) return;
      localStorage.setItem(STORAGE_KEY, choice);
      banner.hidden = true;
      if (choice === 'accept') {
        gtag('consent', 'update', {
          analytics_storage: 'granted'
        });
        loadGA();
      }
    });
  }
})();
