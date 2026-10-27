import os
import sys
import json
from http.server import HTTPServer, BaseHTTPRequestHandler
from socketserver import ThreadingMixIn

# Ensure local imports work cleanly
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from graph.workflow import run_agent_workflow
from agents.hint_agent import process_hint
from agents.review_agent import process_review
from agents.coach_agent import process_coaching

PORT = int(os.getenv("AI_SERVICE_PORT", os.getenv("PORT", "8001")))

class ThreadingSimpleServer(ThreadingMixIn, HTTPServer):
    pass

class AIRequestHandler(BaseHTTPRequestHandler):
    def _set_headers(self, status=200, content_type="application/json"):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(200)

    def do_GET(self):
        path = self.path.split("?")[0]
        if path in ("/", "/health"):
            data = {
                "status": "healthy",
                "service": "CodeMentorAI-Python-AIService",
                "version": "1.0.0",
                "langgraph_initialized": True,
                "gemini_api_configured": bool(os.getenv("GEMINI_API_KEY"))
            }
            self._set_headers(200)
            self.wfile.write(json.dumps(data).encode("utf-8"))
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode("utf-8"))

    def do_POST(self):
        path = self.path.split("?")[0]
        content_length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else "{}"

        try:
            payload = json.loads(post_data) if post_data else {}
        except Exception:
            payload = {}

        try:
            if path == "/api/hint":
                level = payload.get("hintLevel", 1)
                if level < 1:
                    level = 1
                elif level > 4:
                    level = 4

                state = {
                    "problem_id": payload.get("problemId"),
                    "problem_title": payload.get("problemTitle", ""),
                    "problem_description": payload.get("problemDescription", ""),
                    "examples": payload.get("examples", []),
                    "code": payload.get("code", ""),
                    "test_results": payload.get("testResults", []),
                    "hint_level": level,
                    "hint": ""
                }
                result_state = process_hint(state)
                hint_types = {
                    1: "conceptual",
                    2: "approach",
                    3: "code_structure",
                    4: "debugging"
                }
                res = {
                    "success": True,
                    "hintLevel": result_state.get("hint_level", level),
                    "hintType": hint_types.get(result_state.get("hint_level", level), "conceptual"),
                    "hint": result_state.get("hint", "")
                }
                if "learning_signal" in result_state:
                    res["learning_signal"] = result_state["learning_signal"]

                self._set_headers(200)
                self.wfile.write(json.dumps(res).encode("utf-8"))

            elif path == "/api/review":
                state = {
                    "problem_id": payload.get("problemId"),
                    "problem_title": payload.get("problemTitle", ""),
                    "problem_description": payload.get("problemDescription", ""),
                    "code": payload.get("code", ""),
                    "test_results": payload.get("testResults", []),
                    "review_result": {}
                }
                result_state = process_review(state)
                res = {
                    "success": True,
                    "review": result_state.get("review_result", {})
                }
                self._set_headers(200)
                self.wfile.write(json.dumps(res).encode("utf-8"))

            elif path == "/api/coach/explain":
                state = {
                    "progress": payload.get("progress") or {},
                    "recommendation": payload.get("recommendation") or {},
                    "explanation": ""
                }
                result_state = process_coaching(state)
                res = {
                    "success": True,
                    "explanation": result_state.get("explanation", "")
                }
                self._set_headers(200)
                self.wfile.write(json.dumps(res).encode("utf-8"))

            elif path in ("/api/agent", "/api/supervisor/process"):
                req_type = (payload.get("request_type") or "").strip().lower()
                if req_type not in ("hint", "review", "coach"):
                    self._set_headers(400)
                    self.wfile.write(json.dumps({
                        "success": False,
                        "message": "Unsupported request type",
                        "supported_types": ["hint", "review", "coach"]
                    }).encode("utf-8"))
                    return

                payload["request_type"] = req_type
                result_state = run_agent_workflow(payload)

                if result_state.get("error"):
                    self._set_headers(400)
                    self.wfile.write(json.dumps({
                        "success": False,
                        "message": result_state.get("error"),
                        "state": result_state
                    }).encode("utf-8"))
                    return

                res = {
                    "success": True,
                    "request_type": req_type,
                    "response": result_state.get("response", ""),
                    "state": result_state
                }
                self._set_headers(200)
                self.wfile.write(json.dumps(res).encode("utf-8"))

            else:
                self._set_headers(404)
                self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode("utf-8"))

        except Exception as e:
            self._set_headers(500)
            self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode("utf-8"))

    def log_message(self, format, *args):
        # Quiet standard HTTP logging
        pass

def run_server(port=PORT):
    server = ThreadingSimpleServer(("0.0.0.0", port), AIRequestHandler)
    print(f"[CodeMentorAI-Python] Python AI Service running at http://0.0.0.0:{port}")
    server.serve_forever()

if __name__ == "__main__":
    run_server()
