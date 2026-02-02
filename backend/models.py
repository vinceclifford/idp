from sqlalchemy import Column, String, Integer, Text, Boolean, Date, Time, ForeignKey
from database import Base
import uuid
import datetime 

def generate_uuid():
    return str(uuid.uuid4())

# --- 1. AUTH & TEAMS ---
class Team(Base):
    __tablename__ = "teams"
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String)
    formation = Column(String) 
    created_at = Column(Date, default=datetime.date.today)

class Player(Base):
    __tablename__ = "players"
    id = Column(String, primary_key=True, default=generate_uuid)
    first_name = Column(String)
    last_name = Column(String)
    date_of_birth = Column(String) 
    position = Column(String) 
    jersey_number = Column(Integer)
    status = Column(String, default="Active")
    
    # Contact & Personal
    player_phone = Column(String, nullable=True)
    
    # CHANGED: String -> Text (Crucial for Base64 images)
    image_url = Column(Text, nullable=True) 
    
    # Physical
    height = Column(Integer, default=0) 
    weight = Column(Integer, default=0) 
    
    # Parents
    mother_name = Column(String, nullable=True)
    mother_phone = Column(String, nullable=True)
    father_name = Column(String, nullable=True)
    father_phone = Column(String, nullable=True)
    
    # Stats
    attendance = Column(Integer, default=0)
    performance = Column(Integer, default=0)
    
# --- 2. LIBRARIES ---
class Basic(Base):
    __tablename__ = "basics"
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String)
    description = Column(Text)
    
    # CHANGED: String -> Text
    diagram_url = Column(Text, nullable=True) 

class Principle(Base):
    __tablename__ = "principles"
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String)
    game_phase = Column(String)
    description = Column(Text)
    coaching_notes = Column(Text, nullable=True)      
    implementation_tips = Column(Text, nullable=True) 
    
    # CHANGED: String -> Text
    media_url = Column(Text, nullable=True)  

class Tactic(Base):
    __tablename__ = "tactics"
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String)
    formation = Column(String)
    description = Column(Text)
    
    # CHANGED: String -> Text
    diagram_url = Column(Text, nullable=True)       
    
    suggested_drills = Column(Text, nullable=True)    

# --- 3. EXERCISES ---
class Exercise(Base):
    __tablename__ = "exercises"
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String)
    intensity = Column(String)
    description = Column(Text)
    setup = Column(Text, nullable=True)
    variations = Column(Text, nullable=True)
    coaching_points = Column(Text, nullable=True)
    goalkeepers = Column(Integer, default=0) 
    equipment = Column(Text, nullable=True) 
    
    # CHANGED: String -> Text
    media_url = Column(Text, nullable=True)
    
    linked_basics = Column(Text, nullable=True)
    linked_principles = Column(Text, nullable=True)
    linked_tactics = Column(Text, nullable=True)

class TrainingSession(Base):
    __tablename__ = "training_sessions"
    id = Column(String, primary_key=True, default=generate_uuid)
    date = Column(Date)
    start_time = Column(String) 
    end_time = Column(String)   
    focus = Column(String)
    intensity = Column(String)
    
    selected_players = Column(Text)   
    selected_exercises = Column(Text)    

class Match(Base):
    __tablename__ = "matches"
    id = Column(String, primary_key=True, default=generate_uuid)
    opponent = Column(String)
    date = Column(Date)
    time = Column(String)
    location = Column(String)
    formation = Column(String, default="4-4-2")
    
    # Ensure this is Text if you added it earlier
    lineup = Column(Text, nullable=True)



# --- 1. AUTH & TEAMS --- 
class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True)
    password = Column(String) 
    full_name = Column(String, nullable=True)
    created_at = Column(Date, default=datetime.date.today)