# TODO: Implement LangGraph StateGraph workflow in Prompt 2

def build_workflow():
    """
    LangGraph Workflow Builder [TODO in Prompt 2].
    Constructs StateGraph with Supervisor router and Hint/Review/Coach nodes.
    """
    return None

def run_agent_workflow(initial_state: dict) -> dict:
    """
    Executes the supervisor graph with initial AgentState.
    """
    req_type = initial_state.get("request_type", "")
    if req_type == "hint":
        from agents.hint_agent import process_hint
        return process_hint(initial_state)
    elif req_type == "review":
        from agents.review_agent import process_review
        return process_review(initial_state)
    elif req_type == "coach":
        from agents.coach_agent import process_coaching
        return process_coaching(initial_state)
    
    initial_state["response"] = f"[Not implemented yet] Agent supervisor endpoint initialized. Request type '{req_type}' pending Prompt 2 agent workflow."
    return initial_state
