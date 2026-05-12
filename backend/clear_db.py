"""
Drops all tables and recreates them (completely empty database).

Usage:
    cd backend
    python clear_db.py
"""

import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from database import engine
from models import Base

def clear():
    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("Recreating all tables...")
    Base.metadata.create_all(bind=engine)
    print("Database is now empty and ready.")

if __name__ == "__main__":
    confirm = input("This will DELETE ALL DATA. Type 'yes' to continue: ").strip().lower()
    if confirm == "yes":
        clear()
    else:
        print("Aborted.")
