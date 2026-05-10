from sqlalchemy import create_engine, text
import os
from database import SQLALCHEMY_DATABASE_URL

def migrate():
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    
    print(f"Migrating database at {SQLALCHEMY_DATABASE_URL}...")
    
    with engine.connect() as conn:
        print("Migrating matches table...")
        # Add columns if they don't exist
        for col, col_type in [("goals_for", "INTEGER DEFAULT 0"), ("goals_against", "INTEGER DEFAULT 0"), ("notes", "TEXT")]:
            try:
                conn.execute(text(f"ALTER TABLE matches ADD COLUMN {col} {col_type}"))
                conn.commit()
                print(f"Column {col} added.")
            except Exception as e:
                print(f"Skipping {col}: {e}")

        print("Creating match_events table...")
        try:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS match_events (
                    id TEXT PRIMARY KEY,
                    match_id TEXT NOT NULL REFERENCES matches(id),
                    player_id TEXT NOT NULL REFERENCES players(id),
                    event_type TEXT NOT NULL,
                    minute INTEGER
                )
            """))
            conn.commit()
            print("match_events table created.")
        except Exception as e:
            print(f"Error creating match_events: {e}")

    print("Migration complete.")

if __name__ == "__main__":
    migrate()
