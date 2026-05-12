"""
Seed script: Players

Exports seed_players(db, coach_id, seasons_and_teams) -> list[Player]
  seasons_and_teams: list of (Season, Team) tuples.

Can also be run standalone (requires demo user + team + seasons to exist):
    cd backend
    python seed_players.py
"""

import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from database import SessionLocal, engine
from models import Base, User, Team, Season, Player, TeamPlayer

Base.metadata.create_all(bind=engine)

DEMO_EMAIL = "demo@coachhub.com"

# jersey_number -> (base_performance, progression_per_season)
# Performance is 0–9. Base is the earliest season; each later season adds progression.
PLAYER_PERF = {
    1:  (6, 1),   # GK Liam Henderson
    16: (4, 1),   # GK Thomas Roberts
    2:  (5, 1),   # RB Lucas Gray
    3:  (7, 0),   # LB Mason Miller
    4:  (6, 1),   # CB Ethan James
    5:  (7, 1),   # CB Noah Williams
    15: (4, 1),   # CB Samuel Clarke
    6:  (5, 1),   # CM Oliver Smith
    7:  (7, 1),   # CM Elijah Brown
    8:  (6, 1),   # CM Jackson White
    10: (5, 1),   # CM Aiden Taylor
    14: (4, 1),   # CM James Wilson
    9:  (8, 1),   # ST Caleb Martin
    11: (7, 1),   # FW Benjamin Lee
    12: (5, 1),   # FW Daniel Garcia
    13: (6, 0),   # FW Harry Evans (injured, no progression)
}


def seed_players(db, coach_id: str, seasons_and_teams: list) -> list:
    """
    Create all players and assign them to the correct seasonal team for each season.
    seasons_and_teams should be ordered oldest -> newest.
    """
    players_raw = [
        # Goalkeepers
        dict(first_name="Liam",     last_name="Henderson", date_of_birth="2006-04-12", position="Goalkeeper", jersey_number=1,  status="Active",  height=188, weight=82,  player_phone="+44 7700 900001", attendance=92),
        dict(first_name="Thomas",   last_name="Roberts",   date_of_birth="2007-08-28", position="Goalkeeper", jersey_number=16, status="Active",  height=186, weight=80,  player_phone="+44 7700 900016", attendance=88),
        # Defenders
        dict(first_name="Lucas",    last_name="Gray",      date_of_birth="2007-02-14", position="Defender",   jersey_number=2,  status="Active",  height=178, weight=74,  player_phone="+44 7700 900002", attendance=90),
        dict(first_name="Mason",    last_name="Miller",    date_of_birth="2006-01-15", position="Defender",   jersey_number=3,  status="Active",  height=180, weight=75,  player_phone="+44 7700 900003", attendance=95),
        dict(first_name="Ethan",    last_name="James",     date_of_birth="2005-08-30", position="Defender",   jersey_number=4,  status="Active",  height=185, weight=79,  player_phone="+44 7700 900004", attendance=87),
        dict(first_name="Noah",     last_name="Williams",  date_of_birth="2006-11-22", position="Defender",   jersey_number=5,  status="Active",  height=182, weight=76,  player_phone="+44 7700 900005", attendance=93),
        dict(first_name="Samuel",   last_name="Clarke",    date_of_birth="2007-03-17", position="Defender",   jersey_number=15, status="Active",  height=183, weight=78,  player_phone="+44 7700 900015", attendance=85),
        # Midfielders
        dict(first_name="Oliver",   last_name="Smith",     date_of_birth="2007-05-10", position="Midfielder", jersey_number=6,  status="Active",  height=175, weight=70,  player_phone="+44 7700 900006", attendance=91),
        dict(first_name="Elijah",   last_name="Brown",     date_of_birth="2005-12-01", position="Midfielder", jersey_number=7,  status="Active",  height=176, weight=72,  player_phone="+44 7700 900007", attendance=96),
        dict(first_name="Jackson",  last_name="White",     date_of_birth="2006-09-05", position="Midfielder", jersey_number=8,  status="Active",  height=172, weight=68,  player_phone="+44 7700 900008", attendance=89),
        dict(first_name="Aiden",    last_name="Taylor",    date_of_birth="2006-03-25", position="Midfielder", jersey_number=10, status="Active",  height=170, weight=67,  player_phone="+44 7700 900010", attendance=94),
        dict(first_name="James",    last_name="Wilson",    date_of_birth="2006-07-22", position="Midfielder", jersey_number=14, status="Active",  height=173, weight=71,  player_phone="+44 7700 900014", attendance=82),
        # Forwards
        dict(first_name="Caleb",    last_name="Martin",    date_of_birth="2005-07-19", position="Forward",    jersey_number=9,  status="Active",  height=182, weight=77,  player_phone="+44 7700 900009", attendance=97),
        dict(first_name="Benjamin", last_name="Lee",       date_of_birth="2007-06-11", position="Forward",    jersey_number=11, status="Active",  height=174, weight=69,  player_phone="+44 7700 900011", attendance=90),
        dict(first_name="Daniel",   last_name="Garcia",    date_of_birth="2007-01-08", position="Forward",    jersey_number=12, status="Active",  height=179, weight=73,  player_phone="+44 7700 900012", attendance=86),
        dict(first_name="Harry",    last_name="Evans",     date_of_birth="2005-10-09", position="Forward",    jersey_number=13, status="Injured", height=177, weight=72,  player_phone="+44 7700 900013", attendance=70),
    ]

    players = []
    for pd in players_raw:
        p = Player(
            first_name=pd["first_name"],
            last_name=pd["last_name"],
            date_of_birth=pd["date_of_birth"],
            position=pd["position"],
            jersey_number=pd["jersey_number"],
            status=pd["status"],
            height=pd["height"],
            weight=pd["weight"],
            player_phone=pd["player_phone"],
            attendance=pd["attendance"],
            coach_id=coach_id,
        )
        db.add(p)
        db.flush()

        base_perf, step = PLAYER_PERF.get(pd["jersey_number"], (5, 0))
        for i, (season, team) in enumerate(seasons_and_teams):
            perf = min(9, base_perf + step * i)
            db.add(TeamPlayer(team_id=team.id, player_id=p.id, season_id=season.id, performance=perf))

        players.append(p)

    db.flush()
    print(f"  Players seeded: {len(players)} across {len(seasons_and_teams)} season(s)")
    return players


if __name__ == "__main__":
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == DEMO_EMAIL).first()
        if not user:
            print(f"Demo user '{DEMO_EMAIL}' not found. Run seed_demo.py first.")
        else:
            teams = db.query(Team).filter(Team.coach_id == user.id).all()
            seasons = db.query(Season).filter(Season.coach_id == user.id).order_by(Season.created_at).all()
            if not teams or not seasons:
                print("Teams or seasons not found. Run seed_demo.py first.")
            else:
                # Reconstruct seasons_and_teams mapping by matching team.season_id
                st_mapping = []
                for s in seasons:
                    t = next((team for team in teams if team.season_id == s.id), None)
                    if t: st_mapping.append((s, t))
                
                seed_players(db, user.id, st_mapping)
                db.commit()
                print("Done.")
    finally:
        db.close()
