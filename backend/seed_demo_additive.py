"""
Additive demo seed — adds the demo account WITHOUT wiping the database.

Unlike seed_demo.py (which drops every table first), this script leaves all
existing data completely untouched. It creates the demo coach and its fully
populated data only if the demo account doesn't already exist; if it does, it
exits without making any changes. Safe to run against production and safe to
re-run.

Usage (point DATABASE_URL at the target database):
    cd backend
    DATABASE_URL="<prod-public-url>" python seed_demo_additive.py

The inline DATABASE_URL overrides your local .env for this one run, while .env
still supplies SECRET_KEY (needed to import the security module).
"""

import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from database import SessionLocal, engine
from models import Base, User, Team, Season

import security

from seed_players      import seed_players
from seed_libraries    import seed_libraries
from seed_past_matches import seed_training_sessions, seed_matches

# -- Demo account (kept in sync with seed_demo.py) ----------------------------
DEMO_EMAIL    = "demo@coachhub.com"
DEMO_PASSWORD = "Demo1234!"
DEMO_NAME     = "Alex Johnson"

TEAM_NAME      = "City FC U19"
TEAM_FORMATION = "4-3-3"

SEASON_NAMES = [
    "2023/2024 Season",
    "2024/2025 Season",
    "2025/2026 Season",
]
SEASON_DAY_OFFSETS = [730, 365, 0]


def run():
    # Ensure tables exist, but NEVER drop anything.
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == DEMO_EMAIL).first()
        if existing:
            print(f"Demo account '{DEMO_EMAIL}' already exists — nothing to do.")
            print("All existing data was left untouched.")
            return

        print("Creating demo user (existing data untouched)...")
        user = User(
            email=DEMO_EMAIL,
            password=security.get_password_hash(DEMO_PASSWORD),
            full_name=DEMO_NAME,
            is_verified=True,
        )
        db.add(user)
        db.flush()

        seasons_and_teams = []
        for name in SEASON_NAMES:
            s = Season(name=name, coach_id=user.id)
            db.add(s)
            db.flush()
            t = Team(name=TEAM_NAME, formation=TEAM_FORMATION, coach_id=user.id, season_id=s.id)
            db.add(t)
            db.flush()
            seasons_and_teams.append((s, t))

        players = seed_players(db, user.id, seasons_and_teams)
        library = seed_libraries(db, user.id)

        player_ids   = [p.id for p in players]
        exercise_ids = [e.id for e in library["exercises"]]

        for i, (season, team) in enumerate(seasons_and_teams):
            offset = SEASON_DAY_OFFSETS[i]
            seed_training_sessions(db, team.id, season.id, player_ids, exercise_ids, day_offset=offset)
            seed_matches(db, team.id, season.id, players, day_offset=offset, season_index=i)

        db.commit()

        print("\n" + "=" * 58)
        print("  Demo account added successfully (nothing else changed).")
        print("=" * 58)
        print(f"  Email:    {DEMO_EMAIL}")
        print(f"  Password: {DEMO_PASSWORD}")
        print("=" * 58)

    except Exception as e:
        db.rollback()
        print(f"\n[ERROR] {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    run()
