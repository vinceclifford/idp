import database
from sqlalchemy import text

def run_migration():
    with database.engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE"))
            conn.execute(text("ALTER TABLE users ADD COLUMN verification_token VARCHAR"))
            conn.execute(text("ALTER TABLE users ADD COLUMN verification_token_expires TIMESTAMP"))
        except Exception as e:
            print("Could not add columns (might already exist):", e)
            
        try:
            conn.execute(text("UPDATE users SET is_verified = TRUE"))
            conn.commit()
            print("Successfully updated existing users to be verified.")
        except Exception as e:
            print("Could not update users:", e)
            conn.rollback()

if __name__ == "__main__":
    run_migration()
