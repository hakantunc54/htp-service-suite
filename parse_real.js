const fs = require('fs');
const lines = fs.readFileSync('raw_data.txt', 'utf8').split('\n').filter(l => l.trim().length > 0);

const crmPrices = {
    "FTTB": 38,
    "Abbruch": 20,
    "MAW (5Min)": 4.5,
    "PCI": 20,
    "vLauiAPLe": 15,
    "Warten 5Min": 4.5,
    "Warten 10Min": 8,
    "fZugang DPU/APL": 13,
    "KvHdF": 15,
    "Dispo": 0,
    "optional": 1
};

let crmSum = 0;
let anfahrtGroups = {};

for (const line of lines) {
    const parts = line.split('\t');
    if (parts.length < 15) continue;
    
    const dateStr = parts[0].trim();
    const tech = parts[5].trim();
    const groupKey = `${dateStr}_${tech}`;
    
    if(!anfahrtGroups[groupKey]) anfahrtGroups[groupKey] = 0;
    
    const fttb = parseInt(parts[13]) || 0;
    const abbruch = parseInt(parts[14]) || 0;
    const maw = parseInt(parts[17]) || 0;
    const pci = parseInt(parts[18]) || 0;
    const vlau = parseInt(parts[19]) || 0;
    const w5 = parseInt(parts[20]) || 0;
    const w10 = parseInt(parts[21]) || 0;
    const fz = parseInt(parts[22]) || 0;
    const kv = parseInt(parts[23]) || 0;
    const opt = parseInt(parts[25]) || 0;
    
    if (fttb > 0 || abbruch > 0 || maw > 0 || pci > 0 || vlau > 0 || w5 > 0 || w10 > 0 || fz > 0 || kv > 0) {
        anfahrtGroups[groupKey] += 1;
    }

    crmSum += 
        fttb * crmPrices["FTTB"] +
        abbruch * crmPrices["Abbruch"] +
        maw * crmPrices["MAW (5Min)"] +
        pci * crmPrices["PCI"] +
        vlau * crmPrices["vLauiAPLe"] +
        w5 * crmPrices["Warten 5Min"] +
        w10 * crmPrices["Warten 10Min"] +
        fz * crmPrices["fZugang DPU/APL"] +
        kv * crmPrices["KvHdF"] +
        opt * crmPrices["optional"];
}

let crmAnfahrtSum = 0;
for (const key in anfahrtGroups) {
    const count = anfahrtGroups[key];
    if (count > 0) {
        if (count >= 12) {
            crmAnfahrtSum += 15; // CRM DB price for >12
        } else {
            crmAnfahrtSum += 10; // CRM DB price for <12
        }
    }
}

console.log("CRM DB PRICES TOTAL:", crmSum + crmAnfahrtSum);
console.log("CRM DB BREAKDOWN: Base=", crmSum, "Anfahrt=", crmAnfahrtSum);
