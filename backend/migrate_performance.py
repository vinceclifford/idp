from sqlalchemy import create_engine, text
import sys

try:
    engine = create_engine('postgresql://vincentclifford@localhost/football_db')
    with engine.connect() as conn:
        conn.execute(text('ALTER TABLE team_players ADD COLUMN IF NOT EXISTS performance INTEGER DEFAULT 0'))
        conn.commit()
    print("Migration successful: added performance column to team_players")
except Exception as e:
    print(f"Migration failed: {e}")
    sys.exit(1)
