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

- Python 3.8 or higher (for local development)
- Node.js 18.x or higher (for local development)
- Docker and Docker Compose (for containerized deployment)
- A Google Gemini API key (free)

## Installation

### Using Docker (recommended)

```bash
# Copy environment files
cp backend/.env.example backend/.env
cp .env.example .env

# Edit backend/.env to add your Gemini API key
# GEMINI_API_KEY=your_key_here

# Start the application with Docker Compose
docker compose up --build
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### With Make (local development)

```bash
# Install all dependencies
make setup

# Configure Gemini API key in backend/.env
```

### Manual Installation (local development)

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

### With Docker

```bash
# Start all services
docker compose up

# Start in detached mode
docker compose up -d

# Rebuild and start
docker compose up --build

# Stop all services
docker compose down
```

### With Make (local development)

```bash
# Terminal 1: Start the backend
make run-backend

# Terminal 2: Start the frontend
make run-frontend
```

### Manual Start (local development)

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

## Environment Configuration

### Backend (.env)
```
GEMINI_API_KEY=your_gemini_api_key
FLASK_APP=app.py
FLASK_ENV=development
FLASK_DEBUG=1
PORT=5000
HOST=0.0.0.0
```

### Frontend (.env)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

When using Docker Compose, the frontend will automatically connect to the backend service.

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

## Deployment

The project includes configuration files for deployment:
- `vercel.json` for deploying the frontend to Vercel
- Docker configuration for containerized deployment

## License

This project is under MIT license - see the LICENSE file for more details.
