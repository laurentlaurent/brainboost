# BrainBoost

BrainBoost is an interactive web application that uses AI to generate flashcards from various types of content. The application facilitates learning by automatically transforming PDF documents, images, or text into question-answer cards.

## Features

- **PDF Import**: Import PDFs
- **Automatic AI Generation**: creation of relevant question-answer cards using Google Gemini AI
- **Interactive Study Mode**: review your cards with different learning modes
- **Progress Tracking**: evaluate your mastery of concepts
- **Responsive Interface**: usable on computer, tablet, or mobile

## Project Architecture

The project is divided into two main parts:

- **Backend** (Flask): API for file processing and integration with Gemini AI
- **Frontend** (Next.js): Interactive and responsive user interface

## Prerequisites

- Python 3.8 or higher
- Node.js 18.x or higher
- A Google Gemini API key (free)

## Installation

### With Make (recommended)

```bash
# Install all dependencies
make setup

# Configure Gemini API key in backend/.env
```

### Manual Installation

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # Configure Gemini API key
```

#### Frontend

```bash
cd frontend
npm install
```

## Starting the Application

### With Make

```bash
# Terminal 1: Start the backend
make run-backend

# Terminal 2: Start the frontend
make run-frontend
```

### Manual Start

#### Backend

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python app.py
```

#### Frontend

```bash
cd frontend
npm run dev
```

## Getting a Gemini API Key

1. Visit [Google AI Studio](https://ai.google.dev/)
2. Create an account if needed
3. Access the API section and create an API key
4. Copy this key into the `backend/.env` file

## Tests

To verify that the Gemini API is working correctly:

```bash
make test-backend
```

## License

This project is under MIT license - see the LICENSE file for more details.