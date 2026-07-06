# Chrome Web Store Publishing Guide

This guide details the step-by-step process of submitting **The Reading Room** Chrome Extension to the Google Chrome Web Store. By publishing the extension, your users will be able to install it with a single click directly from the Web Store.

---

## 1. Prerequisites & Developer Registration

Before you can upload your extension, Google requires you to register as a Chrome Web Store developer.

1. Go to the [Chrome Developer Dashboard](https://chrome.google.com/developer/dashboard).
2. Sign in with the Google Account you wish to associate with your developer profile.
3. Accept the Developer Agreement.
4. **Pay the Registration Fee**: Google charges a one-time **$5 USD** fee to verify developer accounts and prevent spam listings.

---

## 2. Packaging the Extension

The build system is already set up to package the extension automatically when your Next.js application builds (or when you run the packager script).

* The packager script bakes your production backend URL (e.g. `https://the-reading-room-qwsz.vercel.app`) into the extension code and packages it with the high-quality assets we generated (`icon-16.png`, `icon-48.png`, and `icon-128.png`).
* The packaged zip file is created at: `public/extension.zip`.

To run the package builder manually:
```bash
node scripts/build-extension-zip.mjs
```

---

## 3. Creating the Store Listing

Once your developer profile is active:

1. In the **Chrome Developer Dashboard**, click the **Add new item** button in the top right.
2. Select and upload the `public/extension.zip` file.
3. Fill out the **Store Listing** fields:
   * **Name**: `Send to Reading Room`
   * **Summary**: `Save web pages and articles directly to your Reading Room workspace, bypassing paywalls and firewalls.`
   * **Description**:
     ```
     The Send to Reading Room extension is the ultimate companion for your Reading Room workspace. 

     Features:
     - Save exactly what is rendered on your active tab directly to your library.
     - Extract clean pre-rendered HTML content, completely bypassing Cloudflare, Vercel firewalls, or paywall blockages.
     - Fast one-click saving directly into your rooms.

     To connect, open your Reading Room dashboard, click the extension icon, and select 'Connect Workspace'.
     ```
   * **Category**: `Productivity`
   * **Language**: `English`

---

## 4. Visual & Brand Assets

You will need to upload promotional graphics to make the listing look professional:

* **Store Icon**: Upload the generated `chrome-extension/icon-128.png` file (128x128 px).
* **Screenshots**: Take 1 to 5 screenshots of the extension popup saving an article (dimensions must be either `1280x800` or `640x400` pixels).
* **Promo Tiles**: Prepare a small promo tile (`440x280` px) which Google uses to feature the extension in search results.

---

## 5. Privacy & Permissions Justification

Chrome Web Store reviewers are very strict about user data permissions. In the **Privacy** tab of your listing:

1. **Single Purpose**: State that the extension's sole purpose is to "Allow users to save the current tab's content directly to their Reading Room workspace."
2. **Permissions Justifications**:
   * `activeTab`: Used to capture the URL and title of the page the user explicitly requests to save.
   * `scripting`: Used to extract the pre-rendered HTML content of the active page to bypass server-side scraping blocks.
   * `storage`: Used to securely cache the workspace URL and capture states.
3. **Data Usage**: Certify that the extension does not sell user data, does not use it for advertising/credit-scoring, and only transmits page HTML to the user's connected workspace endpoint.

---

## 6. Submit for Review

After filling out all details, click **Submit for review**. Review times typically take **1 to 3 business days**. Once approved, your extension will be live in the Chrome Web Store!
