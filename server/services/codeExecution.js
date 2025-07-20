const { VM } = require('vm2');
const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Timeout for code execution
const EXECUTION_TIMEOUT = parseInt(process.env.CODE_EXECUTION_TIMEOUT) || 5000;
const MAX_MEMORY_MB = parseInt(process.env.MAX_MEMORY_MB) || 128;
const MEMORY_LIMIT = MAX_MEMORY_MB * 1024 * 1024;

class CodeExecutor {
  constructor() {
    this.tempDir = path.join(__dirname, '../temp');
    this.ensureTempDir();
  }

  async ensureTempDir() {
    try {
      await fs.access(this.tempDir);
    } catch {
      await fs.mkdir(this.tempDir, { recursive: true });
    }
  }

  async executeJavaScript(code, testCases) {
    const results = [];
    let totalRuntime = 0;
    let maxMemory = 0;

    for (const testCase of testCases) {
      try {
        const startTime = Date.now();
        const startMemory = process.memoryUsage().heapUsed;

        // Create a secure VM with timeout
        const vm = new VM({
          timeout: EXECUTION_TIMEOUT,
          sandbox: {
            console: {
              log: () => {}, // Disable console.log for security
              error: () => {}
            },
            setTimeout: undefined,
            setInterval: undefined,
            require: undefined,
            process: undefined,
            global: undefined
          }
        });

        // Prepare the code with test input
        const wrappedCode = this.wrapJavaScriptCode(code, testCase);
        const output = vm.run(wrappedCode);
        
        const endTime = Date.now();
        const endMemory = process.memoryUsage().heapUsed;

        const runtime = endTime - startTime;
        const memory = Math.max(0, endMemory - startMemory);

        totalRuntime += runtime;
        maxMemory = Math.max(maxMemory, memory);

        // Compare output with expected (if not a custom run)
        const passed = testCase.isCustomRun || this.compareOutputs(output, testCase.expectedOutput);

        results.push({
          testCaseId: testCase.id || uuidv4(),
          status: passed ? 'passed' : 'failed',
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: output,
          runtime,
          memory: Math.round(memory / 1024), // Convert to KB
          isHidden: testCase.isHidden || false
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
          errorMessage: this.sanitizeError(error.message),
          isHidden: testCase.isHidden || false
        });
      }
    }

    return this.formatExecutionResult(results, totalRuntime, maxMemory, testCases.length);
  }

  async executePython(code, testCases) {
    const results = [];
    let totalRuntime = 0;
    let maxMemory = 0;

    for (const testCase of testCases) {
      try {
        const tempFile = path.join(this.tempDir, `${uuidv4()}.py`);
        const pythonCode = this.wrapPythonCode(code, testCase);
        
        await fs.writeFile(tempFile, pythonCode);

        const startTime = Date.now();
        const result = await this.runCommand('python3', [tempFile], EXECUTION_TIMEOUT);
        const endTime = Date.now();

        // Clean up
        await fs.unlink(tempFile).catch(() => {});

        const runtime = endTime - startTime;
        totalRuntime += runtime;
        maxMemory = Math.max(maxMemory, result.memory || 0);

        const passed = testCase.isCustomRun || this.compareOutputs(result.stdout.trim(), testCase.expectedOutput);

        results.push({
          testCaseId: testCase.id || uuidv4(),
          status: result.error ? 'error' : (passed ? 'passed' : 'failed'),
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: result.stdout.trim(),
          runtime,
          memory: Math.round((result.memory || 0) / 1024),
          errorMessage: result.error ? this.sanitizeError(result.stderr) : null,
          isHidden: testCase.isHidden || false
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
          errorMessage: this.sanitizeError(error.message),
          isHidden: testCase.isHidden || false
        });
      }
    }

    return this.formatExecutionResult(results, totalRuntime, maxMemory, testCases.length);
  }

  wrapJavaScriptCode(code, testCase) {
    return `
      ${code}
      
      // Parse input function
      const parseInput = (input) => {
        try {
          // Handle array and target format: nums = [2,7,11,15], target = 9
          if (input.includes('nums = ') && input.includes('target = ')) {
            const numsMatch = input.match(/nums = \\[([^\\]]+)\\]/);
            const targetMatch = input.match(/target = (-?\\d+)/);
            
            if (numsMatch && targetMatch) {
              const nums = numsMatch[1].split(',').map(n => parseInt(n.trim()));
              const target = parseInt(targetMatch[1]);
              return { nums, target };
            }
          }
          
          // Handle simple array format: [2,7,11,15]
          if (input.startsWith('[') && input.endsWith(']')) {
            return JSON.parse(input);
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
      } else if (typeof solve === 'function') {
        result = solve(input);
      } else {
        throw new Error('No valid function found (expected: twoSum, solution, or solve)');
      }
      
      JSON.stringify(result);
    `;
  }

  wrapPythonCode(code, testCase) {
    return `
import json
import sys
from typing import List, Optional

${code}

def parse_input(input_str):
    try:
        # Handle array and target format
        if 'nums = ' in input_str and 'target = ' in input_str:
            import re
            nums_match = re.search(r'nums = \\[([^\\]]+)\\]', input_str)
            target_match = re.search(r'target = (-?\\d+)', input_str)
            
            if nums_match and target_match:
                nums = [int(x.strip()) for x in nums_match.group(1).split(',')]
                target = int(target_match.group(1))
                return {'nums': nums, 'target': target}
        
        # Handle simple array format
        if input_str.startswith('[') and input_str.endswith(']'):
            return json.loads(input_str)
        
        return json.loads(input_str)
    except:
        return input_str

input_data = parse_input('${testCase.input.replace(/'/g, "\\'")}')

# Execute the solution
try:
    if 'Solution' in globals():
        solution = Solution()
        if hasattr(solution, 'twoSum') and isinstance(input_data, dict) and 'nums' in input_data:
            result = solution.twoSum(input_data['nums'], input_data['target'])
        elif hasattr(solution, 'solve'):
            result = solution.solve(input_data)
        else:
            # Try to find any method that's not __init__
            methods = [method for method in dir(solution) if not method.startswith('_')]
            if methods:
                method = getattr(solution, methods[0])
                if isinstance(input_data, dict) and 'nums' in input_data and 'target' in input_data:
                    result = method(input_data['nums'], input_data['target'])
                else:
                    result = method(input_data)
            else:
                raise Exception('No valid method found in Solution class')
    else:
        raise Exception('Solution class not found')
    
    print(json.dumps(result))
except Exception as e:
    print(f"Error: {str(e)}", file=sys.stderr)
    sys.exit(1)
`;
  }

  async runCommand(command, args, timeout) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const child = spawn(command, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: timeout
      });
      
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
          error: code !== 0 ? stderr || 'Runtime Error' : null
        });
      });
      
      child.on('error', (error) => {
        clearTimeout(timer);
        reject(error);
      });
    });
  }

  compareOutputs(actual, expected) {
    // Normalize outputs for comparison
    const normalizeOutput = (output) => {
      if (typeof output === 'string') {
        return output.trim().replace(/\s+/g, ' ');
      }
      return JSON.stringify(output);
    };

    return normalizeOutput(actual) === normalizeOutput(expected);
  }

  sanitizeError(error) {
    // Remove sensitive information from error messages
    return error
      .replace(/\/.*?\/temp\/.*?\.py/g, 'solution.py')
      .replace(/\/.*?\/temp\/.*?\.js/g, 'solution.js')
      .substring(0, 500); // Limit error message length
  }

  formatExecutionResult(results, totalRuntime, maxMemory, totalTestCases) {
    const passedTests = results.filter(r => r.status === 'passed').length;
    const hasErrors = results.some(r => r.status === 'error');
    
    let status = 'Accepted';
    if (hasErrors) {
      status = 'Runtime Error';
    } else if (passedTests < totalTestCases) {
      status = 'Wrong Answer';
    }

    return {
      status,
      runtime: Math.round(totalRuntime / totalTestCases),
      memory: Math.round(maxMemory / 1024), // Convert to KB
      testCaseResults: results,
      passedTestCases: passedTests,
      totalTestCases,
      errorMessage: hasErrors ? results.find(r => r.errorMessage)?.errorMessage : null
    };
  }
}

const executor = new CodeExecutor();

async function executeCode(code, language, testCases) {
  try {
    switch (language.toLowerCase()) {
      case 'javascript':
      case 'typescript':
        return await executor.executeJavaScript(code, testCases);
      case 'python':
        return await executor.executePython(code, testCases);
      default:
        throw new Error(`Language ${language} not supported yet`);
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