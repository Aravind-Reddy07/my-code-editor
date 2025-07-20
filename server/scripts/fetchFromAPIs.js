const axios = require('axios');
const Problem = require('../models/Problem');
require('dotenv').config();

/**
 * Free DSA Problem Sources and APIs
 * 
 * 1. LeetCode (via web scraping - see fetchLeetCodeProblems.js)
 * 2. HackerRank (limited free API)
 * 3. Codeforces (public API)
 * 4. AtCoder (public API)
 * 5. SPOJ (web scraping)
 * 6. GeeksforGeeks (web scraping)
 * 7. InterviewBit (web scraping)
 * 8. GitHub repositories with curated problems
 */

class ProblemAggregator {
  constructor() {
    this.sources = {
      codeforces: new CodeforcesFetcher(),
      github: new GitHubFetcher(),
      // Add more sources as needed
    };
  }

  async fetchFromAllSources(limit = 50) {
    const allProblems = [];
    
    for (const [sourceName, fetcher] of Object.entries(this.sources)) {
      try {
        console.log(`🔍 Fetching from ${sourceName}...`);
        const problems = await fetcher.fetchProblems(limit);
        allProblems.push(...problems);
        console.log(`✅ Fetched ${problems.length} problems from ${sourceName}`);
      } catch (error) {
        console.error(`❌ Error fetching from ${sourceName}:`, error.message);
      }
    }

    return allProblems;
  }
}

class CodeforcesFetcher {
  constructor() {
    this.baseURL = 'https://codeforces.com/api';
  }

  async fetchProblems(limit = 20) {
    try {
      const response = await axios.get(`${this.baseURL}/problemset.problems`);
      const problems = response.data.result.problems
        .filter(p => p.rating && p.rating <= 1200) // Easy problems
        .slice(0, limit);

      return problems.map(this.convertToStandardFormat.bind(this));
    } catch (error) {
      console.error('Codeforces API error:', error.message);
      return [];
    }
  }

  convertToStandardFormat(cfProblem) {
    return {
      title: cfProblem.name,
      slug: `${cfProblem.contestId}-${cfProblem.index}`.toLowerCase(),
      difficulty: this.mapDifficulty(cfProblem.rating),
      description: `Problem from Codeforces Contest ${cfProblem.contestId}, Problem ${cfProblem.index}`,
      examples: [],
      constraints: [],
      tags: cfProblem.tags.map(tag => tag.toLowerCase().replace(' ', '-')),
      testCases: [],
      codeTemplates: this.generateDefaultTemplates(),
      source: 'codeforces',
      externalUrl: `https://codeforces.com/problem/${cfProblem.contestId}/${cfProblem.index}`
    };
  }

  mapDifficulty(rating) {
    if (rating <= 1000) return 'Easy';
    if (rating <= 1600) return 'Medium';
    return 'Hard';
  }

  generateDefaultTemplates() {
    return {
      javascript: `// Solve the problem here
function solve() {
    // Your solution
}`,
      python: `# Solve the problem here
def solve():
    # Your solution
    pass`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    // Your solution
    return 0;
}`
    };
  }
}

class GitHubFetcher {
  constructor() {
    this.repositories = [
      'jwasham/coding-interview-university',
      'kdn251/interviews',
      'donnemartin/interactive-coding-challenges',
      'TheAlgorithms/Python',
      'TheAlgorithms/JavaScript'
    ];
  }

  async fetchProblems(limit = 10) {
    // This would require parsing README files and extracting problem descriptions
    // For now, return curated problems
    return this.getCuratedProblems().slice(0, limit);
  }

  getCuratedProblems() {
    return [
      {
        title: "Reverse String",
        slug: "reverse-string",
        difficulty: "Easy",
        description: "Write a function that reverses a string. The input string is given as an array of characters char[].",
        examples: [
          {
            input: '["h","e","l","l","o"]',
            output: '["o","l","l","e","h"]'
          }
        ],
        constraints: [
          "1 <= s.length <= 10^5",
          "s[i] is a printable ascii character."
        ],
        tags: ["strings", "two-pointers"],
        testCases: [
          {
            input: '["h","e","l","l","o"]',
            expectedOutput: '["o","l","l","e","h"]',
            isHidden: false
          }
        ],
        codeTemplates: {
          javascript: `/**
 * @param {character[]} s
 * @return {void} Do not return anything, modify s in-place instead.
 */
var reverseString = function(s) {
    // Your solution here
};`,
          python: `class Solution:
    def reverseString(self, s: List[str]) -> None:
        """
        Do not return anything, modify s in-place instead.
        """
        # Your solution here
        pass`
        },
        source: 'github'
      },
      {
        title: "Palindrome Number",
        slug: "palindrome-number",
        difficulty: "Easy",
        description: "Given an integer x, return true if x is palindrome integer. An integer is a palindrome when it reads the same backward as forward.",
        examples: [
          {
            input: "x = 121",
            output: "true",
            explanation: "121 reads as 121 from left to right and from right to left."
          },
          {
            input: "x = -121",
            output: "false",
            explanation: "From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome."
          }
        ],
        constraints: [
          "-2^31 <= x <= 2^31 - 1"
        ],
        tags: ["math"],
        testCases: [
          {
            input: "x = 121",
            expectedOutput: "true",
            isHidden: false
          },
          {
            input: "x = -121",
            expectedOutput: "false",
            isHidden: false
          }
        ],
        codeTemplates: {
          javascript: `/**
 * @param {number} x
 * @return {boolean}
 */
var isPalindrome = function(x) {
    // Your solution here
};`,
          python: `class Solution:
    def isPalindrome(self, x: int) -> bool:
        # Your solution here
        pass`
        },
        source: 'github'
      }
    ];
  }
}

async function fetchAndSaveFromAPIs() {
  try {
    console.log('🚀 Starting to fetch problems from various APIs...');
    
    const aggregator = new ProblemAggregator();
    const problems = await aggregator.fetchFromAllSources(30);
    
    console.log(`📊 Total problems fetched: ${problems.length}`);
    
    let savedCount = 0;
    
    for (const problemData of problems) {
      try {
        // Check if problem already exists
        const existingProblem = await Problem.findOne({ slug: problemData.slug });
        if (existingProblem) {
          console.log(`⏭️  Skipping ${problemData.title} (already exists)`);
          continue;
        }

        const problem = new Problem(problemData);
        await problem.save();
        
        savedCount++;
        console.log(`✅ Saved: ${problemData.title} (from ${problemData.source})`);
        
      } catch (error) {
        console.error(`❌ Error saving ${problemData.title}:`, error.message);
      }
    }

    console.log(`🎉 Successfully saved ${savedCount} new problems!`);
    
  } catch (error) {
    console.error('❌ Error in fetchAndSaveFromAPIs:', error);
  }
}

module.exports = { 
  ProblemAggregator, 
  CodeforcesFetcher, 
  GitHubFetcher, 
  fetchAndSaveFromAPIs 
};

// Run if called directly
if (require.main === module) {
  const mongoose = require('mongoose');
  
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codemaster')
    .then(() => {
      console.log('📊 Connected to MongoDB');
      return fetchAndSaveFromAPIs();
    })
    .then(() => {
      console.log('✅ Done!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}