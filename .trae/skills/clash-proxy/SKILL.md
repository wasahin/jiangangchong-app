---
name: "clash-proxy"
description: "Auto-detects Clash Verge proxy port and syncs git proxy config. Invoke when user says 'clash verge proxy refreshed', 'check proxy port', or before any git push/pull after VPN/proxy changes."
---

# Clash Verge Proxy Sync

Automatically detects Clash Verge's current listening port and updates git's HTTP/HTTPS proxy settings to match.

## When to Invoke

- User says "clash verge proxy refreshed"
- User says "check proxy port" or "fix proxy"
- Git push/pull fails with connection errors
- Before any git operation after VPN/proxy restart
- User mentions network/Clash Verge issues

## Steps

1. **Detect Clash Verge ports**
   ```powershell
   netstat -ano | findstr LISTENING | findstr "789"
   ```
   - Look for `127.0.0.1:7897` (mixed-port) or `127.0.0.1:7890`
   - The highest port in the 789x range is usually the mixed-port

2. **Check current git proxy**
   ```powershell
   git config --global --get http.proxy
   git config --global --get https.proxy
   ```

3. **Update if changed**
   - If detected port differs from git config, update both:
   ```powershell
   git config --global http.proxy http://127.0.0.1:<PORT>
   git config --global https.proxy http://127.0.0.1:<PORT>
   ```

4. **Verify connectivity**
   ```powershell
   git ls-remote --heads origin main
   ```

5. **Report result**
   - Port found, config updated (or already correct)
   - GitHub connectivity status

## Notes

- Clash Verge default mixed-port is typically 7897
- Git proxy must use `http://` prefix (not `socks5://`)
- Only updates if port actually changed
