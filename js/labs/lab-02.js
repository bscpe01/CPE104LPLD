/* ==========================================================================
   Lab 2 · tracers
     l2-calc  Example 1: simple calculator (int x, y, sum)
     l2-p3    Problem 3: adult or minor (if / else preview)
   t.step(node, line, message, output)   line = code line number
   t.input(node, line, message, typed)   what the user types at a cin prompt
   t.vars.name = value                   shown in the Memory panel
   ========================================================================== */
(function () {
  'use strict';
  var C = window.CPE104L, fmt = C.fmt;

  /* An uninitialized local holds an unknown ("garbage") value. */
  var GARBAGE = { garbage: true, toString: function () { return '? (garbage)'; } };

  /* Example 1: simple calculator */
  C.addTrace('l2-calc', function (v, t) {
    t.step(null, 4, 'main() starts running.');
    t.vars.x = GARBAGE; t.vars.y = GARBAGE;
    t.step(null, 5, 'Declare two int variables, x and y. They exist now, but their values are unknown (garbage) until we store something.');
    t.vars.sum = GARBAGE;
    t.step(null, 6, 'Declare sum, also with no value yet.');
    t.step(null, 7, 'cout prints the prompt. No endl, so the cursor waits on the same line.', 'Type a number: ');

    var x = v.x, y = v.y, yFails = false;
    if (!Number.isInteger(x)) {
      /* cin >> int stops at the decimal point; the leftover ".5" makes the next read fail */
      t.vars.x = Math.trunc(x);
      t.input(null, 8, 'cin >> x reads only the whole-number part (' + fmt(Math.trunc(x)) + '). It stops at the decimal point and leaves the rest waiting in the input.', fmt(x));
      yFails = true;
    } else {
      t.vars.x = x;
      t.input(null, 8, 'cin >> x waits for the user, then stores ' + fmt(x) + ' in x.', fmt(x));
    }
    x = Math.trunc(x);

    t.step(null, 9, 'Print the second prompt.', 'Type another number: ');
    if (yFails) {
      y = 0;
      t.vars.y = 0;
      t.step(null, 10, 'cin >> y does NOT wait: it finds the leftover ".", which is not a valid int. The read fails and y becomes 0, so the next output lands on the same line. (Lab 3: choose the right data type!)');
    } else {
      t.vars.y = Math.trunc(y);
      t.input(null, 10, 'cin >> y stores ' + fmt(Math.trunc(y)) + ' in y.' + (Number.isInteger(y) ? '' : ' An int keeps only the whole-number part.'), fmt(y));
      y = Math.trunc(y);
    }

    var sum = x + y;
    t.vars.sum = sum;
    t.step(null, 11, 'Process: sum = x + y = ' + fmt(x) + ' + ' + fmt(y) + ' = ' + fmt(sum) + '. The old garbage in sum is replaced.');
    t.step(null, 12, 'Output: the text in quotes, then the value of sum, then endl starts a new line.', 'Sum is: ' + fmt(sum) + '\n');
    t.step(null, 13, 'return 0; ends main and reports success to the operating system.');
  });

  /* Problem 3: adult or minor */
  C.addTrace('l2-p3', function (v, t) {
    var age = Math.trunc(v.age);
    t.step(null, 4, 'main() starts running.');
    t.vars.age = GARBAGE;
    t.step(null, 5, 'Declare an int variable named age (no value yet).');
    t.step(null, 6, 'Print the prompt.', 'Enter age: ');
    t.vars.age = age;
    t.input(null, 7, 'cin >> age stores ' + fmt(age) + '.', fmt(v.age));
    var minor = age < 18;
    t.step(null, 9, 'Test the condition: age < 18 → ' + fmt(age) + ' < 18 is ' + (minor ? 'TRUE, so run the if block.' : 'FALSE, so skip to the else block.'));
    if (minor) {
      t.step(null, 10, 'Inside the if block: print "Minor".', 'Minor\n');
      t.step(null, 11, 'The else block is skipped because the if block already ran.');
    } else {
      t.step(null, 12, 'Inside the else block: print "Adult".', 'Adult\n');
    }
    t.step(null, 14, 'return 0; ends the program. Exactly one of the two messages was printed.');
  });
})();
