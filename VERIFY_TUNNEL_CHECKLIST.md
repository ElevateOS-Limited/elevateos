# Tunnel Stabilization Checklist

Target:
- Tunnel name: `edutech-demo`
- Hostname: `demo.thinkcollegelevel.com`
- Origin: `http://127.0.0.1:3102` (or documented current origin)

## Checks
```bash
systemctl status cloudflared --no-pager -n 80
cloudflared tunnel list
cloudflared tunnel info edutech-demo
```

## DNS sanity
- Ensure hostname resolves to public Cloudflare edge IPs
- Avoid WARP-private `fd10:*` for public route checks

## External probes
```bash
curl -sS https://demo.thinkcollegelevel.com/api/health
curl -I -sS https://demo.thinkcollegelevel.com | head
```

## Persistence
- cloudflared managed by systemd
- reboot and re-check service + external URL
