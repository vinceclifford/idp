from database import SessionLocal, engine
from models import Base, Basic, Principle, Tactic

# Ensure tables exist
Base.metadata.create_all(bind=engine)

def seed_data():
    db = SessionLocal()
    
    # ==========================
    # 1. BASICS (Technical Skills)
    # ==========================
    basics_data = [
        Basic(
            name="Inside Foot Pass (Push Pass)",
            description="The most common pass in football. Used for short to medium distances. Key mechanics include planting the non-kicking foot beside the ball, rotating the hips, and striking through the center of the ball with the arch of the foot.",
            diagram_url="https://example.com/diagrams/push-pass.png"
        ),
        Basic(
            name="Receiving on the Back Foot",
            description="A technique to receive the ball across the body, allowing the player to face forward immediately. Essential for maintaining momentum and playing quickly.",
            diagram_url="https://example.com/diagrams/back-foot-receiving.png"
        ),
        Basic(
            name="Shielding the Ball",
            description="Using the body as a barrier between the ball and the opponent. The player should widen their stance, lower their center of gravity, and use arms for balance and distance.",
            diagram_url="https://example.com/diagrams/shielding.png"
        )
    ]

    # ==========================
    # 2. PRINCIPLES (Strategic Concepts)
    # ==========================
    principles_data = [
        Principle(
            name="Penetration (Breaking Lines)",
            game_phase="Attacking",
            description=" The action of moving the ball through or over defensive lines to get closer to the opponent's goal.",
            coaching_notes="Encourage forward passing. Look for split passes between defenders. Dribble to commit opponents.",
            implementation_tips="Use rondo drills with a focus on 'splitting' passes. Reward forward passes more than lateral ones.",
            media_url="https://example.com/videos/penetration.mp4"
        ),
        Principle(
            name="Defensive Compactness",
            game_phase="Defending",
            description="Reducing the space between lines (vertical) and players (horizontal) to deny the opponent space to play through.",
            coaching_notes="Move as a unit. If the ball moves right, the whole team shifts right. Keep distances short (10-15 yards).",
            implementation_tips="Use a zone defense game on a narrowed pitch. Stop play to check distances between defenders.",
            media_url="https://example.com/videos/compactness.mp4"
        ),
        Principle(
            name="Counter-Pressing (Gegenpressing)",
            game_phase="Transition (A-D)",
            description="Immediately attempting to regain possession after losing it, rather than falling back into a defensive shape.",
            coaching_notes="Reaction time must be instant (< 3 seconds). Hunt in packs of 2-3 players. Cut off passing lanes.",
            implementation_tips="Play small-sided games where a team scoring within 5 seconds of winning the ball gets double points.",
            media_url="https://example.com/videos/counter-press.mp4"
        )
    ]

    # ==========================
    # 3. TACTICS (Team Formations & Strategies)
    # ==========================
    tactics_data = [
        Tactic(
            name="Tiki-Taka Possession",
            formation="4-3-3",
            description="A style of play characterized by short passing and movement, working the ball through various channels, and maintaining possession.",
            diagram_url="https://example.com/diagrams/tiki-taka.png",
            suggested_drills="4v2 Rondos, Positional Play Grids, Third Man Running drills."
        ),
        Tactic(
            name="Catenaccio (Low Block)",
            formation="5-3-2",
            description="A highly organized defensive system focused on nullifying opponents' attacks and preventing goal-scoring opportunities, often using a sweeper.",
            diagram_url="https://example.com/diagrams/low-block.png",
            suggested_drills="Shadow play defending, 8v6 Attack vs Defense scenarios."
        ),
        Tactic(
            name="High Press Overload",
            formation="4-4-2 Diamond",
            description="Aggressively pressing the opponent high up the pitch to force errors close to their goal. The diamond midfield creates a numerical advantage centrally.",
            diagram_url="https://example.com/diagrams/high-press.png",
            suggested_drills="High intensity pressing triggers, 1v1 duels in small zones."
        )
    ]

    # Add all to session and commit
    try:
        print("Adding Basics...")
        db.add_all(basics_data)
        
        print("Adding Principles...")
        db.add_all(principles_data)
        
        print("Adding Tactics...")
        db.add_all(tactics_data)
        
        db.commit()
        print("Database successfully seeded with Football knowledge!")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()