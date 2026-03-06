import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const demoOrgId = process.env.DEMO_ORG_ID
  if (!demoOrgId) {
    throw new Error('DEMO_ORG_ID is required for demo backfill.')
  }

  const updated = await prisma.worksheet.updateMany({
    where: { orgId: null },
    data: { orgId: demoOrgId },
  })

  console.log(`Backfilled worksheet orgId rows: ${updated.count}`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
