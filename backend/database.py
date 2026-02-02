from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 1. Update with your credentials: postgresql://<user>:<password>@localhost/<db_name>
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:2321851b@localhost/football_db"

# 2. Remove connect_args={"check_same_thread": False}
engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()