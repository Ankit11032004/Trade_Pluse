import React from 'react';

function StatCard({ label, value, borderColor, textColor }) {
  return (
    <div className={`p-6 bg-white shadow-sm rounded-2xl border-b-4 ${borderColor}`}>
      <p className="text-gray-400 text-xs font-bold uppercase">{label}</p>
      <h2 className={`text-3xl font-bold ${textColor}`}>₹{value.toFixed(2)}</h2>
    </div>
  );
}

function StatsCards({ totalInvestment, currentValue, totalPnL }) {
  const cards = [
    {
      label: 'Investment',
      value: totalInvestment,
      borderColor: 'border-blue-500',
      textColor: 'text-gray-800',
    },
    {
      label: 'Current Value',
      value: currentValue,
      borderColor: 'border-purple-500',
      textColor: 'text-gray-800',
    },
    {
      label: 'Overall P&L',
      value: totalPnL,
      borderColor: totalPnL >= 0 ? 'border-green-500' : 'border-red-500',
      textColor: totalPnL >= 0 ? 'text-green-600' : 'text-red-600',
    },
  ];

  return (
    <>
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </>
  );
}

export default StatsCards;