from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
import os

# Determine which database URL to use
# In production (or when DATABASE_URL_UNPOOLED is set), use the unpooled connection
# Otherwise, fall back to DATABASE_URL
db_url = os.getenv('DATABASE_URL_UNPOOLED') or os.getenv('DATABASE_URL')

if not db_url:
    raise ValueError("No database URL configured. Set either DATABASE_URL or DATABASE_URL_UNPOOLED in environment variables.")

print(f"Using database connection: {'unpooled connection' if 'DATABASE_URL_UNPOOLED' in os.environ else 'standard connection'}")

engine = create_engine(db_url)
db_session = scoped_session(sessionmaker(bind=engine))

def init_db():
    from models import Base
    Base.metadata.create_all(engine)

def shutdown_session(exception=None):
    db_session.remove()
