const prisma = require('./db');

async function main() {
  const store = await prisma.store.upsert({
    where: { name: 'Demo Store' },
    update: {},
    create: { name: 'Demo Store', expiringSoonDays: 7 }
  });

  const p1 = await prisma.product.upsert({
    where: { barcode: '8901234567890' },
    update: {},
    create: { barcode: '8901234567890', name: 'Milk 1L', unitPrice: 1.5 }
  });

  const p2 = await prisma.product.upsert({
    where: { barcode: '8901234567891' },
    update: {},
    create: { barcode: '8901234567891', name: 'Bread', unitPrice: 0.8 }
  });

  const today = new Date();
  const tomorrow = new Date(Date.now() + 24*60*60*1000);
  const in5Days = new Date(Date.now() + 5*24*60*60*1000);
  const in30Days = new Date(Date.now() + 30*24*60*60*1000);

  await prisma.batch.createMany({ data: [
    { productId: p1.id, storeId: store.id, batchCode: 'M1', expiryDate: in5Days, quantity: 20 },
    { productId: p1.id, storeId: store.id, batchCode: 'M2', expiryDate: in30Days, quantity: 50 },
    { productId: p2.id, storeId: store.id, batchCode: 'B1', expiryDate: tomorrow, quantity: 15 }
  ]});

  console.log('Seed complete. Store id:', store.id);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
