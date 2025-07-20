const { VM } = require('vm2');
const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Timeout for code execution (5 seconds)
const EXECUTION_TIMEOUT = 5000;

// Memory limit (128MB)
const MEMORY_LIMIT = 128 * 1024 * 1024;

class CodeExecutor {
  async executeJavaScript(code, testCases) {
    const results = [];
    let totalRuntime = 0;
    let maxMemory = 0;

    for (const testCase of testCases) {
      try {
        const startTime = Date.now();
        const startMemory = process.memoryUsage().heapUsed;

        // Create a secure VM
        const vm = new VM({
          timeout: EXECUTION_TIMEOUT,
          sandbox: {
            console: {
              log: () => {}, // Disable console.log
              error: () => {}
            }
          }
        });

        // Prepare the code with test input
        const wrappedCode = `
          ${code}
          
          // Parse input
          const parseInput = (input) => {
            try {
              // Handle different input formats
              if (input.includes('nums = ') && input.includes('target = ')) {
                const numsMatch = input.match(/nums = \\[([^\\]]+)\\]/);
                const targetMatch = input.match(/target = (\\d+)/);
                
                if (numsMatch && targetMatch) {
                  const nums = numsMatch[1].split(',').map(n => parseInt(n.trim()));
                  const target = parseInt(targetMatch[1]);
                  return { nums, target };
                }
              }
              
              // Try to parse as JSON
              return JSON.parse(input);
            } catch (e) {
              return input;
            }
          };
          
          const input = parseInput('${testCase.input.replace(/'/g, "\\'")}');
          
          // Execute the main function
          let result;
          if (typeof twoSum === 'function' && input.nums && input.target !== undefined) {
            result = twoSum(input.nums, input.target);
          } else if (typeof solution === 'function') {
            result = solution(input);
          } else {
            throw new Error('No valid function found');
          }
          
          JSON.stringify(result);
        `;

        const output = vm.run(wrappedCode);
        const endTime = Date.now();
        const endMemory = process.memoryUsage().heapUsed;

        const runtime = endTime - startTime;
        const memory = Math.max(0, endMemory - startMemory);

        totalRuntime += runtime;
        maxMemory = Math.max(maxMemory, memory);

        // Compare output with expected (if not a custom run)
        const passed = testCase.isCustomRun || output === testCase.expectedOutput;

        results.push({
          testCaseId: testCase.id || uuidv4(),
          status: passed ? 'passed' : 'failed',
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: output,
          runtime,
          memory: Math.round(memory / 1024) // Convert to KB
        });

      } catch (error) {
        results.push({
          testCaseId: testCase.id || uuidv4(),
          status: 'error',
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: '',
          runtime: 0,
          memory: 0,
          errorMessage: error.message
        });
      }
    }

    const passedTests = results.filter(r => r.status === 'passed').length;
    const hasErrors = results.some(r => r.status === 'error');
    
    let status = 'Accepted';
    if (hasErrors) {
      status = 'Runtime Error';
    } else if (passedTests < testCases.length) {
      status = 'Wrong Answer';
    }

    return {
      status,
      runtime: Math.round(totalRuntime / testCases.length),
      memory: Math.round(maxMemory / 1024), // Convert to KB
      testCaseResults: results,
      passedTestCases: passedTests,
      totalTestCases: testCases.length,
      errorMessage: hasErrors ? results.find(r => r.errorMessage)?.errorMessage : null
    };
  }

  async executePython(code, testCases) {
    // For Python execution, we would need to set up a secure Python environment
    // This is a simplified version - in production, use Docker containers
    
    const results = [];
    
    for (const testCase of testCases) {
      try {
        // Create temporary Python file
        const tempFile = path.join('/tmp', `${uuidv4()}.py`);
        
        const pythonCode = `
import json
import sys
from typing import List

${code}

def parse_input(input_str):
    try:
        if 'nums = ' in input_str and 'target = ' in input_str:
            import re
            nums_match = re.search(r'nums = \\[([^\\]]+)\\]', input_str)
            target_match = re.search(r'target = (\\d+)', input_str)
            
            if nums_match and target_match:
                nums = [int(x.strip()) for x in nums_match.group(1).split(',')]
                target = int(target_match.group(1))
                return {'nums': nums, 'target': target}
        
        return json.loads(input_str)
    except:
        return input_str

input_data = parse_input('${testCase.input.replace(/'/g, "\\'")}')

# Execute the solution
solution = Solution()
if hasattr(solution, 'twoSum') and isinstance(input_data, dict) and 'nums' in input_data:
    result = solution.twoSum(input_data['nums'], input_data['target'])
else:
    result = solution.solve(input_data)

print(json.dumps(result))
`;

        await fs.writeFile(tempFile, pythonCode);

        // Execute Python code
        const result = await this.runCommand('python3', [tempFile], EXECUTION_TIMEOUT);
        
        // Clean up
        await fs.unlink(tempFile).catch(() => {});

        const passed = testCase.isCustomRun || result.stdout.trim() === testCase.expectedOutput;

        results.push({
          testCaseId: testCase.id || uuidv4(),
          status: result.error ? 'error' : (passed ? 'passed' : 'failed'),
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: result.stdout.trim(),
          runtime: result.runtime,
          memory: result.memory,
          errorMessage: result.error
        });

      } catch (error) {
        results.push({
          testCaseId: testCase.id || uuidv4(),
          status: 'error',
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: '',
          runtime: 0,
          memory: 0,
          errorMessage: error.message
        });
      }
    }

    const passedTests = results.filter(r => r.status === 'passed').length;
    const hasErrors = results.some(r => r.status === 'error');
    
    let status = 'Accepted';
    if (hasErrors) {
      status = 'Runtime Error';
    } else if (passedTests < testCases.length) {
      status = 'Wrong Answer';
    }

    return {
      status,
      runtime: Math.round(results.reduce((sum, r) => sum + r.runtime, 0) / results.length),
      memory: Math.max(...results.map(r => r.memory)),
      testCaseResults: results,
      passedTestCases: passedTests,
      totalTestCases: testCases.length,
      errorMessage: hasErrors ? results.find(r => r.errorMessage)?.errorMessage : null
    };
  }

  async runCommand(command, args, timeout) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const child = spawn(command, args);
      
      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      const timer = setTimeout(() => {
        child.kill('SIGKILL');
        reject(new Error('Time Limit Exceeded'));
      }, timeout);
      
      child.on('close', (code) => {
        clearTimeout(timer);
        const runtime = Date.now() - startTime;
        
        resolve({
          stdout,
          stderr,
          code,
          runtime,
          memory: 0, // Would need to implement memory tracking
          error: code !== 0 ? stderr : null
        });
      });
      
      child.on('error', (error) => {
        clearTimeout(timer);
        reject(error);
      });
    });
  }
}

const executor = new CodeExecutor();

async function executeCode(code, language, testCases) {
  try {
    switch (language) {
      case 'javascript':
      case 'typescript':
        return await executor.executeJavaScript(code, testCases);
      case 'python':
        return await executor.executePython(code, testCases);
      default:
        throw new Error(`Language ${language} not supported`);
    }
  } catch (error) {
    return {
      status: 'Runtime Error',
      runtime: 0,
      memory: 0,
      testCaseResults: [],
      passedTestCases: 0,
      totalTestCases: testCases.length,
      errorMessage: error.message
    };
  }
}

module.exports = { executeCode };