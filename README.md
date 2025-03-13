# BrainBoost

BrainBoost is an interactive web application that uses AI to generate flashcards from various types of content. The application facilitates learning by automatically transforming PDF documents, images, or text into question-answer cards.

BrainBoost was built in just 24 hours during a hackathon by:
- [Laurent](https://github.com/laurentlaurent/)
- [Pierre-Henri](https://github.com/phlearning)

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
- A NeonDB account (free tier available) for production database

## Installation

### Setting up NeonDB (for production)

1. Create a NeonDB account at [https://neon.tech](https://neon.tech)
2. Create a new project
3. In your project dashboard:
   - Click "Connection Details"
   - Select "Prisma" to get the connection string
   - Copy the connection string that starts with `postgresql://` (not `postgres://`)
4. Update your `.env.backend` file with the connection string:
   ```bash
   DATABASE_URL=postgresql://your-user:your-password@your-endpoint/your-database?sslmode=require
   ```

> **Important**: Use the connection string that starts with `postgresql://` (not `postgres://`) to avoid configuration issues.

### Using Docker (recommended)

```bash
# Copy environment files
cp .env.backend.example .env.backend
cp .env.frontend.example .env.frontend

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

### Backend (.env.backend)
```bash
# API Keys
GEMINI_API_KEY=your_gemini_api_key

# Configuration Flask
FLASK_APP=app.py
FLASK_ENV=development
FLASK_DEBUG=1

# Server Configuration
PORT=5000
HOST=0.0.0.0

# Database Configuration
# For local development with Docker:
DATABASE_URL=postgresql://brainboost:brainboost@postgres:5432/brainboost

# For production with NeonDB:
# DATABASE_URL=postgresql://your-user:your-password@your-endpoint/your-database?sslmode=require
```

### Frontend (.env.frontend)
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
- `vercel.json` for deploying the frontend to Vercel and need to be changed accordingly to your own configuration
- Docker configuration for containerized deployment

## Screenshots

<details>
<summary>Click to view screenshots</summary>

### Home Page - Upload and manage your flashcards
![Home Page](screenshots/home.png)

### Document Upload - Import PDFs and generate flashcards
![Upload Page](screenshots/upload.png)

### Study Mode - Review your flashcards
![Study Mode](screenshots/study.png)

### Quiz Mode - Test your knowledge
![Quiz Mode](screenshots/quiz.png)

</details>

## License

This project is under MIT license - see the LICENSE file for more details.
