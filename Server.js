// Import dependencies
import express from "express";
import cors from "cors";
import fs from "fs";

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Route 1: Fetch product details by barcode
app.get("/api/product/:barcode", (req, res) => {
  const { barcode } = req.params;

  try {
    const products = JSON.parse(fs.readFileSync("products.json", "utf-8"));
    const product = products.find((p) => p.barcode === barcode);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Expiry check
    const today = new Date();
    const expiryDate = new Date(product.expiry);
    let expiryStatus = "Fresh";

    const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) expiryStatus = "Expired";
    else if (diffDays <= 30) expiryStatus = "Near Expiry";

    res.json({ ...product, expiryStatus });
  } catch (err) {
    console.error("Error reading products file:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Route 2: Save new bill
app.post("/api/save-bill", (req, res) => {
  const bill = req.body;

  if (!bill || !bill.items || bill.items.length === 0) {
    return res.status(400).json({ message: "Invalid bill data" });
  }

  try {
    const billsFile = "bills.json";
    const bills = fs.existsSync(billsFile)
      ? JSON.parse(fs.readFileSync(billsFile, "utf-8"))
      : [];

    bills.push(bill);
    fs.writeFileSync(billsFile, JSON.stringify(bills, null, 2));

    res.json({ message: "Bill saved successfully" });
  } catch (err) {
    console.error("Error saving bill:", err);
    res.status(500).json({ message: "Failed to save bill" });
  }
});

// ✅ Route 3: Get all saved bills
app.get("/api/bills", (req, res) => {
  try {
    const billsFile = "bills.json";
    const bills = fs.existsSync(billsFile)
      ? JSON.parse(fs.readFileSync(billsFile, "utf-8"))
      : [];
    res.json(bills);
  } catch (err) {
    console.error("Error reading bills:", err);
    res.status(500).json({ message: "Failed to fetch bills" });
  }
});

// ✅ Route 4: Home check
app.get("/", (req, res) => {
  res.send("Smart Expiry & Billing System Backend is running 🚀");
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
