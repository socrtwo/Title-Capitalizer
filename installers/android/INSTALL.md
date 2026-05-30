# Title Capitalizer on Android

> **There is no standalone executable for Office Add-ins on Android.**
> Add-ins are deployed to your Microsoft 365 account and then appear
> inside the **Office mobile apps** (Word/Excel/PowerPoint for Android),
> or you can use **Office on the Web** in Chrome for Android. Uploading
> `manifest.xml` (Web) or pushing it via the admin center *is* the
> install mechanism.

## Personal install (any Microsoft account)

The simplest path is to upload the add-in once from Office on the Web,
then it follows your account into the Android apps:

1. In Chrome on Android (or any desktop browser), sign in at
   https://www.office.com and open Word, Excel, or PowerPoint for the
   web.
2. On the **Home** tab, choose **Add-ins > More Add-ins**.
3. Switch to **My Add-ins** and choose **Manage My Add-ins
   > Upload My Add-in**.
4. Browse to the `manifest.xml` in this archive and click **Upload**.
5. Open the Word/Excel/PowerPoint **Android app** signed in with the
   same account. The **Title Capitalizer** add-in is available from the
   add-ins menu.

## Org-wide install (Microsoft 365 admins)

For managed deployment to all users' Android apps, use Microsoft 365
Admin Center > Settings > Integrated apps > Upload custom apps. See
`installers/ipad/INSTALL.md` for the full procedure.
