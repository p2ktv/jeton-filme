# Film-App

## Projekt aufsetzen

1. `yarn install`
2. `.env` File erstellen, und mit den 2 Variablen wie aus `env.example` füllen
3. Lokalen MySQL-Server starten (z. B. über XAMPP) und mit einer `filme` datenbank konfigurieren
4. `npx prisma generate`
5. `npx prisma db push`
6. Falls keine Fehler aufkommen, `yarn run dev` zum Starten benutzen

## Nutzen

- Auf den `Anmelden` Button drücken
- Falls schon ein User erstellt wurde, diesen benutzen
- Ansonsten Name & Passwort eingeben und `Registrieren` drücken
- Weiterleitung auf die `/filme` Seite, wo Filme erstellt, gelöscht und gesucht werden können
