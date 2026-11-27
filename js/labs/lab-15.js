/* Tracers for labs/lab-15.html (Debugging Techniques).
   Line numbers refer to the code blocks on the slides (average.cpp, buggy and fixed). */
(function () {
  'use strict';
  var C = window.CPE104L;

  function readInputs(v) {
    var n = v.n;
    if (!Number.isInteger(n) || n < 1 || n > 10) throw new Error('Enter n from 1 to 10.');
    var tokens = String(v.scores).trim().split(/[\s,]+/).filter(function (s) { return s !== ''; });
    var scores = tokens.map(Number);
    if (scores.some(function (x) { return !Number.isInteger(x); })) {
      throw new Error('Scores must be whole numbers separated by spaces (score is an int).');
    }
    if (scores.length < n) throw new Error('Type at least ' + n + ' scores (you typed ' + scores.length + ').');
    return { n: n, scores: scores, typed: tokens.join(' ') };
  }

  /* Shared trace for the buggy (start = 1, integer division) and fixed versions. */
  function averageTrace(v, t, fixed) {
    var d = readInputs(v);
    var n = d.n;
    t.step(null, 4, 'main() starts.');
    t.step(null, 6, 'Prompt for the number of scores (no endl, so the cursor stays on this line).', 'How many scores? ');
    t.vars.n = n;
    t.input(null, 7, 'cin reads n = ' + n + '.', String(n));
    t.step(null, 8, 'Prompt for the scores.', 'Enter ' + n + ' scores: ');
    var sum = 0;
    t.vars.sum = sum;
    t.step(null, 9, 'sum = 0');
    var start = fixed ? 0 : 1;
    var i = start, k = 0;
    t.vars.i = i;
    t.step(null, 10, 'Loop starts with i = ' + i + '. Is ' + i + ' < ' + n + '? ' + (i < n ? 'Yes.' : 'No, so the body never runs!'));
    while (i < n) {
      t.step(null, 11, 'Declare score (an int).');
      var score = d.scores[k];
      t.vars.score = score;
      if (k === 0) t.input(null, 12, 'cin reads the first score: ' + score + '. (The user typed all the scores on one line.)', d.typed);
      else t.step(null, 12, 'cin reads the next number already typed: ' + score + '.');
      k++;
      sum += score;
      t.vars.sum = sum;
      t.step(null, 13, 'sum += score → sum = ' + sum + '.');
      i++;
      t.vars.i = i;
      delete t.vars.score;
      if (i < n) t.step(null, 10, 'i++ → i = ' + i + '. Is ' + i + ' < ' + n + '? Yes.');
    }
    if (k > 0) {
      var note = fixed ? 'All ' + k + ' scores were read.' : 'Only ' + k + ' of the ' + n + ' scores were read: the loop ran n − 1 times!';
      t.step(null, 10, 'i++ → i = ' + i + '. Is ' + i + ' < ' + n + '? No, so the loop ends. ' + note);
    }
    delete t.vars.i;
    var avg;
    if (fixed) {
      avg = sum / n;
      t.vars.average = avg;
      t.step(null, 15, 'static_cast<double>(sum) / n = ' + sum + '.0 / ' + n + ' = ' + C.cout(avg) + ' (double division keeps the decimals).');
    } else {
      avg = Math.trunc(sum / n);
      t.vars.average = avg;
      t.step(null, 15, 'sum / n is int / int, so it is INTEGER division: ' + sum + ' / ' + n + ' = ' + avg + '. The decimals are lost before the value is stored in the double.');
    }
    t.step(null, 16, 'Print the average.', 'Average = ' + C.cout(avg) + '\n');
    var expected = d.scores.slice(0, n).reduce(function (a, b) { return a + b; }, 0) / n;
    t.step(null, 17, 'return 0; Expected (by hand): ' + C.cout(expected) + '. Printed: ' + C.cout(avg) + '. ' +
      (C.cout(expected) === C.cout(avg) ? 'They match: test passes.' : 'They differ: the test FAILS.'));
  }

  C.addTrace('l15-bug', function (v, t) { averageTrace(v, t, false); });
  C.addTrace('l15-fix', function (v, t) { averageTrace(v, t, true); });
})();
