/**
 * Adress-Normalisierung für das Objekt-Matching.
 * Erzeugt aus beliebigen deutschen Adressformaten einen einheitlichen Schlüssel.
 */

export interface ParsedAddress {
  street: string;
  houseNumber: string;
  zipCode: string;
  city: string;
  normalized: string;
}

/**
 * Ersetzt deutsche Umlaute und ß.
 */
function replaceUmlauts(str: string): string {
  return str
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/Ä/g, "ae")
    .replace(/Ö/g, "oe")
    .replace(/Ü/g, "ue");
}

/**
 * Normalisiert eine deutsche Adresse in ihre Bestandteile.
 * 
 * Beispiele:
 *   "Waldweg 1, 30853 Langenhagen"           → "waldweg_1_30853"
 *   "Marktstraße 10A, 31249 Hohenhameln"      → "marktstrasse_10a_31249"
 *   "Am Springbrunnen 3, 38170 Schöppenstedt" → "am_springbrunnen_3_38170"
 *   "An der Windmühle 23, 30900 Wedemark"     → "an_der_windmuehle_23_30900"
 */
export function normalizeAddress(fullAddress: string): ParsedAddress {
  if (!fullAddress || !fullAddress.trim()) {
    return { street: "", houseNumber: "", zipCode: "", city: "", normalized: "" };
  }

  let addr = fullAddress.trim();

  // PLZ extrahieren (5 aufeinanderfolgende Ziffern)
  const plzMatch = addr.match(/\b(\d{5})\b/);
  const zipCode = plzMatch ? plzMatch[1] : "";

  // Teil vor der PLZ = Straße + Hausnummer
  // Teil nach der PLZ = Ort
  let streetPart = "";
  let cityPart = "";

  if (plzMatch && plzMatch.index !== undefined) {
    streetPart = addr.substring(0, plzMatch.index).trim();
    cityPart = addr.substring(plzMatch.index + 5).trim();
  } else {
    streetPart = addr;
  }

  // Kommas und Punkte am Ende entfernen
  streetPart = streetPart.replace(/[,.\s]+$/g, "").trim();
  cityPart = cityPart.replace(/^[,.\s]+/g, "").trim();

  // Straße und Hausnummer trennen:
  // Letzte Zahl (mit optionalem Buchstaben-Suffix) ist die Hausnummer
  const hnMatch = streetPart.match(/^(.+?)\s+(\d+\s*[a-zA-Z]?\s*(?:[-/]\s*\d+)?)$/);
  
  let street = "";
  let houseNumber = "";

  if (hnMatch) {
    street = hnMatch[1].trim();
    houseNumber = hnMatch[2].replace(/\s+/g, "").trim(); // "10 B" → "10B"
  } else {
    // Fallback: gesamter Teil ist die Straße
    street = streetPart;
  }

  // Normalisierung für den Schlüssel
  const normStreet = replaceUmlauts(street.toLowerCase())
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "_")
    .trim();

  const normHouseNumber = replaceUmlauts(houseNumber.toLowerCase())
    .replace(/[^a-z0-9]/g, "")
    .trim();

  const normalized = normStreet && normHouseNumber && zipCode
    ? `${normStreet}_${normHouseNumber}_${zipCode}`
    : normStreet && zipCode
    ? `${normStreet}_${zipCode}`
    : normStreet || "";

  return {
    street: street || streetPart,
    houseNumber,
    zipCode,
    city: cityPart,
    normalized,
  };
}

/**
 * Formatiert eine Objektnummer als "OBJ-000001".
 */
export function formatObjectNumber(num: number): string {
  return `OBJ-${String(num).padStart(6, "0")}`;
}
