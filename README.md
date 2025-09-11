# Įmonės pirkimų valdymo sistema (Enterprise Procurement Management System)

## Projekto apžvalga
- **Pavadinimas**: Įmonės pirkimų valdymo sistema
- **Tikslas**: Visapusiškas įmonės prekių užsakymų ir pirkimų valdymas su 6-etapų darbo eiga
- **Tipas**: Išplėstinė verslo valdymo sistema su enterprise funkcionalumu

## Pagrindinės funkcijos

### ✅ Užbaigtos funkcijos

#### 1. Išplėstinė užsakymų darbo eiga (6 statusai)
- **Juodraštis** → **Pateiktas tvirtinti** → **Patvirtintas (direktoriaus)** → **Užsakytas tiekėjui** → **Pristatytas/išdalintas** → **Užbaigtas**
- Papildomi statusai: Atmestas, Grąžintas pataisymui, Atšauktas
- Automatinis statusų valdymas su autorizacijos kontrole
- Sistemos komentarų generavimas statusų keitimo metu

#### 2. Išplėstinis produktų valdymas
- **SKU sistema**: Unikalūs produktų kodai
- **Tiekėjų susietas**: Kiekvienas produktas susietas su tiekėju
- **Kainodara su nuolaidomis**: Bazinė kaina + nuolaidos sistema
- **PVM skaičiavimas**: Automatinis PVM pridėjimas (21% standartiškai)
- **Minimūs kiekiai**: Minimalių užsakymo kiekių kontrolė
- **Kategorijų sistema**: Produktų grupavimas pagal kategorijas

#### 3. Komentarų sistema su audito sekimu
- Chronologinis komentarų išdėstymas (naujausi viršuje)
- Komentarų tipai: bendri, skubūs, sistemos
- Automatinis vartotojų sekimas su laiko žymėmis
- Integruota su užsakymų peržiūros langais

#### 4. Direktoriaus valdymo skydas
- **Reikalaujantys dėmesio**: Laukiantys patvirtinimo užsakymai
- **Prioritetų analizė**: Aukšto prioriteto ir vėluojančių užsakymų išskyrimas
- **Finansinė apžvalga**: Bendros sumos, patvirtintos vertės, laukiančios sprendimo
- **Skyrių aktyvumas**: Užsakymų ir sumų pasiskirstymas pagal skyrius
- **Greiti veiksmai**: Vieno paspaudimo patvirtinimas/atmetimas

#### 5. Išplėstinės ataskaitos su eksportu
- **PDF eksportavimas**: HTML formato ataskaitos (su jsPDF galimybe)
- **Excel eksportavimas**: CSV formatas, atveriamas Excel programoje
- **Laikotarpių filtrai**: Šiandien, savaitė, mėnuo, ketvirtis, metai
- **Greitos ataskaitos**: Laukiantys patvirtinimo, aukštos vertės užsakymai, mėnesio suvestinė
- **Parametrizuotos ataskaitos**: Statusų, skyrių, laikotarpių filtravimas

#### 6. Tiekėjų valdymo sistema
- **CRUD operacijos**: Pilnas tiekėjų kūrimas, redagavimas, trinimas
- **Kontaktinė informacija**: Vardas, el. paštas, telefonas, adresas
- **PVM duomenys**: PVM kodai ir mokėjimo terminai
- **Kategorijos**: Tiekėjų grupavimas pagal specialybę
- **Paieškos funkcija**: Greitas tiekėjų filtravimas

#### 7. Audito žurnalo sistema
- **Visų veiksmų sekimas**: Kiekvienas veiksmas įrašomas į auditą
- **Vartotojų identifikavimas**: Kas, kada ir ką darė
- **Detalūs įrašai**: Seni ir nauji duomenys, priežastys
- **Sisteminis sekimas**: IP adresai, naršyklės duomenys

#### 8. Atnaujinta rolių sistema
- **Administratorius**: Pilna prieiga prie visų funkcijų
- **Techninis direktorius**: Užsakymų valdymas, produktų valdymas
- **Direktorius**: Užsakymų patvirtinimas, direktoriaus skydas
- **Darbuotojas**: Užsakymų kūrimas ir redagavimas (tik savų)

### ⏳ Planuojamos funkcijos

#### 9. Dokumentų priedų sistema
- Proforma sąskaitų pridėjimas
- Originalių sąskaitų saugojimas
- Antivirusinė failų patikra
- Failų dydžio apribojimai

## URLs ir prieiga
- **Demo sistema**: https://3000-i1qoik2ucaytcjarkeljq-6532622b.e2b.dev/
- **GitHub repozitorija**: /home/user/webapp/

## Duomenų architektūra

### Pagrindiniai duomenų modeliai
- **orders**: Užsakymai su 6-etapų darbo eiga
- **products**: Produktų katalogas su SKU, kainomis, PVM
- **suppliers**: Tiekėjų valdymas su kontaktine informacija
- **comments**: Komentarų sistema su tipais ir laiko žymėmis
- **attachments**: Dokumentų priedų sistema (planuojama)
- **auditLog**: Visų sistemos veiksmų auditas

### Saugojimo sistema
- **LocalStorage**: Visi duomenys saugomi naršyklės localStorage
- **Raktų schema**: `procurement_*` prefiksai visoms kolekcijoms
- **Duomenų inicijavimas**: Automatinis demo duomenų sukūrimas
- **Backup funkcija**: Duomenų išvalymo kontrolė

## Vartotojų vadovas

### Prisijungimas prie sistemos
1. Atidarykite demo svetainę
2. Pasirinkite vartotoją iš greitojo prisijungimo mygtukai
3. Arba įveskite duomenis rankiniu būdu

### Demo vartotojai:
- 🔴 **admin@company.com / admin123** - Vadybininkas (pilna prieiga)
- 🟣 **director@company.com / director123** - Direktorius (patvirtinimai)
- 🔵 **tech@company.com / tech123** - Techninis direktorius (valdymas)
- 🟢 **employee@company.com / employee123** - Darbuotojas (užsakymai)

### Pagrindiniai darbo procesai

#### Naujo užsakymo kūrimas
1. Prisijunkite kaip darbuotojas arba tech. direktorius
2. Spustelėkite "Naujas užsakymas"
3. Užpildykite užsakymo informaciją
4. Pridėkite produktus iš katalogo
5. Išsaugokite kaip juodraštį arba pateikite tvirtinti

#### Užsakymo patvirtinimas (direktoriams)
1. Prisijunkite kaip direktorius
2. Eikite į "Direktoriaus dashboard"
3. Peržiūrėkite laukiančius užsakymus
4. Spustelėkite "Patvirtinti" arba "Atmesti"
5. Užsakymas pereina į kitą etapą

#### Ataskaitų generavimas
1. Eikite į "Ataskaitos" skyrių
2. Pasirinkite laikotarpį ir filtrus
3. Spustelėkite "Generuoti ataskaitą"
4. Eksportuokite PDF arba Excel formatu

## Diegimo informacija
- **Platforma**: Netlify statinis hosting  
- **Statusas**: ✅ Aktyvus ir veikiantis
- **Test URL**: https://8080-i1qoik2ucaytcjarkeljq-6532622b.e2b.dev
- **Diegimo paketas**: `netlify-updated-deployment.zip` (25KB) - paruoštas naujam diegimui

### 🚀 Netlify atnaujinimo instrukcijos

#### Metodas 1: Drag & Drop (rekomenduojamas)
1. Atsisiųskite `netlify-updated-deployment.zip` failą
2. Eikite į savo Netlify Dashboard
3. Atidarykite savo svetainės projektą
4. Eikite į "Deploys" skiltį
5. Nuvilkite ZIP failą į diegimo sritį arba spustelėkite "Browse to upload"
6. Netlify automatiškai išskleistų ir įdiegtų atnaujinimą

#### Metodas 2: Netlify CLI
```bash
# Prisijunkite prie Netlify
netlify login

# Įdiekite atnaujinimą
netlify deploy --prod --dir=netlify
```

#### ✅ Pataisytos problemos šiame atnaujinime
- ✅ "Naujas užsakymas" mygtukas dabar veikia
- ✅ "Naujas tiekėjas" mygtukas dabar veikia  
- ✅ Produktų valdymo veiksmai veikia
- ✅ Ataskaitų generavimas ir eksportavimas veikia
- ✅ Filtravimo sistema veikia visose skiltyse
- ✅ Išvalytos dubliuotos JavaScript funkcijos
- ✅ VAT skaičiavimai ir automatiniai totals veikia teisingai
- **Technologijų stack**: 
  - Frontend: Vanilla JavaScript + TailwindCSS
  - Duomenų saugojimas: Browser localStorage
  - Autentifikacija: Demo vartotojai
  - Eksportavimas: CSV/HTML generavimas

## Sistemos architektūra

### Frontend technologijos
- **TailwindCSS**: Utility-first CSS framework stilizavimui
- **FontAwesome**: Ikonų sistema
- **Vanilla JavaScript**: Grynasis JavaScript be papildomų framework'ų
- **localStorage API**: Duomenų saugojimas naršyklėje

### Duomenų struktūros
```javascript
// Užsakymo objekto pavyzdys
{
  id: 1,
  order_number: 'ORD-2024-001',
  title: 'Biuro reikmenų užsakymas',
  status: 'submitted',
  priority: 'medium',
  user_id: 4,
  department: 'Pirkimai',
  totals: {
    net_amount: 88.40,
    vat_amount: 18.57,
    total_amount: 106.97
  },
  items: [...], // Užsakymo prekės
  created_at: '2024-01-15T08:00:00.000Z'
}
```

## Pagrindinės sistemos funkcijos

### 1. Užsakymų valdymas
- 6-etapų darbo eiga su statusų kontrole
- Automatinis užsakymų numerių generavimas
- Prekių pridėjimas iš produktų katalogo
- VAT ir nuolaidų skaičiavimai

### 2. Produktų katalogas
- SKU sistema unikalių kodų generavimui
- Tiekėjų susietas su kainomis
- Kategorijų valdymas
- Paieškos ir filtravimo galimybės

### 3. Tiekėjų sistema
- Pilnas CRUD funkcionalumas
- Kontaktinės informacijos valdymas
- PVM duomenų saugojimas
- Mokėjimo terminų nustatymas

### 4. Rolių ir teisių valdymas
- 4 vartotojų rolės su skirtingomis teisėmis
- Dinamiškas meniu ir funkcijų rodimas
- Saugus duomenų prieigos kontrolė

### 5. Ataskaitų sistema
- Parametrizuojamos ataskaitos su filtrais
- PDF ir Excel eksportavimas
- Greitos ataskaitos su vienu paspaudimu
- Finansinių duomenų analizė

## Saugumo aspektai
- Vartotojų autentifikacija su demo sistemoje
- Rolių pagrindu veikiantis prieigos kontrolė
- Audito žurnalo vedimas visų veiksmų
- Duomenų validavimas frontend pusėje

## Plėtros galimybės
1. **Realaus backend integravimas**: API serveris su duomenų baze
2. **LDAP/Active Directory integracija**: Tikra vartotojų autentifikacija
3. **El. laiškų pranešimai**: Automatiniai statusų keitimo pranešimai
4. **Mobiliosios aplikacijos versija**: React Native arba PWA
5. **Dokumentų valdymo sistema**: Failų įkėlimas ir saugojimas
6. **Integracijos su ERP**: SAP, Oracle, Microsoft Dynamics
7. **Multi-tenant architektūra**: Kelių įmonių palaikymas

---

**Paskutinis atnaujinimas**: 2024-01-15
**Versija**: Enterprise v2.0
**Būsena**: Pilnai funkcionali demo sistema su išplėstinėmis verslo funkcijomis