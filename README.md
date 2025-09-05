# Prekių užsakymų valdymo sistema

## Projekto aprašymas

Pilna prekių užsakymų valdymo sistema, skirta organizacijos darbuotojų prašymų pateikimui, tvirtinimo procesui, tiekėjų valdymui ir finansinių dokumentų prisegimui. Sistema palaiko pilną užsakymo ciklą nuo darbuotojo prašymo iki archyvavimo su audito žurnalu.

### Pagrindinės funkcijos

- ✅ **Vartotojų autentifikacija** - JWT tokenai, rolių valdymas
- ✅ **Prašymų kūrimas** - Darbuotojai gali kurti prekių/paslaugų prašymus  
- ✅ **Tvirtinimo workflow** - Vadybininko peržiūra → Vadovo patvirtinimas
- ✅ **Užsakymų valdymas** - Automatinis užsakymų generavimas iš patvirtintų prašymų
- ✅ **Dashboard ir statistikos** - Realaus laiko duomenų vizualizacija
- ✅ **Notifikacijos** - Automatiniai pranešimai apie būsenos pakeitimus
- ✅ **Audito žurnalas** - Visų veiksmų sekimas
- ✅ **Sąskaitų valdymas** - Proforma, galutinės ir PVM sąskaitos su failų įkėlimo palaikymu
- ✅ **Failų įkėlimas** - PDF/JPEG/PNG failų įkėlimas iki 10MB (Cloudflare R2)
- ⚠️ **Ataskaitos** - Excel/CSV eksportavimas (API paruoštas)

### Technologijų stack'as

- **Backend**: Hono framework + TypeScript
- **Database**: Cloudflare D1 (SQLite)  
- **Frontend**: Vanilla JavaScript + TailwindCSS
- **Deployment**: Cloudflare Pages/Workers
- **Authentication**: JWT + bcrypt
- **Storage**: Cloudflare R2 (failams)

## URLs ir prieiga

### Veikianti aplikacija
- **Production**: Dar nedeployinta (reikia Cloudflare setup)
- **Development**: `http://localhost:3000` (po `npm run dev:d1`)

### API endpointai
- **Health check**: `/api/health`
- **API info**: `/api/v1`
- **Authentication**: `/api/v1/auth/*`
- **Requests**: `/api/v1/requests/*` 
- **Orders**: `/api/v1/orders/*`
- **Invoices**: `/api/v1/invoices/*`
- **Files**: `/api/v1/files/*`
- **Suppliers**: `/api/v1/suppliers`
- **Categories**: `/api/v1/categories`
- **Notifications**: `/api/v1/notifications`
- **Dashboard**: `/api/v1/dashboard/stats`

### Testas vartotojai

Visi vartotojai turi slaptažodį: **password123**

| Vaidmuo | El. paštas | Teisės |
|---------|------------|---------|
| **Administratorius** | admin@company.com | Visos teisės, sistemos valdymas |
| **Vadovas** | petras.jonaitis@company.com | Galutinis prašymų patvirtinimas |
| **Vadybininkas** | ana.kazlauskiene@company.com | Prašymų peržiūra, užsakymų valdymas |
| **Buhalterė** | rasa.petraitiene@company.com | Sąskaitų valdymas, mokėjimų sekimas |
| **Darbuotojas (IT)** | jonas.petraitis@company.com | Prašymų kūrimas, savo duomenų peržiūra |
| **Darbuotojas (Pardavimai)** | marija.navickiene@company.com | Prašymų kūrimas, savo duomenų peržiūra |

## Duomenų architektūra

### Pagrindinės lentelės

1. **users** - Vartotojų duomenys ir rolės
2. **suppliers** - Tiekėjų informacija  
3. **categories** - Prekių kategorijos
4. **requests** - Prekių prašymai
5. **request_lines** - Prašymų eilutės (prekės)
6. **approvals** - Patvirtinimų istorija
7. **orders** - Užsakymai iš patvirtintų prašymų
8. **invoices** - Sąskaitos prie užsakymų
9. **attachments** - Prisegti failai
10. **audit_log** - Visų veiksmų žurnalas
11. **notifications** - Vartotojų pranešimai

### Duomenų srautai

```
Darbuotojas → Prašymas (draft) → Pateikimas (submitted)
     ↓
Vadybininkas → Peržiūra (under_review) → Tvirtinimas/Atmetimas
     ↓ (jei patvirtinta)
Vadovas → Patvirtinimas (pending_approval) → Galutinis sprendimas
     ↓ (jei patvirtinta) 
Automatinis užsakymo generavimas (ordered)
     ↓
Vadybininkas → Siuntimas tiekėjui → Pristatymas (delivered) → Užbaigimas (completed)
```

### Vartotojų rolės ir teisės

| Vaidmuo | Teisės |
|---------|---------|
| **employee** | Kurti savo prašymus, žiūrėti savo duomenis |
| **manager** | Peržiūrėti prašymus, valdyti užsakymus, prisegti sąskaitas |
| **supervisor** | Galutinis prašymų patvirtinimas, visų prašymų peržiūra |
| **accounting** | Sąskaitų valdymas, mokėjimų žymėjimas |
| **admin** | Visos teisės, sistemos administravimas |

## Naudotojo gidas

### Kaip sukurti prašymą (darbuotojui):

1. **Prisijunkite** į sistemą su savo duomenimis
2. **Spauskite "Naujas prašymas"** Dashboard arba Prašymų sekcijoje  
3. **Užpildykite pagrindinę informaciją**:
   - Skyrius (automatiškai užpildytas)
   - Prioritetas (normalus, aukštas, skubus)
   - Reikia iki (data)
   - Pagrindimas (kodėl reikalinga)

4. **Pridėkite prekes**:
   - Spausti "+ Pridėti prekę"
   - Įvesti prekės pavadinimą
   - Nurodyti kiekį ir vienetą
   - Nurodyti kainą (jei žinoma)
   - Pridėti pastabas

5. **Pasirinkite veiksmą**:
   - "Išsaugoti kaip juodraštį" - galėsite redaguoti vėliau
   - "Pateikti tvirtinimui" - išsiųs vadybininkui peržiūrai

### Kaip patvirtinti prašymą (vadybininkui):

1. **Atidarykite "Prašymai"** → filtruokite pagal būseną "Pateikti"
2. **Peržiūrėkite prašymą** - patikrinkite prekes, kainas, pagrindimą
3. **Priimkite sprendimą**:
   - "Patvirtinti" - siųs vadovui galutiniam patvirtinimui
   - "Atmesti" - grąžins prašytojui su komentaru
   - "Grąžinti patikslinti" - prašytojas galės redaguoti

### Kaip galutinai patvirtinti (vadovui):

1. **Atidarykite prašymus** laukiančius patvirtinimo
2. **Peržiūrėkite vadybininko komentarą** ir rekomendaciją
3. **Patvirtinkite arba atmeskite** su savo komentaru
4. **Patvirtinus** automatiškai sukuriamas užsakymas

### Kaip valdyti sąskaitas (buhalterėms/vadybininkėms):

1. **Atidarykite "Sąskaitos"** sekciją (tik accounting/manager rolėms)
2. **Filtruokite sąskaitas** pagal tipą:
   - Proforma sąskaitos
   - Galutinės sąskaitos  
   - PVM sąskaitos
   - Neapmokėtos/Apmokėtos

3. **Sukurkite naują sąskaitą**:
   - Spauskite "Nauja sąskaita"
   - Pasirinkite užsakymą
   - Nurodykite sąskaitos tipą ir sumą
   - Prisegkite PDF failą (nebūtina)

4. **Valdykite mokėjimus**:
   - Pažymėkite kaip "Apmokėta" kai gaujate mokėjimą
   - Sistema automatiškai atnaujins užsakymo būseną
   - Bus išsiųsti automatiniai pranešimai

### Dashboard funkcijos:

- **Statistikos kortelės** - prašymų skaičiai pagal būsenas
- **Mėnesio suma** - bendros išlaidos einamąjį mėnesį
- **Paskutiniai prašymai** - greitas peržiūros
- **Greiti veiksmai** - naujas prašymas, filtrai

## Deployment

### Lokalus development

```bash
# 1. Clone repository
git clone <repository-url>
cd webapp

# 2. Install dependencies  
npm install

# 3. Setup database
npm run db:migrate:local
npm run db:seed

# 4. Build application
npm run build

# 5. Start development server
npm run dev:d1
# arba naudoti PM2:
pm2 start ecosystem.config.cjs

# 6. Open http://localhost:3000
```

### Production deployment (Cloudflare Pages)

```bash
# 1. Setup Cloudflare API key
# Jūs turite sukonfigūruoti CLOUDFLARE_API_TOKEN per Deploy tab

# 2. Create D1 database  
npx wrangler d1 create webapp-production
# Copy database_id į wrangler.jsonc

# 3. Run migrations on production
npx wrangler d1 migrations apply webapp-production

# 4. Create Cloudflare Pages project
npx wrangler pages project create webapp --production-branch main

# 5. Deploy
npm run deploy:prod

# 6. Setup environment variables (if needed)
npx wrangler pages secret put JWT_SECRET --project-name webapp
```

### Projekto struktūra

```
webapp/
├── src/
│   ├── index.tsx           # Main Hono app
│   ├── types/index.ts      # TypeScript tipai
│   ├── middleware/auth.ts  # Autentifikacijos middleware
│   ├── utils/
│   │   ├── auth.ts        # JWT ir slaptažodžių valdymas
│   │   └── db.ts          # Duomenų bazės utiliai
│   └── routes/
│       ├── auth.ts        # Prisijungimo API
│       ├── requests.ts    # Prašymų API  
│       ├── orders.ts      # Užsakymų API
│       ├── invoices.ts    # Sąskaitų valdymo API
│       └── files.ts       # Failų įkėlimo API
├── public/static/
│   ├── app.js            # Frontend JavaScript (SPA)
│   └── styles.css        # CSS stiliai
├── migrations/
│   └── 0001_initial_schema.sql
├── package.json          # Dependencies ir scripts
├── wrangler.jsonc       # Cloudflare konfigūracija
├── vite.config.ts       # Vite build konfigūracija
├── ecosystem.config.cjs # PM2 konfigūracija
├── seed.sql            # Testas duomenys
└── README.md           # Ši dokumentacija
```

## Plėtojimo rekomendacijos

### Sekantys žingsniai:

1. **Email notifikacijos** - integruoti su email paslaugomis (SendGrid/Mailgun)
2. **Sąskaitų UI tobulinimas** - sąskaitos kūrimo, redagavimo ir peržiūros formos
3. **Mokėjimo integracijos** - Stripe/PayPal mokėjimo šluzų integracijos
4. **Ataskaitos** - Excel/CSV export funkcionalumas
5. **Advanced filtrai** - daugiau paieškos ir filtravimo opcijų
6. **Mobile app** - React Native arba PWA versija
7. **API integracijos** - ERP sistemų integracijos
8. **Bulk operations** - masiniai veiksmai su prašymais

### Saugumas:

- ✅ JWT tokenai su expiration
- ✅ Bcrypt password hashing  
- ✅ Role-based access control (RBAC)
- ✅ SQL injection protection (prepared statements)
- ✅ XSS protection (input sanitization)
- ⚠️ CSRF protection (reikia implementuoti)
- ⚠️ Rate limiting (reikia implementuoti)

### Performance:

- ✅ Database indexing
- ✅ Pagination visiems sąrašams
- ✅ Efficient SQL queries
- ⚠️ Caching (Redis arba Cloudflare Cache)
- ⚠️ Image optimization (jei bus failų įkėlimas)

## Support ir troubleshooting

### Dažniausios klaidos:

1. **"Invalid token"** - Atsijunkite ir prisijunkite iš naujo
2. **"Permission denied"** - Patikrinkite vartotojo rolę
3. **Database errors** - Pabandykite `npm run db:reset`
4. **Build errors** - Ištrinkite `node_modules` ir `npm install`

### Logai:

```bash
# PM2 logai  
pm2 logs webapp --nostream

# Wrangler dev logai
# Rodomi console real-time

# Database console
npm run db:console:local
```

---

**Versija**: 1.0.0  
**Paskutinis atnaujinimas**: 2025-09-05  
**Deployment Status**: ✅ Development Ready / ⏳ Production Pending  
**GitHub**: Reikia sukonfigūruoti GitHub integraciją