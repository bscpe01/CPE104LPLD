/* ==========================================================================
   Lab 9 · Arrays: tracers
   Each trace: CPE104L.addTrace(name, function (input, t) { … })
     t.step(node, line, message, output)   node = flowchart data-node (or null), line = code line
     t.input(node, line, message, typed)   shows what the user typed at a cin prompt
     t.vars.name = value                   shown in the Memory panel (arrays show as {a, b, c})
   Arrays are copied with slice() whenever they change, because each step keeps a
   shallow snapshot of t.vars.
   ========================================================================== */
(function () {
  'use strict';
  var C = window.CPE104L;

  function tf(b) { return b ? 'true' : 'false'; }

  /* Linear search: walk the array from index 0 and stop at the first match. */
  C.addTrace('l9-search', function (v, t) {
    var target = v.target;
    if (!Number.isInteger(target)) throw new Error('Enter a whole number for target.');
    var partNo = [42, 17, 89, 5, 63, 28], SIZE = partNo.length;
    t.step(null, 4, 'main() starts.');
    t.vars.SIZE = SIZE;
    t.vars.partNo = partNo.slice();
    t.step(null, 6, 'The array partNo holds 6 part numbers, at indexes 0 to 5.');
    t.step(null, 8, 'Prompt for the part number to find.', 'Part number to find: ');
    t.vars.target = target;
    t.input(null, 9, 'cin reads target = ' + target + '.', target);
    t.vars.found = false;
    t.vars.position = -1;
    t.step(null, 11, 'found = false and position = -1 mean "not found yet".');
    var i = 0, found = false;
    t.vars.i = 0;
    for (;;) {
      var ok = i < SIZE;
      t.step(null, 12, (i === 0 ? 'Start at index 0. ' : 'i++ makes i = ' + i + '. ') +
        'Test i < SIZE: ' + i + ' < ' + SIZE + ' is ' + tf(ok) + (ok ? '.' : ', so the search ends: every element was checked.'));
      if (!ok) break;
      t.vars['partNo[i]'] = partNo[i];
      var hit = partNo[i] === target;
      t.step(null, 13, 'Compare partNo[' + i + '] = ' + partNo[i] + ' with ' + target + ': ' + (hit ? 'a match!' : 'not equal.'));
      if (hit) {
        found = true;
        t.vars.found = true;
        t.step(null, 14, 'found = true.');
        t.vars.position = i;
        t.step(null, 15, 'position = ' + i + ' (remember where it was found).');
        t.step(null, 16, 'break: stop searching. Comparisons made: ' + (i + 1) + ' of ' + SIZE + '.');
        break;
      }
      delete t.vars['partNo[i]'];
      i++;
      t.vars.i = i;
    }
    delete t.vars.i;
    delete t.vars['partNo[i]'];
    t.step(null, 19, 'After the loop, test found → ' + tf(found) + '.');
    if (found) t.step(null, 20, 'Print the index where it was found.', 'Found at index ' + i + '\n');
    else {
      t.step(null, 22, 'Print the "not found" message.', target + ' is not in the list.');
      t.step(null, 23, 'endl ends the line.', '\n');
    }
    t.step(null, 25, 'return 0; the program ends.');
  });

  /* Bubble sort with early exit: compare neighbors, swap if out of order. */
  C.addTrace('l9-bubble', function (v, t) {
    var parts = String(v.numbers).trim().split(/[\s,]+/);
    if (parts.length !== 5 || parts.some(function (p) { return !/^-?\d+$/.test(p); })) {
      throw new Error('Type exactly 5 whole numbers separated by spaces, e.g. 5 1 4 2 8.');
    }
    var arr = parts.map(Number), SIZE = 5;
    if (arr.some(function (x) { return Math.abs(x) > 9999; })) throw new Error('Use numbers from -9999 to 9999.');
    t.step(null, 4, 'main() starts.');
    t.vars.SIZE = SIZE;
    t.step(null, 6, 'Declare int arr[5]. Its values are garbage until cin fills them.');
    t.step(null, 7, 'Prompt for 5 numbers.', 'Enter 5 numbers: ');
    t.vars.arr = arr.slice();
    t.input(null, 9, 'The for loop runs cin >> arr[i] for i = 0 to 4, filling the array.', arr.join(' '));
    var pass = 1;
    t.vars.pass = pass;
    for (;;) {
      var ok = pass < SIZE;
      t.step(null, 11, 'Test pass < SIZE: ' + pass + ' < ' + SIZE + ' is ' + tf(ok) + (ok ? '. Start pass ' + pass + '.' : ', so sorting is finished.'));
      if (!ok) break;
      var swapped = false;
      t.vars.swapped = false;
      t.step(null, 12, 'swapped = false: no swaps yet in this pass.');
      var i = 0;
      t.vars.i = 0;
      for (;;) {
        var inner = i < SIZE - pass;
        t.step(null, 13, 'Test i < SIZE - pass: ' + i + ' < ' + (SIZE - pass) + ' is ' + tf(inner) +
          (inner ? '.' : '. The pass ends; the largest unsorted value has bubbled to index ' + (SIZE - pass) + '.'));
        if (!inner) break;
        var a = arr[i], b = arr[i + 1], out = a > b;
        t.step(null, 14, 'Compare arr[' + i + '] = ' + a + ' and arr[' + (i + 1) + '] = ' + b + ': ' +
          a + ' > ' + b + ' is ' + tf(out) + (out ? ', so swap them.' : ', so leave them.'));
        if (out) {
          arr[i] = b; arr[i + 1] = a;
          t.vars.arr = arr.slice();
          t.step(null, 17, 'Swap through temp: arr is now {' + arr.join(', ') + '}.');
          swapped = true;
          t.vars.swapped = true;
          t.step(null, 18, 'swapped = true.');
        }
        i++;
        t.vars.i = i;
      }
      delete t.vars.i;
      t.step(null, 21, 'Print the array after pass ' + pass + '.', 'After pass ' + pass + ': ' + arr.join(' ') + '\n');
      t.step(null, 26, 'Test !swapped: swapped is ' + tf(swapped) + (swapped ? ', so keep going.' : ', so the array is already sorted.'));
      if (!swapped) {
        t.step(null, 27, 'break: skip the remaining passes (early exit).');
        break;
      }
      pass++;
      t.vars.pass = pass;
    }
    delete t.vars.pass;
    delete t.vars.swapped;
    t.step(null, 30, 'return 0; arr is sorted: {' + arr.join(', ') + '}.');
  });
})();
