const axios = require('axios');
const Problem = require('../models/Problem');
require('dotenv').config();

// LeetCode GraphQL endpoint
const LEETCODE_API = 'https://leetcode.com/graphql';

// GraphQL query to get problem list
const PROBLEMS_QUERY = `
  query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
    problemsetQuestionList: questionList(
      categorySlug: $categorySlug
      limit: $limit
      skip: $skip
      filters: $filters
    ) {
      total: totalNum
      questions: data {
        acRate
        difficulty
        freqBar
        frontendQuestionId: questionFrontendId
        isFavor
        paidOnly: isPaidOnly
        status
        title
        titleSlug
        topicTags {
          name
          id
          slug
        }
        hasSolution
        hasVideoSolution
      }
    }
  }
`;

// GraphQL query to get problem details
const PROBLEM_DETAIL_QUERY = `
  query questionData($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      questionId
      questionFrontendId
      title
      titleSlug
      content
      translatedTitle
      translatedContent
      isPaidOnly
      difficulty
      likes
      dislikes
      isLiked
      similarQuestions
      exampleTestcases
      categoryTitle
      contributors {
        username
        profileUrl
        avatarUrl
        __typename
      }
      topicTags {
        name
        slug
        translatedName
        __typename
      }
      companyTagStats
      codeSnippets {
        lang
        langSlug
        code
        __typename
      }
      stats
      hints
      solution {
        id
        canSeeDetail
        paidOnly
        hasVideoSolution
        paidOnlyVideo
        __typename
      }
      status
      sampleTestCase
      metaData
      judgerAvailable
      judgeType
      mysqlSchemas
      enableRunCode
      enableTestMode
      enableDebugger
      envInfo
      libraryUrl
      adminUrl
      challengeQuestion {
        id
        date
        incompleteChallengeCount
        streakCount
        type
        __typename
      }
      __typename
    }
  }
`;

class LeetCodeScraper {
  constructor() {
    this.session = axios.create({
      baseURL: LEETCODE_API,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
  }

  async fetchProblemList(limit = 50, skip = 0) {
    try {
      const response = await this.session.post('', {
        query: PROBLEMS_QUERY,
        variables: {
          categorySlug: "",
          limit,
          skip,
          filters: {
            difficulty: "EASY" // Start with easy problems
          }
        }
      });

      return response.data.data.problemsetQuestionList.questions.filter(q => !q.paidOnly);
    } catch (error) {
      console.error('Error fetching problem list:', error.message);
      return [];
    }
  }

  async fetchProblemDetail(titleSlug) {
    try {
      const response = await this.session.post('', {
        query: PROBLEM_DETAIL_QUERY,
        variables: { titleSlug }
      });

      return response.data.data.question;
    } catch (error) {
      console.error(`Error fetching problem detail for ${titleSlug}:`, error.message);
      return null;
    }
  }

  parseContent(htmlContent) {
    // Basic HTML to text conversion
    return htmlContent
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .trim();
  }

  extractExamples(content, sampleTestCase) {
    const examples = [];
    
    // Try to extract examples from content
    const exampleRegex = /<strong>Example \d+:<\/strong>(.*?)(?=<strong>Example \d+:|<strong>Constraints:|$)/gs;
    let match;
    
    while ((match = exampleRegex.exec(content)) !== null) {
      const exampleText = this.parseContent(match[1]);
      const inputMatch = exampleText.match(/Input:\s*(.+)/);
      const outputMatch = exampleText.match(/Output:\s*(.+)/);
      const explanationMatch = exampleText.match(/Explanation:\s*(.+)/);
      
      if (inputMatch && outputMatch) {
        examples.push({
          input: inputMatch[1].trim(),
          output: outputMatch[1].trim(),
          explanation: explanationMatch ? explanationMatch[1].trim() : undefined
        });
      }
    }

    // If no examples found, try to use sample test case
    if (examples.length === 0 && sampleTestCase) {
      const lines = sampleTestCase.split('\n');
      if (lines.length >= 2) {
        examples.push({
          input: lines[0],
          output: lines[1]
        });
      }
    }

    return examples;
  }

  extractConstraints(content) {
    const constraints = [];
    const constraintsMatch = content.match(/<strong>Constraints:<\/strong>(.*?)(?=<\/div>|$)/s);
    
    if (constraintsMatch) {
      const constraintsText = this.parseContent(constraintsMatch[1]);
      const lines = constraintsText.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        const cleaned = line.trim().replace(/^[•\-\*]\s*/, '');
        if (cleaned) {
          constraints.push(cleaned);
        }
      }
    }

    return constraints;
  }

  generateTestCases(examples, sampleTestCase) {
    const testCases = [];
    
    // Convert examples to test cases
    examples.forEach((example, index) => {
      testCases.push({
        input: example.input,
        expectedOutput: example.output,
        isHidden: false
      });
    });

    // Add sample test case if different
    if (sampleTestCase && !examples.some(ex => ex.input === sampleTestCase.split('\n')[0])) {
      const lines = sampleTestCase.split('\n');
      if (lines.length >= 2) {
        testCases.push({
          input: lines[0],
          expectedOutput: lines[1],
          isHidden: true
        });
      }
    }

    return testCases;
  }

  mapDifficulty(difficulty) {
    const difficultyMap = {
      'Easy': 'Easy',
      'Medium': 'Medium',
      'Hard': 'Hard'
    };
    return difficultyMap[difficulty] || 'Easy';
  }

  mapTags(topicTags) {
    const tagMap = {
      'array': 'arrays',
      'string': 'strings',
      'linked-list': 'linked-lists',
      'stack': 'stacks-queues',
      'queue': 'stacks-queues',
      'tree': 'trees',
      'binary-tree': 'trees',
      'graph': 'graphs',
      'dynamic-programming': 'dynamic-programming',
      'sliding-window': 'sliding-window',
      'two-pointers': 'two-pointers',
      'hash-table': 'hash-table',
      'sorting': 'sorting',
      'binary-search': 'binary-search',
      'backtracking': 'backtracking',
      'greedy': 'greedy',
      'math': 'math',
      'bit-manipulation': 'bit-manipulation'
    };

    return topicTags
      .map(tag => tagMap[tag.slug] || tag.slug)
      .filter(tag => tag);
  }

  generateCodeTemplates(codeSnippets, title) {
    const templates = {};
    
    const langMap = {
      'javascript': 'javascript',
      'python3': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'typescript': 'typescript'
    };

    codeSnippets.forEach(snippet => {
      const lang = langMap[snippet.langSlug];
      if (lang) {
        templates[lang] = snippet.code;
      }
    });

    return templates;
  }

  async convertToProblem(leetcodeProblem) {
    const detail = await this.fetchProblemDetail(leetcodeProblem.titleSlug);
    if (!detail) return null;

    const content = detail.content || '';
    const examples = this.extractExamples(content, detail.sampleTestCase);
    const constraints = this.extractConstraints(content);
    const testCases = this.generateTestCases(examples, detail.sampleTestCase);

    return {
      title: detail.title,
      slug: detail.titleSlug,
      difficulty: this.mapDifficulty(detail.difficulty),
      description: this.parseContent(content),
      examples,
      constraints,
      tags: this.mapTags(detail.topicTags || []),
      testCases,
      codeTemplates: this.generateCodeTemplates(detail.codeSnippets || [], detail.title),
      hints: detail.hints || [],
      stats: {
        totalSubmissions: 0,
        acceptedSubmissions: 0,
        acceptanceRate: parseFloat(leetcodeProblem.acRate) || 0
      },
      order: parseInt(detail.questionFrontendId) || 0
    };
  }
}

async function fetchAndSaveProblems(limit = 20) {
  try {
    console.log('🔍 Fetching problems from LeetCode...');
    
    const scraper = new LeetCodeScraper();
    const problemList = await scraper.fetchProblemList(limit);
    
    console.log(`📋 Found ${problemList.length} free problems`);

    let savedCount = 0;
    
    for (const leetcodeProblem of problemList) {
      try {
        // Check if problem already exists
        const existingProblem = await Problem.findOne({ slug: leetcodeProblem.titleSlug });
        if (existingProblem) {
          console.log(`⏭️  Skipping ${leetcodeProblem.title} (already exists)`);
          continue;
        }

        console.log(`📥 Processing: ${leetcodeProblem.title}`);
        
        const problemData = await scraper.convertToProblem(leetcodeProblem);
        if (!problemData) {
          console.log(`❌ Failed to convert: ${leetcodeProblem.title}`);
          continue;
        }

        const problem = new Problem(problemData);
        await problem.save();
        
        savedCount++;
        console.log(`✅ Saved: ${problemData.title}`);
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Error processing ${leetcodeProblem.title}:`, error.message);
      }
    }

    console.log(`🎉 Successfully saved ${savedCount} problems!`);
    
  } catch (error) {
    console.error('❌ Error fetching problems:', error);
  }
}

// Export for use in other scripts
module.exports = { LeetCodeScraper, fetchAndSaveProblems };

// Run if called directly
if (require.main === module) {
  const mongoose = require('mongoose');
  
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codemaster')
    .then(() => {
      console.log('📊 Connected to MongoDB');
      return fetchAndSaveProblems(10); // Fetch 10 problems
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