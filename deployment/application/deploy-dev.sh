#!/bin/bash

# Connexion à l'instance EC2 et téléversement des fichiers
echo "Connexion à EC2 et déploiement..."

# Sauvegarder l'image de développement dans le fichier env
echo IMAGE_NAME=$DEV_IMAGE >> .secure_files/env.dev
echo ECR_URI=$ECR_URI >> .secure_files/env.dev

# Copier les fichiers nécessaires sur l'instance EC2
scp -i .secure_files/trinity-dev-key-pair.pem .secure_files/env.dev ubuntu@$EC2_PUBLIC_IP:/home/ubuntu/.env
scp -i .secure_files/trinity-dev-key-pair.pem docker-compose.yml ubuntu@$EC2_PUBLIC_IP:/home/ubuntu/docker-compose.yml

# Exécution des commandes à distance via SSH
ssh -i .secure_files/trinity-dev-key-pair.pem ubuntu@$EC2_PUBLIC_IP << 'EOF'
  source /home/ubuntu/.env
  aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin $ECR_URI
  docker-compose -f /home/ubuntu/docker-compose.yml down
  docker-compose -f /home/ubuntu/docker-compose.yml pull
  docker-compose -f /home/ubuntu/docker-compose.yml up -d
EOF
