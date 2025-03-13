from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
import os

engine = create_engine(os.getenv('DATABASE_URL'))
db_session = scoped_session(sessionmaker(bind=engine))

def init_db():
    from models import Base
    Base.metadata.create_all(engine)

def shutdown_session(exception=None):
    db_session.remove()
