; NSIS installer for Title Capitalizer (Windows)
;
; This installer copies manifest.xml into a local catalog folder, then
; registers that folder as a Trusted Add-in Catalog under the current
; user's Office registry hive. After installation, the user opens Word /
; Excel / PowerPoint, goes to Insert > My Add-ins > Shared Folder, and
; selects "Title Capitalizer".
;
; The CATALOG_GUID must match the <Id> in manifest.xml so Office can
; correlate the catalog with the registered add-in.

!define APPNAME "Title Capitalizer"
!define COMPANYNAME "socrtwo"
!define DESCRIPTION "Office Add-in for AP/APA/Chicago/MLA/NYT/Wikipedia/Bluebook/AMA title case"
!define VERSIONMAJOR 1
!define VERSIONMINOR 0
!define VERSIONBUILD 0
!define HELPURL "https://github.com/socrtwo/Title-Capitalizer"

; This GUID is used as the registry key name for the Trusted Catalog. It is
; independent of the add-in's <Id>, but using a stable value keeps repeated
; installations idempotent.
!define CATALOG_GUID "{9b3d2c40-7d8a-4b2e-9b1d-1f6a2c4d8e10}"

!include "MUI2.nsh"
!include "LogicLib.nsh"

Name "${APPNAME}"
OutFile "TitleCapitalizer-Setup.exe"
InstallDir "$LOCALAPPDATA\TitleCapitalizer"
RequestExecutionLevel user
Unicode true

VIProductVersion "${VERSIONMAJOR}.${VERSIONMINOR}.${VERSIONBUILD}.0"
VIAddVersionKey "ProductName" "${APPNAME}"
VIAddVersionKey "CompanyName" "${COMPANYNAME}"
VIAddVersionKey "FileDescription" "${DESCRIPTION}"
VIAddVersionKey "FileVersion" "${VERSIONMAJOR}.${VERSIONMINOR}.${VERSIONBUILD}.0"
VIAddVersionKey "ProductVersion" "${VERSIONMAJOR}.${VERSIONMINOR}.${VERSIONBUILD}.0"

!define MUI_ABORTWARNING
!define MUI_ICON "icon.ico"
!define MUI_UNICON "icon.ico"

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "LICENSE.txt"
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

!insertmacro MUI_LANGUAGE "English"

Section "Install"
    SetOutPath "$INSTDIR\catalog"
    File "manifest.xml"

    SetOutPath "$INSTDIR"
    File "LICENSE.txt"
    File "INSTALL.txt"

    ; Register the catalog folder under the user's Office hive. This works
    ; for every Office version that supports task-pane add-ins (16.0).
    WriteRegStr HKCU "Software\Microsoft\Office\16.0\WEF\TrustedCatalogs\${CATALOG_GUID}" "Id" "${CATALOG_GUID}"
    WriteRegStr HKCU "Software\Microsoft\Office\16.0\WEF\TrustedCatalogs\${CATALOG_GUID}" "Url" "$INSTDIR\catalog"
    WriteRegDWORD HKCU "Software\Microsoft\Office\16.0\WEF\TrustedCatalogs\${CATALOG_GUID}" "Flags" 1
    WriteRegDWORD HKCU "Software\Microsoft\Office\16.0\WEF\TrustedCatalogs\${CATALOG_GUID}" "Type" 2
    WriteRegDWORD HKCU "Software\Microsoft\Office\16.0\WEF\TrustedCatalogs\${CATALOG_GUID}" "ShowInMenu" 1

    ; Standard Add/Remove Programs entry.
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "DisplayName" "${APPNAME}"
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "UninstallString" "$\"$INSTDIR\uninstall.exe$\""
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "DisplayVersion" "${VERSIONMAJOR}.${VERSIONMINOR}.${VERSIONBUILD}"
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "Publisher" "${COMPANYNAME}"
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "URLInfoAbout" "${HELPURL}"
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "DisplayIcon" "$\"$INSTDIR\catalog\manifest.xml$\""
    WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "NoModify" 1
    WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "NoRepair" 1

    WriteUninstaller "$INSTDIR\uninstall.exe"
SectionEnd

Section "Uninstall"
    Delete "$INSTDIR\catalog\manifest.xml"
    RMDir  "$INSTDIR\catalog"
    Delete "$INSTDIR\LICENSE.txt"
    Delete "$INSTDIR\INSTALL.txt"
    Delete "$INSTDIR\uninstall.exe"
    RMDir  "$INSTDIR"

    DeleteRegKey HKCU "Software\Microsoft\Office\16.0\WEF\TrustedCatalogs\${CATALOG_GUID}"
    DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}"
SectionEnd
