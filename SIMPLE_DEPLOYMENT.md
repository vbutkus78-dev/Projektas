# 🚀 Paprastas Projekto Perkėlimas į Serverį

## 📋 Kas Jums Reikia

### 1. Serveris
- **VPS serveris** (pvz., serveriai.lt, hostinger.lt, arba bet koks kitas)
- **Ubuntu 20.04/22.04** operacinė sistema
- **Root arba sudo prieiga**

### 2. Domenas (neprivalomas)
- Jei turite domeną: `jusu-imonė.lt`
- Jei neturite: naudosite serverio IP adresą

## 🔧 1 Žingsnis: Paruošti Serverį

### Prisijungti prie serverio
```bash
ssh root@your-server-ip
# arba
ssh your-username@your-server-ip
```

### Atnaujinti sistemą
```bash
sudo apt update && sudo apt upgrade -y
```

### Įdiegti reikiamus įrankius
```bash
# Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 (proceso valdymui)
sudo npm install -g pm2

# Nginx (web serveris)
sudo apt install nginx -y

# Git (kodui atsisiųsti)
sudo apt install git -y

# Unzip (failų išpakavimui)
sudo apt install unzip -y
```

## 📦 2 Žingsnis: Perkelti Projektą

### Variantas A: Per Git (rekomenduojama)

**1. Sukurti projektų katalogą:**
```bash
sudo mkdir -p /var/www
cd /var/www
```

**2. Nukopijuoti projektą:**
```bash
# Jei turite GitHub repo:
sudo git clone https://github.com/your-username/your-repo.git webapp

# Arba sukurti tuščią katalogą:
sudo mkdir webapp
cd webapp
```

### Variantas B: Per Failų Perkėlimą

**1. Sukurti projekto archyvą (vykdyti savo kompiuteryje):**
```bash
cd /home/user/webapp
tar -czf webapp-production.tar.gz *
```

**2. Perkelti į serverį (SCP/SFTP):**
```bash
scp webapp-production.tar.gz root@your-server-ip:/var/www/
```

**3. Išpakuoti serveryje:**
```bash
cd /var/www
sudo tar -xzf webapp-production.tar.gz -C webapp/
```

## ⚙️ 3 Žingsnis: Konfigūruoti Projektą

### 1. Nustatyti teises
```bash
cd /var/www/webapp
sudo chown -R www-data:www-data .
sudo chmod -R 755 .
```

### 2. Įdiegti priklausomybes
```bash
cd /var/www/webapp
sudo npm install --production
```

### 3. Sukurti aplinkos kintamuosius
```bash
sudo nano .env
```

**Įrašyti į .env failą:**
```
NODE_ENV=production
PORT=3000
JWT_SECRET=your-very-secure-jwt-secret-here-change-this
SENDGRID_API_KEY=your-sendgrid-api-key-if-you-have-one
FROM_EMAIL=info@jusu-imone.lt
DATABASE_PATH=./production.db
```

### 4. Sukurti duomenų bazę
```bash
cd /var/www/webapp

# Sukurti duomenų bazės katalogą
sudo mkdir -p db
sudo chown www-data:www-data db

# Paleisti migracijas (sukurti lenteles)
sudo npm run db:migrate:local

# Pridėti pradinius duomenis (admin vartotoją)
sudo npm run db:seed
```

### 5. Sukurti paslaugos failą (PM2)
```bash
sudo nano ecosystem.config.js
```

**Įrašyti:**
```javascript
module.exports = {
  apps: [{
    name: 'webapp',
    script: './src/index.js',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    log_file: './logs/app.log',
    error_file: './logs/error.log',
    out_file: './logs/out.log'
  }]
}
```

### 6. Sukurti logų katalogą
```bash
sudo mkdir logs
sudo chown www-data:www-data logs
```

## 🌐 4 Žingsnis: Konfigūruoti Nginx

### 1. Sukurti Nginx konfigūraciją
```bash
sudo nano /etc/nginx/sites-available/webapp
```

**Įrašyti (pakeisti your-domain.lt į savo domeną arba serverio IP):**
```nginx
server {
    listen 80;
    server_name your-domain.lt www.your-domain.lt;  # Arba serverio IP
    
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

### 2. Aktyvuoti konfigūraciją
```bash
sudo ln -s /etc/nginx/sites-available/webapp /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default  # Išjungti standartinį
sudo nginx -t  # Patikrinti konfigūraciją
sudo systemctl restart nginx
```

## 🔐 5 Žingsnis: SSL Sertifikatas (HTTPS)

### Jei turite domeną:
```bash
# Įdiegti Certbot
sudo apt install certbot python3-certbot-nginx -y

# Sukurti SSL sertifikatą
sudo certbot --nginx -d your-domain.lt -d www.your-domain.lt
```

### Jei neturite domeno:
SSL nereikalingas, naudosite HTTP per IP adresą.

## 🚀 6 Žingsnis: Paleisti Sistemą

### 1. Sukompiliuoti projektą
```bash
cd /var/www/webapp
sudo npm run build
```

### 2. Paleisti su PM2
```bash
sudo pm2 start ecosystem.config.js
sudo pm2 save  # Išsaugoti konfigūraciją
sudo pm2 startup  # Automatinis paleidimas po serverio perkrovimo
```

### 3. Patikrinti ar veikia
```bash
sudo pm2 status  # Pamatyti procesų būseną
sudo pm2 logs webapp  # Pamatyti logus
curl http://localhost:3000  # Patikrinti lokaliai
```

## 🎯 7 Žingsnis: Patikrinti Veikimą

### Atidaryti naršyklėje:
- **Su domenu**: `https://your-domain.lt` arba `http://your-domain.lt`
- **Su IP**: `http://your-server-ip`

### Prisijungimo duomenys (admin):
- **El. paštas**: `admin@company.com`
- **Slaptažodis**: `admin123`

## 🔧 Kasdieniai Veiksmai

### Peržiūrėti logus:
```bash
sudo pm2 logs webapp
```

### Restartavimas:
```bash
sudo pm2 restart webapp
```

### Stabdymas:
```bash
sudo pm2 stop webapp
```

### Naujinimas (po kodo pakeitimų):
```bash
cd /var/www/webapp
sudo git pull  # Jei naudojate Git
sudo npm run build
sudo pm2 restart webapp
```

## ⚠️ Svarbi Informacija

### Uždaryti portai:
Sistema veiks per 80 (HTTP) ir 443 (HTTPS) portus. Port 3000 yra tik viduje.

### Duomenų bazė:
SQLite duomenų bazė bus `/var/www/webapp/production.db`

### Failai:
Visi įkelti failai bus saugomi `/var/www/webapp/uploads/` kataloge.

### Backup:
```bash
# Duomenų bazės kopija
sudo cp /var/www/webapp/production.db /backup/webapp-db-$(date +%Y%m%d).db

# Viso projekto kopija
sudo tar -czf /backup/webapp-$(date +%Y%m%d).tar.gz /var/www/webapp
```

## 🆘 Problemos ir Sprendimai

### Jei sistema nepasiekiama:
1. `sudo pm2 status` - ar procesas veikia?
2. `sudo nginx -t` - ar Nginx konfigūracija tinkama?
3. `sudo ufw status` - ar firewall leidžia 80/443 portus?

### Jei duomenų bazės klaidos:
1. Patikrinti ar `/var/www/webapp/production.db` egzistuoja
2. `sudo chmod 664 /var/www/webapp/production.db`
3. `sudo chown www-data:www-data /var/www/webapp/production.db`

### Jei email neveikia:
Sistema veiks ir be email - pranešimai tiesiog nebus siunčiami.

---

**🎉 Po šių žingsnių jūsų sistema veiks pilnai ir bus pasiekiama internetu!**