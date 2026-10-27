from services.llm_service import llm_service

def process_coaching(state: dict) -> dict:
    """
    Learning Coach Agent.
    Generates a personalized coaching message explaining the progress & recommendation.
    """
    progress = state.get("progress") or state.get("learner_progress") or {}
    recommendation = state.get("recommendation", {})

    explanation = llm_service.generate_coach_explanation(
        progress=progress,
        recommendation=recommendation
    )

    state["explanation"] = explanation
    state["response"] = explanation
    return state
