import vm from 'node:vm';

/**
 * Safely executes JavaScript user submission against test cases.
 * @param {string} userCode - JavaScript code submitted by learner
 * @param {Array} testCases - Array of test cases [{ input, expectedOutput }]
 * @returns {Object} Execution summary with pass/fail status and test results
 */
export const executeJavaScript = (userCode, testCases = []) => {
  const startTime = Date.now();
  const testResults = [];
  let passedCount = 0;

  try {
    for (const testCase of testCases) {
      const sandbox = {
        console: {
          log: () => {},
          error: () => {}
        },
        result: undefined,
        error: undefined
      };

      const context = vm.createContext(sandbox);
      
      // Wrap code to evaluate user function with input
      const serializedInput = JSON.stringify(testCase.input);
      const executionScript = `
        try {
          ${userCode}
          
          // Identify function name or default to solution / first declared function
          let fn = typeof solution === 'function' ? solution : null;
          if (!fn) {
            const matches = "${userCode.replace(/"/g, '\\"')}".match(/function\\s+([a-zA-A0-9_]+)/);
            if (matches && matches[1] && typeof globalThis[matches[1]] === 'function') {
              fn = globalThis[matches[1]];
            }
          }
          
          if (!fn) {
            // Find any function declared in global context
            const keys = Object.keys(globalThis);
            for (const key of keys) {
              if (typeof globalThis[key] === 'function' && key !== 'eval') {
                fn = globalThis[key];
                break;
              }
            }
          }

          if (fn) {
            const inputVal = ${serializedInput};
            result = Array.isArray(inputVal) ? fn(...inputVal) : fn(inputVal);
          } else {
            error = "No executable function found. Define a function like 'function solution(nums) { ... }'";
          }
        } catch (e) {
          error = e.message;
        }
      `;

      const script = new vm.Script(executionScript);
      script.runInContext(context, { timeout: 2000 });

      if (sandbox.error) {
        testResults.push({
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: null,
          passed: false,
          error: sandbox.error
        });
        continue;
      }

      const actualOutput = sandbox.result;
      const expectedOutput = testCase.expectedOutput;
      
      // Strict / JSON comparison for structural outputs like arrays/objects
      const isPassed = JSON.stringify(actualOutput) === JSON.stringify(expectedOutput);
      
      if (isPassed) {
        passedCount++;
      }

      testResults.push({
        input: testCase.input,
        expectedOutput: expectedOutput,
        actualOutput: actualOutput,
        passed: isPassed,
        error: null
      });
    }

    const totalTimeMs = Date.now() - startTime;
    const isAllPassed = testCases.length > 0 && passedCount === testCases.length;

    return {
      success: true,
      status: isAllPassed ? 'Accepted' : 'Wrong Answer',
      testsPassed: passedCount,
      totalTests: testCases.length,
      executionTimeMs: totalTimeMs,
      testResults
    };
  } catch (err) {
    return {
      success: false,
      status: 'Runtime Error',
      testsPassed: 0,
      totalTests: testCases.length,
      executionTimeMs: Date.now() - startTime,
      error: err.message,
      testResults: []
    };
  }
};
