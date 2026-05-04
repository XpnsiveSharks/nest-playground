# Phase 1 — Install MongoDB Locally (Ubuntu/Debian)

## Goal
Install MongoDB Community Edition on your local machine, start the service, and verify it is running correctly before touching the NestJS project.

---

## Step 1 — Import the MongoDB Public GPG Key

MongoDB packages are signed. You need to trust the key before APT will accept the packages.

```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | \
  sudo gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg --dearmor
```

> **Why:** Without this, `apt install` will refuse to install packages from the MongoDB repo due to untrusted signature.

---

## Step 2 — Add the MongoDB APT Repository

```bash
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] \
  https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/8.0 multiverse" | \
  sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list
```

> Replace `noble` with your Ubuntu codename if different. Check yours with: `lsb_release -cs`

---

## Step 3 — Update APT Package List

```bash
sudo apt-get update
```

---

## Step 4 — Install MongoDB

```bash
sudo apt-get install -y mongodb-org
```

This installs:
- `mongod` — the MongoDB daemon (server)
- `mongosh` — the MongoDB shell (CLI client)
- `mongodump` / `mongorestore` — backup tools

---

## Step 5 — Start the MongoDB Service

```bash
sudo systemctl start mongod
```

---

## Step 6 — Enable MongoDB on System Boot

```bash
sudo systemctl enable mongod
```

> **Why:** This ensures MongoDB starts automatically after a reboot so you never have to remember to start it manually.

---

## Step 7 — Verify the Service is Running

```bash
sudo systemctl status mongod
```

Expected output (look for these lines):
```
● mongod.service - MongoDB Database Server
     Loaded: loaded (/lib/systemd/system/mongod.service; enabled; ...)
     Active: active (running) since ...
```

If it shows `active (running)` — you're good.

---

## Step 8 — Connect with the Shell to Confirm

```bash
mongosh
```

Once inside the shell, run:
```js
db.runCommand({ connectionStatus: 1 })
```

Expected output:
```json
{
  "authInfo": { "authenticatedUsers": [], "authenticatedUserRoles": [] },
  "ok": 1
}
```

`"ok": 1` confirms the connection is working. Type `exit` to leave the shell.

---

## Step 9 — Check the Default Data Directory

MongoDB stores its data at `/var/lib/mongodb` and its log at `/var/log/mongodb/mongod.log` by default.

```bash
ls /var/lib/mongodb
cat /var/log/mongodb/mongod.log | tail -20
```

No errors in the log = healthy installation.

---

## Useful Commands for Later

| Command | Purpose |
|---|---|
| `sudo systemctl start mongod` | Start the service |
| `sudo systemctl stop mongod` | Stop the service |
| `sudo systemctl restart mongod` | Restart after config changes |
| `sudo systemctl status mongod` | Check if running |
| `mongosh` | Open the MongoDB shell |
| `mongosh --eval "db.adminCommand('listDatabases')"` | List all databases from terminal |

---

## Troubleshooting

**Service fails to start:**
```bash
sudo journalctl -u mongod --no-pager | tail -30
```
This shows the last 30 lines of the service log. Common cause: `/var/lib/mongodb` has wrong permissions.

Fix:
```bash
sudo chown -R mongodb:mongodb /var/lib/mongodb
sudo chmod 755 /var/lib/mongodb
sudo systemctl restart mongod
```

---

## Done Checklist

- [ ] `sudo systemctl status mongod` shows `active (running)`
- [ ] `mongosh` connects without error
- [ ] `db.runCommand({ connectionStatus: 1 })` returns `"ok": 1`

Proceed to **Phase 2** once all three are checked.
