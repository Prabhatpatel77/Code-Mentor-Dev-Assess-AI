import os
import sys
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

# Ensure local imports work cleanly
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from agents.hint_agent import process_hint
from agents.review_agent import process_review
from agents.coach_agent import process_coaching

app = FastAPI(
    title="CodeMentorAI - AI Service",
    description="Python FastAPI Code Review, Hint, and Learning Coach Agent Service",
    version="1.0.0"
)

class HintRequestPayload(BaseModel):
    problemId: Optional[str] = None
    problemTitle: Optional[str] = ""
    problemDescription: Optional[str] = ""
    examples: Optional[List[Any]] = []
    code: Optional[str] = ""
    testResults: Optional[List[Any]] = []
    hintLevel: int = 1

class ReviewRequestPayload(BaseModel):
    problemId: Optional[str] = None
    problemTitle: Optional[str] = ""
    problemDescription: Optional[str] = ""
    code: Optional[str] = ""
    testResults: Optional[List[Any]] = []

class CoachRequestPayload(BaseModel):
    progress: Optional[Dict[str, Any]] = {}
    recommendation: Optional[Dict[str, Any]] = {}

class ProcessRequest(BaseModel):
    user_id: str = "default_user"
    problem_id: Optional[str] = None
    code: Optional[str] = None
    request_type: str = "hint"
    hint_level: int = 1
    hints_used: int = 0
    review_result: Optional[Dict[str, Any]] = None
    learner_progress: Optional[Dict[str, Any]] = None

@app.get("/")
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "CodeMentorAI-Python-AIService",
        "version": "1.0.0",
        "gemini_api_configured": bool(os.getenv("GEMINI_API_KEY"))
    }

@app.post("/api/hint")
def generate_adaptive_hint(payload: HintRequestPayload):
    try:
        level = payload.hintLevel
        if level < 1:
            level = 1
        elif level > 4:
            level = 4

        state = {
            "problem_id": payload.problemId,
            "problem_title": payload.problemTitle,
            "problem_description": payload.problemDescription,
            "examples": payload.examples,
            "code": payload.code,
            "test_results": payload.testResults,
            "hint_level": level,
            "hint": ""
        }

        result_state = process_hint(state)

        hint_types = {
            1: "conceptual",
            2: "approach",
            3: "code_structure",
            4: "debugging"
        }

        return {
            "success": True,
            "hintLevel": result_state.get("hint_level", level),
            "hintType": hint_types.get(result_state.get("hint_level", level), "conceptual"),
            "hint": result_state.get("hint", "")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/review")
def generate_code_review(payload: ReviewRequestPayload):
    try:
        state = {
            "problem_id": payload.problemId,
            "problem_title": payload.problemTitle,
            "problem_description": payload.problemDescription,
            "code": payload.code,
            "test_results": payload.testResults,
            "review_result": {}
        }

        result_state = process_review(state)

        return {
            "success": True,
            "review": result_state.get("review_result", {})
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/coach/explain")
def generate_coach_explanation(payload: CoachRequestPayload):
    """
    Learning Coach Agent Explanation Endpoint for Prompt 6.
    """
    try:
        state = {
            "progress": payload.progress or {},
            "recommendation": payload.recommendation or {},
            "explanation": ""
        }

        result_state = process_coaching(state)

        return {
            "success": True,
            "explanation": result_state.get("explanation", "")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/supervisor/process")
def process_agent_request(payload: ProcessRequest):
    try:
        data = payload.model_dump()
        req_type = data.get("request_type")
        if req_type == "review":
            state = {
                "problem_id": data.get("problem_id"),
                "problem_title": "",
                "problem_description": "",
                "code": data.get("code"),
                "test_results": [],
                "review_result": {}
            }
            result = process_review(state)
            return {"success": True, "state": result, "response": result.get("review_result", {})}
        elif req_type == "coach":
            state = {
                "progress": data.get("learner_progress", {}),
                "recommendation": {},
                "explanation": ""
            }
            result = process_coaching(state)
            return {"success": True, "state": result, "response": result.get("explanation", {})}
        else:
            state = {
                "problem_id": data.get("problem_id"),
                "code": data.get("code"),
                "hint_level": data.get("hint_level", 1),
                "hint": ""
            }
            result = process_hint(state)
            return {"success": True, "state": result, "response": result.get("hint", "")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
