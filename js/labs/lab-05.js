/* ==========================================================================
   Lab 5 · Logical Control Structures: Sequential · tracers
     t.step(node, line, message, output)   output is printed exactly ('\n' = endl)
     t.input(node, line, message, typed)   what the user types at a cin prompt
     t.vars.name = value                   shown in the Memory panel
   C.cout(x) formats a double like default cout (6 significant digits);
   x.toFixed(2) matches cout << fixed << setprecision(2).
   ========================================================================== */
(function () {
  'use strict';
  var C = window.CPE104L, fmt = C.fmt;

  /* Celsius → Fahrenheit and Kelvin (flowchart: #l5-temp-chart) */
  C.addTrace('l5-temp', function (v, t) {
    var c = v.celsius;
    t.step('start', 4, 'Start: main() begins.');
    t.step(null, 5, 'Declare three double variables. They hold garbage until assigned.');
    t.step('in', 6, 'Prompt the user (no endl, so the cursor stays on this line).', 'Enter temperature in Celsius: ');
    t.vars.celsius = c;
    t.input('in', 7, 'Input: cin stores ' + fmt(c) + ' in celsius.', fmt(c));
    var f = c * 9 / 5 + 32;
    t.vars.fahrenheit = f;
    t.step('calcF', 8, 'Process: left to right, ' + fmt(c) + ' * 9 = ' + fmt(c * 9) + ', / 5 = ' + fmt(c * 9 / 5) + ', + 32 = ' + fmt(f) + '.');
    var k = c + 273.15;
    t.vars.kelvin = k;
    t.step('calcK', 9, 'Process: kelvin = ' + fmt(c) + ' + 273.15 = ' + fmt(k) + '.');
    t.step('out', 10, 'Output: display fahrenheit.', 'Fahrenheit: ' + C.cout(f) + '\n');
    t.step('out', 11, 'Output: display kelvin.', 'Kelvin: ' + C.cout(k) + '\n');
    t.step('end', 12, 'End: return 0; every statement ran exactly once, top to bottom.');
  });

  /* Appliance energy and cost */
  C.addTrace('l5-energy', function (v, t) {
    t.step(null, 5, 'main() starts.');
    t.step(null, 6, 'Declare the four input variables (garbage until cin fills them).');
    t.step(null, 7, 'Prompt for the power rating.', 'Power rating (W): ');
    t.vars.watts = v.watts;
    t.input(null, 8, 'watts = ' + fmt(v.watts) + '.', fmt(v.watts));
    t.step(null, 9, 'Prompt for the daily usage.', 'Hours used per day: ');
    t.vars.hours = v.hours;
    t.input(null, 10, 'hours = ' + fmt(v.hours) + '.', fmt(v.hours));
    t.step(null, 11, 'Prompt for the number of days.', 'Number of days: ');
    t.vars.days = v.days;
    t.input(null, 12, 'days = ' + fmt(v.days) + '.', fmt(v.days));
    t.step(null, 13, 'Prompt for the electricity rate.', 'Rate (PHP per kWh): ');
    t.vars.rate = v.rate;
    t.input(null, 14, 'rate = ' + fmt(v.rate) + '.', fmt(v.rate));
    var wh = v.watts * v.hours * v.days, kwh = wh / 1000;
    t.vars.energy_kwh = kwh;
    t.step(null, 15, fmt(v.watts) + ' W × ' + fmt(v.hours) + ' h × ' + fmt(v.days) + ' days = ' + fmt(wh) + ' Wh. Divide by 1000 to get ' + fmt(kwh) + ' kWh.');
    var cost = kwh * v.rate;
    t.vars.cost = cost;
    t.step(null, 16, 'cost = ' + fmt(kwh) + ' kWh × ₱' + fmt(v.rate) + ' = ' + fmt(cost) + '.');
    t.step(null, 17, 'fixed + setprecision(2): from now on, doubles print with exactly 2 decimals. Nothing is printed yet.');
    t.step(null, 18, 'Display the energy.', 'Energy used: ' + kwh.toFixed(2) + ' kWh\n');
    t.step(null, 19, 'Display the cost.', 'Cost: PHP ' + cost.toFixed(2) + '\n');
    t.step(null, 20, 'return 0; the program ends normally.');
  });
})();
