export interface DsaQuestion {
  id: string;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  description: string;
  starterCode: string;
  solutionCode: string;
  testCases: { input: string; output: string }[];
  timeComplexity: string;
  spaceComplexity: string;
}

export interface DsaTopic {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  xpValue: number;
  prerequisites: string[];
  theory: string;
  visualSteps: { title: string; desc: string; visualState: unknown }[];
  complexity: { time: string; space: string; explanation: string };
  questions: DsaQuestion[];
}

export const DSA_TOPICS: DsaTopic[] = [
  {
    id: "arrays",
    title: "Arrays",
    description: "Master contiguous memory allocations and basic pointer manipulation.",
    estimatedTime: "2 hours",
    xpValue: 150,
    prerequisites: [],
    theory: "An Array is a collection of elements stored at contiguous memory locations. It allows O(1) random access by index, but insertions and deletions can take O(n) time as elements must be shifted. Arrays are the foundational data structure for more complex types.",
    visualSteps: [
      { title: "Initialization", desc: "Create an array of size 5: [10, 20, 30, 40, 50]", visualState: [10, 20, 30, 40, 50] },
      { title: "Indexing", desc: "Access element at index 2 (value: 30) directly in O(1) time.", visualState: { highlight: 2, value: 30 } },
      { title: "Insertion at End", desc: "Add 60 at the end in O(1) time: [10, 20, 30, 40, 50, 60]", visualState: [10, 20, 30, 40, 50, 60] }
    ],
    complexity: {
      time: "Access: O(1) | Search: O(N) | Insertion: O(N) | Deletion: O(N)",
      space: "O(N) total space to store elements in contiguous blocks.",
      explanation: "Accessing is fast due to address calculation (base + index * size). Insertion/deletion at arbitrary spots takes linear time because other elements need to shift."
    },
    questions: [
      {
        id: "arr-1",
        title: "Two Sum",
        difficulty: "EASY",
        description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
        starterCode: "function twoSum(nums: number[], target: number): number[] {\n    // Write your code here\n    return [];\n}",
        solutionCode: "function twoSum(nums: number[], target: number): number[] {\n    const map = new Map<number, number>();\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (map.has(complement)) {\n            return [map.get(complement)!, i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n}",
        testCases: [
          { input: "nums = [2,7,11,15], target = 9", output: "[0,1]" },
          { input: "nums = [3,2,4], target = 6", output: "[1,2]" }
        ],
        timeComplexity: "O(N) - Linear scan using a hashmap lookup.",
        spaceComplexity: "O(N) - Space for the hashmap hash table store."
      },
      {
        id: "arr-2",
        title: "Container With Most Water",
        difficulty: "MEDIUM",
        description: "You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]).\n\nFind two lines that together with the x-axis form a container, such that the container contains the most water.\n\nReturn the maximum amount of water a container can store.",
        starterCode: "function maxArea(height: number[]): number {\n    // Write code here\n    return 0;\n}",
        solutionCode: "function maxArea(height: number[]): number {\n    let maxVal = 0;\n    let l = 0;\n    let r = height.length - 1;\n    while (l < r) {\n        const width = r - l;\n        const h = Math.min(height[l], height[r]);\n        maxVal = Math.max(maxVal, width * h);\n        if (height[l] < height[r]) {\n            l++;\n        } else {\n            r--;\n        }\n    }\n    return maxVal;\n}",
        testCases: [
          { input: "[1,8,6,2,5,4,8,3,7]", output: "49" },
          { input: "[1,1]", output: "1" }
        ],
        timeComplexity: "O(N) - Two pointer single pass strategy.",
        spaceComplexity: "O(1) - Constant auxiliary space."
      }
    ]
  },
  {
    id: "strings",
    title: "Strings",
    description: "Manipulate strings, character encodings, palindromes, and sliding patterns.",
    estimatedTime: "2 hours",
    xpValue: 150,
    prerequisites: ["arrays"],
    theory: "Strings are sequences of characters. In many programming languages, they are immutable, meaning any modification generates a new copy. String algorithms frequently employ Two Pointers, Sliding Window techniques, or Hashmaps to optimize search times.",
    visualSteps: [
      { title: "Character Stream", desc: "Represent string 'HELLO' as array of chars: ['H', 'E', 'L', 'L', 'O']", visualState: ["H", "E", "L", "L", "O"] },
      { title: "Reverse Pointers", desc: "Swap first and last pointers (l=0, r=4) to begin reverse in-place.", visualState: { l: 0, r: 4, value: "Swap H and O" } }
    ],
    complexity: {
      time: "Length: O(1) or O(N) | Concatenation: O(N) | Substring: O(N)",
      space: "O(N) auxiliary space representing characters.",
      explanation: "Manipulating strings usually incurs copying overhead unless performed using mutable string builder representations or in-place swapping arrays."
    },
    questions: [
      {
        id: "str-1",
        title: "Valid Anagram",
        difficulty: "EASY",
        description: "Given two strings s and t, return true if t is an anagram of s, and false otherwise.\n\nAn Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.",
        starterCode: "function isAnagram(s: string, t: string): boolean {\n    // Write code here\n    return false;\n}",
        solutionCode: "function isAnagram(s: string, t: string): boolean {\n    if (s.length !== t.length) return false;\n    const counts: { [key: string]: number } = {};\n    for (let c of s) counts[c] = (counts[c] || 0) + 1;\n    for (let c of t) {\n        if (!counts[c]) return false;\n        counts[c]--;\n    }\n    return true;\n}",
        testCases: [
          { input: "s = 'anagram', t = 'nagaram'", output: "true" },
          { input: "s = 'rat', t = 'car'", output: "false" }
        ],
        timeComplexity: "O(N) - Linear time traversal of both character sets.",
        spaceComplexity: "O(1) - The character frequency map is bound by size of alphabet (26 for lowercase English)."
      }
    ]
  },
  {
    id: "hashmaps",
    title: "Hashmaps",
    description: "Learn fast key-value store lookups, bucketing, and collision handling.",
    estimatedTime: "2 hours",
    xpValue: 200,
    prerequisites: ["arrays"],
    theory: "Hashmaps map keys to values using a hashing function that computes an index into an array of buckets. Under normal conditions, they offer O(1) average time complexity for retrieval, insertion, and deletion.",
    visualSteps: [
      { title: "Hash Function", desc: "Key 'apple' hashes to index 4.", visualState: { key: "apple", hash: 4 } },
      { title: "Bucket Storage", desc: "Store key-value pair ('apple', 10) in bucket 4.", visualState: { buckets: { 4: ["apple", 10] } } }
    ],
    complexity: {
      time: "Insert: O(1) Avg | Lookup: O(1) Avg | Delete: O(1) Avg",
      space: "O(N) space to store hashes, buckets, and chain nodes.",
      explanation: "O(1) average occurs when hash distribution is uniform. Heavy collision chains cause degradations to O(N)."
    },
    questions: [
      {
        id: "hash-1",
        title: "Group Anagrams",
        difficulty: "MEDIUM",
        description: "Given an array of strings strs, group the anagrams together. You can return the answer in any order.",
        starterCode: "function groupAnagrams(strs: string[]): string[][] {\n    // Write code here\n    return [];\n}",
        solutionCode: "function groupAnagrams(strs: string[]): string[][] {\n    const map = new Map<string, string[]>();\n    for (let str of strs) {\n        const sorted = str.split('').sort().join('');\n        if (!map.has(sorted)) map.set(sorted, []);\n        map.get(sorted)!.push(str);\n    }\n    return Array.from(map.values());\n}",
        testCases: [
          { input: "strs = ['eat','tea','tan','ate','nat','bat']", output: "[['eat','tea','ate'],['tan','nat'],['bat']]" }
        ],
        timeComplexity: "O(N * K log K) - N is the number of strings, K is string length (due to sorting chars).",
        spaceComplexity: "O(N * K) - Space to cache grouped strings in map buckets."
      }
    ]
  },
  {
    id: "stack",
    title: "Stack",
    description: "Explore Last-In-First-Out (LIFO) flows, parsing, and depth execution.",
    estimatedTime: "2 hours",
    xpValue: 150,
    prerequisites: ["arrays"],
    theory: "A Stack is a linear data structure that follows the Last-In-First-Out (LIFO) principle. Standard actions are Push (insert on top), Pop (remove from top), and Peek (view the top element). Stacks are highly useful in bracket matching, code recursion tracks, and expression evaluators.",
    visualSteps: [
      { title: "Empty Stack", desc: "Initialize stack: []", visualState: [] },
      { title: "Push Action", desc: "Push 10 onto stack: [10]", visualState: [10] },
      { title: "Push Action 2", desc: "Push 20 onto stack: [10, 20] (top is 20)", visualState: [10, 20] },
      { title: "Pop Action", desc: "Pop from stack returns 20. Remaining: [10]", visualState: [10] }
    ],
    complexity: {
      time: "Push: O(1) | Pop: O(1) | Top/Peek: O(1) | Search: O(N)",
      space: "O(N) to store items in stack bounds.",
      explanation: "No shifting is required when adding/removing elements from the tail/top of a stack."
    },
    questions: [
      {
        id: "stk-1",
        title: "Valid Parentheses",
        difficulty: "EASY",
        description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if opening brackets are closed by the same type of brackets, and closed in correct order.",
        starterCode: "function isValid(s: string): boolean {\n    // Write code here\n    return false;\n}",
        solutionCode: "function isValid(s: string): boolean {\n    const stack: string[] = [];\n    const map: { [key: string]: string } = { ')': '(', '}': '{', ']': '[' };\n    for (let c of s) {\n        if (c === '(' || c === '{' || c === '[') {\n            stack.push(c);\n        } else {\n            if (stack.pop() !== map[c]) return false;\n        }\n    }\n    return stack.length === 0;\n}",
        testCases: [
          { input: "s = '()[]{}'", output: "true" },
          { input: "s = '(]'", output: "false" }
        ],
        timeComplexity: "O(N) - Iterating through characters in a single forward pass.",
        spaceComplexity: "O(N) - Worst case stack holds all opening characters."
      }
    ]
  },
  {
    id: "queue",
    title: "Queue",
    description: "Understand First-In-First-Out (FIFO) mechanics, line processing, and buffers.",
    estimatedTime: "2 hours",
    xpValue: 150,
    prerequisites: ["arrays"],
    theory: "A Queue operates on the First-In-First-Out (FIFO) principle. Elements enter at the back (Enqueue) and leave from the front (Dequeue). It is fundamental in scheduling algorithms, printers, message queues, and Breadth-First Searches (BFS).",
    visualSteps: [
      { title: "Initialization", desc: "Initialize queue: []", visualState: [] },
      { title: "Enqueue 15", desc: "Insert 15: [15]", visualState: [15] },
      { title: "Enqueue 25", desc: "Insert 25 at rear: [15, 25]", visualState: [15, 25] },
      { title: "Dequeue", desc: "Remove front element (15). Remaining: [25]", visualState: [25] }
    ],
    complexity: {
      time: "Enqueue: O(1) | Dequeue: O(1) | Front: O(1)",
      space: "O(N) to store elements inside the queue.",
      explanation: "Using pointers or circular buffers, elements are fetched from the front and appended to the back in constant time."
    },
    questions: [
      {
        id: "que-1",
        title: "Implement Queue using Stacks",
        difficulty: "EASY",
        description: "Implement a first in first out (FIFO) queue using only two stacks. The implemented queue should support all the functions of a normal queue (push, peek, pop, and empty).",
        starterCode: "class MyQueue {\n    constructor() {}\n    push(x: number): void {}\n    pop(): number { return 0; }\n    peek(): number { return 0; }\n    empty(): boolean { return true; }\n}",
        solutionCode: "class MyQueue {\n    private s1: number[] = [];\n    private s2: number[] = [];\n    push(x: number): void {\n        this.s1.push(x);\n    }\n    pop(): number {\n        this.shift();\n        return this.s2.pop()!;\n    }\n    peek(): number {\n        this.shift();\n        return this.s2[this.s2.length - 1];\n    }\n    empty(): boolean {\n        return this.s1.length === 0 && this.s2.length === 0;\n    }\n    private shift() {\n        if (this.s2.length === 0) {\n            while (this.s1.length > 0) {\n                this.s2.push(this.s1.pop()!);\n            }\n        }\n    }\n}",
        testCases: [
          { input: "['MyQueue', 'push', 'push', 'peek', 'pop', 'empty']\n[[], [1], [2], [], [], []]", output: "[null, null, null, 1, 1, false]" }
        ],
        timeComplexity: "Push: O(1) | Pop: O(1) Amortized - Moving elements from s1 to s2 occurs rarely.",
        spaceComplexity: "O(N) - Storing elements across two internal stacks."
      }
    ]
  },
  {
    id: "linkedlist",
    title: "Linked List",
    description: "Learn dynamic pointer structures, node linkings, and circular iterations.",
    estimatedTime: "3 hours",
    xpValue: 200,
    prerequisites: ["arrays"],
    theory: "A Linked List is a linear collection of data elements whose order is not given by their physical placement in memory. Instead, each element (node) points to the next. Linked Lists are dynamic, allowing instant insertion and deletion if the pointer is already present, but they do not support O(1) random access.",
    visualSteps: [
      { title: "Linked Nodes", desc: "Node A (10) -> Node B (20) -> Node C (30) -> NULL", visualState: { head: "A", nodes: { A: { val: 10, next: "B" }, B: { val: 20, next: "C" }, C: { val: 30, next: null } } } },
      { title: "Reversal Pointer Step", desc: "Redirect Node B's next arrow backward to Node A.", visualState: { action: "Redirect arrow B -> A" } }
    ],
    complexity: {
      time: "Search: O(N) | Insert/Delete (Head): O(1) | Insert/Delete (Middle): O(N)",
      space: "O(N) memory allocation to store pointer nodes.",
      explanation: "Navigating requires traversing nodes in sequence. Modifications are constant time adjustments of reference pointers."
    },
    questions: [
      {
        id: "ll-1",
        title: "Reverse Linked List",
        difficulty: "EASY",
        description: "Given the head of a singly linked list, reverse the list, and return its reversed list.",
        starterCode: "class ListNode {\n    val: number;\n    next: ListNode | null;\n    constructor(val?: number, next?: ListNode | null) {\n        this.val = (val===undefined ? 0 : val);\n        this.next = (next===undefined ? null : next);\n    }\n}\n\nfunction reverseList(head: ListNode | null): ListNode | null {\n    // Write code here\n    return null;\n}",
        solutionCode: "function reverseList(head: ListNode | null): ListNode | null {\n    let prev: ListNode | null = null;\n    let curr = head;\n    while (curr !== null) {\n        let nextTemp = curr.next;\n        curr.next = prev;\n        prev = curr;\n        curr = nextTemp;\n    }\n    return prev;\n}",
        testCases: [
          { input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]" }
        ],
        timeComplexity: "O(N) - Linear iteration of list pointers.",
        spaceComplexity: "O(1) - Constant workspace utilizing three pointers."
      }
    ]
  },
  {
    id: "trees",
    title: "Trees",
    description: "Hierarchical parent-child nodes, tree traversals, DFS & BFS recursive flows.",
    estimatedTime: "4 hours",
    xpValue: 250,
    prerequisites: ["recursion"],
    theory: "A Tree is a hierarchical structure representing parents, children, and leaves. Nodes can have zero or more child nodes. Trees are acyclic and connected. Common traversals are Pre-Order, In-Order, Post-Order (DFS) and Level-Order (BFS).",
    visualSteps: [
      { title: "Tree Anatomy", desc: "Root Node (1) has children Node Left (2) and Node Right (3).", visualState: { val: 1, left: 2, right: 3 } }
    ],
    complexity: {
      time: "Traversal: O(N) | Balanced Search: O(log N) | Unbalanced Search: O(N)",
      space: "O(H) recursion stack height space, where H is tree height.",
      explanation: "Processing nodes takes linear time relative to size. Stack space adapts to tree skewness."
    },
    questions: [
      {
        id: "tree-1",
        title: "Maximum Depth of Binary Tree",
        difficulty: "EASY",
        description: "Given the root of a binary tree, return its maximum depth.\n\nA binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.",
        starterCode: "function maxDepth(root: TreeNode | null): number {\n    // Write code here\n    return 0;\n}",
        solutionCode: "function maxDepth(root: TreeNode | null): number {\n    if (root === null) return 0;\n    return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));\n}",
        testCases: [
          { input: "root = [3,9,20,null,null,15,7]", output: "3" }
        ],
        timeComplexity: "O(N) - Traverses every single binary tree node exactly once.",
        spaceComplexity: "O(H) - Max recursion frames proportional to the height of the tree."
      }
    ]
  },
  {
    id: "bst",
    title: "BST",
    description: "Binary Search Trees where Left < Root < Right, sorting values.",
    estimatedTime: "3 hours",
    xpValue: 200,
    prerequisites: ["trees"],
    theory: "A Binary Search Tree (BST) maintains sorted values. For every node, all keys in the left subtree are smaller than the node's key, and all keys in the right subtree are larger. An In-Order traversal of a BST yields sorted elements.",
    visualSteps: [
      { title: "Valid BST", desc: "Root (8) -> Left child (3) is smaller, Right child (10) is larger.", visualState: { val: 8, left: 3, right: 10 } }
    ],
    complexity: {
      time: "Lookup: O(log N) Avg | Insert: O(log N) Avg | Delete: O(log N) Avg",
      space: "O(H) depth recursive height framework.",
      explanation: "Allows binary dividing decision-making at every comparison node. Skewed chains degrade search to O(N)."
    },
    questions: [
      {
        id: "bst-1",
        title: "Validate Binary Search Tree",
        difficulty: "MEDIUM",
        description: "Given the root of a binary tree, determine if it is a valid binary search tree (BST).",
        starterCode: "function isValidBST(root: TreeNode | null): boolean {\n    // Write code here\n    return false;\n}",
        solutionCode: "function isValidBST(root: TreeNode | null): boolean {\n    function validate(node: TreeNode | null, min: number | null, max: number | null): boolean {\n        if (node === null) return true;\n        if ((min !== null && node.val <= min) || (max !== null && node.val >= max)) return false;\n        return validate(node.left, min, node.val) && validate(node.right, node.val, max);\n    }\n    return validate(root, null, null);\n}",
        testCases: [
          { input: "root = [2,1,3]", output: "true" },
          { input: "root = [5,1,4,null,null,3,6]", output: "false" }
        ],
        timeComplexity: "O(N) - Every node is inspected once.",
        spaceComplexity: "O(H) - Proportional to recursion call height."
      }
    ]
  },
  {
    id: "heaps",
    title: "Heaps",
    description: "Min-heaps, max-heaps, priority queues, and sorting top K elements.",
    estimatedTime: "3 hours",
    xpValue: 250,
    prerequisites: ["trees"],
    theory: "A Heap is a specialized tree-based data structure that satisfies the heap property: in a Min-Heap, parent value is smaller than children; in a Max-Heap, parent is larger. It supports retrieving the extreme element in O(1) time and inserting/extracting in O(log N).",
    visualSteps: [
      { title: "Max Heap Root", desc: "Top element is always the absolute maximum value.", visualState: [100, 40, 50, 10, 15] }
    ],
    complexity: {
      time: "Peak Extreme: O(1) | Insert: O(log N) | Extract/Delete: O(log N)",
      space: "O(N) structure mapped using standard flat array indexing.",
      explanation: "Sifting nodes upwards or downwards ensures tree depth complexity constraints of O(log N)."
    },
    questions: [
      {
        id: "hp-1",
        title: "Kth Largest Element in an Array",
        difficulty: "MEDIUM",
        description: "Given an integer array nums and an integer k, return the kth largest element in the array.",
        starterCode: "function findKthLargest(nums: number[], k: number): number {\n    // Write code here\n    return 0;\n}",
        solutionCode: "function findKthLargest(nums: number[], k: number): number {\n    // Simplification for mock compiler execution: Sorting\n    return nums.sort((a,b) => b-a)[k-1];\n}",
        testCases: [
          { input: "nums = [3,2,1,5,6,4], k = 2", output: "5" }
        ],
        timeComplexity: "O(N log K) - Utilizing a min-heap of size K.",
        spaceComplexity: "O(K) - Heap data storage."
      }
    ]
  },
  {
    id: "graphs",
    title: "Graphs",
    description: "Nodes and edges, adjacency matrices, BFS queue loops, and DFS recursions.",
    estimatedTime: "5 hours",
    xpValue: 300,
    prerequisites: ["recursion", "queue"],
    theory: "Graphs consist of Nodes (Vertices) and Edges. They can be directed or undirected, weighted or unweighted, cyclic or acyclic. Common representations include Adjacency List and Adjacency Matrix. Navigations use DFS (stack/recursion) or BFS (queue).",
    visualSteps: [
      { title: "BFS Wavefront", desc: "Traverse graphs radially layer by layer using queues.", visualState: { current: "Node A", queue: ["Node B", "Node C"] } }
    ],
    complexity: {
      time: "DFS/BFS: O(V + E) | Space: O(V + E)",
      space: "O(V) space to keep track of visited node collections.",
      explanation: "Iterates through vertices V and inspects all connecting edges E exactly once to prevent infinite loops."
    },
    questions: [
      {
        id: "gr-1",
        title: "Number of Islands",
        difficulty: "MEDIUM",
        description: "Given an m x n 2D binary grid grid which represents a map of '1's (land) and '0's (water), return the number of islands.\n\nAn island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.",
        starterCode: "function numIslands(grid: string[][]): number {\n    // Write code here\n    return 0;\n}",
        solutionCode: "function numIslands(grid: string[][]): number {\n    if (!grid || grid.length === 0) return 0;\n    let count = 0;\n    const rows = grid.length;\n    const cols = grid[0].length;\n    \n    function dfs(r: number, c: number) {\n        if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] === '0') return;\n        grid[r][c] = '0'; // mark visited\n        dfs(r+1, c);\n        dfs(r-1, c);\n        dfs(r, c+1);\n        dfs(r, c-1);\n    }\n    \n    for (let r = 0; r < rows; r++) {\n        for (let c = 0; c < cols; c++) {\n            if (grid[r][c] === '1') {\n                count++;\n                dfs(r, c);\n            }\n        }\n    }\n    return count;\n}",
        testCases: [
          { input: "grid = [['1','1','0','0','0'],['1','1','0','0','0'],['0','0','1','0','0']]", output: "2" }
        ],
        timeComplexity: "O(M * N) - Evaluates every pixel in grid size boundary.",
        spaceComplexity: "O(M * N) - Recursive call stack if island is complete cover."
      }
    ]
  },
  {
    id: "recursion",
    title: "Recursion",
    description: "Self-calling functions, base cases, and stack memory flows.",
    estimatedTime: "2 hours",
    xpValue: 150,
    prerequisites: [],
    theory: "Recursion is a programming technique where a function calls itself to solve smaller instances of the same problem. A recursive function requires a Base Case to stop the recursion, otherwise it causes stack overflow errors.",
    visualSteps: [
      { title: "Factorial Tree", desc: "factorial(3) calls factorial(2) which calls factorial(1) returning 1.", visualState: "3 -> 2 -> 1 -> Return" }
    ],
    complexity: {
      time: "Fibonacci: O(2^N) | Linear: O(N) | Binary Search: O(log N)",
      space: "O(D) call stack footprint depth.",
      explanation: "Every self-call reserves memory variables on stack. Deep levels trigger stack overflows."
    },
    questions: [
      {
        id: "rec-1",
        title: "Fibonacci Number",
        difficulty: "EASY",
        description: "The Fibonacci numbers, commonly denoted F(n) form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1.",
        starterCode: "function fib(n: number): number {\n    // Write code here\n    return 0;\n}",
        solutionCode: "function fib(n: number): number {\n    if (n <= 1) return n;\n    return fib(n - 1) + fib(n - 2);\n}",
        testCases: [
          { input: "n = 2", output: "1" },
          { input: "n = 4", output: "3" }
        ],
        timeComplexity: "O(2^N) - Massive duplicate branches computed in recursion tree.",
        spaceComplexity: "O(N) - Stack frame depth capacity requirements."
      }
    ]
  },
  {
    id: "backtracking",
    title: "Backtracking",
    description: "DFS path exploration, trial and error, and pruning solutions.",
    estimatedTime: "4 hours",
    xpValue: 300,
    prerequisites: ["recursion"],
    theory: "Backtracking is an algorithmic-technique for solving problems recursively by trying to build a solution incrementally, one piece at a time, removing those solutions that fail to satisfy constraints. It is DFS for search trees.",
    visualSteps: [
      { title: "Subsets Branching", desc: "Include or exclude an element, branch, then pop back to swap choices.", visualState: { choice: "Add/Remove element 1" } }
    ],
    complexity: {
      time: "Permutations: O(N!) | Subsets: O(2^N) | N-Queens: O(N!)",
      space: "O(N) workspace storing candidate state lists.",
      explanation: "Explores exponential combinations. Pruning branches early avoids investigating bad paths."
    },
    questions: [
      {
        id: "bt-1",
        title: "Subsets",
        difficulty: "MEDIUM",
        description: "Given an integer array nums of unique elements, return all possible subsets (the power set).\n\nThe solution set must not contain duplicate subsets. Return the solution in any order.",
        starterCode: "function subsets(nums: number[]): number[][] {\n    // Write code here\n    return [];\n}",
        solutionCode: "function subsets(nums: number[]): number[][] {\n    const res: number[][] = [];\n    const track: number[] = [];\n    function backtrack(start: number) {\n        res.push([...track]);\n        for (let i = start; i < nums.length; i++) {\n            track.push(nums[i]);\n            backtrack(i + 1);\n            track.pop();\n        }\n    }\n    backtrack(0);\n    return res;\n}",
        testCases: [
          { input: "nums = [1,2,3]", output: "[[],[1],[1,2],[1,2,3],[1,3],[2],[2,3],[3]]" }
        ],
        timeComplexity: "O(N * 2^N) - Generates all subset options.",
        spaceComplexity: "O(N) - Space for the recursive workspace stack and tracking buffer."
      }
    ]
  },
  {
    id: "greedy",
    title: "Greedy",
    description: "Make locally optimal choices at each step, optimization heuristics.",
    estimatedTime: "3 hours",
    xpValue: 200,
    prerequisites: ["arrays"],
    theory: "A Greedy Algorithm makes the locally optimal choice at each stage with the hope of finding a global optimum. Greedy methods do not re-evaluate past decisions, making them highly efficient when mathematically sound.",
    visualSteps: [
      { title: "Greedy Choice", desc: "Pick coin with maximum denomination (e.g., 25c) first.", visualState: [25, 10, 5, 1] }
    ],
    complexity: {
      time: "Sorting step: O(N log N) | Scan: O(N)",
      space: "O(1) or O(N) auxiliary values.",
      explanation: "Typically requires sorting elements, followed by a single quick linear sweep."
    },
    questions: [
      {
        id: "grd-1",
        title: "Jump Game",
        difficulty: "MEDIUM",
        description: "You are given an integer array nums. You are initially positioned at the array's first index, and each element in the array represents your maximum jump length at that position.\n\nReturn true if you can reach the last index, or false otherwise.",
        starterCode: "function canJump(nums: number[]): boolean {\n    // Write code here\n    return false;\n}",
        solutionCode: "function canJump(nums: number[]): boolean {\n    let goal = nums.length - 1;\n    for (let i = nums.length - 2; i >= 0; i--) {\n        if (i + nums[i] >= goal) {\n            goal = i;\n        }\n    }\n    return goal === 0;\n}",
        testCases: [
          { input: "nums = [2,3,1,1,4]", output: "true" },
          { input: "nums = [3,2,1,0,4]", output: "false" }
        ],
        timeComplexity: "O(N) - Single backward sweep check.",
        spaceComplexity: "O(1) - Constant memory counters."
      }
    ]
  },
  {
    id: "dp",
    title: "Dynamic Programming",
    description: "Optimize recursions using memoization (top-down) and tabulation (bottom-up).",
    estimatedTime: "5 hours",
    xpValue: 300,
    prerequisites: ["recursion"],
    theory: "Dynamic Programming (DP) solves complex problems by breaking them down into simpler subproblems, solving each subproblem just once, and storing their solutions (often using a memoization hash table or tabulation array) to avoid duplicated computations.",
    visualSteps: [
      { title: "Tabulation Grid", desc: "Fill 1D/2D table where dp[i] depends on cached states dp[i-1] and dp[i-2].", visualState: [0, 1, 1, 2, 3, 5] }
    ],
    complexity: {
      time: "Memoized/Tabulated: O(N) | Unoptimized: O(2^N)",
      space: "O(N) dp table allocation, can be optimized to O(1).",
      explanation: "Memoization cuts redundant subtrees, compressing exponential complexity down to linear time."
    },
    questions: [
      {
        id: "dp-1",
        title: "Climbing Stairs",
        difficulty: "EASY",
        description: "You are climbing a staircase. It takes n steps to reach the top.\n\nEach time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
        starterCode: "function climbStairs(n: number): number {\n    // Write code here\n    return 0;\n}",
        solutionCode: "function climbStairs(n: number): number {\n    if (n <= 2) return n;\n    let one = 1, two = 2;\n    for (let i = 3; i <= n; i++) {\n        let temp = one + two;\n        one = two;\n        two = temp;\n    }\n    return two;\n}",
        testCases: [
          { input: "n = 3", output: "3" }
        ],
        timeComplexity: "O(N) - Iterating from step 3 up to N.",
        spaceComplexity: "O(1) - Using two variables to cache past values instead of full array."
      }
    ]
  },
  {
    id: "slidingwindow",
    title: "Sliding Window",
    description: "Track sequential subsets using dynamic arrays and left/right limits.",
    estimatedTime: "3 hours",
    xpValue: 200,
    prerequisites: ["arrays"],
    theory: "The Sliding Window pattern is used to perform operations on a specific window size of a given array or string, such as finding the longest substring or subsegment. This converts O(N^2) double-loops into optimal O(N) linear single-passes.",
    visualSteps: [
      { title: "Window Slide", desc: "Right pointer expands to acquire elements, Left pointer contracts to maintain constraints.", visualState: { l: 0, r: 2, window: [1, 2, 3] } }
    ],
    complexity: {
      time: "Linear scan: O(N)",
      space: "O(K) auxiliary cache containing sliding statistics.",
      explanation: "Each element is visited at most twice (once by Right, once by Left), ensuring linear O(N) runtime."
    },
    questions: [
      {
        id: "sw-1",
        title: "Longest Substring Without Repeating Characters",
        difficulty: "MEDIUM",
        description: "Given a string s, find the length of the longest substring without repeating characters.",
        starterCode: "function lengthOfLongestSubstring(s: string): number {\n    // Write code here\n    return 0;\n}",
        solutionCode: "function lengthOfLongestSubstring(s: string): number {\n    let maxLen = 0;\n    let l = 0;\n    const charSet = new Set<string>();\n    for (let r = 0; r < s.length; r++) {\n        while (charSet.has(s[r])) {\n            charSet.delete(s[l]);\n            l++;\n        }\n        charSet.add(s[r]);\n        maxLen = Math.max(maxLen, r - l + 1);\n    }\n    return maxLen;\n}",
        testCases: [
          { input: "s = 'abcabcbb'", output: "3" }
        ],
        timeComplexity: "O(N) - Both pointers sweep the string once.",
        spaceComplexity: "O(K) - Hash set size constrained by characters."
      }
    ]
  },
  {
    id: "twopointer",
    title: "Two Pointer",
    description: "Perform fast comparisons using left-right bounds or slow-fast pointers.",
    estimatedTime: "2 hours",
    xpValue: 150,
    prerequisites: ["arrays"],
    theory: "The Two Pointer technique utilizes two index references to scan an iterable. Pointers can move in opposite directions (e.g. from ends to center) or in the same direction at different speeds (slow and fast pointers, useful for cycles).",
    visualSteps: [
      { title: "Opposite Pointers", desc: "Pointers meet: Left = 0, Right = Length - 1. Compare values at ends.", visualState: { l: 0, r: 4 } }
    ],
    complexity: {
      time: "O(N) time single traversal.",
      space: "O(1) space, avoiding heavy temporary arrays.",
      explanation: "Avoids redundant nested iterations by using sorted attributes to make movement decisions."
    },
    questions: [
      {
        id: "tp-1",
        title: "Valid Palindrome",
        difficulty: "EASY",
        description: "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.\n\nGiven a string s, return true if it is a palindrome, or false otherwise.",
        starterCode: "function isPalindrome(s: string): boolean {\n    // Write code here\n    return false;\n}",
        solutionCode: "function isPalindrome(s: string): boolean {\n    const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');\n    let l = 0, r = clean.length - 1;\n    while (l < r) {\n        if (clean[l] !== clean[r]) return false;\n        l++;\n        r--;\n    }\n    return true;\n}",
        testCases: [
          { input: "s = 'A man, a plan, a canal: Panama'", output: "true" }
        ],
        timeComplexity: "O(N) - Linear scanning characters to meet in the middle.",
        spaceComplexity: "O(N) - Storing clean string space (can be optimized to O(1) in-place)."
      }
    ]
  },
  {
    id: "bitmanipulation",
    title: "Bit Manipulation",
    description: "Operate at the lowest binary bit level: AND, OR, XOR, shifts.",
    estimatedTime: "2 hours",
    xpValue: 200,
    prerequisites: [],
    theory: "Bit Manipulation performs operations directly at the binary bits level. These operators (&, |, ^, ~, <<, >>) are fast and memory-efficient, commonly used in checksums, cryptography, and flags.",
    visualSteps: [
      { title: "Binary Representation", desc: "Number 5 is binary 0101. Number 3 is binary 0011.", visualState: { 5: "0101", 3: "0011" } },
      { title: "Bitwise XOR", desc: "5 XOR 3 yields 0110 which is 6.", visualState: "0101 ^ 0011 = 0110 (6)" }
    ],
    complexity: {
      time: "Constant operations: O(1) speed.",
      space: "O(1) constant auxiliary storage.",
      explanation: "CPUs execute bitwise operators in single-cycle assembly instructions."
    },
    questions: [
      {
        id: "bit-1",
        title: "Single Number",
        difficulty: "EASY",
        description: "Given a non-empty array of integers nums, every element appears twice except for one. Find that single one.\n\nYou must implement a solution with a linear runtime complexity and use only constant extra space.",
        starterCode: "function singleNumber(nums: number[]): number {\n    // Write code here\n    return 0;\n}",
        solutionCode: "function singleNumber(nums: number[]): number {\n    let res = 0;\n    for (let n of nums) {\n        res ^= n; // XOR cancelling double numbers\n    }\n    return res;\n}",
        testCases: [
          { input: "nums = [2,2,1]", output: "1" }
        ],
        timeComplexity: "O(N) - Single sweep across the elements array.",
        spaceComplexity: "O(1) - Constant auxiliary space."
      }
    ]
  }
];
