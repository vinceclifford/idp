import sys
import os

# Add backend directory to sys.path to import local modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '.')))

from database import engine, Base
import models

def run_migration():
    try:
        print("Creating custom_formations table if it doesn't exist...")
        # This will create all tables defined in models.py that don't exist yet
        Base.metadata.create_all(bind=engine)
        print("Migration successful: custom_formations table checked/created.")
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    run_migration()
