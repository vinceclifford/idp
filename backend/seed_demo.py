"""
Master demo seed script for the presentation.

Wipes the entire database, recreates all tables, then seeds a single
pre-verified user with a fully populated account across three seasons.

Usage:
    cd backend
    python seed_demo.py

Demo credentials:
    Email:    demo@coachhub.com
    Password: Demo1234!
"""

import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from database import SessionLocal, engine
from models import Base, User, Team, Season

import security

from seed_players       import seed_players
from seed_libraries     import seed_libraries
from seed_past_matches  import seed_training_sessions, seed_matches

# -- Demo account --------------------------------------------------------------
DEMO_EMAIL    = "demo@coachhub.com"
DEMO_PASSWORD = "Demo1234!"
DEMO_NAME     = "Alex Johnson"

TEAM_NAME      = "City FC U19"
TEAM_FORMATION = "4-3-3"

# Seasons ordered oldest -> newest. The last one is the "active" season.
SEASON_NAMES = [
    "2023/2024 Season",
    "2024/2025 Season",
    "2025/2026 Season",
]

# Each season's data is shifted back by this many days so they don't overlap.
# Oldest season is shifted back ~2 years, middle ~1 year, current = 0.
SEASON_DAY_OFFSETS = [730, 365, 0]


def run():
    # 1. Wipe and recreate all tables
    print("\n[1/6] Resetting database...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("  Database reset complete.")

    db = SessionLocal()
    try:
        # 2. Create demo user (pre-verified)
        print("\n[2/6] Creating demo user...")
        user = User(
            email=DEMO_EMAIL,
            password=security.get_password_hash(DEMO_PASSWORD),
            full_name=DEMO_NAME,
            is_verified=True,
        )
        db.add(user)
        db.flush()
        print(f"  User: {DEMO_EMAIL}")

        # 3. Create seasons and teams
        print("\n[3/6] Creating seasons and teams...")
        seasons_and_teams = []
        for name in SEASON_NAMES:
            s = Season(name=name, coach_id=user.id)
            db.add(s)
            db.flush()
            
            t = Team(name=TEAM_NAME, formation=TEAM_FORMATION, coach_id=user.id, season_id=s.id)
            db.add(t)
            db.flush()
            
            seasons_and_teams.append((s, t))
            print(f"  Created: {s.name} -> {t.name}")

        # 4. Seed players (one set of players, assigned to each seasonal team)
        print("\n[4/6] Seeding players...")
        players = seed_players(db, user.id, seasons_and_teams)

        # 5. Seed library content (shared across all seasons)
        print("\n[5/6] Seeding library (basics, principles, tactics, exercises)...")
        library = seed_libraries(db, user.id)

        # 6. Seed training sessions + matches per season
        print("\n[6/6] Seeding training sessions and matches...")
        player_ids   = [p.id for p in players]
        exercise_ids = [e.id for e in library["exercises"]]

        total_sessions = 0
        total_matches  = 0

        for i, (season, team) in enumerate(seasons_and_teams):
            offset = SEASON_DAY_OFFSETS[i]
            print(f"\n  -- {season.name} (day offset: {offset}) --")
            s_list = seed_training_sessions(db, team.id, season.id, player_ids, exercise_ids, day_offset=offset)
            m_list = seed_matches(db, team.id, season.id, players, day_offset=offset, season_index=i)
            total_sessions += len(s_list)
            total_matches  += len(m_list)

        db.commit()

        # -- Summary -----------------------------------------------------------
        print("\n" + "=" * 58)
        print("  Demo database seeded successfully!")
        print("=" * 58)
        print(f"  Email:      {DEMO_EMAIL}")
        print(f"  Password:   {DEMO_PASSWORD}")
        print(f"  Seasons:    {len(seasons_and_teams)}  ({', '.join(s.name for s, t in seasons_and_teams)})")
        print(f"  Players:    {len(players)}")
        print(f"  Basics:     {len(library['basics'])}")
        print(f"  Principles: {len(library['principles'])}  (all 5 game phases)")
        print(f"  Tactics:    {len(library['tactics'])}")
        print(f"  Exercises:  {len(library['exercises'])}")
        print(f"  Sessions:   {total_sessions}  (across all seasons)")
        print(f"  Matches:    {total_matches}   (across all seasons)")
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
