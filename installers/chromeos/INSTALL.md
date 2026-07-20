# Title Capitalizer on ChromeOS

> **There is no native executable for Office Add-ins on ChromeOS.**
> On a Chromebook the add-in runs through **Office on the Web** in
> Chrome. You can also install Office on the Web as a PWA from Chrome.
> Uploading `manifest.xml` *is* the install mechanism.

## Personal install (any Microsoft account)

1. In Chrome on your Chromebook, sign in at https://www.office.com and
   open Word, Excel, or PowerPoint for the web.
   (Optional: use the address-bar install icon to install Office on the
   Web as an app in your launcher.)
2. Open or create a document.
3. On the **Home** tab, choose **Add-ins** (or **Insert > Add-ins**).
   In the dialog, click **More Add-ins**.
4. Switch to the **My Add-ins** tab and choose **Manage My Add-ins
   > Upload My Add-in**.
5. Browse to the `manifest.xml` in this archive and click **Upload**.
6. A **Title Capitalizer** group appears on the **Home** tab. It stays
   installed for your account across browsers and devices.

## Android Office apps on a Chromebook

Chromebooks with Google Play can install the Office Android apps and
use the **Android** package's instructions instead.

## Org-wide install (Microsoft 365 admins)

Use Microsoft 365 Admin Center > Settings > Integrated apps > Upload
custom apps. See `installers/ipad/INSTALL.md` for the full procedure.
