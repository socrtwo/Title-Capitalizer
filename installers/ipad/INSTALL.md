# Title Capitalizer on iPad

> **There is no installable executable for Office Add-ins on iPad.**
> Apple's app sandbox does not let third parties drop manifests into
> Office's container. The add-in still works on iPad - it just has to
> reach the device through an account that already trusts it.

You have two supported options:

## Option 1 — Use a Microsoft 365 account that already has the add-in

If you (or your IT admin) have published Title Capitalizer to your
Microsoft 365 tenant via Centralized Deployment (see Option 2), sign
into Word/Excel/PowerPoint on iPad with that same account. The add-in
will appear automatically in **Home > Add-ins** within ~24 hours.

## Option 2 — Deploy via Microsoft 365 Admin Center

Anyone with the **Global Admin** or **Exchange Admin** role on a
Microsoft 365 tenant can deploy this add-in to all users (including
iPad):

1. Sign in to https://admin.microsoft.com.
2. In the left nav, choose **Settings > Integrated apps**.
3. Click **Upload custom apps**.
4. Select **Office Add-in**, then **Upload manifest file (.xml)** and
   choose the `manifest.xml` from this archive.
5. Pick the users / groups who should receive the add-in. iPad users
   in scope will see the add-in automatically.

Reference: https://learn.microsoft.com/microsoft-365/admin/manage/test-and-deploy-microsoft-365-apps

## Option 3 — Per-document sideload (limited)

For one-off use, you can open a document in Office for the Web
(office.com) on a desktop, upload the manifest there (see the web
INSTALL.md), and then continue editing on iPad. The add-in stays
associated with your account, so it will appear in the Add-ins list
on iPad too.
