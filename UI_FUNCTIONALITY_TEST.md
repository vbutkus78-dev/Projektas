# 🔧 UI FUNKCIONALUMO TESTAVIMO INSTRUKCIJOS

## 🎯 **PROBLEMA IR SPRENDIMAS**

Jūs pranešėte, kad **"daugelis funkcijų neveikia"** GitHub Pages svetainėje. Patikrinkime kokie konkretūs funkcionalumai neveikia ir išspręskime problemas.

---

## 🧪 **TESTAVIMO PLANAI**

### **1. PALYGINIMAS TARP VERSIJŲ:**

**🟢 DEMO SERVER (100% veiks):** https://8080-i1qoik2ucaytcjarkeljq-6532622b.e2b.dev  
**🟡 GITHUB PAGES:** https://vbutkus78-dev.github.io/Projektas

### **2. FUNKCIONALUMŲ TESTAVIMO SĄRAŠAS:**

**A) Prisijungimo funkcionalumas:**
- [ ] Quick login mygtukai veikia
- [ ] Manual login veikia
- [ ] Role switching veikia

**B) Navigacijos funkcionalumas:**
- [ ] Dashboard kortelės atidaro tinkamą turinį
- [ ] Menu mygtukai veikia
- [ ] Breadcrumb navigacija veikia

**C) KRITINIAI UI elementai (jūsų pranešti kaip neveikiantys):**
- [ ] **"Naujas užsakymas"** mygtukas atidaro formą
- [ ] **"Naujas tiekėjas"** mygtukas atidaro formą  
- [ ] **"Ataskaitos"** mygtukai generuoja ataskaitas
- [ ] **Filtravimas** veikia paieškos laukuose
- [ ] **Produktų valdymo veiksmai** (redagavimas, trinimas)

**D) Duomenų operacijos:**
- [ ] LocalStorage data loading veikia
- [ ] Form submission veikia
- [ ] Data persistence veikia
- [ ] VAT calculations veikia

---

## 🔍 **TIKĖTINOS PROBLEMOS IR SPRENDIMAI**

### **Problema 1: GitHub Pages routing**
**Simptomas:** 404 klaidos konsolėje  
**Priežastis:** GitHub Pages naudoja kitą routing nei Netlify  
**Sprendimas:** Reikės pataisyti routing logika

### **Problema 2: JavaScript klaidos**
**Simptomas:** Funkcijos neegzistuoja arba neveikia  
**Priežastis:** Galimi failų skirtumai tarp versijų  
**Sprendimas:** Patikrinti ir sync'inti funkcijas

### **Problema 3: Resource loading**
**Simptomas:** CDN resources neįsikelia  
**Priežastis:** HTTPS/HTTP mišinys arba CORS problemos  
**Sprendimas:** Patikrinti resource URLs

---

## 🛠️ **DIAGNOSTIKOS ŽINGSNIAI**

### **Žingsnis 1: Console patikrinimas**
```
1. Atidarykite GitHub Pages svetainę
2. Paspauskite F12 (Developer Tools)
3. Eikite į Console tab
4. Pažymėkite visas klaidas ir warnings
5. Praneškite man konkrečius error messages
```

### **Žingsnis 2: Funkcionalumo testavimas**
```
1. Prisijunkite su admin@company.com / admin123
2. Bandykite spustelėti "Naujas užsakymas"
3. Jei neveikia - praneškite kas tiksliai nutinka
4. Bandykite kitus mygtukus ir praneškite rezultatus
```

### **Žingsnis 3: Palyginti su demo**
```
1. Atidarykite demo serverį: https://8080-i1qoik2ucaytcjarkeljq-6532622b.e2b.dev
2. Tuo pačiu metu atidarykite GitHub Pages
3. Palyginkite ar tas pats funkcionalumas veikia skirtingai
```

---

## 🚀 **GREITAS SPRENDIMAS**

Jei GitHub Pages versija turi per daug problemų, galiu:

### **Opcija 1: Pataisa GitHub Pages**
- Identifikuojame konkrečias problemas
- Taisojame routing ir funkcionalumus
- Redeployiname pataisytą versiją

### **Opcija 2: Netlify migrate**
- Sukuriame Netlify deployment (originalus planas)
- Netlify labiau tinka SPA aplikacijoms
- Geresnis routing support

### **Opcija 3: Alternative hosting** 
- Vercel deployment
- Firebase Hosting
- Arba kitas static hosting

---

## 📋 **PRAŠAU PRANEŠKITE:**

**1. Kokie konkretūs funkcionalumai neveikia?**
- Kokius mygtukus paspaudėte?
- Kas nutiko (nieko, klaida, neteisingas rezultatas)?
- Kokie error messages konsolėje?

**2. Ar veikia pagrindinis funkcionalumas?**  
- Prisijungimas veikia?
- Navigacija veikia?
- Duomenys rodomi?

**3. Palyginkime su demo:**
- Ar demo server veikia jums?
- Ar tie patys funkcionalumai skiriasi?

---

**🎯 Kai gauns jūsų feedback, galės greitai identifikuoti ir ištaisyti konkrečias problemas!**