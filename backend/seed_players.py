from database import SessionLocal, engine
from models import Base, Player

# Ensure tables exist
Base.metadata.create_all(bind=engine)

def seed_players():
    db = SessionLocal()
    
    players_data = [
        # --- GOALKEEPERS ---
        Player(
            first_name="Liam", last_name="Henderson",
            date_of_birth="2005-04-12", position="Goalkeeper", jersey_number=1,
            status="Active", height=188, weight=82,
            player_phone="+1 555 0101",
            image_url=""
        ),
        
        # --- DEFENDERS ---
        Player(
            first_name="Lucas", last_name="Gray",
            date_of_birth="2006-02-14", position="Defender", jersey_number=2,
            status="Active", height=178, weight=74,
            player_phone="+1 555 0102"
        ),
        Player(
            first_name="Noah", last_name="Williams",
            date_of_birth="2005-11-22", position="Defender", jersey_number=3,
            status="Active", height=180, weight=75,
            player_phone="+1 555 0103"
        ),
        Player(
            first_name="Ethan", last_name="James",
            date_of_birth="2004-08-30", position="Defender", jersey_number=4,
            status="Active", height=185, weight=79,
            player_phone="+1 555 0104"
        ),
        Player(
            first_name="Mason", last_name="Miller",
            date_of_birth="2005-01-15", position="Defender", jersey_number=5,
            status="Active", height=184, weight=78,
            player_phone="+1 555 0105"
        ),

        # --- MIDFIELDERS ---
        Player(
            first_name="Oliver", last_name="Smith",
            date_of_birth="2006-05-10", position="Midfielder", jersey_number=6,
            status="Active", height=175, weight=70,
            player_phone="+1 555 0106"
        ),
        Player(
            first_name="Jackson", last_name="White",
            date_of_birth="2005-09-05", position="Midfielder", jersey_number=7,
            status="Active", height=172, weight=68,
            player_phone="+1 555 0107"
        ),
        Player(
            first_name="Elijah", last_name="Brown",
            date_of_birth="2004-12-01", position="Midfielder", jersey_number=8,
            status="Active", height=176, weight=72,
            player_phone="+1 555 0108"
        ),
        Player(
            first_name="Aiden", last_name="Taylor",
            date_of_birth="2005-03-25", position="Midfielder", jersey_number=10,
            status="Active", height=170, weight=67,
            player_phone="+1 555 0110"
        ),

        # --- FORWARDS ---
        Player(
            first_name="Caleb", last_name="Martin",
            date_of_birth="2004-07-19", position="Forward", jersey_number=9,
            status="Active", height=182, weight=77,
            player_phone="+1 555 0109"
        ),
        Player(
            first_name="Benjamin", last_name="Lee",
            date_of_birth="2006-06-11", position="Forward", jersey_number=11,
            status="Active", height=174, weight=69,
            player_phone="+1 555 0111"
        ),

        # --- SUBSTITUTES / OTHERS ---
        Player(
            first_name="Daniel", last_name="Garcia",
            date_of_birth="2007-01-08", position="Forward", jersey_number=12,
            status="Injured", height=179, weight=73, # Set to Injured to test filter
            player_phone="+1 555 0112"
        ),
    ]

    try:
        print("Adding 12 Players...")
        db.add_all(players_data)
        db.commit()
        print("Players added successfully!")
    except Exception as e:
        print(f"Error seeding players: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_players()