const express = require('express');
const prisma = require('./db');
const { startOfDay, differenceInCalendarDays } = require('date-fns');
const router = express.Router();

router.get('/health', (req, res) => res.json({ ok: true }));

router.post('/stores', async (req, res) => {
  const { name, expiringSoonDays } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const store = await prisma.store.create({ data: { name, expiringSoonDays: expiringSoonDays ?? 7 } });
  res.json(store);
});

router.post('/products', async (req, res) => {
  const { barcode, name, unitPrice } = req.body;
  if (!barcode || !name) return res.status(400).json({ error: 'barcode and name required' });
  const product = await prisma.product.create({ data: { barcode, name, unitPrice: unitPrice ?? 0 } });
  res.json(product);
});

router.post('/batches', async (req, res) => {
  const { productId, storeId, batchCode, manufacturedDate, expiryDate, quantity } = req.body;
  if (!productId || !storeId || !expiryDate) return res.status(400).json({ error: 'productId, storeId, expiryDate required' });
  const batch = await prisma.batch.create({
    data: {
      productId,
      storeId,
      batchCode,
      manufacturedDate: manufacturedDate ? new Date(manufacturedDate) : null,
      expiryDate: new Date(expiryDate),
      quantity: quantity ?? 0
    }
  });
  res.json(batch);
});

router.get('/products/by-barcode/:barcode', async (req, res) => {
  const { barcode } = req.params;
  const { storeId } = req.query;
  const product = await prisma.product.findUnique({ where: { barcode } });
  if (!product) return res.status(404).json({ error: 'Not found' });

  let batches = [];
  if (storeId) {
    batches = await prisma.batch.findMany({
      where: { productId: product.id, storeId, quantity: { gt: 0 } },
      orderBy: { expiryDate: 'asc' }
    });

    const store = await prisma.store.findUnique({ where: { id: storeId } });
    const threshold = store ? store.expiringSoonDays : 7;
    const today = startOfDay(new Date());
    batches = batches.map(b => {
      const daysLeft = differenceInCalendarDays(startOfDay(b.expiryDate), today);
      const status = daysLeft < 0 ? 'EXPIRED' : daysLeft === 0 ? 'EXPIRES_TODAY' : (daysLeft <= threshold ? 'EXPIRING_SOON' : 'FRESH');
      return { ...b, daysLeft, status };
    });
  }

  res.json({ product, batches });
});

router.get('/batches', async (req, res) => {
  const { productId, storeId } = req.query;
  if (!productId || !storeId) return res.status(400).json({ error: 'productId & storeId required' });
  const store = await prisma.store.findUnique({ where: { id: storeId } });
  const threshold = store ? store.expiringSoonDays : 7;
  const today = startOfDay(new Date());

  let batches = await prisma.batch.findMany({ where: { productId, storeId, quantity: { gt: 0 } }, orderBy: { expiryDate: 'asc' } });
  batches = batches.map(b => {
    const daysLeft = differenceInCalendarDays(startOfDay(b.expiryDate), today);
    const status = daysLeft < 0 ? 'EXPIRED' : daysLeft === 0 ? 'EXPIRES_TODAY' : (daysLeft <= threshold ? 'EXPIRING_SOON' : 'FRESH');
    return { ...b, daysLeft, status };
  });

  res.json(batches);
});

module.exports = router;
