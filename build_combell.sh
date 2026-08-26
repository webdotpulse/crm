#!/usr/bin/env bash

# ==============================================================================
# PulseWork CRM - Combell Web Hosting Build & Package Utility
# ==============================================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\1;33m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${CYAN}${BOLD}"
echo "=============================================================================="
echo "      📦 PulseWork - Packaging for Combell Web Hosting Deployment            "
echo "=============================================================================="
echo -e "${NC}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${BLUE}[1/3] Building production assets with Vite...${NC}"
npm run build

echo -e "${BLUE}[2/3] Copying Combell .htaccess & PHP Database Bridge into ./dist/...${NC}"
cp public/.htaccess dist/.htaccess
mkdir -p dist/api
cp -r public/api/* dist/api/
# Ensure clean fresh installation state in package
rm -f dist/api/config.php dist/api/data.sqlite dist/api/data.sqlite-wal dist/api/data.sqlite-shm
echo "{}" > dist/api/store.json

echo -e "${BLUE}[3/3] Creating ready-to-upload ZIP archive: combell_upload.zip...${NC}"
rm -f combell_upload.zip
cd dist
if command -v zip &> /dev/null; then
    zip -r ../combell_upload.zip ./* .htaccess
elif command -v 7z &> /dev/null; then
    7z a ../combell_upload.zip ./* .htaccess
elif command -v python3 &> /dev/null; then
    python3 -c "import shutil; shutil.make_archive('../combell_upload', 'zip', '.')"
fi
cd ..

echo ""
echo -e "${GREEN}${BOLD}✓ Build & Combell Package Complete!${NC}"
echo -e "Archive generated: ${BOLD}$SCRIPT_DIR/combell_upload.zip${NC}"
echo ""
echo -e "${BOLD}How to deploy to Combell:${NC}"
echo -e "  1. Log in to ${CYAN}https://controlpanel.combell.com${NC}"
echo -e "  2. Go to ${BOLD}My Products${NC} ➔ ${BOLD}Web Hosting${NC} ➔ Select your domain"
echo -e "  3. Click ${BOLD}Files${NC} ➔ ${BOLD}Web File Manager${NC} (or connect via FTPS / FileZilla)"
echo -e "  4. Upload and extract ${BOLD}combell_upload.zip${NC} into your website folder (e.g. ${BOLD}/www/${NC} or ${BOLD}/www/subsites/crm.yourdomain.be${NC})"
echo -e "  5. Ensure Free Let's Encrypt SSL is active under ${BOLD}SSL Certificates${NC}."
echo ""
echo -e "Refer to ${BOLD}INSTALL_COMBELL.md${NC} for full screenshots & instructions."
