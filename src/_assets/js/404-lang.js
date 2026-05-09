(function () {
  var ref = document.referrer || '';
  var lang = navigator.language || navigator.userLanguage || '';
  var isEn = ref.indexOf('/en/') !== -1 || lang.toLowerCase().startsWith('en');
  if (isEn) {
    document.getElementById('err-da').hidden = true;
    document.getElementById('err-en').hidden = false;
    document.getElementById('btn-da').hidden = true;
    document.getElementById('btn-en').hidden = false;
  }
})();
