(function() {
  'use strict';
  const STORAGE_KEY = 'inkandart-consent-v1';
  const banner = document.getElementById('cookie-banner');
  const stored = localStorage.getItem(STORAGE_KEY);

  // Default-denied Consent Mode v2 — must run before any analytics/ads loads
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  gtag('consent', 'default', {
    ad_storage: 'denied',
    analytics_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 500
  });

  // --- Config from <meta> (populated from site.json). Empty = feature inert. ---
  //     No inline scripts anywhere → passes the strict CSP; loaders inject
  //     whitelisted script/img src (googletagmanager, connect.facebook.net). ---
  function metaContent(name, prefix) {
    var m = document.querySelector('meta[name="' + name + '"]');
    var v = m && m.content ? m.content.trim() : '';
    if (!v) return '';
    return prefix ? (v.indexOf(prefix) === 0 ? v : '') : v;
  }
  function gaId()         { return metaContent('ga-id', 'G-'); }
  function adsId()        { return metaContent('ads-conversion-id', 'AW-'); }
  function adsLabel()     { return metaContent('ads-conversion-label'); }
  function metaPixelId()  { return metaContent('meta-pixel-id'); }

  // --- Google tag (GA4 + Google Ads). Loaded once, consent-gated. ---
  var googleLoaded = false;
  function loadGoogle() {
    var ga = gaId(), ads = adsId();
    if (googleLoaded || (!ga && !ads)) return;
    googleLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    // gtag.js is served for either an analytics or an ads id.
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + (ga || ads);
    document.head.appendChild(s);
    gtag('js', new Date());
    if (ga)  gtag('config', ga, { anonymize_ip: true });
    if (ads) gtag('config', ads); // Google Ads (conversion linker)
  }

  // --- Meta (Facebook) Pixel. Consent-gated; inert without a pixel id. ---
  var metaLoaded = false;
  function loadMetaPixel() {
    var id = metaPixelId();
    if (metaLoaded || !id) return;
    metaLoaded = true;
    // Standard Meta bootstrap (no inline tag; fbevents.js from whitelisted src).
    (function(f,b,e,v,n,t,s){
      if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)})(window,document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', id);
    window.fbq('track', 'PageView');
  }

  // Grant consent (analytics + ads) and fire all configured trackers.
  function grantAndLoad() {
    gtag('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted'
    });
    loadGoogle();
    loadMetaPixel();
  }

  // Returning visitor who already accepted → restore granted + load.
  if (stored === 'accept') grantAndLoad();

  // Conversion events: any [data-ga-event] click. Inert until trackers load
  // (which only happens after consent). The 'book' event is our primary
  // conversion → also fire Google Ads conversion + Meta Lead.
  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('[data-ga-event]') : null;
    if (!el) return;
    var name = el.getAttribute('data-ga-event');
    var label = el.getAttribute('data-ga-label') || el.getAttribute('href') || '';

    // GA4 engagement event (existing behaviour)
    gtag('event', name, { event_category: 'engagement', event_label: label });

    if (name === 'book') {
      // Google Ads conversion (only when both id + label configured)
      var ads = adsId(), lbl = adsLabel();
      if (ads && lbl) gtag('event', 'conversion', { send_to: ads + '/' + lbl });
      // Meta Pixel standard Lead event (only when pixel configured + loaded)
      if (window.fbq && metaPixelId()) window.fbq('track', 'Lead', { content_name: label });
    }
  });

  if (!stored && banner) {
    banner.hidden = false;
    var acceptBtn = banner.querySelector('[data-consent="accept"]');
    if (acceptBtn) acceptBtn.focus(); // fokus ind i dialogen (a11y)
  }

  if (banner) {
    banner.addEventListener('click', function(e) {
      const choice = e.target && e.target.dataset && e.target.dataset.consent;
      if (!choice) return;
      localStorage.setItem(STORAGE_KEY, choice);
      banner.hidden = true;
      if (choice === 'accept') grantAndLoad();
    });
  }
})();
