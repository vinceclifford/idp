from datetime import datetime
from datetime import timedelta
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import models, schemas, database
import uuid, os, shutil

models.Base.metadata.create_all(bind=database.engine)

# Ensure uploads directory exists (relative to repo root, where uvicorn is launched)
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "static", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files as static assets
app.mount("/static", StaticFiles(directory=os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "static")), name="static")

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Save an uploaded file to disk and return its public URL path."""
    ext = os.path.splitext(file.filename or "")[1].lower()
    filename = f"{uuid.uuid4()}{ext}"
    dest = os.path.join(UPLOAD_DIR, filename)
    with open(dest, "wb") as f:
        shutil.copyfileobj(file.file, f)
    return {"url": f"/static/uploads/{filename}"}

# --- GET ALL ---
@app.get("/exercises")
def get_exercises(db: Session = Depends(database.get_db)):
    return db.query(models.Exercise).all()

# --- CREATE ---
@app.post("/exercises", response_model=schemas.Exercise)
def create_exercise(item: schemas.ExerciseCreate, db: Session = Depends(database.get_db)):
    db_item = models.Exercise(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

# --- UPDATE (Fixing the 500 Error here) ---
@app.put("/exercises/{exercise_id}", response_model=schemas.Exercise)
def update_exercise(exercise_id: str, item: schemas.ExerciseCreate, db: Session = Depends(database.get_db)):
    db_ex = db.query(models.Exercise).filter(models.Exercise.id == exercise_id).first()
    if not db_ex:
        raise HTTPException(status_code=404, detail="Exercise not found")
    
    # Manually update fields to ensure safety
    db_ex.name = item.name
    db_ex.description = item.description
    db_ex.intensity = item.intensity
    db_ex.setup = item.setup
    db_ex.variations = item.variations
    db_ex.coaching_points = item.coaching_points
    db_ex.goalkeepers = item.goalkeepers
    db_ex.equipment = item.equipment
    db_ex.linked_basics = item.linked_basics
    db_ex.linked_principles = item.linked_principles
    db_ex.linked_tactics = item.linked_tactics
    db_ex.media_url = item.media_url

    db.commit()
    db.refresh(db_ex)
    return db_ex

# --- DELETE ---
@app.delete("/exercises/{exercise_id}")
def delete_exercise(exercise_id: str, db: Session = Depends(database.get_db)):
    db_ex = db.query(models.Exercise).filter(models.Exercise.id == exercise_id).first()
    if not db_ex:
        raise HTTPException(status_code=404, detail="Exercise not found")
    
    db.delete(db_ex)
    db.commit()
    return {"message": "Deleted"}

# ==========================
#      BASICS LIBRARY
# ==========================
@app.get("/basics")
def get_basics(db: Session = Depends(database.get_db)):
    return db.query(models.Basic).all()

@app.post("/basics")
def create_basic(item: schemas.BasicCreate, db: Session = Depends(database.get_db)):
    db_item = models.Basic(
        name=item.name, 
        description=item.description,
        diagram_url=item.diagram_url
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.put("/basics/{id}")
def update_basic(id: str, item: schemas.BasicCreate, db: Session = Depends(database.get_db)):
    db_item = db.query(models.Basic).filter(models.Basic.id == id).first()
    if not db_item: raise HTTPException(status_code=404, detail="Item not found")
    
    db_item.name = item.name
    db_item.description = item.description
    db_item.diagram_url = item.diagram_url
    
    db.commit()
    db.refresh(db_item) # <--- THIS LINE ENSURES INSTANT UPDATES
    return db_item

@app.delete("/basics/{id}")
def delete_basic(id: str, db: Session = Depends(database.get_db)):
    db_item = db.query(models.Basic).filter(models.Basic.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(db_item)
    db.commit()
    return {"message": "Deleted"}


# ==========================
#    PRINCIPLES LIBRARY
# ==========================
@app.get("/principles")
def get_principles(db: Session = Depends(database.get_db)):
    return db.query(models.Principle).all()

@app.post("/principles")
def create_principle(item: schemas.PrincipleCreate, db: Session = Depends(database.get_db)):
    db_item = models.Principle(
        name=item.name, 
        game_phase=item.game_phase, 
        description=item.description,
        coaching_notes=item.coaching_notes,
        implementation_tips=item.implementation_tips,
        media_url=item.media_url # <-- Added
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.put("/principles/{id}")
def update_principle(id: str, item: schemas.PrincipleCreate, db: Session = Depends(database.get_db)):
    db_item = db.query(models.Principle).filter(models.Principle.id == id).first()
    if not db_item: raise HTTPException(status_code=404)
    
    db_item.name = item.name
    db_item.game_phase = item.game_phase
    db_item.description = item.description
    db_item.coaching_notes = item.coaching_notes
    db_item.implementation_tips = item.implementation_tips
    db_item.media_url = item.media_url # <-- Added
    
    db.commit()
    db.refresh(db_item) # This ensures we get the updated object back
    return db_item

@app.delete("/principles/{id}")
def delete_principle(id: str, db: Session = Depends(database.get_db)):
    db_item = db.query(models.Principle).filter(models.Principle.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(db_item)
    db.commit()
    return {"message": "Deleted"}


# ==========================
#     TACTICS LIBRARY
# ==========================
@app.get("/tactics")
def get_tactics(db: Session = Depends(database.get_db)):
    return db.query(models.Tactic).all()

@app.post("/tactics")
def create_tactic(item: schemas.TacticCreate, db: Session = Depends(database.get_db)):
    db_item = models.Tactic(
        name=item.name, 
        formation=item.formation, 
        description=item.description,
        diagram_url=item.diagram_url,
        suggested_drills=item.suggested_drills
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

# --- TACTICS UPDATE ---
@app.put("/tactics/{id}")
def update_tactic(id: str, item: schemas.TacticCreate, db: Session = Depends(database.get_db)):
    db_item = db.query(models.Tactic).filter(models.Tactic.id == id).first()
    if not db_item: raise HTTPException(status_code=404, detail="Item not found")
    
    db_item.name = item.name
    db_item.formation = item.formation
    db_item.description = item.description
    db_item.diagram_url = item.diagram_url
    db_item.suggested_drills = item.suggested_drills
    
    db.commit()
    db.refresh(db_item) # <--- THIS LINE ENSURES INSTANT UPDATES
    return db_item

@app.delete("/tactics/{id}")
def delete_tactic(id: str, db: Session = Depends(database.get_db)):
    db_item = db.query(models.Tactic).filter(models.Tactic.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(db_item)
    db.commit()
    return {"message": "Deleted"}



# ==========================
#    TRAINING SESSIONS
# ==========================
@app.get("/training_sessions")
def get_sessions(db: Session = Depends(database.get_db)):
    return db.query(models.TrainingSession).all()

@app.post("/training_sessions")
def create_session(item: schemas.TrainingSessionCreate, db: Session = Depends(database.get_db)):
    # Convert string date to Python Date object if needed, or keep as string/date in model
    import datetime
    date_obj = datetime.datetime.strptime(item.date, "%Y-%m-%d").date()
    
    db_item = models.TrainingSession(
        date=date_obj,
        start_time=item.start_time,
        end_time=item.end_time,
        focus=item.focus,
        intensity=item.intensity,
        selected_players=item.selected_players,
        selected_exercises=item.selected_exercises
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.put("/training_sessions/{id}")
def update_session(id: str, item: schemas.TrainingSessionCreate, db: Session = Depends(database.get_db)):
    db_item = db.query(models.TrainingSession).filter(models.TrainingSession.id == id).first()
    if not db_item: raise HTTPException(status_code=404, detail="Session not found")
    
    # Parse date again
    import datetime
    date_obj = datetime.datetime.strptime(item.date, "%Y-%m-%d").date()

    db_item.date = date_obj
    db_item.start_time = item.start_time
    db_item.end_time = item.end_time
    db_item.focus = item.focus
    db_item.intensity = item.intensity
    db_item.selected_players = item.selected_players
    db_item.selected_exercises = item.selected_exercises
    
    db.commit()
    db.refresh(db_item)
    return db_item

@app.delete("/training_sessions/{id}")
def delete_session(id: str, db: Session = Depends(database.get_db)):
    db_item = db.query(models.TrainingSession).filter(models.TrainingSession.id == id).first()
    if not db_item: raise HTTPException(status_code=404)
    db.delete(db_item)
    db.commit()
    return {"message": "Deleted"}

# ==========================
#    PLAYERS (Helper)
# ==========================
# We need this to populate the "Available Players" list in the Training Modal
# ==========================
#    PLAYERS
# ==========================
@app.get("/players")
def get_players(db: Session = Depends(database.get_db)):
    return db.query(models.Player).all()

@app.post("/players")
def create_player(item: schemas.PlayerCreate, db: Session = Depends(database.get_db)):
    db_item = models.Player(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.put("/players/{id}")
def update_player(id: str, item: schemas.PlayerCreate, db: Session = Depends(database.get_db)):
    db_item = db.query(models.Player).filter(models.Player.id == id).first()
    if not db_item: raise HTTPException(status_code=404)
    
    for key, value in item.dict().items():
        setattr(db_item, key, value)
    
    db.commit()
    db.refresh(db_item)
    return db_item

@app.delete("/players/{id}")
def delete_player(id: str, db: Session = Depends(database.get_db)):
    db_item = db.query(models.Player).filter(models.Player.id == id).first()
    if not db_item: raise HTTPException(status_code=404)
    db.delete(db_item)
    db.commit()
    return {"message": "Deleted"}


@app.get("/match/suggested-formation")
def get_suggested_formation(db: Session = Depends(database.get_db)):
    # 1. Calculate date for 7 days ago
    seven_days_ago = datetime.now().date() - timedelta(days=7)
    
    # 2. Get sessions from the last week, ordered by date (newest first)
    sessions = db.query(models.TrainingSession)\
        .filter(models.TrainingSession.date >= seven_days_ago)\
        .order_by(models.TrainingSession.date.desc())\
        .all()
    
    # 3. Iterate through sessions to find a formation
    for session in sessions:
        if not session.selected_exercises:
            continue
            
        # These are IDs coming from the frontend, so let's call them exercise_ids
        exercise_ids = [x.strip() for x in session.selected_exercises.split(',') if x.strip()]
        
        # FIX: Query using .id instead of .name
        exercises = db.query(models.Exercise).filter(models.Exercise.id.in_(exercise_ids)).all()
        
        for exercise in exercises:
            if exercise.linked_tactics:
                # Tactics are likely stored by Name inside the Exercise object (based on your frontend logic)
                tactic_names = [t.strip() for t in exercise.linked_tactics.split(',') if t.strip()]
                
                # Fetch tactics by NAME
                tactic = db.query(models.Tactic).filter(models.Tactic.name.in_(tactic_names)).first()
                
                if tactic and tactic.formation:
                    return {
                        "formation": tactic.formation, 
                        "source": f"Based on {session.date} training ({exercise.name})"
                    }

    # 4. Fallback if no formation is found
    return {"formation": "4-4-2", "source": "Default"}


# ==========================
#      MATCH MANAGEMENT
# ==========================
@app.post("/matches", response_model=schemas.Match)
def create_match(item: schemas.MatchCreate, db: Session = Depends(database.get_db)):
    import datetime
    date_obj = datetime.datetime.strptime(item.date, "%Y-%m-%d").date()
    
    db_item = models.Match(
        opponent=item.opponent,
        date=date_obj,
        time=item.time,
        location=item.location,
        formation=item.formation,
        lineup=item.lineup # <--- Add this
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.get("/matches")
def get_all_matches(db: Session = Depends(database.get_db)):
    # Return all matches (both past and upcoming), sorted by date descending (newest first)
    return db.query(models.Match)\
        .order_by(models.Match.date.desc())\
        .all()

@app.get("/matches/latest")
def get_latest_match(db: Session = Depends(database.get_db)):
    # Get the upcoming match (closest to today or just the last created)
    # For simplicity, we get the most recently created match
    import datetime
    today = datetime.date.today()
    
    match = db.query(models.Match)\
        .filter(models.Match.date >= today)\
        .order_by(models.Match.date.asc())\
        .first()
        
    if not match:
        # If no upcoming match, get the very last one recorded
        match = db.query(models.Match).order_by(models.Match.date.desc()).first()
        
    return match

@app.put("/matches/{match_id}")
def update_match(match_id: str, item: schemas.MatchCreate, db: Session = Depends(database.get_db)):
    db_match = db.query(models.Match).filter(models.Match.id == match_id).first()
    if not db_match:
        raise HTTPException(status_code=404, detail="Match not found")

    import datetime
    date_obj = datetime.datetime.strptime(item.date, "%Y-%m-%d").date()
    
    db_match.opponent = item.opponent
    db_match.date = date_obj
    db_match.time = item.time
    db_match.location = item.location
    db_match.formation = item.formation
    db_match.lineup = item.lineup
    
    db.commit()
    db.refresh(db_match)
    return db_match


# 1. REGISTER
@app.post("/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = models.User(
        email=user.email,
        password=user.password,
        full_name=user.full_name
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# 2. LOGIN
@app.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    
    if not db_user or db_user.password != user.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    return {"message": "Login successful", "user_id": db_user.id, "email": db_user.email}