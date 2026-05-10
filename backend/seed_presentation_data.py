import models, database, datetime
from sqlalchemy.orm import Session

def seed_presentation_data():
    db: Session = next(database.get_db())
    
    admin = db.query(models.User).filter(models.User.email == "admin@coachhub.com").first()
    if not admin:
        print("Admin user not found. Run seed_user.py first.")
        return

    # 1. Create Season
    season = models.Season(
        name="2025/26 Season",
        coach_id=admin.id
    )
    db.add(season)
    db.commit()
    db.refresh(season)
    print(f"Created season: {season.name}")

    # 2. Create Team
    team = models.Team(
        name="Academy U21",
        formation="4-3-3",
        coach_id=admin.id
    )
    db.add(team)
    db.commit()
    db.refresh(team)
    print(f"Created team: {team.name}")

    # 3. Assign players to Team
    players = db.query(models.Player).filter(models.Player.coach_id == admin.id).all()
    for player in players:
        assignment = models.TeamPlayer(
            team_id=team.id,
            player_id=player.id,
            season_id=season.id
        )
        db.add(assignment)
    
    db.commit()
    print(f"Assigned {len(players)} players to team {team.name}")

    # 4. Create a past match
    past_date = datetime.date.today() - datetime.timedelta(days=3)
    match = models.Match(
        team_id=team.id,
        season_id=season.id,
        opponent="City Rovers FC",
        date=past_date,
        time="15:00",
        location="Home",
        formation="4-3-3",
        goals_for=2,
        goals_against=1,
        notes="Solid performance. Good control in midfield."
    )
    db.add(match)
    
    # 5. Create an upcoming match
    future_date = datetime.date.today() + datetime.timedelta(days=4)
    upcoming_match = models.Match(
        team_id=team.id,
        season_id=season.id,
        opponent="United Stars",
        date=future_date,
        time="11:00",
        location="Away",
        formation="4-3-3"
    )
    db.add(upcoming_match)
    
    db.commit()
    print("Created past and upcoming matches")

if __name__ == "__main__":
    seed_presentation_data()
