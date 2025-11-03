// db.js — Handles reading and writing of JSON files for products and bills

import fs from "fs";
import path from "path";

// ✅ Define paths for data storage
const dataDir = path.resolve("./data");
const productsFile = path.join(dataDir, "products.json");
const billsFile = path.join(dataDir, "bills.json");

// ✅ Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// ✅ Read JSON data safely
function readJSON(filePath) {
  try {
    if (!fs.existsSync(filePath)) return [];
    const data = fs.readFileSync(filePath, "utf-8");
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return [];
  }
}

// ✅ Write JSON data safely
function writeJSON(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error writing to ${filePath}:`, err);
  }
}

// ✅ Fetch all products
export function getAllProducts() {
  return readJSON(productsFile);
}

// ✅ Find product by barcode
export function getProductByBarcode(barcode) {
  const products = readJSON(productsFile);
  return products.find((p) => p.barcode === barcode);
}

// ✅ Add or update product
export function saveProduct(product) {
  const products = readJSON(productsFile);
  const index = products.findIndex((p) => p.barcode === product.barcode);

  if (index >= 0) {
    products[index] = product; // update existing
  } else {
    products.push(product); // add new
  }

  writeJSON(productsFile, products);
}

// ✅ Fetch all bills
export function getAllBills() {
  return readJSON(billsFile);
}

// ✅ Save new bill
export function saveBill(bill) {
  const bills = readJSON(billsFile);
  bills.push(bill);
  writeJSON(billsFile, bills);
}
