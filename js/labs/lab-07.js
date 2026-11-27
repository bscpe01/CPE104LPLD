/* ==========================================================================
   Lab 7 · Iteration Part 1 · tracers
   CPE104L.addTrace(name, function (input, t) { … })
     t.step(node, line, message, output)   node = flowchart data-node, line = code line
     t.input(node, line, message, typed)   what the user types at a cin prompt
     t.vars.name = value                   shown in the Memory panel
   Output strings match the real program (C.cout formats doubles like cout).
   ========================================================================== */
(function () {
  'use strict';
  var C = window.CPE104L;

  /* Split a "typed values" box into tokens, e.g. "120 -5 88" → ['120', '-5', '88'] */
  function tokens(text, wholeOnly) {
    var list = String(text).trim().split(/[\s,]+/).filter(function (x) { return x !== ''; });
    list.forEach(function (x) {
      if (isNaN(Number(x))) throw new Error('"' + x + '" is not a number. Type numbers separated by spaces.');
      if (wholeOnly && !Number.isInteger(Number(x))) throw new Error('grade is an int in this program: type whole numbers only.');
    });
    return list;
  }
  function limit(n, max) {
    if (n > max) throw new Error('Use a value of at most ' + max + ' so the trace stays short.');
  }

  /* while loop: countdown (countdown.cpp) */
  C.addTrace('l7-countdown', function (v, t) {
    var n = Math.trunc(v.n);
    limit(n, 40);
    t.step('start', 4, 'main() starts.');
    t.step(null, 5, 'Declare int n.');
    t.step('in', 6, 'Print the prompt.', 'Count down from: ');
    t.vars.n = n;
    t.input('in', 7, 'cin reads n = ' + n + '. This initializes the loop control variable.', String(n));
    for (;;) {
      var go = n > 0;
      t.step('test', 9, 'Test: n > 0? ' + n + ' > 0 is ' + (go ? 'true → run the body.' : 'false → skip the body and leave the loop.'));
      if (!go) break;
      t.step('out', 10, 'Body: print n followed by "... " (no endl).', n + '... ');
      n--;
      t.vars.n = n;
      t.step('dec', 11, 'Update: n-- makes n = ' + n + '. Go back to the test.');
    }
    t.step('after', 13, 'After the loop: print Liftoff! and end the line.', 'Liftoff!\n');
    t.step('end', 14, 'return 0; the program ends.');
  });

  /* for loop: sum of 1 to n (sum_to_n.cpp) */
  C.addTrace('l7-sum', function (v, t) {
    var n = Math.trunc(v.n);
    limit(n, 100);
    t.step('start', 4, 'main() starts.');
    t.step(null, 5, 'Declare int n.');
    t.vars.sum = 0;
    t.step('decl', 6, 'Accumulator: sum starts at 0.');
    t.step('in', 7, 'Print the prompt.', 'Enter n: ');
    t.vars.n = n;
    t.input('in', 8, 'cin reads n = ' + n + '.', String(n));
    var i = 1, sum = 0;
    t.vars.i = i;
    t.step('init', 10, 'for, part 1 (runs once): int i = 1.');
    for (;;) {
      var go = i <= n;
      t.step('test', 10, 'for, part 2 (test): i <= n? ' + i + ' <= ' + n + ' is ' + (go ? 'true → run the body.' : 'false → leave the loop.'));
      if (!go) break;
      sum += i;
      t.vars.sum = sum;
      t.step('body', 11, 'Body: sum += i → sum = ' + (sum - i) + ' + ' + i + ' = ' + sum + '.');
      i++;
      t.vars.i = i;
      t.step('upd', 10, 'for, part 3 (update): i++ → i = ' + i + '. Back to the test.');
    }
    delete t.vars.i;
    t.step('out', 13, 'The loop is over, so i no longer exists (scope). Print the sum.', 'Sum = ' + sum + '\n');
    t.step('end', 14, 'return 0; the program ends.');
  });

  /* do-while: input validation (validate_grade.cpp) */
  C.addTrace('l7-validate', function (v, t) {
    var list = tokens(v.typed, false);
    if (!list.length) throw new Error('Type at least one value, e.g. 120 -5 88');
    t.step('start', 4, 'main() starts.');
    t.step(null, 5, 'Declare double grade.');
    t.step(null, 7, 'do: enter the body first. There is no test yet.');
    for (var k = 0; ; k++) {
      t.step('in', 8, 'Print the prompt' + (k ? ' again.' : '.'), 'Enter grade (0-100): ');
      if (k >= list.length) {
        t.step('in', 9, 'No more typed values: the real program would now wait at cin for the user.');
        return;
      }
      var g = Number(list[k]);
      t.vars.grade = g;
      t.input('in', 9, 'cin reads grade = ' + C.fmt(g) + '.', list[k]);
      var low = g < 0, high = g > 100, again = low || high;
      t.step('test', 10, 'Test: grade < 0 is ' + low + ', grade > 100 is ' + high + ', so the condition is ' + again +
        (again ? ' → invalid, repeat the body.' : ' → valid, leave the loop.'));
      if (!again) break;
    }
    t.step('out', 12, 'Print the accepted grade.', 'Grade accepted: ' + C.cout(t.vars.grade) + '\n');
    t.step('end', 13, 'return 0; the program ends.');
  });

  /* sentinel-controlled while: average until -1 (grade_average.cpp) */
  C.addTrace('l7-sentinel', function (v, t) {
    var list = tokens(v.typed, true), k = 0;
    if (list.length > 30) throw new Error('Type at most 30 values so the trace stays short.');
    t.step('start', 4, 'main() starts.');
    t.step(null, 5, 'Declare int grade.');
    t.vars.sum = 0; t.vars.count = 0;
    t.step('init', 6, 'Accumulator sum = 0 and counter count = 0.');
    t.step('in1', 8, 'Priming read: print the prompt.', 'Grade (-1 to stop): ');
    if (k >= list.length) { t.step('in1', 9, 'No typed values: the real program would wait at cin.'); return; }
    t.vars.grade = Number(list[k]);
    t.input('in1', 9, 'cin reads grade = ' + list[k] + ' (the priming read).', list[k]); k++;
    for (;;) {
      var g = t.vars.grade, go = g !== -1;
      t.step('test', 10, 'Test: grade != -1? ' + g + ' != -1 is ' + (go ? 'true → process this grade.' : 'false → the sentinel was read, leave the loop (it is not added).'));
      if (!go) break;
      t.vars.sum += g;
      t.step('acc', 11, 'Accumulate: sum += ' + g + ' → sum = ' + t.vars.sum + '.');
      t.vars.count += 1;
      t.step('acc', 12, 'Count it: count++ → count = ' + t.vars.count + '.');
      t.step('in2', 13, 'Prompt for the next grade.', 'Grade (-1 to stop): ');
      if (k >= list.length) { t.step('in2', 14, 'No more typed values: the real program would wait here for the user (add -1 to finish).'); return; }
      t.vars.grade = Number(list[k]);
      t.input('in2', 14, 'cin reads the next grade = ' + list[k] + '. Back to the test.', list[k]); k++;
    }
    var c = t.vars.count, ok = c > 0;
    t.step('dcount', 17, 'Guard against dividing by zero: count > 0? ' + c + ' > 0 is ' + ok + '.');
    if (ok) {
      var avg = t.vars.sum / c;
      t.vars.avg = avg;
      t.step('oavg', 18, 'avg = static_cast<double>(' + t.vars.sum + ') / ' + c + ' = ' + C.cout(avg) + '.');
      t.step('oavg', 19, 'Print the count.', 'Grades entered: ' + c + '\n');
      t.step('oavg', 20, 'Print the average (6 significant digits by default).', 'Average: ' + C.cout(avg) + '\n');
    } else {
      t.step('onone', 22, 'The first value was the sentinel, so there is nothing to average.', 'No grades entered.\n');
    }
    t.step('join', 23, 'End of the if-else.');
    t.step('end', 24, 'return 0; the program ends.' + (k < list.length ? ' (Values typed after -1 are never read.)' : ''));
  });
})();
