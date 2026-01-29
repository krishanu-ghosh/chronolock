# ChronoLock ⏳🔒

**ChronoLock** is a "paranoid" local security utility written in Go. It protects your sensitive developer secrets (GitHub tokens, AWS keys, Seed phrases) by forcing a physical "human-in-the-loop" authentication process.

It is designed to prevent malware scrapers and shoulder surfers by ensuring secrets are:
* **Never printed to the screen** (Clipboard only).
* **Encrypted at rest** (AES-256-GCM).
* **Time-dependent** (Passwords change every minute).
* **Immutable** (The key file is locked at the filesystem level).

---

## ⚡ Features

* **Zero Stdout Leakage**: Secrets move directly from memory to the system clipboard (`xsel`).
* **Time-Based Authentication**: Your password changes dynamically based on the Date and Time.
* **Session Handshake**: Prevents automated scripts from running the tool by requiring a random hex-code "handshake" via the clipboard.
* **Filesystem Locking**: Uses Linux `chattr +i` to make your encrypted store undeletable and uneditable, even by you (without sudo).
* **Multi-Secret Support**: Store multiple keys (Personal, Work, Crypto) and select them from a menu.

---

## 🛠 Prerequisites

* **OS**: Linux (Ubuntu/Debian recommended).
* **Tools**:
    * `xsel` (Required for clipboard operations).
    * `sudo` (Required for immutable file locking).

```bash
sudo apt install xsel
📦 Installation
Clone the repo and build the binary.

Bash
# 1. Build the binary
go build -o chronolock cmd/main.go

# 2. Make it executable
chmod +x chronolock
⚙️ Setup (One-Time)
1. Initialize Configuration
Create the init_keys.sh script to generate your template. This script includes a check to ensure it doesn't overwrite an existing keys.json.

init_keys.sh:

Bash
#!/bin/bash
FILE="keys.json"

if [ ! -f "$FILE" ]; then
  cat <<EOF > "$FILE"
{
  "basePassword": "YOUR_BASE_PASSWORD_HERE",
  "secrets": {
    "Personal GitHub": "ghp_EXAMPLE_TOKEN_12345",
    "Work AWS (Prod)": "AKIA_EXAMPLE_ACCESS_KEY",
    "Crypto Wallet Seed": "apple banana cherry dog elephant...",
    "Server SSH Key": "-----BEGIN OPENSSH PRIVATE KEY-----..."
  }
}
EOF
  echo "Created $FILE."
else
  echo "Error: $FILE already exists. Skipping creation to protect existing data."
fi
Run the initialization:

Bash
chmod +x init_keys.sh
./init_keys.sh
2. Add Your Secrets
Edit the newly created keys.json with your real secrets:

Bash
nano keys.json
3. Encrypt & Lock
Run the setup command with sudo. This will read the plaintext, encrypt it with AES-256-GCM, overwrite the file with encrypted data, and apply the immutable bit.

Bash
sudo ./chronolock --setup keys.json
🚀 Daily Usage
Run the tool as a normal user.

Bash
./chronolock
Phase 1: The Time-Password
The tool will prompt: Pass: Calculate the password mentally using the format: [BasePassword][Day][MonthInitial][HHMM]

Base: Your defined password (e.g., MySecret).

Day: Current Day (e.g., 29).

Month: First letter of month, lowercase (e.g., j for January).

Time: 24-hour format (e.g., 1745).

Example: MySecret29j1745

Phase 2: The Session Handshake
The tool generates a random Hex code and copies it to your clipboard.

Prompt: Secret:

Action: Press Ctrl+V (Paste) then Enter.

Phase 3: Selection
Select the number of the secret from the menu. The secret is silently moved to your clipboard.

🛡️ Administrative Actions
Unlocking / Deleting
To edit or delete the vault, you must remove the filesystem lock:

Bash
# Unlocks the file (removes immutable bit)
sudo ./chronolock --unlock keys.json

# Now you can edit or delete it
rm keys.json
📂 Project Structure
Plaintext
chronolock/
├── chronolock             # Compiled Binary
├── init_keys.sh           # Helper to create config template
├── keys.json              # The Vault (Plaintext first, then Encrypted)
├── cmd/main.go            # Entry point
├── internal/
│   ├── auth/              # Time-password & Session logic
│   ├── clipboard/         # Xsel wrapper
│   ├── config/            # Encryption (AES-GCM) & File I/O
│   └── ui/                # Terminal UI & Menus
└── go.mod
⚠️ Security Disclaimer
This tool is designed for local obfuscation and physical access protection. 
It protects against: Shoulder surfing and automated mass-scrapers. 
It does not protect against: Sophisticated attackers with root access, memory dumpers, or hardware keyloggers.