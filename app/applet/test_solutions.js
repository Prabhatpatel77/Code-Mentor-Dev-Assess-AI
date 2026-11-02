import mongoose from 'mongoose';
import { requestCompleteSolution } from './backend/controllers/aiController.js';
import { SEED_PROBLEMS } from './backend/seed/seedProblems.js';
import { memoryHintUsages } from './backend/controllers/aiController.js';

async function runTests() {
  console.log("=== RUNNING COMPLETE SOLUTION GENERATOR VERIFICATION TESTS ===");
  
  const testResultsReport = [];

  for (const seedProb of SEED_PROBLEMS) {
    const probId = seedProb.title.toLowerCase().replace(/\s+/g, '_');
    
    // Seed hint usage level 4 so authorization passes
    memoryHintUsages.push({
      userId: 'test_user',
      problemId: probId,
      hintLevel: 4,
      isSolutionReveal: true
    });

    const mockReq = {
      body: {
        problemId: probId,
        userId: 'test_user'
      }
    };

    let responseData = null;
    let responseStatus = 200;
    const mockRes = {
      status: (code) => {
        responseStatus = code;
        return {
          json: (data) => {
            responseData = data;
          }
        };
      }
    };

    try {
      await requestCompleteSolution(mockReq, mockRes, (err) => {
        if (err) throw err;
      });

      const hasCode = responseData && responseData.solution && typeof responseData.solution.code === 'string' && responseData.solution.code.trim().length > 0;
      const validationPassed = responseData && responseData.validation && responseData.validation.validationPassed;
      const passedCount = responseData && responseData.validation ? responseData.validation.passed : 0;
      const totalCount = responseData && responseData.validation ? responseData.validation.total : 0;

      const isPass = hasCode && validationPassed;
      testResultsReport.push({
        test: `${seedProb.title} Generation & Validation`,
        expected: `Complete working solution, All ${totalCount} tests pass`,
        actual: isPass ? `PASS (Passed ${passedCount}/${totalCount} tests)` : `FAIL (Passed ${passedCount}/${totalCount} tests)`
      });
    } catch (e) {
      testResultsReport.push({
        test: `${seedProb.title} Generation & Validation`,
        expected: "Complete working solution, All tests pass",
        actual: `FAIL with error: ${e.message}`
      });
    }
  }

  console.table(testResultsReport);
}

runTests();
