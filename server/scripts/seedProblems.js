const mongoose = require('mongoose');
const Problem = require('../models/Problem');
require('dotenv').config();

const sampleProblems = [
  {
    title: "Two Sum",
    difficulty: "Easy",
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
        explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]."
      }
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists."
    ],
    topics: ["Array", "Hash Table"],
    testCases: {
      visible: [
        {
          input: { nums: [2, 7, 11, 15], target: 9 },
          expectedOutput: [0, 1]
        },
        {
          input: { nums: [3, 2, 4], target: 6 },
          expectedOutput: [1, 2]
        }
      ],
      hidden: [
        {
          input: { nums: [3, 3], target: 6 },
          expectedOutput: [0, 1]
        },
        {
          input: { nums: [1, 2, 3, 4, 5], target: 9 },
          expectedOutput: [3, 4]
        }
      ]
    },
    codeTemplates: {
      javascript: `function twoSum(nums, target) {
    // Your code here
}`,
      python: `def two_sum(nums, target):
    # Your code here
    pass`,
      typescript: `function twoSum(nums: number[], target: number): number[] {
    // Your code here
}`
    }
  },
  {
    title: "Valid Parentheses",
    difficulty: "Easy",
    description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    examples: [
      {
        input: 's = "()"',
        output: "true",
        explanation: "The string contains valid parentheses."
      },
      {
        input: 's = "()[]{}"',
        output: "true",
        explanation: "All brackets are properly matched."
      },
      {
        input: 's = "(]"',
        output: "false",
        explanation: "Brackets are not properly matched."
      }
    ],
    constraints: [
      "1 <= s.length <= 10^4",
      "s consists of parentheses only '()[]{}'."
    ],
    topics: ["String", "Stack"],
    testCases: {
      visible: [
        {
          input: "()",
          expectedOutput: true
        },
        {
          input: "()[]{}",
          expectedOutput: true
        },
        {
          input: "(]",
          expectedOutput: false
        }
      ],
      hidden: [
        {
          input: "((()))",
          expectedOutput: true
        },
        {
          input: "({[]})",
          expectedOutput: true
        },
        {
          input: "([)]",
          expectedOutput: false
        }
      ]
    },
    codeTemplates: {
      javascript: `function isValid(s) {
    // Your code here
}`,
      python: `def is_valid(s):
    # Your code here
    pass`,
      typescript: `function isValid(s: string): boolean {
    // Your code here
}`
    }
  },
  {
    title: "Reverse Linked List",
    difficulty: "Easy",
    description: `Given the head of a singly linked list, reverse the list, and return the reversed list.`,
    examples: [
      {
        input: "head = [1,2,3,4,5]",
        output: "[5,4,3,2,1]",
        explanation: "The linked list is reversed."
      },
      {
        input: "head = [1,2]",
        output: "[2,1]",
        explanation: "The linked list is reversed."
      }
    ],
    constraints: [
      "The number of nodes in the list is the range [0, 5000].",
      "-5000 <= Node.val <= 5000"
    ],
    topics: ["Linked List", "Recursion"],
    testCases: {
      visible: [
        {
          input: [1, 2, 3, 4, 5],
          expectedOutput: [5, 4, 3, 2, 1]
        },
        {
          input: [1, 2],
          expectedOutput: [2, 1]
        }
      ],
      hidden: [
        {
          input: [],
          expectedOutput: []
        },
        {
          input: [1],
          expectedOutput: [1]
        }
      ]
    },
    codeTemplates: {
      javascript: `function reverseList(head) {
    // Your code here
}`,
      python: `def reverse_list(head):
    # Your code here
    pass`,
      typescript: `function reverseList(head: ListNode | null): ListNode | null {
    // Your code here
}`
    }
  },
  {
    title: "Maximum Subarray",
    difficulty: "Medium",
    description: `Given an integer array nums, find the subarray with the largest sum, and return its sum.`,
    examples: [
      {
        input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
        output: "6",
        explanation: "The subarray [4,-1,2,1] has the largest sum 6."
      },
      {
        input: "nums = [1]",
        output: "1",
        explanation: "The subarray [1] has the largest sum 1."
      }
    ],
    constraints: [
      "1 <= nums.length <= 10^5",
      "-10^4 <= nums[i] <= 10^4"
    ],
    topics: ["Array", "Divide and Conquer", "Dynamic Programming"],
    testCases: {
      visible: [
        {
          input: [-2, 1, -3, 4, -1, 2, 1, -5, 4],
          expectedOutput: 6
        },
        {
          input: [1],
          expectedOutput: 1
        }
      ],
      hidden: [
        {
          input: [5, 4, -1, 7, 8],
          expectedOutput: 23
        },
        {
          input: [-1, -2, -3, -4],
          expectedOutput: -1
        }
      ]
    },
    codeTemplates: {
      javascript: `function maxSubArray(nums) {
    // Your code here
}`,
      python: `def max_sub_array(nums):
    # Your code here
    pass`,
      typescript: `function maxSubArray(nums: number[]): number {
    // Your code here
}`
    }
  }
];

async function seedProblems() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codemaster');
    console.log('Connected to MongoDB');

    // Clear existing problems
    await Problem.deleteMany({});
    console.log('Cleared existing problems');

    // Insert sample problems
    const insertedProblems = await Problem.insertMany(sampleProblems);
    console.log(`✅ Successfully seeded ${insertedProblems.length} problems`);

    // Display inserted problems
    insertedProblems.forEach((problem, index) => {
      console.log(`${index + 1}. ${problem.title} (${problem.difficulty})`);
    });

  } catch (error) {
    console.error('❌ Error seeding problems:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seeding function
if (require.main === module) {
  seedProblems();
}

module.exports = { seedProblems, sampleProblems };