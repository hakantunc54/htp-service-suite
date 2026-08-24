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
    const blocks = text.split(/(?=Termin:)/i).filter(b => b.trim().length > 0);

    for (const block of blocks) {
      const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      
      let htpPlanfenster = '';
      let orderTypeStr = '';
      let customerNumber = '';
      let customerName = '';
      let phone = '';
      let address = '';
      let port = '';

      for (const line of lines) {
        if (line.toLowerCase().startsWith('termin:')) {
          const content = line.substring(7).trim();
          const parts = content.split(' - ');
          if (parts.length >= 2) {
            htpPlanfenster = parts[0].trim() + ' - ' + parts[1].trim(); 
            orderTypeStr = parts.slice(2).join(' - ').trim();
          } else {
            htpPlanfenster = content;
          }
        }
        else if (line.toLowerCase().startsWith('kundennummer:')) {
          customerNumber = line.substring(13).trim();
        }
        else if (line.toLowerCase().startsWith('kundenbezeichnung:')) {
          customerName = line.substring(18).trim();
        }
        else if (line.toLowerCase().startsWith('kontaktrufnummer:')) {
          phone = line.substring(17).trim();
        }
        else if (line.toLowerCase().startsWith('anschlussadresse:')) {
          address = line.substring(17).trim();
        }
        else if (line.toLowerCase().startsWith('port:')) {
          port = line.substring(5).trim();
        }
      }

      let mappedType = OrderType.BDE; 
      const t = orderTypeStr.toLowerCase();
      if (t.includes('fttb') && t.includes('bereitstellung')) mappedType = OrderType.FTTB_BEREITSTELLUNG;
      else if (t.includes('fttb') && t.includes('entstörung')) mappedType = OrderType.FTTB_ENTSTOERUNG;
      else if (t.includes('ftth') && t.includes('bereitstellung')) mappedType = OrderType.FTTH_BEREITSTELLUNG;
      else if (t.includes('ftth') && t.includes('entstörung')) mappedType = OrderType.FTTH_ENTSTOERUNG;
      else mappedType = orderTypeStr as OrderType;

      if (customerName || address) {
        orders.push({
          isTerminabsprache: false,
          htpPlanfenster,
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
