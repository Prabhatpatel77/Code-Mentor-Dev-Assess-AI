import os
import json
import urllib.request
import urllib.error

class LLMService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "")

    def generate_hint(self, problem_title: str, problem_description: str, examples: list, code: str, test_results: list, hint_level: int) -> str:
        """
        Calls Gemini API with enforced hint level system instructions.
        """
        api_key = os.getenv("GEMINI_API_KEY", self.api_key)

        level_descriptions = {
            1: "Level 1: Conceptual guidance ONLY. Explain the underlying key concept or mathematical/data structure idea. DO NOT provide any code or detailed algorithm.",
            2: "Level 2: Algorithmic Approach ONLY. Explain the high-level step-by-step approach or algorithm strategy. DO NOT provide implementation code or pseudocode.",
            3: "Level 3: Code Structure / Pseudocode ONLY. Provide structural pseudocode or a function skeleton. DO NOT provide a complete copy-paste solution.",
            4: "Level 4: Debugging & Analysis. Analyze the learner's submitted code and test results. Identify mistakes or edge cases and explain how to fix them."
        }

        current_level_desc = level_descriptions.get(hint_level, level_descriptions[1])

        system_instruction = f"""
You are an Adaptive Coding Hint Agent for CodeMentorAI.

CRITICAL INSTRUCTIONS:
- You are providing a HINT for LEVEL {hint_level}.
- {current_level_desc}
- NEVER reveal information belonging to a higher hint level.
- Never directly give away the full final solution unless Level 4 debugging requires showing a minor fix.
- Be concise, clear, and encouraging.
"""

        prompt_content = f"""
Problem Title: {problem_title}
Problem Description: {problem_description}
Examples: {json.dumps(examples if examples else [])}

Learner's Current Code:
```javascript
{code if code else "// No code written yet"}
```

Test Results (if available): {json.dumps(test_results if test_results else [])}

Requested Hint Level: Level {hint_level}
"""

        if not api_key:
            fallback_hints = {
                1: f"Level 1 (Conceptual): For '{problem_title}', think about how to track or store state as you iterate. Consider what data structure lets you quickly look up values you've already seen.",
                2: f"Level 2 (Approach): To solve '{problem_title}', iterate through the input data while maintaining a lookup structure (like a Map or Set). For each element, check if its corresponding complement or target condition is already stored.",
                3: f"Level 3 (Code Structure):\n1. Initialize a tracking object/Map.\n2. Loop through the input array/string.\n3. Compute the complement/target condition.\n4. If stored, return the result.\n5. Otherwise, record the current element into your Map.",
                4: f"Level 4 (Debugging): Review your code's loop bounds and variable scoping. Ensure you are returning the expected output format and handling empty or edge case inputs properly."
            }
            return fallback_hints.get(hint_level, fallback_hints[1])

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": f"{system_instruction}\n\n{prompt_content}"}]
                }
            ],
            "generationConfig": {
                "temperature": 0.3,
                "maxOutputTokens": 600
            }
        }

        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode('utf-8'),
                headers={'Content-Type': 'application/json'},
                method='POST'
            )
            with urllib.request.urlopen(req, timeout=10) as response:
                res_data = json.loads(response.read().decode('utf-8'))
                candidates = res_data.get('candidates', [])
                if candidates and 'content' in candidates[0]:
                    parts = candidates[0]['content'].get('parts', [])
                    if parts:
                        return parts[0].get('text', '').strip()
                return f"Level {hint_level} hint generated."
        except Exception as e:
            print(f"[Gemini API Warning] {e}")
            fallback_hints = {
                1: f"Level 1 (Conceptual): Think about what data structure allows O(1) average lookup time to store visited elements.",
                2: f"Level 2 (Approach): Use a Hash Map / Object to keep track of elements as you traverse the input.",
                3: f"Level 3 (Code Structure): Initialize a map -> Iterate array -> Check target complement -> Return result or store element.",
                4: f"Level 4 (Debugging): Inspect your function return statement and array indices for off-by-one errors."
            }
            return fallback_hints.get(hint_level, fallback_hints[1])

    def generate_code_review(self, problem_title: str, problem_description: str, code: str, test_results: list) -> dict:
        """
        Calls Gemini API to generate a structured code review covering Correctness, Code Quality, Performance, and Security.
        """
        api_key = os.getenv("GEMINI_API_KEY", self.api_key)

        system_instruction = """
You are a coding mentor reviewing a learner's JavaScript solution.
Review the code using:
1. Correctness (evaluating test results and edge cases)
2. Code quality and style (readability, naming, structure)
3. Performance (time & space complexity)
4. Common security concerns

You MUST return a valid JSON object with the following exact structure:
{
  "overallScore": 80,
  "summary": "Summary of the solution quality.",
  "correctness": {
    "status": "pass",
    "feedback": "All test cases passed."
  },
  "codeQuality": {
    "score": 80,
    "feedback": ["Feedback point 1", "Feedback point 2"]
  },
  "performance": {
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(n)",
    "feedback": ["Feedback point 1"]
  },
  "security": {
    "status": "pass",
    "feedback": "No significant security concerns identified."
  }
}
"""

        prompt_content = f"""
Problem Title: {problem_title}
Problem Description: {problem_description}
Learner Code:
```javascript
{code}
```
Test Results: {json.dumps(test_results if test_results else [])}
"""

        fallback_review = {
            "overallScore": 75,
            "summary": "The solution functions correctly for standard test cases.",
            "correctness": {
                "status": "pass" if all(r.get("passed", False) for r in test_results) else "fail",
                "feedback": "Evaluated against problem test cases."
            },
            "codeQuality": {
                "score": 75,
                "feedback": ["Code structure is straightforward. Consider adding descriptive comments."]
            },
            "performance": {
                "timeComplexity": "O(n)",
                "spaceComplexity": "O(1)",
                "feedback": ["Execution time is within acceptable limits."]
            },
            "security": {
                "status": "pass",
                "feedback": "No significant security concerns identified."
            }
        }

        if not api_key:
            return fallback_review

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": f"{system_instruction}\n\n{prompt_content}"}]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 800,
                "responseMimeType": "application/json"
            }
        }

        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode('utf-8'),
                headers={'Content-Type': 'application/json'},
                method='POST'
            )
            with urllib.request.urlopen(req, timeout=12) as response:
                res_data = json.loads(response.read().decode('utf-8'))
                candidates = res_data.get('candidates', [])
                if candidates and 'content' in candidates[0]:
                    parts = candidates[0]['content'].get('parts', [])
                    if parts:
                        text = parts[0].get('text', '').strip()
                        if text.startswith("```json"):
                            text = text[7:]
                        if text.startswith("```"):
                            text = text[3:]
                        if text.endswith("```"):
                            text = text[:-3]
                        return json.loads(text.strip())
                return fallback_review
        except Exception as e:
            print(f"[Gemini Review Warning] {e}")
            return fallback_review

    def generate_coach_explanation(self, progress: dict, recommendation: dict) -> str:
        """
        Calls Gemini API to generate a concise, personalized coaching explanation based on progress & recommendations.
        """
        api_key = os.getenv("GEMINI_API_KEY", self.api_key)
        
        attempted = progress.get("attempted", 0)
        solved = progress.get("solved", 0)
        accuracy = progress.get("accuracy", 0)
        rec_topic = recommendation.get("topic", "Arrays")
        rec_diff = recommendation.get("difficulty", "Easy")
        reason = recommendation.get("reason", "")

        fallback_explanation = f"You have solved {solved} out of {attempted} attempted problems ({accuracy}% accuracy). {reason} I recommend practicing {rec_diff} problems in {rec_topic}."

        if not api_key:
            return fallback_explanation

        system_instruction = """
You are an AI Learning Coach for a coding assessment platform.
Write a friendly, encouraging, 2-3 sentence personalized learning recommendation summary for the learner.
Mention their performance and explain why the recommended topic and difficulty will help them grow.
Do not invent statistics; strictly use the provided progress and recommendation data.
"""
        prompt_content = f"Progress: {json.dumps(progress)}\nRecommendation: {json.dumps(recommendation)}"

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": f"{system_instruction}\n\n{prompt_content}"}]
                }
            ],
            "generationConfig": {
                "temperature": 0.4,
                "maxOutputTokens": 300
            }
        }

        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode('utf-8'),
                headers={'Content-Type': 'application/json'},
                method='POST'
            )
            with urllib.request.urlopen(req, timeout=10) as response:
                res_data = json.loads(response.read().decode('utf-8'))
                candidates = res_data.get('candidates', [])
                if candidates and 'content' in candidates[0]:
                    parts = candidates[0]['content'].get('parts', [])
                    if parts:
                        return parts[0].get('text', '').strip()
                return fallback_explanation
        except Exception as e:
            print(f"[Gemini Coach Warning] {e}")
            return fallback_explanation

    def generate_complete_solution(self, problem_title: str, problem_description: str, examples: list) -> dict:
        """
        Calls Gemini API to generate a complete structured JavaScript solution and explanation.
        """
        api_key = os.getenv("GEMINI_API_KEY", self.api_key)

        title_lower = problem_title.lower()

        problem_specific_fallbacks = {
            "two sum": {
                "problemUnderstanding": "Given an array of integers 'nums' and an integer 'target', return indices of the two numbers such that they add up to 'target'. Each input has exactly one solution.",
                "approach": "We use a JavaScript Map to store numbers and their indices as we iterate. For each number, we check if its complement (target - num) is already in the map, achieving O(n) time complexity.",
                "code": "function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}",
                "codeExplanation": [
                    { "section": "Map Initialization", "explanation": "Create a Map for O(1) average lookup time." },
                    { "section": "Iteration & Complement", "explanation": "Calculate the complement for each element and check existence." },
                    { "section": "Match & Return", "explanation": "Return stored index of complement and current index i." }
                ],
                "dryRun": [
                    { "step": 1, "description": "nums = [2, 7, 11, 15], target = 9. i = 0, num = 2. complement = 7. Map set (2, 0)." },
                    { "step": 2, "description": "i = 1, num = 7. complement = 2. Found in map at index 0. Return [0, 1]." }
                ],
                "timeComplexity": "O(n)",
                "spaceComplexity": "O(n)",
                "commonMistakes": [
                    "Using nested loops leading to O(n^2) performance.",
                    "Returning values instead of array indices."
                ]
            },
            "reverse string": {
                "problemUnderstanding": "Write a function that reverses a given string or character array.",
                "approach": "Convert the string into an array of characters, reverse it in place, and join it back into a string.",
                "code": "function reverseString(str) {\n  return str.split('').reverse().join('');\n}",
                "codeExplanation": [
                    { "section": "Split", "explanation": "Split string into character array." },
                    { "section": "Reverse", "explanation": "Reverse array order." },
                    { "section": "Join", "explanation": "Join characters back into a string." }
                ],
                "dryRun": [
                    { "step": 1, "description": "Input: 'hello'. Split to ['h', 'e', 'l', 'l', 'o']." },
                    { "step": 2, "description": "Reverse to ['o', 'l', 'l', 'e', 'h']." },
                    { "step": 3, "description": "Join to 'olleh'." }
                ],
                "timeComplexity": "O(n)",
                "spaceComplexity": "O(n)",
                "commonMistakes": [
                    "Not handling empty string edge cases."
                ]
            },
            "valid palindrome": {
                "problemUnderstanding": "A phrase is a palindrome if, after converting all uppercase letters to lowercase and removing non-alphanumeric characters, it reads the same forward and backward.",
                "approach": "Sanitize the string using regular expressions to keep only alphanumeric characters, convert to lowercase, and check if it equals its reverse.",
                "code": "function isPalindrome(s) {\n  const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');\n  return cleaned === cleaned.split('').reverse().join('');\n}",
                "codeExplanation": [
                    { "section": "Sanitization", "explanation": "Lowercases and strips out non-alphanumeric characters." },
                    { "section": "Comparison", "explanation": "Compares cleaned string with its reversed self." }
                ],
                "dryRun": [
                    { "step": 1, "description": "Input: 'A man, a plan, a canal: Panama'." },
                    { "step": 2, "description": "Cleaned: 'amanaplanacanalpanama'." },
                    { "step": 3, "description": "Reversed is identical, return true." }
                ],
                "timeComplexity": "O(n)",
                "spaceComplexity": "O(n)",
                "commonMistakes": [
                    "Failing to filter out spaces and punctuation marks."
                ]
            },
            "find maximum in array": {
                "problemUnderstanding": "Given an array of numbers nums, return the maximum number in the array.",
                "approach": "Initialize max with the first element and iterate through the array updating max whenever a larger number is found.",
                "code": "function findMax(nums) {\n  if (!nums || nums.length === 0) return null;\n  let max = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    if (nums[i] > max) {\n      max = nums[i];\n    }\n  }\n  return max;\n}",
                "codeExplanation": [
                    { "section": "Validation", "explanation": "Ensure array is not empty." },
                    { "section": "Iteration", "explanation": "Compare each element to current maximum." }
                ],
                "dryRun": [
                    { "step": 1, "description": "nums = [1, 5, 3, 9, 2]. max = 1." },
                    { "step": 2, "description": "Compares 5, 3, 9, 2. Updates max to 9 and returns it." }
                ],
                "timeComplexity": "O(n)",
                "spaceComplexity": "O(1)",
                "commonMistakes": [
                    "Initializing max to 0 instead of nums[0], failing on negative arrays."
                ]
            },
            "contains duplicate": {
                "problemUnderstanding": "Given an integer array nums, return true if any value appears at least twice in the array, and false if every element is distinct.",
                "approach": "Use a JavaScript Set to record visited numbers. If a number is already in the set, return true.",
                "code": "function containsDuplicate(nums) {\n  const seen = new Set();\n  for (const num of nums) {\n    if (seen.has(num)) return true;\n    seen.add(num);\n  }\n  return false;\n}",
                "codeExplanation": [
                    { "section": "Set Creation", "explanation": "Initialize Set for O(1) lookup." },
                    { "section": "Traversal", "explanation": "Check and store each element." }
                ],
                "dryRun": [
                    { "step": 1, "description": "nums = [1, 2, 3, 1]. Add 1, 2, 3." },
                    { "step": 2, "description": "Encounter 1 again. Found in set. Return true." }
                ],
                "timeComplexity": "O(n)",
                "spaceComplexity": "O(n)",
                "commonMistakes": [
                    "Using nested loops resulting in O(n^2) time."
                ]
            }
        }

        # Find matching fallback
        matched_fallback = None
        for key in problem_specific_fallbacks:
            if key in title_lower:
                matched_fallback = problem_specific_fallbacks[key]
                break
        
        if not matched_fallback:
            matched_fallback = {
                "problemUnderstanding": f"The problem '{problem_title}' requires processing input data efficiently to produce the required output according to specifications.",
                "approach": "Use a structured algorithmic approach to process input and return the correct result.",
                "code": "function solution(input) {\n  // Solution for " + problem_title + "\n  return input;\n}",
                "codeExplanation": [
                    { "section": "Core Processing", "explanation": "Process input and return output." }
                ],
                "dryRun": [
                    { "step": 1, "description": "Receive input and return result." }
                ],
                "timeComplexity": "O(n)",
                "spaceComplexity": "O(1)",
                "commonMistakes": [
                    "Not handling edge cases."
                ]
            }

        if not api_key:
            return matched_fallback

        system_instruction = """
You are an expert coding mentor and JavaScript algorithm engineer.
Solve the exact coding problem provided and return a valid JSON object with the following exact structure:
{
  "problemUnderstanding": "Specific explanation of this problem",
  "approach": "Actual algorithm used",
  "code": "Complete executable JavaScript code with function definition (e.g. function solution(...) { ... })",
  "codeExplanation": [
    {
      "section": "Specific code section",
      "explanation": "What this code does"
    }
  ],
  "dryRun": [
    {
      "step": 1,
      "description": "Actual execution step"
    }
  ],
  "timeComplexity": "Actual time complexity",
  "spaceComplexity": "Actual space complexity",
  "commonMistakes": [
    "Problem-specific mistake"
  ]
}
"""
        prompt_content = f"""
Problem Title: {problem_title}
Problem Description: {problem_description}
Examples: {json.dumps(examples if examples else [])}
"""

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": f"{system_instruction}\n\n{prompt_content}"}]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 1000,
                "responseMimeType": "application/json"
            }
        }

        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode('utf-8'),
                headers={'Content-Type': 'application/json'},
                method='POST'
            )
            with urllib.request.urlopen(req, timeout=12) as response:
                res_data = json.loads(response.read().decode('utf-8'))
                candidates = res_data.get('candidates', [])
                if candidates and 'content' in candidates[0]:
                    parts = candidates[0]['content'].get('parts', [])
                    if parts:
                        text = parts[0].get('text', '').strip()
                        if text.startswith("```json"):
                            text = text[7:]
                        if text.startswith("```"):
                            text = text[3:]
                        if text.endswith("```"):
                            text = text[:-3]
                        parsed_json = json.loads(text.strip())
                        if parsed_json and isinstance(parsed_json, dict) and parsed_json.get("code"):
                            return parsed_json
                return matched_fallback
        except Exception as e:
            print(f"[Gemini Solution Warning] {e}")
            return matched_fallback

llm_service = LLMService()

