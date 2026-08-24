const fs = require('fs');
let code = fs.readFileSync('src/app/billing/page.tsx', 'utf8');

const importStatement = "import { generatePdf } from '@/lib/pdfGenerator';\nimport { FileText } from 'lucide-react';\n";
code = code.replace("import { Download, Calendar, Calculator } from \"lucide-react\";", "import { Download, Calendar, Calculator, FileText } from \"lucide-react\";\n" + importStatement);

const newFunctions = `
  const handlePdfExport = async (type: 'FTTB' | 'BDE') => {
    if (!startDate || !endDate) {
      toast.error("Bitte Start- und Enddatum w\\u00e4hlen");
      return;
    }
    
    setIsExporting(true);
    toast.info("Generiere PDF...");
    
    try {
      const response = await fetch(\`/api/export-billing?start=\${startDate}&end=\${endDate}&format=json\`);
      const data = await response.json();
      
      const monthNames = ["Januar", "Februar", "M\\u00e4rz", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
      const startD = new Date(startDate);
      const monthStr = monthNames[startD.getMonth()] + " " + startD.getFullYear();
      
      const title = \`Leistungsnachweis \${type} - \${monthStr}\`;
      const exportData = type === 'FTTB' ? data.groupedFttb : data.groupedBde;
      
      generatePdf(title, exportData, type, data.totals);
      toast.success("PDF erfolgreich generiert!");
    } catch (e) {
      console.error(e);
      toast.error("Fehler beim PDF Export");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExport = async () => {
`;
code = code.replace("  const handleExport = async () => {", newFunctions);

const newButtons = `
            <button 
              onClick={() => handlePdfExport('FTTB')}
              disabled={isExporting}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <FileText className="w-4 h-4" />
              PDF FTTB
            </button>
            <button 
              onClick={() => handlePdfExport('BDE')}
              disabled={isExporting}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <FileText className="w-4 h-4" />
              PDF BDE
            </button>
            <button 
              onClick={handleExport}
`;
code = code.replace("<button \n              onClick={handleExport}", newButtons);

fs.writeFileSync('src/app/billing/page.tsx', code, 'utf8');
