import { Problem } from '../models/Problem.js';

// Predefined seed problems for immediate execution & testing
export const INITIAL_PROBLEMS = [
  {
    _id: 'p1_two_sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    topic: 'Arrays',
    description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution.',
    starterCode: `function twoSum(nums, target) {
  // Write your solution here
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) {
        return [i, j];
      }
    }
  }
  return [];
}`,
    examples: [
      {
        input: 'nums = [2, 7, 11, 15], target = 9',
        output: '[0, 1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      }
    ],
    testCases: [
      { input: [[2, 7, 11, 15], 9], expectedOutput: [0, 1] },
      { input: [[3, 2, 4], 6], expectedOutput: [1, 2] },
      { input: [[3, 3], 6], expectedOutput: [0, 1] }
    ]
  },
  {
    _id: 'p2_valid_palindrome',
    title: 'Valid Palindrome',
    difficulty: 'Easy',
    topic: 'Strings',
    description: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.',
    starterCode: `function isPalindrome(s) {
  // Write your solution here
  const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleaned === cleaned.split('').reverse().join('');
}`,
    examples: [
      {
        input: 's = "A man, a plan, a canal: Panama"',
        output: 'true',
        explanation: '"amanaplanacanalpanama" is a palindrome.'
      }
    ],
    testCases: [
      { input: 'A man, a plan, a canal: Panama', expectedOutput: true },
      { input: 'race a car', expectedOutput: false },
      { input: ' ', expectedOutput: true }
    ]
  },
  {
    _id: 'p3_find_max',
    title: 'Find Maximum Element',
    difficulty: 'Easy',
    topic: 'Arrays',
    description: 'Given an array of numbers `nums`, return the maximum number in the array.',
    starterCode: `function findMax(nums) {
  // Write your solution here
  return Math.max(...nums);
}`,
    examples: [
      {
        input: 'nums = [1, 5, 3, 9, 2]',
        output: '9',
        explanation: 'The largest element in the array is 9.'
      }
    ],
    testCases: [
      { input: [[1, 5, 3, 9, 2]], expectedOutput: 9 },
      { input: [[-10, -5, -20]], expectedOutput: -5 }
    ]
  }
];

export const getProblems = async (req, res, next) => {
  try {
    let problems = [];
    try {
      problems = await Problem.find({});
    } catch (e) {
      // DB offline fallback
    }

    if (!problems || problems.length === 0) {
      problems = INITIAL_PROBLEMS;
    }

    res.status(200).json({
      success: true,
      count: problems.length,
      data: problems
    });
  } catch (error) {
    next(error);
  }
};

export const getProblemById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let problem = null;

    try {
      problem = await Problem.findById(id);
    } catch (e) {
      // DB error or non-ObjectId string ID
    }

    if (!problem) {
      problem = INITIAL_PROBLEMS.find(p => p._id === id || p.title.toLowerCase().replace(/\s+/g, '_') === id);
    }

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: `Problem with ID '${id}' not found`
      });
    }

    res.status(200).json({
      success: true,
      data: problem
    });
  } catch (error) {
    next(error);
  }
};
