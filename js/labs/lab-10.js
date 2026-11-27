/* ==========================================================================
   Lab 10 · References and Pointers · tracers
   CPE104L.addTrace(name, function (input, t) { … })
     t.vars.x = …                          shown in the Memory panel
     t.step(node, line, message, output)   output printed exactly ('\n' = endl)
   Addresses are illustrative (they change on every real run). Pointer values
   are shown without quotes via C.raw(), e.g. 0x7ffd10 (&x), so students can see the target.
   ========================================================================== */
(function () {
  'use strict';
  var C = window.CPE104L;

  /* Slide l10-references: a reference is another name for x */
  C.addTrace('l10-ref', function (v, t) {
    var REF = 'ref (alias of x)';
    t.step(null, 4, 'main() starts.');
    t.vars.x = 10;
    t.step(null, 5, 'Declare x and store 10 in it.');
    t.vars[REF] = t.vars.x;
    t.step(null, 6, 'ref becomes another name for x. No new box is made: x and ref are the same memory.');
    t.vars.x = 20; t.vars[REF] = 20;
    t.step(null, 8, 'ref = 20 stores 20 in the box named x (and ref).');
    t.step(null, 9, 'Print x and ref: both are 20.', 'x=20 ref=20\n');
    t.vars.x = 25; t.vars[REF] = 25;
    t.step(null, 11, 'x = x + 5 gives 25. ref "sees" the change because it is the same box.');
    t.step(null, 12, 'Print x and ref again.', 'x=25 ref=25\n');
    t.vars.y = 99;
    t.step(null, 14, 'Declare a separate variable y = 99 (its own box).');
    t.vars.x = 99; t.vars[REF] = 99;
    t.step(null, 15, 'ref = y COPIES 99 into x. ref still means x; a reference can never be re-seated to y.');
    t.vars.y = 1;
    t.step(null, 16, 'y = 1 changes only y. x stays 99.');
    t.step(null, 17, 'Print x and ref (no endl yet, so the line continues).', 'x=99 ref=99');
    t.step(null, 18, 'Print y, then end the line.', ' y=1\n');
    t.step(null, 19, '&ref == &x is true, printed as 1: a reference has the same address as the original.', '1\n');
    t.step(null, 20, 'return 0; the program ends normally.');
  });

  /* Slide l10-ptr-trace: change x and y through the pointer p */
  C.addTrace('l10-through', function (v, t) {
    var AX = '0x7ffd10', AY = '0x7ffd14';
    t.step(null, 4, 'main() starts.');
    t.vars.x = 10;
    t.step(null, 5, 'x = 10 (illustrative address ' + AX + ').');
    t.vars.y = 50;
    t.step(null, 6, 'y = 50 (illustrative address ' + AY + ').');
    t.vars.p = C.raw(AX + ' (&x)');
    t.vars['*p'] = t.vars.x;
    t.step(null, 7, 'p stores the ADDRESS of x. Following p (*p) gives 10.');
    t.vars.x = 25; t.vars['*p'] = 25;
    t.step(null, 9, '*p = 25: follow the arrow to x and store 25 there. x changes even though line 9 never names x.');
    t.step(null, 10, 'Print x and y.', 'x = 25, y = 50\n');
    t.vars.p = C.raw(AY + ' (&y)'); t.vars['*p'] = t.vars.y;
    t.step(null, 12, 'p = &y moves the arrow: p now holds the address of y. x is NOT changed.');
    t.vars.y = 51; t.vars['*p'] = 51;
    t.step(null, 13, '*p = *p + 1: read y through p (50), add 1, store 51 back into y.');
    t.step(null, 14, 'Print x and y.', 'x = 25, y = 51\n');
    t.step(null, 15, 'Print *p: the value p points to, which is y.', '*p = 51\n');
    t.step(null, 16, 'return 0; the program ends normally.');
  });

  /* Slide l10-ptr-traverse: sum an array by moving a pointer */
  C.addTrace('l10-traverse', function (v, t) {
    var data = [12, 7, 30, 18, 25], SIZE = data.length, sum = 0;
    t.step(null, 4, 'main() starts.');
    t.vars.SIZE = SIZE;
    t.step(null, 5, 'SIZE is a constant: 5.');
    t.vars.scores = data.slice();
    t.step(null, 6, 'The array scores holds 5 ints side by side.');
    t.vars.sum = 0;
    t.step(null, 7, 'sum starts at 0.');
    t.vars.p = C.raw('&scores[0]'); t.vars['*p'] = data[0];
    t.step(null, 9, 'Loop start: p = scores, so p points to element 0.');
    for (var k = 0; k <= SIZE; k++) {
      if (k > 0) {
        t.vars.p = C.raw(k < SIZE ? '&scores[' + k + ']' : 'scores + 5 (one past the end)');
        if (k < SIZE) t.vars['*p'] = data[k]; else delete t.vars['*p'];
        t.step(null, 9, 'p++ moves p ONE ELEMENT (4 bytes) forward' + (k < SIZE ? ', to element ' + k + '.' : ', to one past the end.'));
      }
      var ok = k < SIZE;
      t.step(null, 9, 'Test p < scores + SIZE → ' + (ok ? 'element ' + k + ' is inside the array → true.' : 'p has reached scores + 5 → false, the loop ends.'));
      if (!ok) break;
      sum += data[k];
      t.vars.sum = sum;
      t.step(null, 10, 'sum += *p → sum + ' + data[k] + ' = ' + sum + '.');
      t.step(null, 11, 'Print *p and a space.', data[k] + ' ');
    }
    delete t.vars.p; delete t.vars['*p'];
    t.step(null, 13, 'After the loop: p no longer exists (it was declared in the for). endl ends the line.', '\n');
    t.step(null, 14, 'Print the sum.', 'Sum = ' + C.cout(sum) + '\n');
    t.step(null, 15, 'return 0; the program ends normally.');
  });
})();
