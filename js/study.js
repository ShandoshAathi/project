import { getCurrentSubject } from './storage.js';

const syllabusData = {
  'English': [
    { title: 'Chapter 1: Speed Reading Basics',
      body: '<p>Speed reading is the practice of reading text at a faster rate than average without losing comprehension...</p>' },
    { title: 'Chapter 2: Rhythm & Pacing',
      body: '<p>Every language has its own natural rhythm. English follows a stress-timed rhythm...</p>' },
    { title: 'Chapter 3: Intonation Patterns',
      body: '<p>Intonation refers to the rise and fall of pitch in speech...</p>' },
    { title: 'Chapter 4: Stress & Emphasis',
      body: '<p>When we speak, we naturally place stress on certain words and syllables...</p>' },
    { title: 'Chapter 5: Advanced Pronunciation',
      body: '<p>Advanced pronunciation focuses on connected speech features: elision, assimilation...</p>' },
    { title: 'Chapter 6: Sentence Patterns (Module)',
      body: '<p>Mastering sentence patterns is crucial for verbal aptitude. Common patterns include S+V+O+C...</p>' }
  ],
  'Python': [
    { title: 'Chapter 1: Introduction to Python',
      body: '<p>Python is a high-level, interpreted, general-purpose programming language. Created by Guido van Rossum and first released in 1991, Python emphasizes code readability with the use of significant indentation.</p><ul><li>Why Python? Simple syntax, huge community, versatile use cases</li><li>Installing Python and setting up VS Code</li><li>Writing your first <code>print("Hello, World!")</code></li><li>Python 2 vs Python 3 differences</li></ul>' },
    { title: 'Chapter 2: Variables & Data Types',
      body: '<p>Variables in Python are dynamically typed — no need to declare a type. Python has several built-in data types.</p><ul><li><strong>int</strong> — whole numbers: <code>age = 25</code></li><li><strong>float</strong> — decimal numbers: <code>pi = 3.14</code></li><li><strong>str</strong> — text: <code>name = "VaaniAI"</code></li><li><strong>bool</strong> — True / False</li><li>Type conversion: <code>int()</code>, <code>str()</code>, <code>float()</code></li><li>The <code>type()</code> function to check data types</li></ul>' },
    { title: 'Chapter 3: Operators & Expressions',
      body: '<p>Operators are symbols that perform operations on variables and values.</p><ul><li><strong>Arithmetic:</strong> +, -, *, /, //, %, **</li><li><strong>Comparison:</strong> ==, !=, >, <, >=, <=</li><li><strong>Logical:</strong> and, or, not</li><li><strong>Assignment:</strong> =, +=, -=, *=</li><li><strong>Bitwise:</strong> &, |, ^, ~, <<, >></li><li>Operator precedence — PEMDAS rules in Python</li></ul>' },
    { title: 'Chapter 4: Control Flow — If / Elif / Else',
      body: '<p>Control structures let your program make decisions. Python uses indentation (4 spaces) instead of braces.</p><pre><code>score = 85\nif score >= 90:\n    print("A Grade")\nelif score >= 75:\n    print("B Grade")\nelse:\n    print("C Grade")</code></pre><ul><li>Nested if statements</li><li>Ternary operator: <code>x = "pass" if score > 40 else "fail"</code></li><li>Short-circuit evaluation with and/or</li></ul>' },
    { title: 'Chapter 5: Loops — For & While',
      body: '<p>Loops allow you to repeat a block of code multiple times.</p><ul><li><strong>for loop:</strong> iterate over sequences — lists, ranges, strings</li><li><strong>while loop:</strong> repeat while a condition is True</li><li><code>break</code> — exit the loop early</li><li><code>continue</code> — skip current iteration</li><li><code>range(start, stop, step)</code> for number sequences</li><li>List comprehension: <code>[x**2 for x in range(10)]</code></li></ul>' },
    { title: 'Chapter 6: Functions & Scope',
      body: '<p>Functions allow you to organize code into reusable blocks.</p><pre><code>def greet(name, greeting="Hello"):\n    return f"{greeting}, {name}!"</code></pre><ul><li>Parameters vs Arguments</li><li>Default parameters and keyword arguments</li><li><code>*args</code> and <code>**kwargs</code> for variable arguments</li><li>Local vs Global scope — the LEGB rule</li><li>Lambda functions: <code>square = lambda x: x**2</code></li><li>Recursion — functions calling themselves</li></ul>' },
    { title: 'Chapter 7: Data Structures',
      body: '<p>Python has four built-in collection data structures.</p><ul><li><strong>List</strong> — ordered, mutable: <code>[1, 2, 3]</code> — append, pop, sort, slice</li><li><strong>Tuple</strong> — ordered, immutable: <code>(1, 2, 3)</code></li><li><strong>Dictionary</strong> — key-value pairs: <code>{"name": "AI"}</code> — get, update, items()</li><li><strong>Set</strong> — unique values: <code>{1, 2, 3}</code> — union, intersection</li><li>Nested structures and when to use each</li></ul>' },
    { title: 'Chapter 8: OOP — Classes & Objects',
      body: '<p>Object-Oriented Programming (OOP) organizes code using classes and objects.</p><pre><code>class Animal:\n    def __init__(self, name):\n        self.name = name\n    def speak(self):\n        return f"{self.name} makes a sound"</code></pre><ul><li>Constructors: <code>__init__</code></li><li>Instance vs Class variables</li><li>Inheritance and method overriding</li><li>Encapsulation with private attributes (<code>_x</code>, <code>__x</code>)</li><li>Special methods: <code>__str__</code>, <code>__len__</code>, <code>__repr__</code></li></ul>' }
  ],
  'Java': [
    { title: 'Chapter 1: Introduction to Java',
      body: '<p>Java is a class-based, object-oriented, platform-independent language. Its philosophy: <strong>Write Once, Run Anywhere (WORA)</strong>.</p><ul><li>History — James Gosling, 1995, Sun Microsystems</li><li>How Java works: Source → Bytecode → JVM → Machine</li><li>JDK vs JRE vs JVM explained</li><li>Installing JDK and setting up IntelliJ / Eclipse</li><li>Your first Java program: <code>public static void main(String[] args)</code></li></ul>' },
    { title: 'Chapter 2: Data Types & Variables',
      body: '<p>Java is <strong>statically typed</strong> — every variable must be declared with a type before use.</p><ul><li><strong>Primitive types:</strong> byte, short, int, long, float, double, char, boolean</li><li><strong>Reference types:</strong> String, Arrays, Objects</li><li>Variable declaration: <code>int age = 25;</code></li><li>Constants: <code>final double PI = 3.14159;</code></li><li>Type casting — implicit and explicit</li><li>String methods: length(), charAt(), substring(), toUpperCase()</li></ul>' },
    { title: 'Chapter 3: Operators & Control Flow',
      body: '<p>Control the logic of your Java programs using operators and conditional statements.</p><ul><li>Arithmetic, relational, logical, and bitwise operators</li><li>if / else if / else — with mandatory braces</li><li>switch statement — fall-through and break</li><li>Ternary operator: <code>int max = (a > b) ? a : b;</code></li><li>Enhanced switch expressions (Java 14+)</li></ul>' },
    { title: 'Chapter 4: Loops & Arrays',
      body: '<p>Repetition structures and fixed-size data collections are core Java tools.</p><ul><li><strong>for loop, while loop, do-while loop</strong></li><li>Enhanced for-each: <code>for (int x : arr)</code></li><li>Arrays: <code>int[] nums = new int[5];</code></li><li>Multi-dimensional arrays</li><li>Array methods via <code>Arrays</code> class — sort, fill, copyOf</li><li>break, continue, and labeled loops</li></ul>' },
    { title: 'Chapter 5: Methods & Scope',
      body: '<p>Methods are reusable blocks of code that perform a specific task.</p><pre><code>public static int add(int a, int b) {\n    return a + b;\n}</code></pre><ul><li>Method signature: access modifier, return type, name, parameters</li><li>Void vs return-type methods</li><li>Method overloading — same name, different parameters</li><li>Pass by value in Java</li><li>Recursion — factorial, Fibonacci examples</li></ul>' },
    { title: 'Chapter 6: Object-Oriented Programming',
      body: '<p>OOP is the backbone of Java. Everything is an object (except primitives).</p><ul><li><strong>Classes & Objects</strong> — blueprints and instances</li><li>Constructors — default and parameterized</li><li><strong>Encapsulation</strong> — private fields + public getters/setters</li><li><strong>Inheritance</strong> — <code>extends</code> keyword, method overriding</li><li><strong>Polymorphism</strong> — compile-time and runtime</li><li><strong>Abstraction</strong> — abstract classes and interfaces</li><li><code>super</code> and <code>this</code> keywords</li></ul>' },
    { title: 'Chapter 7: Collections Framework',
      body: '<p>Java Collections Framework provides ready-made data structures.</p><ul><li><strong>ArrayList</strong> — dynamic array: add, remove, get, size</li><li><strong>LinkedList</strong> — doubly-linked list, queue operations</li><li><strong>HashMap</strong> — key-value storage: put, get, containsKey</li><li><strong>HashSet</strong> — unique elements, no duplicates</li><li><strong>Stack & Queue</strong> — LIFO and FIFO structures</li><li>Iterators and the for-each loop with collections</li><li>Generics: <code>ArrayList&lt;String&gt;</code></li></ul>' },
    { title: 'Chapter 8: Exception Handling & File I/O',
      body: '<p>Robust programs handle errors gracefully using exception handling.</p><pre><code>try {\n    int result = 10 / 0;\n} catch (ArithmeticException e) {\n    System.out.println("Error: " + e.getMessage());\n} finally {\n    System.out.println("Always runs");\n}</code></pre><ul><li>Checked vs Unchecked exceptions</li><li>throws and throw keywords</li><li>Custom exception classes</li><li>File I/O with FileReader, BufferedReader, FileWriter</li><li>Try-with-resources (AutoCloseable)</li></ul>' }
  ],
  'C++': [
    { title: 'Chapter 1: Introduction to C++',
      body: '<p>C++ is a powerful, compiled, statically-typed language created by Bjarne Stroustrup in 1985 as an extension of C.</p><ul><li>Why C++? Performance, systems programming, game dev, embedded systems</li><li>C vs C++ — key differences</li><li>Setting up: GCC / MinGW / Visual Studio</li><li>Structure of a C++ program: headers, main(), return 0</li><li>Compiling: <code>g++ hello.cpp -o hello</code></li><li>Namespaces: <code>using namespace std;</code></li></ul>' },
    { title: 'Chapter 2: Data Types & Variables',
      body: '<p>C++ is statically typed with a rich set of primitive and derived types.</p><ul><li><strong>Primitives:</strong> int, float, double, char, bool, void</li><li>Modifiers: short, long, unsigned, signed</li><li>Variable declaration and initialization</li><li>Constants: <code>const int MAX = 100;</code> and <code>constexpr</code></li><li>Type inference with <code>auto</code> (C++11)</li><li>sizeof() operator and memory sizes</li><li>Input/Output: <code>cin</code> and <code>cout</code></li></ul>' },
    { title: 'Chapter 3: Control Flow & Loops',
      body: '<p>C++ control flow is similar to Java but with more flexibility and performance.</p><ul><li>if / else if / else with braces</li><li>switch-case — faster than if-else chains</li><li><strong>for, while, do-while</strong> loops</li><li>Range-based for: <code>for (auto x : vec)</code></li><li>Nested loops and loop optimization</li><li>goto statement — when (rarely) acceptable</li></ul>' },
    { title: 'Chapter 4: Functions & References',
      body: '<p>C++ functions are powerful — they support pass-by-reference, overloading, and inline expansion.</p><pre><code>void swap(int &a, int &b) {\n    int temp = a; a = b; b = temp;\n}</code></pre><ul><li>Pass by value vs pass by reference vs pass by pointer</li><li>Function overloading</li><li>Default arguments</li><li>Inline functions for performance</li><li>Recursive functions</li><li>Function templates: <code>template&lt;typename T&gt;</code></li></ul>' },
    { title: 'Chapter 5: Pointers & Memory Management',
      body: '<p>Pointers are one of C++\'s most powerful (and dangerous) features. They give direct access to memory.</p><ul><li>What is a pointer? Address of a variable</li><li>Declaration: <code>int* ptr = &x;</code></li><li>Dereferencing: <code>*ptr</code></li><li>Pointer arithmetic</li><li>Dynamic memory: <code>new</code> and <code>delete</code></li><li>Memory leaks and how to avoid them</li><li>Smart pointers: <code>unique_ptr</code>, <code>shared_ptr</code> (C++11)</li><li>nullptr vs NULL</li></ul>' },
    { title: 'Chapter 6: Arrays & Strings',
      body: '<p>Arrays in C++ are fixed-size, contiguous blocks of memory. Strings have two forms — C-strings and std::string.</p><ul><li>1D and 2D arrays</li><li>Array decay to pointers</li><li>C-strings: <code>char name[] = "hello"</code> and <code>strlen</code>, <code>strcpy</code></li><li><code>std::string</code> — length(), substr(), find(), append()</li><li>String to number: <code>stoi()</code>, <code>stof()</code></li><li>Vector as dynamic array: <code>std::vector&lt;int&gt;</code></li></ul>' },
    { title: 'Chapter 7: Object-Oriented Programming',
      body: '<p>C++ supports full OOP with classes, inheritance, polymorphism, and encapsulation.</p><pre><code>class Shape {\npublic:\n    virtual double area() = 0; // pure virtual\n};</code></pre><ul><li>Class definition — public, private, protected</li><li>Constructors and destructors</li><li>Copy constructor and assignment operator</li><li>Inheritance: single, multiple, multilevel</li><li>Virtual functions and runtime polymorphism</li><li>Abstract classes and pure virtual functions</li><li>Friend functions</li></ul>' },
    { title: 'Chapter 8: STL — Standard Template Library',
      body: '<p>The STL is a collection of powerful, generic C++ data structures and algorithms.</p><ul><li><strong>Containers:</strong> vector, list, deque, set, map, unordered_map</li><li><strong>Iterators:</strong> begin(), end(), rbegin(), rend()</li><li><strong>Algorithms:</strong> sort(), find(), count(), reverse(), accumulate()</li><li><code>std::pair</code> and <code>std::tuple</code></li><li>Lambda expressions with STL: <code>sort(v.begin(), v.end(), [](int a, int b){ return a > b; });</code></li><li>String streams: <code>stringstream</code></li></ul>' }
  ]
};

const modulesData = {
  'English': [
    { num: 'Module 1', title: 'Foundations of Reading', desc: 'Basic phonics, letter sounds, and simple words', status: 'Completed', progress: 100, icon: '✓', class: 'completed' },
    { num: 'Module 2', title: 'Sentence Formation', desc: 'Building simple and compound sentences', status: 'Completed', progress: 100, icon: '✓', class: 'completed' },
    { num: 'Module 3', title: 'Reading Fluency', desc: 'Speed reading, rhythm and intonation patterns', status: '65% Done', progress: 65, icon: '●', class: 'active-unit' },
    { num: 'Module 4', title: 'Verbal Aptitude', desc: 'Sentence patterns, voice, and grammar mastery', status: '0% Done', progress: 0, icon: '📖', class: '' }
  ],
  'Python': [
    { num: 'Module 1', title: 'Python Fundamentals', desc: 'Syntax, variables, operators, and control flow', status: 'In Progress', progress: 40, icon: '●', class: 'active-unit' },
    { num: 'Module 2', title: 'Functions & Loops', desc: 'Defining functions, recursion, and iteration', status: '0% Done', progress: 0, icon: '📖', class: '' },
    { num: 'Module 3', title: 'Data Structures', desc: 'Lists, tuples, dicts, and sets', status: 'Locked', progress: 0, icon: '🔒', class: 'locked' },
    { num: 'Module 4', title: 'OOP in Python', desc: 'Classes, inheritance, and polymorphism', status: 'Locked', progress: 0, icon: '🔒', class: 'locked' }
  ],
  'Java': [
    { num: 'Module 1', title: 'Java Basics', desc: 'Types, operators, control flow, and arrays', status: 'In Progress', progress: 20, icon: '●', class: 'active-unit' },
    { num: 'Module 2', title: 'OOP Principles', desc: 'Classes, objects, inheritance, polymorphism', status: '0% Done', progress: 0, icon: '📖', class: '' },
    { num: 'Module 3', title: 'Collections & Generics', desc: 'ArrayList, HashMap, Sets, and iterators', status: 'Locked', progress: 0, icon: '🔒', class: 'locked' },
    { num: 'Module 4', title: 'Exception Handling', desc: 'try-catch, custom exceptions, File I/O', status: 'Locked', progress: 0, icon: '🔒', class: 'locked' }
  ],
  'C++': [
    { num: 'Module 1', title: 'C++ Foundations', desc: 'Syntax, types, control flow, and functions', status: 'In Progress', progress: 15, icon: '●', class: 'active-unit' },
    { num: 'Module 2', title: 'Pointers & Memory', desc: 'Pointers, references, new/delete, smart ptrs', status: '0% Done', progress: 0, icon: '📖', class: '' },
    { num: 'Module 3', title: 'OOP in C++', desc: 'Classes, inheritance, virtual functions, friends', status: 'Locked', progress: 0, icon: '🔒', class: 'locked' },
    { num: 'Module 4', title: 'STL & Templates', desc: 'Vectors, maps, algorithms, lambda, templates', status: 'Locked', progress: 0, icon: '🔒', class: 'locked' }
  ]
};

function getChapters() {
  const subject = getCurrentSubject();
  return syllabusData[subject] || syllabusData['English'];
}

function getModules() {
  const subject = getCurrentSubject();
  return modulesData[subject] || modulesData['English'];
}

let currentIdx = 0;

export function loadChapter(idx) {
  const chapters = getChapters();
  currentIdx = idx;
  
  // Re-render sidebar list if needed
  const sidebar = document.querySelector('.chapter-list');
  if (sidebar && sidebar.children.length !== chapters.length) {
    refreshSyllabusUI();
  }

  document.querySelectorAll('.chapter-item').forEach((c, i) => {
    c.className = 'chapter-item' + (i < idx ? ' done' : i === idx ? ' active-ch' : '');
  });
  
  if (chapters[idx]) {
    document.getElementById('chapterTitle').textContent = chapters[idx].title;
    document.getElementById('chapterBody').innerHTML    = chapters[idx].body;
    const fill = document.querySelector('.mini-fill');
    const span = document.querySelector('.content-progress span');
    if (fill) fill.style.width = `${Math.round(((idx + 1) / chapters.length) * 100)}%`;
    if (span) span.textContent = `${idx + 1} of ${chapters.length}`;

    localStorage.setItem('last_chapter_index', idx);
    localStorage.setItem('last_chapter_title', chapters[idx].title);
  }
}

export function refreshSyllabusUI() {
  const chapters = getChapters();
  const sidebar = document.querySelector('.chapter-list');
  if (sidebar) {
    sidebar.innerHTML = chapters.map((ch, i) => `
      <div class="chapter-item ${i < currentIdx ? 'done' : i === currentIdx ? 'active-ch' : ''}" onclick="loadChapter(${i})">
        <div class="ch-num">${i + 1}</div>
        <div class="ch-info">
          <p class="ch-title">${ch.title}</p>
          <p class="ch-meta">${ch.body.replace(/<[^>]*>/g, '').substring(0, 40)}...</p>
        </div>
        <div class="ch-status"></div>
      </div>
    `).join('');
  }

  // Also refresh the Syllabus Grid
  const grid = document.getElementById('syllabus-grid');
  if (grid) {
    const modules = getModules();
    grid.innerHTML = modules.map(m => `
      <div class="unit-card ${m.class}">
        <div class="unit-badge ${m.class === 'active-unit' ? 'current' : ''}">${m.icon}</div>
        <div class="unit-num">${m.num}</div>
        <h3>${m.title}</h3>
        <p>${m.desc}</p>
        <div class="unit-progress"><div class="unit-bar" style="width: ${m.progress}%"></div></div>
        <span class="unit-status ${m.class === 'locked' ? 'locked-s' : m.progress === 100 ? 'done' : 'progress'}">${m.status}</span>
      </div>
    `).join('');
  }
}

export function prevChapter() {
  if (currentIdx > 0) loadChapter(currentIdx - 1);
}

export function nextChapter() {
  const chapters = getChapters();
  if (currentIdx < chapters.length - 1) loadChapter(currentIdx + 1);
}
