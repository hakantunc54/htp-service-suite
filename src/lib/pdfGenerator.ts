import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePdf = (title: string, data: any[], type: 'FTTB' | 'BDE', totalsData: any) => {
  const doc = new jsPDF('landscape');
  
  // Header
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, 22);

  const grandTotal = type === 'FTTB' ? totalsData.fttbTotal : totalsData.bdeTotal;
  const totalsMap = type === 'FTTB' ? totalsData.fttb : totalsData.bde;
  
  doc.setFontSize(12);
  doc.text(`Gesamt: ${grandTotal.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}`, 280, 22, { align: 'right' });

  // Common columns
  const commonHeaders = ["Termin", "PLZ", "Ort", "Strasse", "Nr", "Port", "Kunde Name", "Kunden\nNummer", "Status"];
  
  // Mappings to db names to fetch totals
  const dbNameMap: Record<string, string> = {
    "FTTB": "FTTB", "Abbruch": "Abbruch", "Anfahrt >12": "Anfahrt >12",
    "Anfahrt\n<12": "Anfahrt <12", "MAW (5Min)": "MAW (5Min)", "PCI": "PCI",
    "vLauiAPLe": "vLauiAPLe", "Warten 5Min": "Warten 5Min", "Warten 10Min": "Warten 10Min",
    "fZugang DPU/APL": "fZugang DPU/APL", "KvHdF": "KvHdF", "Dispo": "Dispo",
    "optional": type === "FTTB" ? "Optional / Material (FTTB)" : "Optional (BDE)",
    "Arbeitszeit": "Arbeitszeit (Std.)", "Anfahrt": "Anfahrt (BDE)", "Material": "Material (BDE)"
  };

  const specificCols = type === 'FTTB' 
    ? ["FTTB", "Abbruch", "Anfahrt >12", "Anfahrt\n<12", "MAW (5Min)", "PCI", "vLauiAPLe", "Warten 5Min", "Warten 10Min", "fZugang DPU/APL", "KvHdF", "Dispo", "optional"]
    : ["Arbeitszeit", "Anfahrt", "Material", "optional"];
    
  const allHeaders = [...commonHeaders, ...specificCols];

  // Head rows: 1 for unit prices, 1 for column names, 1 for column sums
  const headPrices = commonHeaders.map(() => "");
  const headSums = commonHeaders.map(() => "");
  
  specificCols.forEach(col => {
    const dbName = dbNameMap[col];
    const stat = totalsMap[dbName] || { qty: 0, revenue: 0 };
    const unitPrice = stat.qty > 0 ? (stat.revenue / stat.qty) : 0;
    
    if (col === "optional" || col === "Material") {
        headPrices.push("");
        headSums.push(stat.revenue.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }));
    } else {
        headPrices.push(unitPrice.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }));
        headSums.push(stat.revenue.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }));
    }
  });

  const body = data.map(row => {
    if (Object.keys(row).length === 0) {
      // Empty row
      return allHeaders.map(() => ({ content: '', styles: { fillColor: [240, 240, 240] } }));
    }
    
    return allHeaders.map(col => {
      let val = row[col] !== undefined ? row[col] : "";
      if (val !== "") {
          if (col === "optional" || col === "Material") {
             val = Number(val).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
          }
      }
      return val;
    });
  });

  autoTable(doc, {
    startY: 30,
    head: [
      headPrices.map(p => ({ content: p, styles: { halign: 'right', fontSize: 7, textColor: [100, 100, 100] } })),
      allHeaders.map(h => ({ content: h, styles: { halign: 'center', fontSize: 8, fillColor: [41, 128, 185], textColor: 255 } })),
      headSums.map(s => ({ content: s, styles: { halign: 'right', fontSize: 7, fontStyle: 'bold', fillColor: [220, 230, 240] } }))
    ],
    body: body,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1 },
    columnStyles: {
      0: { cellWidth: 15 }, // Termin
      1: { cellWidth: 12 }, // PLZ
      2: { cellWidth: 20 }, // Ort
      3: { cellWidth: 25 }, // Strasse
      4: { cellWidth: 8 },  // Nr
      5: { cellWidth: 20 }, // Port
      6: { cellWidth: 20 }, // Name
      7: { cellWidth: 15 }, // KundenNr
      8: { cellWidth: 18 }, // Status
      // specific cols will auto-adjust
    },
    didParseCell: function (data) {
        // Highlight day separators
        if (data.row.raw[0] && typeof data.row.raw[0] === 'object' && data.row.raw[0].content === '') {
            data.cell.styles.fillColor = [230, 230, 230];
        }
    }
  });

  doc.save(`${title.replace(/ /g, '_')}.pdf`);
};
