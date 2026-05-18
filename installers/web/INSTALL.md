# Title Capitalizer for Office on the Web

> **There is no installable executable for Office Add-ins on the
> Web.** The browser version of Office accepts a manifest upload
> directly - that *is* the install mechanism.

## Personal install (any Microsoft account)

1. Sign in at https://www.office.com and open Word, Excel, or
   PowerPoint for the web.
2. Open or create a document.
3. On the **Home** tab, choose **Add-ins** (or **Insert > Add-ins**
   on some tenants). In the dialog, click **More Add-ins**.
4. Switch to the **My Add-ins** tab and choose **Manage My Add-ins
   > Upload My Add-in** in the upper-right corner.
5. Browse to the `manifest.xml` in this archive and click **Upload**.
6. A **Title Capitalizer** group appears on the **Home** tab. The
   add-in stays installed for your account across browsers and
   devices, including iPad.

## Org-wide install (Microsoft 365 admins)

Use Microsoft 365 Admin Center > Settings > Integrated apps > Upload
custom apps. See `installers/ipad/INSTALL.md` for the full procedure.

## Self-hosting the web assets

The manifest in this archive points at
`https://socrtwo.github.io/Title-Capitalizer/` for its task pane and
ribbon commands. If you want to host the web assets yourself:

1. Serve the contents of the `dist/` folder from any HTTPS static host
   (GitHub Pages, Azure Static Web Apps, Cloudflare Pages, etc.).
2. Edit `manifest.xml` and replace
   `https://socrtwo.github.io/Title-Capitalizer` with your own base URL
   throughout.
3. Re-upload the edited manifest.
