const fs = require('fs');
const lines = fs.readFileSync('raw_data.txt', 'utf8').split('\n').filter(l => l.trim().length > 0);

const excelPrices = {
    "FTTB": 58,
    "Abbruch": 20,
    "Anfahrt >12": 50,
    "Anfahrt <12": 85,
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

let excelSum = 0;
let crmSum = 0;

let anfahrtGroups = {};

for (const line of lines) {
    const parts = line.split('\t');
    if (parts.length < 15) continue;
    
    // Col 0: Termin
    // Col 5: Techniker
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

    const rowExcel = 
        fttb * excelPrices["FTTB"] +
        abbruch * excelPrices["Abbruch"] +
        maw * excelPrices["MAW (5Min)"] +
        pci * excelPrices["PCI"] +
        vlau * excelPrices["vLauiAPLe"] +
        w5 * excelPrices["Warten 5Min"] +
        w10 * excelPrices["Warten 10Min"] +
        fz * excelPrices["fZugang DPU/APL"] +
        kv * excelPrices["KvHdF"] +
        opt * excelPrices["optional"];
        
    excelSum += rowExcel;
    
    const rowCrm = 
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
        
    crmSum += rowCrm;
}

let excelAnfahrtSum = 0;
let crmAnfahrtSum = 0;

for (const key in anfahrtGroups) {
    const count = anfahrtGroups[key];
    if (count > 0) {
        if (count >= 12) {
            excelAnfahrtSum += excelPrices["Anfahrt >12"];
            crmAnfahrtSum += 55; // CRM price for >12
        } else {
            excelAnfahrtSum += excelPrices["Anfahrt <12"];
            crmAnfahrtSum += 85; // CRM price for <12
        }
    }
}

console.log("EXCEL TOTAL:", excelSum + excelAnfahrtSum);
console.log("EXCEL BREAKDOWN: Base=", excelSum, "Anfahrt=", excelAnfahrtSum);

console.log("CRM TOTAL:", crmSum + crmAnfahrtSum);
console.log("CRM BREAKDOWN: Base=", crmSum, "Anfahrt=", crmAnfahrtSum);
