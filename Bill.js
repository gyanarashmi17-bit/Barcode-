import React, { useState } from "react";

const Bill = ({ scannedItems, onClearBill }) => {
  const [saved, setSaved] = useState(false);

  // Calculate total price
  const total = scannedItems.reduce((sum, item) => sum + (item.price || 0), 0);

  // Save bill to backend
  const saveBill = async () => {
    if (scannedItems.length === 0) return alert("No items to save!");

    const billData = {
      date: new Date().toLocaleString(),
      items: scannedItems,
      total,
    };

    try {
      const response = await fetch("http://localhost:5000/api/save-bill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(billData),
      });

      const data = await response.json();
      console.log(data);
      setSaved(true);
      alert("✅ Bill saved successfully!");
    } catch (err) {
      console.error("Error saving bill:", err);
      alert("❌ Failed to save bill.");
    }
  };

  // Print bill
  const printBill = () => {
    const printWindow = window.open("", "_blank");
    const content = `
      <html>
        <head>
          <title>Smart Mart Billing System</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; color: #007BFF; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            tfoot td { font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>🛒 Smart Mart Billing System</h1>
          <p>Date: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Barcode</th>
                <th>Expiry Status</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              ${scannedItems
                .map(
                  (item) => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.barcode}</td>
                    <td>${item.expiryStatus || "N/A"}</td>
                    <td>₹${item.price || 0}</td>
                  </tr>`
                )
                .join("")}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3">Total</td>
                <td>₹${total}</td>
              </tr>
            </tfoot>
          </table>
          <script>window.print();</script>
        </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
  };

  return (
    <div className="bg-white text-black p-6 rounded-2xl shadow-lg mt-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-center mb-4">🧾 Current Bill</h2>

      {scannedItems.length === 0 ? (
        <p className="text-center text-gray-600">No items added yet.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Product</th>
              <th className="border p-2">Barcode</th>
              <th className="border p-2">Expiry</th>
              <th className="border p-2">Price</th>
            </tr>
          </thead>
          <tbody>
            {scannedItems.map((item, idx) => (
              <tr key={idx}>
                <td className="border p-2">{item.name}</td>
                <td className="border p-2">{item.barcode}</td>
                <td className="border p-2">{item.expiryStatus}</td>
                <td className="border p-2">₹{item.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {scannedItems.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-center gap-3 mt-5">
          <button
            onClick={saveBill}
            className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700"
          >
            💾 Save Bill
          </button>
          <button
            onClick={printBill}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
          >
            🖨️ Print Bill
          </button>
          <button
            onClick={onClearBill}
            className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700"
          >
            ❌ Clear Bill
          </button>
        </div>
      )}

      {saved && (
        <p className="text-center text-green-700 font-semibold mt-3">
          ✅ Bill saved successfully!
        </p>
      )}
    </div>
  );
};

export default Bill;
