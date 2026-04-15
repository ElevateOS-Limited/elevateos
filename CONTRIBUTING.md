# Contributing to ElevateOS

## Setup

```bash
git clone git@github-elevateos:ElevateOS-Limited/ElevateOS.git
npm install
cp .env.example .env.local   # fill in required values
npx prisma generate
npx prisma db push
npm run dev
```

## Branching

- Branch from main
- Naming: eat/<scope>/<short-desc>, ix/<scope>/<short-desc>, chore/<desc>
- Open PRs targeting main

## Standards

- TypeScript strict mode — no ny without a justification comment
- Run before pushing: 
pm run lint && npm run typecheck && npm run build
- New business logic requires tests
- No direct DB queries outside lib/db or Prisma models

## Commit format

```
feat(auth): add magic link email flow
fix(stripe): resolve webhook signature verification on retry
chore(deps): bump prisma to 5.x
```

## PR checklist

- [ ] Lint and typecheck pass
- [ ] Build succeeds
- [ ] No console.log left in production code
- [ ] Environment variables documented in .env.example
"@

 = @"
# Contributing to CrystalCentury

This repo contains custom WordPress/WooCommerce code for crystalcentury.com.

## Setup

Requires a local WordPress environment. See .env.example for required constants.

## Standards

- PHP 8.1+ compatible
- Follow [WordPress Coding Standards](https://developer.wordpress.org/coding-standards/wordpress-coding-standards/)
- No direct $wpdb queries — use WP_Query and WP abstractions
- Prefix all custom functions and hooks with cc_
- Test changes on staging before pushing to main

## Branching

- eat/<description> for new functionality
- ix/<description> for bug fixes
- hotfix/<description> for urgent production fixes

## Commit format

```
feat(shop): add custom order confirmation email template
fix(cart): resolve quantity update on mobile
hotfix(checkout): patch payment gateway redirect loop
```