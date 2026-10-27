from services.llm_service import llm_service

def process_review(state: dict) -> dict:
    """
    Code Review Agent.
    Analyzes submitted code and test results covering Correctness, Code Quality, Performance, and Security.
    """
    problem_title = state.get("problem_title", "")
    problem_description = state.get("problem_description", "")
    code = state.get("code", "")
    test_results = state.get("test_results", [])

    review_result = llm_service.generate_code_review(
        problem_title=problem_title,
        problem_description=problem_description,
        code=code,
        test_results=test_results
    )

    state["review_result"] = review_result
    state["response"] = review_result.get("summary", "Code review completed.")
    return state
