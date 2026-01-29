# ChronoLock ⏳🔒

![Go Version](https://img.shields.io/github/go-mod/go-version/krishanu-ghosh/chronolock)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Platform](https://img.shields.io/badge/platform-linux-lightgrey)

**ChronoLock** is a "paranoid" CLI secret manager designed for high-risk physical environments. It protects sensitive developer secrets (GitHub tokens, AWS keys, Seed phrases) by forcing a physical "human-in-the-loop" authentication process.

It is designed to thwart **malware scrapers** and **shoulder surfers** by ensuring secrets are:
- 🚫 **Never printed to stdout** (Clipboard only).
- 🔒 **Encrypted at rest** (AES-256-GCM).
- ⏱️ **Time-dependent** (Passwords change every minute).
- 🛡️ **Immutable** (Filesystem-level locking via `chattr`).

---

## ⚡ Features

| Feature | Description |
| :--- | :--- |
| **Zero Stdout Leakage** | Secrets move directly from memory to the system clipboard (`xsel`). |
| **Time-Based Auth** | Your password changes dynamically based on the specific minute of the day. |
| **Session Handshake** | Requires a manual "Copy-Paste" handshake to prove a human is present. |
| **Filesystem Locking** | Uses Linux `chattr +i` to prevent deletion or modification—even by `sudo` (without unlocking). |

---

## 🛠 Prerequisites

* **OS**: Linux (Ubuntu/Debian recommended).
* **Dependencies**:
  * `xsel` (Required for clipboard operations).
  * `sudo` (Required for immutable file locking).

```bash
sudo apt update && sudo apt install xsel
```

## Download and Use
* Download the [init_keys.sh](https://github.com/krishanu-ghosh/chronolock/releases/download/v0.0.1/init_keys.sh) file.
* Download the [binary](https://github.com/krishanu-ghosh/chronolock/releases/download/v0.0.1/chronolock)
* execute this block in the same path
```shell
chmod +x ./init_keys.sh
chmod +x ./chronolock.sh
./init_keys.sh
```
* Add your dev secrets in the keys.json file.
* To set up for the first time use sudo. (running without sudo would work too, but the encrypted data will not be locked)
````shell
sudo ./chronolock --setup keys.json
````
* Once the setup is done, run as normal user.
```shell
./chronolock
```



## Installation (Manual)
Clone the repository and build the binary.

```bash
go build -o chronolock cmd/main.go
chmod +x chronolock
chmod +x init_keys.sh
./init_keys.sh
```

## Add Your Secrets
Edit the newly created keys.json with your real secrets:
```
{
  "basePassword": "MyBasePassword",
  "secrets": {
    "GitHub": "ghp_SECRET_TOKEN_HERE",
    "AWS Prod": "AKIA_SECRET_KEY_HERE"
  }
}
```
### Encrypt & Lock
Run the setup command with sudo. This will:
Read your plaintext keys.json.
Encrypt it with AES-256-GCM.
Overwrite keys.json with the encrypted data.
Lock the file using chattr +i (Immutable).
```
sudo ./chronolock --setup keys.json
```
##### Success: Your keys.json is now an unreadable, undeletable vault.

## 🚀 Daily Usage

Run the tool as a normal user (no `sudo` needed for reading):

```bash
./chronolock
```
#### 🔐 Phase 1: The Time-Password

The tool will prompt:

Pass:
You must calculate this mentally using the following format:

[BasePassword][Day][MonthInitial][HHMM]
Components

BasePassword: Defined during setup (e.g., MySecret)

Day: Current day of the month (e.g., 29)
MonthInitial: First letter of the month, lowercase (e.g., January → j)
HHMM: Current 24-hour time (e.g., 5:45 PM → 1745)
Example
BasePassword: MySecret
Date: Jan 29th, 5:45 PM
MySecret29j1745
⏱️ The tool allows a ±1 minute drift window.

#### 🔑 Phase 2: The Session Handshake
If the password is correct:

A random Session Hex (e.g., a1b2c3d4) is generated
It is automatically copied to your clipboard
You will see the prompt:
Secret:

Action
Press Ctrl + V to paste the session hex into the terminal, input the daily secret (day initial + date)

For example for 29 January 2026, Thursday, the secret would be:
[sessionHex+t29+sessionHex]

Press Enter

#### 📋 Phase 3: Selection
A menu appears listing your saved secrets

Type the number corresponding to the secret you want (e.g., 1)

The selected secret is silently copied to your clipboard

Paste it wherever needed.
