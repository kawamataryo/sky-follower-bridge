# Fehlerbehebung

## Authentifizierungsfehler

::: info Mit Bluesky (OAuth) anmelden — ab v3.0.0
Ab **v3.0.0** können Sie sich per OAuth anmelden, indem Sie den Tab „Bluesky“ wählen, Ihren Handle eingeben und auf „Sign in with Bluesky“ klicken. Ein Browserfenster öffnet sich zur Anmeldung; ein App-Passwort ist nicht erforderlich. Bei Problemen mit OAuth versuchen Sie den Tab „App Password“ (siehe [Anmeldeprobleme](#anmeldeprobleme-app-password-methode) unten).
:::

### Anmeldeprobleme (App-Password-Methode)

Das Folgende gilt, wenn Sie sich mit dem Tab **App Password** anmelden. Bei **Bluesky (OAuth)** (v3.0.0+) beachten Sie den Hinweis am Anfang dieses Abschnitts.

**Fehlermeldung:**  
<span class="error-message">Error: Invalid identifier or password</span>

**Checkliste:**
1. Eingabe von Benutzername und Passwort
   - Überprüfen Sie auf versehentliche Leerzeichen
   - Wenn Sie kopieren und einfügen, stellen Sie sicher, dass keine zusätzlichen Zeichen enthalten sind

2. Benutzername-Format
   - Richtiges Format: `your-username.bsky.social`
   - Häufiger Fehler: `your-username` (fehlt .bsky.social)

3. Passwortinformationen
   - Wir empfehlen dringend die Verwendung eines [App Password](https://bsky.app/settings/app-passwords) anstelle Ihres regulären Passworts
   - Format des App Password: `xxxx-xxxx-xxxx-xxxx` (19 Zeichen)

::: tip Nützliche Tipps
Verwechseln Sie das App Password nicht mit dem "password name", der in den Einstellungen angezeigt wird.
So erstellen Sie ein neues App Password:
1. [Gehen Sie zum Abschnitt App Passwords](https://bsky.app/settings/app-passwords)
2. Klicken Sie auf "Add App Password"
3. Klicken Sie auf "Create App Password"
4. Kopieren Sie das generierte 19-stellige Passwort
:::

### Zwei-Faktor-Authentifizierung erforderlich

**Fehlermeldung:**  
...

## Scan-Probleme

### Der Button "View Detected Users" funktioniert nicht

...

### Scan stoppt frühzeitig

...

### Keine Benutzer gefunden

...

**Lösung:**
1. Stellen Sie sicher, dass Sie korrekt angemeldet sind
2. Versuchen Sie erneut zu scannen - einige Benutzer werden möglicherweise beim ersten Durchlauf nicht erkannt
3. Überprüfen Sie, ob 𝕏-Benutzer ihre Bluesky-Konten in ihren Profilen verlinkt haben

## Andere Probleme

Wenn Sie unerwartete Fehler feststellen:

1. Laden Sie die Seite neu
2. Versuchen Sie die Operation erneut
3. Wenn das Problem weiterhin besteht, können Sie:
   - [Ein Problem erstellen](https://github.com/kawamataryo/sky-follower-bridge/issues) mit:
     - Der genauen Fehlermeldung
     - Was Sie zu tun versuchten
     - Ihrem Browsertyp und -version
     - Relevante Screenshots
   - Oder erwähnen Sie [@kawamataryo.bsky.social](https://bsky.app/profile/kawamataryo.bsky.social) auf Bluesky
