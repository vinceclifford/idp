from database import SessionLocal, engine
from models import Base, Match
import datetime

# Ensure tables exist
Base.metadata.create_all(bind=engine)

def seed_past_matches():
    db = SessionLocal()
    
    # Create a past match (3 days ago)
    past_date = datetime.date.today() - datetime.timedelta(days=3)
    
    past_match = Match(
        opponent="City Rovers FC",
        date=past_date,
        time="15:00",
        location="Home",
        formation="4-4-2",
        lineup=None  # You can add lineup data later after viewing
    )
    
    try:
        print(f"Adding past match from {past_date}...")
        db.add(past_match)
        db.commit()
        print(f"Past match created for {past_date} vs City Rovers FC!")
    except Exception as e:
        print(f"Error seeding past match: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_past_matches()
