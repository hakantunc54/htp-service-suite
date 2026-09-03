const fs = require('fs');
let code = fs.readFileSync('src/app/terminabsprachen/actions.ts', 'utf8');

const oldStatusBlock = `        status: {
          in: [
            "Termin abstimmen", 
            "Neu",
            "Kunde angerufen", 
            "Kunde erreicht", 
            "Kunde nicht erreicht", 
            "SMS Erstkontakt gesendet", 
            "SMS Erinnerung gesendet", 
            "Letzte Erinnerung gesendet", 
            "Kunde hat zurückgerufen"
          ]
        }`;

const newStatusBlock = `        status: {
          in: [
            "Termin abstimmen", 
            "Neu",
            "Wartet auf HTP",
            "Kunde angerufen", 
            "Kunde erreicht", 
            "Kunde nicht erreicht", 
            "SMS Erstkontakt gesendet", 
            "SMS Erinnerung gesendet", 
            "Letzte Erinnerung gesendet", 
            "Kunde hat zurückgerufen"
          ]
        }`;

code = code.replace(oldStatusBlock, newStatusBlock);
fs.writeFileSync('src/app/terminabsprachen/actions.ts', code, 'utf8');
console.log("Updated terminabsprachen actions");
