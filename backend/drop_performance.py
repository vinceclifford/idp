from sqlalchemy import create_engine, text
import sys

try:
    engine = create_engine('postgresql://vincentclifford@localhost/football_db')
    with engine.connect() as conn:
        conn.execute(text('ALTER TABLE players DROP COLUMN IF EXISTS performance'))
        conn.commit()
    print("Migration successful: dropped performance column from players table")
except Exception as e:
    print(f"Migration failed: {e}")
    sys.exit(1)
