import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from pypdf import PdfReader
from PIL import Image
import io
import json
import uuid
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size

# Create uploads directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Database simulation (In a production app, use a real database)
FLASHCARDS_DB = {}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf(file_path):
    """Extract text from PDF file"""
    try:
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return ""

def extract_text_from_image(file_path):
    """
    This is a placeholder. In a real implementation,
    you would use OCR (Optical Character Recognition) here.
    """
    return "Text extracted from image would appear here."

def generate_flashcards_from_text(text):
    """
    Placeholder for AI processing to generate flashcards from text
    In a real implementation, you would integrate with an LLM API here
    """
    # Mock flashcards for demonstration
    flashcards = [
        {
            "id": str(uuid.uuid4()),
            "question": "What is a placeholder card?",
            "answer": "This is an example card generated automatically.",
            "tags": ["example", "demo"],
            "difficulty": 1,
            "lastReviewed": None,
            "nextReview": None
        },
        {
            "id": str(uuid.uuid4()),
            "question": "When would you integrate a real AI service?",
            "answer": "When moving beyond the prototype stage to generate meaningful flashcards from actual content.",
            "tags": ["implementation", "AI"],
            "difficulty": 2,
            "lastReviewed": None,
            "nextReview": None
        }
    ]
    
    # In the future, you would call an AI service here:
    # flashcards = call_ai_service(text)
    
    return flashcards

@app.route('/api/upload', methods=['POST'])
def upload_file():
    # Check if the post request has the file part
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    
    # If user does not select file, browser also
    # submit an empty part without filename
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        # Extract text based on file type
        file_ext = filename.rsplit('.', 1)[1].lower()
        text = ""
        
        if file_ext == 'pdf':
            text = extract_text_from_pdf(file_path)
        elif file_ext in ['png', 'jpg', 'jpeg']:
            text = extract_text_from_image(file_path)
        
        # Generate flashcards from extracted text
        flashcards = generate_flashcards_from_text(text)
        
        # Store flashcards in our "database"
        set_id = str(uuid.uuid4())
        FLASHCARDS_DB[set_id] = {
            "title": filename.rsplit('.', 1)[0],  # Use filename as title (without extension)
            "source": filename,
            "flashcards": flashcards
        }
        
        return jsonify({
            "success": True,
            "message": "File processed successfully",
            "set_id": set_id,
            "flashcards": flashcards
        }), 200
    
    return jsonify({"error": "File type not allowed"}), 400

@app.route('/api/flashcards', methods=['GET'])
def get_all_flashcard_sets():
    """Return all flashcard sets"""
    result = []
    
    for set_id, card_set in FLASHCARDS_DB.items():
        result.append({
            "id": set_id,
            "title": card_set["title"],
            "count": len(card_set["flashcards"])
        })
    
    return jsonify(result), 200

@app.route('/api/flashcards/<set_id>', methods=['GET'])
def get_flashcard_set(set_id):
    """Return a specific flashcard set"""
    if set_id not in FLASHCARDS_DB:
        return jsonify({"error": "Flashcard set not found"}), 404
    
    return jsonify(FLASHCARDS_DB[set_id]), 200

@app.route('/api/flashcards/<set_id>', methods=['PUT'])
def update_flashcard_set(set_id):
    """Update a specific flashcard set"""
    if set_id not in FLASHCARDS_DB:
        return jsonify({"error": "Flashcard set not found"}), 404
    
    data = request.json
    
    # Update the flashcard set
    if "title" in data:
        FLASHCARDS_DB[set_id]["title"] = data["title"]
    
    if "flashcards" in data:
        FLASHCARDS_DB[set_id]["flashcards"] = data["flashcards"]
    
    return jsonify({
        "success": True,
        "message": "Flashcard set updated successfully",
        "set_id": set_id
    }), 200

@app.route('/api/flashcards/<set_id>', methods=['DELETE'])
def delete_flashcard_set(set_id):
    """Delete a specific flashcard set"""
    if set_id not in FLASHCARDS_DB:
        return jsonify({"error": "Flashcard set not found"}), 404
    
    del FLASHCARDS_DB[set_id]
    
    return jsonify({
        "success": True,
        "message": "Flashcard set deleted successfully"
    }), 200

if __name__ == '__main__':
    app.run(debug=True)