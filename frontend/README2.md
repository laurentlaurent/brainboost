# Project Anki Review

This project combines a [Next.js](https://nextjs.org) frontend with a Flask backend to create a flashcard system that aims to extract content from PDFs and manage flashcards for effective studying.

## Features To Do

- PDF file upload and text extraction (to do)
- Flashcard creation from uploaded documents (to do)
- Flashcard management (create, edit, delete) (to do)
- Flashcard review system (to do)
- Quiz mode for testing knowledge (to do)

## Getting Started

### Backend Setup

First, set up and run the Flask backend:

```bash
cd backend

# Optional: Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows, use: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the backend server
python app.py
```

The backend will run on http://localhost:5000.

### Frontend Setup

In a separate terminal, set up and run the Next.js frontend:

```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev

```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

- `/backend`: Flask API server
  - `/uploads`: Storage for uploaded files
  - `app.py`: Main backend application
  
- `/frontend`: Next.js frontend application
  - `/src/components`: React components
    - `/file-upload`: Components for file uploading
    - `/flashcards`: Components for flashcard editing and viewing
    - `/ui`: Reusable UI components
  - `/src/app`: Next.js application pages

## Using the Application

1. Launch both the backend and frontend servers as described above
2. Navigate to http://localhost:3000 in your browser
3. Upload a PDF document using the file upload interface
4. Edit and manage your flashcards through the intuitive UI (to-do)
5. Use the quiz mode to test your knowledge (to do)

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Python-Flask CORS](https://flask-cors.readthedocs.io/en/latest/)
- [PyPDF Documentation](https://pypdf.readthedocs.io/en/stable/)
