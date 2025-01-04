#!/bin/bash

# Connexion à l'instance EC2 et téléversement des fichiers
echo "Connexion à EC2 et déploiement..."

# Téléchargement des variables d'environnement
gitlab-ci env.dev download --file .env

# Sauvegarder l'image de développement dans le fichier env
echo IMAGE_NAME=$DEV_IMAGE >> env

# Copier les fichiers nécessaires sur l'instance EC2
scp -i /tmp/.secure_files/trinity-dev-key.pem .env ubuntu@$EC2_PUBLIC_IP:/home/ubuntu/.env
scp -i /tmp/.secure_files/trinity-dev-key.pem docker-compose.yml ubuntu@$EC2_PUBLIC_IP:/home/ubuntu/docker-compose.yml

# Exécution des commandes à distance via SSH
ssh -i /tmp/.secure_files/trinity-dev-key.pem ubuntu@$EC2_PUBLIC_IP << 'EOF'
  source /home/ubuntu/.env
  docker-compose -f /home/ubuntu/docker-compose.yml down
  docker-compose -f /home/ubuntu/docker-compose.yml pull
  docker-compose -f /home/ubuntu/docker-compose.yml up -d
EOF
