import json
import os
from dotenv import load_dotenv
from models import FlashcardSet, Flashcard
from db import db_session, init_db

load_dotenv()

def migrate_json_to_db():
    # Path to JSON file
    json_file = os.path.join(os.path.dirname(__file__), 'data', 'flashcards.json')
    
    if not os.path.exists(json_file):
        print("No JSON file found to migrate")
        return
    
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Initialize database
        init_db()
        
        # Migrate each flashcard set
        for set_id, set_data in data.items():
            flashcard_set = FlashcardSet(
                id=set_id,
                title=set_data['title'],
                source=set_data.get('source'),
                creation_date=set_data.get('creation_date')
            )
            
            # Add flashcards
            for card_data in set_data['flashcards']:
                flashcard = Flashcard(
                    id=card_data['id'],
                    question=card_data['question'],
                    answer=card_data['answer'],
                    tags=card_data.get('tags', []),
                    difficulty=card_data['difficulty'],
                    last_reviewed=card_data.get('lastReviewed'),
                    next_review=card_data.get('nextReview'),
                    review_count=card_data.get('reviewCount', 0)
                )
                flashcard_set.flashcards.append(flashcard)
            
            db_session.add(flashcard_set)
        
        # Commit all changes
        db_session.commit()
        print("Migration completed successfully")
        
        # Optional: Backup and remove the JSON file
        backup_file = json_file + '.bak'
        os.rename(json_file, backup_file)
        print(f"Original JSON file backed up to {backup_file}")
        
    except Exception as e:
        db_session.rollback()
        print(f"Error during migration: {e}")
        raise
    finally:
        db_session.remove()

if __name__ == '__main__':
    migrate_json_to_db()
