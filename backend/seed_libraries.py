"""
Seed script: Basics, Principles, Tactics, Exercises

Exports seed_libraries(db, coach_id) -> dict with keys:
    basics, principles, tactics, exercises

Can also be run standalone (requires demo user to already exist):
    cd backend
    python seed_libraries.py
"""

import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from database import SessionLocal, engine
from models import Base, User, Basic, Principle, Tactic, Exercise

Base.metadata.create_all(bind=engine)

DEMO_EMAIL = "demo@coachhub.com"


def seed_libraries(db, coach_id: str) -> dict:

    # ── Basics ────────────────────────────────────────────────────
    basics = [
        Basic(
            name="Inside Foot Pass (Push Pass)",
            description=(
                "The most common pass in football. Plant the non-kicking foot beside the ball, "
                "rotate the hips, and strike through the center with the arch of the foot. "
                "Used for short to medium-range distribution where accuracy is paramount."
            ),
            coach_id=coach_id,
        ),
        Basic(
            name="Receiving on the Back Foot",
            description=(
                "Receive the ball across the body with the back foot so you immediately face "
                "forward. Body shape must be open before the ball arrives. Key for maintaining "
                "tempo and playing quickly out of pressure — eliminates the need to turn."
            ),
            coach_id=coach_id,
        ),
        Basic(
            name="Shielding the Ball",
            description=(
                "Use the body as a barrier between the ball and the opponent. Widen the stance, "
                "lower the center of gravity, and use arms for balance. Turn the back to the "
                "defender and use the far foot to keep the ball away. Essential for holding up play."
            ),
            coach_id=coach_id,
        ),
        Basic(
            name="Third Man Run",
            description=(
                "A movement pattern where a player makes a run to receive a pass from a teammate "
                "who is not in direct possession. Ball goes A→B, B plays to C who has made a run. "
                "Used to bypass pressing lines and create forward momentum without direct vertical passes."
            ),
            coach_id=coach_id,
        ),
        Basic(
            name="1v1 Defending Stance",
            description=(
                "Jockey the attacker by staying on the half-turn, knees bent, staying goal-side. "
                "Delay, show them wide (away from danger), and only commit to a tackle when the "
                "ball is loose or the attacker's touch is heavy. Avoid diving in — stay patient."
            ),
            coach_id=coach_id,
        ),
        Basic(
            name="Driving Run with the Ball",
            description=(
                "Carry the ball at pace into space using the laces or outside of the foot, "
                "head up to scan for options. Used to break into open space after winning "
                "possession or to draw defenders before releasing a teammate."
            ),
            coach_id=coach_id,
        ),
    ]
    db.add_all(basics)
    db.flush()
    print(f"  Basics seeded: {len(basics)}")

    # ── Principles ────────────────────────────────────────────────
    principles = [
        # In Possession
        Principle(
            name="High Tempo Possession",
            game_phase="In Possession",
            description=(
                "Maintain control of the ball through fast, purposeful short passing. "
                "The objective is to move the ball quicker than the opposition can shift shape, "
                "creating gaps to exploit in behind or between lines."
            ),
            coaching_notes=(
                "One and two touch wherever possible. The ball must always travel faster than a "
                "player can run. No square passes under pressure — always play forward or switch. "
                "Demand high intensity from the moment we have the ball."
            ),
            implementation_tips=(
                "4v2 rondo with a 2-touch limit\n"
                "Penalize back passes unless the player is under genuine pressure\n"
                "Reward combinations that break the defensive line"
            ),
            coach_id=coach_id,
        ),
        Principle(
            name="Overloading Wide Channels",
            game_phase="In Possession",
            description=(
                "Create 2v1 or 3v2 situations on the wings by combining the fullback, wide "
                "midfielder, and winger. Force the opposition to shift laterally, opening "
                "central corridors for split passes or cutbacks."
            ),
            coaching_notes=(
                "Fullback must time overlap runs — not too early or the lane closes. "
                "Winger pins the opposition wide midfielder. Central midfielder drifts "
                "to support or receive the cutback. Always have a back option at the edge of the box."
            ),
            implementation_tips=(
                "Wide overload box drill: 3v2 in wide channel ending in cutback\n"
                "Reward the combination that leads to a cutback or low cross\n"
                "Coach the inside pass to drag defenders out of position"
            ),
            coach_id=coach_id,
        ),
        # Out of Possession
        Principle(
            name="Defensive Compactness",
            game_phase="Out of Possession",
            description=(
                "Reduce the space between defensive and midfield lines to deny the opponent "
                "vertical penetration. The team must move as a compact unit, keeping 15–20 yards "
                "maximum between all four lines and no more than 30 yards wide."
            ),
            coaching_notes=(
                "Move as a synchronized block — no individuals chasing the ball. "
                "When the ball goes wide, the nearest player presses, the rest shift. "
                "Never allow space in behind the last line. Stay goal-side at all times."
            ),
            implementation_tips=(
                "Shadow play: coach moves the ball, the team shifts as a unit\n"
                "Use cones to mark the maximum allowed line-to-line distance\n"
                "Stop play whenever a gap opens — correct the shape immediately"
            ),
            coach_id=coach_id,
        ),
        Principle(
            name="Pressing Triggers",
            game_phase="Out of Possession",
            description=(
                "Press aggressively only on specific cues — not randomly. Triggers include: "
                "a back pass to the goalkeeper, a heavy touch by the defender, or poor body "
                "shape. Pressing without a trigger wastes energy and creates gaps."
            ),
            coaching_notes=(
                "The striker must recognize the trigger first — their reaction sets the press off. "
                "The second player immediately cuts the escape route. The rest of the team "
                "steps up together. If the press fails, sprint back into the block."
            ),
            implementation_tips=(
                "Identify and name 3 specific triggers during video analysis\n"
                "Restart drill: practice the press from opposition goal kicks\n"
                "Small-sided game: bonus point for winning the ball within 5 sec of a trigger"
            ),
            coach_id=coach_id,
        ),
        # Transition After Losing Possession
        Principle(
            name="Counter-Press (Gegenpressing)",
            game_phase="Transition After Losing Possession",
            description=(
                "Immediately attempt to win the ball back within 5 seconds of losing it, "
                "before the opposition can organize. Hunt in groups of 2–3 to cut off passing "
                "lanes and force a back pass or long ball."
            ),
            coaching_notes=(
                "Reaction time is everything — sprint toward the ball, not sideways. "
                "Nearest player pressures, second player cuts the lane, third covers. "
                "After 5 seconds without winning the ball, retreat into the block."
            ),
            implementation_tips=(
                "Small-sided game: double points for regaining possession within 5 seconds\n"
                "Transition drill: win the ball back in the final third only\n"
                "Video: Klopp-era Liverpool counter-press moments as a reference"
            ),
            coach_id=coach_id,
        ),
        # Transition After Winning Possession
        Principle(
            name="Direct Vertical Transition",
            game_phase="Transition After Winning Possession",
            description=(
                "After winning the ball, play forward immediately into space behind the "
                "opposition's disorganized defensive line. One or two passes maximum before "
                "a penetrating run, shot, or dangerous cross."
            ),
            coaching_notes=(
                "Secure the ball first — no loose first touches. Eyes up immediately. "
                "Play into the striker's feet or the channel run. Wide players must sprint "
                "to create width on the counter. Do not slow it down."
            ),
            implementation_tips=(
                "Transition game: teams must attempt a shot within 6 seconds of winning the ball\n"
                "Coach the correct body position when winning the ball\n"
                "Drill: win ball in defending third, transition to finish in 3 passes"
            ),
            coach_id=coach_id,
        ),
        # Set Pieces
        Principle(
            name="Set Piece Zonal Marking",
            game_phase="Set Pieces",
            description=(
                "Defend corners and free kicks using a zonal marking system. Each player is "
                "responsible for a zone, not a man. Timed jumps to attack the ball in the "
                "zone beat opposition runs and eliminate blind-side blocks."
            ),
            coaching_notes=(
                "Post players are non-negotiable — 2 on posts, 1 near 6-yard line. "
                "Zonal markers attack the ball — never stand still waiting for contact. "
                "Near-post deliveries belong to the GK. Far post needs two players."
            ),
            implementation_tips=(
                "Walk through the corner defensive structure before every match\n"
                "11v11 corners in training: attack vs. zonal block — score each\n"
                "Review last 3 conceded set pieces on video and identify the zone that failed"
            ),
            coach_id=coach_id,
        ),
    ]
    db.add_all(principles)
    db.flush()
    print(f"  Principles seeded: {len(principles)}")

    # ── Tactics ───────────────────────────────────────────────────
    tactics = [
        Tactic(
            name="High Press 4-3-3",
            formation="4-3-3",
            description=(
                "Our default system. Three forwards press in a coordinated unit to force the "
                "opposition goalkeeper and center-backs into long balls. The midfield trio "
                "covers the central zones. Fullbacks push high to support wide overloads and "
                "deliver crosses. The back line holds a high defensive line."
            ),
            suggested_drills=(
                "Pressing shape shadow play, wide overload 3v2 into cutback, "
                "11v11 structured build-up versus high press"
            ),
            coach_id=coach_id,
        ),
        Tactic(
            name="Compact Mid-Block 4-4-2",
            formation="4-4-2",
            description=(
                "Used against stronger opposition. Sit in a compact 4-4-2 mid-block, denying "
                "space between the lines. Two forwards press in tandem on triggers. The two "
                "banks of four shift as synchronized units. Goal is to absorb pressure and "
                "launch counter-attacks through the striker pair."
            ),
            suggested_drills=(
                "Shadow play defensive shape, 8v6 attack vs. defense, "
                "counter-attack transition drill from a turnover"
            ),
            coach_id=coach_id,
        ),
        Tactic(
            name="Diamond Midfield 4-4-2 Diamond",
            formation="4-4-2 Diamond",
            description=(
                "Deployed when we need to dominate central midfield against a three-man midfield. "
                "The diamond provides numerical superiority centrally with a DM, two CMs, and an "
                "attacking midfielder. The two strikers split wide when out of possession to "
                "stretch CBs, then press as a pair on the trigger."
            ),
            suggested_drills=(
                "Central combination play through the diamond, "
                "pressing from the striker pair, switching play from the DM"
            ),
            coach_id=coach_id,
        ),
    ]
    db.add_all(tactics)
    db.flush()
    print(f"  Tactics seeded: {len(tactics)}")

    # ── Exercises ─────────────────────────────────────────────────
    exercises = [
        Exercise(
            name="4v2 Rondo (Possession)",
            intensity="Medium",
            description=(
                "4 attackers keep the ball from 2 defenders in a 10x10m grid. "
                "The attacker who gives away the ball becomes a defender. "
                "Emphasis on quick, sharp passing and correct body orientation."
            ),
            setup="10x10m grid. 4 cones to mark corners. Groups of 6.",
            variations=(
                "Limit to 2 touches. Add a 5th attacker. Reduce the grid size. "
                "Add a neutral player on the outside."
            ),
            coaching_points=(
                "Open your body before the ball arrives\n"
                "Always pass to the furthest open player\n"
                "Move immediately after every pass"
            ),
            goalkeepers=0,
            equipment="Bibs,Cones,Balls",
            linked_basics="Inside Foot Pass (Push Pass),Receiving on the Back Foot",
            linked_principles="High Tempo Possession",
            linked_tactics="High Press 4-3-3",
            coach_id=coach_id,
        ),
        Exercise(
            name="Wide Overload 3v2",
            intensity="High",
            description=(
                "3 attackers (winger + fullback + CM) against 2 defenders in a wide channel. "
                "Objective is to combine and deliver a cutback or driven cross. "
                "Fullback times the overlap. Winger decides: cross, cut inside, or lay off."
            ),
            setup="Full-width channel from halfway to the byline. Approximately 20m wide.",
            variations=(
                "Add a third defender. Allow recovery runs. "
                "Limit to 1 touch in the final third."
            ),
            coaching_points=(
                "Winger must receive on the back foot\n"
                "Fullback's run must be timed — not too early\n"
                "Cutback is always the first-choice option"
            ),
            goalkeepers=1,
            equipment="Cones,Balls,Goal",
            linked_basics="Receiving on the Back Foot,Third Man Run",
            linked_principles="Overloading Wide Channels",
            linked_tactics="High Press 4-3-3",
            coach_id=coach_id,
        ),
        Exercise(
            name="Pressing Triggers Shadow Play",
            intensity="Medium",
            description=(
                "Coach (or designated player) moves the ball around the opposition back four. "
                "When a pressing trigger is shown (back pass, heavy touch, poor body shape), "
                "the pressing unit of 5 sprint to press in the correct shape."
            ),
            setup="Half pitch. Opposition back 4 + GK. Pressing unit of 5.",
            variations=(
                "Add a floating midfielder for the opposition. Make the press live. "
                "Score a point per successful press that forces a long ball."
            ),
            coaching_points=(
                "Trigger recognition must be instant — no hesitation\n"
                "Second presser cuts the escape lane immediately\n"
                "If the press is beaten, sprint back into the block"
            ),
            goalkeepers=1,
            equipment="Cones,Bibs,Balls",
            linked_basics="1v1 Defending Stance",
            linked_principles="Pressing Triggers,Counter-Press (Gegenpressing)",
            linked_tactics="High Press 4-3-3,Compact Mid-Block 4-4-2",
            coach_id=coach_id,
        ),
        Exercise(
            name="Transition Counter-Attack (6v6+GK)",
            intensity="High",
            description=(
                "Both teams play 6v6 on a 40x30m pitch. When possession changes, the team "
                "that won the ball must attempt a shot within 6 seconds. "
                "Rewards explosive forward play and correct body position after a turnover."
            ),
            setup="40x30m pitch. Full goals both ends. Two GKs.",
            variations=(
                "Reduce to 4 seconds. Add neutral wide players for the counter. "
                "Require a first-time finish."
            ),
            coaching_points=(
                "First touch must face forward\n"
                "At least one runner ahead of the ball before the pass\n"
                "Wide players sprint to create width on every counter"
            ),
            goalkeepers=2,
            equipment="Goals,Balls,Bibs,Cones",
            linked_basics="Third Man Run,Driving Run with the Ball",
            linked_principles="Direct Vertical Transition,Counter-Press (Gegenpressing)",
            linked_tactics="High Press 4-3-3,Compact Mid-Block 4-4-2",
            coach_id=coach_id,
        ),
        Exercise(
            name="Zonal Corner Defense (Set Piece)",
            intensity="Low",
            description=(
                "Practice defending corners using a zonal system. Coach delivers corners "
                "from both sides. Defenders attack the ball in their assigned zones. "
                "GK organizes the structure. Attack practices corner delivery and runs."
            ),
            setup="Full pitch. Corner flag delivery. 11v8 (attack includes corner-takers).",
            variations=(
                "Use dead-ball delivery variations (in-swing, out-swing, short corner). "
                "Add designated blockers in the box. Allow a set-piece free-kick version."
            ),
            coaching_points=(
                "Post players hold position until the ball is delivered\n"
                "Zonal defenders jump to attack the ball — do not wait for contact\n"
                "GK must be loud and claim the 6-yard box"
            ),
            goalkeepers=1,
            equipment="Goals,Balls,Cones",
            linked_basics="1v1 Defending Stance",
            linked_principles="Set Piece Zonal Marking",
            linked_tactics="Compact Mid-Block 4-4-2",
            coach_id=coach_id,
        ),
        Exercise(
            name="Build-Up Through Lines (Positional Play)",
            intensity="Medium",
            description=(
                "8v6 structured positional game across 3 zones. Attacking team must play "
                "through all three zones to score. Defending team applies pressure in each "
                "zone. Focus on maintaining structure and playing through the press."
            ),
            setup="Full pitch split into 3 horizontal zones (defending, middle, attacking).",
            variations=(
                "Add an offside line in the final zone. Limit touches per zone. "
                "Give the defending team a bonus for winning the ball in the middle zone."
            ),
            coaching_points=(
                "Secure the ball in each zone before progressing\n"
                "Third man run to receive beyond the next defensive line\n"
                "Width first — stretch the defense before playing through centrally"
            ),
            goalkeepers=1,
            equipment="Cones,Bibs,Balls,Goals",
            linked_basics="Inside Foot Pass (Push Pass),Third Man Run",
            linked_principles="High Tempo Possession,Overloading Wide Channels",
            linked_tactics="High Press 4-3-3,Diamond Midfield 4-4-2 Diamond",
            coach_id=coach_id,
        ),
    ]
    db.add_all(exercises)
    db.flush()
    print(f"  Exercises seeded: {len(exercises)}")

    return {
        "basics": basics,
        "principles": principles,
        "tactics": tactics,
        "exercises": exercises,
    }


if __name__ == "__main__":
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == DEMO_EMAIL).first()
        if not user:
            print(f"Demo user '{DEMO_EMAIL}' not found. Run seed_demo.py first.")
        else:
            seed_libraries(db, user.id)
            db.commit()
            print("Done.")
    finally:
        db.close()
