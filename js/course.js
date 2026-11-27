/* ==========================================================================
   CPE 104L · course catalog
   ONE place to list every page of the site. The home page cards, the lab
   switcher, prev/next-lab buttons, and search all read from this file.

   To add or rename a lab: edit its entry below (keep `file` pointing to the
   HTML page inside /labs). To attach slides or handouts, put the file in
   /materials and add it to that lab's `materials` list, e.g.
     materials: [{ label: 'Lab 4 slides (PPTX)', href: 'materials/LAB_04.pptx' }]
   ILO and week text comes from the CPE 104L syllabus (2nd Sem, A.Y. 2026–2027).
   ========================================================================== */
window.CPE104L_COURSE = {
  code: 'CPE 104L',
  title: 'Programming Logic and Design',
  units: '2-Unit Laboratory',
  program: 'BS Computer Engineering',
  college: 'College of Engineering',
  school: 'Bulacan State University',
  term: '2nd Semester, A.Y. 2026–2027',

  /* Course phases, used for the filter chips on the home page */
  parts: [
    { id: 'p1', label: 'Logic & C++ Basics', range: 'Labs 1–4' },
    { id: 'p2', label: 'Control Structures', range: 'Labs 5–8' },
    { id: 'p3', label: 'Data & Modularity', range: 'Labs 9–11' },
    { id: 'p4', label: 'Object-Oriented Programming', range: 'Labs 12–14' },
    { id: 'p5', label: 'Debugging & Final Output', range: 'Lab 15 →' }
  ],

  pages: [
    {
      id: 'orientation', kind: 'orientation', file: 'labs/orientation.html',
      short: 'Orientation', title: 'Course Orientation', week: '1', part: 'p1',
      ilos: [
        'Understand BulSU VMGO, Student Handbook regulations, and policies.',
        'Describe major topics, learning activities, assessments, and course policies.',
        'Identify expected course outcomes and how activities contribute to them.'
      ],
      topics: ['VMGO & ALAB BulSU', 'PEO, PO & CO', 'Grading system', 'Rubrics', 'Lab policies', 'AI policy'],
      materials: []
    },
    {
      id: 'lab-01', num: 1, kind: 'lab', file: 'labs/lab-01.html',
      short: 'Lab 1', title: 'Algorithm, Pseudocode, and Flowchart', week: '2', part: 'p1',
      ilos: [
        'Explain the program development cycle.',
        'Formulate step-by-step algorithms for engineering problems.',
        'Construct standard flowcharts and write structured pseudocode.'
      ],
      topics: ['Program development cycle', 'Sequence, selection, loop', 'Pseudocode keywords', 'Operators', 'Flowchart symbols', 'Battlefield Coordinates'],
      materials: []
    },
    {
      id: 'lab-02', num: 2, kind: 'lab', file: 'labs/lab-02.html',
      short: 'Lab 2', title: 'Basics of C++', week: '3', part: 'p1',
      ilos: [
        'Identify the structure of a basic C++ program and IDE environment.',
        'Write, compile, and execute simple input/output C++ programs following proper coding conventions.'
      ],
      topics: ['#include & main()', 'namespace std', 'Compile & run (Codechum)', 'cout / cin', '\\n vs endl', 'Comments'],
      materials: []
    },
    {
      id: 'lab-03', num: 3, kind: 'lab', file: 'labs/lab-03.html',
      short: 'Lab 3', title: 'Data Types, Constants, Variables, and Strings', week: '4', part: 'p1',
      ilos: [
        'Differentiate primitive data types, constants, variables, and strings in C++.',
        'Apply proper identifier naming rules and memory allocation concepts.'
      ],
      topics: ['int, float, double, char, bool', 'sizeof & ranges', 'Naming rules', 'Scope', 'const', 'string & getline'],
      materials: []
    },
    {
      id: 'lab-04', num: 4, kind: 'lab', file: 'labs/lab-04.html',
      short: 'Lab 4', title: 'Operators and Its Hierarchy', week: '5', part: 'p1',
      ilos: [
        'Classify arithmetic, relational, logical, and assignment operators.',
        'Evaluate complex expressions using operator precedence and associativity.'
      ],
      topics: ['Arithmetic & modulus', 'Integer division', 'Compound assignment', '++ / --', 'Relational & logical', 'Precedence & associativity'],
      materials: []
    },
    {
      id: 'lab-05', num: 5, kind: 'lab', file: 'labs/lab-05.html',
      short: 'Lab 5', title: 'Logical Control Structures: Sequential', week: '6', part: 'p2',
      ilos: ['Design sequential logic programs to solve step-by-step calculations.'],
      topics: ['Input-Process-Output', 'Pseudocode → C++', '<cmath>', 'Formatted output', 'Engineering formulas'],
      materials: []
    },
    {
      id: 'lab-06', num: 6, kind: 'lab', file: 'labs/lab-06.html',
      short: 'Lab 6', title: 'Logical Control Structures: Selection', week: '6', part: 'p2',
      ilos: ['Implement decision-making logic using if, if-else, nested if, and switch statements.'],
      topics: ['if / if-else', 'else-if ladder', 'Nested if', 'switch & break', 'Ternary operator'],
      materials: []
    },
    {
      id: 'lab-07', num: 7, kind: 'lab', file: 'labs/lab-07.html',
      short: 'Lab 7', title: 'Logical Control Structures: Iteration Part 1', week: '7', part: 'p2',
      ilos: [
        'Explain loop structures and loop control variables.',
        'Implement entry-controlled (while, for) and exit-controlled (do-while) loops in C++.'
      ],
      topics: ['Loop control variable', 'while', 'for', 'do-while', 'Counters & accumulators', 'Sentinel loops'],
      materials: []
    },
    {
      id: 'lab-08', num: 8, kind: 'lab', file: 'labs/lab-08.html',
      short: 'Lab 8', title: 'Logical Control Structures: Iteration Part 2', week: '8', part: 'p2',
      ilos: ['Construct nested loops and apply jump statements (break, continue) to solve complex iterative problems.'],
      topics: ['Nested loops', 'Patterns', 'break', 'continue', 'Menu-driven programs', 'Prime numbers'],
      materials: []
    },
    {
      id: 'midterm', kind: 'milestone', short: 'Midterm', title: 'Midterm Practical Exam', week: '9', part: 'p2',
      desc: 'Apply algorithmic design, flowcharts/pseudocode, and C++ control structures to solve a timed programming problem (5-Level Exam Rubric).'
    },
    {
      id: 'lab-09', num: 9, kind: 'lab', file: 'labs/lab-09.html',
      short: 'Lab 9', title: 'Array', week: '10', part: 'p3',
      ilos: [
        'Declare, initialize, and manipulate 1D and multi-dimensional arrays in C++.',
        'Implement basic array traversal, searching, and sorting algorithms.'
      ],
      topics: ['1D arrays', 'Traversal', 'Linear search', 'Bubble sort', '2D arrays', 'Out-of-bounds'],
      materials: []
    },
    {
      id: 'lab-10', num: 10, kind: 'lab', file: 'labs/lab-10.html',
      short: 'Lab 10', title: 'References and Pointers', week: '11', part: 'p3',
      ilos: [
        'Explain computer memory addressing, references, and pointer variables.',
        'Manipulate data indirectly using pointers and references in C++.'
      ],
      topics: ['Memory addresses', '& and *', 'References', 'Pointers', 'Pointer arithmetic', 'new / delete'],
      materials: []
    },
    {
      id: 'lab-11', num: 11, kind: 'lab', file: 'labs/lab-11.html',
      short: 'Lab 11', title: 'Functions', week: '12', part: 'p3',
      ilos: [
        'Apply modular programming principles by decomposing problems into user-defined functions.',
        'Differentiate pass-by-value and pass-by-reference parameter passing.'
      ],
      topics: ['Prototype & definition', 'Parameters & return', 'Pass-by-value', 'Pass-by-reference', 'Overloading', 'Scope'],
      materials: []
    },
    {
      id: 'lab-12', num: 12, kind: 'lab', file: 'labs/lab-12.html',
      short: 'Lab 12', title: 'Intro to OOP: Classes and Objects', week: '13', part: 'p4',
      ilos: [
        'Explain foundational Object-Oriented Programming (OOP) principles.',
        'Define classes and instantiate objects in C++.'
      ],
      topics: ['Procedural vs OOP', 'class & object', 'public / private', 'Member functions', 'Constructors', 'UML class diagram'],
      materials: []
    },
    {
      id: 'lab-13', num: 13, kind: 'lab', file: 'labs/lab-13.html',
      short: 'Lab 13', title: 'Intro to OOP: Encapsulation and Inheritance', week: '14', part: 'p4',
      ilos: ['Apply encapsulation and inheritance in basic C++ programs.'],
      topics: ['Encapsulation', 'Getters & setters', 'Validation', 'Inheritance', 'protected', 'Constructor chaining'],
      note: 'Syllabus: Lab No. 13 & 14 – Intro to OOP: Encapsulation, Inheritance, and Polymorphism (Weeks 14–15).',
      materials: []
    },
    {
      id: 'lab-14', num: 14, kind: 'lab', file: 'labs/lab-14.html',
      short: 'Lab 14', title: 'Intro to OOP: Polymorphism', week: '15', part: 'p4',
      ilos: ['Apply polymorphism in basic C++ programs.'],
      topics: ['Function overloading', 'Overriding', 'virtual functions', 'Abstract classes', 'Base-class pointers'],
      note: 'Syllabus: Lab No. 13 & 14 – Intro to OOP: Encapsulation, Inheritance, and Polymorphism (Weeks 14–15).',
      materials: []
    },
    {
      id: 'lab-15', num: 15, kind: 'lab', file: 'labs/lab-15.html',
      short: 'Lab 15', title: 'Debugging Techniques', week: '16', part: 'p5',
      ilos: [
        'Identify syntax, runtime, and logical errors in C++ programs.',
        'Apply systematic debugging techniques, watches, and test cases to verify program correctness.'
      ],
      topics: ['Error types', 'Compiler messages', 'Trace tables', 'Breakpoints & watches', 'Test cases', 'assert'],
      materials: []
    },
    {
      id: 'project', kind: 'milestone', short: 'Project', title: 'Final Project Submission', week: '17', part: 'p5',
      desc: 'Design, implement, test, and document an integrated, modular C++ software solution applying multiple algorithms (Final Project Rubric).'
    },
    {
      id: 'final', kind: 'milestone', short: 'Final Exam', title: 'Final Practical Exam & Demo', week: '18', part: 'p5',
      desc: 'Develop and defend a complete C++ program solving an engineering or real-world problem.'
    }
  ]
};
