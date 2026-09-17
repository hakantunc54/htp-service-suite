import fs from 'fs/promises';
import path from 'path';

/**
 * Interface für den Storage-Service zur Speicherung und Verwaltung von Objekt-Fotos.
 */
export interface StorageService {
  /**
   * Speichert eine Datei für ein bestimmtes Objekt.
   *
   * @param objectNumber - Die eindeutige Objektnummer (z. B. "OBJ-000001")
   * @param filename - Der Dateiname (z. B. "dpu_keller.jpg")
   * @param data - Die Dateidaten als Buffer
   * @returns Der relative Pfad zur gespeicherten Datei (z. B. "OBJ-000001/dpu_keller.jpg")
   */
  save(objectNumber: string, filename: string, data: Buffer): Promise<string>;

  /**
   * Liest eine Datei anhand ihres relativen Pfades.
   *
   * @param relativePath - Der relative Pfad zur Datei (z. B. "OBJ-000001/dpu_keller.jpg" oder "objekt-fotos/OBJ-000001/dpu_keller.jpg")
   * @returns Die Dateidaten als Buffer
   */
  get(relativePath: string): Promise<Buffer>;

  /**
   * Löscht eine Datei anhand ihres relativen Pfades.
   *
   * @param relativePath - Der relative Pfad zur Datei
   */
  delete(relativePath: string): Promise<void>;

  /**
   * Listet alle Dateinamen auf, die zu einem bestimmten Objekt gehören.
   *
   * @param objectNumber - Die eindeutige Objektnummer (z. B. "OBJ-000001")
   * @returns Ein Array mit den vorhandenen Dateinamen (z. B. ["foto1.jpg", "foto2.jpg"])
   */
  list(objectNumber: string): Promise<string[]>;
}

/**
 * Dateisystem-basierte Implementierung des StorageService für Gebäude- und Objekt-Fotos.
 *
 * Fotos werden standardmäßig unter `{process.cwd()}/htp-data/objekt-fotos/` abgelegt,
 * organisiert in Unterordnern pro Objektnummer (z. B. `OBJ-000001/filename.jpg`).
 */
export class LocalStorageService implements StorageService {
  private readonly baseDir: string;

  /**
   * Erstellt eine Instanz von LocalStorageService.
   *
   * @param customBaseDir - Optionaler benutzerdefinierter Basispfad. Falls nicht angegeben,
   *                        wird der Pfad aus Umgebungsvariablen (PHOTO_STORAGE_DIR, OBJEKT_FOTOS_DIR,
   *                        STORAGE_DIR, STORAGE_PATH) gelesen oder auf `./htp-data/objekt-fotos/`
   *                        relativ zu process.cwd() gesetzt.
   */
  constructor(customBaseDir?: string) {
    const configuredDir =
      customBaseDir ||
      process.env.PHOTO_STORAGE_DIR ||
      process.env.OBJEKT_FOTOS_DIR ||
      process.env.STORAGE_DIR ||
      process.env.STORAGE_PATH ||
      './htp-data/objekt-fotos/';

    this.baseDir = path.resolve(/* turbopackIgnore: true */ process.cwd(), configuredDir);
  }

  /**
   * Gibt den konfigurierten absoluten Basispfad des Speichers zurück.
   */
  public getBaseDir(): string {
    return this.baseDir;
  }

  /**
   * Löst einen relativen Pfad sicher in einen absoluten Pfad innerhalb des Basispfads auf.
   * Verhindert Directory-Traversal-Angriffe und unterstützt sowohl Pfade mit als auch ohne
   * führende Ordnernamen wie "objekt-fotos/" oder "htp-data/objekt-fotos/".
   *
   * @param relativePath - Der aufzulösende relative Pfad
   * @returns Der absolute Dateipfad
   */
  private resolveFilePath(relativePath: string): string {
    if (!relativePath || typeof relativePath !== 'string') {
      throw new Error('Ungültiger Pfad: Relativer Pfad darf nicht leer sein.');
    }

    // Pfadtrenner normalisieren
    let normalized = relativePath.replace(/\\/g, '/').trim();

    // Führenden Slash entfernen
    if (normalized.startsWith('/')) {
      normalized = normalized.substring(1);
    }

    // Mögliche redundante Präfixe entfernen, falls der übergebene Pfad diese enthält
    if (normalized.startsWith('htp-data/objekt-fotos/')) {
      normalized = normalized.substring('htp-data/objekt-fotos/'.length);
    } else if (normalized.startsWith('objekt-fotos/')) {
      normalized = normalized.substring('objekt-fotos/'.length);
    }

    // Absoluten Pfad berechnen
    const absolutePath = path.resolve(this.baseDir, normalized);

    // Sicherheitsprüfung: Pfad darf nicht aus baseDir ausbrechen
    const relativeToBase = path.relative(this.baseDir, absolutePath);
    if (relativeToBase.startsWith('..') || path.isAbsolute(relativeToBase)) {
      throw new Error(`Sicherheitswarnung: Zugriff verweigert für Pfad '${relativePath}'.`);
    }

    return absolutePath;
  }

  /**
   * Bereinigt einen Objektnummer-String und stellt sicher, dass keine Pfadmanipulation möglich ist.
   *
   * @param objectNumber - Die Objektnummer
   */
  private sanitizeObjectNumber(objectNumber: string): string {
    if (!objectNumber || typeof objectNumber !== 'string') {
      throw new Error('Objektnummer darf nicht leer sein.');
    }

    const clean = path.basename(objectNumber.trim());
    if (!clean || clean === '.' || clean === '..') {
      throw new Error(`Ungültige Objektnummer: '${objectNumber}'.`);
    }

    return clean;
  }

  /**
   * Bereinigt einen Dateinamen und stellt sicher, dass keine Pfadmanipulation möglich ist.
   *
   * @param filename - Der Dateiname
   */
  private sanitizeFilename(filename: string): string {
    if (!filename || typeof filename !== 'string') {
      throw new Error('Dateiname darf nicht leer sein.');
    }

    const clean = path.basename(filename.trim());
    if (!clean || clean === '.' || clean === '..') {
      throw new Error(`Ungültiger Dateiname: '${filename}'.`);
    }

    return clean;
  }

  /**
   * Speichert eine Datei für ein bestimmtes Objekt.
   * Erstellt benötigte Unterverzeichnisse automatisch.
   *
   * @param objectNumber - Die Objektnummer (z. B. "OBJ-000001")
   * @param filename - Der Dateiname (z. B. "foto.jpg")
   * @param data - Die Dateidaten als Buffer
   * @returns Der relative Pfad zur Datei (z. B. "OBJ-000001/foto.jpg")
   */
  async save(objectNumber: string, filename: string, data: Buffer): Promise<string> {
    const cleanObjectNumber = this.sanitizeObjectNumber(objectNumber);
    const cleanFilename = this.sanitizeFilename(filename);

    const objectDir = path.join(this.baseDir, cleanObjectNumber);

    // Unterverzeichnis erstellen, falls noch nicht existent
    await fs.mkdir(objectDir, { recursive: true });

    const filePath = path.join(objectDir, cleanFilename);
    await fs.writeFile(filePath, data);

    // Relativen Pfad mit POSIX-Slashes zurückgeben
    return path.posix.join(cleanObjectNumber, cleanFilename);
  }

  /**
   * Liest eine Datei anhand ihres relativen Pfades.
   *
   * @param relativePath - Der relative Pfad (z. B. "OBJ-000001/foto.jpg")
   * @returns Die Dateidaten als Buffer
   */
  async get(relativePath: string): Promise<Buffer> {
    const filePath = this.resolveFilePath(relativePath);

    try {
      return await fs.readFile(filePath);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        const notFoundError = new Error(`Datei nicht gefunden: ${relativePath}`);
        (notFoundError as any).code = 'ENOENT';
        throw notFoundError;
      }
      throw error;
    }
  }

  /**
   * Löscht eine Datei anhand ihres relativen Pfades.
   * Verhält sich idempotent: Wirft keinen Fehler, wenn die Datei nicht existiert.
   *
   * @param relativePath - Der relative Pfad (z. B. "OBJ-000001/foto.jpg")
   */
  async delete(relativePath: string): Promise<void> {
    const filePath = this.resolveFilePath(relativePath);

    try {
      await fs.unlink(filePath);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // Datei existiert bereits nicht mehr; idempotent beenden
        return;
      }
      throw error;
    }
  }

  /**
   * Listet alle vorhandenen Dateinamen für ein bestimmtes Objekt auf.
   *
   * @param objectNumber - Die Objektnummer (z. B. "OBJ-000001")
   * @returns Liste der Dateinamen (leer, falls der Ordner noch nicht existiert)
   */
  async list(objectNumber: string): Promise<string[]> {
    const cleanObjectNumber = this.sanitizeObjectNumber(objectNumber);
    const objectDir = path.join(this.baseDir, cleanObjectNumber);

    try {
      const entries = await fs.readdir(objectDir, { withFileTypes: true });
      return entries
        .filter((entry) => entry.isFile())
        .map((entry) => entry.name)
        .sort();
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }
}

/**
 * Standard-Singleton-Instanz des Storage-Service.
 */
export const storage = new LocalStorageService();

export default storage;
