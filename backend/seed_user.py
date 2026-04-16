import models, database, security
from sqlalchemy.orm import Session

def seed_admin_user():
    db: Session = next(database.get_db())
    
    # Check if admin already exists
    admin_email = "admin@coachhub.com"
    existing_user = db.query(models.User).filter(models.User.email == admin_email).first()
    
    if existing_user:
        print(f"User {admin_email} already exists. Updating password...")
        existing_user.password = security.get_password_hash("admin123")
        db.commit()
    else:
        print(f"Creating new admin user: {admin_email}")
        new_user = models.User(
            email=admin_email,
            password=security.get_password_hash("admin123"),
            full_name="Head Coach Admin"
        )
        db.add(new_user)
        db.commit()
    
    print("Done! You can now log in with:")
    print(f"Email: {admin_email}")
    print("Password: admin123")

if __name__ == "__main__":
    seed_admin_user()
