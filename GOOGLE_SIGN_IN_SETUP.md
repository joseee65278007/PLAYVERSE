# PLAYVERSE Google sign-in and cloud saves

PLAYVERSE currently has browser-local profiles. Google sign-in and cross-device saves need a Firebase project; the existing Google Analytics measurement ID is analytics only and does not authenticate players.

## Setup needed once

1. Open https://console.firebase.google.com/ and create a project named PLAYVERSE.
2. Add a Web app in Project settings. Copy the Firebase web app configuration (apiKey, authDomain, projectId, appId).
3. In Authentication → Sign-in method, enable Google.
4. In Authentication → Settings → Authorized domains, make sure `joseee65278007.github.io` is listed.
5. Create a Cloud Firestore database.
6. Keep the web configuration public (Firebase web configs are identifiers, not server secrets). Never put service-account keys or private credentials in this website.

## Data model

Use `users/{uid}` for the signed-in player's profile, inventory, game progress, and coin balance. The document ID must be the Firebase Authentication UID, never a username or email address. Firestore security rules must require `request.auth.uid == uid` for a player's own record.

For a production economy, coin awards and purchases should be validated by trusted server-side Cloud Functions so browser code cannot mint unlimited coins or buy items for free. The website is static GitHub Pages, so Firebase is the hosted identity and cloud-data service.

## What is needed to finish integration

Provide the Firebase web app config values (apiKey, authDomain, projectId, appId) after the Google provider and Firestore are enabled. Do not share passwords, OAuth client secrets, service-account JSON, or private keys. Then the site can be wired to Google sign-in and Firestore cloud saves.
