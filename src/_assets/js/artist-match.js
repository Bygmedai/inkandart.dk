(function () {
  var LANG = document.documentElement.lang === 'en' ? 'en' : 'da';

  var ARTISTS = [
    {
      slug: 'koko', name: 'Koko Kolev',
      style: { 'bold-klassisk': 3, 'farverig': 3, 'sort-praecis': 3, 'delikat-fin': 1 },
      size:  { 'lille': 1, 'medium': 3, 'stort': 3 }
    },
    {
      slug: 'nizar', name: 'Nizar',
      style: { 'bold-klassisk': 3, 'farverig': 1, 'sort-praecis': 2, 'delikat-fin': 1 },
      size:  { 'lille': 1, 'medium': 3, 'stort': 3 }
    },
    {
      slug: 'isac', name: 'Isac',
      style: { 'bold-klassisk': 1, 'farverig': 0, 'sort-praecis': 3, 'delikat-fin': 3 },
      size:  { 'lille': 3, 'medium': 2, 'stort': 2 }
    }
  ];

  var PRICES = {
    da: { 'lille': 'Fra 800 kr', 'medium': '1.500 – 3.000 kr', 'stort': '3.000+ kr' },
    en: { 'lille': 'From DKK 800', 'medium': 'DKK 1,500 – 3,000', 'stort': 'DKK 3,000+' }
  };

  var styleChoice = null, sizeChoice = null, budgetChoice = null;
  // Booking deep-link-mønster — sættes fra data-booking-pattern (kilde: booking.json),
  // så go-live kun kræver en ændring ét sted. Fallback matcher booking.json.
  var BOOKING_PATTERN = 'https://inkart.book.dk/?artist={booksysId}';

  function totalScore(a) {
    return (a.style[styleChoice] || 0) + (a.size[sizeChoice] || 0);
  }

  function bestMatch() {
    return ARTISTS.reduce(function (best, a) {
      var aScore = totalScore(a), bScore = totalScore(best);
      if (aScore > bScore) return a;
      if (aScore === bScore && (a.style[styleChoice] || 0) > (best.style[styleChoice] || 0)) return a;
      return best;
    });
  }

  function showResult() {
    var artist = bestMatch();
    var artistBase = LANG === 'en' ? '/en/artists/' : '/artister/';
    var artistUrl  = artistBase + artist.slug + '/';
    var bookingUrl = artist.booksysId ? BOOKING_PATTERN.replace('{booksysId}', artist.booksysId) : BOOKING_PATTERN.split('?')[0];
    var price      = PRICES[LANG][sizeChoice];
    var budgetTight = budgetChoice === 'under-1000' && sizeChoice !== 'lille';

    document.getElementById('match-artist-name').textContent = artist.name;
    document.getElementById('match-price').textContent       = price;
    document.getElementById('match-artist-link').href        = artistUrl;
    document.getElementById('match-book-link').href          = bookingUrl;

    var note = document.getElementById('match-budget-note');
    if (note) note.hidden = !budgetTight;

    document.getElementById('match-steps').hidden  = true;
    document.getElementById('match-result').hidden = false;
  }

  function init() {
    var steps  = document.getElementById('match-steps');
    var step1  = document.getElementById('step-1');
    var step2  = document.getElementById('step-2');
    var step3  = document.getElementById('step-3');
    var result = document.getElementById('match-result');
    var nojs   = document.getElementById('match-nojs');

    if (!steps) return;

    if (steps.dataset.bookingPattern) {
      BOOKING_PATTERN = steps.dataset.bookingPattern;
    } else if (window.console && console.warn) {
      console.warn('[booking] data-booking-pattern mangler — bruger fallback-URL. Tjek booking.json/templating før go-live.');
    }

    if (nojs) nojs.hidden = true;

    steps.hidden = false;
    step2.hidden = true;
    step3.hidden = true;
    result.hidden = true;

    steps.addEventListener('click', function (e) {
      var btn  = e.target.closest('[data-value]');
      if (!btn) return;
      var step = btn.closest('[data-step]');
      if (!step) return;

      step.querySelectorAll('[data-value]').forEach(function (b) {
        b.removeAttribute('aria-pressed');
      });
      btn.setAttribute('aria-pressed', 'true');

      var val    = btn.dataset.value;
      var stepId = step.dataset.step;

      if (stepId === '1') {
        styleChoice  = val;
        step1.hidden = true;
        step2.hidden = false;
      } else if (stepId === '2') {
        sizeChoice   = val;
        step2.hidden = true;
        step3.hidden = false;
      } else if (stepId === '3') {
        budgetChoice = val;
        showResult();
      }
    });

    var resetBtn = document.getElementById('match-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        styleChoice = null; sizeChoice = null; budgetChoice = null;
        steps.querySelectorAll('[aria-pressed]').forEach(function (b) {
          b.removeAttribute('aria-pressed');
        });
        result.hidden = true;
        steps.hidden  = false;
        step1.hidden  = false;
        step2.hidden  = true;
        step3.hidden  = true;
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
