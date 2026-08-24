const text = `Termin:                 08:00 - 08:45 - FTTB/G.fast Bereitstellung (IP)
Kundennummer:   4516336000
Kundenbezeichnung:      Claus Ryschka
Kontaktrufnummer:       0176/25301475
Anschlussadresse:       Scheelenkamp 14, 30165 Hannover Vahrenwald
Vertragsadresse:        Scheelenkamp 14, 30165 Hannover Vahrenwald
Netzelement:            HAN035Z180/E1/01/05
ÜVT von: 0-0-0
ÜVT nach:0101-1-5
ÜVT ab: 0-0-0
Projektbezeichnung:     FTTB (Projekt WoWi) Spar-& Bauverein Vahrenwald - mit WoWi TV`;

const blocks = text.split(/(?=Termin:)/i).filter(b => b.trim().length > 0);
for (const block of blocks) {
  const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  let port = '';
  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.startsWith('port:')) {
      port = line.substring(5).trim();
    } else if (lower.startsWith('netzelement:')) {
      port = line.substring(12).trim();
    } else if (lower.includes('port') && !port) {
      const match = line.match(/(?:port|netzelement)\s*[:\-]?\s*([a-zA-Z0-9\-\/\.]+)/i);
      if (match) port = match[1];
    }
  }
  console.log("Port is:", port);
}
