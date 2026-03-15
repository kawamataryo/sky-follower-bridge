# Iniziare

Sky Follower Bridge ti aiuta a trovare e seguire le tue connessioni su 𝕏 (Twitter) su Bluesky.

<iframe width="100%" height="315" src="https://www.youtube.com/embed/CnjjfSxm0G0?si=N2OFp15PPiZZezEN" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>


## Installazione

Sky Follower Bridge è disponibile su:

<ul class="install-list">
  <li>
    <img src="/images/icon-chrome.svg" width="20" height="20">
    <a href="https://chrome.google.com/webstore/detail/sky-follower-bridge/behhbpbpmailcnfbjagknjngnfdojpko" target="_blank" rel="noopener noreferrer" class="gtm-link-to-store">Chrome Web Store</a> (Consigliato⭐)
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
    <a href="https://apps.apple.com/us/app/sky-follower-bridge/id6738878242?mt=12" target="_blank" rel="noopener noreferrer" class="gtm-link-to-store">Estensione Web Safari</a> <span>(Grazie a <a href="https://bsky.app/profile/knotbin.xyz">@knotbin.xyz</a> per il contributo!)</span>
  </li>
</ul>

::: tip
Consigliamo di utilizzare la versione del Chrome Web Store poiché è sempre aggiornata. Le versioni di altri store potrebbero essere in ritardo con gli aggiornamenti.
:::

::: warning
Sky Follower Bridge è disponibile solo sui browser desktop. I browser mobili non sono supportati.
:::

## Utilizzo

### 1. Naviga su 𝕏 (Twitter)

Visita una di queste pagine su X:
- La tua pagina dei seguiti: [x.com/following](https://x.com/following)
- La tua pagina degli utenti bloccati: [x.com/settings/blocked/all](https://x.com/settings/blocked/all)
- La pagina dei membri di una lista pubblica: `x.com/i/lists/<list_id>/members`

![following-page](/images/following-page.png)

### 2. Avvia Sky Follower Bridge

Premi `Alt + B` o fai clic sull'icona dell'estensione nella barra degli strumenti del browser.

::: tip
Per gli utenti di Firefox, premere `Alt + B` potrebbe non funzionare. In tal caso, fai clic sull'icona dell'estensione nella barra degli strumenti del browser.

https://support.mozilla.org/en-US/kb/extensions-button
:::

![Open Extension](/images/open-extension.png)

### 3. Accedi a Bluesky

- **Bluesky (OAuth)** (consigliato): Inserisci il tuo handle e clicca su "Sign in with Bluesky" per l'accesso OAuth.
- **App Password**: Passa alla scheda "App Password" e inserisci handle o email, [password app](https://bsky.app/settings/app-passwords) e **Service URL** (predefinito: `https://bsky.social`). Per un PDS self-hosted, inserisci l'URL del tuo PDS nel campo Service URL.

::: tip
Se incontri errori di accesso, consulta la [Guida alla risoluzione dei problemi](/troubleshooting).
:::

![Scheda App Password con Service URL](/images/app-password-service-url.png)

#### PDS self-hosted (v3.1.0+)

Se usi un PDS Bluesky self-hosted (Personal Data Server) invece di bsky.social:

1. Apri l'estensione e passa alla scheda **App Password**.
2. Inserisci handle (o email), password app e in **Service URL** l'URL del tuo PDS (es. `https://your-pds.example.com`).
3. Clicca su Login.

Assicurati che il tuo PDS sia compatibile con l'AT Protocol.

### 4. Avvia la Ricerca

Clicca su "Find Bluesky Users" per iniziare la scansione. L'estensione cercherà profili Bluesky corrispondenti controllando l'API di Bluesky.

![find-bluesky-users](/images/scan-users.png)

### 5. Rivedi i Risultati

Clicca su "View Results" per vedere le potenziali corrispondenze trovate su Bluesky.

![view-results-button](/images/click-results.png)

Questo aprirà la pagina delle opzioni mostrando tutti gli utenti Bluesky rilevati.

![options](/images/options.png)

### 6. Segui gli Utenti

Clicca sul pulsante "Follow" accanto a qualsiasi utente con cui desideri connetterti.

![follow](/images/click-follow-btn.png)

oppure usa il pulsante "Follow All" per seguire tutti gli utenti rilevati contemporaneamente.

![follow-all](/images/follow-all-btn.png)

::: warning
Si noti che il processo di corrispondenza non è perfetto e potrebbe occasionalmente suggerire corrispondenze errate. Verifica sempre il profilo prima di seguire.
:::

Ecco fatto! Goditi la connessione con la tua comunità su Bluesky 🎉 
