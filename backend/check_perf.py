from sqlalchemy import create_engine, text
engine = create_engine('postgresql://vincentclifford@localhost/football_db')
with engine.connect() as conn:
    print("--- Players Table ---")
    # JOIN players with team_players to get performance
    query = """
    SELECT p.id, p.first_name, p.last_name, tp.performance 
    FROM players p
    LEFT JOIN team_players tp ON p.id = tp.player_id
    """
    players = conn.execute(text(query)).fetchall()
    for p in players:
        print(p)
    
    print("\n--- Team Assignments (team_players) ---")
    assignments = conn.execute(text('SELECT team_id, player_id, performance FROM team_players')).fetchall()
    for a in assignments:
        print(a)
