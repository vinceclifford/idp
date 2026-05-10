#!/usr/bin/env python3
"""
Creates 25 dummy past matches with scores and goal/assist events
so the Statistics dashboard has data to display.

Usage:
    python3 seed_stats.py --email you@example.com --password yourpassword
"""

import sys
import json
import random
import argparse
import urllib.request
import urllib.error

BASE_URL = "http://localhost:8000"
random.seed(42)

MATCHES_TO_CREATE = [
    {"date": "2024-08-24", "opponent": "Sporting FC",      "location": "Home", "goals_for": 3, "goals_against": 1},
    {"date": "2024-09-07", "opponent": "City Rovers",      "location": "Away", "goals_for": 2, "goals_against": 0},
    {"date": "2024-09-14", "opponent": "United Athletic",  "location": "Home", "goals_for": 1, "goals_against": 1},
    {"date": "2024-09-21", "opponent": "Eagles SC",        "location": "Away", "goals_for": 0, "goals_against": 2},
    {"date": "2024-09-28", "opponent": "Riverside FC",     "location": "Home", "goals_for": 4, "goals_against": 2},
    {"date": "2024-10-05", "opponent": "North Stars",      "location": "Away", "goals_for": 2, "goals_against": 1},
    {"date": "2024-10-12", "opponent": "Westside United",  "location": "Home", "goals_for": 2, "goals_against": 2},
    {"date": "2024-10-19", "opponent": "Premier Youth",    "location": "Away", "goals_for": 1, "goals_against": 3},
    {"date": "2024-10-26", "opponent": "Harbor FC",        "location": "Home", "goals_for": 3, "goals_against": 0},
    {"date": "2024-11-02", "opponent": "Valley Rangers",   "location": "Away", "goals_for": 2, "goals_against": 1},
    {"date": "2024-11-09", "opponent": "FC Northgate",     "location": "Home", "goals_for": 0, "goals_against": 1},
    {"date": "2024-11-16", "opponent": "Redhill United",   "location": "Away", "goals_for": 3, "goals_against": 2},
    {"date": "2024-11-23", "opponent": "Southside SC",     "location": "Home", "goals_for": 1, "goals_against": 0},
    {"date": "2024-11-30", "opponent": "Brookfield FC",    "location": "Away", "goals_for": 2, "goals_against": 2},
    {"date": "2024-12-07", "opponent": "Athletic Park",    "location": "Home", "goals_for": 4, "goals_against": 1},
    {"date": "2024-12-14", "opponent": "Meadow Rangers",   "location": "Away", "goals_for": 0, "goals_against": 3},
    {"date": "2025-01-11", "opponent": "Sporting FC",      "location": "Away", "goals_for": 1, "goals_against": 1},
    {"date": "2025-01-18", "opponent": "City Rovers",      "location": "Home", "goals_for": 3, "goals_against": 0},
    {"date": "2025-01-25", "opponent": "United Athletic",  "location": "Away", "goals_for": 2, "goals_against": 3},
    {"date": "2025-02-01", "opponent": "Eagles SC",        "location": "Home", "goals_for": 2, "goals_against": 0},
    {"date": "2025-02-08", "opponent": "Riverside FC",     "location": "Away", "goals_for": 1, "goals_against": 2},
    {"date": "2025-02-15", "opponent": "North Stars",      "location": "Home", "goals_for": 3, "goals_against": 1},
    {"date": "2025-02-22", "opponent": "Westside United",  "location": "Away", "goals_for": 0, "goals_against": 0},
    {"date": "2025-03-08", "opponent": "Harbor FC",        "location": "Away", "goals_for": 2, "goals_against": 1},
    {"date": "2025-03-22", "opponent": "Valley Rangers",   "location": "Home", "goals_for": 3, "goals_against": 2},
]

# ---------------------------------------------------------------------------
# HTTP helpers
# ---------------------------------------------------------------------------

def api(method, path, body=None, token=None):
    url = BASE_URL + path
    data = json.dumps(body).encode() if body is not None else None
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    if token:
        headers["Authorization"] = "Bearer " + token
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        detail = e.read().decode()
        raise RuntimeError(method + " " + path + " -> HTTP " + str(e.code) + ": " + detail)

def get(path, token=None):        return api("GET",  path, token=token)
def post(path, body, token=None): return api("POST", path, body=body, token=token)
def put(path, body, token=None):  return api("PUT",  path, body=body, token=token)

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--email",    required=True)
    parser.add_argument("--password", required=True)
    args = parser.parse_args()

    print("Logging in...")
    try:
        resp = post("/login", {"email": args.email, "password": args.password})
    except RuntimeError as e:
        print("Login failed: " + str(e))
        sys.exit(1)
    token = resp["access_token"]
    print("Logged in\n")

    teams   = get("/teams",   token=token)
    seasons = get("/seasons", token=token)
    if not teams:
        print("No teams found - create a team in the app first.")
        sys.exit(1)
    if not seasons:
        print("No seasons found - create a season in the app first.")
        sys.exit(1)

    team   = teams[0]
    season = seasons[0]
    print("Team:   " + team["name"])
    print("Season: " + season["name"] + "\n")

    players = get("/players?team_id=" + team["id"] + "&season_id=" + season["id"], token=token)
    outfield_ids = [p["id"] for p in players if p.get("position", "").lower() != "goalkeeper"]
    if not outfield_ids:
        outfield_ids = [p["id"] for p in players]

    print("Creating " + str(len(MATCHES_TO_CREATE)) + " past matches...\n")

    for m in MATCHES_TO_CREATE:
        gf = m["goals_for"]
        ga = m["goals_against"]

        # Step 1: create the match
        created = post("/matches", {
            "opponent":  m["opponent"],
            "date":      m["date"],
            "time":      "15:00",
            "location":  m["location"],
            "team_id":   team["id"],
            "season_id": season["id"],
            "formation": "4-3-3",
        }, token=token)
        mid = created["id"]

        # Step 2: set the score via the dedicated stats endpoint
        put("/matches/" + mid + "/stats",
            {"goals_for": gf, "goals_against": ga, "notes": ""},
            token=token)

        result_char = "W" if gf > ga else ("D" if gf == ga else "L")
        print("  [" + result_char + "] " + m["date"] + "  " + str(gf) + "-" + str(ga) + "  vs " + m["opponent"])

        # Step 3: add goal + assist events
        if outfield_ids and gf > 0:
            scorers = random.choices(outfield_ids, k=gf)
            for j, scorer_id in enumerate(scorers):
                minute = random.randint(5 + j * 9, 15 + j * 9)
                try:
                    post("/matches/" + mid + "/events",
                         {"player_id": scorer_id, "event_type": "Goal", "minute": minute},
                         token=token)
                    candidates = [pid for pid in outfield_ids if pid != scorer_id]
                    if candidates and random.random() < 0.70:
                        post("/matches/" + mid + "/events",
                             {"player_id": random.choice(candidates), "event_type": "Assist", "minute": minute},
                             token=token)
                except RuntimeError as e:
                    print("    (event skipped: " + str(e) + ")")

    print("\nDone - refresh the Statistics page.")

if __name__ == "__main__":
    main()
