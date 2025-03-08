import os
import json
import uuid
import re
import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from pypdf import PdfReader
from PIL import Image
import io
import google.generativeai as genai
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

# Configurer l'API Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("⚠️ Attention: GEMINI_API_KEY n'est pas définie dans les variables d'environnement")

app = Flask(__name__)
CORS(app)  # Permet les requêtes cross-origin pour le développement

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'txt'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size

# Création du dossier uploads s'il n'existe pas
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Simulation de base de données (à remplacer par une vraie BDD en production)
FLASHCARDS_DB = {}

def allowed_file(filename):
    """Vérifie si le fichier a une extension autorisée"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf(file_path):
    """Extrait le texte d'un fichier PDF"""
    try:
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        return text
    except Exception as e:
        print(f"Erreur lors de l'extraction de texte du PDF: {e}")
        return ""

def extract_text_from_image(file_path):
    """
    Pour une implémentation complète, vous pourriez utiliser une bibliothèque OCR comme pytesseract.
    Pour l'instant, nous retournons un message placeholder.
    """
    return "Le texte extrait de l'image serait affiché ici. Installez pytesseract pour l'OCR."

def generate_flashcards_from_text(text, num_cards=5):
    """Génère des flashcards à partir du texte en utilisant Gemini"""
    try:
        if not GEMINI_API_KEY:
            # Retourner des cartes par défaut si la clé API n'est pas configurée
            return generate_default_flashcards(text, num_cards)
        
        # Limitation à 4000 caractères pour éviter des demandes trop grandes
        text_to_process = text[:4000] if len(text) > 4000 else text
        
        # Créer le modèle Gemini
        model = genai.GenerativeModel('gemini-pro')
        
        # Construire le prompt pour Gemini
        prompt = f"""À partir du texte suivant, crée {num_cards} cartes d'apprentissage (flashcards) au format question-réponse.

TEXTE À ANALYSER:
{text_to_process}

INSTRUCTIONS:
1. Identifie les concepts clés et les informations importantes dans le texte.
2. Crée exactement {num_cards} cartes avec des questions pertinentes et des réponses précises.
3. Les questions doivent être claires et spécifiques.
4. Les réponses doivent être concises mais complètes.
5. Ta réponse doit être un tableau JSON valide au format suivant:

[
  {{
    "question": "Question 1?",
    "answer": "Réponse 1"
  }},
  {{
    "question": "Question 2?",
    "answer": "Réponse 2"
  }}
]

Réponds UNIQUEMENT avec le JSON, sans texte explicatif avant ou après."""

        # Faire la requête à l'API Gemini
        response = model.generate_content(prompt)
        
        # Extraire la réponse
        ai_response = response.text

        # Traiter la réponse pour extraire le JSON
        try:
            # Nettoyer la réponse (supprimer les blocs de code markdown s'ils existent)
            clean_response = ai_response
            if "```json" in ai_response:
                clean_response = re.search(r'```json\s*(.*?)\s*```', ai_response, re.DOTALL)
                if clean_response:
                    clean_response = clean_response.group(1)
            elif "```" in ai_response:
                clean_response = re.search(r'```\s*(.*?)\s*```', ai_response, re.DOTALL)
                if clean_response:
                    clean_response = clean_response.group(1)
            
            # Tenter de parser comme JSON
            flashcards = json.loads(clean_response)
            
            # Ajouter des IDs uniques à chaque flashcard
            for card in flashcards:
                card["id"] = str(uuid.uuid4())
                # Ajouter des champs supplémentaires pour l'interface utilisateur
                card["difficulty"] = 0  # 0-4: pas encore évalué jusqu'à difficile
                card["lastReviewed"] = None
                card["nextReview"] = None
            
            return flashcards
        
        except (json.JSONDecodeError, ValueError) as e:
            # Essayer d'extraire un JSON valide de la réponse avec regex
            print(f"Erreur de parsing JSON: {e}")
            print(f"Réponse brute: {ai_response[:200]}...")
            
            # Chercher un pattern JSON dans la réponse
            json_match = re.search(r'\[\s*{\s*"question".*}\s*\]', ai_response, re.DOTALL)
            if json_match:
                try:
                    flashcards = json.loads(json_match.group(0))
                    # Ajouter des IDs uniques à chaque flashcard
                    for card in flashcards:
                        card["id"] = str(uuid.uuid4())
                        # Ajouter des champs supplémentaires pour l'interface utilisateur
                        card["difficulty"] = 0
                        card["lastReviewed"] = None
                        card["nextReview"] = None
                    return flashcards
                except:
                    pass
            
            # En cas d'échec, générer des cartes par défaut
            return generate_default_flashcards(text, num_cards)
        
    except Exception as e:
        print(f"Erreur lors de la génération des cartes avec Gemini: {e}")
        return generate_default_flashcards(text, num_cards)

def generate_default_flashcards(text, num_cards=5):
    """Génère des flashcards par défaut en cas d'échec de l'API"""
    # Segmenter le texte en phrases
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 10]
    
    # Créer des flashcards basiques à partir des phrases
    flashcards = []
    for i in range(min(num_cards, len(sentences))):
        if i < len(sentences):
            sentence = sentences[i]
            words = sentence.split()
            if len(words) > 5:
                # Prendre les premiers mots pour la question
                question_words = words[:min(5, len(words)//2)]
                question = " ".join(question_words) + "...?"
                answer = sentence
                flashcards.append({
                    "id": str(uuid.uuid4()),
                    "question": question,
                    "answer": answer,
                    "difficulty": 0,
                    "lastReviewed": None,
                    "nextReview": None
                })
    
    # Si pas assez de sentences, ajouter des cartes génériques
    while len(flashcards) < num_cards:
        flashcards.append({
            "id": str(uuid.uuid4()),
            "question": f"Question {len(flashcards) + 1} générée automatiquement",
            "answer": f"Ceci est une carte par défaut générée car l'IA n'a pas pu produire suffisamment de cartes pertinentes.",
            "difficulty": 0,
            "lastReviewed": None,
            "nextReview": None
        })
    
    return flashcards

def test_gemini_api():
    """Teste la connexion à l'API Gemini"""
    if not GEMINI_API_KEY:
        return False

    try:
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content("Dis bonjour en français")
        print("Test API Gemini réussi:", response.text)
        return True
    except Exception as e:
        print("Erreur lors du test de l'API Gemini:", e)
        return False

@app.route('/')
def index():
    """Route de test pour vérifier que l'API est opérationnelle"""
    return jsonify({
        "status": "ok",
        "message": "API de flashcards BrainBoost opérationnelle",
        "version": "1.0"
    })

@app.route('/api/test-gemini')
def test_gemini():
    """Route pour tester la connexion à l'API Gemini"""
    result = test_gemini_api()
    return jsonify({
        "success": result,
        "message": "Connexion à l'API Gemini réussie" if result else "Échec de connexion à l'API Gemini ou clé API non configurée"
    })

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Route pour télécharger un fichier et générer des flashcards"""
    # Vérifier si la requête contient le fichier
    if 'file' not in request.files:
        return jsonify({"error": "Aucun fichier dans la requête"}), 400
    
    file = request.files['file']
    
    # Si l'utilisateur n'a pas sélectionné de fichier
    if file.filename == '':
        return jsonify({"error": "Aucun fichier sélectionné"}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        # Extraction du texte selon le type de fichier
        file_ext = filename.rsplit('.', 1)[1].lower()
        text = ""
        
        if file_ext == 'pdf':
            text = extract_text_from_pdf(file_path)
        elif file_ext in ['png', 'jpg', 'jpeg']:
            text = extract_text_from_image(file_path)
        elif file_ext == 'txt':
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()
        
        # Obtenir le nombre de cartes demandé (paramètre optionnel)
        num_cards = request.args.get('num_cards', default=5, type=int)
        
        # Génération des flashcards à partir du texte extrait
        flashcards = generate_flashcards_from_text(text, num_cards)
        
        # Stockage des flashcards dans notre "base de données"
        set_id = str(uuid.uuid4())
        FLASHCARDS_DB[set_id] = {
            "title": filename.rsplit('.', 1)[0],  # Utiliser le nom du fichier sans extension
            "source": filename,
            "creation_date": datetime.datetime.now().isoformat(),
            "flashcards": flashcards
        }
        
        return jsonify({
            "success": True,
            "message": "Fichier traité avec succès",
            "set_id": set_id,
            "title": FLASHCARDS_DB[set_id]["title"],
            "flashcards": flashcards,
            "text_length": len(text)
        }), 200
    
    return jsonify({"error": "Type de fichier non autorisé"}), 400

@app.route('/api/flashcards', methods=['GET'])
def get_all_flashcard_sets():
    """Récupérer tous les jeux de flashcards"""
    result = []
    
    for set_id, card_set in FLASHCARDS_DB.items():
        result.append({
            "id": set_id,
            "title": card_set["title"],
            "source": card_set.get("source", ""),
            "creation_date": card_set.get("creation_date", ""),
            "count": len(card_set["flashcards"])
        })
    
    return jsonify(result), 200

@app.route('/api/flashcards/<set_id>', methods=['GET'])
def get_flashcard_set(set_id):
    """Récupérer un jeu spécifique de flashcards"""
    if set_id not in FLASHCARDS_DB:
        return jsonify({"error": "Jeu de flashcards non trouvé"}), 404
    
    return jsonify(FLASHCARDS_DB[set_id]), 200

@app.route('/api/flashcards/<set_id>', methods=['PUT'])
def update_flashcard_set(set_id):
    """Mettre à jour un jeu spécifique de flashcards"""
    if set_id not in FLASHCARDS_DB:
        return jsonify({"error": "Jeu de flashcards non trouvé"}), 404
    
    data = request.json
    
    # Mise à jour du jeu de flashcards
    if "title" in data:
        FLASHCARDS_DB[set_id]["title"] = data["title"]
    
    if "flashcards" in data:
        FLASHCARDS_DB[set_id]["flashcards"] = data["flashcards"]
    
    return jsonify({
        "success": True,
        "message": "Jeu de flashcards mis à jour avec succès",
        "set_id": set_id
    }), 200

@app.route('/api/flashcards/<set_id>/cards/<card_id>', methods=['PUT'])
def update_flashcard(set_id, card_id):
    """Mettre à jour une carte spécifique"""
    if set_id not in FLASHCARDS_DB:
        return jsonify({"error": "Jeu de flashcards non trouvé"}), 404
    
    data = request.json
    
    # Recherche de la carte
    card_index = None
    for i, card in enumerate(FLASHCARDS_DB[set_id]["flashcards"]):
        if card["id"] == card_id:
            card_index = i
            break
    
    if card_index is None:
        return jsonify({"error": "Carte non trouvée"}), 404
    
    # Mise à jour des champs de la carte
    for key, value in data.items():
        FLASHCARDS_DB[set_id]["flashcards"][card_index][key] = value
    
    return jsonify({
        "success": True,
        "message": "Carte mise à jour avec succès",
        "card": FLASHCARDS_DB[set_id]["flashcards"][card_index]
    }), 200

@app.route('/api/flashcards/<set_id>', methods=['DELETE'])
def delete_flashcard_set(set_id):
    """Supprimer un jeu spécifique de flashcards"""
    if set_id not in FLASHCARDS_DB:
        return jsonify({"error": "Jeu de flashcards non trouvé"}), 404
    
    del FLASHCARDS_DB[set_id]
    
    return jsonify({
        "success": True,
        "message": "Jeu de flashcards supprimé avec succès"
    }), 200

@app.route('/api/generate', methods=['POST'])
def generate_from_text():
    """Générer des flashcards à partir d'un texte fourni directement"""
    data = request.json
    
    if not data or "text" not in data:
        return jsonify({"error": "Aucun texte fourni"}), 400
    
    text = data["text"]
    num_cards = data.get("num_cards", 5)
    title = data.get("title", "Flashcards générées")
    
    # Génération des flashcards
    flashcards = generate_flashcards_from_text(text, num_cards)
    
    # Stockage des flashcards dans notre "base de données"
    set_id = str(uuid.uuid4())
    FLASHCARDS_DB[set_id] = {
        "title": title,
        "source": "Texte manuel",
        "creation_date": datetime.datetime.now().isoformat(),
        "flashcards": flashcards
    }
    
    return jsonify({
        "success": True,
        "message": "Flashcards générées avec succès",
        "set_id": set_id,
        "title": title,
        "flashcards": flashcards
    }), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')