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

## Download and Use (Recommended)
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
  [Read this for Chronolock's password patterns.](#-daily-usage)
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
You must calculate this mentally using the format: [BasePassword][Day][MonthInitial][HHMM]
BasePassword: Defined during setup (e.g., MySecret).  
Day: Current day of the month (e.g., 29).  
MonthInitial: First letter of the month, lowercase (e.g., January → j).  
HHMM: Current 24-hour time (e.g., 5:45 PM → 1745).  
Example:  
Base: MySecret  
Time: Jan 29th, 5:45 PM  
Input: MySecret29j1745  
(⏱️ The tool allows a ±1 minute drift window. And even then, don't you worry being slow as a sloth or you can't mentally figure the pattern out quickly, we got you, the algorithm is realtime.)

#### 🔑 Phase 2: The Session Handshake
If the password is correct, a random Session Hex (e.g., a1b2c3d4) is generated and automatically copied to your clipboard.  
The tool will prompt:  
Secret:
You must authenticate by constructing the "Handshake Sandwich": Format: [SessionHex] + [DayOfWeekInitial][Date] + [SessionHex]  
Action:  
Paste (Ctrl+V) the Session Hex.
Type the Day Code (Day of Week Initial + Date).
Example: Thursday 29th → t29.
Paste (Ctrl+V) the Session Hex again.
Press Enter.  
Example (for Thursday, Jan 29th): If your Hex is a1b2c3d4, you enter: a1b2c3d4 + t29 + a1b2c3d4

#### 📋 Phase 3: Selection
A menu appears listing your saved secrets.  
Type the number corresponding to the secret you want (e.g., 1).  
Result: The selected secret is silently copied to your clipboard.  
Paste it wherever needed.

## What Chronolock Serves
If an attacker knows your Base Password and the Algorithm (Base + Day + Month + Time), they can trivially generate the correct password because time is public knowledge.  
In cryptography, this is known as Security by Obscurity, which is generally considered weak.  
However, in the context of ChronoLock, the threat model is different from a remote server authentication.  
Here is why it is designed this way and where the actual security lies:

#### 1. The Threat Model: "The Wrench" 🔧  
ChronoLock is designed to protect against Malware Scrapers and Casual Snooping, not a cryptographer targeting you specifically.  
Malware: A script running on your PC (e.g., a bad npm package) tries to grab AWS_SECRET from environment variables or config files. It fails because the secret is encrypted. It cannot "guess" to type the password because it doesn't know the format or the base password.  
Snooping: Someone looking at your screen sees you type a password. Ten minutes later, they try to type the same password. It fails.


#### 2. The Real Secret is the "Base Password"  
The time component is not the secret; it is a Salt.  
The Secret: Your BasePassword (e.g., "MySecret").  
The Salt: The Time (e.g., "29j1745").  
Just like in standard TOTP (Google Authenticator), the security relies entirely on the Secret Key (your Base Password). If someone knows your Base Password, the system is broken regardless of the time component.

#### 3. Why add Time then?
If the Base Password is the only real secret, why bother with the time?  
Replay Attack Prevention: If a keylogger records you typing your password at 10:00 AM, that recording is useless at 10:05 AM. The attacker must understand the logic of the password change, not just replay the keystrokes.  
Human-in-the-Loop: It forces you to be conscious. You cannot hardcode this password into a script easily without writing a logic generator, which defeats the purpose of "quick" malware.  

#### Summary
Is it cryptographically stronger than a static password? No.  
Is it operationally annoying for malware? Yes, extremely.  
If you want higher security, you would replace the "Mental Time Algo" with a standard 2FA HMAC-SHA1 (Google Authenticator) logic, where your phone holds the secret key and generates the code.
