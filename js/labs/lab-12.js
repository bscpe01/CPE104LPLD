/* ==========================================================================
   Lab 12 · Intro to OOP: Classes and Objects · tracers
     t.step(node, line, message, output)   line = code line to highlight
     t.input(node, line, message, typed)   what the user types at a cin prompt
     t.vars['obj.member'] = value          shown in the Memory panel
   Object members are shown as "object.member" so students see that each
   object has its own copy of every data member.
   ========================================================================== */
(function () {
  'use strict';
  var C = window.CPE104L, fmt = C.fmt, out = C.cout;

  /* A value shown without quotes in the Memory panel (e.g. an uninitialized member). */
  function raw(text) { return { shown: text, toString: function () { return text; } }; }
  var GARBAGE = raw('(garbage)');

  /* rectangle.cpp: two objects, one class (creation + dot operator + method call) */
  C.addTrace('l12-objects', function (v, t) {
    t.step(null, 14, 'main() starts. The class on lines 4–12 is only a blueprint, so no Rectangle exists yet.');
    t.vars['r1.length'] = GARBAGE; t.vars['r1.width'] = GARBAGE;
    t.step(null, 15, 'Rectangle r1; creates the first object. It gets its own length and width, but nothing has set them yet.');
    t.vars['r2.length'] = GARBAGE; t.vars['r2.width'] = GARBAGE;
    t.step(null, 16, 'Rectangle r2; creates a second, separate object with its own length and width.');
    t.vars['r1.length'] = 4;
    t.step(null, 17, 'The dot operator picks r1\'s member: r1.length = 4.');
    t.vars['r1.width'] = 2.5;
    t.step(null, 18, 'r1.width = 2.5.');
    t.vars['r2.length'] = 3;
    t.step(null, 19, 'r2.length = 3. Object r1 is not affected.');
    t.vars['r2.width'] = 3;
    t.step(null, 20, 'r2.width = 3. Each object now holds its own values.');
    var a1 = 4 * 2.5, a2 = 3 * 3;
    t.step(null, 21, 'r1.area() calls the member function on object r1.');
    t.step(null, 10, 'Inside area(), length and width mean r1\'s members: 4 * 2.5 = ' + out(a1) + '. Return ' + out(a1) + '.');
    t.step(null, 21, 'cout prints the label and the returned value, then endl.', 'r1 area = ' + out(a1) + '\n');
    t.step(null, 22, 'r2.area() runs the same code, this time on object r2.');
    t.step(null, 10, 'Now length and width mean r2\'s members: 3 * 3 = ' + out(a2) + '. Return ' + out(a2) + '.');
    t.step(null, 22, 'cout prints the second result.', 'r2 area = ' + out(a2) + '\n');
    t.step(null, 23, 'return 0; ends the program.');
  });

  /* student_ctor.cpp: which constructor runs, and in what order */
  C.addTrace('l12-ctor', function (v, t) {
    t.step(null, 21, 'main() starts. No Student objects exist yet.');
    t.step(null, 22, 's1 is declared with two arguments ("Ana", 91.5), so C++ picks Student(string, double).');
    t.vars['s1.name'] = 'Ana'; t.vars['s1.grade'] = 91.5;
    t.step(null, 13, 'The member initializer list sets s1.name = "Ana" and s1.grade = 91.5 before the body runs.');
    t.step(null, 14, 'The constructor body prints its message.', 'Constructor: Ana\n');
    t.step(null, 23, 's2 is declared with no arguments, so the default constructor Student() runs.');
    t.vars['s2.name'] = 'TBA'; t.vars['s2.grade'] = 0;
    t.step(null, 10, 'Initializer list: s2.name = "TBA", s2.grade = 0.');
    t.step(null, 11, 'The default constructor body prints its message.', 'Default constructor: TBA\n');
    t.step(null, 24, 's3 has two arguments again, so Student(string, double) runs.');
    t.vars['s3.name'] = 'Ben'; t.vars['s3.grade'] = 87;
    t.step(null, 13, 'Initializer list: s3.name = "Ben", s3.grade = 87.');
    t.step(null, 14, 'The body prints. s3 is never shown later, but its constructor still ran.', 'Constructor: Ben\n');
    t.step(null, 25, 's1.show() runs show() on object s1.');
    t.step(null, 17, 'Inside show(), name and grade are s1\'s members.', 'Ana has ' + out(91.5) + '\n');
    t.step(null, 26, 's2.show() runs the same function on object s2.');
    t.step(null, 17, 'Now name and grade are s2\'s members.', 'TBA has ' + out(0) + '\n');
    t.step(null, 27, 'return 0; ends the program.');
  });

  /* circle.cpp: seatwork answer */
  C.addTrace('l12-circle', function (v, t) {
    var PI = 3.14159265358979, r = v.r;
    t.step(null, 21, 'main() starts.');
    t.vars.r = GARBAGE;
    t.step(null, 22, 'double r; is declared. It has no value yet.');
    t.step(null, 23, 'The prompt has no endl, so the cursor waits on the same line.', 'Enter radius: ');
    t.vars.r = r;
    t.input(null, 24, 'cin reads r = ' + fmt(r) + '.', fmt(r));
    t.step(null, 25, 'Circle c(r); creates object c, so the constructor Circle(double) runs with ' + fmt(r) + '.');
    t.vars['c.radius'] = r;
    t.step(null, 11, 'Initializer list: c.radius = ' + fmt(r) + '. Now r (in main) and c.radius are two separate variables.');
    var area = PI * r * r, circ = 2 * PI * r;
    t.step(null, 26, 'c.area() calls the member function on object c.');
    t.step(null, 14, 'area() returns PI * radius * radius = ' + out(area) + '.');
    t.step(null, 26, 'cout prints the area with 6 significant digits (the default).', 'Area = ' + out(area) + '\n');
    t.step(null, 27, 'c.circumference() is called on the same object.');
    t.step(null, 17, 'circumference() returns 2 * PI * radius = ' + out(circ) + '.');
    t.step(null, 27, 'cout prints the circumference.', 'Circumference = ' + out(circ) + '\n');
    t.step(null, 28, 'return 0; ends the program.');
  });
})();
