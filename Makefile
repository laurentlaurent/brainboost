.PHONY: setup setup-backend setup-frontend run run-backend run-frontend clean help

# Default target
.DEFAULT_GOAL := help

# Colors for terminal output
YELLOW=\033[1;33m
GREEN=\033[1;32m
NC=\033[0m # No Color

help:
	@echo "${YELLOW}Project-Anki-Review Makefile Commands:${NC}"
	@echo "${GREEN}make setup${NC} - Install all dependencies for both backend and frontend"
	@echo "${GREEN}make setup-backend${NC} - Install backend dependencies only"
	@echo "${GREEN}make setup-frontend${NC} - Install frontend dependencies only"
	@echo "${GREEN}make run${NC} - Run both backend and frontend in separate terminals"
	@echo "${GREEN}make run-backend${NC} - Run backend server only"
	@echo "${GREEN}make run-frontend${NC} - Run frontend development server only"
	@echo "${GREEN}make clean${NC} - Remove virtual environments and node modules"

setup: setup-backend setup-frontend
	@echo "${GREEN}✓ Setup completed for both backend and frontend${NC}"

setup-backend:
	@echo "${YELLOW}Setting up backend...${NC}"
	cd backend && \
	python -m venv venv && \
	. venv/bin/activate && \
	pip install -r requirements.txt
	@echo "${GREEN}✓ Backend setup complete${NC}"

setup-frontend:
	@echo "${YELLOW}Setting up frontend...${NC}"
	cd frontend && npm install
	@echo "${GREEN}✓ Frontend setup complete${NC}"

run:
	@echo "${YELLOW}Starting backend and frontend servers...${NC}"
	@echo "${GREEN}Backend will run at: http://localhost:5000${NC}"
	@echo "${GREEN}Frontend will run at: http://localhost:3000${NC}"
	@gnome-terminal --title="Backend Server" -- bash -c "cd backend && source venv/bin/activate && python app.py; exec bash" || \
	xterm -T "Backend Server" -e "cd backend && source venv/bin/activate && python app.py; exec bash" || \
	konsole --new-tab -p tabtitle="Backend Server" -e "cd backend && source venv/bin/activate && python app.py; exec bash" || \
	x-terminal-emulator -T "Backend Server" -e "cd backend && source venv/bin/activate && python app.py; exec bash" || \
	echo "${YELLOW}Could not open terminal automatically for backend. Please run 'make run-backend' in a separate terminal.${NC}" &
	@sleep 2
	@gnome-terminal --title="Frontend Server" -- bash -c "cd frontend && npm run dev; exec bash" || \
	xterm -T "Frontend Server" -e "cd frontend && npm run dev; exec bash" || \
	konsole --new-tab -p tabtitle="Frontend Server" -e "cd frontend && npm run dev; exec bash" || \
	x-terminal-emulator -T "Frontend Server" -e "cd frontend && npm run dev; exec bash" || \
	echo "${YELLOW}Could not open terminal automatically for frontend. Please run 'make run-frontend' in a separate terminal.${NC}" &

run-backend:
	@echo "${YELLOW}Starting backend server...${NC}"
	cd backend && . venv/bin/activate && python app.py

run-frontend:
	@echo "${YELLOW}Starting frontend server...${NC}"
	cd frontend && npm run dev

clean:
	@echo "${YELLOW}Cleaning up...${NC}"
	rm -rf backend/venv
	rm -rf frontend/node_modules
	@echo "${GREEN}✓ Cleanup complete${NC}"

# Check if the requirements.txt exists, create it if not
backend/requirements.txt:
	@echo "${YELLOW}Creating requirements.txt...${NC}"
	@echo "flask\nflask-cors\npypdf\npillow\npython-dotenv" > backend/requirements.txt
	@echo "${GREEN}✓ requirements.txt created${NC}"

# Ensure requirements.txt exists before setup-backend
setup-backend: backend/requirements.txt