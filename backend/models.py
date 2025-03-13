from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker

Base = declarative_base()

class FlashcardSet(Base):
    __tablename__ = 'flashcard_sets'
    
    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    source = Column(String)
    creation_date = Column(DateTime, default=datetime.utcnow)
    flashcards = relationship('Flashcard', back_populates='flashcard_set', cascade='all, delete-orphan')

class Flashcard(Base):
    __tablename__ = 'flashcards'
    
    id = Column(String, primary_key=True)
    set_id = Column(String, ForeignKey('flashcard_sets.id'), nullable=False)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    tags = Column(JSON)
    difficulty = Column(Integer)
    last_reviewed = Column(DateTime)
    next_review = Column(DateTime)
    review_count = Column(Integer, default=0)
    flashcard_set = relationship('FlashcardSet', back_populates='flashcards')

def init_db(database_url):
    engine = create_engine(database_url)
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    return Session()
