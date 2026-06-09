(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let heroIndex = 0;

  function showHero(index) {
    if (!slides.length) return;
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === heroIndex);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === heroIndex);
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showHero(i);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showHero(heroIndex + 1);
    }, 5600);
  }

  const filterInput = document.querySelector('[data-filter-input]');
  const yearFilter = document.querySelector('[data-year-filter]');
  const typeFilter = document.querySelector('[data-type-filter]');
  const cards = Array.from(document.querySelectorAll('[data-card]'));
  const emptyState = document.querySelector('[data-empty-state]');

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function applyFilters() {
    if (!cards.length) return;
    const query = normalize(filterInput ? filterInput.value : '');
    const yearValue = yearFilter ? yearFilter.value : '';
    const typeValue = normalize(typeFilter ? typeFilter.value : '');
    let visible = 0;

    cards.forEach(function (card) {
      const text = normalize([
        card.dataset.title,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.region,
        card.dataset.type,
        card.textContent
      ].join(' '));
      const cardYear = card.dataset.year || '';
      const cardType = normalize(card.dataset.type || '');
      const yearNumber = parseInt((cardYear.match(/\d{4}/) || ['0'])[0], 10);
      let ok = true;

      if (query && text.indexOf(query) === -1) ok = false;
      if (yearValue === 'classic' && yearNumber > 2014) ok = false;
      if (yearValue && yearValue !== 'classic' && cardYear.indexOf(yearValue) === -1) ok = false;
      if (typeValue && cardType.indexOf(typeValue) === -1 && text.indexOf(typeValue) === -1) ok = false;

      card.style.display = ok ? '' : 'none';
      if (ok) visible += 1;
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  }

  if (filterInput || yearFilter || typeFilter) {
    const params = new URLSearchParams(window.location.search);
    const preset = params.get('q');
    if (preset && filterInput) {
      filterInput.value = preset;
    }
    [filterInput, yearFilter, typeFilter].forEach(function (control) {
      if (control) control.addEventListener('input', applyFilters);
      if (control) control.addEventListener('change', applyFilters);
    });
    applyFilters();
  }
})();
