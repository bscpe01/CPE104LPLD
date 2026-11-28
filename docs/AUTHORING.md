# Authoring guide: adding and editing labs

Every lab is one HTML file in `labs/`. It contains **only slides**. The shared engine (`js/script.js`) adds the top bar, lab switcher, sidebar, search, notes panel, and controls. Open **`labs/_template.html`** in a browser to see every component working, then copy what you need.

## 1. Add a new lab (or replace one)

1. Copy `labs/_template.html` to `labs/lab-16.html` (any name).
2. In the new file set `<title>`, the `<body data-page="lab-16" data-root="../">` id, and the optional script line `../js/labs/lab-16.js` (delete it if the lab has no tracers).
3. Add the lab to `js/course.js` (`id`, `num`, `file`, `title`, `week`, `part`, `ilos`, `topics`). The id must match `data-page`.
4. Run `node tools/build-search-index.js` so the cross-lab search knows the new slides. This is optional, since the current lab is always searchable live.

## 2. Slide skeleton

```html
<section class="slide" id="l7-for-loop" data-title="The for Loop" data-section="Entry-controlled loops">
  <header class="slide-head">
    <p class="kicker">Lab 7 · Iteration</p>
    <h2>The <code>for</code> Loop</h2>
    <p class="lede">One-sentence summary.</p>
  </header>
  … content …
  <aside class="notes">
    <p class="note-time">Suggested time: about 6 min</p>
    <h4>Teaching tips</h4><ul><li>…</li></ul>
    <h4>Common student pitfalls</h4><ul><li>…</li></ul>
    <h4>Ask the class</h4><ul><li>…</li></ul>
  </aside>
</section>
```

- `id`: unique within the page, prefixed with the lab number (`l7-…`). It becomes the URL (`lab-07.html#l7-for-loop`).
- `data-title`: the sidebar and search title. `data-section`: the sidebar group (consecutive slides with the same section are grouped).
- Do **not** nest another `<section>` inside a slide.

## 3. Components (class reference)

| Need | Markup |
|---|---|
| Lab title slide | `.lab-title` > badges (`.badge-lab`, `.badge-week`, `.badge-co`), `h1` with `<span>` subtitle, `.roadmap`, and `.ilo-card` |
| Key concept | `<div class="concept"><p class="box-label">Key concept</p><p>…</p></div>` (add `big` for a larger definition) |
| Common pitfall | `<div class="pitfall"><p class="box-label">Common pitfall</p><ul>…</ul></div>` |
| Practice / exercise | `<div class="practice"><p class="box-label">Practice</p><ol>…</ol></div>` |
| Side note | `<div class="note-box"><p class="box-label">Note</p>…</div>` |
| C++ code | `<pre class="code" data-cpp>…</pre>`: line numbers, colors, Copy button |
| Pseudocode | `<pre class="code" data-pseudo>…</pre>` |
| Code + caption | `<figure class="codeblock"><figcaption><code>file.cpp</code></figcaption><pre …></figure>` |
| Program + output side by side | `<div class="code-pair">` code figure + output figure |
| Program output | `<pre class="console">Enter x: <span class="in">5</span>\n…</pre>` (typed input in `.in`) |
| Syntax line | `<p class="syntax">for (<i>init</i>; <i>condition</i>; <i>update</i>)</p>` |
| Layout | `.grid-2`, `.grid-3`, `.stack`, `.example-grid` (code left, chart right) |
| Table | `<div class="table-wrap"><table class="table compact">…` · desk-check: add `trace-table` |
| Memory diagram | `.mem` > `.mem-cell` > `.mem-name`, `.mem-val`, `.mem-addr` · arrays: `.mem.array` · pointer: `.mem-cell.is-pointer` · highlight: `.is-hl` |
| Flowchart | `<svg class="fc" viewBox="…">` with shapes `s-terminal`, `s-process`, `s-decision`, `s-io`, `s-prep`, `s-predef`, `s-conn`; lines `<path class="fc-line" d="…">` (arrowhead automatic, `plain` for none); labels `<text class="fc-label">` |
| Tabs | `<div class="tabs" data-tabs>` + `[role=tab][data-tab]` + `[role=tabpanel][data-panel]` |
| Step-by-step reveal | `<div data-reveal>` + `<li data-step>` + `[data-reveal-next]`, `[data-reveal-reset]` |
| Quick check | `<details class="qa"><summary><span class="q-num">1</span><span class="q-text">Q?</span></summary><p>A.</p></details>` in `.qa-grid` |
| Hidden answer | `<details class="answer"><summary><span>Reveal answer</span></summary>…</details>` |
| Hints | `<details class="hint"><summary>Hint 1</summary><p>…</p></details>` |
| Timer | `<div class="card timer" data-timer data-minutes="10">` (see template) |

### Writing code inside HTML

Inside `<pre>` blocks, **write `<` as `&lt;`, `>` as `&gt;`, and `&` as `&amp;`**. Otherwise `#include <iostream>` turns into an invisible HTML tag. Indentation is preserved, and common leading spaces are removed automatically.

## 4. Tracers (step-through animation)

HTML:

```html
<pre class="code" id="l7-sum-code" data-cpp>…</pre>
<div class="tracer" data-trace="l7-sum" data-code="#l7-sum-code" data-chart="#l7-sum-chart">
  <div class="tracer-inputs">
    <label>n <input type="number" data-var="n" value="5" step="any"></label>
    <!-- data-type="text" passes a string instead of a number -->
  </div>
</div>
```

JavaScript, in `js/labs/lab-07.js`, loaded after `script.js`:

```js
(function () {
  var C = window.CPE104L;          // C.cout(x) formats a double like cout does
  C.addTrace('l7-sum', function (v, t) {
    t.step('start', 4, 'main() starts.');
    t.vars.sum = 0;
    t.input('in', 6, 'cin reads n.', v.n);           // shows typed input
    t.step('out', 9, 'Print the sum.', 'Sum = ' + C.cout(15) + '\n');
  });
})();
```

`t.step(node, line, message, output)` highlights code line `line` and flowchart node `data-node="node"` (or `null`). Output is printed exactly as given, so add `'\n'` wherever the program prints `endl` or `\n`.

## 5. Attaching PPT / PDF files

Put files in `materials/` and list them in the lab's entry in `js/course.js`:

```js
materials: [{ label: 'Lab 4 slides (PPTX)', href: 'materials/LAB_04.pptx' }]
```

They appear as download links on the home page card. Anything in the repository is public on GitHub Pages, so keep answer keys out.

## 6. Locking a lab's graded activity

Graded activity slides are **not** written into `labs/lab-NN.html` in readable form. To lock a new lab's activity:

1. Put the activity slides (normal `<section class="slide">` markup) in the **private** package: `cpe104l-instructor-private/activities/lab-NN.html`.
2. Add a passphrase for `"lab-NN"` to `cpe104l-instructor-private/passwords.json` (3 words + a number).
3. In `labs/lab-NN.html`, where the activity belongs (usually just before the wrap-up), add the two markers:

   ```html
   <!-- LOCKED-ACTIVITY:START lab-NN -->
   <!-- LOCKED-ACTIVITY:END lab-NN -->
   ```

4. Run `node tools/lock-activities.js ../cpe104l-instructor-private`, then `node tools/build-search-index.js`.

The tool writes an encrypted placeholder slide between the markers. The engine shows a lock card and inserts the real slides after the passphrase is typed. Tracers, tabs, and code blocks inside the activity work normally after unlocking.

### Locking a seatwork answer

Seatwork answers (the `<details class="answer">` "Reveal answer & walkthrough" block) are locked the same way, with the lab's passphrase:

1. Put the `<details class="answer">…</details>` block in `cpe104l-instructor-private/seatwork-answers/lab-NN.html`.
2. On the seatwork slide in `labs/lab-NN.html`, where the answer belongs, add:

   ```html
   <!-- LOCKED-ANSWER:START lab-NN -->
   <!-- LOCKED-ANSWER:END lab-NN -->
   ```

3. Run the same two commands. A small lock box replaces the answer until the passphrase is typed in it. It is saved separately from the activity (browser key `lab-NN-seatwork`), so each is unlocked on its own.
