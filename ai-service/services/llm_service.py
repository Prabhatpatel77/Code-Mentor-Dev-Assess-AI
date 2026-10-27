# TODO: Implement Gemini API LLM Service in Prompt 2
import os

class LLMService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "")

    def generate_response(self, prompt: str) -> str:
        """
        [TODO in Prompt 2] Call Gemini API using google-genai SDK.
        """
        return "[Not implemented yet] Gemini API client will be configured in Prompt 2."

llm_service = LLMService()
