# Changelog

---

## Major Changes

### 1. Login & Logout
- Full login/logout flow implemented with a FastAPI backend (`/login`, `/register` endpoints).
- On successful login the frontend stores an `isAuthenticated` flag in `localStorage` so the user stays logged in across page reloads.
- Logout clears the flag and returns to the login page.

### 2. Match & Lineup Page
- Create match functionality added (opponent, date, time, location).
- Upcoming fixtures list added.
- Set and edit the earliest match functionality added.
- Lineup save and edit functionality added.
- Formation is auto-suggested based on tactics linked to exercises used in training sessions from the last 7 days. Falls back to 4-4-2 if no recent tactics are found.
- Available players list is pulled from the Team page; only active players are shown.

### 3. Database migrated from SQLite to PostgreSQL
- `backend/database.py` now uses a PostgreSQL connection string.
- Update with your own credentials before running.

### 4. Media Upload & View
- Image/video upload added to Basics and Principles pages; also available on Exercises.
- Files are uploaded via `POST /upload`, stored in `static/uploads/`, and served as static assets.
- Media viewing experience improved across all library pages.

### 5. Shared UI Component Library
- Reusable UI primitives extracted to `src/components/ui/` (Button, Card, Modal, Input, Select, DatePicker, TimePicker, ConfirmDialog, Skeleton, CountUp, SessionSlideOver).
- Centralises styles for easier future updates.

---

## Minor Changes

- Background, card, details, fields and button styles refreshed.
- Framer Motion animations added throughout.
- Modern charts and data visualisations added.
- Command Palette added (Ctrl+K / Cmd+K) for quick navigation.

---

## Known Issues / To-Do

The items below are still outstanding. Everything not listed here has been resolved.

1. **Multi-team support** — a coach's library (Basics, Principles, Tactics, Exercises) is currently global. The system should support managing multiple teams under one coach account, where the library is shared across teams but rosters, training sessions, and match lineups are scoped per team. Suggested scope:
   - Add a `Team` selector to the navigation / header so the coach can switch the active team context.
   - Training sessions, matches, and player rosters should belong to a specific team (`team_id` FK).
   - The library (Basics, Principles, Tactics, Exercises) stays coach-wide and is not duplicated per team.
   - Backend: extend relevant models with a `team_id` column and add team CRUD endpoints.
   - Frontend: persist the active team selection (e.g. in `localStorage`) and scope all API calls accordingly.

2. **Input validation** — sanity checks (required fields, number ranges, etc.) are still incomplete across several forms.
2. **Language localisation** — no i18n support yet; all UI is English only.
3. **Extended filter options** — intensity filtering exists in Training Manager and name search exists in Team Management, but filtering/sorting is missing from the library pages (Basics, Principles, Tactics, Exercises).
4. **Tactics API** — the Tactics library is manually managed; no external data source has been integrated yet.
5. **Passwords stored in plain text** — add `passlib[bcrypt]` hashing before any production deployment.

### Resolved (previously on to-do list)

- ~~Player attendances should be logged~~ — Attendance is now computed automatically from `selected_players` on each training session and displayed as a percentage in Team Management.
- ~~Edit Formation option in Match & Lineup~~ — Formation picker with grouped presets (4/3/5-defender families) is fully implemented.
- ~~Dashboard showing test data~~ — Dashboard now fetches live data from `/players`, `/training_sessions`, and `/matches`.
- ~~Fix calendar and time selection fields~~ — Custom `DatePicker` and `TimePicker` components are fully implemented in `src/components/ui/`.
