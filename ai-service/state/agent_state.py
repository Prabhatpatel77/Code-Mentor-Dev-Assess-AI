from typing import TypedDict, Optional, List, Dict, Any

class HintState(TypedDict):
    problem_id: str
    problem_title: Optional[str]
    problem_description: Optional[str]
    examples: Optional[List[Dict[str, Any]]]
    code: Optional[str]
    test_results: Optional[List[Dict[str, Any]]]
    hint_level: int
    hint: str

class AgentState(TypedDict):
    user_id: str
    problem_id: Optional[str]
    code: Optional[str]
    request_type: str
    hint_level: int
    hints_used: int
    review_result: Optional[Dict[str, Any]]
    learner_progress: Optional[Dict[str, Any]]
    response: str
