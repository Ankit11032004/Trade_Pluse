import React from 'react';

function AddTransactionForm({ formData, setFormData, onSubmit }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm mb-10 border border-gray-100">
      <h3 className="font-bold mb-4 text-gray-700">Quick Entry</h3>
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
        
        <input
          type="text"
          placeholder="Ticker"
          required
          value={formData.ticker}
          onChange={(e) =>
            setFormData({ ...formData, ticker: e.target.value.toUpperCase() })
          }
          className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="number"
          placeholder="Qty"
          required
          value={formData.qty}
          onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
          className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="number"
          step="0.01"
          placeholder="Price"
          required
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="p-3 border rounded-xl text-gray-500"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200"
        >
          + Add Stock
        </button>

      </form>
    </div>
  );
}

export default AddTransactionForm;