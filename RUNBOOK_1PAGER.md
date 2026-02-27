# RUNBOOK_1PAGER (EduTech)

## Services
- App (main): `edutech-demo` on `127.0.0.1:3000`
- App (alt demo): `edutech-mini` on `127.0.0.1:3001`
- Domains: `appdemo.thinkcollegelevel.com`, `demo.thinkcollegelevel.com`

## Health checks
```bash
curl -sS https://appdemo.thinkcollegelevel.com/api/health | jq .
curl -I -sS https://appdemo.thinkcollegelevel.com | head
curl -I -sS https://demo.thinkcollegelevel.com | head
pm2 status
```

## Deploy (appdemo)
```bash
cd /root/.openclaw/workspace/edutech-demo
npx prisma db push
npx prisma generate
npm run build
pm2 restart edutech-demo --update-env
```

## Rollback (quick)
```bash
cd /root/.openclaw/workspace/edutech-demo
git log --oneline -n 10
git reset --hard <known_good_commit>
npm run build
pm2 restart edutech-demo --update-env
```

## Recovery (503)
```bash
/root/fix-appdemo-503.sh
```

## Tunnel checks (Cloudflare)
```bash
systemctl status cloudflared --no-pager -n 50
cloudflared tunnel list
cloudflared tunnel info edutech-demo
```

Expected route:
- `demo.thinkcollegelevel.com` -> `http://127.0.0.1:3102` (or current configured local origin)

## Secret rotation (minimum)
1. Rotate in provider consoles (OpenAI / Google / Stripe / Cloudflare).
2. Update `.env` values.
3. Restart app:
```bash
pm2 restart edutech-demo --update-env
```
4. Verify health endpoint + login + key feature flow.

## Access boundaries
- No destructive changes without backup/snapshot.
- Commit every production change to git first when possible.
