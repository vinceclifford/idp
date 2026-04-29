from sqlalchemy import text
from database import engine
import models

def migrate():
    print("Running database migration v2...")
    
    # 1. Create team_players if not exists
    models.Base.metadata.create_all(bind=engine) # This creates missing tables like team_players
    
    # 2. Add columns to existing tables
    commands = [
        "ALTER TABLE teams ADD COLUMN IF NOT EXISTS coach_id VARCHAR REFERENCES users(id);",
        "ALTER TABLE players ADD COLUMN IF NOT EXISTS coach_id VARCHAR REFERENCES users(id);",
        "ALTER TABLE basics ADD COLUMN IF NOT EXISTS coach_id VARCHAR REFERENCES users(id);",
        "ALTER TABLE principles ADD COLUMN IF NOT EXISTS coach_id VARCHAR REFERENCES users(id);",
        "ALTER TABLE tactics ADD COLUMN IF NOT EXISTS coach_id VARCHAR REFERENCES users(id);",
        "ALTER TABLE exercises ADD COLUMN IF NOT EXISTS coach_id VARCHAR REFERENCES users(id);",
        "ALTER TABLE training_sessions ADD COLUMN IF NOT EXISTS team_id VARCHAR REFERENCES teams(id);",
        "ALTER TABLE matches ADD COLUMN IF NOT EXISTS team_id VARCHAR REFERENCES teams(id);"
    ]
    
    with engine.connect() as conn:
        for cmd in commands:
            try:
                print(f"Executing: {cmd}")
                conn.execute(text(cmd))
                conn.commit()
            except Exception as e:
                print(f"Error executing {cmd}: {e}")
                
    print("Migration complete!")

if __name__ == "__main__":
    migrate()
