import os
import sys
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

# Ensure local imports work cleanly
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from graph.workflow import run_agent_workflow
from agents.hint_agent import process_hint
from agents.review_agent import process_review
from agents.coach_agent import process_coaching

app = FastAPI(
    title="CodeMentorAI - AI Service",
    description="Python FastAPI LangGraph Supervisor and Agents Service",
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

class AgentRequestPayload(BaseModel):
    request_type: str
    user_id: Optional[str] = "default_user"
    problem_id: Optional[str] = None
    problem_title: Optional[str] = ""
    problem_description: Optional[str] = ""
    examples: Optional[List[Any]] = []
    code: Optional[str] = ""
    hint_level: Optional[int] = 1
    hints_used: Optional[int] = 0
    test_results: Optional[List[Any]] = []
    review_result: Optional[Dict[str, Any]] = None
    learner_progress: Optional[Dict[str, Any]] = None
    recommendation: Optional[Dict[str, Any]] = None

@app.get("/")
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "CodeMentorAI-Python-AIService",
        "version": "1.0.0",
        "langgraph_initialized": True,
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

        response_data = {
            "success": True,
            "hintLevel": result_state.get("hint_level", level),
            "hintType": hint_types.get(result_state.get("hint_level", level), "conceptual"),
            "hint": result_state.get("hint", "")
        }

        if "learning_signal" in result_state:
            response_data["learning_signal"] = result_state["learning_signal"]

        return response_data
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

@app.post("/api/agent")
def unified_agent_endpoint(payload: AgentRequestPayload):
    """
    Unified LangGraph Supervisor Orchestration Endpoint for Prompt 7.
    Routes deterministic requests ('hint', 'review', 'coach') through StateGraph.
    """
    req_type = (payload.request_type or "").strip().lower()

    if req_type not in ("hint", "review", "coach"):
        return {
            "success": False,
            "message": "Unsupported request type",
            "supported_types": ["hint", "review", "coach"]
        }

    try:
        state = payload.model_dump()
        state["request_type"] = req_type
        result_state = run_agent_workflow(state)

        if result_state.get("error"):
            return {
                "success": False,
                "message": result_state.get("error"),
                "state": result_state
            }

        return {
            "success": True,
            "request_type": req_type,
            "response": result_state.get("response", ""),
            "state": result_state
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"Orchestrator error: {str(e)}"
        }

@app.post("/api/supervisor/process")
def process_agent_request(payload: AgentRequestPayload):
    """Legacy supervisor compatibility endpoint"""
    return unified_agent_endpoint(payload)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
