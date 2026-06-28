# Velo AI — Autonomous CI/CD Code Healing Agent

Velo is a production-grade, autonomous software healing agent designed to run in sandboxed containerized environments. It automatically checks out code repositories, executes test blocks, leverages Google Gemini LLMs to solve syntax, logic, and dependency errors, and commits the fixes back directly to GitHub with zero human intervention.

---

## System Flow Architecture

```mermaid
graph TD
    subgraph Execution Mode A: GitHub App SaaS
        A[Developer pushes commit / PR] --> B[GitHub Webhook Event]
        B --> C[Velo Webhook Endpoint /api/github/webhook]
        C --> D[Verify Signature HMAC-SHA256]
        D -- Verified --> E[Authenticate as Installation]
        E --> F[Create Check Run 'in_progress']
        F --> G[Spawn Sandbox Worker Thread]
    end

    subgraph Execution Mode B: Client-Only Dashboard
        H[User visits Dashboard UI] --> I[OAuth Sign-In]
        I --> J[POST /api/analyze/stream]
        J --> G
    end

    subgraph Autonomous Healing Engine
        G --> K[Clone & Checkout target branch]
        K --> L[Loop up to MAX_RETRIES]
        L --> M[Node 1: Sandbox Tester runs tests in Docker]
        M --> N{Tests Passing?}
        N -- Yes --> O[Exit Loop]
        N -- No --> P[Node 2: LLM Solver evaluates logs]
        P --> Q[Generate exact fixes & unified diffs]
        Q --> R[Node 3: GitOps commits & pushes to remote]
        R --> L
        O --> S[Compile results.json payload]
    end

    subgraph Feedback Loop
        S --> T{Trigger Mode}
        T -- GitHub App --> U[Complete Check Run with success/failure]
        T -- Dashboard --> V[Stream Event done via SSE]
    end
```

---

## Core Operational Modes

### 1. The GitHub App Model (Enterprise CI/CD Automation)
Velo acts as an integrated GitHub App installed on organizations or select repositories:
*   **Automatic Webhooks:** Listens to `pull_request` (actions `opened`, `synchronize`) webhooks.
*   **Check Runs Integration:** Instantly registers a native Check Run on commits, reporting healing outcomes directly within GitHub's native PR page checks.
*   **Token Isolation:** Authenticates via GitHub App Installation Access Tokens, eliminating the need to expose raw user developer tokens.

### 2. The React Dashboard Model (Manual / Extension Trigger)
Allows developers to trigger the healing agent on-demand from a centralized UI dashboard or Chrome extension companion:
*   **Live SSE Streaming:** Streams raw sandbox run logs, iteration status, and unified diff outputs to the UI in real-time.
*   **Fork-and-PR Fallback:** If the user does not have direct push access to the repository, Velo automatically forks the repo to the user's personal namespace, applies the fixes, and creates a Pull Request back to the original repository.

---

## Quick Start Setup

### Prerequisites
*   Python 3.10+ and Node.js v18+
*   Docker engine installed (needed for sandboxed test runs)
*   Google Gemini API Key

### 1. Environment Configuration
Create a `.env` file in `backend/` using the [.env.example](file:///c:/Users/punya/Desktop/ttl/backend/.env.example) template:

```ini
# Core LLM Solver
GEMINI_API_KEY=AIzaSy...

# Flask Settings
PORT=5000
FLASK_ENV=development

# GitHub App Credentials
GITHUB_APP_ID=123456
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
GITHUB_APP_WEBHOOK_SECRET=your_signature_verification_key
```

### 2. Run Backend Web Server
```bash
cd backend
python -m pip install -r requirements.txt
python app.py
```

### 3. Run Frontend Dashboard
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Production Security & Hardening
*   **Sandboxing:** All test execution is isolated inside throwaway Docker containers to prevent arbitrary code execution on host machines.
*   **Signature Verification:** Webhooks verify `X-Hub-Signature-256` using your configured App secret.
*   **Rate Limiting:** Backend endpoints are protected by `Flask-Limiter` to throttle API requests.
