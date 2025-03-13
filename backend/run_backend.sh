#!/bin/bash

# Activer l'environnement virtuel
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
VENV_DIR="${SCRIPT_DIR}/venv"
ENV_FILE="${SCRIPT_DIR}/.env"

if [ ! -d "${VENV_DIR}" ]; then
    echo "Environnement virtuel non trouvé. Veuillez exécuter 'make setup-backend' d'abord."
    exit 1
fi

# Vérifier si le fichier .env existe
if [ ! -f "${ENV_FILE}" ]; then
    echo "Fichier .env non trouvé. Veuillez exécuter 'make setup-backend' d'abord."
    exit 1
fi

# Charger les variables d'environnement depuis .env
echo "Chargement des variables d'environnement..."
set -a
source "${ENV_FILE}"
set +a

# Activer l'environnement virtuel et exécuter l'application
source "${VENV_DIR}/bin/activate"
cd "${SCRIPT_DIR}"
python app.py
