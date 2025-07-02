#!/bin/bash

# Set variables (edit these values)
S3_BUCKET_NAME="healthcare-center-app"
CLOUDFRONT_DISTRIBUTION_ID="your-cloudfront-distribution-id"
EC2_HOST="ec2-xx-xx-xx-xx.compute-1.amazonaws.com"
EC2_USER="ec2-user"
SSH_KEY_PATH="~/.ssh/your-ec2-key.pem"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check dependencies
command -v aws >/dev/null 2>&1 || { echo -e "${RED}Error: AWS CLI is not installed.${NC}" >&2; exit 1; }

# Deploy frontend
deploy_frontend() {
  echo -e "${YELLOW}Building React frontend...${NC}"
  npm run build
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}Frontend build failed!${NC}"
    exit 1
  fi
  
  echo -e "${YELLOW}Deploying to S3...${NC}"
  aws s3 sync build/ s3://$S3_BUCKET_NAME/ --delete
  
  echo -e "${YELLOW}Invalidating CloudFront cache...${NC}"
  aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*"
  
  echo -e "${GREEN}Frontend deployment complete!${NC}"
}

# Deploy backend
deploy_backend() {
  echo -e "${YELLOW}Deploying backend to EC2...${NC}"
  ssh -i $SSH_KEY_PATH $EC2_USER@$EC2_HOST 'bash -s' << 'EOF'
    cd ~/healthcare-center-app
    git pull
    docker-compose down
    docker-compose build
    docker-compose up -d
EOF
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}Backend deployment failed!${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}Backend deployment complete!${NC}"
}

# Main menu
echo -e "${YELLOW}Healthcare Center App Deployment${NC}"
echo "1. Deploy frontend only"
echo "2. Deploy backend only"
echo "3. Deploy both"
echo "4. Exit"

read -p "Select an option: " option

case $option in
  1)
    deploy_frontend
    ;;
  2)
    deploy_backend
    ;;
  3)
    deploy_frontend
    deploy_backend
    ;;
  4)
    exit 0
    ;;
  *)
    echo -e "${RED}Invalid option${NC}"
    exit 1
    ;;
esac

echo -e "${GREEN}Deployment completed successfully!${NC}"
