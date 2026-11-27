/* ==========================================================================
   Lab 3 · tracers
     l3-display  one variable of each type, displayed with <<
     l3-reverse  reverse a phrase with a for loop from the last index
   t.step(node, line, message, output)   line = code line number
   t.input(node, line, message, typed)   what the user types at a cin/getline prompt
   t.vars.name = value                   shown in the Memory panel
   ========================================================================== */
(function () {
  'use strict';
  var C = window.CPE104L, fmt = C.fmt;

  /* A char shown in single quotes in the Memory panel ('D'), not as a "string". */
  function ch(c) { return { ch: c, toString: function () { return "'" + c + "'"; } }; }

  /* One variable of each type */
  C.addTrace('l3-display', function (v, t) {
    t.step(null, 5, 'main() starts running.');
    t.vars.myNum = 5;
    t.step(null, 6, 'int myNum = 5: reserve 4 bytes for a whole number and store 5.');
    t.vars.myFloatNum = 5.99;
    t.step(null, 7, 'double myFloatNum = 5.99: reserve 8 bytes for a number with decimals.');
    t.vars.myLetter = ch('D');
    t.step(null, 8, "char myLetter = 'D': 1 byte for one character (single quotes).");
    t.vars.myText = 'Hello';
    t.step(null, 9, 'string myText = "Hello": text in double quotes.');
    t.vars.myBoolean = true;
    t.step(null, 10, 'bool myBoolean = true: 1 byte that is either true or false.');
    t.step(null, 12, 'Text first, then the value of myNum, then a new line.', 'myNum: 5\n');
    t.step(null, 13, 'A double prints with up to 6 significant digits: 5.99.', 'myFloatNum: ' + C.cout(5.99) + '\n');
    t.step(null, 14, 'A char prints as the character itself, without quotes.', 'myLetter: D\n');
    t.step(null, 15, 'A string prints its text, without quotes.', 'myText: Hello\n');
    t.step(null, 16, 'Surprise: cout prints a bool as 1 (true) or 0 (false). Use boolalpha to print the word true.', 'myBoolean: 1\n');
    t.vars.myAge = 35;
    t.step(null, 18, 'Declare one more variable, myAge = 35.');
    t.step(null, 19, 'Combine text and a variable with <<. The spaces inside the quotes keep the words apart.', 'I am 35 years old.\n');
    t.step(null, 20, 'return 0; ends the program.');
  });

  /* Reverse a phrase */
  C.addTrace('l3-reverse', function (v, t) {
    var phrase = String(v.phrase);
    t.step(null, 5, 'main() starts running.');
    t.vars.phrase = '';
    t.step(null, 6, 'string phrase: an empty string, ready for input.');
    t.vars.reversed = '';
    t.step(null, 7, 'string reversed = "": we will build the answer here, one character at a time.');
    t.step(null, 8, 'Print the prompt (no endl, so the user types on the same line).', 'Enter the phrase: ');
    t.vars.phrase = phrase;
    t.input(null, 9, 'getline reads the WHOLE line, spaces included: ' + phrase.length + ' characters.', phrase);

    var reversed = '';
    var i = phrase.length - 1;
    t.vars.i = i;
    var first = true;
    while (true) {
      var ok = i >= 0;
      var pre = first ? 'Start at the LAST index: i = length - 1 = ' + phrase.length + ' - 1 = ' + i + '. '
                      : 'i-- makes i = ' + i + '. ';
      t.step(null, 12, pre + 'Is i >= 0? ' + i + ' >= 0 is ' + (ok ? 'TRUE, so run the body.' : 'FALSE, so the loop ends.'));
      first = false;
      if (!ok) break;
      reversed = reversed + phrase.charAt(i);
      t.vars.reversed = reversed;
      t.step(null, 13, 'phrase[' + i + "] is '" + phrase.charAt(i) + '\'. Append it: reversed is now "' + reversed + '".');
      i = i - 1;
      t.vars.i = i;
    }
    delete t.vars.i;
    t.step(null, 15, 'The loop variable i no longer exists after the loop. Print the reversed phrase.', reversed + '\n');
    t.step(null, 16, 'return 0; ends the program.');
  });
})();
