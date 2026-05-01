#!/usr/bin/env bash
set -euo pipefail

PACKAGE="@involvex/youtube-music-cli"
GITHUB_REPO="involvex/youtube-music-cli"
BINARY_NAME="youtube-music-cli"

# Detect OS and architecture for direct binary download
OS="$(uname -s)"
ARCH="$(uname -m)"

get_binary_url() {
  local version
  version="$(curl -fsSL "https://api.github.com/repos/${GITHUB_REPO}/releases/latest" \
    | grep '"tag_name"' | sed -E 's/.*"v?([^"]+)".*/\1/')"

  if [ -z "${version}" ]; then
    echo "Could not determine latest release version from GitHub API." >&2
    return 1
  fi

  local asset_name
  case "${OS}" in
    Linux)
      case "${ARCH}" in
        x86_64)  asset_name="${BINARY_NAME}-linux-x64" ;;
        aarch64|arm64) asset_name="${BINARY_NAME}-linux-arm64" ;;
        *) echo "Unsupported architecture: ${ARCH}" >&2; return 1 ;;
      esac
      ;;
    Darwin)
      case "${ARCH}" in
        x86_64)  asset_name="${BINARY_NAME}-macos-x64" ;;
        arm64)   asset_name="${BINARY_NAME}-macos-arm64" ;;
        *) echo "Unsupported architecture: ${ARCH}" >&2; return 1 ;;
      esac
      ;;
    *) echo "Unsupported OS: ${OS}" >&2; return 1 ;;
  esac

  echo "https://github.com/${GITHUB_REPO}/releases/download/v${version}/${asset_name}"
}

install_from_binary() {
  echo "Detecting platform: ${OS} / ${ARCH}"
  local url
  if ! url="$(get_binary_url)"; then
    return 1
  fi

  local install_dir="${HOME}/.local/bin"
  mkdir -p "${install_dir}"
  local dest="${install_dir}/${BINARY_NAME}"

  echo "Downloading ${BINARY_NAME} from ${url}..."
  if curl -fSL "${url}" -o "${dest}"; then
    chmod +x "${dest}"
    echo "Installed to ${dest}"
    if ! echo "${PATH}" | grep -q "${install_dir}"; then
      echo ""
      echo "NOTE: Add ${install_dir} to your PATH:"
      echo "  export PATH=\"\${HOME}/.local/bin:\${PATH}\""
    fi
    return 0
  fi

  return 1
}

# Try direct binary download first (works without npm/bun, suitable for Termux/proot)
if command -v curl >/dev/null 2>&1 && install_from_binary; then
  echo "${BINARY_NAME} installed. Run: ${BINARY_NAME}"
  exit 0
fi

echo "Direct binary download failed or not available for this platform."
echo "Falling back to package manager installation..."

if command -v npm >/dev/null 2>&1; then
  npm install -g "$PACKAGE"
elif command -v bun >/dev/null 2>&1; then
  bun install -g "$PACKAGE"
else
  echo "Error: curl (for direct download) or npm/bun is required to install ${PACKAGE}." >&2
  echo ""
  echo "On Termux/Debian in Android, install curl with:"
  echo "  pkg install curl"
  exit 1
fi

echo "${BINARY_NAME} installed. Run: ${BINARY_NAME}"
