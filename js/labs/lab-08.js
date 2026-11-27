/* ==========================================================================
   Lab 8 · Iteration Part 2: tracers
   Each trace: CPE104L.addTrace(name, function (input, t) { … })
     t.step(node, line, message, output)   node = flowchart data-node (or null), line = code line
     t.input(node, line, message, typed)   shows what the user typed at a cin prompt
     t.vars.name = value                   shown in the Memory panel (delete to show "out of scope")
   ========================================================================== */
(function () {
  'use strict';
  var C = window.CPE104L, fmt = C.fmt;

  function wholeNumber(x, name, lo, hi) {
    if (!Number.isInteger(x)) throw new Error('Enter a whole number for ' + name + '.');
    if (x < lo || x > hi) throw new Error('For this tracer, use ' + name + ' from ' + lo + ' to ' + hi + '.');
    return x;
  }
  function tf(b) { return b ? 'true' : 'false'; }

  /* Right-triangle pattern: the output grows one row per pass of the outer loop. */
  C.addTrace('l8-tri', function (v, t) {
    var rows = wholeNumber(v.rows, 'rows', 0, 8);
    t.step(null, 4, 'main() starts.');
    t.step(null, 6, 'Prompt for the number of rows (no endl, so the cursor stays on this line).', 'Enter number of rows: ');
    t.vars.rows = rows;
    t.input(null, 7, 'cin reads rows = ' + rows + '.', rows);
    var i = 1;
    t.vars.i = i;
    for (;;) {
      var ok = i <= rows;
      t.step(null, 8, (i === 1 ? 'Outer loop starts with i = 1. ' : 'i++ makes i = ' + i + '. ') +
        'Test i <= rows: ' + i + ' <= ' + rows + ' is ' + tf(ok) + (ok ? ', so build row ' + i + '.' : ', so the outer loop ends.'));
      if (!ok) break;
      var j = 1;
      t.vars.j = j;
      for (;;) {
        var inner = j <= i;
        t.step(null, 9, (j === 1 ? 'Inner loop starts over with j = 1. ' : 'j++ makes j = ' + j + '. ') +
          'Test j <= i: ' + j + ' <= ' + i + ' is ' + tf(inner) +
          (inner ? '.' : ', so the inner loop ends. Row ' + i + ' has ' + i + ' star' + (i > 1 ? 's' : '') + '.'));
        if (!inner) break;
        t.step(null, 10, 'Print star ' + j + ' of row ' + i + '.', '*');
        j++;
        t.vars.j = j;
      }
      delete t.vars.j;
      t.step(null, 12, 'endl ends row ' + i + '. (j no longer exists: it lives only inside the inner loop.)', '\n');
      i++;
      t.vars.i = i;
    }
    delete t.vars.i;
    t.step(null, 14, 'return 0; the triangle is done: ' + rows + ' row' + (rows === 1 ? '' : 's') + '.');
  });

  /* Prime check: trial division up to the square root, break on the first divisor. */
  C.addTrace('l8-prime', function (v, t) {
    var n = wholeNumber(v.n, 'n', -100, 100000);
    t.step(null, 4, 'main() starts.');
    t.step(null, 6, 'Prompt for a number.', 'Enter a positive integer: ');
    t.vars.n = n;
    t.input(null, 7, 'cin reads n = ' + n + '.', n);
    var isPrime = n >= 2;
    t.vars.isPrime = isPrime;
    t.step(null, 8, 'isPrime = (n >= 2) → ' + tf(isPrime) + (isPrime ? '. Assume prime until a divisor is found.' : '. Numbers below 2 are not prime.'));
    var d = 2;
    t.vars.d = d;
    for (;;) {
      var ok = d * d <= n;
      t.step(null, 9, (d === 2 ? 'Start with d = 2. ' : 'd++ makes d = ' + d + '. ') +
        'Test d * d <= n: ' + d + ' * ' + d + ' = ' + (d * d) + ' <= ' + n + ' is ' + tf(ok) +
        (ok ? '.' : ', so the loop ends. No divisor was found up to √n.'));
      if (!ok) break;
      var r = n % d;
      t.step(null, 10, n + ' % ' + d + ' = ' + r + (r === 0 ? ' → ' + d + ' divides ' + n + '!' : ' → ' + d + ' is not a divisor.'));
      if (r === 0) {
        isPrime = false;
        t.vars.isPrime = false;
        t.step(null, 11, 'isPrime = false (' + n + ' = ' + d + ' × ' + (n / d) + ').');
        t.step(null, 12, 'break: leave the for loop right now. No more divisors are tested.');
        break;
      }
      d++;
      t.vars.d = d;
    }
    delete t.vars.d;
    t.step(null, 15, 'After the loop, test isPrime → ' + tf(isPrime) + '.');
    if (isPrime) t.step(null, 16, 'Print the "prime" message.', n + ' is prime.\n');
    else t.step(null, 18, 'Print the "not prime" message.', n + ' is not prime.\n');
    t.step(null, 20, 'return 0; the program ends.');
  });

  /* Sum of digits and reversed number with % 10 and / 10. */
  C.addTrace('l8-digits', function (v, t) {
    var n = wholeNumber(v.n, 'n', -999999999, 999999999);
    t.step(null, 4, 'main() starts.');
    t.step(null, 6, 'Prompt for a number.', 'Enter a positive integer: ');
    t.vars.n = n;
    t.input(null, 7, 'cin reads n = ' + n + '.', n);
    var temp = n, sum = 0, rev = 0;
    t.vars.temp = temp; t.vars.sum = 0; t.vars.reversed = 0;
    t.step(null, 8, 'Copy n into temp (so n keeps its value) and start sum and reversed at 0.');
    for (;;) {
      var ok = temp > 0;
      t.step(null, 9, 'Test temp > 0: ' + temp + ' > 0 is ' + tf(ok) + (ok ? '.' : ', so the loop ends.'));
      if (!ok) break;
      var digit = temp % 10;
      t.vars.digit = digit;
      t.step(null, 10, 'digit = ' + temp + ' % 10 = ' + digit + ' (the last digit).');
      sum += digit;
      t.vars.sum = sum;
      t.step(null, 11, 'sum += ' + digit + ' → sum = ' + sum + '.');
      var old = rev;
      rev = rev * 10 + digit;
      t.vars.reversed = rev;
      t.step(null, 12, 'reversed = ' + old + ' * 10 + ' + digit + ' = ' + rev + '.');
      var oldTemp = temp;
      temp = Math.trunc(temp / 10);
      t.vars.temp = temp;
      delete t.vars.digit;
      t.step(null, 13, 'temp /= 10 → ' + oldTemp + ' / 10 = ' + temp + ' (integer division drops the last digit).');
    }
    t.step(null, 15, 'Print the sum of digits.', 'Sum of digits: ' + sum + '\n');
    t.step(null, 16, 'Print the reversed number.', 'Reversed: ' + rev + '\n');
    t.step(null, 17, 'return 0; the program ends.');
  });
})();
