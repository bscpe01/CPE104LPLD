/* ==========================================================================
   Lab 1 · tracers for the guided problems
   Each trace: CPE104L.addTrace(name, function (input, t) { … })
     t.step(node, line, message, output)   node = flowchart data-node, line = code line
     t.input(node, line, message, typed)   shows what the user typed (cin / INPUT)
     t.vars.name = value                   shown in the Memory panel
   ========================================================================== */
(function () {
  'use strict';
  var C = window.CPE104L, fmt = C.fmt;
  function verdict(ok) { return ok ? 'TRUE → Yes' : 'FALSE → No'; }

  /* Problem 1: START / DISPLAY 5 / END */
  C.addTrace('p1', function (v, t) {
    t.step('start', 2, 'Start: the program begins.');
    t.step('out', 3, 'Output: display the number 5.', '5\n');
    t.step('end', 4, 'End: the program stops.');
  });

  /* Problem 2: the old man's age */
  C.addTrace('p2', function (v, t) {
    t.step('start', 2, 'Start: the program begins.');
    t.vars.programmer_age = v.programmer_age;
    t.vars.teacher_age = v.teacher_age;
    t.vars.peter_age = v.peter_age;
    t.input('in', 3, 'Input: read the three ages.', fmt(v.programmer_age) + ' ' + fmt(v.teacher_age) + ' ' + fmt(v.peter_age));
    var sum = v.programmer_age + v.teacher_age;
    t.vars.sum = sum;
    t.step('sum', 4, 'Process: sum = ' + fmt(v.programmer_age) + ' + ' + fmt(v.teacher_age) + ' = ' + fmt(sum) + '.');
    var age = sum - v.peter_age;
    t.vars.old_man_age = age;
    t.step('calc', 5, 'Process: old_man_age = ' + fmt(sum) + ' - ' + fmt(v.peter_age) + ' = ' + fmt(age) + '.' +
      (age < 0 ? ' A negative age? A good case for input validation!' : ''));
    t.step('out', 6, 'Output: display old_man_age.', fmt(age) + '\n');
    t.step('end', 7, 'End: the program stops.');
  });

  /* Problem 3: adult or minor */
  C.addTrace('p3', function (v, t) {
    var a = v.programmer_age;
    t.step('start', 3, 'Start: the program begins.');
    t.vars.programmer_age = a;
    t.input('in', 4, 'Input: programmer_age = ' + fmt(a) + '.', fmt(a));
    var ok = a >= 18;
    t.step('dec', 5, 'Decision: programmer_age >= 18? → ' + fmt(a) + ' >= 18 is ' + verdict(ok) + '.');
    if (ok) t.step('adult', 6, 'Yes branch: display "Adult".', 'Adult\n');
    else t.step('minor', 8, 'No (ELSE) branch: display "Minor".', 'Minor\n');
    t.step('join', 9, 'ENDIF: both branches meet here.');
    t.step('end', 10, 'End: the program stops.');
  });

  /* Problem 4: letter grade */
  C.addTrace('p4', function (v, t) {
    var g = v.grade;
    t.step('start', 3, 'Start: the program begins.');
    t.vars.grade = g;
    t.input('in', 4, 'Input: grade = ' + fmt(g) + '.', fmt(g));
    var checks = [[90, 'A', 'd90', 'oA', 5, 6], [80, 'B', 'd80', 'oB', 7, 8], [70, 'C', 'd70', 'oC', 9, 10], [60, 'D', 'd60', 'oD', 11, 12]];
    for (var k = 0; k < checks.length; k++) {
      var c = checks[k], ok = g >= c[0];
      t.step(c[2], c[4], 'Decision: grade >= ' + c[0] + '? → ' + fmt(g) + ' >= ' + c[0] + ' is ' + verdict(ok) + '.');
      if (ok) {
        t.step(c[3], c[5], 'Output: display "' + c[1] + '".', c[1] + '\n');
        t.step('join', 15, 'ENDIF: all branches meet here.');
        t.step('end', 16, 'End: the program stops.');
        return;
      }
    }
    t.step('oF', 14, 'Every condition was FALSE → ELSE branch: display "F".', 'F\n');
    t.step('join', 15, 'ENDIF: all branches meet here.');
    t.step('end', 16, 'End: the program stops.');
  });

  /* Problem 5 (seatwork): multiples of 3 from 1 to 100 */
  C.addTrace('p5', function (v, t) {
    var count = 0;
    t.step('start', 3, 'Start: the program begins.');
    t.vars.num = 1;
    t.step('init', 4, 'Initialize the counter: num = 1.');
    for (;;) {
      var n = t.vars.num, inRange = n <= 100;
      t.step('loop', 5, 'Loop test: num <= 100? → ' + n + ' <= 100 is ' + (inRange ? 'TRUE → enter the loop' : 'FALSE → exit the loop') + '.');
      if (!inRange) break;
      var d = n % 3 === 0;
      t.step('mod', 6, 'Decision: num % 3 = 0? → ' + n + ' % 3 = ' + (n % 3) + ' → ' + (d ? 'TRUE → Yes' : 'FALSE → No') + '.');
      if (d) { count++; t.step('out', 7, 'Output: display ' + n + ' (number ' + count + ' so far).', n + '\n'); }
      t.vars.num = n + 1;
      t.step('inc', 9, 'Update: num = ' + n + ' + 1 = ' + (n + 1) + '. Go back to the loop test.');
    }
    t.step('end', 11, 'End: ' + count + ' numbers were displayed.');
  });

  /* Worked example: Ohm's law (code only, no flowchart) */
  C.addTrace('ohm', function (v, t) {
    var V = v.voltage, R = v.resistance;
    t.step(null, 3, 'Start: the program begins.');
    t.step(null, 4, 'Prompt: show a message asking for input.', 'Enter voltage (V) and resistance (ohms): ');
    t.vars.voltage = V; t.vars.resistance = R;
    t.input(null, 5, 'Input: voltage = ' + fmt(V) + ', resistance = ' + fmt(R) + '.', fmt(V) + ' ' + fmt(R));
    var zero = R === 0;
    t.step(null, 6, 'Decision: resistance = 0? → ' + (zero ? 'TRUE: guard against division by zero.' : 'FALSE: safe to divide.'));
    if (zero) {
      t.step(null, 7, 'Output: show the error message.', 'Error: resistance cannot be zero.\n');
    } else {
      var I = V / R;
      t.vars.current = I;
      t.step(null, 9, 'Process: current = ' + fmt(V) + ' / ' + fmt(R) + ' = ' + fmt(I) + '.');
      t.step(null, 10, 'Output: display the current.', 'Current = ' + fmt(I) + ' A\n');
    }
    t.step(null, 11, 'ENDIF: both branches meet here.');
    t.step(null, 12, 'End: the program stops.');
  });
})();
