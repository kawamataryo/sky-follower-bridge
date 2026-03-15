# Erste Schritte

Sky Follower Bridge hilft Ihnen, Ihre Verbindungen von 𝕏 (Twitter) auf Bluesky zu finden und zu folgen.

<iframe width="100%" height="315" src="https://www.youtube.com/embed/CnjjfSxm0G0?si=N2OFp15PPiZZezEN" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Installation

Sky Follower Bridge ist verfügbar auf:

<ul class="install-list">
  <li>
    <img src="/images/icon-chrome.svg" width="20" height="20">
    <a href="https://chrome.google.com/webstore/detail/sky-follower-bridge/behhbpbpmailcnfbjagknjngnfdojpko" target="_blank" rel="noopener noreferrer" class="gtm-link-to-store">Chrome Web Store</a> (Empfohlen⭐)
  </li>
  <li>
    <img src="/images/icon-firefox.svg" width="20" height="20">
    <a href="https://addons.mozilla.org/en-US/firefox/addon/sky-follower-bridge/" target="_blank" rel="noopener noreferrer" class="gtm-link-to-store">Firefox Add-ons</a>
  </li>
  <li>
    <img src="/images/icon-edge.svg" width="20" height="20">
    <a href="https://microsoftedge.microsoft.com/addons/detail/sky-follower-bridge/dpeolmdblhfolkhlhbhlofkkpaojnnbb" target="_blank" rel="noopener noreferrer" class="gtm-link-to-store">Microsoft Edge Add-ons</a>
  </li>
  <li>
    <img src="/images/icon-safari.svg" width="20" height="20">
    <a href="https://apps.apple.com/us/app/sky-follower-bridge/id6738878242?mt=12" target="_blank" rel="noopener noreferrer" class="gtm-link-to-store">Safari Web Extension</a> <span>(Dank an <a href="https://bsky.app/profile/knotbin.xyz">@knotbin.xyz</a>)</span>
  </li>
</ul>

::: tip
Wir empfehlen die Verwendung der Chrome Web Store-Version, da sie immer auf dem neuesten Stand ist. Andere Store-Versionen können bei Updates hinterherhinken.
:::

::: warning
Sky Follower Bridge ist nur für Desktop-Browser verfügbar. Mobile Browser werden nicht unterstützt.
:::

## Nutzung

### 1. Navigieren Sie zu 𝕏 (Twitter)

Besuchen Sie eine dieser Seiten auf X:
- Ihre Folgen-Seite: [x.com/following](https://x.com/following)
- Ihre blockierten Nutzer: [x.com/settings/blocked/all](https://x.com/settings/blocked/all)
- Die Mitglieder-Seite einer öffentlichen Liste: `x.com/i/lists/<list_id>/members`

![following-page](/images/following-page.png)

### 2. Sky Follower Bridge starten

Drücken Sie `Alt + B` oder klicken Sie auf das Erweiterungs-Symbol in der Browser-Leiste.

::: tip
Bei Firefox funktioniert `Alt + B` ggf. nicht. Klicken Sie in dem Fall auf das Erweiterungs-Symbol.

https://support.mozilla.org/en-US/kb/extensions-button
:::

![Open Extension](/images/open-extension.png)

### 3. Bei Bluesky anmelden

- **Bluesky (OAuth)** (empfohlen): Handle eingeben und „Sign in with Bluesky“ für die OAuth-Anmeldung klicken.
- **App Password**: Zum Tab **App Password** wechseln und Handle (oder E-Mail), [App-Passwort](https://bsky.app/settings/app-passwords) sowie **Service URL** eingeben (Standard: `https://bsky.social`). Bei self-hosted PDS die PDS-URL im Feld Service URL eintragen.

::: tip
Bei Anmeldefehlern siehe [Anleitung zur Fehlerbehebung](/de/troubleshooting).
:::

![App-Password-Tab mit Service URL](/images/app-password-service-url.png)

#### Self-hosted PDS (v3.1.0+)

Wenn Sie einen self-hosted Bluesky PDS (Personal Data Server) statt bsky.social nutzen:

1. Erweiterung öffnen und zum Tab **App Password** wechseln.
2. Handle (oder E-Mail), App-Passwort und unter **Service URL** Ihre PDS-URL eintragen (z. B. `https://your-pds.example.com`).
3. Auf Login klicken.

Ihr PDS muss mit dem AT Protocol kompatibel sein.

### 4. Suche starten

Klicken Sie auf "Find Bluesky Users", um den Scan zu starten. Die Erweiterung sucht nach passenden Bluesky-Profilen, indem sie die Bluesky-API überprüft.

![find-bluesky-users](/images/scan-users.png)

### 5. Ergebnisse überprüfen

Klicken Sie auf "View Results", um die potenziellen Übereinstimmungen auf Bluesky zu sehen.

![view-results-button](/images/click-results.png)

Dies öffnet die Optionsseite, die alle erkannten Bluesky-Benutzer anzeigt.

![options](/images/options.png)

### 6. Benutzer folgen

Klicken Sie auf die Schaltfläche "Follow" neben jedem Benutzer, mit dem Sie sich verbinden möchten.

![follow](/images/click-follow-btn.png)

oder verwenden Sie die Schaltfläche "Follow All", um alle erkannten Benutzer auf einmal zu folgen.

![follow-all](/images/follow-all-btn.png)

::: warning
Bitte beachten Sie, dass der Abgleichsprozess nicht perfekt ist und gelegentlich falsche Übereinstimmungen vorschlagen kann. Überprüfen Sie immer das Profil, bevor Sie folgen.
:::

Das ist alles! Viel Spaß beim Verbinden mit Ihrer Community auf Bluesky 🎉 
