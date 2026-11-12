# CampusVault — A Minimal Academic PDF Repository

CampusVault is an early-2000s university styled academic PDF repository. It allows students and faculty to browse, search, download, and rate course materials without signing in, while enforcing Google Authentication via Firebase for PDF uploads.

---

## Technical Stack Architecture

- **Frontend UI:** Standard semantic HTML table/fieldset structure, styled in classic 2005-era university web design.
- **Database:** Firebase Cloud Firestore for document metadata (`resources` and `ratings` collections).
- **Authentication:** Firebase Authentication (Google Sign-In).
- **Storage:** Cloudflare R2 / Express PDF gateway.
- **Worker Gateway:** Cloudflare Worker script (`worker.js`).
- **Hosting:** Cloudflare Pages static web app hosting.

---

## Setup & Configuration Guide

### 1. Firebase Setup & Credentials Location
Firebase configurations are maintained in `firebase-applet-config.json`:

```json
{
  "projectId": "<YOUR_PROJECT_ID>",
  "appId": "<YOUR_APP_ID>",
  "apiKey": "<YOUR_API_KEY>",
  "authDomain": "<YOUR_AUTH_DOMAIN>",
  "firestoreDatabaseId": "(default)",
  "storageBucket": "<YOUR_STORAGE_BUCKET>"
}
```

To configure your own custom Firebase Project:
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
2. Enable **Google Authentication** under *Build > Authentication > Sign-in method*.
3. Provision **Cloud Firestore Database** under *Build > Firestore Database*.
4. Deploy the included `firestore.rules` file to restrict unauthorized modifications.

### 2. Firestore Security Rules (`firestore.rules`)
Deploy using Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

### 3. Cloudflare R2 & Worker Deployment
1. Install Cloudflare Wrangler CLI:
   ```bash
   npm install -g wrangler
   ```
2. Authenticate with Cloudflare:
   ```bash
   wrangler login
   ```
3. Create the R2 Storage Bucket:
   ```bash
   wrangler r2 bucket create campusvault-pdf-storage
   ```
4. Deploy the Cloudflare Worker script:
   ```bash
   wrangler deploy
   ```

### 4. Cloudflare Pages Deployment
1. Push your repository to GitHub.
2. In [Cloudflare Dashboard](https://dash.cloudflare.com/), go to **Workers & Pages > Create application > Pages > Connect to Git**.
3. Select your `CampusVault` repository.
4. Set Build Settings:
   - **Framework preset:** None / Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. Click **Save and Deploy**.
6. Add your production Cloudflare Pages URL (e.g. `campusvault.pages.dev`) to Firebase Console > Authentication > Settings > Authorized Domains.

---

## 2005-Era Design Characteristics
- Plain white background (`#ffffff`).
- Simple blue hyperlinks (`#0000ee`).
- Standard rectangular borders and clean HTML tables.
- Arial, Verdana, and Times New Roman typography.
- Standard browser input elements without modern pill styling or animations.
