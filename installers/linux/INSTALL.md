# Title Capitalizer on Linux

> **There is no native executable for Office Add-ins on Linux.**
> Microsoft Office does not ship a desktop app for Linux, so the
> add-in is used through **Office on the Web** in any Linux browser
> (Chrome, Chromium, Firefox, Edge). Uploading `manifest.xml` *is* the
> install mechanism, exactly as on Office Online.

## Personal install (any Microsoft account)

1. In your Linux browser, sign in at https://www.office.com and open
   Word, Excel, or PowerPoint for the web.
2. Open or create a document.
3. On the **Home** tab, choose **Add-ins** (or **Insert > Add-ins**).
   In the dialog, click **More Add-ins**.
4. Switch to the **My Add-ins** tab and choose **Manage My Add-ins
   > Upload My Add-in**.
5. Browse to the `manifest.xml` in this archive and click **Upload**.
6. A **Title Capitalizer** group appears on the **Home** tab. It stays
   installed for your account across browsers and devices.

## Org-wide install (Microsoft 365 admins)

Use Microsoft 365 Admin Center > Settings > Integrated apps > Upload
custom apps. See `installers/ipad/INSTALL.md` for the full procedure.

## Self-hosting the web assets

The manifest points at `https://socrtwo.github.io/Title-Capitalizer/`.
To host the `dist/` assets yourself, serve them from any HTTPS static
host and update the base URL throughout `manifest.xml` before uploading.
