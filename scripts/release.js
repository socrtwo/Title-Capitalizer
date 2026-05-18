#!/usr/bin/env node
/*
 * release.js - build distributable archives for Windows, Mac, and Web.
 *
 * Office Add-ins are inherently cross-platform: the same manifest.xml +
 * static web assets work in Office on Windows, Mac, the Web, and iPad.
 * What differs between platforms is how a user *sideloads* the add-in
 * (where the manifest goes, which menu installs it). So a "platform
 * release" here is the same payload plus a platform-specific INSTALL.md
 * that walks the user through the right procedure.
 *
 * Output: releases/title-capitalizer-{windows,mac,web}-vX.Y.Z.zip
 */

const fs   = require('fs');
const path = require('path');
const cp   = require('child_process');

const ROOT     = path.resolve(__dirname, '..');
const DIST     = path.join(ROOT, 'dist');
const RELEASES = path.join(ROOT, 'releases');
const PKG      = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const VERSION  = PKG.version;

const PLATFORMS = ['windows', 'mac', 'web'];

const INSTALL_INTRO = `# Title Capitalizer - Installation

Title Capitalizer is an Office Add-in for Word, Excel, and PowerPoint.
It applies title case to your selected text using popular style guides
(AP, APA, Chicago, MLA, NY Times, Wikipedia, Bluebook, AMA).

A single \`manifest.xml\` file works on every platform - what changes is
how you load it. Follow the section below that matches the platform you
are installing on.
`;

const INSTALL_WINDOWS = `${INSTALL_INTRO}

## Installing on Windows (Word, Excel, PowerPoint)

Microsoft 365 on Windows supports sideloading add-ins from a shared
folder. You can use a local folder for personal use.

1. Pick a folder, for example \`C:\\OfficeAddins\\TitleCapitalizer\\\`.
2. Copy \`manifest.xml\` from this archive into that folder.
3. In Windows Explorer, right-click the folder, choose **Properties >
   Sharing > Share...**, and share it with yourself. Note the network
   path Windows assigns (it looks like \`\\\\PCNAME\\OfficeAddins\\TitleCapitalizer\`).
4. Open Word (or Excel/PowerPoint). Go to **File > Options > Trust
   Center > Trust Center Settings > Trusted Add-in Catalogs**.
5. Paste the share path into **Catalog URL**, check **Show in Menu**,
   click **Add catalog**, then **OK**. Restart the Office app.
6. Open the **Insert** tab and choose **My Add-ins > Shared Folder**.
   You should see *Title Capitalizer*. Click **Add**.
7. A new **Title Capitalizer** group appears on the **Home** tab. Click
   **Title Capitalizer** to open the task pane, or use **Quick Style**
   to apply a specific style guide to your selection.

Microsoft documentation:
https://learn.microsoft.com/office/dev/add-ins/testing/create-a-network-shared-folder-catalog-for-task-pane-and-content-add-ins
`;

const INSTALL_MAC = `${INSTALL_INTRO}

## Installing on Mac (Word, Excel, PowerPoint)

Microsoft 365 on Mac sideloads add-ins from a per-app \`wef\` folder.

1. Quit Word, Excel, and PowerPoint.
2. Open Finder. Press **Cmd+Shift+G** and paste the path for the host
   you want, creating the folder if it doesn't exist:
   - Word:        \`~/Library/Containers/com.microsoft.Word/Data/Documents/wef\`
   - Excel:       \`~/Library/Containers/com.microsoft.Excel/Data/Documents/wef\`
   - PowerPoint:  \`~/Library/Containers/com.microsoft.Powerpoint/Data/Documents/wef\`
3. Copy \`manifest.xml\` from this archive into that folder. (Copy it
   into all three for full coverage.)
4. Launch the Office app. Open the **Insert** tab, choose **Add-ins**
   (or **My Add-ins**) and switch to the **Developer Add-ins** group.
   Select *Title Capitalizer*.
5. The **Title Capitalizer** group appears on the **Home** tab.

Microsoft documentation:
https://learn.microsoft.com/office/dev/add-ins/testing/sideload-an-office-add-in-on-mac
`;

const INSTALL_WEB = `${INSTALL_INTRO}

## Installing on Office for the Web (Word, Excel, PowerPoint Online)

The web versions of Office accept a manifest upload directly.

1. Sign in to https://www.office.com and open Word, Excel, or
   PowerPoint for the web.
2. Open or create a document.
3. On the **Home** tab choose **Add-ins** (or **Insert > Add-ins** in
   some tenants). In the dialog, click **More Add-ins**.
4. Switch to the **My Add-ins** tab, choose **Manage My Add-ins** in
   the upper-right, and select **Upload My Add-in**.
5. Browse to the \`manifest.xml\` from this archive and click **Upload**.
6. A new **Title Capitalizer** group appears on the **Home** tab.

Microsoft documentation:
https://learn.microsoft.com/office/dev/add-ins/testing/sideload-office-add-ins-for-testing
`;

const INSTALL_BY_PLATFORM = {
    windows: INSTALL_WINDOWS,
    mac: INSTALL_MAC,
    web: INSTALL_WEB
};

function rmrf(p) {
    if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

function ensureBuild() {
    if (!fs.existsSync(DIST)) {
        console.log('dist/ not found, running build...');
        cp.execSync('node ' + path.join(__dirname, 'build.js'), { stdio: 'inherit' });
    }
}

function makeStagingFor(platform) {
    const dir = path.join(RELEASES, `staging-${platform}`);
    rmrf(dir);
    fs.mkdirSync(dir, { recursive: true });
    // Copy dist contents into staging.
    cp.execSync(`cp -R "${DIST}/." "${dir}/"`);
    // Write platform-specific install guide.
    fs.writeFileSync(path.join(dir, 'INSTALL.md'), INSTALL_BY_PLATFORM[platform]);
    return dir;
}

function makeZip(platform, stagingDir) {
    const zipPath = path.join(RELEASES, `title-capitalizer-${platform}-v${VERSION}.zip`);
    rmrf(zipPath);
    cp.execSync(`cd "${stagingDir}" && zip -rq "${zipPath}" .`, { stdio: 'inherit' });
    return zipPath;
}

function main() {
    ensureBuild();
    fs.mkdirSync(RELEASES, { recursive: true });

    for (const platform of PLATFORMS) {
        const staging = makeStagingFor(platform);
        const zipPath = makeZip(platform, staging);
        rmrf(staging);
        const stat = fs.statSync(zipPath);
        console.log(`built ${path.relative(ROOT, zipPath)} (${(stat.size / 1024).toFixed(1)} KB)`);
    }

    console.log('\nRelease archives ready in releases/.');
}

main();
