# CodeMentorAI — AI Coding Assessment Platform

A small, runnable, maintainable **AI Coding Assessment Platform** featuring:
- **Coding Problems & JS Runner**: Problem display with test cases and in-browser / Node.js execution.
- **Adaptive Hint Agent**: 4-level progressive hints (Conceptual → Approach → Code Structure → Debugging).
- **Code Review Agent**: Automated correctness, style, performance, and security checks.
- **Learning Coach**: Progress tracking with topic-based recommendations.
- **LangGraph Supervisor**: StateGraph orchestration connecting Agents to a unified `AgentState`.

---

## 1. Project Architecture

```text
React Frontend (Vite)
       │
       ▼
Node.js / Express Backend  ──────► MongoDB / Mongoose
       │
       ▼
Python / FastAPI AI Service  ──────► LangGraph Supervisor & Gemini API
```

---

## 2. Quick Start & Setup Instructions

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- MongoDB instance or MongoDB Atlas URI (Optional for local testing; mock fallback included)

---

### Step 1: Environment Variables Setup
Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Ensure `.env` contains:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/codementor_ai
AI_SERVICE_URL=http://localhost:8000
GEMINI_API_KEY=your_gemini_api_key_here
PYTHON_ENV=development
```

---

### Step 2: Node.js / Express Backend & Frontend
Install npm dependencies and start the combined dev server:

```bash
npm install
npm run dev
```

The application and API gateway will be available at:
- Frontend & Express API: `http://localhost:3000`
- Health check: `http://localhost:3000/api/health`
- Problems API: `http://localhost:3000/api/problems`

---

### Step 3: Python / FastAPI AI Service
Navigate to the `ai-service` folder or setup virtual environment:

```bash
cd ai-service
python3 -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python3 main.py
```

Or using `uvicorn`:
```bash
uvicorn main:app --reload --port 8000
```

The Python AI service health endpoint will be active at:
- Health check: `http://localhost:8000/health`
- Supervisor process endpoint: `http://localhost:8000/api/supervisor/process`

---

## 3. Directory Structure

```text
.
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection setup
│   ├── controllers/
│   │   ├── problemController.js   # Problem management
│   │   ├── submissionController.js# JS code execution & test verification
│   │   ├── aiController.js        # Forwarding requests to AI Service
│   │   └── healthController.js    # System health verification
│   ├── models/
│   │   ├── Problem.js             # Problem schema
│   │   ├── Submission.js          # Submission schema
│   │   └── UserProgress.js        # User performance tracking schema
│   ├── middleware/
│   │   └── errorHandler.js        # Express error handler
│   ├── routes/
│   │   ├── problemRoutes.js
│   │   ├── submissionRoutes.js
│   │   ├── aiRoutes.js
│   │   ├── healthRoutes.js
│   │   └── index.js
│   ├── services/
│   │   ├── codeExecutionService.js# JavaScript sandboxed VM execution
│   │   └── aiService.js           # Client connector to Python FastAPI AI service
│   └── server.js                  # Express backend entry point
│
├── ai-service/
│   ├── agents/
│   │   ├── supervisor.py          # [TODO] LangGraph Supervisor agent routing
│   │   ├── hint_agent.py          # [TODO] 4-level adaptive hint agent
│   │   ├── review_agent.py        # [TODO] Code review agent
│   │   └── coach_agent.py         # [TODO] Learning coach recommendation agent
│   ├── graph/
│   │   └── workflow.py            # [TODO] LangGraph StateGraph workflow definition
│   ├── state/
│   │   └── agent_state.py         # Shared AgentState TypedDict
│   ├── services/
│   │   ├── llm_service.py         # [TODO] Gemini API integration client
│   │   └── code_executor.py       # Code execution helper
│   ├── main.py                    # FastAPI application entry point
│   └── requirements.txt           # Python dependencies
│
├── src/
│   ├── components/                # React components (Navbar, HealthStatusCard, etc.)
│   ├── pages/                     # Application pages (Home, Problems, Problem Detail, Progress, Health Status)
│   ├── services/                  # Frontend API service
│   ├── App.jsx                    # Router layout
│   └── main.tsx                   # React app root
│
├── server.ts                      # AI Studio Express dev integration wrapper
├── .env.example
├── package.json
└── README.md
```

---

## 4. Implementation Status (Prompt 1 Initialized)

- [x] Basic project structure created
- [x] React frontend with routing and UI initialized
- [x] Node.js/Express backend configured with health check and problem runner APIs
- [x] MongoDB database connection layer & schemas created
- [x] Python/FastAPI AI service structure initialized
- [x] Shared `AgentState` schema defined
- [x] Minimal health check endpoints available
- [ ] **[TODO - Prompt 2]**: LangGraph Supervisor workflow & AI Agents implementation
