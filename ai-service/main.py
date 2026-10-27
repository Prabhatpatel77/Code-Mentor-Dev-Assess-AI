import os
import sys
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any

# Ensure local imports work cleanly
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from graph.workflow import run_agent_workflow

app = FastAPI(
    title="CodeMentorAI - AI Service",
    description="Python FastAPI Service running LangGraph Supervisor and Agents",
    version="1.0.0"
)

class ProcessRequest(BaseModel):
    user_id: str = "default_user"
    problem_id: Optional[str] = None
    code: Optional[str] = None
    request_type: str  # 'hint', 'review', 'coach'
    hint_level: int = 1
    hints_used: int = 0
    review_result: Optional[Dict[str, Any]] = None
    learner_progress: Optional[Dict[str, Any]] = None

@app.get("/")
@app.get("/health")
def health_check():
    """
    Health check endpoint for Python AI Service.
    """
    return {
        "status": "healthy",
        "service": "CodeMentorAI-Python-AIService",
        "version": "1.0.0",
        "langgraph_initialized": True,
        "environment": os.getenv("PYTHON_ENV", "development")
    }

@app.post("/api/supervisor/process")
def process_agent_request(payload: ProcessRequest):
    """
    Supervisor endpoint that routes requests to AI agents (Hint, Review, Coach).
    """
    try:
        initial_state = payload.model_dump()
        result_state = run_agent_workflow(initial_state)
        return {
            "success": True,
            "state": result_state,
            "response": result_state.get("response", "[Not implemented yet] Response pending agent workflow.")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
