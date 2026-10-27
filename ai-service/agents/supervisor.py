# TODO: Implement LangGraph Supervisor routing logic in Prompt 2

def supervisor_router(state: dict) -> str:
    """
    Supervisor Agent Router [TODO in Prompt 2].
    Routes request_type ('hint', 'review', 'coach') to appropriate agent node.
    """
    request_type = state.get("request_type", "")
    if request_type == "hint":
        return "hint_agent"
    elif request_type == "review":
        return "review_agent"
    elif request_type == "coach":
        return "coach_agent"
    return "END"
