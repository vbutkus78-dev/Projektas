# 🚀 Prekių užsakymų sistemos diegimo instrukcija

## 📋 Turinys
1. [Production sistemos paleidimas](#production-sistemos-paleidimas)
2. [serveriai.lt diegimas](#serveriailt-diegimas)
3. [Cloudflare Pages diegimas](#cloudflare-pages-diegimas)
4. [Konfigūracijos parametrai](#konfigūracijos-parametrai)

---

## 🎯 Production sistemos paleidimas

### 1. **Sistemos reikalavi

**Minimalūs reikalavimai:**
- Node.js 18+ 
- Git
- Internetinė prieiga
- Domeno vardas (neprivalomas)

**Rekomenduojami:**
- 2+ GB RAM
- 20+ GB SSD
- SSL sertifikatas

### 2. **Aplinkos paruošimas**

```bash
# 1. Klonuokite projektą
git clone <jūsų-repository-url>
cd webapp

# 2. Įdiekite priklausomybes
npm install

# 3. Sukurkite aplinkos kintamuosius
cp .env.example .env

# 4. Redaguokite .env failą
nano .env
```

**Privalomi aplinkos kintamieji (.env):**
```bash
# Duomenų bazė
DATABASE_URL=sqlite:./data/production.db

# JWT saugumas
JWT_SECRET=jūsų-super-slaptas-raktas-256-bitų

# Serverio konfigūracija
PORT=3000
NODE_ENV=production
APP_URL=https://jūsų-domenas.lt

# Email notifikacijos (neprivaloma)
SENDGRID_API_KEY=jūsų-sendgrid-api-raktas
FROM_EMAIL=noreply@jūsų-domenas.lt
FROM_NAME=Prekių užsakymų sistema

# Failų saugykla (neprivaloma)
R2_ACCOUNT_ID=jūsų-cloudflare-account-id
R2_ACCESS_KEY_ID=jūsų-r2-access-key
R2_SECRET_ACCESS_KEY=jūsų-r2-secret-key
R2_BUCKET_NAME=webapp-files
```

### 3. **Duomenų bazės setup**

```bash
# Sukurkite duomenų katalogą
mkdir -p data

# Sukurkite duomenų bazę ir lentelės
npm run db:setup

# Užpildykite test duomenimis (pasirinktinai)
npm run db:seed
```

### 4. **Production build ir paleidimas**

```bash
# Sukurkite production build
npm run build

# Paleiskite su PM2 (rekomenduojama)
npm install -g pm2
pm2 start ecosystem.config.js --env production

# ARBA tiesiogiai su Node.js
npm start
```

### 5. **Nginx konfigūracija** (rekomenduojama)

```nginx
# /etc/nginx/sites-available/webapp
server {
    listen 80;
    server_name jūsų-domenas.lt;
    
    # SSL konfigūracija (Certbot automatiškai pridės)
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Aktyvuokite site
sudo ln -s /etc/nginx/sites-available/webapp /etc/nginx/sites-enabled/
sudo systemctl restart nginx

# Gaukite SSL sertifikatą
sudo certbot --nginx -d jūsų-domenas.lt
```

---

## 🏢 serveriai.lt diegimas

### **1. Serverio užsakymas**

1. **Eikite į** https://serveriai.lt
2. **Pasirinkite** VPS/Virtualų serverį
3. **Rekomenduojamos specifikacijos:**
   - 2 GB RAM
   - 2 CPU cores
   - 40 GB SSD
   - Ubuntu 22.04 LTS

### **2. Serverio paruošimas**

```bash
# Prisijunkite prie serverio
ssh root@jūsų-serverio-ip

# Atnaujinkite sistemą
apt update && apt upgrade -y

# Įdiekite reikalingą software
apt install -y nodejs npm nginx git sqlite3 certbot python3-certbot-nginx

# Sukurkite vartotoją aplikacijai
adduser webapp
usermod -aG sudo webapp
su - webapp
```

### **3. Projekto deployment**

```bash
# Kaip webapp vartotojas
cd /home/webapp

# Klonuokite projektą
git clone <jūsų-git-repository-url> webapp
cd webapp

# Įdiekite dependencies
npm install

# Setup aplinkos
cp .env.example .env
nano .env  # Redaguokite pagal jūsų duomenis

# Setup duomenų bazė
mkdir -p data
npm run db:setup
npm run db:seed  # Test duomenys

# Build production
npm run build

# Įdiekite PM2 globally
sudo npm install -g pm2

# Paleiskite aplikaciją
pm2 start ecosystem.config.js --env production

# Auto-start po serverio restart
pm2 save
pm2 startup
```

### **4. Nginx konfigūracija serveriai.lt**

```bash
# Kaip root vartotojas
sudo nano /etc/nginx/sites-available/webapp
```

```nginx
server {
    listen 80;
    server_name jūsų-domenas.lt www.jūsų-domenas.lt;
    
    client_max_body_size 10M;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Static files cache
    location /static/ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Aktyvuokite
sudo ln -s /etc/nginx/sites-available/webapp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# SSL sertifikatas
sudo certbot --nginx -d jūsų-domenas.lt -d www.jūsų-domenas.lt
```

### **5. Domeno konfigūracija**

1. **Eikite į domeno registratorių** (pvz., serveriai.lt domeno valdymas)
2. **Nustatykite A įrašus:**
   ```
   @ (root)  -> jūsų-serverio-ip
   www       -> jūsų-serverio-ip
   ```
3. **Palaukite DNS propagation** (iki 24h)

### **6. Monitoring ir maintenance**

```bash
# PM2 monitoring
pm2 monit

# Logai
pm2 logs webapp

# Restart aplikaciją
pm2 restart webapp

# Nginx logai
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Backup duomenų bazės
cp /home/webapp/webapp/data/production.db /home/webapp/backup-$(date +%Y%m%d).db

# Auto backup script (crontab)
0 2 * * * cp /home/webapp/webapp/data/production.db /home/webapp/backups/backup-$(date +\%Y\%m\%d).db
```

---

## ☁️ Cloudflare Pages diegimas (alternatyva)

### **1. Paruošimas**

```bash
# Jūsų lokaliai mašinoje
npm install -g wrangler

# Prisijungimas
wrangler login
```

### **2. Cloudflare konfigūracija**

```bash
# Sukurkite D1 duomenų bazę
wrangler d1 create webapp-production

# Nustatykite database ID wrangler.toml
# Copy ID iš command output

# Sukurkite R2 bucket failams
wrangler r2 bucket create webapp-files

# Apply database schema
wrangler d1 migrations apply webapp-production
```

### **3. Secrets konfigūracija**

```bash
# JWT secret
wrangler pages secret put JWT_SECRET

# SendGrid (jei naudojate)
wrangler pages secret put SENDGRID_API_KEY
wrangler pages secret put FROM_EMAIL

# R2 credentials
wrangler pages secret put R2_ACCOUNT_ID
wrangler pages secret put R2_ACCESS_KEY_ID
wrangler pages secret put R2_SECRET_ACCESS_KEY
```

### **4. Deployment**

```bash
# Build ir deploy
npm run build
wrangler pages deploy dist --project-name webapp

# Custom domain (neprivalomas)
wrangler pages domain add jūsų-domenas.lt --project-name webapp
```

---

## ⚙️ Konfigūracijos parametrai

### **Email notifikacijos (SendGrid)**

1. **Registruokitės** https://sendgrid.com
2. **Sukurkite API key:**
   - Settings → API Keys → Create API Key
   - Restricted Access → Mail Send permissions
3. **Verify sender email:**
   - Marketing → Sender Authentication
   - Single Sender Verification

### **SSL sertifikatas**

```bash
# Let's Encrypt (nemokamas)
sudo certbot --nginx -d jūsų-domenas.lt

# Auto-renewal
sudo crontab -e
# Pridėkite:
0 12 * * * /usr/bin/certbot renew --quiet
```

### **Firewall setup**

```bash
# UFW firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw status
```

### **Backup strategija**

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d)
BACKUP_DIR="/home/webapp/backups"
DB_PATH="/home/webapp/webapp/data/production.db"

mkdir -p $BACKUP_DIR
cp $DB_PATH $BACKUP_DIR/webapp-$DATE.db

# Išsaugoti tik 30 dienų backups
find $BACKUP_DIR -name "webapp-*.db" -mtime +30 -delete
```

---

## 🔧 Troubleshooting

### **Dažnos problemos:**

1. **Port 3000 užimtas:**
   ```bash
   sudo lsof -ti:3000 | xargs sudo kill -9
   ```

2. **Permission errors:**
   ```bash
   sudo chown -R webapp:webapp /home/webapp/webapp
   ```

3. **Nginx 502 error:**
   ```bash
   # Patikrinkite ar aplikacija veikia
   pm2 status
   # Patikrinkite nginx config
   sudo nginx -t
   ```

4. **Database locked:**
   ```bash
   # Restart aplikaciją
   pm2 restart webapp
   ```

### **Performance optimization:**

```bash
# PM2 cluster mode (multi-core)
pm2 start ecosystem.config.js --env production -i max

# Nginx compression
# Pridėkite į nginx config:
gzip on;
gzip_vary on;
gzip_min_length 10240;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

---

## 📞 Support

Jei kyla problemų:

1. **Patikrinkite logus:** `pm2 logs webapp`
2. **Nginx logai:** `sudo tail -f /var/log/nginx/error.log`
3. **Database permissions:** `ls -la data/`
4. **Aplinkos kintamieji:** `cat .env`

**Sistema pilnai paruošta production naudojimui!** 🎉