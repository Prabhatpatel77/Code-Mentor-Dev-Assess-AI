from typing import TypedDict, Optional, Dict, Any

class AgentState(TypedDict):
    """
    Shared minimal AgentState for LangGraph Supervisor and Agents.
    """
    user_id: str
    problem_id: Optional[str]
    code: Optional[str]
    request_type: str  # 'hint', 'review', 'coach'

    hint_level: int    # Current level 1..4
    hints_used: int    # Cumulative hints used for problem

    review_result: Optional[Dict[str, Any]]
    learner_progress: Optional[Dict[str, Any]]

    response: str
