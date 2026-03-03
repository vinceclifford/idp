# CoachHub Dashboard - Documentation Index

## New Here? Read This First

Start with **[README.md](./README.md)** — it contains the full setup guide, architecture overview, API reference, and feature details.

Also see **[Changes.md](./Changes.md)** for a running changelog and the current to-do list.

---

## Documentation Files

| File | Purpose |
|------|---------|
| [README.md](./README.md) | Full setup guide, tech stack, project structure, API endpoints, feature details |
| [Changes.md](./Changes.md) | Changelog and to-do list |
| [INDEX.md](./INDEX.md) | This file  documentation index |

---

## Quick Setup Summary

You need **Node.js 16+**, **Python 3.8+**, and **PostgreSQL**. Then:

```bash
# 1. Update DB credentials in backend/database.py, then:

# 2. Backend
python -m venv venv
venv\Scripts\Activate.ps1        # Windows
# source venv/bin/activate       # macOS / Linux
pip install fastapi uvicorn sqlalchemy psycopg2-binary python-multipart pydantic
cd backend
uvicorn main:app --reload

# 3. (Optional) Seed the database — run from inside backend/
python seed_libraries.py
python seed_players.py
python seed_past_matches.py

# 4. Frontend (separate terminal, from repo root)
cd ..
npm install
npm run dev
```

Open `http://localhost:5173`, then register your first account via the Login page (or `POST /register` at `http://localhost:8000/docs`).

---

## Features Overview

| Feature | Component | Description |
|---------|-----------|-------------|
| Dashboard | `Dashboard.tsx` | Team statistics and overview |
| Team Management | `TeamManagement.tsx` | Player profiles and roster |
| Player Detail | `PlayerSlideOver.tsx` | Slide-over panel for player details |
| Exercises | `ExercisesLibrary.tsx` | Create and manage reusable exercises |
| Exercise Detail | `ExerciseSlideOver.tsx` | Slide-over panel for exercise details |
| Training Manager | `TrainingManager.tsx` | Build and schedule training sessions + PDF export |
| Basics | `BasicsLibrary.tsx` | Fundamental concepts library |
| Principles | `PrinciplesLibrary.tsx` | Coaching philosophy library (with media) |
| Tactics | `TacticsLibrary.tsx` | Tactical systems library |
| Match & Lineup | `MatchLineup.tsx` | Visual drag-and-drop lineup builder |
| Command Palette | `CommandPalette.tsx` | Ctrl+K / Cmd+K quick navigation |
| Navigation | `Navigation.tsx` | Sidebar navigation |
| Login | `LoginPage.tsx` | Authentication (login / register) |

---

## Common Issues

| Problem | Solution |
|---------|----------|
| Backend fails to start | Check PostgreSQL is running and credentials in `backend/database.py` are correct |
| Frontend can't reach API | Ensure `uvicorn backend.main:app --reload` is running on port 8000 |
| `npm install` fails | Make sure you have Node.js 16+ installed |
| TypeScript errors | Run `npm install` to ensure all packages are present |
| No data showing | Run the seed scripts: `python -m backend.seed_libraries` etc. |

---

## Getting Started Checklist

- [ ] PostgreSQL installed and running
- [ ] `backend/database.py` updated with your DB credentials
- [ ] Python venv created and dependencies installed
- [ ] `uvicorn backend.main:app --reload` running
- [ ] (Optional) seed scripts executed
- [ ] `npm install` done
- [ ] `npm run dev` running
- [ ] Browser open at `http://localhost:5173`
- [ ] First user account registered
