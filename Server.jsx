// server.js — Main backend server for Smart Expiry & Billing System

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import {
  getProductByBarcode,
  saveProduct,
  getAllBills,
  saveBill,
  getAllProducts,
} from "./db.js";

const app = express();
const PORT = 5000;

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json());

// ✅ Root Route
app.get("/", (req, res) => {
  res.send("Smart Expiry & Billing System Backend Running ✅");
});

// ✅ Get all products
app.get("/api/products", (req, res) => {
  const products = getAllProducts();
  res.json(products);
});

// ✅ Get product by barcode
app.get("/api/product/:barcode", (req, res) => {
  const barcode = req.params.barcode;
  const product = getProductByBarcode(barcode);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  // Calculate expiry status dynamically
  const today = new Date();
  const expiry = new Date(product.expiry);
  const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

  let status = "Expired";
  if (diffDays > 30) status = "Fresh";
  else if (diffDays > 0) status = "Near Expiry";

  res.json({
    ...product,
    expiryStatus: status,
    daysLeft: diffDays,
  });
});

// ✅ Add or update a product
app.post("/api/product", (req, res) => {
  const product = req.body;

  if (!product.barcode || !product.name || !product.expiry) {
    return res.status(400).json({ message: "Missing required product fields" });
  }

  saveProduct(product);
  res.json({ message: "Product saved successfully" });
});

// ✅ Save a new bill
app.post("/api/bill", (req, res) => {
  const bill = req.body;

  if (!bill || !bill.items || bill.items.length === 0) {
    return res.status(400).json({ message: "Bill is empty or invalid" });
  }

  bill.date = new Date().toISOString();
  saveBill(bill);

  res.json({ message: "Bill saved successfully", bill });
});

// ✅ Get all saved bills
app.get("/api/bills", (req, res) => {
  const bills = getAllBills();
  res.json(bills);
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
