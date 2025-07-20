const mongoose = require('mongoose');
const Problem = require('../models/Problem');
const Topic = require('../models/Topic');
const Achievement = require('../models/Achievement');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codemaster');

const sampleProblems = [
  {
    title: "Two Sum",
    difficulty: "Easy",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]"
      },
      {
        input: "nums = [3,3], target = 6",
        output: "[0,1]"
      }
    ],
    constraints: [
      "2 <= nums.length <= 10⁴",
      "-10⁹ <= nums[i] <= 10⁹",
      "-10⁹ <= target <= 10⁹",
      "Only one valid answer exists."
    ],
    tags: ["arrays", "hash-table"],
    testCases: [
      {
        input: "nums = [2,7,11,15], target = 9",
        expectedOutput: "[0,1]",
        isHidden: false
      },
      {
        input: "nums = [3,2,4], target = 6",
        expectedOutput: "[1,2]",
        isHidden: false
      },
      {
        input: "nums = [3,3], target = 6",
        expectedOutput: "[0,1]",
        isHidden: false
      },
      {
        input: "nums = [1,2,3,4,5], target = 9",
        expectedOutput: "[3,4]",
        isHidden: true
      }
    ],
    codeTemplates: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // Your solution here
    
};`,
      python: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Your solution here
        pass`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your solution here
        
    }
}`,
      cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Your solution here
        
    }
};`,
      typescript: `function twoSum(nums: number[], target: number): number[] {
    // Your solution here
    
}`
    },
    order: 1
  },
  {
    title: "Valid Parentheses",
    difficulty: "Easy",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets. Open brackets must be closed in the correct order. Every close bracket has a corresponding open bracket of the same type.",
    examples: [
      {
        input: 's = "()"',
        output: "true"
      },
      {
        input: 's = "()[]{}"',
        output: "true"
      },
      {
        input: 's = "(]"',
        output: "false"
      }
    ],
    constraints: [
      "1 <= s.length <= 10⁴",
      "s consists of parentheses only '()[]{}'."
    ],
    tags: ["strings", "stacks-queues"],
    testCases: [
      {
        input: 's = "()"',
        expectedOutput: "true",
        isHidden: false
      },
      {
        input: 's = "()[]{}"',
        expectedOutput: "true",
        isHidden: false
      },
      {
        input: 's = "(]"',
        expectedOutput: "false",
        isHidden: false
      },
      {
        input: 's = "([)]"',
        expectedOutput: "false",
        isHidden: true
      }
    ],
    codeTemplates: {
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
var isValid = function(s) {
    // Your solution here
    
};`,
      python: `class Solution:
    def isValid(self, s: str) -> bool:
        # Your solution here
        pass`
    },
    order: 2
  },
  {
    title: "Merge Two Sorted Lists",
    difficulty: "Easy",
    description: "You are given the heads of two sorted linked lists list1 and list2. Merge the two lists in a one sorted list. The list should be made by splicing together the nodes of the first two lists. Return the head of the merged linked list.",
    examples: [
      {
        input: "list1 = [1,2,4], list2 = [1,3,4]",
        output: "[1,1,2,3,4,4]"
      },
      {
        input: "list1 = [], list2 = []",
        output: "[]"
      },
      {
        input: "list1 = [], list2 = [0]",
        output: "[0]"
      }
    ],
    constraints: [
      "The number of nodes in both lists is in the range [0, 50].",
      "-100 <= Node.val <= 100",
      "Both list1 and list2 are sorted in non-decreasing order."
    ],
    tags: ["linked-lists"],
    testCases: [
      {
        input: "list1 = [1,2,4], list2 = [1,3,4]",
        expectedOutput: "[1,1,2,3,4,4]",
        isHidden: false
      }
    ],
    codeTemplates: {
      javascript: `/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} list1
 * @param {ListNode} list2
 * @return {ListNode}
 */
var mergeTwoLists = function(list1, list2) {
    // Your solution here
    
};`
    },
    order: 3
  }
];

const topics = [
  {
    id: 'arrays',
    name: 'Arrays',
    description: 'Master array manipulation, searching, and sorting algorithms',
    difficulty: 'Beginner',
    icon: '📊',
    color: 'from-blue-500 to-blue-600',
    estimatedTime: '2-3 weeks',
    prerequisites: [],
    order: 1
  },
  {
    id: 'strings',
    name: 'Strings',
    description: 'String processing, pattern matching, and text algorithms',
    difficulty: 'Beginner',
    icon: '📝',
    color: 'from-green-500 to-green-600',
    estimatedTime: '2-3 weeks',
    prerequisites: [],
    order: 2
  },
  {
    id: 'linked-lists',
    name: 'Linked Lists',
    description: 'Singly, doubly linked lists and their operations',
    difficulty: 'Beginner',
    icon: '🔗',
    color: 'from-purple-500 to-purple-600',
    estimatedTime: '1-2 weeks',
    prerequisites: [],
    order: 3
  },
  {
    id: 'stacks-queues',
    name: 'Stacks & Queues',
    description: 'LIFO and FIFO data structures and their applications',
    difficulty: 'Beginner',
    icon: '📚',
    color: 'from-yellow-500 to-yellow-600',
    estimatedTime: '1-2 weeks',
    prerequisites: [],
    order: 4
  }
];

const achievements = [
  {
    name: "First Problem Solved",
    description: "Solve your first coding problem",
    icon: "🎯",
    category: "solving",
    criteria: {
      type: "problems_solved",
      value: 1
    },
    points: 10,
    rarity: "common"
  },
  {
    name: "Problem Solver",
    description: "Solve 10 coding problems",
    icon: "🧩",
    category: "solving",
    criteria: {
      type: "problems_solved",
      value: 10
    },
    points: 50,
    rarity: "common"
  },
  {
    name: "7-Day Streak",
    description: "Solve problems for 7 consecutive days",
    icon: "🔥",
    category: "streak",
    criteria: {
      type: "streak_days",
      value: 7
    },
    points: 100,
    rarity: "common"
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await Topic.deleteMany({});
    await Problem.deleteMany({});
    await Achievement.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Insert topics
    console.log('📚 Inserting topics...');
    const insertedTopics = await Topic.insertMany(topics);

    // Insert problems
    console.log('🧩 Inserting problems...');
    const insertedProblems = await Problem.insertMany(sampleProblems);

    // Link problems to topics
    for (const problem of insertedProblems) {
      for (const tag of problem.tags) {
        const topic = insertedTopics.find(t => t.id === tag);
        if (topic && !topic.problems.includes(problem._id)) {
          topic.problems.push(problem._id);
          await topic.save();
        }
      }
    }

    // Insert achievements
    console.log('🏆 Inserting achievements...');
    await Achievement.insertMany(achievements);

    console.log('✅ Database seeded successfully!');
    console.log(`📊 Inserted ${insertedTopics.length} topics`);
    console.log(`🧩 Inserted ${insertedProblems.length} problems`);
    console.log(`🏆 Inserted ${achievements.length} achievements`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, sampleProblems, topics, achievements };