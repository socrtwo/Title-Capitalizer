#!/bin/bash
# Build a Title Capitalizer .pkg installer for macOS.
#
# Run on macOS (or a macOS GitHub Actions runner). Produces
# TitleCapitalizer-Installer.pkg in $OUT_DIR (default: ./out).
#
# Usage:
#   ./build-pkg.sh /path/to/manifest.xml /path/to/LICENSE [out_dir]

set -euo pipefail

MANIFEST_SRC="${1:?manifest.xml path required}"
LICENSE_SRC="${2:?LICENSE path required}"
OUT_DIR="${3:-./out}"
VERSION="${VERSION:-1.0.0}"

HERE="$(cd "$(dirname "$0")" && pwd)"
WORK="$(mktemp -d)"

mkdir -p "$OUT_DIR"

# 1. Payload root: files we want to put on disk before postinstall runs.
#    We stage the manifest under /Users/Shared so any user can read it
#    from the postinstall script.
ROOT="$WORK/root"
mkdir -p "$ROOT/Users/Shared/TitleCapitalizer"
cp "$MANIFEST_SRC" "$ROOT/Users/Shared/TitleCapitalizer/manifest.xml"

# 2. Scripts folder for the package's postinstall.
SCRIPTS="$WORK/scripts"
mkdir -p "$SCRIPTS"
cp "$HERE/scripts/postinstall" "$SCRIPTS/postinstall"
chmod +x "$SCRIPTS/postinstall"

# 3. Resources for the productbuild distribution UI.
RES="$WORK/resources"
mkdir -p "$RES"
cp "$HERE/welcome.txt"    "$RES/welcome.txt"
cp "$HERE/conclusion.txt" "$RES/conclusion.txt"
cp "$LICENSE_SRC"         "$RES/LICENSE.txt"

# 4. Build the component pkg (raw payload + scripts).
pkgbuild \
    --identifier "com.socrtwo.titlecapitalizer.core" \
    --version "$VERSION" \
    --root "$ROOT" \
    --scripts "$SCRIPTS" \
    --install-location "/" \
    "$WORK/TitleCapitalizer-core.pkg"

# 5. Wrap in a distribution pkg with welcome/license/conclusion UI.
productbuild \
    --distribution "$HERE/distribution.xml" \
    --package-path "$WORK" \
    --resources "$RES" \
    "$OUT_DIR/TitleCapitalizer-Installer.pkg"

echo "Built $OUT_DIR/TitleCapitalizer-Installer.pkg"
