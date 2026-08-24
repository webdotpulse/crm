#!/usr/bin/env bash

# ==============================================================================
# PulseWork CRM & Peppol Work Management Suite - Native Installer
# Supported Platforms: Linux (Ubuntu, Debian, CentOS, Fedora, Arch, RHEL), macOS
# ==============================================================================

set -e

# Color codes for rich terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
YELLOW='\1;33m'
BOLD='\033[1m'
NC='\033[0m' # No Color

print_banner() {
    clear || true
    echo -e "${CYAN}${BOLD}"
    echo "  ██████╗ ██╗   ██╗██╗     ███████╗███████╗██╗    ██╗ ██████╗ ██████╗ ██╗  ██╗"
    echo "  ██╔══██╗██║   ██║██║     ██╔════╝██╔════╝██║    ██║██╔═══██╗██╔══██╗██║ ██╔╝"
    echo "  ██████╔╝██║   ██║██║     ███████╗█████╗  ██║ █╗ ██║██║   ██║██████╔╝█████╔╝ "
    echo "  ██╔═══╝ ██║   ██║██║     ╚════██║██╔══╝  ██║███╗██║██║   ██║██╔══██╗██╔═██╗ "
    echo "  ██║     ╚██████╔╝███████╗███████║███████╗╚███╔███╔╝╚██████╔╝██║  ██║██║  ██╗"
    echo "  ╚═╝      ╚═════╝ ╚══════╝╚══════╝╚══════╝ ╚══╝╚══╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝"
    echo -e "${NC}"
    echo -e "${PURPLE}${BOLD}  All-in-One Work Management, CRM, Projects & Peppol E-Invoicing${NC}"
    echo -e "${BLUE}  SandBox Design System • Peppol BIS Billing 3.0 • EN 16931 Standard${NC}"
    echo "  =============================================================================="
    echo ""
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}${BOLD}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}${BOLD}[ERROR]${NC} $1"
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

print_banner

log_info "Initializing PulseWork Work Management installer..."
log_info "Installation directory: $SCRIPT_DIR"
echo ""

# 1. System Requirements Check
echo -e "${BOLD}Step 1: Checking System Prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed!"
    echo -e "Please install Node.js (v18.0.0 or higher) using NodeSource or nvm:"
    echo -e "  ${CYAN}curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -${NC}"
    echo -e "  ${CYAN}sudo apt-get install -y nodejs${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d 'v' -f 2)
NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d '.' -f 1)
log_success "Node.js detected: v$NODE_VERSION"

if [ "$NODE_MAJOR" -lt 18 ]; then
    log_warn "Node.js version v$NODE_VERSION is below recommended v18.0.0. Please consider upgrading."
fi

# Check npm
if ! command -v npm &> /dev/null; then
    log_error "npm is not installed!"
    exit 1
fi
NPM_VERSION=$(npm -v)
log_success "npm package manager detected: v$NPM_VERSION"

# Check Git
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    log_success "Git detected: $GIT_VERSION"
fi

echo ""

# 2. Dependency Installation
echo -e "${BOLD}Step 2: Installing Application Dependencies...${NC}"
log_info "Running 'npm install'..."
npm install --no-audit --prefer-offline

log_success "All dependencies successfully installed!"
echo ""

# 3. Production Build Compilation
echo -e "${BOLD}Step 3: Building Production Optimized Bundle...${NC}"
log_info "Compiling TypeScript and bundling assets with Vite..."
npm run build

log_success "Production bundle built successfully in ./dist/"
echo ""

# 4. Service & Launch Configuration
echo -e "${BOLD}Step 4: Creating Executable Launchers & Helper Scripts...${NC}"

# Create quick start script
cat << 'EOF' > start.sh
#!/usr/bin/env bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ "$1" == "--prod" ] || [ "$1" == "-p" ]; then
    echo "Starting PulseWork in Production Preview mode on port 3000..."
    npx vite preview --host 0.0.0.0 --port 3000
else
    echo "Starting PulseWork in Development mode on http://localhost:5173..."
    npm run dev
fi
EOF
chmod +x start.sh
log_success "Created native launcher script: ./start.sh"

# Native systemd service template
cat << EOF > pulsework.service.example
[Unit]
Description=PulseWork All-in-One CRM & Peppol Suite
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$SCRIPT_DIR
ExecStart=$(which npm) run preview -- --host 0.0.0.0 --port 3000
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=pulsework-crm
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF
log_success "Generated native systemd template: ./pulsework.service.example"

echo ""
echo -e "${GREEN}==============================================================================${NC}"
echo -e "${GREEN}${BOLD}             🎉 PULSEWORK SUITE INSTALLATION COMPLETE! 🎉             ${NC}"
echo -e "${GREEN}==============================================================================${NC}"
echo ""
echo -e "${BOLD}How to run PulseWork natively:${NC}"
echo ""
echo -e "  1. ${CYAN}Development Mode (Instant Hot-Reload):${NC}"
echo -e "     ${BOLD}./start.sh${NC}   (or ${BOLD}npm run dev${NC})"
echo -e "     Access at: ${BLUE}${BOLD}http://localhost:5173/${NC}"
echo ""
echo -e "  2. ${CYAN}Production Native Server:${NC}"
echo -e "     ${BOLD}./start.sh --prod${NC}   (or ${BOLD}npm run preview -- --port 3000${NC})"
echo -e "     Access at: ${BLUE}${BOLD}http://localhost:3000/${NC}"
echo ""
echo -e "  3. ${CYAN}Run as Linux Background Service (systemd):${NC}"
echo -e "     ${BOLD}sudo cp pulsework.service.example /etc/systemd/system/pulsework.service${NC}"
echo -e "     ${BOLD}sudo systemctl daemon-reload && sudo systemctl enable --now pulsework${NC}"
echo ""
echo -e "  4. ${CYAN}Run via PM2 Process Manager:${NC}"
echo -e "     ${BOLD}pm2 start ecosystem.config.cjs${NC}"
echo ""
echo -e "${PURPLE}Refer to ${BOLD}INSTALL.md${NC}${PURPLE} for full Nginx, SSL, PM2, and systemd guides.${NC}"
echo ""
