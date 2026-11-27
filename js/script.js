/* ==========================================================================
   CPE 104L · shared slide engine (vanilla JavaScript, no libraries)
   Used by every page: index.html (course hub) and labs/*.html (slide decks).

    1. Helpers & storage            8. Tracers (step through code + flowchart)
    2. Code highlighting            9. Seatwork timer
    3. Page chrome (top bar, …)    10. Quadrant checker (Labs 1–2)
    4. Slide navigation            11. Search (palette + home page)
    5. Toggles & keyboard          12. Home page (lab cards)
    6. Tabs, reveals, covers       13. Init
    7. Copy buttons

   Lab pages only need slides; this file builds the rest. See docs/AUTHORING.md.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- 1. Helpers & storage ---------- */
  var $ = function (sel, el) { return (el || document).querySelector(sel); };
  var $$ = function (sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); };
  var root = document.documentElement;
  var body = document.body;
  var COURSE = window.CPE104L_COURSE || { pages: [], parts: [] };
  var ROOT = body.getAttribute('data-root') || '';            /* '../' on lab pages, '' on the home page */
  var PAGE_ID = body.getAttribute('data-page') || '';

  var store = {
    get: function (key, fallback) {
      try { var v = localStorage.getItem('cpe104l.' + key); return v === null ? fallback : v; }
      catch (e) { return fallback; }
    },
    set: function (key, value) {
      try { localStorage.setItem('cpe104l.' + key, String(value)); } catch (e) { /* ignore */ }
    },
    remove: function (key) {
      try { localStorage.removeItem('cpe104l.' + key); } catch (e) { /* ignore */ }
    }
  };

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function fmt(n) {
    if (typeof n !== 'number' || !isFinite(n)) return String(n);
    return Number.isInteger(n) ? String(n) : String(Math.round(n * 10000) / 10000);
  }
  function svgIcon(path) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true">' + path + '</svg>';
  }
  var ICON = {
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    notes: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M2 12h2.5M19.5 12H22M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/>',
    full: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.4a2.5 2.5 0 1 1 3.6 2.3c-.8.4-1.2 1-1.2 1.8v.4M12 17.2v.1"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
    left: '<path d="M15 18l-6-6 6-6"/>',
    right: '<path d="M9 18l6-6-6-6"/>',
    home: '<path d="M4 11.5 12 5l8 6.5M6.5 9.8V19h11V9.8"/>',
    diamond: '<path d="M12 2.5 21.5 12 12 21.5 2.5 12Z"/>'
  };

  /* Course pages that have an HTML file (labs + orientation), in order */
  var DECKS = COURSE.pages.filter(function (p) { return p.file; });
  function pageById(id) { return COURSE.pages.filter(function (p) { return p.id === id; })[0]; }
  function pageHref(p, hash) { return ROOT + p.file + (hash ? '#' + hash : ''); }
  function pageLabel(p) { return p.kind === 'lab' ? 'Lab ' + p.num : p.short; }

  /* ---------- 2. Code highlighting ----------
     <pre class="code" data-pseudo>  plain-text pseudocode
     <pre class="code" data-cpp>     plain-text C++ (write < as &lt; and & as &amp;)
     Both get numbered lines (.ln[data-line]) that tracers can highlight. */
  var PSEUDO_KW = toSet('START END BEGIN INPUT READ ENTER GET OUTPUT DISPLAY WRITE PRINT SET COMPUTE CALCULATE IF THEN ELSE ENDIF WHILE ENDWHILE REPEAT UNTIL DO FOR ENDFOR ADD TO PROMPT AND OR NOT RETURN CALL FUNCTION ENDFUNCTION CASE ENDCASE');
  var CPP_KW = toSet('alignas auto bool break case catch char class const constexpr continue default delete do double else enum explicit extern false float for friend goto if inline int long mutable namespace new noexcept nullptr operator override private protected public return short signed sizeof static static_cast struct switch template this throw true try typedef typename union unsigned using virtual void volatile while final dynamic_cast const_cast reinterpret_cast');
  var CPP_LIB = toSet('std cout cin cerr endl string getline vector size_t setw setprecision fixed showpoint left right pow sqrt abs fabs ceil floor round max min swap to_string stoi stod length size append substr at push_back begin end sort rand srand time assert main printf scanf ios');

  function toSet(words) { return words.split(' ').reduce(function (a, w) { a[w] = true; return a; }, {}); }

  function highlightPseudo(line) {
    var re = /(\/\/.*$)|("[^"]*"?)|([A-Za-z_][A-Za-z0-9_]*)|(\d+(?:\.\d+)?)|(<>|>=|<=|==|!=|\*\*|[-+*\/%^=<>])|(\s+)|([\s\S])/g;
    var out = '', m;
    while ((m = re.exec(line)) !== null) {
      if (m[1]) out += '<span class="tk-com">' + esc(m[1]) + '</span>';
      else if (m[2]) out += '<span class="tk-str">' + esc(m[2]) + '</span>';
      else if (m[3]) out += PSEUDO_KW[m[3]] ? '<span class="tk-kw">' + m[3] + '</span>' : m[3];
      else if (m[4]) out += '<span class="tk-num">' + m[4] + '</span>';
      else if (m[5]) out += '<span class="tk-op">' + esc(m[5]) + '</span>';
      else out += esc(m[0]);
    }
    return out;
  }

  /* state.block = true while inside a multi-line /* comment */
  function highlightCpp(line, state) {
    var out = '', i = 0;
    if (state.block) {
      var endIdx = line.indexOf('*/');
      if (endIdx === -1) return '<span class="tk-com">' + esc(line) + '</span>';
      out += '<span class="tk-com">' + esc(line.slice(0, endIdx + 2)) + '</span>';
      i = endIdx + 2;
      state.block = false;
    }
    var rest = line.slice(i);
    if (/^\s*#/.test(rest)) {                                   /* preprocessor line */
      var pm = rest.match(/^(\s*#\s*\w+)(.*)$/);
      var tail = pm ? pm[2] : '';
      var cm = tail.indexOf('//');
      var comment = cm >= 0 ? tail.slice(cm) : '';
      if (cm >= 0) tail = tail.slice(0, cm);
      return out + '<span class="tk-pre">' + esc(pm ? pm[1] : rest) + '</span>' +
        (tail ? '<span class="tk-str">' + esc(tail) + '</span>' : '') +
        (comment ? '<span class="tk-com">' + esc(comment) + '</span>' : '');
    }
    var re = /(\/\/.*$)|(\/\*[\s\S]*?(?:\*\/|$))|("(?:\\.|[^"\\])*"?)|('(?:\\.|[^'\\])*'?)|([A-Za-z_][A-Za-z0-9_]*)|(\d+\.?\d*(?:[eE][-+]?\d+)?[fFuUlL]*)|(<<|>>|<=|>=|==|!=|&&|\|\||\+\+|--|\+=|-=|\*=|\/=|%=|->|::|[-+*\/%=<>!&|^~?:])|(\s+)|([\s\S])/g;
    var m;
    while ((m = re.exec(rest)) !== null) {
      if (m[1]) out += '<span class="tk-com">' + esc(m[1]) + '</span>';
      else if (m[2]) { out += '<span class="tk-com">' + esc(m[2]) + '</span>'; if (!/\*\/$/.test(m[2])) state.block = true; }
      else if (m[3] || m[4]) out += '<span class="tk-str">' + esc(m[3] || m[4]) + '</span>';
      else if (m[5]) out += CPP_KW[m[5]] ? '<span class="tk-kw">' + m[5] + '</span>' : (CPP_LIB[m[5]] ? '<span class="tk-lib">' + m[5] + '</span>' : m[5]);
      else if (m[6]) out += '<span class="tk-num">' + m[6] + '</span>';
      else if (m[7]) out += '<span class="tk-op">' + esc(m[7]) + '</span>';
      else out += esc(m[0]);
    }
    return out;
  }

  function renderCode(pre) {
    var cpp = pre.hasAttribute('data-cpp');
    var lines = pre.textContent.replace(/\r/g, '').replace(/\t/g, '    ').split('\n');
    while (lines.length && !lines[0].trim()) lines.shift();
    while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
    var indents = lines.filter(function (l) { return l.trim(); }).map(function (l) { return l.match(/^ */)[0].length; });
    var indent = indents.length ? Math.min.apply(null, indents) : 0;
    var state = { block: false };
    pre.setAttribute('data-source', lines.map(function (l) { return l.slice(indent); }).join('\n'));
    pre.innerHTML = lines.map(function (l, i) {
      var src = l.slice(indent);
      var html = cpp ? highlightCpp(src, state) : highlightPseudo(src);
      return '<span class="ln" data-line="' + (i + 1) + '">' + (html || ' ') + '</span>';
    }).join('');
    pre.classList.add('is-ready');
  }

  /* ---------- 3. Page chrome (built here so lab files stay short) ---------- */
  var isDeck = !!$('#deck');
  var currentPage = pageById(PAGE_ID);

  function buildChrome() {
    var app = $('#app');
    var stage = $('#stage');
    var deckIdx = DECKS.indexOf(currentPage);

    var switcher = '<option value="">Home · all labs</option>' + DECKS.map(function (p) {
      return '<option value="' + esc(p.id) + '"' + (p === currentPage ? ' selected' : '') + '>' +
        esc(pageLabel(p) + (p.kind === 'lab' ? ' · ' + p.title : '')) + '</option>';
    }).join('');

    app.insertAdjacentHTML('afterbegin',
      '<header class="topbar">' +
        '<button class="icon-btn" id="btn-menu" type="button" aria-controls="sidebar" aria-expanded="true" title="Slide list (M)">' + svgIcon(ICON.menu) + '<span class="sr-only">Toggle slide list</span></button>' +
        '<a class="brand" href="' + ROOT + 'index.html" title="All labs">' + '<svg class="brand-mark" viewBox="0 0 24 24" aria-hidden="true">' + ICON.diamond + '</svg><b>CPE 104L</b></a>' +
        '<label class="lab-switch"><span class="sr-only">Go to lab</span><select id="lab-switch">' + switcher + '</select></label>' +
        '<p class="topbar-title" id="topbar-title" aria-hidden="true"></p>' +
        '<div class="tools">' +
          '<button class="icon-btn labeled" id="btn-search" type="button" title="Search all labs (/ or Ctrl+K)">' + svgIcon(ICON.search) + '<span class="btn-label">Search</span><kbd class="kbd-hint">/</kbd></button>' +
          '<button class="icon-btn text-btn" id="btn-font-down" type="button" title="Smaller text (−)"><span aria-hidden="true">A−</span><span class="sr-only">Decrease text size</span></button>' +
          '<button class="icon-btn text-btn" id="btn-font-up" type="button" title="Larger text (+)"><span aria-hidden="true">A+</span><span class="sr-only">Increase text size</span></button>' +
          '<button class="icon-btn labeled" id="btn-notes" type="button" aria-pressed="false" title="Instructor notes (N)">' + svgIcon(ICON.notes) + '<span class="btn-label">Notes</span></button>' +
          '<button class="icon-btn" id="btn-theme" type="button" title="Light / dark mode (T)"><svg class="i-moon" viewBox="0 0 24 24" aria-hidden="true">' + ICON.moon + '</svg><svg class="i-sun" viewBox="0 0 24 24" aria-hidden="true">' + ICON.sun + '</svg><span class="sr-only">Toggle light or dark mode</span></button>' +
          '<button class="icon-btn" id="btn-fullscreen" type="button" title="Full screen (F)">' + svgIcon(ICON.full) + '<span class="sr-only">Toggle full screen</span></button>' +
          '<button class="icon-btn" id="btn-help" type="button" title="Keyboard shortcuts (?)">' + svgIcon(ICON.help) + '<span class="sr-only">Keyboard shortcuts</span></button>' +
        '</div>' +
      '</header>' +
      '<nav class="sidebar" id="sidebar" aria-label="Slides">' +
        (currentPage ? '<div class="sidebar-lab"><span class="badge-lab">' + esc(pageLabel(currentPage)) + '</span><span class="badge-week">Week ' + esc(currentPage.week) + '</span>' +
          '<p class="sidebar-lab-title">' + esc(currentPage.title) + '</p>' +
          '<a class="sidebar-home" href="' + ROOT + 'index.html">' + svgIcon(ICON.home) + 'All labs</a></div>' : '') +
        '<p class="sidebar-head">Slides</p><div id="toc"></div>' +
      '</nav>' +
      '<div class="backdrop" id="backdrop" hidden></div>');

    stage.insertAdjacentHTML('beforeend',
      '<section class="notes-panel" id="notes-panel" aria-label="Instructor notes" hidden>' +
        '<div class="notes-head"><span class="notes-title">Instructor Notes</span><button type="button" class="btn ghost tiny" id="notes-close">Hide (N)</button></div>' +
        '<div class="notes-body" id="notes-body"></div>' +
      '</section>');

    var prevLab = deckIdx > 0 ? DECKS[deckIdx - 1] : null;
    var nextLab = deckIdx >= 0 && deckIdx < DECKS.length - 1 ? DECKS[deckIdx + 1] : null;
    app.insertAdjacentHTML('beforeend',
      '<footer class="controls">' +
        '<button class="nav-btn" id="btn-prev" type="button" title="Previous slide (←)">' + svgIcon(ICON.left) + '<span>Prev</span></button>' +
        '<div class="progress-area">' +
          '<div class="progress" aria-hidden="true"><span id="progress-bar"></span></div>' +
          '<label class="jump"><span class="sr-only">Jump to slide</span><select id="jump"></select></label>' +
        '</div>' +
        '<button class="nav-btn" id="btn-next" type="button" title="Next slide (→)"><span>Next</span>' + svgIcon(ICON.right) + '</button>' +
        (nextLab ? '<a class="nav-btn next-lab" id="next-lab" href="' + pageHref(nextLab) + '" hidden title="Next lab (])"><span>' + esc(pageLabel(nextLab)) + '</span>' + svgIcon(ICON.right) + '</a>' : '') +
      '</footer>');

    body.insertAdjacentHTML('afterbegin', '<a class="skip-link" href="#deck">Skip to slides</a>');
    body.insertAdjacentHTML('beforeend', helpDialogHTML() + paletteHTML() +
      '<div class="blackout" id="blackout" hidden><span>Press B to return</span></div>' +
      '<p class="sr-only" id="announcer" aria-live="polite"></p>');

    $('#lab-switch').addEventListener('change', function (e) {
      var p = pageById(e.target.value);
      location.href = p ? pageHref(p) : ROOT + 'index.html';
    });
    if (prevLab) body.setAttribute('data-prev-lab', pageHref(prevLab));
    if (nextLab) body.setAttribute('data-next-lab', pageHref(nextLab));
  }

  function helpDialogHTML() {
    var rows = [
      ['<kbd>→</kbd> <kbd>PgDn</kbd>', 'Next slide'], ['<kbd>←</kbd> <kbd>PgUp</kbd>', 'Previous slide'],
      ['<kbd>Home</kbd> <kbd>End</kbd>', 'First / last slide'], ['<kbd>[</kbd> <kbd>]</kbd>', 'Previous / next lab'],
      ['<kbd>/</kbd> or <kbd>Ctrl</kbd>+<kbd>K</kbd>', 'Search all labs'], ['<kbd>N</kbd>', 'Instructor notes'],
      ['<kbd>M</kbd>', 'Slide list'], ['<kbd>T</kbd>', 'Light / dark mode'], ['<kbd>F</kbd>', 'Full screen'],
      ['<kbd>B</kbd> or <kbd>.</kbd>', 'Blank the screen'], ['<kbd>+</kbd> <kbd>−</kbd> <kbd>0</kbd>', 'Text bigger / smaller / reset'],
      ['<kbd>?</kbd>', 'This help']
    ];
    return '<dialog class="help" id="help-dialog" aria-labelledby="help-title"><h2 id="help-title">Keyboard shortcuts</h2>' +
      '<table class="table compact"><tbody>' + rows.map(function (r) { return '<tr><th scope="row">' + r[0] + '</th><td>' + r[1] + '</td></tr>'; }).join('') + '</tbody></table>' +
      '<p class="small muted">Presentation clickers that send PageUp/PageDown or arrow keys also work. On a tablet, swipe left or right.</p>' +
      '<form method="dialog"><button class="btn primary" type="submit">Close</button></form></dialog>';
  }

  function paletteHTML() {
    return '<div class="palette" id="palette" hidden>' +
      '<div class="palette-box" role="dialog" aria-modal="true" aria-label="Search all labs">' +
        '<div class="palette-input">' + svgIcon(ICON.search) +
          '<input id="palette-q" type="search" placeholder="Search labs, slides, topics… (try: pointer, switch, lab 7)" autocomplete="off" spellcheck="false" aria-controls="palette-results">' +
          '<kbd>Esc</kbd></div>' +
        '<ul class="search-results" id="palette-results" role="listbox"></ul>' +
        '<p class="palette-foot"><kbd>↑</kbd> <kbd>↓</kbd> move · <kbd>Enter</kbd> open · <kbd>Esc</kbd> close</p>' +
      '</div></div>';
  }

  /* ---------- 4. Slide navigation ---------- */
  var app, deck, slides = [], current = -1, tocLinks = [], jump, notesPanel, notesBody, announcer;

  function slideTitle(s) { return s.getAttribute('data-title') || ('Slide ' + (slides.indexOf(s) + 1)); }

  function buildToc() {
    var groups = [];
    slides.forEach(function (s, i) {
      var name = s.getAttribute('data-section') || 'Slides';
      var g = groups[groups.length - 1];
      if (!g || g.name !== name) { g = { name: name, items: [] }; groups.push(g); }
      g.items.push(i);
    });
    $('#toc').innerHTML = groups.map(function (g) {
      return '<div class="toc-group"><p class="toc-group-title">' + esc(g.name) + '</p><ol class="toc-list">' +
        g.items.map(function (i) {
          return '<li><a href="#' + slides[i].id + '" data-index="' + i + '"><span class="n">' + (i + 1) +
            '</span><span>' + esc(slideTitle(slides[i])) + '</span></a></li>';
        }).join('') + '</ol></div>';
    }).join('');
    tocLinks = $$('#toc a');
    tocLinks.forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        go(Number(a.getAttribute('data-index')));
        if (isNarrow()) setSidebar(false);
      });
    });
    jump.innerHTML = slides.map(function (s, i) {
      return '<option value="' + i + '">' + (i + 1) + ' / ' + slides.length + ' · ' + esc(slideTitle(s)) + '</option>';
    }).join('');
  }

  function go(i, opts) {
    opts = opts || {};
    if (!slides.length) return;
    i = Math.max(0, Math.min(slides.length - 1, i));
    if (i === current) return;
    if (current >= 0) { slides[current].classList.remove('is-active'); slides[current].setAttribute('aria-hidden', 'true'); }
    current = i;
    var s = slides[i];
    s.classList.add('is-active');
    s.removeAttribute('aria-hidden');
    deck.scrollTop = 0;

    tocLinks.forEach(function (a, k) { if (k === i) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
    if (tocLinks[i] && tocLinks[i].scrollIntoView) tocLinks[i].scrollIntoView({ block: 'nearest' });
    jump.value = String(i);
    $('#progress-bar').style.width = ((i + 1) / slides.length * 100) + '%';
    var last = i === slides.length - 1;
    $('#btn-prev').disabled = i === 0;
    $('#btn-next').disabled = last;
    var nl = $('#next-lab');
    if (nl) { nl.hidden = !last; $('#btn-next').hidden = last; }
    $('#topbar-title').textContent = slideTitle(s);
    document.title = slideTitle(s) + ' · ' + (currentPage ? pageLabel(currentPage) + ' · ' : '') + 'CPE 104L';

    var notes = $('.notes', s);
    notesBody.innerHTML = notes ? notes.innerHTML : '<p class="muted">No notes for this slide.</p>';
    notesPanel.scrollTop = 0;

    if (!opts.fromHash && history.replaceState) history.replaceState(null, '', '#' + s.id);
    announcer.textContent = 'Slide ' + (i + 1) + ' of ' + slides.length + ': ' + slideTitle(s);
    document.dispatchEvent(new CustomEvent('deck:change', { detail: { index: i } }));
  }

  function indexFromHash() {
    var id = decodeURIComponent(location.hash.replace(/^#/, ''));
    if (!id) return -1;
    var el = document.getElementById(id);
    if (!el) return -1;
    var slide = el.classList.contains('slide') ? el : el.closest('.slide');
    return slide ? slides.indexOf(slide) : -1;
  }
  function next() { go(current + 1); }
  function prev() { go(current - 1); }

  /* ---------- 5. Toggles & keyboard ---------- */
  var mqNarrow = window.matchMedia('(max-width: 1100px)');
  function isNarrow() { return mqNarrow.matches; }
  function sidebarVisible() { return isNarrow() ? app.classList.contains('sidebar-open') : !app.classList.contains('sidebar-collapsed'); }
  function setSidebar(open) {
    if (isNarrow()) { app.classList.toggle('sidebar-open', open); $('#backdrop').hidden = !open; }
    else { app.classList.toggle('sidebar-collapsed', !open); store.set('sidebar', open ? 'open' : 'closed'); }
    $('#btn-menu').setAttribute('aria-expanded', String(sidebarVisible()));
  }
  function toggleSidebar() { setSidebar(!sidebarVisible()); }

  function setNotes(on) {
    app.classList.toggle('show-notes', on);
    notesPanel.hidden = !on;
    $('#btn-notes').setAttribute('aria-pressed', String(on));
    store.set('notes', on ? 'on' : 'off');
  }
  function toggleNotes() { setNotes(notesPanel.hidden); }

  function currentTheme() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';   /* light by default */
  }
  function toggleTheme() {
    var t = currentTheme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', t);
    store.set('theme', t);
  }

  var scale = Number(store.get('scale', '1')) || 1;
  function setScale(s) {
    scale = Math.round(Math.max(0.7, Math.min(1.8, s)) * 10) / 10;
    root.style.setProperty('--scale', String(scale));
    store.set('scale', scale);
  }
  function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) { if (root.requestFullscreen) root.requestFullscreen(); }
      else if (document.exitFullscreen) document.exitFullscreen();
    } catch (e) { /* unsupported */ }
  }
  function toggleBlackout() { var b = $('#blackout'); b.hidden = !b.hidden; }
  function openHelp() {
    var help = $('#help-dialog');
    if (help.open) return;
    if (typeof help.showModal === 'function') help.showModal(); else help.setAttribute('open', '');
  }
  function isTyping(el) { return !!(el && el.closest && el.closest('input, textarea, select, [contenteditable="true"]')); }

  function onDeckKey(e) {
    if (e.defaultPrevented || e.altKey || e.metaKey) return;
    if (e.ctrlKey) { if (e.key === 'k' || e.key === 'K') { e.preventDefault(); openPalette(); } return; }
    if ($('#help-dialog').open || !$('#palette').hidden) return;
    if (isTyping(e.target)) return;
    var bo = $('#blackout');
    if (!bo.hidden && 'bB.'.indexOf(e.key) === -1 && e.key !== 'Escape') return;
    switch (e.key) {
      case 'ArrowRight': case 'PageDown': next(); break;
      case 'ArrowLeft': case 'PageUp': prev(); break;
      case 'Home': go(0); break;
      case 'End': go(slides.length - 1); break;
      case '[': if (body.getAttribute('data-prev-lab')) location.href = body.getAttribute('data-prev-lab'); break;
      case ']': if (body.getAttribute('data-next-lab')) location.href = body.getAttribute('data-next-lab'); break;
      case '/': openPalette(); break;
      case 'n': case 'N': toggleNotes(); break;
      case 'm': case 'M': toggleSidebar(); break;
      case 't': case 'T': toggleTheme(); break;
      case 'f': case 'F': toggleFullscreen(); break;
      case 'b': case 'B': case '.': toggleBlackout(); break;
      case '+': case '=': setScale(scale + 0.1); break;
      case '-': case '_': setScale(scale - 0.1); break;
      case '0': setScale(1); break;
      case '?': openHelp(); break;
      case 'Escape':
        if (!bo.hidden) toggleBlackout();
        else if (isNarrow() && sidebarVisible()) setSidebar(false);
        else return;
        break;
      default: return;
    }
    e.preventDefault();
  }

  function initSwipe() {
    var sx = null, sy = null;
    deck.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'touch') return;
      if (e.target.closest('.code, .console, .table-wrap, input, select, button, .plane, summary')) return;
      sx = e.clientX; sy = e.clientY;
    });
    deck.addEventListener('pointerup', function (e) {
      if (sx === null) return;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      sx = null;
      if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.6) { if (dx < 0) next(); else prev(); }
    });
    deck.addEventListener('pointercancel', function () { sx = null; });
  }

  /* ---------- 6. Tabs, reveal steps, flowchart cover ---------- */
  function initTabs(box) {
    var tabs = $$('[role="tab"]', box);
    var panels = $$('[role="tabpanel"]', box);
    function activate(name, focus) {
      tabs.forEach(function (t) {
        var on = t.getAttribute('data-tab') === name;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        if (on && focus) t.focus();
      });
      panels.forEach(function (p) { p.hidden = p.getAttribute('data-panel') !== name; });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { activate(t.getAttribute('data-tab')); });
      t.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault(); e.stopPropagation();
        var n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
        activate(n.getAttribute('data-tab'), true);
      });
    });
    var sel = tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || tabs[0];
    if (sel) activate(sel.getAttribute('data-tab'));
    box._activate = activate;
  }
  function revealInTabs(el) {
    var panel = el && el.closest('[role="tabpanel"]');
    var box = panel && panel.closest('[data-tabs]');
    if (box && box._activate && panel.hidden) box._activate(panel.getAttribute('data-panel'));
    var det = el && el.closest('details');
    if (det && !det.open) det.open = true;
  }
  function initReveal(box) {
    var items = $$('[data-step]', box);
    var nextBtn = $('[data-reveal-next]', box);
    var resetBtn = $('[data-reveal-reset]', box);
    var shown = 0;
    function update() {
      items.forEach(function (it, i) { it.hidden = i >= shown; });
      if (nextBtn) { nextBtn.disabled = shown >= items.length; nextBtn.textContent = shown >= items.length ? 'All steps shown' : 'Show next step'; }
    }
    if (nextBtn) nextBtn.addEventListener('click', function () { shown++; update(); });
    if (resetBtn) resetBtn.addEventListener('click', function () { shown = 0; update(); });
    update();
  }
  function initCoverToggles(scope) {
    $$('[data-cover-toggle]', scope).forEach(function (btn) {
      var card = btn.closest('.chart-card, .card, figure');
      btn.addEventListener('click', function () {
        var covered = card.classList.toggle('is-covered');
        btn.textContent = covered ? 'Show' : 'Hide';
      });
    });
  }

  /* ---------- 7. Copy buttons on C++ code ---------- */
  function addCopyButton(pre) {
    if (pre.hasAttribute('data-nocopy')) return;
    var wrap = document.createElement('div');
    wrap.className = 'code-wrap';
    pre.parentNode.insertBefore(wrap, pre);
    wrap.appendChild(pre);
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'copy-btn'; b.textContent = 'Copy';
    b.setAttribute('aria-label', 'Copy code');
    wrap.appendChild(b);
    b.addEventListener('click', function () {
      var text = pre.getAttribute('data-source') || pre.textContent;
      var done = function () { b.textContent = 'Copied!'; setTimeout(function () { b.textContent = 'Copy'; }, 1400); };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fallback);
      else fallback();
      function fallback() {
        var ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); done(); } catch (e) { b.textContent = 'Select & copy'; }
        ta.remove();
      }
    });
  }

  /* ---------- 8. Tracers ----------
     Lab scripts register traces:  CPE104L.addTrace('name', function (input, t) { … });
       t.step(node, line, message[, output])  one step (node = flowchart data-node or null)
       t.input(node, line, message, typed)     a cin step: shows what the user typed
       t.vars.x = 5                            variables shown in the Memory panel
     Output text is printed exactly as given, so include '\n' where the program prints a newline. */
  function Trace() { this.steps = []; this.vars = {}; }
  Trace.prototype.step = function (node, line, msg, out) {
    this.steps.push({ node: node, line: line, msg: msg, out: out, vars: Object.assign({}, this.vars) });
    return this;
  };
  Trace.prototype.input = function (node, line, msg, typed) {
    this.steps.push({ node: node, line: line, msg: msg, echo: String(typed) + '\n', vars: Object.assign({}, this.vars) });
    return this;
  };

  /* Format a double the way `cout << x` does by default (6 significant digits, like %g).
     Use it in traces so tracer output matches the real compiled program. */
  function coutNum(n) {
    if (typeof n !== 'number') return String(n);
    if (isNaN(n)) return 'nan';
    if (!isFinite(n)) return n > 0 ? 'inf' : '-inf';
    if (n === 0) return '0';
    var p = 6;
    var exp = Number(n.toExponential(p - 1).split('e')[1]);
    if (exp < -4 || exp >= p) {
      var parts = n.toExponential(p - 1).split('e');
      var e = Number(parts[1]);
      return parts[0].replace(/\.?0+$/, '') + 'e' + (e < 0 ? '-' : '+') + (Math.abs(e) < 10 ? '0' : '') + Math.abs(e);
    }
    var s = n.toFixed(Math.max(0, p - 1 - exp));
    return s.indexOf('.') >= 0 ? s.replace(/\.?0+$/, '') : s;
  }

  var TRACES = {};
  window.CPE104L = {
    addTrace: function (name, fn) { TRACES[name] = fn; },
    Trace: Trace,
    fmt: fmt,
    cout: coutNum,
    /* C.raw('0x7ffd10 (&x)') shows a value in the Memory panel without quotes (addresses, chars like 'D') */
    raw: function (s) { return { raw: String(s), toJSON: function () { return this.raw; } }; }
  };

  var SPEEDS = [['Slow', 1400], ['Normal', 800], ['Fast', 250], ['Turbo', 50]];

  function initTracer(el) {
    var key = el.getAttribute('data-trace');
    var jsonEl = $('script[type="application/json"]', el);
    var code = el.getAttribute('data-code') ? $(el.getAttribute('data-code')) : null;
    var chart = el.getAttribute('data-chart') ? $(el.getAttribute('data-chart')) : null;
    var defaultSpeed = Number(el.getAttribute('data-speed')) || 800;

    var inputsBox = $('.tracer-inputs', el);
    var top = document.createElement('div');
    top.className = 'tracer-top';
    top.innerHTML = '<p class="tracer-title">' + esc(el.getAttribute('data-title') || 'Trace it live') + '</p>';
    if (inputsBox) top.appendChild(inputsBox);
    el.insertBefore(top, el.firstChild);

    var closest = SPEEDS.reduce(function (a, b) { return Math.abs(b[1] - defaultSpeed) < Math.abs(a[1] - defaultSpeed) ? b : a; });
    el.insertAdjacentHTML('beforeend',
      '<div class="tracer-controls">' +
        '<button type="button" class="btn" data-act="step">Step ▸</button>' +
        '<button type="button" class="btn primary" data-act="play">Play</button>' +
        '<button type="button" class="btn" data-act="finish">Run to end</button>' +
        '<button type="button" class="btn ghost" data-act="reset">Reset</button>' +
        '<label class="speed">Speed <select data-speed-select>' + SPEEDS.map(function (s) {
          return '<option value="' + s[1] + '"' + (s === closest ? ' selected' : '') + '>' + s[0] + '</option>';
        }).join('') + '</select></label>' +
      '</div>' +
      '<p class="tracer-status" aria-live="polite"></p>' +
      '<div class="tracer-io">' +
        '<div><span class="io-label">Memory (variables)</span><dl class="vars-out"></dl></div>' +
        '<div><span class="io-label">Output</span><pre class="console-out"></pre></div>' +
      '</div>');

    var status = $('.tracer-status', el), varsOut = $('.vars-out', el), consoleOut = $('.console-out', el);
    var playBtn = $('[data-act="play"]', el), speedSel = $('[data-speed-select]', el);
    var IDLE = inputsBox ? 'Set the input values, then press Step (one at a time) or Play.' : 'Press Step to go one step at a time, or Play to animate.';
    var steps = null, idx = -1, timer = null;

    function readInputs() {
      var vals = {};
      $$('[data-var]', el).forEach(function (inp) {
        var raw = inp.value;
        var name = inp.getAttribute('data-var');
        if (inp.getAttribute('data-type') === 'text') { vals[name] = raw; return; }
        if (raw.trim() === '' || isNaN(Number(raw))) throw new Error('Enter a number for ' + name + '.');
        vals[name] = Number(raw);
      });
      return vals;
    }
    function ensureSteps() {
      if (steps) return true;
      try {
        if (key) {
          if (!TRACES[key]) throw new Error('No trace named "' + key + '" is registered (check this lab\'s js/labs file).');
          var t = new Trace();
          var ret = TRACES[key](readInputs(), t);
          steps = Array.isArray(ret) ? ret : t.steps;
        } else if (jsonEl) {
          steps = JSON.parse(jsonEl.textContent);
        } else throw new Error('This tracer has no data-trace name or JSON steps.');
        if (!steps.length) throw new Error('The trace produced no steps.');
        status.classList.remove('is-error');
        if (code) revealInTabs(code);
        if (chart) revealInTabs(chart);
        return true;
      } catch (err) {
        steps = null;
        status.textContent = '⚠ ' + err.message;
        status.classList.add('is-error');
        return false;
      }
    }
    function clearMarks() {
      if (code) $$('.ln.is-active', code).forEach(function (l) { l.classList.remove('is-active'); });
      if (chart) $$('[data-node]', chart).forEach(function (n) { n.classList.remove('is-active', 'is-visited'); });
    }
    function render() {
      clearMarks();
      if (!steps || idx < 0) return;
      var st = steps[idx];
      if (code && st.line) {
        var ln = $('.ln[data-line="' + st.line + '"]', code);
        if (ln) {
          ln.classList.add('is-active');
          var box = code;
          if (box.scrollHeight > box.clientHeight + 4) box.scrollTop = Math.max(0, ln.offsetTop - box.clientHeight / 2);
        }
      }
      if (chart) {
        for (var k = 0; k <= idx; k++) {
          if (!steps[k].node) continue;
          var v = $('[data-node="' + steps[k].node + '"]', chart);
          if (v) v.classList.add('is-visited');
        }
        if (st.node) { var a = $('[data-node="' + st.node + '"]', chart); if (a) a.classList.add('is-active'); }
      }
      status.textContent = 'Step ' + (idx + 1) + ' of ' + steps.length + ': ' + st.msg;
      var prevVars = idx > 0 ? steps[idx - 1].vars || {} : {};
      var vars = st.vars || {};
      var names = Object.keys(vars);
      varsOut.innerHTML = names.length ? names.map(function (n) {
        var val = vars[n];
        var shown = (val && typeof val === 'object' && val.raw !== undefined) ? val.raw :
          (typeof val === 'string' ? '"' + val + '"' : (Array.isArray(val) ? '{' + val.map(fmt).join(', ') + '}' : fmt(val)));
        var changed = JSON.stringify(prevVars[n]) !== JSON.stringify(val);
        return '<dt>' + esc(n) + '</dt><dd' + (changed ? ' class="changed"' : '') + '>' + esc(shown) + '</dd>';
      }).join('') : '<span class="vars-empty">(no variables yet)</span>';
      var html = '';
      for (var j = 0; j <= idx; j++) {
        if (steps[j].out !== undefined && steps[j].out !== null) html += esc(steps[j].out);
        if (steps[j].echo) html += '<span class="in">' + esc(steps[j].echo) + '</span>';
      }
      consoleOut.innerHTML = html;
      consoleOut.scrollTop = consoleOut.scrollHeight;
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } playBtn.textContent = 'Play'; }
    function step() {
      if (!ensureSteps()) return;
      if (idx < steps.length - 1) { idx++; render(); }
      if (idx >= steps.length - 1) stop();
    }
    function play() {
      if (timer) { stop(); return; }
      if (!ensureSteps()) return;
      if (idx >= steps.length - 1) idx = -1;
      playBtn.textContent = 'Pause';
      step();
      timer = setInterval(step, Number(speedSel.value));
    }
    function finish() { stop(); if (!ensureSteps()) return; idx = steps.length - 1; render(); }
    function reset() {
      stop(); steps = null; idx = -1; clearMarks();
      status.textContent = IDLE; status.classList.remove('is-error');
      varsOut.innerHTML = '<span class="vars-empty">(no variables yet)</span>';
      consoleOut.innerHTML = '';
    }
    el.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]');
      if (!b) return;
      var act = b.getAttribute('data-act');
      if (act === 'step') { stop(); step(); }
      else if (act === 'play') play();
      else if (act === 'finish') finish();
      else if (act === 'reset') reset();
    });
    speedSel.addEventListener('change', function () {
      if (timer) { clearInterval(timer); timer = setInterval(step, Number(speedSel.value)); }
    });
    $$('[data-var]', el).forEach(function (inp) {
      inp.addEventListener('input', reset);
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); finish(); } });
    });
    document.addEventListener('deck:change', stop);
    reset();
  }

  /* ---------- 9. Seatwork timer ---------- */
  function initTimer(el) {
    var display = $('.timer-display', el);
    var toggleBtn = $('[data-timer-act="toggle"]', el);
    var total = (Number(el.getAttribute('data-minutes')) || 10) * 60;
    var remaining = total, endAt = 0, tick = null;
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function render() {
      display.textContent = pad(Math.floor(remaining / 60)) + ':' + pad(remaining % 60);
      el.classList.toggle('is-running', !!tick);
      el.classList.toggle('is-low', remaining > 0 && remaining <= 60);
      el.classList.toggle('is-done', remaining === 0);
      toggleBtn.textContent = tick ? 'Pause' : (remaining === total ? 'Start' : (remaining === 0 ? 'Restart' : 'Resume'));
    }
    function beep() {
      try {
        var Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        var ctx = new Ctx();
        [0, 0.35, 0.7].forEach(function (o) {
          var osc = ctx.createOscillator(), g = ctx.createGain();
          osc.type = 'sine'; osc.frequency.value = 880;
          g.gain.setValueAtTime(0.0001, ctx.currentTime + o);
          g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + o + 0.02);
          g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + o + 0.28);
          osc.connect(g); g.connect(ctx.destination);
          osc.start(ctx.currentTime + o); osc.stop(ctx.currentTime + o + 0.3);
        });
        setTimeout(function () { if (ctx.close) ctx.close(); }, 1500);
      } catch (e) { /* no audio */ }
    }
    function pause() { clearInterval(tick); tick = null; render(); }
    function start() {
      if (remaining === 0) remaining = total;
      endAt = Date.now() + remaining * 1000;
      tick = setInterval(function () {
        remaining = Math.max(0, Math.round((endAt - Date.now()) / 1000));
        if (remaining === 0) { pause(); beep(); } else render();
      }, 250);
      render();
    }
    toggleBtn.addEventListener('click', function () { if (tick) pause(); else start(); });
    $('[data-timer-act="reset"]', el).addEventListener('click', function () { pause(); remaining = total; render(); });
    $$('[data-min]', el).forEach(function (b) {
      b.addEventListener('click', function () { pause(); total = Number(b.getAttribute('data-min')) * 60; remaining = total; render(); });
    });
    render();
  }

  /* ---------- 10. Quadrant checker (Battlefield Coordinates, Labs 1–2) ---------- */
  function classify(x, y) {
    if (x === 0 && y === 0) return { label: 'Origin', q: 0 };
    if (x > 0 && y > 0) return { label: 'Quadrant 1', q: 1 };
    if (x < 0 && y > 0) return { label: 'Quadrant 2', q: 2 };
    if (x < 0 && y < 0) return { label: 'Quadrant 3', q: 3 };
    if (x > 0 && y < 0) return { label: 'Quadrant 4', q: 4 };
    return { label: (x === 0 ? 'On the y-axis' : 'On the x-axis') + ' (not one of the five required outputs)', q: -1 };
  }
  function initChecker(el) {
    var xIn = $('[data-coord="x"]', el), yIn = $('[data-coord="y"]', el);
    var out = $('.checker-out', el), plane = $('.plane', el), pt = $('.pt', el);
    var UNIT = 26, O = 170, LIM = 5.6;
    function plot(x, y, q) {
      $$('.q', plane).forEach(function (r) { r.classList.toggle('is-hit', Number(r.getAttribute('data-q')) === q); });
      var px = O + Math.max(-LIM, Math.min(LIM, x)) * UNIT;
      var py = O - Math.max(-LIM, Math.min(LIM, y)) * UNIT;
      var c = $('circle', pt), t = $('text', pt);
      c.setAttribute('cx', px); c.setAttribute('cy', py);
      t.setAttribute('x', Math.max(40, Math.min(300, px)));
      t.setAttribute('y', (py <= O && py >= 50) || py > 290 ? py - 20 : py + 22);
      t.textContent = '(' + fmt(x) + ', ' + fmt(y) + ')';
      pt.removeAttribute('hidden');           /* SVG elements have no .hidden property */
    }
    function check() {
      var xr = xIn.value.trim(), yr = yIn.value.trim();
      if (xr === '' || yr === '' || isNaN(Number(xr)) || isNaN(Number(yr))) { out.textContent = 'Please enter numbers for both x and y.'; return; }
      var x = Number(xr), y = Number(yr), r = classify(x, y);
      out.textContent = 'Enter x and y: ' + fmt(x) + ' ' + fmt(y) + '\n' + r.label;
      plot(x, y, r.q);
    }
    $('[data-check]', el).addEventListener('click', check);
    [xIn, yIn].forEach(function (inp) { inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } }); });
    $$('[data-sample]', el).forEach(function (b) {
      b.addEventListener('click', function () { var p = b.getAttribute('data-sample').split(' '); xIn.value = p[0]; yIn.value = p[1]; check(); });
    });
  }

  /* ---------- 11. Search ----------
     Sources: the course catalog (js/course.js), the generated slide index
     (js/search-index.js, rebuilt with `node tools/build-search-index.js`), and,
     on a lab page, that page's own slides read live from the DOM. */
  var searchEntries = null;

  function buildSearchEntries() {
    var entries = [];
    COURSE.pages.forEach(function (p) {
      if (!p.file) return;
      entries.push({
        type: 'page', page: p.id, label: pageLabel(p), title: p.title, section: 'Week ' + p.week,
        text: (p.topics || []).join(' · ') + ' ' + (p.ilos || []).join(' '), href: pageHref(p), local: false
      });
    });
    var idx = window.CPE104L_SEARCH || [];
    idx.forEach(function (s) {
      if (isDeck && s.page === PAGE_ID) return;   /* current page comes from the live DOM instead */
      var p = pageById(s.page);
      if (!p) return;
      entries.push({ type: 'slide', page: s.page, label: pageLabel(p), title: s.title, section: s.section, text: s.text, href: pageHref(p, s.id), local: false });
    });
    if (isDeck) {
      slides.forEach(function (s, i) {
        var clone = s.cloneNode(true);
        $$('.notes, script, svg', clone).forEach(function (n) { n.remove(); });
        entries.push({
          type: 'slide', page: PAGE_ID, label: currentPage ? pageLabel(currentPage) : 'This lab',
          title: slideTitle(s), section: s.getAttribute('data-section') || '',
          text: clone.textContent.replace(/\s+/g, ' ').trim().slice(0, 1500), href: '#' + s.id, local: true, index: i
        });
      });
    }
    entries.forEach(function (e) {
      e.hay = (e.label + ' ' + e.title + ' ' + e.section + ' ' + e.text).toLowerCase();
      e.titleL = e.title.toLowerCase();
    });
    return entries;
  }

  function runSearch(q, limit) {
    if (!searchEntries) searchEntries = buildSearchEntries();
    q = q.trim().toLowerCase();
    if (!q) return [];
    var labOnly = q.match(/^lab\s*(\d{1,2})$/);
    if (labOnly) {
      var pid = 'lab-' + (labOnly[1].length === 1 ? '0' : '') + labOnly[1];
      return searchEntries.filter(function (e) { return e.page === pid; }).slice(0, limit || 40);
    }
    var terms = q.split(/\s+/).filter(Boolean);
    var scored = [];
    searchEntries.forEach(function (e) {
      var score = 0;
      for (var i = 0; i < terms.length; i++) {
        var t = terms[i];
        if (e.hay.indexOf(t) === -1) return;
        if (e.titleL.indexOf(t) !== -1) score += 10;
        if (e.section.toLowerCase().indexOf(t) !== -1) score += 4;
        score += 1;
      }
      if (e.titleL.indexOf(q) === 0) score += 6;
      if (e.type === 'page') score += 4;
      if (e.local) score += 2;
      scored.push({ e: e, s: score });
    });
    scored.sort(function (a, b) { return b.s - a.s; });
    return scored.slice(0, limit || 40).map(function (x) { return x.e; });
  }

  function snippet(e, q) {
    var terms = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    var text = e.text || '';
    var lower = text.toLowerCase();
    var pos = -1;
    terms.forEach(function (t) { var p = lower.indexOf(t); if (p !== -1 && (pos === -1 || p < pos)) pos = p; });
    var start = Math.max(0, pos - 40);
    var s = (start > 0 ? '…' : '') + text.slice(start, start + 130) + (start + 130 < text.length ? '…' : '');
    return highlightTerms(s, terms);
  }
  function highlightTerms(s, terms) {
    var html = esc(s);
    terms.filter(function (t) { return t.length > 1; }).forEach(function (t) {
      html = html.replace(new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'), '<mark>$1</mark>');
    });
    return html;
  }
  function resultHTML(e, q) {
    var terms = q.trim().toLowerCase().split(/\s+/);
    return '<li role="option"><a href="' + esc(e.href) + '"' + (e.local ? ' data-local="' + e.index + '"' : '') + '>' +
      '<span class="r-label' + (e.type === 'page' ? ' is-page' : '') + '">' + esc(e.label) + '</span>' +
      '<span class="r-main"><span class="r-title">' + highlightTerms(e.title, terms) + '</span>' +
      (e.section ? '<span class="r-sec">' + esc(e.section) + '</span>' : '') +
      '<span class="r-snip">' + (e.type === 'page' ? esc((e.text || '').slice(0, 120)) : snippet(e, q)) + '</span></span></a></li>';
  }

  function initResultsNav(input, list, onPick) {
    var active = -1;
    function items() { return $$('li a', list); }
    function mark(i) {
      var its = items();
      its.forEach(function (a, k) { a.classList.toggle('is-active', k === i); a.parentNode.setAttribute('aria-selected', String(k === i)); });
      if (its[i]) its[i].scrollIntoView({ block: 'nearest' });
      active = i;
    }
    input.addEventListener('keydown', function (e) {
      var its = items();
      if (e.key === 'ArrowDown') { e.preventDefault(); mark(Math.min(its.length - 1, active + 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); mark(Math.max(0, active - 1)); }
      else if (e.key === 'Enter') { var a = its[active >= 0 ? active : 0]; if (a) { e.preventDefault(); onPick(a); } }
    });
    list.addEventListener('click', function (e) { var a = e.target.closest('a'); if (a) { e.preventDefault(); onPick(a); } });
    return { reset: function () { active = -1; } };
  }

  function pickResult(a) {
    var local = a.getAttribute('data-local');
    if (local !== null && isDeck) { closePalette(); go(Number(local)); return; }
    location.href = a.getAttribute('href');
  }

  var paletteNav = null, lastFocus = null;
  function openPalette() {
    var pal = $('#palette');
    if (!pal) return;
    lastFocus = document.activeElement;
    pal.hidden = false;
    var input = $('#palette-q');
    input.value = '';
    renderPalette('');
    input.focus();
  }
  function closePalette() {
    var pal = $('#palette');
    if (!pal || pal.hidden) return;
    pal.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function renderPalette(q) {
    var list = $('#palette-results');
    if (paletteNav) paletteNav.reset();
    if (!q.trim()) {
      list.innerHTML = DECKS.map(function (p) {
        return resultHTML({ type: 'page', label: pageLabel(p), title: p.title, section: 'Week ' + p.week, text: (p.topics || []).join(' · '), href: pageHref(p) }, '');
      }).join('');
      return;
    }
    var res = runSearch(q, 40);
    list.innerHTML = res.length ? res.map(function (e) { return resultHTML(e, q); }).join('') :
      '<li class="no-results">No matches for “' + esc(q) + '”. Try a shorter word.</li>';
  }
  function initPalette() {
    var pal = $('#palette');
    if (!pal) return;
    var input = $('#palette-q'), list = $('#palette-results');
    input.addEventListener('input', function () { renderPalette(input.value); });
    input.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.preventDefault(); closePalette(); } });
    pal.addEventListener('click', function (e) { if (e.target === pal) closePalette(); });
    paletteNav = initResultsNav(input, list, function (a) { pickResult(a); });
  }

  /* ---------- 12. Home page (index.html) ---------- */
  function initHome() {
    var grid = $('#lab-grid');
    if (!grid) return;
    var idx = window.CPE104L_SEARCH || [];
    var counts = {};
    idx.forEach(function (s) { counts[s.page] = (counts[s.page] || 0) + 1; });
    var filter = 'all';

    grid.innerHTML = COURSE.pages.map(function (p) {
      if (p.kind === 'milestone') {
        return '<li class="lab-card milestone" data-part="' + p.part + '" data-id="' + p.id + '">' +
          '<div class="lab-card-top"><span class="badge-milestone">' + esc(p.short) + '</span><span class="badge-week">Week ' + esc(p.week) + '</span></div>' +
          '<h3>' + esc(p.title) + '</h3><p class="lab-card-desc">' + esc(p.desc || '') + '</p></li>';
      }
      var ilo = (p.ilos || [])[0] || '';
      return '<li class="lab-card' + (p.kind === 'orientation' ? ' orientation' : '') + '" data-part="' + p.part + '" data-id="' + p.id + '">' +
        '<a href="' + pageHref(p) + '">' +
          '<div class="lab-card-top"><span class="badge-lab">' + esc(pageLabel(p)) + '</span><span class="badge-week">Week ' + esc(p.week) + '</span>' +
            (counts[p.id] ? '<span class="lab-card-count">' + counts[p.id] + ' slides</span>' : '') + '</div>' +
          '<h3>' + esc(p.title) + '</h3>' +
          '<p class="lab-card-desc">' + esc(ilo) + (p.ilos && p.ilos.length > 1 ? ' <span class="muted">+' + (p.ilos.length - 1) + ' more</span>' : '') + '</p>' +
          '<ul class="lab-card-topics">' + (p.topics || []).slice(0, 5).map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +
          ((p.materials || []).length ? '<p class="lab-card-mat">' + p.materials.length + ' attached file' + (p.materials.length > 1 ? 's' : '') + '</p>' : '') +
        '</a>' +
        ((p.materials || []).length ? '<div class="lab-card-files">' + p.materials.map(function (m) { return '<a href="' + esc(ROOT + m.href) + '">' + esc(m.label) + '</a>'; }).join('') + '</div>' : '') +
      '</li>';
    }).join('');

    var chips = $('#part-filters');
    chips.innerHTML = '<button type="button" class="chip-btn" aria-pressed="true" data-part="all">All</button>' +
      COURSE.parts.map(function (p) { return '<button type="button" class="chip-btn" aria-pressed="false" data-part="' + p.id + '">' + esc(p.label) + ' <span class="muted">' + esc(p.range) + '</span></button>'; }).join('');
    chips.addEventListener('click', function (e) {
      var b = e.target.closest('[data-part]');
      if (!b) return;
      filter = b.getAttribute('data-part');
      $$('[data-part]', chips).forEach(function (c) { c.setAttribute('aria-pressed', String(c === b)); });
      applyFilter();
    });

    var input = $('#home-search'), list = $('#home-results'), info = $('#home-results-info');
    function applyFilter() {
      var q = input.value.trim();
      var hits = q ? runSearch(q, 400) : null;
      var pagesHit = {};
      if (hits) hits.forEach(function (h) { pagesHit[h.page] = true; });
      $$('.lab-card', grid).forEach(function (card) {
        var okPart = filter === 'all' || card.getAttribute('data-part') === filter;
        var okQ = !hits || pagesHit[card.getAttribute('data-id')];
        card.hidden = !(okPart && okQ);
      });
      var wrap = list.closest('.home-results-wrap') || list;
      if (!q) { list.innerHTML = ''; info.textContent = ''; wrap.hidden = true; return; }
      var slidesHit = hits.filter(function (h) { return h.type === 'slide'; });
      wrap.hidden = false;
      info.textContent = slidesHit.length ? slidesHit.length + ' matching slide' + (slidesHit.length > 1 ? 's' : '') + (slidesHit.length > 12 ? ', showing the top 12' : '') : 'No matching slides';
      list.innerHTML = slidesHit.slice(0, 12).map(function (e) { return resultHTML(e, q); }).join('');
    }
    input.addEventListener('input', applyFilter);
    initResultsNav(input, list, function (a) { location.href = a.getAttribute('href'); });

    document.addEventListener('keydown', function (e) {
      if (e.defaultPrevented || isTyping(e.target)) return;
      if (e.key === '/' || ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K'))) { e.preventDefault(); input.focus(); input.select(); }
      else if (e.key === 't' || e.key === 'T') toggleTheme();
    });
    var themeBtn = $('#btn-theme');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
  }

  /* ---------- 13. Init ---------- */
  /* Course-level text from js/course.js, e.g. <b data-course-field="instructor"> */
  function fillCourseFields() {
    $$('[data-course-field]').forEach(function (el) {
      var v = COURSE[el.getAttribute('data-course-field')];
      if (v) el.textContent = v;
    });
  }

  function initComponents(scope) {
    $$('pre[data-pseudo], pre[data-cpp]', scope).forEach(renderCode);
    $$('pre[data-cpp]', scope).forEach(addCopyButton);
    $$('[data-tabs]', scope).forEach(initTabs);
    $$('[data-reveal]', scope).forEach(initReveal);
    initCoverToggles(scope);
    $$('[data-timer]', scope).forEach(initTimer);
    $$('[data-lab-checker]', scope).forEach(initChecker);
  }

  function initDeck() {
    buildChrome();
    app = $('#app'); deck = $('#deck');
    slides = $$('.slide', deck);
    jump = $('#jump'); notesPanel = $('#notes-panel'); notesBody = $('#notes-body'); announcer = $('#announcer');

    initComponents(deck);
    $$('.tracer', deck).forEach(initTracer);
    initPalette();

    refreshDeck();
    jump.addEventListener('change', function () { go(Number(jump.value)); });

    setScale(scale);
    if (!isNarrow() && store.get('sidebar', 'open') === 'closed') app.classList.add('sidebar-collapsed');
    $('#btn-menu').setAttribute('aria-expanded', String(sidebarVisible()));
    setNotes(store.get('notes', 'off') === 'on');

    $('#btn-prev').addEventListener('click', prev);
    $('#btn-next').addEventListener('click', next);
    $('#btn-menu').addEventListener('click', toggleSidebar);
    $('#backdrop').addEventListener('click', function () { setSidebar(false); });
    $('#btn-notes').addEventListener('click', toggleNotes);
    $('#notes-close').addEventListener('click', function () { setNotes(false); });
    $('#btn-theme').addEventListener('click', toggleTheme);
    $('#btn-fullscreen').addEventListener('click', toggleFullscreen);
    $('#btn-help').addEventListener('click', openHelp);
    $('#btn-search').addEventListener('click', openPalette);
    $('#btn-font-up').addEventListener('click', function () { setScale(scale + 0.1); });
    $('#btn-font-down').addEventListener('click', function () { setScale(scale - 0.1); });
    $('#blackout').addEventListener('click', toggleBlackout);

    var onNarrow = function () { app.classList.remove('sidebar-open'); $('#backdrop').hidden = true; $('#btn-menu').setAttribute('aria-expanded', String(sidebarVisible())); };
    if (mqNarrow.addEventListener) mqNarrow.addEventListener('change', onNarrow); else if (mqNarrow.addListener) mqNarrow.addListener(onNarrow);

    document.addEventListener('keydown', onDeckKey);
    initSwipe();

    window.addEventListener('hashchange', function () { var i = indexFromHash(); if (i >= 0) go(i, { fromHash: true }); });
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a || a.closest('#toc') || a.closest('.search-results') || a.classList.contains('skip-link')) return;
      var target = document.getElementById(a.getAttribute('href').slice(1));
      if (target && target.classList.contains('slide')) { e.preventDefault(); go(slides.indexOf(target)); }
    });

    var start = indexFromHash();
    go(start >= 0 ? start : 0, { fromHash: start >= 0 });

    $$('.locked-slide[data-locked]', deck).forEach(initLock);
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-relock]');
      if (!b) return;
      store.remove('unlock.' + b.getAttribute('data-relock'));
      location.reload();
    });
  }

  /* Re-scan the slides (after an activity is unlocked) and rebuild the sidebar + jump menu */
  function refreshDeck() {
    slides = $$('.slide', deck);
    slides.forEach(function (s, i) {
      s.setAttribute('role', 'group');
      s.setAttribute('aria-roledescription', 'slide');
      s.setAttribute('aria-label', (i + 1) + ' of ' + slides.length + ': ' + slideTitle(s));
      if (!s.classList.contains('is-active')) s.setAttribute('aria-hidden', 'true');
    });
    buildToc();
    searchEntries = null;
  }

  /* ---------- Locked laboratory activities ----------
     tools/lock-activities.js encrypts each lab's graded activity slides with
     AES-256-GCM (key = PBKDF2-SHA256 of the lab's passphrase). The public page
     only holds ciphertext in <section class="slide locked-slide" data-locked="lab-NN">.
     The right passphrase decrypts it in the browser and the real slides appear. */
  function normalizePass(p) { return String(p).trim().toLowerCase().replace(/\s+/g, '-'); }
  function b64bytes(b64) {
    var bin = atob(b64), out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  function decryptActivity(payload, pass) {
    var subtle = window.crypto && window.crypto.subtle;
    if (!subtle || typeof TextEncoder === 'undefined') return Promise.reject(new Error('nocrypto'));
    return subtle.importKey('raw', new TextEncoder().encode(normalizePass(pass)), 'PBKDF2', false, ['deriveKey'])
      .then(function (base) {
        return subtle.deriveKey({ name: 'PBKDF2', salt: b64bytes(payload.salt), iterations: payload.iter, hash: 'SHA-256' },
          base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
      })
      .then(function (key) { return subtle.decrypt({ name: 'AES-GCM', iv: b64bytes(payload.iv) }, key, b64bytes(payload.data)); })
      .then(function (buf) { return new TextDecoder().decode(buf); });
  }

  function initLock(ph) {
    var labId = ph.getAttribute('data-locked');
    var dataEl = $('script.locked-data', ph);
    var form = $('.lock-form', ph);
    if (!dataEl || !form) return;
    var payload = JSON.parse(dataEl.textContent);
    var input = $('input', form), msg = $('.lock-msg', ph), btn = $('button', form);
    var key = 'unlock.' + labId;

    function unlock(pass, manual) {
      if (manual) { msg.className = 'lock-msg'; msg.textContent = 'Checking…'; btn.disabled = true; }
      decryptActivity(payload, pass).then(function (html) {
        store.set(key, normalizePass(pass));
        insertUnlocked(ph, html, labId, manual);
      }, function (err) {
        if (!manual) { store.remove(key); return; }   /* saved passphrase no longer valid: stay locked */
        btn.disabled = false;
        msg.className = 'lock-msg is-error';
        msg.textContent = err && err.message === 'nocrypto' ?
          'This browser cannot unlock activities from this page. Open the site through https (GitHub Pages) or a local web server.' :
          'Wrong passphrase. Check the spelling with your instructor.';
        input.select();
      });
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (input.value.trim()) unlock(input.value, true);
    });
    var saved = store.get(key, '');
    if (saved) unlock(saved, false);
  }

  function insertUnlocked(ph, html, labId, manual) {
    if (!ph.parentNode) return;
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    var fresh = $$('.slide', tmp);
    if (!fresh.length) return;
    var activeEl = slides[current];
    var frag = document.createDocumentFragment();
    fresh.forEach(function (s) { frag.appendChild(s); });
    ph.parentNode.replaceChild(frag, ph);
    fresh.forEach(function (s) {
      initComponents(s);
      $$('.tracer', s).forEach(initTracer);
    });
    var head = $('.slide-head', fresh[0]) || fresh[0];
    head.insertAdjacentHTML('afterbegin', '<p class="unlocked-bar"><span>Activity unlocked on this device</span>' +
      '<button type="button" class="btn ghost tiny" data-relock="' + esc(labId) + '">Lock again</button></p>');
    refreshDeck();
    var target;
    if (manual || activeEl === ph) target = slides.indexOf(fresh[0]);
    else {
      var fromHash = indexFromHash();
      target = fromHash >= 0 && fresh.indexOf(slides[fromHash]) !== -1 ? fromHash : slides.indexOf(activeEl);
    }
    $$('.slide.is-active', deck).forEach(function (s) { s.classList.remove('is-active'); s.setAttribute('aria-hidden', 'true'); });
    current = -1;
    go(target, { fromHash: !manual });
  }

  function init() {
    fillCourseFields();
    if (isDeck) initDeck();
    else { setScale(scale); initComponents(document); initHome(); }
  }

  /* Deferred scripts (including js/labs/*.js) all run before DOMContentLoaded,
     so traces registered by lab scripts exist when init() runs. */
  if (document.readyState === 'complete') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
