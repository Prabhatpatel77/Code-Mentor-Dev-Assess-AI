import vm from 'node:vm';

/**
 * Parses test case input into JavaScript values
 */
const parseInput = (rawInput) => {
  if (typeof rawInput !== 'string') return rawInput;
  try {
    return JSON.parse(rawInput);
  } catch (e) {
    return rawInput;
  }
};

/**
 * Parses expected output into JavaScript values or normalized JSON string
 */
const parseExpectedOutput = (rawOutput) => {
  if (typeof rawOutput !== 'string') return rawOutput;
  try {
    return JSON.parse(rawOutput);
  } catch (e) {
    return rawOutput;
  }
};

/**
 * Safely executes JavaScript user submission against test cases.
 * @param {string} userCode - JavaScript code submitted by learner
 * @param {Array} testCases - Array of test cases [{ input, expectedOutput }]
 * @returns {Object} Execution summary with status, passed, total, and results
 */
export const executeJavaScript = (userCode, testCases = []) => {
  const startTime = Date.now();
  const testResults = [];
  let passedCount = 0;

  if (!userCode || !userCode.trim()) {
    return {
      success: false,
      status: 'Runtime Error',
      passed: 0,
      total: testCases.length,
      executionTimeMs: 0,
      error: 'Empty code submitted. Please write a JavaScript function.',
      results: []
    };
  }

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    const parsedInput = parseInput(testCase.input);
    const parsedExpected = parseExpectedOutput(testCase.expectedOutput);

    // Isolated sandbox context with no access to process, env, require, or db
    const sandbox = Object.create(null);
    sandbox.console = { log: () => {}, error: () => {} };
    sandbox.result = undefined;
    sandbox.error = undefined;

    const context = vm.createContext(sandbox);

    const serializedInput = JSON.stringify(parsedInput);
    const executionScript = `
      try {
        ${userCode}
        
        let fn = typeof solution === 'function' ? solution : null;
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
          if (Array.isArray(inputVal) && fn.length > 1) {
            result = fn(...inputVal);
          } else {
            result = fn(inputVal);
          }
        } else {
          error = "No function found. Please define a function (e.g. 'function solution(input) { ... }').";
        }
      } catch (e) {
        error = e.message;
      }
    `;

    try {
      const script = new vm.Script(executionScript);
      // Timeout limit of 2000 ms per test case to prevent infinite loops
      script.runInContext(context, { timeout: 2000 });

      if (sandbox.error) {
        testResults.push({
          passed: false,
          input: parsedInput,
          expected: parsedExpected,
          actual: null,
          error: sandbox.error
        });
        continue;
      }

      const actualOutput = sandbox.result;
      const expectedOutput = parsedExpected;

      // Deep JSON comparison
      const isPassed = JSON.stringify(actualOutput) === JSON.stringify(expectedOutput);

      if (isPassed) {
        passedCount++;
      }

      testResults.push({
        passed: isPassed,
        input: parsedInput,
        expected: expectedOutput,
        actual: actualOutput !== undefined ? actualOutput : null,
        error: null
      });

    } catch (vmErr) {
      // Handles infinite loop timeouts or severe vm execution errors
      const errorMsg = vmErr.message.includes('timed out') 
        ? 'Time Limit Exceeded (Infinite Loop or slow execution)' 
        : vmErr.message;

      testResults.push({
        passed: false,
        input: parsedInput,
        expected: parsedExpected,
        actual: null,
        error: errorMsg
      });
    }
  }

  const totalTimeMs = Date.now() - startTime;
  const isAllPassed = testCases.length > 0 && passedCount === testCases.length;

  let overallStatus = 'Wrong Answer';
  if (isAllPassed) {
    overallStatus = 'Accepted';
  } else if (testResults.some(r => r.error)) {
    overallStatus = 'Runtime Error';
  }

  return {
    success: true,
    status: overallStatus,
    passed: passedCount,
    total: testCases.length,
    executionTimeMs: totalTimeMs,
    results: testResults
  };
};
