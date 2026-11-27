/* ==========================================================================
   Lab 4 · Operators and Its Hierarchy · tracers
     t.step(node, line, message, output)   output is printed exactly ('\n' = endl)
     t.input(node, line, message, typed)   what the user types at a cin prompt
     t.vars.name = value                   shown in the Memory panel
   Integer math is emulated with Math.trunc (C++ int division truncates toward zero);
   JavaScript's % already follows the sign of the left operand, like C++.
   ========================================================================== */
(function () {
  'use strict';
  var C = window.CPE104L;
  function idiv(a, b) { return Math.trunc(a / b); }
  function b2s(b) { return b ? 'true' : 'false'; }

  /* Prefix vs postfix ++ / -- (no inputs: the code starts with a = 5) */
  C.addTrace('l4-incdec', function (v, t) {
    t.step(null, 4, 'main() starts.');
    t.vars.a = 5;
    t.step(null, 5, 'a is created and set to 5.');
    t.vars.b = 5;
    t.step(null, 6, 'Postfix a++: the CURRENT value of a (5) is used first, so b gets 5…');
    t.vars.a = 6;
    t.step(null, 6, '…and only then is a increased. Now a = 6 and b = 5.');
    t.vars.a = 7;
    t.step(null, 7, 'Prefix ++a: a is increased FIRST, so a becomes 7…');
    t.vars.c = 7;
    t.step(null, 7, '…then the NEW value (7) is used, so c gets 7.');
    t.step(null, 8, 'Print a.', 'a = 7\n');
    t.step(null, 9, 'Print b. It kept the old value 5.', 'b = 5\n');
    t.step(null, 10, 'Print c.', 'c = 7\n');
    t.vars.d = 7;
    t.step(null, 11, 'Postfix a--: d gets the current value of a (7)…');
    t.vars.a = 6;
    t.step(null, 11, '…then a decreases to 6.');
    t.vars.a = 5;
    t.step(null, 12, 'Prefix --a: a decreases FIRST, to 5…');
    t.vars.e = 5;
    t.step(null, 12, '…then e gets the new value 5.');
    t.step(null, 13, 'Print d, e, and a on one line (the statement continues on line 14).', 'd = 7, e = 5, a = 5\n');
    t.step(null, 15, 'return 0; the program ends normally.');
  });

  /* A program full of mixed expressions */
  C.addTrace('l4-expr', function (v, t) {
    var x = Math.trunc(v.x), y = Math.trunc(v.y);
    t.step(null, 4, 'main() starts.');
    t.step(null, 5, 'x and y are declared. They hold garbage until cin stores values.');
    t.step(null, 6, 'Prompt (no endl, so the cursor stays on this line).', 'Enter x and y: ');
    t.vars.x = x; t.vars.y = y;
    t.input(null, 7, 'cin reads two whole numbers: x = ' + x + ', y = ' + y + '.', x + ' ' + y);

    var y2 = y * 2, xm3 = x % 3, s = x + y2, r1 = s - xm3;
    t.vars.r1 = r1;
    t.step(null, 8, 'r1: * and % go before + and -. y * 2 = ' + y2 + ', x % 3 = ' + xm3 +
      '. Then left to right: ' + x + ' + ' + y2 + ' = ' + s + ', ' + s + ' - ' + xm3 + ' = ' + r1 + '.');

    var sum = x + y, r2 = idiv(sum, 2);
    t.vars.r2 = r2;
    t.step(null, 9, 'r2: parentheses first, (x + y) = ' + sum + '. Then ' + sum + ' / 2 is int / int = ' + r2 +
      (sum % 2 !== 0 ? ' (the .5 is dropped).' : '.'));

    var r3 = sum / 2;
    t.vars.r3 = r3;
    t.step(null, 10, 'r3: static_cast<double>(' + sum + ') makes a double, so ' + sum + '.0 / 2 = ' + C.cout(r3) + '.');

    var left = x > y, r4;
    if (left) {
      r4 = true;
      t.vars.r4 = r4;
      t.step(null, 11, 'r4: x > y is ' + x + ' > ' + y + ' = true. || already knows the answer, so the right side is skipped (short-circuit). r4 = true (prints 1).');
    } else {
      var even = y % 2 === 0, nz = x !== 0, right = even && nz;
      r4 = right;
      t.vars.r4 = r4;
      t.step(null, 11, 'r4: x > y is false, so || checks the right side: y % 2 == 0 is ' + b2s(even) +
        (even ? ', x != 0 is ' + b2s(nz) : ' (&& stops here)') + '. r4 = ' + b2s(r4) + ' (prints ' + (r4 ? 1 : 0) + ').');
    }

    var oldY = y, prod = oldY * 2, newX = x + prod;
    t.vars.y = oldY + 1;
    t.step(null, 12, 'x += y++ * 2: y++ hands over the OLD y (' + oldY + '), then y becomes ' + (oldY + 1) + '. ' + oldY + ' * 2 = ' + prod + '.');
    t.vars.x = newX;
    t.step(null, 12, 'Assignment happens last: x = ' + x + ' + ' + prod + ' = ' + newX + '.');

    t.step(null, 13, 'Print r1.', 'r1 = ' + r1 + '\n');
    t.step(null, 14, 'Print r2.', 'r2 = ' + r2 + '\n');
    t.step(null, 15, 'Print r3 (a double prints without trailing zeros).', 'r3 = ' + C.cout(r3) + '\n');
    t.step(null, 16, 'Print r4. Without boolalpha, a bool prints as 1 or 0.', 'r4 = ' + (r4 ? 1 : 0) + '\n');
    t.step(null, 17, 'Print the new x and y.', 'x = ' + newX + ', y = ' + (oldY + 1) + '\n');
    t.step(null, 18, 'return 0; the program ends normally.');
  });

  /* Digit extraction with / and % */
  C.addTrace('l4-digits', function (v, t) {
    var n = Math.trunc(v.reading);
    t.step(null, 4, 'main() starts.');
    t.step(null, 6, 'Prompt for the reading.', 'Enter a 3-digit reading: ');
    t.vars.reading = n;
    t.input(null, 7, 'cin stores ' + n + ' in reading.', n);
    var h = idiv(n, 100);
    t.vars.hundreds = h;
    t.step(null, 8, n + ' / 100 = ' + h + ' (integer division drops the last two digits).');
    var q = idiv(n, 10), tn = q % 10;
    t.vars.tens = tn;
    t.step(null, 9, 'Parentheses first: ' + n + ' / 10 = ' + q + '. Then ' + q + ' % 10 = ' + tn + ' (keep only its last digit).');
    var o = n % 10;
    t.vars.ones = o;
    t.step(null, 10, n + ' % 10 = ' + o + ' (the remainder after dividing by 10 is the last digit).');
    var rev = o * 100 + tn * 10 + h;
    t.vars.reversed = rev;
    t.step(null, 11, 'Rebuild in reverse: ' + o + ' * 100 + ' + tn + ' * 10 + ' + h + ' = ' + rev + '.');
    t.step(null, 12, 'Print the hundreds digit.', 'Hundreds: ' + h + '\n');
    t.step(null, 13, 'Print the tens digit.', 'Tens    : ' + tn + '\n');
    t.step(null, 14, 'Print the ones digit.', 'Ones    : ' + o + '\n');
    t.step(null, 15, 'Print the reversed number.', 'Reversed: ' + rev + '\n');
    t.step(null, 16, 'return 0; the program ends normally.');
  });
})();
