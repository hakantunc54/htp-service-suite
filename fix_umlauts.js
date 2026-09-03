const fs = require('fs');

function fixFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  // Fix specific mangled words in the modal
  code = code.replace(/n.tig/g, 'n\u00f6tig');
  code = code.replace(/Schlie.en/g, 'Schlie\u00dfen');
  code = code.replace(/Da du .ber eine/g, 'Da du \u00fcber eine');
  code = code.replace(/dr.cke/g, 'dr\u00fccke');
  code = code.replace(/und .ffne dann/g, 'und \u00f6ffne dann');
  code = code.replace(/Google Messages .ffnen/g, 'Google Messages \u00f6ffnen');
  code = code.replace(/Zur.ck zur Liste/g, 'Zur\u00fcck zur Liste');
  
  fs.writeFileSync(file, code, 'utf8');
}

fixFile('src/app/orders/[id]/page.tsx');

console.log("Fixed umlauts in page.tsx");
