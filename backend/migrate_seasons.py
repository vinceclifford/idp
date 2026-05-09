import database
from sqlalchemy import text
import uuid

def run_migration():
    with database.engine.connect() as conn:
        # Create seasons table
        try:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS seasons (
                    id VARCHAR PRIMARY KEY,
                    coach_id VARCHAR REFERENCES users(id),
                    name VARCHAR,
                    created_at DATE
                )
            """))
            conn.commit()
        except Exception as e:
            conn.rollback()
            print("Seasons table creation error:", e)

        # Add nullable columns
        try:
            conn.execute(text("ALTER TABLE matches ADD COLUMN IF NOT EXISTS season_id VARCHAR"))
            conn.execute(text("ALTER TABLE training_sessions ADD COLUMN IF NOT EXISTS season_id VARCHAR"))
            conn.execute(text("ALTER TABLE team_players ADD COLUMN IF NOT EXISTS season_id VARCHAR"))
            conn.commit()
        except Exception as e:
            conn.rollback()
            print("Add columns error:", e)

        try:
            # Seed default seasons for each user
            users = conn.execute(text("SELECT id FROM users")).fetchall()
            for user in users:
                user_id = user[0]
                existing = conn.execute(text("SELECT id FROM seasons WHERE coach_id = :uid LIMIT 1"), {"uid": user_id}).fetchone()
                if not existing:
                    season_id = str(uuid.uuid4())
                    conn.execute(text("INSERT INTO seasons (id, coach_id, name, created_at) VALUES (:sid, :uid, '2024/2025', CURRENT_DATE)"), {"sid": season_id, "uid": user_id})
                else:
                    season_id = existing[0]
                    
                # Update records
                conn.execute(text("""
                    UPDATE matches SET season_id = :sid 
                    WHERE team_id IN (SELECT id FROM teams WHERE coach_id = :uid) AND season_id IS NULL
                """), {"sid": season_id, "uid": user_id})
                
                conn.execute(text("""
                    UPDATE training_sessions SET season_id = :sid 
                    WHERE team_id IN (SELECT id FROM teams WHERE coach_id = :uid) AND season_id IS NULL
                """), {"sid": season_id, "uid": user_id})
                
                conn.execute(text("""
                    UPDATE team_players SET season_id = :sid 
                    WHERE team_id IN (SELECT id FROM teams WHERE coach_id = :uid) AND season_id IS NULL
                """), {"sid": season_id, "uid": user_id})
            
            conn.commit()
            print("Successfully seeded data.")
            
        except Exception as e:
            print("Error during data seeding:", e)
            conn.rollback()

        # Add constraints and update PK
        try:
            conn.execute(text("ALTER TABLE team_players ALTER COLUMN season_id SET NOT NULL"))
            conn.execute(text("ALTER TABLE team_players ADD CONSTRAINT team_players_season_id_fkey FOREIGN KEY (season_id) REFERENCES seasons(id)"))
            conn.execute(text("ALTER TABLE team_players DROP CONSTRAINT IF EXISTS team_players_pkey"))
            conn.execute(text("ALTER TABLE team_players ADD PRIMARY KEY (team_id, player_id, season_id)"))
            
            conn.execute(text("ALTER TABLE matches ADD CONSTRAINT matches_season_id_fkey FOREIGN KEY (season_id) REFERENCES seasons(id)"))
            conn.execute(text("ALTER TABLE training_sessions ADD CONSTRAINT training_sessions_season_id_fkey FOREIGN KEY (season_id) REFERENCES seasons(id)"))
            conn.commit()
            print("Successfully added constraints.")
        except Exception as e:
            conn.rollback()
            print("Constraint adding error:", e)

if __name__ == "__main__":
    run_migration()
