# Troubleshooting Guide

🚨 **WIP** 🚨

## Authentication Errors

### Login Issues

**Error Message:**  
"Error: Invalid identifier or password"

**Checklist:**
1. Username and Password Entry
   - Check for any accidental spaces
   - If copying and pasting, ensure no extra characters were included

2. Username Format
   - Correct format: `your-username.bsky.social`
   - Common mistake: `your-username` (missing .bsky.social)

3. Password Information
   - We strongly recommend using an [App Password](https://bsky.app/settings/app-passwords) instead of your regular password
   - App Password format: `xxxx-xxxx-xxxx-xxxx` (19 characters)
   
::: tip Helpful Tips
Don't confuse the App Password with the "password name" shown in settings.
How to create a new App Password:
2. [Navigate to App Passwords section](https://bsky.app/settings/app-passwords)
3. Click "Add App Password"
4. Click "Create App Password"
4. Copy the generated 19-character password
:::

### Two-Factor Authentication Required

**Error Message:**  
"Error: Two-factor authentication required"

**Solution:**
1. Check your email for the authentication code
2. Enter the code in the 2FA input field
3. Try logging in again

## Rate Limit Errors

**Error Message:**  
"Rate limit Error" message appears
- A "Restart" button is shown

**Solution:**
1. Bluesky API has a limit of 1,600 actions per hour. If you hit the limit, please wait for 1 hour before trying again.
2. Click the "Restart" button to try again

## Page Errors

### Invalid Page

**Error Message:**  
"Error: Invalid page. please open the 𝕏 following or blocking or list page."

**Solution:**
Only use the extension on these X (Twitter) pages:
- Following page (`x.com/<your_handle>/following`)
- Blocking page (`x.com/settings/blocked/all`)
- List members page (`x.com/i/lists/<list_id>/members`)

## Scanning Issues

### Scan Stops Early

**Error Message:**  
Scanning stops before reaching the bottom of the page

**Solution:**
1. Click "Resume Scanning" to continue
2. The scan will automatically stop when it reaches the bottom of the page
3. You can click "Stop Scanning and View Results" at any time

### No Users Found

**Error Message:**  
No Bluesky users detected after scanning

**Solution:**
1. Make sure you're logged in correctly
2. Try scanning again - some users may not be detected on first pass
3. Check if the X users have linked their Bluesky accounts in their profiles

## Other Issues

If you encounter any unexpected errors:

1. Reload the page
2. Try the operation again
3. If the problem persists, you can either:
   - [Create an issue](https://github.com/kawamataryo/sky-follower-bridge/issues) with:
     - The exact error message
     - What you were trying to do
     - Your browser type and version
     - Any relevant screenshots
   - Or mention @kawamataryo.bsky.social on Bluesky
