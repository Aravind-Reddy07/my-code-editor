const mongoose = require('mongoose');
const Problem = require('../models/Problem');
const Topic = require('../models/Topic');
const Achievement = require('../models/Achievement');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codemaster');

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
  },
  {
    id: 'trees',
    name: 'Trees',
    description: 'Binary trees, BST, AVL trees, and tree traversals',
    difficulty: 'Intermediate',
    icon: '🌳',
    color: 'from-emerald-500 to-emerald-600',
    estimatedTime: '3-4 weeks',
    prerequisites: ['linked-lists'],
    order: 5
  },
  {
    id: 'graphs',
    name: 'Graphs',
    description: 'Graph representation, BFS, DFS, and shortest path algorithms',
    difficulty: 'Intermediate',
    icon: '🕸️',
    color: 'from-indigo-500 to-indigo-600',
    estimatedTime: '3-4 weeks',
    prerequisites: ['trees', 'stacks-queues'],
    order: 6
  },
  {
    id: 'dynamic-programming',
    name: 'Dynamic Programming',
    description: 'Optimization problems using memoization and tabulation',
    difficulty: 'Advanced',
    icon: '🧮',
    color: 'from-red-500 to-red-600',
    estimatedTime: '4-5 weeks',
    prerequisites: ['arrays', 'strings'],
    order: 7
  },
  {
    id: 'sliding-window',
    name: 'Sliding Window',
    description: 'Efficient algorithms for subarray and substring problems',
    difficulty: 'Intermediate',
    icon: '🪟',
    color: 'from-cyan-500 to-cyan-600',
    estimatedTime: '1-2 weeks',
    prerequisites: ['arrays', 'strings'],
    order: 8
  },
  {
    id: 'two-pointers',
    name: 'Two Pointers',
    description: 'Efficient techniques for array and string problems',
    difficulty: 'Intermediate',
    icon: '👆',
    color: 'from-pink-500 to-pink-600',
    estimatedTime: '1-2 weeks',
    prerequisites: ['arrays', 'strings'],
    order: 9
  }
];

const problems = [
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
        expectedOutput: "[0,1]"
      },
      {
        input: "nums = [3,2,4], target = 6",
        expectedOutput: "[1,2]"
      },
      {
        input: "nums = [3,3], target = 6",
        expectedOutput: "[0,1]"
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
    name: "Coding Enthusiast",
    description: "Solve 50 coding problems",
    icon: "💻",
    category: "solving",
    criteria: {
      type: "problems_solved",
      value: 50
    },
    points: 200,
    rarity: "rare"
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
  },
  {
    name: "Consistency King",
    description: "Solve problems for 30 consecutive days",
    icon: "👑",
    category: "streak",
    criteria: {
      type: "streak_days",
      value: 30
    },
    points: 500,
    rarity: "epic"
  },
  {
    name: "Array Master",
    description: "Complete the Arrays topic",
    icon: "📊",
    category: "topic",
    criteria: {
      type: "topic_completion",
      value: 20,
      topic: "arrays"
    },
    points: 150,
    rarity: "rare"
  },
  {
    name: "Speed Demon",
    description: "Solve problems with exceptional speed",
    icon: "⚡",
    category: "speed",
    criteria: {
      type: "speed_solving",
      value: 100 // milliseconds
    },
    points: 200,
    rarity: "epic"
  }
];

async function seedData() {
  try {
    console.log('Seeding database...');

    // Clear existing data
    await Topic.deleteMany({});
    await Problem.deleteMany({});
    await Achievement.deleteMany({});

    // Insert topics
    console.log('Inserting topics...');
    const insertedTopics = await Topic.insertMany(topics);

    // Insert problems and link to topics
    console.log('Inserting problems...');
    const insertedProblems = await Problem.insertMany(problems);

    // Link problems to topics
    const arrayTopic = insertedTopics.find(t => t.id === 'arrays');
    if (arrayTopic) {
      arrayTopic.problems = insertedProblems.map(p => p._id);
      await arrayTopic.save();
    }

    // Insert achievements
    console.log('Inserting achievements...');
    await Achievement.insertMany(achievements);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedData();