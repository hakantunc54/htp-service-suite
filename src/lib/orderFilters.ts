/**
 * Gemeinsame Filter für Terminabsprachen und Disposition.
 *
 * Regel: Ein Auftrag erscheint NIE gleichzeitig in Terminabsprachen und Disposition.
 * - Terminabsprachen = BdE-Auftrag UND Status ist einer der TERMINABSPRACHE_STATUSES
 * - Disposition      = alles andere Offene (BdE erst nach "Termin vereinbart")
 *
 * Achtung: Diese Datei bewusst NICHT mit "use server" markieren,
 * da sie Konstanten exportiert (Server-Action-Dateien dürfen nur async-Funktionen exportieren).
 */

/** Status, in denen sich ein BdE-Auftrag noch in der Terminabsprache befindet */
export const TERMINABSPRACHE_STATUSES = [
  "Termin abstimmen",
  "Neu",
  "Wartet auf HTP",
  "Kunde angerufen",
  "Kunde erreicht",
  "Kunde nicht erreicht",
  "SMS Erstkontakt gesendet",
  "SMS Erinnerung gesendet",
  "Letzte Erinnerung gesendet",
  "Kunde hat zurückgerufen",
];

/** Prisma-Filter: Auftragstyp ist BdE (SQLite kennt kein case-insensitive contains) */
export const BDE_ORDER_TYPE_FILTER = [
  { orderType: { contains: "BdE" } },
  { orderType: { contains: "BDE" } },
  { orderType: { contains: "bde" } },
  { orderType: { contains: "Endleitung" } },
  { orderType: { contains: "endleitung" } },
];

/** Abgeschlossene/inaktive Status, die nie in der Disposition auftauchen */
export const DISPOSITION_EXCLUDED_STATUSES = [
  "Erfolgreich abgeschlossen",
  "Storniert",
  "Storno HTP",
  "Abbruch",
  "Abgerechnet",
  "Archiviert",
  "Termin abstimmen",
];
