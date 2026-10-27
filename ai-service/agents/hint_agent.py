# TODO: Implement 4-level Adaptive Hint Agent in Prompt 2
# Level 1: Conceptual
# Level 2: Approach
# Level 3: Code Structure
# Level 4: Debugging

def process_hint(state: dict) -> dict:
    """
    Adaptive Hint Agent [TODO in Prompt 2].
    Provides progressive hints based on state['hint_level'] (1 to 4).
    """
    current_level = state.get("hint_level", 1)
    state["response"] = f"[Not implemented yet] Hint Level {current_level} requested for problem {state.get('problem_id')}. AI Agent workflow will be implemented in Prompt 2."
    return state
