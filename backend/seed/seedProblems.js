import { Problem } from '../models/Problem.js';

export const SEED_PROBLEMS = [
  {
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
      { input: '[[2, 7, 11, 15], 9]', expectedOutput: '[0, 1]', isHidden: false },
      { input: '[[3, 2, 4], 6]', expectedOutput: '[1, 2]', isHidden: false },
      { input: '[[3, 3], 6]', expectedOutput: '[0, 1]', isHidden: true }
    ]
  },
  {
    title: 'Reverse String',
    difficulty: 'Easy',
    topic: 'Strings',
    description: 'Write a function that reverses a string. The input string is given as an array of characters or string.',
    starterCode: `function reverseString(str) {
  // Write your solution here
  return str.split('').reverse().join('');
}`,
    examples: [
      {
        input: 'str = "hello"',
        output: '"olleh"',
        explanation: 'Reversing "hello" results in "olleh".'
      }
    ],
    testCases: [
      { input: '"hello"', expectedOutput: '"olleh"', isHidden: false },
      { input: '"Hannah"', expectedOutput: '"hannaH"', isHidden: false },
      { input: '"a"', expectedOutput: '"a"', isHidden: true }
    ]
  },
  {
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
      { input: '"A man, a plan, a canal: Panama"', expectedOutput: 'true', isHidden: false },
      { input: '"race a car"', expectedOutput: 'false', isHidden: false },
      { input: '" "', expectedOutput: 'true', isHidden: true }
    ]
  },
  {
    title: 'Find Maximum in Array',
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
      { input: '[[1, 5, 3, 9, 2]]', expectedOutput: '9', isHidden: false },
      { input: '[[-10, -5, -20]]', expectedOutput: '-5', isHidden: false },
      { input: '[[100]]', expectedOutput: '100', isHidden: true }
    ]
  },
  {
    title: 'Contains Duplicate',
    difficulty: 'Easy',
    topic: 'Arrays',
    description: 'Given an integer array `nums`, return `true` if any value appears at least twice in the array, and return `false` if every element is distinct.',
    starterCode: `function containsDuplicate(nums) {
  // Write your solution here
  const seen = new Set();
  for (const num of nums) {
    if (seen.has(num)) return true;
    seen.add(num);
  }
  return false;
}`,
    examples: [
      {
        input: 'nums = [1, 2, 3, 1]',
        output: 'true',
        explanation: 'The element 1 appears twice at index 0 and index 3.'
      }
    ],
    testCases: [
      { input: '[[1, 2, 3, 1]]', expectedOutput: 'true', isHidden: false },
      { input: '[[1, 2, 3, 4]]', expectedOutput: 'false', isHidden: false },
      { input: '[[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]]', expectedOutput: 'true', isHidden: true }
    ]
  }
];

/**
 * Seeds MongoDB with the 5 default sample problems if collection is empty
 */
export const seedDatabase = async () => {
  try {
    const count = await Problem.countDocuments();
    if (count === 0) {
      console.log('[Seed] Seeding 5 initial coding problems into MongoDB...');
      await Problem.insertMany(SEED_PROBLEMS);
      console.log('[Seed] Successfully seeded 5 problems.');
    } else {
      console.log(`[Seed] Database already contains ${count} problems. Skipping seed.`);
    }
  } catch (error) {
    console.warn(`[Seed Warning] Could not seed database: ${error.message}`);
  }
};
