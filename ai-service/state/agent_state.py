from typing import TypedDict, Optional, Any, Dict, List

class AgentState(TypedDict, total=False):
    user_id: str
    problem_id: Optional[str]
    problem_title: Optional[str]
    problem_description: Optional[str]
    examples: Optional[List[Any]]
    code: Optional[str]
    request_type: str

    hint_level: int
    hints_used: int

    test_results: Optional[Any]
    review_result: Optional[Any]
    learner_progress: Optional[Any]
    recommendation: Optional[Any]

    learning_signal: Optional[Any]
    response: str
    error: Optional[str]

class HintState(TypedDict, total=False):
    problem_id: str
    problem_title: Optional[str]
    problem_description: Optional[str]
    examples: Optional[List[Dict[str, Any]]]
    code: Optional[str]
    test_results: Optional[List[Dict[str, Any]]]
    hint_level: int
    hint: str
    learning_signal: Optional[Any]
