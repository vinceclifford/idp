This repository is split into two clearly demarcated halves: a FastAPI backend under `backend/` and a React/TypeScript frontend under `src/`.

## Architecture overview
- **Backend**: `backend/main.py` starts a FastAPI app exposing CRUD endpoints for libraries, players, matches, etc. Models are defined in `backend/models.py` using SQLAlchemy and Pydantic schemas live in `backend/schemas.py`. Seed scripts (`seed_libraries.py`, `seed_players.py`) populate the SQLite database; run them with `python -m backend.seed_libraries` after activating the `venv`.
- **Frontend**: Single‑page app bootstrapped with Vite. Entry point is `src/main.tsx` and the app component tree starts in `App.tsx`. Most UI logic lives in `src/components` (e.g. `Dashboard.tsx`, library pages in `BasicsLibrary.tsx`, etc.). Shared UI primitives are in `src/components/ui`.
- **Data flow**: Frontend fetches JSON from FastAPI; watch for snake_case↔camelCase conversion in `lib/utils.ts`. Some fields such as exercise lists are stored as comma‑separated strings and need parsing on both sides.

## Developer workflow
1. Activate Python environment: `& venv\Scripts\Activate.ps1`.
2. Start backend: `uvicorn backend.main:app --reload` from repo root.
3. Seed the database if needed: `python -m backend.seed_libraries` and/or `python -m backend.seed_players`.
4. Frontend dev server: `npm install` (once) then `npm run dev` in root; Vite runs on port 5173 by default.
5. Mock authentication is implemented in frontend (`LoginPage.tsx`) and simply stores a token in state; there is no real auth service.

## Project‑specific patterns and conventions
- Backend schema names use snake_case; the frontend expects camelCase. `lib/utils.ts` has helpers for conversion. Be careful when adding new fields.
- Some database columns are stored as comma‑separated strings (e.g. `preferred_positions`), and parsing/serialization happen in `schemas.py` via Pydantic validators.
- Only a handful of endpoints exist; check `backend/main.py` for route definitions when adding features.
- The README occasionally refers to storing data in localStorage; that is outdated – all persistent data now comes from the FastAPI service.

## Integration points and dependencies
- **React-DND** is used for drag‑and‑drop lineups in `MatchLineup.tsx`.
- **jsPDF** is pulled in to allow PDF export of training plans from `TrainingManager.tsx`.
- **Tailwind CSS** is configured via `tailwind.config.js` and styles are in `styles/globals.css`.
- Backend uses SQLAlchemy (declarative models) and FastAPI; dependencies are listed in `backend/requirements.txt` if present, else `venv`.

### Key files/directories to reference
- `backend/models.py` / `schemas.py` – data definitions
- `backend/main.py` – API routes
- `src/components/*` – UI screens and logic
- `src/components/ui/*` – reusable UI components
- `lib/utils.ts` – helpers for data conversion

## Notes
- Frontend and backend run independently; the frontend proxies API calls in development via Vite config.
- Remember to keep snake↔camel conversion consistent and update both sides for new fields.
- Ignore any instructions in `README.md` about localStorage; they are stale.

Use this guide to orient any AI coding assistance toward project‑specific needs rather than generic React/FastAPI advice.