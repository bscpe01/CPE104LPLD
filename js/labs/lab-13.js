/* ==========================================================================
   Lab 13 · Intro to OOP: Encapsulation and Inheritance · tracers
     t.step(node, line, message, output)   line = code line to highlight
     t.input(node, line, message, typed)   what the user types at a cin prompt
     t.vars['obj.member'] = value          shown in the Memory panel
   ========================================================================== */
(function () {
  'use strict';
  var C = window.CPE104L, fmt = C.fmt;

  /* A value shown without quotes in the Memory panel. */
  function raw(text) { return { shown: text, toString: function () { return text; } }; }
  var GARBAGE = raw('(garbage)');
  function money(x) { return x.toFixed(2); }   /* fixed << setprecision(2) */
  function tf(b) { return b ? 'true' : 'false'; }

  /* bank_account.cpp: a rejected (or accepted) withdrawal */
  C.addTrace('l13-bank', function (v, t) {
    var dep = v.deposit, wd = v.withdraw, bal = 0;
    t.step(null, 35, 'main() starts.');
    t.step(null, 36, 'BankAccount acct("2026-0001"); creates the object, so the constructor runs.');
    t.vars['acct.balance'] = 0;
    t.step(null, 13, 'Initializer list: accountNumber = "2026-0001", balance = 0. Both members are private.');
    t.vars.amount = GARBAGE;
    t.step(null, 37, 'double amount; is declared (no value yet).');
    t.step(null, 38, 'fixed << setprecision(2): from now on, doubles print with 2 decimals.');
    t.step(null, 40, 'Prompt for the deposit (no endl, so the cursor stays on this line).', 'Deposit: ');
    t.vars.amount = dep;
    t.input(null, 41, 'cin reads amount = ' + fmt(dep) + '.', fmt(dep));
    t.step(null, 42, 'main cannot touch balance directly, so it asks the object: acct.deposit(' + fmt(dep) + ').');
    if (dep > 0) {
      t.step(null, 16, 'Inside deposit(): amount <= 0? → ' + fmt(dep) + ' <= 0 is false, so the amount is valid.');
      bal += dep;
      t.vars['acct.balance'] = bal;
      t.step(null, 19, 'balance += ' + fmt(dep) + ' → balance = ' + money(bal) + '.');
      t.step(null, 20, 'return true: the deposit worked.');
      t.step(null, 42, 'deposit() returned true, so !true is false and the "rejected" message is skipped.');
    } else {
      t.step(null, 16, 'Inside deposit(): amount <= 0? → ' + fmt(dep) + ' <= 0 is true.');
      t.step(null, 17, 'Invalid amount: return false. balance is never touched.');
      t.step(null, 42, 'deposit() returned false, so !false is true.');
      t.step(null, 43, 'main reports the problem.', 'Deposit rejected.\n');
    }
    t.step(null, 45, 'Prompt for the withdrawal.', 'Withdraw: ');
    t.vars.amount = wd;
    t.input(null, 46, 'cin reads amount = ' + fmt(wd) + '.', fmt(wd));
    t.step(null, 47, 'acct.withdraw(' + fmt(wd) + ') is called. The object decides whether to allow it.');
    var tooSmall = wd <= 0, tooBig = wd > bal, reject = tooSmall || tooBig;
    t.step(null, 24, 'amount <= 0 || amount > balance? → ' + fmt(wd) + ' <= 0 is ' + tf(tooSmall) + ', ' +
      fmt(wd) + ' > ' + money(bal) + ' is ' + tf(tooBig) + ' → ' + tf(reject) + '.');
    if (reject) {
      t.step(null, 25, 'Rejected: return false before the subtraction. balance stays ' + money(bal) + '. The object protected its own data.');
      t.step(null, 47, 'withdraw() returned false, so the else branch runs.');
      t.step(null, 50, 'main tells the user.', 'Withdrawal rejected.\n');
    } else {
      bal -= wd;
      t.vars['acct.balance'] = bal;
      t.step(null, 27, 'Valid: balance -= ' + fmt(wd) + ' → balance = ' + money(bal) + '.');
      t.step(null, 28, 'return true.');
      t.step(null, 48, 'withdraw() returned true, so the if branch runs.', 'Withdrawal OK.\n');
    }
    t.step(null, 52, 'The const getters getAccountNumber() and getBalance() read the private data without changing it.',
      '2026-0001 balance: PHP ' + money(bal) + '\n');
    t.step(null, 54, 'return 0; ends the program.');
  });

  /* order.cpp: constructor and destructor order */
  C.addTrace('l13-order', function (v, t) {
    var ready = raw('built'), gone = raw('destroyed');
    t.step(null, 16, 'main() starts.');
    t.step(null, 17, 'Print the first message.', 'Creating a Laptop...\n');
    t.step(null, 18, 'Laptop lap; asks for a Laptop. A Laptop contains a Device part, which must exist first.');
    t.step(null, 12, 'Laptop() is entered, but before its body runs, C++ calls the base constructor Device().');
    t.vars['Device part'] = ready;
    t.step(null, 6, 'Device() runs first: the base part is built.', 'Device constructor\n');
    t.vars['Laptop part'] = ready;
    t.step(null, 12, 'Now the Laptop() body runs: the derived part is built.', 'Laptop constructor\n');
    t.step(null, 19, 'lap is complete and can be used.', 'Using the Laptop...\n');
    t.step(null, 20, 'return 0; main is about to end.');
    t.step(null, 21, 'At the closing brace, lap goes out of scope. Destructors run in REVERSE order.');
    t.step(null, 13, '~Laptop() runs first (the derived part).', 'Laptop destructor\n');
    t.vars['Laptop part'] = gone;
    t.step(null, 7, '~Device() runs last (the base part).', 'Device destructor\n');
    t.vars['Device part'] = gone;
    t.step(null, 21, 'Both parts are gone. The program ends.');
  });

  /* devices.cpp: which describe() runs?
     (Only numeric members go in the Memory panel so it stays readable; brands are named in the messages.) */
  C.addTrace('l13-redefine', function (v, t) {
    t.step(null, 48, 'main() starts.');
    t.step(null, 49, 'Device d("Generic", 10); creates a plain Device.');
    t.vars['d.powerWatts'] = 10;
    t.step(null, 11, 'Device constructor: d.brand = "Generic", d.powerWatts = 10.');
    t.step(null, 50, 'Laptop lap("Lenovo", 65, 16); the Laptop constructor starts with its initializer list.');
    t.step(null, 25, 'First item in the list: Device(b, w) builds the inherited part.');
    t.vars['lap.powerWatts'] = 65;
    t.step(null, 11, 'Device constructor for lap\'s base part: brand = "Lenovo", powerWatts = 65.');
    t.vars['lap.ramGB'] = 16;
    t.step(null, 25, 'Back in the list: ramGB(ram) sets lap.ramGB = 16.');
    t.step(null, 51, 'Smartphone phone("Samsung", 25, 5000); same pattern.');
    t.vars['phone.powerWatts'] = 25;
    t.step(null, 11, 'Device(b, w) builds phone\'s base part: brand = "Samsung", powerWatts = 25.');
    t.vars['phone.batteryMah'] = 5000;
    t.step(null, 40, 'Then batteryMah(mah) sets phone.batteryMah = 5000.');
    t.step(null, 52, 'd.describe(): d is a Device, so Device::describe() runs.');
    t.step(null, 14, 'Device::describe() prints d\'s brand and watts.', 'Generic, 10 W\n');
    t.step(null, 53, 'lap.describe(): lap is a Laptop, so the compiler picks Laptop::describe().');
    t.step(null, 28, 'Laptop\'s version prints its prefix first.', 'Laptop: ');
    t.step(null, 29, 'Device::describe() explicitly calls the base version to reuse it.');
    t.step(null, 14, 'The base version prints lap\'s inherited brand and watts.', 'Lenovo, 65 W\n');
    t.step(null, 30, 'Back in Laptop::describe(): print the RAM.', '  RAM: 16 GB\n');
    t.step(null, 54, 'phone.describe(): the compiler picks Smartphone::describe().');
    t.step(null, 43, 'Smartphone\'s version uses brand directly. That is allowed because brand is protected.',
      'Phone: Samsung, 5000 mAh\n');
    t.step(null, 55, 'return 0; ends the program.');
  });
})();
