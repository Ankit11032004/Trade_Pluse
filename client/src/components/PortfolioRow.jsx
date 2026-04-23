import React from 'react';

function PortfolioRow({ item, onBuy, onSell, onResearch }) {
  const avgPrice     = Number(item.avg_buy_price  || 0);
  const currentPrice = Number(item.current_price  || 0);
  const qty          = Number(item.total_qty       || 0);

  const stockPnL    = (currentPrice - avgPrice) * qty;
  const pnlPercent  = avgPrice > 0 ? ((currentPrice - avgPrice) / avgPrice) * 100 : 0;
  const isProfit    = stockPnL >= 0;
  const isShort     = qty < 0;

  return (
    <tr className="hover:bg-blue-50/40 transition">

      {/* Stock Ticker */}
      <td className="p-5 font-bold text-gray-800">
        {item.stock_ticker}
      </td>

      {/* Quantity */}
      <td className={`p-5 text-center font-bold ${isShort ? 'text-red-500' : 'text-gray-600'}`}>
        {qty} {isShort && <span className="text-xs">(Short)</span>}
      </td>

      {/* Avg Buy Price */}
      <td className="p-5 text-center text-gray-600">
        ₹{avgPrice.toFixed(2)}
      </td>

      {/* Current Market Price */}
      <td className="p-5 text-right font-bold text-gray-900">
        {currentPrice ? `₹${currentPrice.toFixed(2)}` : (
          <span className="text-gray-300 animate-pulse">Loading...</span>
        )}
      </td>

      {/* P&L */}
      <td className={`p-5 text-right font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
        <div>₹{stockPnL.toFixed(2)}</div>
        <div className="text-[10px] opacity-70">
          {isProfit ? '▲' : '▼'} {Math.abs(pnlPercent).toFixed(2)}%
        </div>
      </td>

      {/* Research Button */}
      <td className="p-5 text-center">
        <button
          onClick={() => onResearch(item)}
          className="px-4 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-lg hover:bg-indigo-600 hover:text-white transition"
        >
          🔍 Research
        </button>
      </td>

      {/* Buy / Sell Actions */}
      <td className="p-5 text-right">
        <div className="flex justify-end gap-2">
          <button
            onClick={() => onBuy(item.stock_ticker)}
            className="bg-green-100 text-green-700 px-3 py-1 rounded-lg font-bold hover:bg-green-600 hover:text-white transition text-xs"
          >
            Buy
          </button>
          <button
            onClick={() => onSell(item.stock_ticker, qty)}
            className="bg-red-100 text-red-700 px-3 py-1 rounded-lg font-bold hover:bg-red-600 hover:text-white transition text-xs"
          >
            Sell
          </button>
        </div>
      </td>

    </tr>
  );
}

export default PortfolioRow;