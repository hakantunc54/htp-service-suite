import { OrderType } from "@/types";

export interface ParsedOrder {
  htpPlanfenster?: string;
  orderType?: string;
  customerNumber?: string;
  customerName: string;
  phone?: string;
  mobile?: string;
  address: string;
  
  // Terminabsprache fields
  isTerminabsprache?: boolean;
  vosNumber?: string;
  broadbandTechnology?: string;
  port?: string;
}

/**
 * Erkennt den Auftragstyp tolerant aus einem beliebigen Text.
 * Gibt `undefined` zurück, wenn kein Typ eindeutig erkennbar ist.
 *
 * Beispiele:
 *   "FTTB/G.fast Bereitstellung (IP)" → FTTB Bereitstellung
 *   "G.fast"                          → FTTB Bereitstellung
 *   "FTTB Entstörung"                 → FTTB Entstörung
 *   "FTTH"                            → FTTH Bereitstellung
 *   "Bau der Endleitung" / "BdE"      → BdE
 */
export function detectOrderType(text: string): OrderType | undefined {
  if (!text) return undefined;
  const t = text.toLowerCase();

  // Entstörung tolerant erkennen (auch mit kaputten Umlauten aus Mails, z.B. "Entst�rung")
  const isEntstoerung = /entst.{0,2}rung|st(ö|oe)rung/.test(t);

  if (/\bbde\b|endleitung/.test(t)) return OrderType.BDE;
  if (/ftth/.test(t)) return isEntstoerung ? OrderType.FTTH_ENTSTOERUNG : OrderType.FTTH_BEREITSTELLUNG;
  if (/fttb|g\.?\s?fast/.test(t)) return isEntstoerung ? OrderType.FTTB_ENTSTOERUNG : OrderType.FTTB_BEREITSTELLUNG;

  return undefined;
}

/** "8" → "08:00", "8:5" → "08:05", "08:45" → "08:45" */
function normalizeTime(hour: string, minute?: string): string {
  return `${hour.padStart(2, "0")}:${(minute || "00").padStart(2, "0")}`;
}

/**
 * Zerlegt den Inhalt der Termin-Zeile in Zeitfenster und Rest (= Auftragstyp-Text).
 * Unterstützt u.a.:
 *   "08:00 - 08:45 - FTTB/G.fast Bereitstellung (IP)"
 *   "08:00-08:45 FTTB/G.fast Bereitstellung"
 *   "08:00 - FTTB/G.fast Bereitstellung"
 *   "8 Uhr - FTTB G.fast"
 *   "8:00 bis 9:00 Uhr FTTB"
 *   "FTTB/G.fast Bereitstellung" (ohne Uhrzeit)
 */
function parseTerminContent(content: string): { htpPlanfenster: string; rest: string } {
  const timePart = String.raw`(\d{1,2})(?:[:.](\d{2}))?\s*(?:uhr)?`;
  const rangeRegex = new RegExp(String.raw`^\s*${timePart}\s*(?:-|–|bis)\s*${timePart}`, "i");
  const singleRegex = new RegExp(String.raw`^\s*${timePart}`, "i");

  let htpPlanfenster = "";
  let rest = content;

  const range = content.match(rangeRegex);
  if (range) {
    htpPlanfenster = `${normalizeTime(range[1], range[2])} - ${normalizeTime(range[3], range[4])}`;
    rest = content.substring(range[0].length);
  } else {
    const single = content.match(singleRegex);
    if (single) {
      htpPlanfenster = normalizeTime(single[1], single[2]);
      rest = content.substring(single[0].length);
    }
  }

  // Führende Trennzeichen vom Rest entfernen (" - ", "–", ":", ",")
  rest = rest.replace(/^[\s\-–:,]+/, "").trim();

  return { htpPlanfenster, rest };
}

export function parseHtpEmail(text: string): ParsedOrder[] {
  const orders: ParsedOrder[] = [];
  
  // Detect if it's a Terminabsprache by looking for "Terminabsprache" or "ID-VOS-Auftrag:"
  if (text.toLowerCase().includes("terminabsprache") || text.toLowerCase().includes("id-vos-auftrag:")) {
    // Es kann sein, dass mehrere VOS Blöcke in einer Mail sind, wir trennen nach "ID-VOS-Auftrag:"
    const blocks = text.split(/(?=ID-VOS-Auftrag:)/i).filter(b => b.trim().length > 0);
    
    for (const block of blocks) {
      if (!block.toLowerCase().includes("id-vos-auftrag:")) continue;
      
      const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      let customerName = '';
      let customerNumber = '';
      let phone = '';
      let address = '';
      let vosNumber = '';
      let broadbandTechnology = '';
      let port = '';
      
      for (const line of lines) {
        const lower = line.toLowerCase();
        if (lower.startsWith('id-vos-auftrag:')) vosNumber = line.substring(15).trim();
        else if (lower.startsWith('kundennummer:')) customerNumber = line.substring(13).trim();
        else if (lower.startsWith('name:')) customerName = line.substring(5).trim();
        else if (lower.startsWith('anschlussadresse:')) address = line.substring(17).trim();
        else if (lower.startsWith('kontaktrufnummer:')) phone = line.substring(17).trim();
        else if (lower.startsWith('breitbandtechnik:')) broadbandTechnology = line.substring(17).trim();
        else if (lower.startsWith('port:')) port = line.substring(5).trim();
          else if (lower.startsWith('netzelement:')) port = line.substring(12).trim();
          else if (lower.includes('port') && !port) {
            const match = line.match(/(?:port|netzelement)\s*[:\-]?\s*([a-zA-Z0-9\-\/\.]+)/i);
            if (match) port = match[1];
          }
      }
      
      if (customerName || address) {
        orders.push({
          isTerminabsprache: true,
          orderType: OrderType.BDE, // Default to BdE, can be adjusted
          customerNumber,
          customerName: customerName || "Unbekannt",
          phone,
          address,
          vosNumber,
          broadbandTechnology,
          port
        });
      }
    }
  } else {
    // Standard htp Disposition Parsing
    // \b verhindert, dass z.B. "Wunschtermin:" als neuer Auftrag erkannt wird
    const blocks = text.split(/(?=\bTermin\s*:)/i).filter(b => b.trim().length > 0);

    for (const block of blocks) {
      const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      
      let htpPlanfenster = '';
      let terminLine = '';
      let orderTypeStr = '';
      let projectLine = '';
      let customerNumber = '';
      let customerName = '';
      let phone = '';
      let address = '';
      let port = '';

      for (const line of lines) {
        const lower = line.toLowerCase();
        const terminMatch = line.match(/^termin\s*:\s*(.*)$/i);

        if (terminMatch) {
          terminLine = terminMatch[1].trim();
          const parsedTermin = parseTerminContent(terminLine);
          htpPlanfenster = parsedTermin.htpPlanfenster;
          orderTypeStr = parsedTermin.rest;
        }
        else if (lower.startsWith('kundennummer:')) {
          customerNumber = line.substring(13).trim();
        }
        else if (lower.startsWith('kundenbezeichnung:')) {
          customerName = line.substring(18).trim();
        }
        else if (lower.startsWith('kontaktrufnummer:')) {
          phone = line.substring(17).trim();
        }
        else if (lower.startsWith('anschlussadresse:')) {
          address = line.substring(17).trim();
        }
        else if (lower.startsWith('projektbezeichnung:')) {
          projectLine = line.substring(19).trim();
        }
        else if (lower.startsWith('port:')) {
            port = line.substring(5).trim();
          } else if (lower.startsWith('netzelement:')) {
            port = line.substring(12).trim();
          } else if (lower.includes('port') && !port) {
            const match = line.match(/(?:port|netzelement)\s*[:\-]?\s*([a-zA-Z0-9\-\/\.]+)/i);
            if (match) port = match[1];
          }
      }

      // Auftragstyp in absteigender Priorität suchen:
      // 1. Rest der Termin-Zeile  2. ganze Termin-Zeile  3. Projektbezeichnung  4. ganzer Block
      const mappedType =
        detectOrderType(orderTypeStr) ??
        detectOrderType(terminLine) ??
        detectOrderType(projectLine) ??
        detectOrderType(block);

      if (customerName || address) {
        orders.push({
          isTerminabsprache: false,
          htpPlanfenster,
          // undefined = nicht erkannt → wird in Import-Vorschau / Disposition als "Typ fehlt" markiert
          orderType: mappedType,
          customerNumber,
          customerName: customerName || "Unbekannt",
          phone,
          address,
          port
        });
      }
    }
  }

  return orders;
}
