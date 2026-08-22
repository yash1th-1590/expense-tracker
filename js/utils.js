const Utils = (() => {

  function uid(prefix = 'id') {
    return (
      prefix +
      '_' +
      Date.now().toString(36) +
      Math.random().toString(36).slice(2, 8)
    );
  }


  function formatCurrency(amount) {
    const n = Number(amount) || 0;

    const sign = n < 0 ? '-' : '';
    const abs = Math.abs(n);

    return (
      sign +
      '₹' +
      abs.toLocaleString('en-IN', {
        maximumFractionDigits: 0
      })
    );
  }


  function formatCurrencyPrecise(amount) {
    const n = Number(amount) || 0;

    return (
      '₹' +
      n.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    );
  }


  function formatDate(dateStr) {
    if (!dateStr) return '';

    const d = new Date(dateStr);

    if (isNaN(d.getTime())) {
      return dateStr;
    }

    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }


  function formatDateShort(dateStr) {
    if (!dateStr) return '';

    const d = new Date(dateStr);

    if (isNaN(d.getTime())) {
      return dateStr;
    }

    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short'
    });
  }


  function todayISO() {
    const d = new Date();

    return (
      d.getFullYear() +
      '-' +
      String(d.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(d.getDate()).padStart(2, '0')
    );
  }


  function isSameMonth(dateStr, refDate = new Date()) {
    const d = new Date(dateStr);

    return (
      d.getFullYear() === refDate.getFullYear() &&
      d.getMonth() === refDate.getMonth()
    );
  }


  function monthKey(dateStr) {
    const d = new Date(dateStr);

    return (
      d.getFullYear() +
      '-' +
      String(d.getMonth() + 1).padStart(2, '0')
    );
  }


  function monthLabel(key) {
    const [year, month] = key.split('-').map(Number);

    return new Date(year, month - 1, 1).toLocaleDateString(
      'en-IN',
      {
        month: 'short',
        year: 'numeric'
      }
    );
  }


  function daysBetween(dateStr) {
    const target = new Date(dateStr);
    const now = new Date();

    target.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    return Math.round(
      (target - now) / 86400000
    );
  }


  function parseQuickAdd(text, categories) {

    if (!text || !text.trim()) {
      return null;
    }

    let working = text.trim();


    const amountMatch = working.match(
      /(\d+(?:\.\d+)?)/ 
    );

    const amount = amountMatch
      ? parseFloat(amountMatch[1])
      : null;


    if (amountMatch) {
      working = working.replace(
        amountMatch[0],
        ' '
      );
    }


    let dateISO = todayISO();


    if (/\byesterday\b/i.test(working)) {

      const d = new Date();

      d.setDate(d.getDate() - 1);

      dateISO =
        d.getFullYear() +
        '-' +
        String(d.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(d.getDate()).padStart(2, '0');

      working = working.replace(
        /\byesterday\b/i,
        ' '
      );

    } else if (/\btoday\b/i.test(working)) {

      working = working.replace(
        /\btoday\b/i,
        ' '
      );

    } else {

      const dateMatch = working.match(
        /\b(\d{4}-\d{2}-\d{2})\b/
      );

      if (dateMatch) {

        dateISO = dateMatch[1];

        working = working.replace(
          dateMatch[0],
          ' '
        );
      }
    }


    working = working
      .replace(/\s+/g, ' ')
      .trim();


    let categoryGuess = null;


    if (categories && categories.length) {

      const lower = working.toLowerCase();

      categoryGuess = categories.find(category =>
        lower.includes(
          category.name.toLowerCase()
        )
      );
    }


    return {
      amount,
      note:
        working ||
        (categoryGuess
          ? categoryGuess.name
          : 'Untitled'),

      dateISO,

      categoryGuess
    };
  }


  function escapeHTML(value) {

    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }


  function showToast(message) {

    const element =
      document.getElementById('toast');

    if (!element) return;

    element.textContent = message;

    element.classList.add('is-visible');

    clearTimeout(element._toastTimer);

    element._toastTimer = setTimeout(() => {

      element.classList.remove(
        'is-visible'
      );

    }, 2400);
  }


  return {

    uid,

    formatCurrency,

    formatCurrencyPrecise,

    formatDate,

    formatDateShort,

    todayISO,

    isSameMonth,

    monthKey,

    monthLabel,

    daysBetween,

    parseQuickAdd,

    escapeHTML,

    showToast
  };

})();