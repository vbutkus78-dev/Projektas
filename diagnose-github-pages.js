// Diagnostikos script GitHub Pages funkcionalumui patikrinti
console.log('🔍 GitHub Pages funkcionalumo diagnostika...');

// Patikrinti ar yra pagrindinės funkcijos
const requiredFunctions = [
    'showCreateOrderForm',
    'showCreateSupplierForm', 
    'showCreateProductForm',
    'addProductToOrder',
    'calculateOrderTotals_New',
    'showOrders',
    'showSuppliers',
    'showProducts',
    'generateReport',
    'exportToPDF',
    'exportToExcel',
    'filterOrders',
    'saveOrder',
    'saveSupplier',
    'saveProduct'
];

console.log('📋 Tikrinamos funkcijos:');
const missingFunctions = [];
const availableFunctions = [];

requiredFunctions.forEach(func => {
    if (typeof window[func] === 'function') {
        availableFunctions.push(func);
        console.log(`✅ ${func} - Rasta`);
    } else {
        missingFunctions.push(func);
        console.log(`❌ ${func} - Trūksta!`);
    }
});

console.log('\n📊 Rezultatai:');
console.log(`✅ Veikiančių funkcijų: ${availableFunctions.length}/${requiredFunctions.length}`);
console.log(`❌ Trūkstamų funkcijų: ${missingFunctions.length}/${requiredFunctions.length}`);

if (missingFunctions.length > 0) {
    console.log('\n🚨 Trūkstamos funkcijos:');
    missingFunctions.forEach(func => console.log(`   - ${func}`));
    console.log('\n💡 Reikia atnaujinti GitHub Pages su pilnomis funkcijomis!');
} else {
    console.log('\n🎉 Visos funkcijos rastos! Problemos gali būti kitur.');
}

// Patikrinti localStorage duomenis
console.log('\n💾 LocalStorage duomenų tikrinimas:');
const storageKeys = ['procurement_users', 'procurement_orders', 'procurement_products', 'procurement_suppliers'];
storageKeys.forEach(key => {
    const data = localStorage.getItem(key);
    if (data) {
        console.log(`✅ ${key} - ${JSON.parse(data).length || 'N/A'} įrašai`);
    } else {
        console.log(`❌ ${key} - Duomenų nėra`);
    }
});

// Patikrinti DOM elementus
console.log('\n🎨 DOM elementų tikrinimas:');
const requiredElements = ['login-section', 'main-app', 'content-area'];
requiredElements.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
        console.log(`✅ #${id} - Rastas`);
    } else {
        console.log(`❌ #${id} - Nerastas`);
    }
});

console.log('\n🔗 Mygtukai su onclick handlers:');
const buttons = document.querySelectorAll('button[onclick], a[onclick]');
console.log(`Rasta ${buttons.length} mygtukų su onclick handlers`);

console.log('\n🎯 Diagnostika baigta. Rezultatai išvesti į konsolę.');
console.log('📧 Nukopijuokite šiuos rezultatus ir praneškite man!');

export { availableFunctions, missingFunctions };