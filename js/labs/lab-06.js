/* ==========================================================================
   Lab 6 · Selection · tracers
   CPE104L.addTrace(name, function (input, t) { … })
     t.step(node, line, message, output)   node = flowchart data-node, line = code line
     t.input(node, line, message, typed)   what the user types at a cin prompt
     t.vars.name = value                   shown in the Memory panel
   Output strings match the real program (C.cout formats doubles like cout).
   ========================================================================== */
(function () {
  'use strict';
  var C = window.CPE104L, fmt = C.fmt;
  function yn(ok) { return ok ? 'true → Yes' : 'false → No'; }
  /* A char shown in the Memory panel as 'x' (a String object is not quoted by the panel) */
  function chr(c) { return new String("'" + c + "'"); }

  /* else-if ladder: numerical grade → letter grade (letter_grade.cpp) */
  C.addTrace('l6-grade', function (v, t) {
    var g = v.grade;
    t.step('start', 4, 'main() starts.');
    t.step(null, 5, 'Declare double grade (no value yet).');
    t.step('in', 6, 'Print the prompt. No endl, so the cursor waits on the same line.', 'Enter numerical grade: ');
    t.vars.grade = g;
    t.input('in', 7, 'cin reads grade = ' + fmt(g) + '.', fmt(g));
    var ladder = [[90, 'A', 'd90', 'oA', 9], [80, 'B', 'd80', 'oB', 11], [70, 'C', 'd70', 'oC', 13], [60, 'D', 'd60', 'oD', 15]];
    for (var k = 0; k < ladder.length; k++) {
      var c = ladder[k], ok = g >= c[0];
      t.step(c[2], c[4], (k ? 'else if: ' : 'if: ') + 'grade >= ' + c[0] + '? ' + fmt(g) + ' >= ' + c[0] + ' is ' + yn(ok) +
        (ok ? '.' : '. Try the next condition.'));
      if (ok) {
        t.step(c[3], c[4] + 1, 'This branch runs: print the letter grade.', 'Letter grade: ' + c[1] + '\n');
        t.step('join', 19, 'One branch ran, so every remaining else if / else is skipped.');
        t.step('end', 20, 'return 0; the program ends.');
        return;
      }
    }
    t.step('oF', 17, 'Every condition was false, so the final else runs.');
    t.step('oF', 18, 'Print the letter grade.', 'Letter grade: F\n');
    t.step('join', 19, 'End of the ladder.');
    t.step('end', 20, 'return 0; the program ends.');
  });

  /* Nested ifs: leap year (leap_year.cpp, nested version) */
  C.addTrace('l6-leap', function (v, t) {
    var y = Math.trunc(v.year);
    t.step('start', 4, 'main() starts.');
    t.step(null, 5, 'Declare int year.');
    t.step('in', 6, 'Print the prompt.', 'Enter a year: ');
    t.vars.year = y;
    t.input('in', 7, 'cin reads year = ' + y + '.', String(y));
    var r4 = y % 4, r100 = y % 100, r400 = y % 400;
    t.step('d4', 9, 'Outer if: year % 4 = ' + r4 + ', so year % 4 == 0 is ' + yn(r4 === 0) + '.');
    if (r4 !== 0) {
      t.step('o4', 19, 'The outer else runs (the inner ifs are never reached).');
      t.step('o4', 20, 'Print the result.', 'Not a leap year\n');
    } else {
      t.step('d100', 10, 'Middle if: year % 100 = ' + r100 + ', so year % 100 == 0 is ' + yn(r100 === 0) + '.');
      if (r100 !== 0) {
        t.step('o100', 16, 'Divisible by 4 but not by 100: the middle else runs.');
        t.step('o100', 17, 'Print the result.', 'Leap year\n');
      } else {
        t.step('d400', 11, 'Inner if: year % 400 = ' + r400 + ', so year % 400 == 0 is ' + yn(r400 === 0) + '.');
        if (r400 === 0) {
          t.step('o400y', 12, 'Divisible by 400: a leap year.', 'Leap year\n');
        } else {
          t.step('o400n', 13, 'A century year not divisible by 400: the inner else runs.');
          t.step('o400n', 14, 'Print the result.', 'Not a leap year\n');
        }
      }
    }
    t.step('join', 21, 'All the if blocks close here.');
    t.step('end', 22, 'return 0; the program ends.');
  });

  /* switch on a char: calculator (calculator.cpp) */
  C.addTrace('l6-calc', function (v, t) {
    var a = v.a, b = v.b, op = String(v.op).trim().charAt(0);
    if (!op) throw new Error('Type an operator in the op box, e.g. + - * /');
    t.step('start', 4, 'main() starts.');
    t.step(null, 5, 'Declare double a, b and char op (no values yet).');
    t.step('in', 7, 'Print the prompt.', 'Enter a op b: ');
    t.vars.a = a; t.vars.op = chr(op); t.vars.b = b;
    t.input('in', 8, 'cin reads a number, one non-space character, then another number.', fmt(a) + ' ' + op + ' ' + fmt(b));
    t.step(null, 10, "switch (op): op is '" + op + "'. Control jumps to the matching case label. (The flowchart shows this as a chain of decisions.)");
    var cases = [['+', 'dPlus', 'oPlus', 11, a + b], ['-', 'dMinus', 'oMinus', 12, a - b], ['*', 'dTimes', 'oTimes', 13, a * b]];
    for (var k = 0; k < cases.length; k++) {
      var c = cases[k];
      if (op === c[0]) {
        t.step(c[1], c[3], "op == '" + c[0] + "'? Yes: this is the matching case.");
        t.step(c[2], c[3], 'Print the result: ' + fmt(a) + ' ' + c[0] + ' ' + fmt(b) + ' = ' + C.cout(c[4]) + '. Then break leaves the switch.', '= ' + C.cout(c[4]) + '\n');
        t.step('join', 23, 'After break, execution continues after the switch.');
        t.step('end', 24, 'return 0; the program ends.');
        return;
      }
      t.step(c[1], 10, "op == '" + c[0] + "'? No.");
    }
    if (op === '/') {
      t.step('dDiv', 14, "op == '/'? Yes: case '/' matches.");
      var safe = b !== 0;
      t.step('dZero', 15, 'Nested if: b != 0? ' + fmt(b) + ' != 0 is ' + yn(safe) + '.');
      if (safe) t.step('oDiv', 16, 'Safe to divide: ' + fmt(a) + ' / ' + fmt(b) + ' = ' + C.cout(a / b) + '.', '= ' + C.cout(a / b) + '\n');
      else t.step('oErr', 18, 'Division by zero is blocked: print the error.', 'Cannot divide by 0\n');
      t.step('join', 20, 'break; leaves the switch.');
    } else {
      t.step('dDiv', 10, "op == '/'? No.");
      t.step('oDef', 21, "No case label matches '" + op + "', so control jumps to default.");
      t.step('oDef', 22, 'Print the message.', 'Unknown operator\n');
      t.step('join', 23, 'default is last, so the switch ends here.');
    }
    t.step('end', 24, 'return 0; the program ends.');
  });
})();
