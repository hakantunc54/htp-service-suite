export enum OrderType {
  FTTB_BEREITSTELLUNG = "FTTB Bereitstellung",
  FTTB_ENTSTOERUNG = "FTTB Entstörung",
  FTTH_BEREITSTELLUNG = "FTTH Bereitstellung",
  FTTH_ENTSTOERUNG = "FTTH Entstörung",
  BDE = "BdE (Bau der Endleitung)"
}

export enum OrderStatus {
  NEU = "Neu",
  TERMIN_ABSTIMMEN = "Termin abstimmen",
  KUNDE_ANGERUFEN = "Kunde angerufen",
  KUNDE_ERREICHT = "Kunde erreicht",
  KUNDE_NICHT_ERREICHT = "Kunde nicht erreicht",
  SMS_ERSTKONTAKT = "SMS Erstkontakt gesendet",
  SMS_ERINNERUNG = "SMS Erinnerung gesendet",
  LETZTE_ERINNERUNG = "Letzte Erinnerung gesendet",
  KUNDE_ZURUECKGERUFEN = "Kunde hat zurückgerufen",
  TERMIN_VEREINBART = "Termin vereinbart",
  VOR_ORT = "Vor Ort",
  ERFOLGREICH = "Erfolgreich abgeschlossen",
  NICHT_ANGETROFFEN = "Kunde nicht angetroffen",
  TECHNIKER_BENOETIGT = "Techniker benötigt",
  STORNIERT = "Storniert",
  ABGERECHNET = "Abgerechnet",
  ARCHIVIERT = "Archiviert"
}

export enum CommunicationStatus {
  NOCH_NICHT = "Noch nicht angerufen",
  NOCH_NICHT_KONTAKTIERT = "Noch nicht kontaktiert",
  ERREICHT = "Kunde erreicht",
  NICHT_ERREICHT = "Kunde nicht erreicht",
  SMS_GESENDET = "SMS gesendet",
  ZURUECKGERUFEN = "Kunde hat zurückgerufen",
  TERMIN_BESTAETIGT = "Termin bestätigt"
}

export enum Vehicle {
  AUTO_1 = "Auto 1",
  AUTO_2 = "Auto 2",
  AUTO_3 = "Auto 3"
}

export enum ActivityType {
  LEITUNGSSUCHE = "Leitungs- und Fehlersuche",
  ROUTER_EINRICHTEN = "Router eingerichtet",
  ROUTER_RESET = "Router zurückgesetzt",
  TAE_INSTALLATION = "TAE Dose installiert",
  NETZWERKDOSE_INSTALLATION = "Netzwerkdose installiert",
  TSC_ANRUF = "TSC angerufen",
  BANDBREITE_ANPASSUNG = "Bandbreite angepasst",
  KUNDE_NICHT_DA = "Kunde nicht vor Ort",
  WARTEN_KUNDE = "Warten auf Kunde",
  WARTEN_HAUSMEISTER = "Warten auf Hausmeister",
  BAUFREIHEIT = "Baufreiheit verschafft"
}
