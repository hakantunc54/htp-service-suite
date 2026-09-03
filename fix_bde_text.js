const fs = require('fs');

function fixFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  // Fix the "für" issue (which might have been mangled into fr or something)
  // Instead of guessing the mangled char, we replace using regex with wildcards for the char between f and r
  code = code.replace(/f.r Excel/g, 'f\u00fcr Excel');
  code = code.replace(/f.r diesen/g, 'f\u00fcr diesen');
  
  // Fix the "neuer Bautermin erforderlich" to "neuer BT erforderlich"
  code = code.replace(/neuer Bautermin erforderlich/g, 'neuer BT erforderlich');
  
  fs.writeFileSync(file, code, 'utf8');
}

fixFile('src/components/EditServicesModal.tsx');
fixFile('src/app/orders/page.tsx');

console.log("Fixed texts in both files");
