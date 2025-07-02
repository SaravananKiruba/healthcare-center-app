#!/bin/bash

# Update packages
sudo apt-get update
sudo apt-get -y upgrade

# Install Docker and Docker Compose
sudo apt-get install -y docker.io docker-compose
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker ubuntu

# Clone the repository (replace with your actual repository)
# git clone https://github.com/yourusername/healthcare-center-app.git
# cd healthcare-center-app

# Build and run the Docker container
sudo docker build -t healthcare-api .
sudo docker run -d --name healthcare-api-container \
    -p 8000:8000 \
    -e PRODUCTION_FRONTEND_URL=https://your-cloudfront-distribution-id.cloudfront.net \
    -e ALLOWED_ORIGINS=https://your-cloudfront-distribution-id.cloudfront.net \
    -v $(pwd)/backend/healthcare.db:/app/backend/healthcare.db \
    healthcare-api

# Install Nginx
sudo apt-get install -y nginx

# Configure Nginx as a reverse proxy
cat > /tmp/healthcare-nginx.conf << 'EOL'
server {
    listen 80;
    server_name your-api-domain-name.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOL

sudo mv /tmp/healthcare-nginx.conf /etc/nginx/sites-available/healthcare
sudo ln -s /etc/nginx/sites-available/healthcare /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Install Certbot for HTTPS (optional)
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-api-domain-name.com
