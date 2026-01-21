# ELIMUCORE Production Deployment Guide

**Version**: 1.2.0 (Pilot)  
**Status**: Ready for Deployment  
**Last Updated**: January 21, 2026  
**Target**: 5-10 Pilot Schools

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Server Setup](#server-setup)
3. [Database Configuration](#database-configuration)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [SSL/HTTPS Setup](#ssltls-setup)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start

**Prerequisites**:
- Linux VPS (Ubuntu 22.04 or 24.04)
- SSH access to server
- Domain name (example: `school1.elimucore.io`)
- 2GB RAM minimum, 20GB storage

**Deployment Time**: ~45 minutes (one-time setup)

---

## Server Setup

### 1. Rent a VPS

**Recommended Providers**:
- **DigitalOcean**: $6/month (1GB RAM) → $12/month (2GB RAM for production)
- **Linode**: $6/month (1GB) → $12/month (2GB)
- **AWS Lightsail**: $5/month (1GB) → $12/month (2GB)
- **Hetzner**: €5/month (2GB) → €10/month (4GB)

**Recommended Specs for Pilot**:
- **Minimum**: 2GB RAM, 20GB SSD, 1 vCPU
- **Better**: 4GB RAM, 40GB SSD, 2 vCPU (handles 500+ users)

### 2. Initial Server Setup

**SSH into server**:
```bash
ssh root@YOUR_SERVER_IP
```

**Update system packages**:
```bash
apt update && apt upgrade -y
```

**Create non-root user** (recommended for security):
```bash
adduser elimucore
usermod -aG sudo elimucore
su - elimucore
```

**Install essential tools**:
```bash
sudo apt install -y curl wget git vim htop
```

---

## Database Configuration

### 1. Install MySQL

```bash
sudo apt install -y mysql-server
```

**Start MySQL**:
```bash
sudo systemctl start mysql
sudo systemctl enable mysql
```

**Secure MySQL installation** (set root password):
```bash
sudo mysql_secure_installation
```

When prompted:
- Set root password: `YES` → Choose strong password
- Remove anonymous users: `YES`
- Disable remote root login: `YES`
- Remove test database: `YES`
- Reload privilege tables: `YES`

### 2. Create Production Database & User

**Connect to MySQL**:
```bash
sudo mysql -u root -p
```

**Create database and user**:
```sql
CREATE DATABASE elimucore_school1;

CREATE USER 'elimucore_user'@'localhost' IDENTIFIED BY 'StrongPassword123!@';

GRANT ALL PRIVILEGES ON elimucore_school1.* TO 'elimucore_user'@'localhost';

FLUSH PRIVILEGES;

EXIT;
```

**Test connection**:
```bash
mysql -u elimucore_user -p -h localhost elimucore_school1
```

### 3. Enable MySQL Backup

**Create backup directory**:
```bash
mkdir -p ~/mysql-backups
```

**Add cron job for daily backups** (edit crontab):
```bash
crontab -e
```

Add this line (backup daily at 2 AM):
```
0 2 * * * mysqldump -u elimucore_user -p'StrongPassword123!@' elimucore_school1 > ~/mysql-backups/elimucore_school1_$(date +\%Y\%m\%d_\%H\%M\%S).sql
```

---

## Backend Deployment

### 1. Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

**Verify installation**:
```bash
node -v && npm -v
```

### 2. Clone ELIMUCORE Repository

```bash
cd ~/
git clone https://github.com/emanuelkirui263/elimucore.git
cd elimucore/backend
```

### 3. Install Dependencies

```bash
npm install
```

**Expected output**: Should complete without errors (~2-3 minutes)

### 4. Configure Environment Variables

**Create .env file**:
```bash
cp .env.example .env
nano .env
```

**Update these values**:
```env
# Database
DB_NAME=elimucore_school1
DB_USER=elimucore_user
DB_PASSWORD=StrongPassword123!@
DB_HOST=localhost
DB_PORT=3306
DB_DIALECT=mysql

# Server
NODE_ENV=production
PORT=5000

# Authentication
JWT_SECRET=your-super-secret-key-min-32-chars-long-here
JWT_EXPIRY=7d

# Email (optional for pilot)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# CORS
ALLOWED_ORIGINS=https://school1.elimucore.io,https://admin.school1.elimucore.io

# API
API_BASE_URL=https://api.school1.elimucore.io

# Logging
LOG_LEVEL=info
```

**Save**: Press `Ctrl+O`, Enter, `Ctrl+X`

### 5. Run Database Migrations

```bash
npx sequelize db:migrate
npx sequelize db:seed:all
```

**Expected output**: "Executed successfully" messages

### 6. Test Backend Locally

```bash
npm start
```

**Expected output**:
```
Server running on port 5000
Database connected successfully
```

**Press Ctrl+C to stop**, then proceed to production deployment

### 7. Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

**Start backend with PM2**:
```bash
pm2 start npm --name "elimucore-backend" -- start
```

**Enable auto-restart on reboot**:
```bash
pm2 startup
pm2 save
```

**Verify it's running**:
```bash
pm2 list
```

---

## Frontend Deployment

### 1. Build React Frontend

```bash
cd ~/elimucore/frontend
npm install
npm run build
```

**Expected output**: `dist/` folder created with optimized production files

### 2. Install Nginx (Web Server + Reverse Proxy)

```bash
sudo apt install -y nginx
```

**Start Nginx**:
```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 3. Configure Nginx

**Create Nginx config** for your domain:
```bash
sudo nano /etc/nginx/sites-available/elimucore-school1
```

**Paste this configuration**:
```nginx
# API Backend
upstream elimucore_backend {
    server localhost:5000;
    keepalive 64;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name api.school1.elimucore.io school1.elimucore.io;
    return 301 https://$server_name$request_uri;
}

# API Server (HTTPS)
server {
    listen 443 ssl http2;
    server_name api.school1.elimucore.io;

    ssl_certificate /etc/letsencrypt/live/api.school1.elimucore.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.school1.elimucore.io/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    client_max_body_size 10M;

    location / {
        proxy_pass http://elimucore_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    access_log /var/log/nginx/elimucore_backend.log;
    error_log /var/log/nginx/elimucore_backend_error.log;
}

# Frontend Server (HTTPS)
server {
    listen 443 ssl http2;
    server_name school1.elimucore.io;

    ssl_certificate /etc/letsencrypt/live/school1.elimucore.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/school1.elimucore.io/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    root /home/elimucore/elimucore/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    access_log /var/log/nginx/elimucore_frontend.log;
    error_log /var/log/nginx/elimucore_frontend_error.log;
}
```

**Enable the site**:
```bash
sudo ln -s /etc/nginx/sites-available/elimucore-school1 /etc/nginx/sites-enabled/
```

**Test Nginx config**:
```bash
sudo nginx -t
```

**Reload Nginx**:
```bash
sudo systemctl reload nginx
```

---

## SSL/TLS Setup

### 1. Install Certbot (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Get Free SSL Certificate

**For both domains**:
```bash
sudo certbot certonly --nginx -d school1.elimucore.io -d api.school1.elimucore.io
```

**Follow prompts**:
- Enter email: `your-email@example.com`
- Agree to terms: `Y`
- Share email: `Y` (for renewal reminders)

**Expected output**: "Congratulations! Your certificate has been obtained"

### 3. Auto-Renew Certificates

```bash
sudo certbot renew --dry-run
sudo systemctl enable certbot.timer
```

---

## Monitoring & Maintenance

### 1. Monitor Server Resources

```bash
# Real-time monitoring
htop

# Disk usage
df -h

# Memory usage
free -h

# MySQL size
sudo du -sh /var/lib/mysql/
```

### 2. View Application Logs

```bash
# Backend logs
pm2 logs elimucore-backend

# Nginx error logs
sudo tail -f /var/log/nginx/elimucore_backend_error.log
sudo tail -f /var/log/nginx/elimucore_frontend_error.log

# MySQL logs
sudo tail -f /var/log/mysql/error.log
```

### 3. Check Application Status

```bash
# Backend status
pm2 status

# Nginx status
sudo systemctl status nginx

# MySQL status
sudo systemctl status mysql
```

### 4. Database Maintenance

**Weekly database backup** (manual):
```bash
mysqldump -u elimucore_user -p'StrongPassword123!@' elimucore_school1 > ~/backup_$(date +%Y%m%d).sql
```

**Check database size**:
```bash
mysql -u elimucore_user -p elimucore_school1 -e "SELECT table_name, ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb FROM information_schema.TABLES WHERE table_schema = 'elimucore_school1' ORDER BY size_mb DESC;"
```

### 5. Uptime Monitoring

Install uptime monitoring service:
```bash
# Simple cron job to monitor every 5 minutes
crontab -e
```

Add:
```
*/5 * * * * curl -f https://api.school1.elimucore.io/health || mail -s "ELIMUCORE Down" admin@school.com
```

---

## Deployment Checklist

Before going live:

- [ ] VPS provisioned (2GB RAM, 20GB SSD)
- [ ] MySQL installed and secured
- [ ] Database created with strong password
- [ ] Node.js v20+ installed
- [ ] Backend cloned and dependencies installed
- [ ] .env file configured with production values
- [ ] Database migrations completed
- [ ] Backend running on PM2
- [ ] Frontend built successfully
- [ ] Nginx configured and enabled
- [ ] SSL certificates obtained (Let's Encrypt)
- [ ] Both domains (API + Frontend) resolve
- [ ] API responds to requests (test with curl)
- [ ] Frontend loads in browser
- [ ] Database backups scheduled (daily 2 AM)
- [ ] Monitoring logs working
- [ ] Firewall rules configured

---

## Troubleshooting

### Backend Won't Start

**Check PM2 logs**:
```bash
pm2 logs elimucore-backend
```

**Common issues**:
- Port 5000 in use: `sudo lsof -i :5000`
- Database connection failed: Check .env DB_* variables
- Module not found: Run `npm install` again
- Node version mismatch: Ensure Node 18+: `node -v`

### Nginx 502 Bad Gateway

**Check if backend is running**:
```bash
pm2 list
curl http://localhost:5000
```

**Check Nginx error logs**:
```bash
sudo tail -f /var/log/nginx/elimucore_backend_error.log
```

### Database Connection Issues

**Test MySQL connection**:
```bash
mysql -u elimucore_user -p -h localhost elimucore_school1
```

**Check MySQL is running**:
```bash
sudo systemctl status mysql
sudo systemctl restart mysql
```

**Verify credentials in .env**:
```bash
grep DB_ /home/elimucore/elimucore/backend/.env
```

### SSL Certificate Expired

**Renew certificate**:
```bash
sudo certbot renew --force-renewal
sudo systemctl reload nginx
```

### Disk Space Running Out

**Check disk usage**:
```bash
df -h
```

**Clean up old files**:
```bash
# Remove old backups
rm ~/mysql-backups/elimucore_school1_*.sql.bak

# Clean npm cache
npm cache clean --force

# Check large files
du -sh ~/* | sort -h
```

### Frontend Shows Blank Page

**Check frontend build**:
```bash
ls -la /home/elimucore/elimucore/frontend/dist/
```

**Rebuild if missing**:
```bash
cd ~/elimucore/frontend
npm run build
```

**Check Nginx error log**:
```bash
sudo tail -f /var/log/nginx/elimucore_frontend_error.log
```

---

## Post-Deployment Testing

### Test 1: API Health Check

```bash
curl -X GET https://api.school1.elimucore.io/health
```

**Expected**: `{"status": "ok"}`

### Test 2: Login

```bash
curl -X POST https://api.school1.elimucore.io/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@school.com","password":"password123"}'
```

**Expected**: JWT token in response

### Test 3: Frontend Access

Open browser: `https://school1.elimucore.io`

**Expected**: Login page loads successfully

### Test 4: Database Query

```bash
mysql -u elimucore_user -p -h localhost elimucore_school1 -e "SELECT COUNT(*) as user_count FROM Users;"
```

**Expected**: Numeric count returned

### Test 5: SSL Certificate Valid

```bash
curl -I https://school1.elimucore.io
```

**Expected**: HTTP/2 200 in response, no SSL warnings

---

## Performance Optimization

### 1. Enable Gzip Compression

Edit Nginx config:
```bash
sudo nano /etc/nginx/nginx.conf
```

Add inside `http` block:
```nginx
gzip on;
gzip_types text/plain text/css text/javascript application/javascript application/json;
gzip_min_length 1000;
```

Reload:
```bash
sudo systemctl reload nginx
```

### 2. Increase File Descriptors

```bash
sudo nano /etc/security/limits.conf
```

Add:
```
elimucore soft nofile 65536
elimucore hard nofile 65536
```

### 3. Optimize MySQL

Edit MySQL config:
```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

Add:
```
max_connections = 500
query_cache_size = 16M
innodb_buffer_pool_size = 1G
```

Restart:
```bash
sudo systemctl restart mysql
```

---

## Scaling for Multiple Schools

For each additional school (school2, school3, etc.):

**1. Create new database**:
```bash
mysql -u root -p -e "CREATE DATABASE elimucore_school2;"
mysql -u root -p -e "CREATE USER 'elimucore_school2'@'localhost' IDENTIFIED BY 'Password456!@';"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON elimucore_school2.* TO 'elimucore_school2'@'localhost';"
```

**2. Clone .env and update**:
```bash
cp /home/elimucore/elimucore/backend/.env /home/elimucore/elimucore/backend/.env.school2
nano /home/elimucore/elimucore/backend/.env.school2
# Update: DB_NAME, JWT_SECRET, ALLOWED_ORIGINS
```

**3. Start new PM2 instance**:
```bash
pm2 start npm --name "elimucore-backend-school2" --cwd /home/elimucore/elimucore/backend -- start -- --config .env.school2
```

**4. Create separate Nginx config**:
```bash
sudo cp /etc/nginx/sites-available/elimucore-school1 /etc/nginx/sites-available/elimucore-school2
sudo sed -i 's/school1/school2/g' /etc/nginx/sites-available/elimucore-school2
sudo ln -s /etc/nginx/sites-available/elimucore-school2 /etc/nginx/sites-enabled/
```

---

## Contact & Support

**Emergency Issues**:
- Backend down: Restart with `pm2 restart elimucore-backend`
- Database down: Check `sudo systemctl status mysql`
- SSL expired: Run `sudo certbot renew --force-renewal`

**Documentation**: See SYSTEM_HEALTH_REPORT.md and INTEGRATION_GUIDE_V1_2_0.md

---

**Deployment Complete!** 🎉

Your ELIMUCORE v1.2.0 system is now live on `https://school1.elimucore.io`

Next: Test with teachers and gather feedback for v1.3.0 roadmap.
