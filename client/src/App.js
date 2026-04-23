import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import MarketAIPage from "./pages/MarketAIPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/research" element={<MarketAIPage />} />
      </Routes>
    </Router>
  );
}

export default App;