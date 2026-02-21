# Node Reconnect Checklist (VPS ↔ Local Ubuntu)

Use this when local node disconnects.

## 1) On VPS (server)

```bash
openclaw gateway status
systemctl --user daemon-reload
systemctl --user restart openclaw-gateway.service
openclaw nodes status --json
```

If you see token mismatch, ensure these match:
- `/root/.openclaw/openclaw.json` → `gateway.auth.token`
- `/root/.config/systemd/user/openclaw-gateway.service.d/token.conf` → `OPENCLAW_GATEWAY_TOKEN`

Then restart gateway again.

---

## 2) On local Ubuntu node

```bash
openclaw update
openclaw config set gateway.auth.mode '"token"'
openclaw config set gateway.auth.token '"<CURRENT_VPS_GATEWAY_TOKEN>"'
openclaw node install --host cloud-8873e6.managed-vps.net --port 443 --tls --force
systemctl --user daemon-reload
systemctl --user restart openclaw-node.service
systemctl --user status openclaw-node.service --no-pager -l
journalctl --user -u openclaw-node.service -n 120 --no-pager
```

---

## 3) Common failures

### A) `device token mismatch`
- Gateway token changed on VPS but local still has old token.
- Re-run step 2 with the latest token.

### B) `Hostname/IP does not match certificate's altnames`
- You are using wrong host (e.g. relay cert mismatch).
- Use `cloud-8873e6.managed-vps.net`.

### C) Approval timed out
- Local node requires exec approval.
- Approve in local OpenClaw dashboard (`openclaw dashboard`) or allowlist needed binaries.

---

## 4) Stable defaults (do not change unless needed)
- Node host: `cloud-8873e6.managed-vps.net`
- Port: `443`
- TLS: `on`
- Local service: `openclaw-node.service` enabled

---

## 5) Quick health check

```bash
# VPS
openclaw nodes status --json

# Expect local node to show:
# "paired": true
# "connected": true
```
