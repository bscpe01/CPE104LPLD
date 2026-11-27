/* Tracers for labs/lab-14.html (Intro to OOP: Polymorphism).
   Line numbers refer to the code blocks on the slides (shapes.cpp, sensors.cpp). */
(function () {
  'use strict';
  var C = window.CPE104L;

  /* ---------- shapes.cpp: an array of Shape* (which area() runs?) ---------- */
  C.addTrace('l14-shapes', function (v, t) {
    var PI = 3.14159;
    var shapes = [
      { obj: 'c', cls: 'Circle', nameLine: 19, areaLine: 18, area: PI * 2 * 2, how: '3.14159 × 2 × 2' },
      { obj: 'r', cls: 'Rectangle', nameLine: 28, areaLine: 27, area: 4 * 5, how: '4 × 5' },
      { obj: 't', cls: 'Triangle', nameLine: 37, areaLine: 36, area: 0.5 * 3 * 6, how: '0.5 × 3 × 6' }
    ];
    t.step(null, 45, 'main() starts.');
    t.vars.c = 'Circle';
    t.step(null, 46, 'Create a Circle object c. Its constructor (line 17) stores radius = 2.');
    t.vars.r = 'Rectangle';
    t.step(null, 47, 'Create a Rectangle object r (width 4, height 5).');
    t.vars.t = 'Triangle';
    t.step(null, 48, 'Create a Triangle object t (base 3, height 6).');
    t.vars.shapes = '&c,&r,&t';
    t.step(null, 50, 'An array of three Shape* pointers. Each one points to a DIFFERENT kind of object.');
    var total = 0;
    t.vars.total = total;
    t.step(null, 51, 'total = 0.0');
    for (var i = 0; i < 3; i++) {
      var s = shapes[i];
      t.vars.i = i;
      t.vars['*shapes[i]'] = s.cls;
      t.step(null, 52, (i === 0 ? 'Loop starts: i = 0. ' : 'i++ → i = ' + i + '. ') + 'Is ' + i + ' < 3? Yes.');
      t.vars.s = s.obj;
      t.step(null, 53, 'report(*shapes[' + i + ']): the reference s now refers to ' + s.obj + ', which is a ' + s.cls + '.');
      t.step(null, 42, 's.name() is virtual, so C++ checks the real object: it is a ' + s.cls + '.');
      t.step(null, s.nameLine, s.cls + '::name() runs and returns "' + s.cls + '".');
      t.step(null, s.areaLine, 's.area() is virtual too → ' + s.cls + '::area() runs: ' + s.how + ' = ' + C.cout(s.area) + '.');
      t.step(null, 42, 'report prints the line.', s.cls + ' area = ' + C.cout(s.area) + '\n');
      delete t.vars.s;
      t.step(null, 54, 'shapes[' + i + ']->area(): a virtual call through a POINTER, so ' + s.cls + '::area() runs again.');
      total += s.area;
      t.vars.total = total;
      t.step(null, s.areaLine, s.cls + '::area() returns ' + C.cout(s.area) + '. total = ' + C.cout(total) + '.');
    }
    t.vars.i = 3;
    delete t.vars['*shapes[i]'];
    t.step(null, 52, 'i++ → i = 3. Is 3 < 3? No, so the loop ends.');
    t.step(null, 56, 'Print the total area (cout shows 6 significant digits).', 'Total area = ' + C.cout(total) + '\n');
    t.step(null, 57, 'return 0; The same loop handled three different classes.');
  });

  /* ---------- sensors.cpp: polymorphic monitoring loop ---------- */
  C.addTrace('l14-sensors', function (v, t) {
    var sensors = [
      { cls: 'TemperatureSensor', id: 'TEMP-01', newLine: 40, readLine: 19, unitLine: 20, value: 31.5, unit: 'deg C' },
      { cls: 'LightSensor', id: 'LUX-02', newLine: 41, readLine: 26, unitLine: 27, value: 420.0, unit: 'lux' },
      { cls: 'DistanceSensor', id: 'DIST-03', newLine: 42, readLine: 33, unitLine: 34, value: 12.5, unit: 'cm' }
    ];
    t.step(null, 37, 'main() starts.');
    t.vars.COUNT = 3;
    t.step(null, 38, 'COUNT = 3 sensors.');
    sensors.forEach(function (s, k) {
      t.vars['sensors[' + k + ']'] = s.id;
      t.step(null, s.newLine, 'new ' + s.cls + '("' + s.id + '") creates the object on the heap. Its constructor passes the ID up to Sensor(sid) (constructor chaining). The address goes into sensors[' + k + '], a Sensor*.');
    });
    t.step(null, 45, 'Print the header.', '--- Monitoring cycle ---\n');
    sensors.forEach(function (s, i) {
      t.vars.i = i;
      t.step(null, 46, (i === 0 ? 'Loop starts: i = 0. ' : 'i++ → i = ' + i + '. ') + 'Is ' + i + ' < 3? Yes.');
      t.step(null, 13, 'getId() is NOT virtual (same for every sensor): Sensor::getId() returns "' + s.id + '".');
      t.step(null, s.readLine, 'read() is pure virtual in Sensor, so the object decides: ' + s.cls + '::read() returns ' + C.cout(s.value) + '.');
      t.step(null, s.unitLine, 'unit() → ' + s.cls + '::unit() returns "' + s.unit + '".');
      t.step(null, 47, 'cout prints one line for this sensor.', s.id + ': ' + C.cout(s.value) + ' ' + s.unit + '\n');
    });
    t.vars.i = 3;
    t.step(null, 46, 'i++ → i = 3. Is 3 < 3? No, so the monitoring loop ends.');
    t.step(null, 51, 'A second loop frees the three objects made with new.');
    sensors.forEach(function (s, k) {
      t.vars.i = k;
      t.vars['sensors[' + k + ']'] = 'deleted';
      t.step(null, 52, 'delete sensors[' + k + ']: because ~Sensor() is virtual, ~' + s.cls + '() runs first, then ~Sensor() (line 10). No leak.');
    });
    delete t.vars.i;
    t.step(null, 54, 'return 0; Every new had a matching delete.');
  });
})();
