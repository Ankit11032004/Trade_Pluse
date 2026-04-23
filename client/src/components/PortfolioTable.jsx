import React from 'react';
import PortfolioRow from './PortfolioRow';

function PortfolioTable({ portfolio, onBuy, onSell, onResearch }) {
  if (portfolio.length === 0) {
    return (
      <div className="bg-white shadow-sm rounded-2xl border border-gray-100 p-16 text-center">
        <p className="text-4xl mb-4">📭</p>
        <p className="text-gray-500 font-medium">No stocks in your portfolio yet.</p>
        <p className="text-gray-400 text-sm mt-1">Use the Quick Entry form above to add your first stock.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-2xl border border-gray-100 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
          <tr>
            <th className="p-5">Stock</th>
            <th className="p-5 text-center">Quantity</th>
            <th className="p-5 text-center">Avg. Price</th>
            <th className="p-5 text-right">Market Price</th>
            <th className="p-5 text-right">Profit / Loss</th>
            <th className="p-5 text-center">Research</th>
            <th className="p-5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {portfolio.map((item, index) => (
            <PortfolioRow
              key={item.stock_ticker || index}
              item={item}
              onBuy={onBuy}
              onSell={onSell}
              onResearch={onResearch}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PortfolioTable;