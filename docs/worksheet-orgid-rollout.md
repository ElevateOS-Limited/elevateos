# Worksheet orgId rollout (demo)

## Schema change
- `Worksheet.orgId` was added for tenant scoping groundwork.

## Deploy steps (demo)
1. Apply schema:
   ```bash
   npm run db:push
   ```
2. (Optional) Backfill legacy rows if they must remain queryable:
   ```bash
   DEMO_ORG_ID=org-demo npx ts-node scripts/backfill-worksheet-orgid-demo.ts
   ```

## Notes
- Authoritative org scoping requires org membership to be present in session/user context.
- Until that membership mapping exists, worksheet APIs return `orgScope: "unscoped"` and use user-scoped fallback.
