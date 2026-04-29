# backend/migrate_db.py
from sqlalchemy import text
from database import engine

def migrate():
    """Manually add password reset columns to the users table."""
    print("Running database migration...")
    
    commands = [
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR;",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP;"
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
