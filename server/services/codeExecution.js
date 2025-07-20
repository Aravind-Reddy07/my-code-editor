const { VM } = require('vm2');
const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class CodeExecutor {
  constructor() {
    this.timeout = 5000; // 5 seconds
    this.memoryLimit = 128 * 1024 * 1024; // 128MB
  }

  async executeCode(code, language, testCases) {
    try {
      const results = {
        status: 'Accepted',
        executionTime: 0,
        memoryUsed: 0,
        testResults: [],
        error: null
      };

      const allTestCases = [
        ...(testCases.visible || []),
        ...(testCases.hidden || [])
      ];

      if (allTestCases.length === 0) {
        throw new Error('No test cases provided');
      }

      let totalExecutionTime = 0;
      let maxMemoryUsed = 0;

      for (let i = 0; i < allTestCases.length; i++) {
        const testCase = allTestCases[i];
        const startTime = Date.now();

        try {
          let result;
          
          switch (language) {
            case 'javascript':
            case 'typescript':
              result = await this.executeJavaScript(code, testCase.input);
              break;
            case 'python':
              result = await this.executePython(code, testCase.input);
              break;
            default:
              throw new Error(`Unsupported language: ${language}`);
          }

          const executionTime = Date.now() - startTime;
          totalExecutionTime += executionTime;

          const testResult = {
            testCaseIndex: i,
            passed: this.compareOutputs(result.output, testCase.expectedOutput),
            input: testCase.input,
            expected: testCase.expectedOutput,
            actual: result.output,
            executionTime,
            error: result.error
          };

          results.testResults.push(testResult);

          if (!testResult.passed && !testResult.error) {
            results.status = 'Wrong Answer';
          }

          if (result.memoryUsed) {
            maxMemoryUsed = Math.max(maxMemoryUsed, result.memoryUsed);
          }

        } catch (error) {
          const testResult = {
            testCaseIndex: i,
            passed: false,
            input: testCase.input,
            expected: testCase.expectedOutput,
            actual: null,
            executionTime: Date.now() - startTime,
            error: error.message
          };

          results.testResults.push(testResult);

          if (error.message.includes('timeout')) {
            results.status = 'Time Limit Exceeded';
          } else if (error.message.includes('memory')) {
            results.status = 'Memory Limit Exceeded';
          } else {
            results.status = 'Runtime Error';
          }
          
          results.error = {
            message: error.message,
            stack: error.stack
          };
        }
      }

      results.executionTime = totalExecutionTime;
      results.memoryUsed = maxMemoryUsed;

      // If any test failed, overall status should reflect that
      const hasFailures = results.testResults.some(test => !test.passed);
      if (hasFailures && results.status === 'Accepted') {
        results.status = 'Wrong Answer';
      }

      return results;

    } catch (error) {
      return {
        status: 'Internal Error',
        executionTime: 0,
        memoryUsed: 0,
        testResults: [],
        error: {
          message: error.message,
          stack: error.stack
        }
      };
    }
  }

  async executeJavaScript(code, input) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Time limit exceeded'));
      }, this.timeout);

      try {
        const vm = new VM({
          timeout: this.timeout,
          sandbox: {
            input: input,
            console: {
              log: () => {}, // Disable console.log
              error: () => {}
            }
          }
        });

        // Wrap the user code to capture the result
        const wrappedCode = `
          ${code}
          
          // Try to find and execute the main function
          let result;
          if (typeof solution === 'function') {
            result = solution(input);
          } else if (typeof solve === 'function') {
            result = solve(input);
          } else if (typeof main === 'function') {
            result = main(input);
          } else {
            // Try to execute the code directly with input
            result = eval('(' + \`${code}\` + ')(input)');
          }
          result;
        `;

        const output = vm.run(wrappedCode);
        
        clearTimeout(timeout);
        resolve({
          output: output,
          error: null,
          memoryUsed: 0 // VM2 doesn't provide memory usage
        });

      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  async executePython(code, input) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Time limit exceeded'));
      }, this.timeout);

      // Create a temporary file for the Python code
      const tempFile = path.join('/tmp', `code_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.py`);
      
      // Wrap the user code to handle input and output
      const wrappedCode = `
import sys
import json
import traceback

try:
    # User code
${code.split('\n').map(line => '    ' + line).join('\n')}
    
    # Input handling
    input_data = ${JSON.stringify(input)}
    
    # Try to find and execute the main function
    result = None
    if 'solution' in locals():
        result = solution(input_data)
    elif 'solve' in locals():
        result = solve(input_data)
    elif 'main' in locals():
        result = main(input_data)
    else:
        # If no main function found, try to execute with input
        result = eval(f"({code})")({input_data})
    
    print(json.dumps(result))
    
except Exception as e:
    print(f"ERROR: {str(e)}", file=sys.stderr)
    traceback.print_exc(file=sys.stderr)
    sys.exit(1)
`;

      // Write code to temporary file
      fs.writeFile(tempFile, wrappedCode)
        .then(() => {
          const python = spawn('python3', [tempFile], {
            timeout: this.timeout,
            stdio: ['pipe', 'pipe', 'pipe']
          });

          let stdout = '';
          let stderr = '';

          python.stdout.on('data', (data) => {
            stdout += data.toString();
          });

          python.stderr.on('data', (data) => {
            stderr += data.toString();
          });

          python.on('close', async (code) => {
            clearTimeout(timeout);
            
            // Clean up temporary file
            try {
              await fs.unlink(tempFile);
            } catch (e) {
              // Ignore cleanup errors
            }

            if (code === 0) {
              try {
                const output = JSON.parse(stdout.trim());
                resolve({
                  output: output,
                  error: null,
                  memoryUsed: 0
                });
              } catch (e) {
                resolve({
                  output: stdout.trim(),
                  error: null,
                  memoryUsed: 0
                });
              }
            } else {
              reject(new Error(stderr || 'Python execution failed'));
            }
          });

          python.on('error', (error) => {
            clearTimeout(timeout);
            reject(error);
          });
        })
        .catch(reject);
    });
  }

  compareOutputs(actual, expected) {
    // Handle different types of outputs
    if (actual === expected) return true;
    
    // Convert to strings and compare
    const actualStr = JSON.stringify(actual);
    const expectedStr = JSON.stringify(expected);
    
    if (actualStr === expectedStr) return true;
    
    // Handle floating point comparisons
    if (typeof actual === 'number' && typeof expected === 'number') {
      return Math.abs(actual - expected) < 1e-9;
    }
    
    // Handle arrays
    if (Array.isArray(actual) && Array.isArray(expected)) {
      if (actual.length !== expected.length) return false;
      return actual.every((val, index) => this.compareOutputs(val, expected[index]));
    }
    
    return false;
  }
}

const executor = new CodeExecutor();

module.exports = {
  executeCode: (code, language, testCases) => executor.executeCode(code, language, testCases)
};