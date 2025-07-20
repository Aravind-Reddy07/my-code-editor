const express = require('express');
const { auth } = require('../middleware/auth');
const { executeCode } = require('../services/codeExecution');

const router = express.Router();

// @route   POST /api/execute/run
// @desc    Execute code with custom input
// @access  Private
router.post('/run', auth, async (req, res) => {
  try {
    const { code, language, input } = req.body;

    if (!code || !language) {
      return res.status(400).json({ message: 'Code and language are required' });
    }

    // Create a simple test case from the input
    const testCase = {
      input: input || '',
      expectedOutput: '', // We don't check output for custom runs
      isCustomRun: true
    };

    const result = await executeCode(code, language, [testCase]);

    res.json({
      output: result.testCaseResults[0]?.actualOutput || '',
      error: result.errorMessage,
      runtime: result.runtime,
      memory: result.memory,
      status: result.status
    });

  } catch (error) {
    console.error('Code execution error:', error);
    res.status(500).json({ 
      message: 'Execution failed',
      error: error.message 
    });
  }
});

module.exports = router;