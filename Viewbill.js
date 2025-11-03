import React, { useEffect, useState } from "react";

const ViewBill = () => {
  const [bills, setBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);

  // Fetch saved bills from backend
  useEffect(() => {
    fetch("http://localhost:5000/api/bills")
      .then((res) => res.json())
      .then((data) => setBills(data.reverse())) // Show latest bill first
      .catch((err) => console.error("Error fetching bills:", err));
  }, []);

  // Print selected bill
  const printBill = (bill) => {
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
          <h1>🧾 Smart Mart Billing System</h1>
          <p>Date: ${bill.date}</p>
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
              ${bill.items
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
                <td>₹${bill.total}</td>
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
    <div className="bg-white text-black p-6 rounded-2xl shadow-lg mt-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold text-center mb-4">📂 View Saved Bills</h2>

      {bills.length === 0 ? (
        <p className="text-center text-gray-600">No saved bills found.</p>
      ) : (
        <div className="space-y-4">
          {bills.map((bill, index) => (
            <div
              key={index}
              className="border p-4 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer bg-gray-50"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">🧾 Bill #{bills.length - index}</p>
                  <p className="text-sm text-gray-600">Date: {bill.date}</p>
                  <p className="text-sm text-gray-700">
                    Items: {bill.items.length} | Total: ₹{bill.total}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedBill(bill)}
                    className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
                  >
                    🔍 View
                  </button>
                  <button
                    onClick={() => printBill(bill)}
                    className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700"
                  >
                    🖨️ Print
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedBill && (
        <div className="mt-8 border-t pt-4">
          <h3 className="text-lg font-bold text-center mb-3">🧾 Bill Details</h3>
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
              {selectedBill.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="border p-2">{item.name}</td>
                  <td className="border p-2">{item.barcode}</td>
                  <td className="border p-2">{item.expiryStatus}</td>
                  <td className="border p-2">₹{item.price}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="border p-2 font-bold" colSpan="3">
                  Total
                </td>
                <td className="border p-2 font-bold">₹{selectedBill.total}</td>
              </tr>
            </tfoot>
          </table>

          <div className="text-center mt-4">
            <button
              onClick={() => setSelectedBill(null)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              ❌ Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewBill;
