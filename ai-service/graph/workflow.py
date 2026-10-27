import sys
import os

# Ensure local paths resolve correctly
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from state.agent_state import AgentState
from agents.hint_agent import process_hint
from agents.review_agent import process_review
from agents.coach_agent import process_coaching

# LangGraph StateGraph abstraction with zero external dependency crash protection
try:
    from langgraph.graph import StateGraph, START, END
except ImportError:
    START = "__start__"
    END = "__end__"

    class CompiledGraph:
        def __init__(self, nodes, edges, conditional_edges, start_node):
            self.nodes = nodes
            self.edges = edges
            self.conditional_edges = conditional_edges
            self.start_node = start_node

        def invoke(self, state: dict) -> dict:
            current_state = dict(state)
            current_node = self.start_node
            visited = 0
            while current_node and current_node != END and visited < 20:
                visited += 1
                if current_node in self.nodes:
                    node_fn = self.nodes[current_node]
                    output = node_fn(current_state)
                    if isinstance(output, dict):
                        current_state.update(output)

                if current_node in self.conditional_edges:
                    routing_fn, mapping = self.conditional_edges[current_node]
                    next_key = routing_fn(current_state)
                    current_node = mapping.get(next_key, END)
                elif current_node in self.edges:
                    current_node = self.edges[current_node]
                else:
                    break
            return current_state

    class StateGraph:
        def __init__(self, state_schema):
            self.state_schema = state_schema
            self.nodes = {}
            self.edges = {}
            self.conditional_edges = {}
            self.start_node = None

        def add_node(self, name: str, fn):
            self.nodes[name] = fn

        def add_edge(self, from_node: str, to_node: str):
            if from_node == START:
                self.start_node = to_node
            else:
                self.edges[from_node] = to_node

        def add_conditional_edges(self, from_node: str, routing_fn, mapping: dict):
            self.conditional_edges[from_node] = (routing_fn, mapping)

        def compile(self):
            return CompiledGraph(self.nodes, self.edges, self.conditional_edges, self.start_node)

# Node Implementations
def supervisor_node(state: AgentState) -> AgentState:
    """
    Supervisor Node.
    Inspects state and prepares for conditional routing.
    """
    return state

def hint_node(state: AgentState) -> AgentState:
    """Routes to Adaptive Hint Agent"""
    return process_hint(state)

def review_node(state: AgentState) -> AgentState:
    """Routes to Code Review Agent"""
    return process_review(state)

def coach_node(state: AgentState) -> AgentState:
    """Routes to Learning Coach Agent"""
    return process_coaching(state)

def error_node(state: AgentState) -> AgentState:
    """Handles unsupported or invalid request types"""
    req_type = state.get("request_type", "unknown")
    state["error"] = f"Unsupported request type: '{req_type}'. Supported values: hint, review, coach."
    state["response"] = state["error"]
    return state

# Deterministic Conditional Router
def route_request(state: AgentState) -> str:
    """
    Inspects request_type and returns the route key.
    Deterministic, cheap, and non-LLM based.
    """
    req_type = (state.get("request_type") or "").strip().lower()
    if req_type in ("hint", "review", "coach"):
        return req_type
    return "error"

# Build and Compile LangGraph StateGraph
def build_supervisor_graph():
    workflow = StateGraph(AgentState)

    workflow.add_node("supervisor", supervisor_node)
    workflow.add_node("hint_agent", hint_node)
    workflow.add_node("review_agent", review_node)
    workflow.add_node("coach_agent", coach_node)
    workflow.add_node("error_handler", error_node)

    workflow.add_edge(START, "supervisor")

    workflow.add_conditional_edges(
        "supervisor",
        route_request,
        {
            "hint": "hint_agent",
            "review": "review_agent",
            "coach": "coach_agent",
            "error": "error_handler"
        }
    )

    workflow.add_edge("hint_agent", END)
    workflow.add_edge("review_agent", END)
    workflow.add_edge("coach_agent", END)
    workflow.add_edge("error_handler", END)

    return workflow.compile()

# Global compiled graph instance
supervisor_graph = build_supervisor_graph()

def run_agent_workflow(initial_state: dict) -> dict:
    """
    Unified entrypoint to invoke the compiled LangGraph supervisor graph.
    """
    try:
        return supervisor_graph.invoke(initial_state)
    except Exception as e:
        initial_state["error"] = f"Agent workflow execution error: {str(e)}"
        initial_state["response"] = initial_state["error"]
        return initial_state
