from services.llm_service import llm_service

def process_hint(state: dict) -> dict:
    """
    Adaptive Hint Agent.
    Processes request for hint levels 1 through 4.
    Includes learning_signal when hint_level >= 3 to demonstrate shared state capability.
    """
    hint_level = state.get("hint_level", 1)
    if not isinstance(hint_level, int) or hint_level < 1:
        hint_level = 1
    elif hint_level > 4:
        hint_level = 4

    problem_title = state.get("problem_title", "")
    problem_description = state.get("problem_description", "")
    examples = state.get("examples", [])
    code = state.get("code", "")
    test_results = state.get("test_results", [])

    generated_hint = llm_service.generate_hint(
        problem_title=problem_title,
        problem_description=problem_description,
        examples=examples,
        code=code,
        test_results=test_results,
        hint_level=hint_level
    )

    state["hint_level"] = hint_level
    state["hint"] = generated_hint
    state["response"] = generated_hint

    # Agent-to-Agent signal on high hint dependency
    if hint_level >= 3:
        state["learning_signal"] = {
            "type": "high_hint_dependency",
            "problem_id": state.get("problem_id", ""),
            "hint_level": hint_level
        }

    return state
