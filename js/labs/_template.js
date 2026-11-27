/* Tracer example for labs/_template.html. Copy this pattern into js/labs/lab-XX.js.
   CPE104L.addTrace(name, function (input, t) { … })
     input            values from the tracer's <input data-var="…"> fields
     t.vars.x = …     variables shown in the Memory panel (snapshot taken at each step)
     t.step(node, line, message, output)   output is printed exactly; include '\n' for endl
     t.input(node, line, message, typed)   what the user types at a cin prompt
   node = data-node of the flowchart symbol to highlight (or null); line = code line number. */
(function () {
  'use strict';
  var C = window.CPE104L, fmt = C.fmt;

  C.addTrace('demo-average', function (v, t) {
    t.step('start', 4, 'main() starts running.');
    t.vars.q1 = 0; t.vars.q2 = 0; t.vars.q3 = 0;
    t.step(null, 5, 'Declare three double variables (values not set yet).');
    t.step('in', 6, 'cout prints the prompt (no newline, so the cursor waits on the same line).', 'Enter 3 quiz scores: ');
    t.vars.q1 = v.q1; t.vars.q2 = v.q2; t.vars.q3 = v.q3;
    t.input('in', 7, 'cin reads three numbers separated by spaces.', fmt(v.q1) + ' ' + fmt(v.q2) + ' ' + fmt(v.q3));
    var avg = (v.q1 + v.q2 + v.q3) / 3;
    t.vars.average = avg;
    t.step('calc', 8, 'Compute (' + fmt(v.q1) + ' + ' + fmt(v.q2) + ' + ' + fmt(v.q3) + ') / 3 = ' + fmt(avg) + '.');
    t.step('out', 9, 'Display the average, then endl moves to a new line.', 'Average = ' + fmt(avg) + '\n');
    t.step('end', 10, 'return 0; tells the operating system the program ended normally.');
  });
})();
