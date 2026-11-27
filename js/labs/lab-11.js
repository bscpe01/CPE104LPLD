/* ==========================================================================
   Lab 11 · Functions · tracers
   CPE104L.addTrace(name, function (input, t) { … })
     t.vars.x = …                          shown in the Memory panel
     t.step(node, line, message, output)   output printed exactly ('\n' = endl)
     t.input(node, line, message, typed)   what the user types at a cin prompt
   A function's parameters and locals are shown as "[name] var" while the call
   is running and removed when it returns (they no longer exist).
   ========================================================================== */
(function () {
  'use strict';
  var C = window.CPE104L, fmt = C.fmt;

  /* Slide l11-flow: main → power() → back, twice */
  C.addTrace('l11-flow', function (v, t) {
    var voltage = v.voltage, current = v.current;
    function callPower(line, ampsExpr, amps, target) {
      t.step(null, line, 'Call power(voltage, ' + ampsExpr + '): main pauses here and control jumps to the definition (line 19).');
      t.vars['[power] volts'] = voltage;
      t.vars['[power] amps'] = amps;
      t.step(null, 19, 'Inside power(): the parameters are NEW variables holding copies of the arguments: volts = ' + fmt(voltage) + ', amps = ' + fmt(amps) + '.');
      var watts = voltage * amps;
      t.vars['[power] watts'] = watts;
      t.step(null, 20, 'watts = ' + fmt(voltage) + ' × ' + fmt(amps) + ' = ' + fmt(watts) + ' (a local variable of power).');
      t.step(null, 21, 'return watts sends ' + fmt(watts) + ' back to the caller at line ' + line + '.');
      delete t.vars['[power] volts']; delete t.vars['[power] amps']; delete t.vars['[power] watts'];
      t.vars[target] = watts;
      t.step(null, line, 'Back in main: the call is replaced by ' + fmt(watts) + ', so ' + target + ' = ' + fmt(watts) + '. power\'s variables are gone.');
      return watts;
    }
    t.step(null, 6, 'main() starts.');
    t.step(null, 7, 'Declare voltage and current (no values yet).');
    t.step(null, 8, 'Prompt the user (no endl, so the cursor stays on this line).', 'Enter volts and amps: ');
    t.vars.voltage = voltage; t.vars.current = current;
    t.input(null, 9, 'cin reads voltage = ' + fmt(voltage) + ' and current = ' + fmt(current) + '.', fmt(voltage) + ' ' + fmt(current));
    var p1 = callPower(11, 'current', current, 'p1');
    t.step(null, 12, 'Print p1.', 'Power = ' + C.cout(p1) + ' W\n');
    var p2 = callPower(14, 'current * 2', current * 2, 'p2');
    t.step(null, 15, 'Print p2: the same function, reused with a different argument.', '2x current: ' + C.cout(p2) + ' W\n');
    t.step(null, 16, 'return 0; the program ends normally.');
  });

  /* Slide l11-swap-trace: the classic swap, by value and by reference */
  C.addTrace('l11-swap', function (v, t) {
    var a = 5, b = 9, x, y, temp;
    t.step(null, 16, 'main() starts.');
    t.vars.a = a; t.vars.b = b;
    t.step(null, 17, 'a = 5 and b = 9.');
    t.step(null, 18, 'Call swapByValue(a, b): the VALUES 5 and 9 are copied into new variables x and y.');
    x = a; y = b;
    t.vars['x (copy of a)'] = x; t.vars['y (copy of b)'] = y;
    t.step(null, 4, 'Inside swapByValue: x and y are separate boxes (copies).');
    temp = x; t.vars.temp = temp;
    t.step(null, 5, 'temp = x → 5.');
    x = y; t.vars['x (copy of a)'] = x;
    t.step(null, 6, 'x = y → x is 9. Only the copy changed; a is still 5.');
    y = temp; t.vars['y (copy of b)'] = y;
    t.step(null, 7, 'y = temp → y is 5. The copies are swapped; a and b are not.');
    delete t.vars['x (copy of a)']; delete t.vars['y (copy of b)']; delete t.vars.temp;
    t.step(null, 8, 'swapByValue ends: x, y, and temp are destroyed. a = 5, b = 9 are unchanged.');
    t.step(null, 19, 'Print a and b.', 'By val: a=' + a + ' b=' + b + '\n');
    t.step(null, 20, 'Call swapByReference(a, b): x becomes another name for a, y another name for b. Nothing is copied.');
    t.vars['x (alias of a)'] = a; t.vars['y (alias of b)'] = b;
    t.step(null, 10, 'Inside swapByReference: x IS a, and y IS b.');
    temp = a; t.vars.temp = temp;
    t.step(null, 11, 'temp = x → 5.');
    a = b; t.vars.a = a; t.vars['x (alias of a)'] = a;
    t.step(null, 12, 'x = y → stores 9 in x, which is a. a is now 9.');
    b = temp; t.vars.b = b; t.vars['y (alias of b)'] = b;
    t.step(null, 13, 'y = temp → stores 5 in y, which is b. b is now 5.');
    delete t.vars['x (alias of a)']; delete t.vars['y (alias of b)']; delete t.vars.temp;
    t.step(null, 14, 'swapByReference ends: the names x and y disappear, but the changes to a and b stay.');
    t.step(null, 21, 'Print a and b.', 'By ref: a=' + a + ' b=' + b + '\n');
    t.step(null, 22, 'return 0; the program ends normally.');
  });

  /* Slide l11-seatwork: sort three integers with sortTwo(int&, int&) */
  C.addTrace('l11-sort', function (v, t) {
    var m = { a: Math.trunc(v.a), b: Math.trunc(v.b), c: Math.trunc(v.c) };
    function sortTwo(line, n1, n2, note) {
      t.step(null, line, 'Call sortTwo(' + n1 + ', ' + n2 + '): first is another name for ' + n1 + ', second for ' + n2 + '. ' + note);
      var F = 'first (alias of ' + n1 + ')', S = 'second (alias of ' + n2 + ')';
      t.vars[F] = m[n1]; t.vars[S] = m[n2];
      t.step(null, 4, 'Inside sortTwo: first = ' + m[n1] + ', second = ' + m[n2] + '.');
      var swap = m[n1] > m[n2];
      t.step(null, 5, 'first > second? ' + m[n1] + ' > ' + m[n2] + ' is ' + (swap ? 'TRUE, so swap.' : 'FALSE, so leave them.'));
      if (swap) {
        var temp = m[n1];
        t.vars.temp = temp;
        t.step(null, 6, 'temp = first → ' + temp + '.');
        m[n1] = m[n2]; t.vars[n1] = m[n1]; t.vars[F] = m[n1];
        t.step(null, 7, 'first = second → ' + n1 + ' becomes ' + m[n1] + ' (in main!).');
        m[n2] = temp; t.vars[n2] = m[n2]; t.vars[S] = m[n2];
        t.step(null, 8, 'second = temp → ' + n2 + ' becomes ' + m[n2] + '.');
        delete t.vars.temp;
      }
      delete t.vars[F]; delete t.vars[S];
      t.step(null, 10, 'sortTwo returns. Now a = ' + m.a + ', b = ' + m.b + ', c = ' + m.c + '.');
    }
    t.step(null, 12, 'main() starts.');
    t.step(null, 13, 'Declare a, b, c.');
    t.step(null, 14, 'Prompt the user.', 'Enter three integers: ');
    t.vars.a = m.a; t.vars.b = m.b; t.vars.c = m.c;
    t.input(null, 15, 'cin reads a = ' + m.a + ', b = ' + m.b + ', c = ' + m.c + '.', m.a + ' ' + m.b + ' ' + m.c);
    sortTwo(16, 'a', 'b', 'Goal: a <= b.');
    sortTwo(17, 'b', 'c', 'Goal: the largest value ends up in c.');
    sortTwo(18, 'a', 'b', 'Goal: put the first two in order.');
    t.step(null, 19, 'Print a and b (the line continues).', 'Sorted: ' + m.a + ' ' + m.b);
    t.step(null, 20, 'Print c and end the line.', ' ' + m.c + '\n');
    t.step(null, 21, 'return 0; the program ends normally.');
  });
})();
