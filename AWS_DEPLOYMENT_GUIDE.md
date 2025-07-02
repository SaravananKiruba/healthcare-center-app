# Healthcare Center App - AWS Free Tier Deployment Guide

This guide provides step-by-step instructions for deploying the Healthcare Center App using AWS Free Tier services.

## Architecture Overview

- **Frontend**: React app hosted on S3 and delivered globally via CloudFront
- **Backend**: FastAPI application running in Docker on an EC2 instance
- **Database**: SQLite database stored on the EC2 instance

## Prerequisites

- AWS Account with Free Tier access
- Domain name (optional)
- Basic knowledge of AWS services

## Frontend Deployment (S3 + CloudFront)

### 1. Build the React App

```bash
# Set up production environment variables
echo "REACT_APP_API_URL=https://your-api-domain-name.com" > .env.production

# Build the app
npm run build
```

### 2. Create and Configure S3 Bucket

1. Sign in to the AWS Management Console
2. Navigate to S3 service
3. Create a new bucket (e.g., `healthcare-center-app`)
   - Region: Choose a region close to your users
   - Uncheck "Block all public access"
   - Other settings: Keep defaults
4. Enable static website hosting:
   - Properties tab → Static website hosting → Enable
   - Index document: `index.html`
   - Error document: `index.html`
5. Create a bucket policy to make content public:
   - Permissions tab → Bucket policy → Edit
   - Paste the policy:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::healthcare-center-app/*"
       }
     ]
   }
   ```

### 3. Upload Files to S3

1. In the S3 bucket, click "Upload"
2. Add files from the `build` directory
3. Upload all files

### 4. Create a CloudFront Distribution

1. Navigate to CloudFront service
2. Create a new distribution
3. Origin Domain: Your S3 bucket website endpoint
   - Example: `healthcare-center-app.s3-website-us-east-1.amazonaws.com`
4. Configure settings:
   - Origin access: Public
   - Viewer protocol policy: Redirect HTTP to HTTPS
   - Cache policy: Managed-CachingOptimized
   - Origin request policy: CORS-S3Origin
   - Compress objects automatically: Yes
   - Default root object: `index.html`
5. Configure error pages:
   - Create custom error response for 403 and 404 errors
   - Response page path: `/index.html`
   - HTTP response code: 200

## Backend Deployment (EC2)

### 1. Launch an EC2 Instance

1. Navigate to EC2 service
2. Launch a new instance:
   - Name: `healthcare-api-server`
   - Amazon Machine Image: Amazon Linux 2023 or Ubuntu Server 22.04
   - Instance type: t2.micro (Free Tier eligible)
   - Key pair: Create a new key pair or select existing
   - Network settings: Allow SSH, HTTP, and HTTPS traffic
   - Configure storage: 8 GB (Free Tier limit)

### 2. Connect and Deploy

1. Connect to your instance via SSH:
   ```bash
   ssh -i /path/to/your-key.pem ec2-user@your-instance-public-ip
   ```

2. Install Docker:
   ```bash
   sudo yum update -y
   sudo yum install -y docker
   sudo systemctl start docker
   sudo systemctl enable docker
   sudo usermod -aG docker $USER
   ```

3. Deploy the application:
   - Clone your repository or upload files
   - Build and run the Docker container:
   ```bash
   sudo docker build -t healthcare-api .
   sudo docker run -d --name healthcare-api-container \
       -p 8000:8000 \
       -e PRODUCTION_FRONTEND_URL=https://your-cloudfront-distribution-id.cloudfront.net \
       -e ALLOWED_ORIGINS=https://your-cloudfront-distribution-id.cloudfront.net \
       -v $(pwd)/backend/healthcare.db:/app/backend/healthcare.db \
       healthcare-api
   ```

### 3. Set up Nginx as Reverse Proxy

1. Install Nginx:
   ```bash
   sudo yum install -y nginx
   ```

2. Configure Nginx:
   ```bash
   sudo nano /etc/nginx/conf.d/healthcare.conf
   ```

3. Add configuration:
   ```nginx
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
   ```

4. Start Nginx:
   ```bash
   sudo systemctl start nginx
   sudo systemctl enable nginx
   ```

### 4. Set up HTTPS with Certbot (Optional)

1. Install Certbot:
   ```bash
   sudo yum install -y certbot python3-certbot-nginx
   ```

2. Obtain and configure certificate:
   ```bash
   sudo certbot --nginx -d your-api-domain-name.com
   ```

## Database Backup

Set up automatic backups for your SQLite database:

1. Create a backup script:
   ```bash
   mkdir -p ~/db_backups
   nano ~/backup-db.sh
   ```

2. Add the script content:
   ```bash
   #!/bin/bash
   DATE=$(date +"%Y-%m-%d_%H-%M-%S")
   cp /path/to/your/healthcare.db ~/db_backups/healthcare_$DATE.db
   find ~/db_backups/ -name "healthcare_*.db" -type f -mtime +7 -delete
   ```

3. Make it executable:
   ```bash
   chmod +x ~/backup-db.sh
   ```

4. Set up a cron job:
   ```bash
   crontab -e
   ```

5. Add this line:
   ```
   0 0 * * * ~/backup-db.sh >> ~/backup.log 2>&1
   ```

## Monitoring and Maintenance

1. Check logs:
   ```bash
   sudo docker logs healthcare-api-container
   ```

2. Restart services:
   ```bash
   sudo docker restart healthcare-api-container
   sudo systemctl restart nginx
   ```

3. Update application:
   ```bash
   git pull
   sudo docker build -t healthcare-api .
   sudo docker stop healthcare-api-container
   sudo docker rm healthcare-api-container
   sudo docker run -d --name healthcare-api-container -p 8000:8000 -v $(pwd)/backend/healthcare.db:/app/backend/healthcare.db healthcare-api
   ```

## Cost Optimization

- EC2: Stay within 750 hours/month (one t2.micro instance running 24/7)
- S3: Keep under 5GB standard storage
- CloudFront: First 50GB data transfer out and 2,000,000 HTTP/HTTPS requests per month are free
- Data transfer: 100GB/month out to internet is free

## Troubleshooting

- **Frontend not loading**: Check S3 permissions and CloudFront distribution settings
- **Backend unavailable**: Check EC2 security groups, Docker container status
- **CORS errors**: Verify ALLOWED_ORIGINS in backend configuration
- **Database issues**: Check volume mounting and file permissions

## Security Best Practices

- Keep EC2 instance updated with security patches
- Use strong SSH keys and restrict access
- Configure security groups to allow only necessary traffic
- Set up proper IAM roles and permissions
- Enable AWS CloudTrail for auditing
- Regularly backup the database
