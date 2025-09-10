# 📦 Projekto Perkėlimo Instrukcija

## 🎯 Trumpai: Ką Daryti

1. **Gauti serverį** (VPS)
2. **Perkelti šį projektą** į serverį
3. **Įdiegti Node.js ir Nginx**
4. **Paleisti sistemą**

## 💾 Projekto Failai

Visas jūsų projektas yra čia: `/home/user/webapp/`

**Svarbiausi failai:**
- `src/` - Backend kodas (API)
- `public/` - Frontend kodas (svetainė)  
- `package.json` - Priklausomybės
- `wrangler.jsonc` - Konfigūracija
- `migrations/` - Duomenų bazės struktūra

## 🔄 3 Būdai Projektą Perkelti

### Būdas 1: GitHub (Rekomenduojama)
```bash
# 1. Įkelti į GitHub (jūsų kompiuteryje)
cd /home/user/webapp
git remote add origin https://github.com/your-username/procurement-system.git
git push -u origin main

# 2. Atsisiųsti serveryje
ssh root@your-server-ip
git clone https://github.com/your-username/procurement-system.git /var/www/webapp
```

### Būdas 2: ZIP Failas
```bash
# 1. Sukurti ZIP (jūsų kompiuteryje)  
cd /home/user
zip -r webapp-production.zip webapp/

# 2. Įkelti per FTP/SFTP į serverį
# 3. Išpakuoti serveryje
unzip webapp-production.zip -d /var/www/
```

### Būdas 3: Tiesioginis Kopijavimas
```bash
# Kopijuoti per SCP
scp -r /home/user/webapp/ root@your-server-ip:/var/www/
```

## ⚙️ Serverio Paruošimas (Ubuntu)

### 1. Prisijungti prie serverio
```bash
ssh root@your-server-ip
```

### 2. Įdiegti reikiamus įrankius
```bash
# Atnaujinti sistemą
apt update && apt upgrade -y

# Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Kiti įrankiai
npm install -g pm2
apt install nginx git unzip -y
```

## 🚀 Sistemos Paleidimas

### 1. Projekto paruošimas
```bash
cd /var/www/webapp

# Teisės
chown -R www-data:www-data .
chmod -R 755 .

# Priklausomybės
npm install --production

# Aplinkos kintamieji
cat > .env << EOF
NODE_ENV=production
PORT=3000
JWT_SECRET=super-secret-key-change-this
DATABASE_PATH=./production.db
EOF

# Duomenų bazė
mkdir -p db logs
npm run db:migrate:local
npm run db:seed
```

### 2. PM2 konfigūracija
```bash
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'webapp',
    script: 'node',
    args: 'src/index.js',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF
```

### 3. Nginx konfigūracija
```bash
cat > /etc/nginx/sites-available/webapp << EOF
server {
    listen 80;
    server_name _;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOF

# Aktyvuoti
ln -s /etc/nginx/sites-available/webapp /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx
```

### 4. Paleisti sistemą
```bash
cd /var/www/webapp
npm run build
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🌐 Patikrinimas

### Sistema bus pasiekiama:
- **Per IP**: `http://your-server-ip`
- **Per domeną**: `http://your-domain.com` (jei turite)

### Prisijungimo duomenys:
- **Admin**: admin@company.com / admin123
- **Manager**: manager@company.com / manager123
- **Employee**: employee@company.com / employee123

## 📱 Kas Veiks Iš Karto

✅ **Vartotojų valdymas** - prisijungimas, rolės
✅ **Užklausos** - kūrimas, redagavimas, patvirtinimas  
✅ **Prekių pridėjimas/šalinimas** - dinamiškas sąrašas
✅ **Failų įkėlimas** - dokumentų pridėjimas
✅ **Ataskaitos** - 5 tipų ataskaitų su CSV eksportu
✅ **Sąskaitos** - sąskaitų valdymas ir mokėjimų sekimas
✅ **Duomenų bazė** - SQLite su visomis lentelėmis

## 🔧 Po Diegimo

### Kasdieniai veiksmai:
```bash
# Patikrinti statusą
pm2 status

# Peržiūrėti logus  
pm2 logs webapp

# Restartavimas
pm2 restart webapp
```

### Duomenų atsarginės kopijos:
```bash
# DB backup
cp /var/www/webapp/production.db /backup/db-$(date +%Y%m%d).db

# Visas projektas
tar -czf /backup/webapp-$(date +%Y%m%d).tar.gz /var/www/webapp
```

## 🆘 Pagalba

### Jei kas nors neveikia:

1. **Patikrinti PM2**: `pm2 status`
2. **Patikrinti Nginx**: `nginx -t`
3. **Patikrinti logus**: `pm2 logs webapp`
4. **Patikrinti portus**: `netstat -tulpn | grep :3000`

### Email funkcionalumas:
- Sistema veiks ir be email
- Vėliau galite pridėti SendGrid API raktą

---

**🎉 Šie žingsniai paleis jūsų sistemą pilnai!**

**Reikia pagalbos? Rašykite konkrečią problemą!**