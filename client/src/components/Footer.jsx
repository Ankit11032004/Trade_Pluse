import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const handleJoin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/subscribe", { email });
      setMsg(res.data.message || "Subscribed successfully");
      setEmail("");
    } catch (error) {
      setMsg(error.response?.data?.message || "Subscription failed");
    }
  };

  return (
    <footer className="bg-zinc-950 text-zinc-400 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* TOP SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* BRAND */}
          <div>
            <h2 className="text-2xl font-bold text-white">
              Trade<span className="text-indigo-500">Pulse</span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed">
              Next-generation market intelligence. We provide real-time data and AI research to help you trade with confidence.
            </p>
          </div>

          {/* LINKS */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-white font-semibold mb-3">Platform</h3>
              <nav className="flex flex-col gap-2 text-sm">
                <Link to="/" className="hover:text-white transition">Dashboard</Link>
                <a href="https://cerulean-jelly-55e420.netlify.app/" target="_blank">Portfolio</a>
                <Link to="/research" className="hover:text-white transition">AI Research</Link>
              </nav>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-3">Support</h3>
              <nav className="flex flex-col gap-2 text-sm">
                <Link to="/docs" className="hover:text-white transition">Documentation</Link>
                <Link to="/support" className="hover:text-white transition">Help Center</Link>
              </nav>
            </div>
          </div>

          {/* NEWSLETTER */}
          <div>
            <h3 className="text-white font-semibold mb-2">Weekly Pulse</h3>
            <p className="text-sm mb-4">Market insights delivered to your inbox.</p>

            <div className="flex items-center bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent px-3 py-2 text-sm outline-none flex-1"
              />

              <button
                type="button"
                onClick={handleJoin}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 text-sm font-medium transition"
              >
                JOIN
              </button>
            </div>

            {msg && <p className="text-xs mt-2 text-zinc-300">{msg}</p>}
          </div>
        </div>

        {/* DIVIDER */}
        <div className="border-t border-zinc-800 my-8"></div>

        {/* BOTTOM */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-4 text-sm">
            <span className="text-zinc-500">© 2026 TRADEPULSE INC.</span>
            <Link to="/privacy" className="hover:text-white">Privacy</Link>
            <Link to="/terms" className="hover:text-white">Terms</Link>
            <a href="https://github.com/Ankit11032004" className="hover:text-white" target="_blank">Github</a>
          </div>

          <div className="flex items-center gap-2 text-sm text-green-400">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            LIVE MARKET DATA
          </div>
        </div>

        {/* WARNING */}
        <div className="mt-8 bg-red-500/10 border border-red-500/30 text-red-300 text-sm p-4 rounded-lg">
          <strong className="text-white">Market Risk Warning:</strong> Trading involves high risk. This is a student project for educational purposes only. Always consult a financial advisor before investing real capital.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
