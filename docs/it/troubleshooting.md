# Guida alla risoluzione dei problemi

## Errori di autenticazione

### Problemi di accesso

**Messaggio di errore:**  
<span class="error-message">Error: Invalid identifier or password</span>

**Lista di controllo:**
1. Inserimento di nome utente e password
   - Controlla eventuali spazi accidentali
   - Se copi e incolli, assicurati che non ci siano caratteri extra

2. Formato del nome utente
   - Formato corretto: `tuo-username.bsky.social`
   - Errore comune: `tuo-username` (manca .bsky.social)

3. Informazioni sulla password
   - Consigliamo vivamente di utilizzare una [App Password](https://bsky.app/settings/app-passwords) invece della tua password normale
   - Formato della password dell'app: `xxxx-xxxx-xxxx-xxxx` (19 caratteri)

::: tip Suggerimenti utili
Non confondere la App Password con il "password name" mostrato nelle impostazioni.
Come creare una nuova App Password:
2. [Vai alla sezione App Passwords](https://bsky.app/settings/app-passwords)
3. Clicca su "Add App Password"
4. Clicca su "Create App Password"
4. Copia la password generata di 19 caratteri
:::

---

### Autenticazione a due fattori richiesta

**Messaggio di errore:**  
<span class="error-message">Error: Two-factor authentication required</span>

**Soluzione:**
1. Controlla la tua email per il codice di autenticazione
2. Inserisci il codice nel campo di input 2FA
3. Prova ad accedere di nuovo

## Errori di limite di velocità

**Messaggio di errore:**  
<span class="error-message">Error: Rate limit error</span>

**Soluzione:**
1. L'API di Bluesky ha i seguenti limiti ([documentazione ufficiale](https://docs.bsky.app/docs/advanced-guides/rate-limits)):
   - Fino a 5.000 punti all'ora (circa 1.666 nuove azioni)
   - Fino a 35.000 punti al giorno
   - Punti per azione:
     - Creazione: 3 punti
     - Aggiornamento: 2 punti
     - Eliminazione: 1 punto
2. Se raggiungi il limite, attendi fino al reset del limite
3. Clicca sul pulsante "Restart" per riprovare

::: warning
La versione pubblicata su Firefox incontra frequentemente errori di limite di velocità. Se incontri un errore, prova su Chrome.
:::

::: tip
La maggior parte degli utenti non raggiungerà questi limiti durante l'uso normale. Tuttavia, fai attenzione quando esegui azioni in massa come seguire molti utenti o mettere mi piace a molti post in breve tempo.
:::

## Errori di pagina

### Pagina non valida

**Messaggio di errore:**  
<span class="error-message">Error: Invalid page. please open the 𝕏 following or blocking or list page.</span>

**Soluzione:**
Usa l'estensione solo su queste pagine di 𝕏 (Twitter):
- Pagina dei seguiti ([x.com/following](https://x.com/following))
- Pagina dei bloccati ([x.com/settings/blocked/all](https://x.com/settings/blocked/all))
- Pagina dei membri della lista (`x.com/i/lists/<list_id>/members`)

o controlla i permessi dell'estensione nella pagina delle estensioni.
I permessi del sito dovrebbero essere come di seguito:

<img src="/images/site_permissions.png" alt="site permissions" width="500"/>

## Problemi di scansione

### Il pulsante View Detected Users non funziona

Per qualche motivo, il pulsante View Detected Users potrebbe non funzionare.

**Soluzione:**
1. Fai clic con il tasto destro sull'icona dell'estensione e seleziona "Opzioni"
2. Verrà visualizzata la pagina dei risultati

<img src="/images/click-option.png" alt="clicca su opzione" width="500"/>

### La scansione si interrompe presto

La scansione si interrompe prima di raggiungere il fondo della pagina

**Soluzione:**
1. Clicca su "Resume Scanning" per continuare
2. La scansione si fermerà automaticamente quando raggiunge il fondo della pagina
3. Puoi cliccare su "Stop Scanning and View Results" in qualsiasi momento

### Nessun utente trovato

Nessun utente Bluesky rilevato dopo la scansione

**Soluzione:**
1. Assicurati di aver effettuato correttamente l'accesso
2. Prova a scansionare di nuovo - alcuni utenti potrebbero non essere rilevati al primo passaggio
3. Controlla se gli utenti di 𝕏 hanno collegato i loro account Bluesky nei loro profili

## Altri problemi

Se incontri errori inaspettati:

1. Ricarica la pagina
2. Prova di nuovo l'operazione
3. Se il problema persiste, puoi:
   - [Creare un problema](https://github.com/kawamataryo/sky-follower-bridge/issues) con:
     - Il messaggio di errore esatto
     - Cosa stavi cercando di fare
     - Il tipo e la versione del tuo browser
     - Eventuali screenshot pertinenti
   - Oppure menzionare [@kawamataryo.bsky.social](https://bsky.app/profile/kawamataryo.bsky.social) su Bluesky 
