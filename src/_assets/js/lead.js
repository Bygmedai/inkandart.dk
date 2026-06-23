// "Del din idé"-lead — sender en pre-udfyldt besked til studiets WhatsApp.
// Ingen backend/secrets: leadet lander direkte i studiets WhatsApp-tråd.
// (Senere opgradering: POST til CRM/booking via env-konfigureret endpoint.)
(function () {
  var form = document.getElementById('lead-form');
  if (!form) return;
  var wa = (form.getAttribute('data-wa') || '').replace(/\D/g, '');
  var en = form.getAttribute('data-lang') === 'en';

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = new FormData(form);
    var name = (f.get('name') || '').toString().trim();
    var contact = (f.get('contact') || '').toString().trim();
    var idea = (f.get('idea') || '').toString().trim();
    var placement = (f.get('placement') || '').toString().trim();

    var L = en
      ? { hi: "Hi Ink & Art! I'd like to share an idea.", name: 'Name', contact: 'Contact', idea: 'Idea', placement: 'Placement' }
      : { hi: 'Hej Ink & Art! Jeg vil gerne dele en idé.', name: 'Navn', contact: 'Kontakt', idea: 'Idé', placement: 'Placering' };

    var lines = [L.hi, '', L.name + ': ' + name, L.contact + ': ' + contact, L.idea + ': ' + idea];
    if (placement) lines.push(L.placement + ': ' + placement);

    var url = 'https://wa.me/' + wa + '?text=' + encodeURIComponent(lines.join('\n'));
    window.location.href = url;
  });
})();
