# Guide de dépannage

## Erreurs d'authentification

### Problèmes de connexion

**Message d'erreur :**  
<span class="error-message">Error: Invalid identifier or password</span>

**Liste de contrôle :**
1. Saisie du nom d'utilisateur et du mot de passe
   - Vérifiez les espaces accidentels
   - Si vous copiez et collez, assurez-vous qu'aucun caractère supplémentaire n'est inclus

2. Format du nom d'utilisateur
   - Format correct : `your-username.bsky.social`
   - Erreur courante : `your-username` (manque .bsky.social)

3. Informations sur le mot de passe
   - Nous recommandons fortement d'utiliser un [App Password](https://bsky.app/settings/app-passwords) au lieu de votre mot de passe habituel
   - Format du mot de passe de l'application : `xxxx-xxxx-xxxx-xxxx` (19 caractères)

::: tip Conseils utiles
Ne confondez pas le App Password avec le "password name" affiché dans les paramètres.
Comment créer un nouveau App Password :
2. [Accédez à la section App Passwords](https://bsky.app/settings/app-passwords)
3. Cliquez sur "Add App Password"
4. Cliquez sur "Create App Password"
4. Copiez le mot de passe généré de 19 caractères
:::

---

### Authentification à deux facteurs requise

**Message d'erreur :**  
<span class="error-message">Error: Two-factor authentication required</span>

**Solution :**
1. Vérifiez votre email pour le code d'authentification
2. Entrez le code dans le champ de saisie 2FA
3. Essayez de vous reconnecter

## Erreurs de limite de taux

**Message d'erreur :**  
<span class="error-message">Error: Rate limit error</span>

**Solution :**
1. L'API de Bluesky a les limites suivantes ([documentation officielle](https://docs.bsky.app/docs/advanced-guides/rate-limits)) :
   - Jusqu'à 5 000 points par heure (environ 1 666 nouvelles actions)
   - Jusqu'à 35 000 points par jour
   - Points par action :
     - Création : 3 points
     - Mise à jour : 2 points
     - Suppression : 1 point
2. Si vous atteignez la limite, attendez que la limite se réinitialise
3. Cliquez sur le bouton "Restart" pour réessayer

::: warning
La version publiée sur Firefox rencontre fréquemment des erreurs de limite de taux. Si vous rencontrez une erreur, essayez sur Chrome.
:::

::: tip
La plupart des utilisateurs ne dépasseront pas ces limites lors d'une utilisation normale. Cependant, soyez prudent lorsque vous effectuez des actions en masse comme suivre de nombreux utilisateurs ou aimer de nombreux posts en peu de temps.
:::

## Erreurs de page

### Page invalide

**Message d'erreur :**  
<span class="error-message">Error: Invalid page. please open the 𝕏 following or blocking or list page.</span>

**Solution :**
Utilisez l'extension uniquement sur ces pages 𝕏 (Twitter) :
- Page de suivi ([x.com/following](https://x.com/following))
- Page de blocage ([x.com/settings/blocked/all](https://x.com/settings/blocked/all))
- Page des membres de la liste (`x.com/i/lists/<list_id>/members`)

ou vérifiez les permissions de votre extension sur la page des extensions.
Les permissions du site devraient être comme ci-dessous :

<img src="/images/site_permissions.png" alt="site permissions" width="500"/>

## Problèmes de scan

### Le scan s'arrête trop tôt

Le scan s'arrête avant d'atteindre le bas de la page

**Solution :**
1. Cliquez sur "Resume Scanning" pour continuer
2. Le scan s'arrêtera automatiquement lorsqu'il atteindra le bas de la page
3. Vous pouvez cliquer sur "Stop Scanning and View Results" à tout moment

### Aucun utilisateur trouvé

Aucun utilisateur Bluesky détecté après le scan

**Solution :**
1. Assurez-vous que vous êtes correctement connecté
2. Essayez de scanner à nouveau - certains utilisateurs peuvent ne pas être détectés au premier passage
3. Vérifiez si les utilisateurs de 𝕏 ont lié leurs comptes Bluesky dans leurs profils

## Autres problèmes

Si vous rencontrez des erreurs inattendues :

1. Rechargez la page
2. Essayez à nouveau l'opération
3. Si le problème persiste, vous pouvez :
   - [Créer un problème](https://github.com/kawamataryo/sky-follower-bridge/issues) avec :
     - Le message d'erreur exact
     - Ce que vous essayiez de faire
     - Le type et la version de votre navigateur
     - Toutes captures d'écran pertinentes
   - Ou mentionner [@kawamataryo.bsky.social](https://bsky.app/profile/kawamataryo.bsky.social) sur Bluesky
