#!/usr/bin/env node
/* ==========================================================================
   Locks the graded laboratory activities and the seatwork answers
   (encrypts them into the public pages).

     node tools/lock-activities.js ../cpe104l-instructor-private

   The PRIVATE folder (never commit it to the public repository) contains:
     passwords.json                 { "lab-01": "mango-relay-tiger-47", ... }
     activities/lab-01.html         the readable activity slides for Lab 1 (edit these)
     seatwork-answers/lab-01.html   the readable seatwork answer for Lab 1 (edit these)

   Seatwork answers use the SAME passphrase as the lab's activity, but each is
   unlocked separately: opening one does not open the other.

   For every activities/lab-NN.html this tool:
     1. encrypts the slides with AES-256-GCM, using a key derived from the lab's
        passphrase (PBKDF2-SHA256, 250,000 rounds, random salt and IV);
     2. writes a "locked" placeholder slide holding only the ciphertext into
        labs/lab-NN.html, between the markers
          <!-- LOCKED-ACTIVITY:START lab-NN -->  …  <!-- LOCKED-ACTIVITY:END lab-NN -->
     3. decrypts the result again to verify it before saving.

   Seatwork answers work the same way, between
          <!-- LOCKED-ANSWER:START lab-NN -->  …  <!-- LOCKED-ANSWER:END lab-NN -->
   on the seatwork slide (a small lock box replaces the "Reveal answer" button).

   Students see a lock card on that slide. Typing the passphrase decrypts the
   activity in the browser (js/script.js). Rerun this tool after editing an
   activity file or changing a passphrase, then run tools/build-search-index.js.
   Needs only Node.js (no npm packages).
   ========================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const ITERATIONS = 250000;

function normalizePass(p) { return String(p).trim().toLowerCase().replace(/\s+/g, '-'); }
function attr(tag, name) {
  const m = tag.match(new RegExp('\\s' + name + '="([^"]*)"'));
  return m ? m[1] : '';
}

function encrypt(plain, pass) {
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  const key = crypto.pbkdf2Sync(normalizePass(pass), salt, ITERATIONS, 32, 'sha256');
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const body = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final(), cipher.getAuthTag()]);
  return { v: 1, iter: ITERATIONS, salt: salt.toString('base64'), iv: iv.toString('base64'), data: body.toString('base64') };
}

function decrypt(payload, pass) {
  const key = crypto.pbkdf2Sync(normalizePass(pass), Buffer.from(payload.salt, 'base64'), payload.iter, 32, 'sha256');
  const all = Buffer.from(payload.data, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(payload.iv, 'base64'));
  decipher.setAuthTag(all.subarray(all.length - 16));
  return Buffer.concat([decipher.update(all.subarray(0, all.length - 16)), decipher.final()]).toString('utf8');
}

function placeholder(labId, labNum, first, slideCount, payload) {
  return `<section class="slide locked-slide" id="${first.id}" data-title="Laboratory Exercise No. ${labNum} (locked)" data-section="${first.section}" data-locked="${labId}">
  <header class="slide-head">
    <p class="kicker">Laboratory Exercise No. ${labNum}</p>
    <h2>This lab activity is locked</h2>
    <p class="lede">It opens when your instructor releases it. Enter the passphrase your instructor gives you.</p>
  </header>
  <div class="lock-card">
    <svg class="lock-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3M12 14.5v2.5"/></svg>
    <h3>Laboratory Exercise No. ${labNum}</h3>
    <form class="lock-form" autocomplete="off">
      <label class="sr-only" for="unlock-${labId}">Passphrase</label>
      <input id="unlock-${labId}" type="password" placeholder="Passphrase" autocomplete="off" spellcheck="false">
      <button type="submit" class="btn primary">Unlock</button>
    </form>
    <p class="lock-msg" aria-live="polite"></p>
    <p class="small muted">The activity is stored encrypted on this site and is unlocked in your browser. Once unlocked, it stays open on this device.</p>
  </div>
  <script type="application/json" class="locked-data">${JSON.stringify(payload)}</script>
  <aside class="notes">
    <p class="note-time">Locked activity (${slideCount} slide${slideCount > 1 ? 's' : ''})</p>
    <h4>Instructor</h4>
    <ul>
      <li>Type this lab's passphrase (private instructor package → <code>passwords.json</code>) to open the activity on the classroom PC. It stays unlocked on that browser until you press "Lock again".</li>
      <li>To release the activity to students, announce or post the passphrase (e.g. in MS Teams).</li>
      <li>To re-lock it for everyone, change the passphrase and rerun <code>node tools/lock-activities.js</code>.</li>
    </ul>
  </aside>
</section>`;
}

function answerPlaceholder(labId, labNum, payload) {
  const lockId = labId + '-seatwork';
  return `<div class="locked-answer" data-locked="${lockId}">
    <svg class="lock-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3M12 14.5v2.5"/></svg>
    <div class="locked-answer-text">
      <p class="locked-answer-title">Answer &amp; walkthrough: locked</p>
      <p class="small muted">Opens when your instructor releases it. Enter the passphrase your instructor gives you.</p>
    </div>
    <form class="lock-form" autocomplete="off">
      <label class="sr-only" for="unlock-${lockId}">Passphrase</label>
      <input id="unlock-${lockId}" type="password" placeholder="Passphrase" autocomplete="off" spellcheck="false">
      <button type="submit" class="btn primary">Unlock</button>
    </form>
    <p class="lock-msg" aria-live="polite"></p>
    <script type="application/json" class="locked-data">${JSON.stringify(payload)}</script>
  </div>`;
}

/* Seatwork answers: seatwork-answers/lab-NN.html → labs/lab-NN.html (LOCKED-ANSWER markers) */
function lockAnswers(privDir, passwords) {
  const ansDir = path.join(privDir, 'seatwork-answers');
  if (!fs.existsSync(ansDir)) return { done: 0, problems: 0 };
  const files = fs.readdirSync(ansDir).filter(f => /^lab-\d+\.html$/.test(f)).sort();
  let done = 0, problems = 0;
  for (const f of files) {
    const labId = f.replace(/\.html$/, '');
    const labNum = Number(labId.split('-')[1]);
    const pass = passwords[labId];
    const pagePath = path.join(ROOT, 'labs', f);
    if (!pass) { console.error(`! ${labId} seatwork: no passphrase in passwords.json`); problems++; continue; }
    if (!fs.existsSync(pagePath)) { console.error(`! ${labId} seatwork: labs/${f} not found`); problems++; continue; }
    const answer = fs.readFileSync(path.join(ansDir, f), 'utf8');
    let page = fs.readFileSync(pagePath, 'utf8');
    const startMark = `<!-- LOCKED-ANSWER:START ${labId} -->`;
    const endMark = `<!-- LOCKED-ANSWER:END ${labId} -->`;
    const a = page.indexOf(startMark), b = page.indexOf(endMark);
    if (a === -1 || b === -1 || b < a) { console.error(`! ${labId} seatwork: LOCKED-ANSWER markers not found in labs/${f}`); problems++; continue; }
    const payload = encrypt(answer, pass);
    if (decrypt(payload, pass) !== answer) { console.error(`! ${labId} seatwork: verification failed`); problems++; continue; }
    const lineStart = page.lastIndexOf('\n', a) + 1;
    const indent = page.slice(lineStart, a).replace(/\S/g, '');
    page = page.slice(0, a + startMark.length) + '\n' + indent + answerPlaceholder(labId, labNum, payload) + '\n' + indent + page.slice(b);
    fs.writeFileSync(pagePath, page);
    done++;
    console.log(`locked ${labId} seatwork answer → labs/${f}`);
  }
  return { done, problems };
}

function main() {
  const priv = process.argv[2];
  if (!priv) {
    console.error('Usage: node tools/lock-activities.js <path-to-private-instructor-folder>');
    process.exit(1);
  }
  const privDir = path.resolve(priv);
  if (privDir.startsWith(ROOT + path.sep)) {
    console.error('Refusing: the private folder must be OUTSIDE the public website folder.');
    process.exit(1);
  }
  const passwords = JSON.parse(fs.readFileSync(path.join(privDir, 'passwords.json'), 'utf8'));
  const actDir = path.join(privDir, 'activities');
  const files = fs.readdirSync(actDir).filter(f => /^lab-\d+\.html$/.test(f)).sort();
  let done = 0, problems = 0;

  for (const f of files) {
    const labId = f.replace(/\.html$/, '');
    const labNum = Number(labId.split('-')[1]);
    const pass = passwords[labId];
    const pagePath = path.join(ROOT, 'labs', f);
    if (!pass) { console.error(`! ${labId}: no passphrase in passwords.json`); problems++; continue; }
    if (normalizePass(pass).length < 12) console.warn(`  ${labId}: passphrase is short; use at least 3 words`);
    if (!fs.existsSync(pagePath)) { console.error(`! ${labId}: labs/${f} not found`); problems++; continue; }

    const activity = fs.readFileSync(path.join(actDir, f), 'utf8');
    const tags = activity.match(/<section\s+class="slide[^"]*"(?:"[^"]*"|[^>"])*>/g) || [];
    if (!tags.length) { console.error(`! ${labId}: activities/${f} has no <section class="slide"> slides`); problems++; continue; }
    const first = { id: attr(tags[0], 'id'), section: attr(tags[0], 'data-section') || 'Laboratory Exercise' };

    let page = fs.readFileSync(pagePath, 'utf8');
    const startMark = `<!-- LOCKED-ACTIVITY:START ${labId} -->`;
    const endMark = `<!-- LOCKED-ACTIVITY:END ${labId} -->`;
    const a = page.indexOf(startMark), b = page.indexOf(endMark);
    if (a === -1 || b === -1 || b < a) { console.error(`! ${labId}: markers not found in labs/${f}`); problems++; continue; }

    const payload = encrypt(activity, pass);
    if (decrypt(payload, pass) !== activity) { console.error(`! ${labId}: verification failed`); problems++; continue; }

    page = page.slice(0, a + startMark.length) + '\n' + placeholder(labId, labNum, first, tags.length, payload) + '\n' + page.slice(b);
    fs.writeFileSync(pagePath, page);
    done++;
    console.log(`locked ${labId}: ${tags.length} slide(s) → labs/${f}`);
  }
  const ans = lockAnswers(privDir, passwords);
  problems += ans.problems;
  console.log(`\n${done} lab activit${done === 1 ? 'y' : 'ies'} and ${ans.done} seatwork answer${ans.done === 1 ? '' : 's'} locked` +
    (problems ? `, ${problems} problem(s)` : '') + '. Now run: node tools/build-search-index.js');
  if (problems) process.exit(1);
}

main();
