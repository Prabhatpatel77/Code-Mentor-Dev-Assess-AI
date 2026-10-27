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
            # Fallback level-specific hints when GEMINI_API_KEY is not configured
            fallback_hints = {
                1: f"Level 1 (Conceptual): For '{problem_title}', think about how to track or store state as you iterate. Consider what data structure lets you quickly look up values you've already seen.",
                2: f"Level 2 (Approach): To solve '{problem_title}', iterate through the input data while maintaining a lookup structure (like a Map or Set). For each element, check if its corresponding complement or target condition is already stored.",
                3: f"Level 3 (Code Structure):\n1. Initialize a tracking object/Map.\n2. Loop through the input array/string.\n3. Compute the complement/target condition.\n4. If stored, return the result.\n5. Otherwise, record the current element into your Map.",
                4: f"Level 4 (Debugging): Review your code's loop bounds and variable scoping. Ensure you are returning the expected output format and handling empty or edge case inputs properly."
            }
            return fallback_hints.get(hint_level, fallback_hints[1])

        # Call Gemini REST API (v1beta gemini-2.5-flash)
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

llm_service = LLMService()
