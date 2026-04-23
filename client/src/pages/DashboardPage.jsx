import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatsCards         from '../components/StatsCards';
import AddTransactionForm from '../components/AddTransactionForm';
import PortfolioTable     from '../components/PortfolioTable';
import ResearchModal      from '../components/ResearchModal';
import AllocationChart    from '../components/AllocationChart';
import ChatBot            from '../components/ChatBot';
import Navbar     from '../components/Navbar';
  
import Footer             from '../components/Footer';function DashboardPage() {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    ticker: '',
    qty: '',
    price: '',
    date: new Date().toISOString().split('T')[0],
  });
  

  const getPortfolio = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/portfolio/admin');
      setPortfolio(res.data);
    } catch (err) {
      console.error('Connection failed!', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPortfolio();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/transactions', {
        username: 'admin',
        ticker: formData.ticker,
        type: 'BUY',
        qty: Number(formData.qty),
        price: Number(formData.price),
        date: formData.date,
      });
      alert(`Added ${formData.ticker} to Portfolio!`);
      setFormData({
        ticker: '',
        qty: '',
        price: '',
        date: new Date().toISOString().split('T')[0],
      });
      getPortfolio();
    } catch (err) {
      alert('Error adding transaction.');
    }
  };

  const handleBuy = async (ticker) => {
    const buyQty = window.prompt(`Enter quantity to BUY for ${ticker}:`);
    if (buyQty && Number(buyQty) > 0) {
      const buyPrice = window.prompt(`Enter Buying Price per share:`);
      try {
        await axios.post('http://localhost:5000/api/transactions', {
          username: 'admin',
          ticker,
          type: 'BUY',
          qty: Number(buyQty),
          price: Number(buyPrice),
          date: new Date().toISOString().split('T')[0],
        });
        getPortfolio();
      } catch (err) {
        alert('Buy failed.');
      }
    }
  };

  const handleSell = async (ticker, currentQty) => {
    const sellQty = window.prompt(
      `Enter quantity to SELL for ${ticker} (Owned: ${currentQty}):`
    );
    if (sellQty && Number(sellQty) > 0) {
      if (Number(sellQty) > Number(currentQty)) {
        alert(`You only own ${currentQty} shares. You cannot sell ${sellQty}.`);
        return;
      }
      const sellPrice = window.prompt(`Enter Selling Price:`);
      try {
        await axios.post('http://localhost:5000/api/transactions', {
          username: 'admin',
          ticker,
          type: 'SELL',
          qty: Number(sellQty),
          price: Number(sellPrice),
          date: new Date().toISOString().split('T')[0],
        });
        getPortfolio();
      } catch (err) {
        alert('Sell failed.');
      }
    }
  };

  const handleResearch = (item) => {
    setSelectedStock(item);
    setIsModalOpen(true);
  };

  const totalInvestment = portfolio.reduce(
    (acc, item) => acc + Number(item.total_qty) * Number(item.avg_buy_price || 0),
    0
  );
  const currentValue = portfolio.reduce(
    (acc, item) => acc + Number(item.total_qty) * Number(item.current_price || 0),
    0
  );
  const totalPnL = currentValue - totalInvestment;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-slate-950 font-sans text-slate-200">
      <Navbar getPortfolio={getPortfolio} />
      <div className="max-w-6xl mx-auto">
         <div className="absolute top-0 left-0 -z-10 h-full w-full overflow-hidden">
    <div className="absolute -top-[10%] -left-[10%] h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[120px]" />
    <div className="absolute bottom-[10%] right-[10%] h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[100px]" />
  </div>
<section className="mb-8">
  <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-8 shadow-2xl">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
      <div>
        <p className="text-sm font-medium text-blue-400 mb-2">
          Portfolio Overview
        </p>
        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
          Monitor your investments with confidence
        </h1>
        <p className="mt-3 text-slate-400 max-w-2xl">
          Track holdings, measure portfolio performance, and explore stock insights
          from one clean dashboard.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 min-w-[260px]">
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
          <p className="text-xs text-slate-500 mb-1">Holdings</p>
          <p className="text-2xl font-bold text-white">{portfolio.length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
          <p className="text-xs text-slate-500 mb-1">Status</p>
          <p className="text-2xl font-bold text-emerald-400">Active</p>
        </div>
      </div>
    </div>
  </div>
</section>

        
       

        {/* Stats + Chart row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatsCards
            totalInvestment={totalInvestment}
            currentValue={currentValue}
            totalPnL={totalPnL}
          />
          </div>
          <div className="bg-white p-6 md:grid-cols-8 gap-6 mb-10 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center">
            <h3 className="text-gray-700 font-bold mb-4">Portfolio Diversification</h3>
            <AllocationChart portfolio={portfolio} />
          </div>
        

        {/* Add Transaction Form */}
        <AddTransactionForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
        />

        {/* Portfolio Table */}
        <PortfolioTable
          portfolio={portfolio}
          onBuy={handleBuy}
          onSell={handleSell}
          onResearch={handleResearch}
        />

        {/* Research Modal */}
        <ResearchModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          ticker={selectedStock?.stock_ticker}
          pros={selectedStock?.pros || ''}
          cons={selectedStock?.cons || ''}
        />

        <div className="h-16 bg-gradient-to-b from-white to-black" />
        <Footer />
       
      </div>
       <ChatBot username="admin" />

      
    </div>
  );
}

export default DashboardPage;