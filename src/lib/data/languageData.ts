export interface LanguageLesson {
  id: string;
  title: string;
  description: string;
  content: string; // Markdown content for lesson theory
  codeExample: string;
  starterCode: string;
  solutionCode: string;
  quizQuestions: {
    question: string;
    options: string[];
    answerIndex: number;
    explanation: string;
  }[];
}

export interface LanguageTrack {
  id: string;
  title: string;
  description: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE';
  estimatedTime: string;
  xpValue: number;
  lessons: LanguageLesson[];
}

export const LANGUAGE_TRACKS: LanguageTrack[] = [
  {
    id: "python",
    title: "Python",
    description: "Learn clean, readable, scriptable, and modular code structures.",
    difficulty: "BEGINNER",
    estimatedTime: "5 hours",
    xpValue: 400,
    lessons: [
      {
        id: "py-1",
        title: "Syntax & Variables",
        description: "Explore dynamic typing, indentation, and expressions.",
        content: "Python is a high-level, interpreted programming language. Instead of braces, it uses whitespace and strict indentation to define code blocks. Variables in Python are dynamically typed: you don't need to specify their type when declaring them.",
        codeExample: "# Declaring variables in Python\nname = \"ByteAcademy\"\nx = 10\ny = 3.14\nis_active = True\n\n# Basic console output\nprint(f\"{name} is active: {is_active}\")",
        starterCode: "# Create a variable named 'score' set to 100, and print it out\n# Write code below\n",
        solutionCode: "score = 100\nprint(score)",
        quizQuestions: [
          {
            question: "How are code blocks defined in Python?",
            options: ["Curly braces {}", "Indentation and whitespace", "Semicolons ;", "Parentheses ()"],
            answerIndex: 1,
            explanation: "Python enforces strict indentation to group statements instead of brackets."
          },
          {
            question: "Which of the following creates a string variable in Python?",
            options: ["var s = 'hello'", "string s = 'hello'", "s = 'hello'", "s : string = 'hello'"],
            answerIndex: 2,
            explanation: "Python uses dynamic typing. Simply write the variable name, an equal sign, and the string literal."
          }
        ]
      },
      {
        id: "py-2",
        title: "Loops & Conditions",
        description: "Control execution flows using if-else and loops.",
        content: "Python supports conditional statements `if`, `elif`, and `else` to branch execution. Iteration uses `for` (typically with the `range()` function or list elements) and `while` loops.",
        codeExample: "for i in range(3):\n    if i % 2 == 0:\n        print(f\"{i} is Even\")\n    else:\n        print(f\"{i} is Odd\")",
        starterCode: "# Write a loop that prints numbers from 1 to 5 inclusive using a for loop and range()\n",
        solutionCode: "for i in range(1, 6):\n    print(i)",
        quizQuestions: [
          {
            question: "What function generates a sequence of numbers to loop through in Python?",
            options: ["sequence()", "range()", "generate()", "list()"],
            answerIndex: 1,
            explanation: "The range() function returns an immutable sequence of numbers, commonly used in for loops."
          }
        ]
      },
      {
        id: "py-3",
        title: "Object-Oriented Programming (OOP)",
        description: "Design reusable class frameworks and attributes.",
        content: "Python supports standard Object-Oriented features including Classes, Inheritance, and Encapsulation. The `__init__` method represents the constructor, and `self` refers to the instance of the object.",
        codeExample: "class CodingStudent:\n    def __init__(self, name, xp):\n        self.name = name\n        self.xp = xp\n\n    def study(self, points):\n        self.xp += points\n        return f\"{self.name} now has {self.xp} XP!\"\n\nstudent = CodingStudent(\"Alex\", 100)\nprint(student.study(50))",
        starterCode: "# Create a class named 'Car' with a constructor setting 'brand', and a method 'drive' returning 'Driving [brand]'.\n",
        solutionCode: "class Car:\n    def __init__(self, brand):\n        self.brand = brand\n    def drive(self):\n        return f'Driving {self.brand}'",
        quizQuestions: [
          {
            question: "What does 'self' represent in a Python class method?",
            options: ["The class itself", "A global variable scope", "The instance of the class", "A built-in parent reference"],
            answerIndex: 2,
            explanation: "'self' is the convention used to refer to the specific instance of the class executing the method."
          }
        ]
      }
    ]
  },
  {
    id: "javascript",
    title: "JavaScript",
    description: "Build lightweight, asynchronous, event-driven web client code.",
    difficulty: "BEGINNER",
    estimatedTime: "4 hours",
    xpValue: 350,
    lessons: [
      {
        id: "js-1",
        title: "Variables & Scope",
        description: "Master variables declaring: let, const, and var.",
        content: "JavaScript is a lightweight, dynamically-typed script engine. Use `let` for block-scoped reassignable variables, `const` for read-only block-scoped references, and `var` for older function-scoped bindings.",
        codeExample: "const platform = \"ByteAcademy\";\nlet xp = 200;\nxp += 50;\nconsole.log(`${platform} student has ${xp} XP`);",
        starterCode: "// Declare a const variable 'greeting' and a let variable 'points'. Increment 'points' by 10, then print both.\n",
        solutionCode: "const greeting = 'Hello';\nlet points = 50;\npoints += 10;\nconsole.log(greeting, points);",
        quizQuestions: [
          {
            question: "Which keyword declares a variable that cannot be reassigned?",
            options: ["var", "let", "const", "define"],
            answerIndex: 2,
            explanation: "'const' creates a read-only variable whose values or reference pointers cannot be reassigned."
          }
        ]
      }
    ]
  },
  {
    id: "typescript",
    title: "TypeScript",
    description: "Supercharge JavaScript with static type checking and interfaces.",
    difficulty: "BEGINNER",
    estimatedTime: "4 hours",
    xpValue: 380,
    lessons: [
      {
        id: "ts-1",
        title: "Types & Interfaces",
        description: "Declare precise structural interfaces and type schemas.",
        content: "TypeScript is a typed superset of JavaScript that compiles to plain JavaScript. It adds optional static types, allowing you to catch compilation errors early.",
        codeExample: "interface UserProfile {\n    name: string;\n    xp: number;\n    isPremium: boolean;\n}\n\nconst profile: UserProfile = {\n    name: \"Sourab\",\n    xp: 9999,\n    isPremium: true\n};",
        starterCode: "// Create an interface 'Book' with fields 'title' (string) and 'pages' (number). Declare a variable of type Book.\n",
        solutionCode: "interface Book {\n  title: string;\n  pages: number;\n}\nconst myBook: Book = { title: 'Clean Code', pages: 400 };",
        quizQuestions: [
          {
            question: "Which of the following represents a compilation advantage of TypeScript?",
            options: ["Speeds up runtime execution speeds", "Finds and alerts syntax and type errors at edit-time", "Avoids compilation step", "Compiles binary files"],
            answerIndex: 1,
            explanation: "TypeScript performs static checks at compile/edit-time to prevent common runtime errors."
          }
        ]
      }
    ]
  },
  {
    id: "java",
    title: "Java",
    description: "Write object-oriented, structured, high-performance compiler apps.",
    difficulty: "BEGINNER",
    estimatedTime: "6 hours",
    xpValue: 450,
    lessons: [
      {
        id: "jv-1",
        title: "Syntax & Compilation",
        description: "Declare class bounds and main entry functions.",
        content: "Java is a statically-typed, object-oriented programming language designed to run on the Java Virtual Machine (JVM). Everything in Java is enclosed within classes, and all execution starts in the `main` method.",
        codeExample: "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello from Java JVM!\");\n    }\n}",
        starterCode: "// Write a main method that prints 'Java is powerful' to the system console.\n",
        solutionCode: "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Java is powerful\");\n    }\n}",
        quizQuestions: [
          {
            question: "What is the standard entry method signature in Java applications?",
            options: ["public static void main(String[] args)", "void start()", "public main()", "static void entry(String args)"],
            answerIndex: 0,
            explanation: "The JVM strictly loads the class and runs 'public static void main(String[] args)' to bootstrap java apps."
          }
        ]
      }
    ]
  },
  {
    id: "cpp",
    title: "C++",
    description: "Master memory manipulation, pointers, and high-speed execution layers.",
    difficulty: "INTERMEDIATE",
    estimatedTime: "6 hours",
    xpValue: 500,
    lessons: [
      {
        id: "cpp-1",
        title: "Pointers & Memory",
        description: "Direct memory reference mappings, pointers, and deallocating.",
        content: "C++ is an extension of the C programming language that includes Object-Oriented features. C++ is highly valued for low-level memory allocation using Pointers (declared with `*` and referenced with `&`).",
        codeExample: "#include <iostream>\n\nint main() {\n    int val = 100;\n    int* ptr = &val; // ptr stores memory address of val\n    std::cout << \"Address: \" << ptr << \" Value: \" << *ptr << std::endl;\n    return 0;\n}",
        starterCode: "// Write a snippet that declares an integer variable, creates a pointer referencing its address, and updates the value through dereferencing.\n",
        solutionCode: "int num = 42;\nint* p = &num;\n*p = 50;",
        quizQuestions: [
          {
            question: "What symbol declares a pointer variable in C++?",
            options: ["&", "*", "#", "@"],
            answerIndex: 1,
            explanation: "An asterisk '*' is placed after the data type to represent a pointer, while ampersand '&' acts as address-of operator."
          }
        ]
      }
    ]
  },
  {
    id: "c",
    title: "C",
    description: "Explore structural, procedural systems code closest to assembler.",
    difficulty: "INTERMEDIATE",
    estimatedTime: "5 hours",
    xpValue: 480,
    lessons: [
      {
        id: "c-1",
        title: "Standard I/O & Functions",
        description: "Master functions, structural modules, printf and scanf bounds.",
        content: "C is a foundational structural, procedural computer programming language. It lacks objects, but supports custom structs, function modularity, and explicit memory registers.",
        codeExample: "#include <stdio.h>\n\nint add(int a, int b) {\n    return a + b;\n}\n\nint main() {\n    printf(\"Sum: %d\\n\", add(5, 7));\n    return 0;\n}",
        starterCode: "// Complete a function doubleValue that multiplies an input int by 2 and returns it.\n",
        solutionCode: "int doubleValue(int n) { return n * 2; }",
        quizQuestions: [
          {
            question: "Which header file is standard for input and output operations in C?",
            options: ["<conio.h>", "<stdlib.h>", "<stdio.h>", "<string.h>"],
            answerIndex: 2,
            explanation: "'stdio.h' stands for Standard Input Output and is required for printf/scanf functions."
          }
        ]
      }
    ]
  },
  {
    id: "dart",
    title: "Flutter/Dart",
    description: "Create native multi-platform mobile layouts and reactive components.",
    difficulty: "BEGINNER",
    estimatedTime: "4 hours",
    xpValue: 350,
    lessons: [
      {
        id: "dart-1",
        title: "Asynchronous Operations",
        description: "Utilize Futures, Async and Await patterns in client apps.",
        content: "Dart is the programming language behind Google's Flutter framework. It supports powerful asynchronous operations using `Future`, `async`, and `await` keywords, crucial for fetching remote server API data.",
        codeExample: "Future<String> fetchUserData() async {\n    await Future.delayed(Duration(seconds: 1));\n    return \"User: sourab\";\n}\n\nvoid main() async {\n    print(await fetchUserData());\n}",
        starterCode: "// Write a function that returns a Future string value 'Done' after a delayed duration.\n",
        solutionCode: "Future<String> getResult() async {\n  return 'Done';\n}",
        quizQuestions: [
          {
            question: "What class in Dart represents an asynchronous calculation that is yet to finish?",
            options: ["Promise", "Future", "Deferred", "AsyncTask"],
            answerIndex: 1,
            explanation: "Like Promises in JavaScript, Dart uses 'Future' to encapsulate future delayed objects."
          }
        ]
      }
    ]
  }
];
