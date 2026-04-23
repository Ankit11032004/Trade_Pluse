require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const chatRoutes = require("./routes/chatRoutes");
const mongoose =require ("mongoose");
const subscribeRoutes = require("./routes/subscribeRoutes.js");
const newsRoutes = require('./routes/newsRoutes');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// 1. Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 2. Initialize Yahoo Finance
let YahooFinance;
try {
    const yfModule = require('yahoo-finance2');
    YahooFinance = yfModule.YahooFinance || yfModule.default?.YahooFinance;
    if (!YahooFinance && typeof yfModule.default === 'function') {
        YahooFinance = yfModule.default;
    }
} catch (e) {
    console.error("❌ Fatal: Could not load yahoo-finance2 module.");
}

if (!YahooFinance) {
    process.exit(1);
}

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
console.log("🚀 Stock Engines: Ready");

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/news', newsRoutes);
app.use("/api/subscribe", subscribeRoutes);
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'finance_db',
  password: process.env.DB_PASSWORD || 'admin1234',
  port: process.env.DB_PORT || 5432,
});

// --- HELPERS ---

async function scrapeScreenerData(ticker) {
    try {
        const cleanTicker = ticker.split('.')[0].toUpperCase();
        const url = `https://www.screener.in/company/${cleanTicker}/`;
        const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' };

        const { data } = await axios.get(url, { headers, timeout: 10000 });
        const $ = cheerio.load(data);

        const prosList = [];
        $("div.pros ul li").each((i, el) => prosList.push($(el).text().trim()));
        const consList = [];
        $("div.cons ul li").each((i, el) => consList.push($(el).text().trim()));

        await pool.query(`
            INSERT INTO screener_data (stock_ticker, pros, cons, last_updated)
            VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
            ON CONFLICT (stock_ticker) DO UPDATE SET pros = EXCLUDED.pros, cons = EXCLUDED.cons, last_updated = CURRENT_TIMESTAMP;
        `, [cleanTicker, prosList.join(", ") || "N/A", consList.join(", ") || "N/A"]);

        console.log(`✅ Research updated for ${cleanTicker}`);
    } catch (err) {
        console.error(`❌ Scraper failed for ${ticker}:`, err.message);
    }
}
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });


async function updateLivePrice(ticker) {
    try {
        const apiTicker = ticker.includes('.') ? ticker : `${ticker}.NS`;
        const quote = await yahooFinance.quote(apiTicker);
        const price = quote.regularMarketPrice;

        await pool.query(`
            INSERT INTO live_prices (stock_ticker, current_price, last_updated)
            VALUES ($1, $2, CURRENT_TIMESTAMP)
            ON CONFLICT (stock_ticker) DO UPDATE SET current_price = EXCLUDED.current_price, last_updated = CURRENT_TIMESTAMP;
        `, [ticker.toUpperCase(), price]);
        
        console.log(`💰 Price Sync: ${ticker} -> ₹${price}`);
    } catch (err) {
        console.error(`❌ Price failed for ${ticker}:`, err.message);
    }
}

app.use("/api/chat", chatRoutes);


app.post('/api/transactions', async (req, res) => {
    const { username, ticker, type, qty, price, date } = req.body;
    try {
        await pool.query(
            "INSERT INTO transactions (user_id, stock_ticker, transaction_type, quantity, price_per_share, transaction_date) VALUES ($1, $2, $3, $4, $5, $6)",
            [username, ticker.toUpperCase(), type.toUpperCase(), qty, price, date]
        );
        // Scrape research ONLY when adding/changing a stock to save bandwidth
        await updateLivePrice(ticker.toUpperCase());
        await scrapeScreenerData(ticker.toUpperCase());
        res.status(201).json({ message: "Success" });
    } catch (err) {
        res.status(500).send(err.message);
    }
});
app.get('/api/history/:ticker', async (req, res) => {
  try {
    const { ticker } = req.params;
    const apiTicker = ticker.includes('.') ? ticker : `${ticker}.NS`;

    // Fetch data for the last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);

    const result = await yahooFinance.historical(apiTicker, {
      period1: startDate,
      period2: endDate,
      interval: '1d', // Daily intervals
    });

    // Format data for Chart.js
    const chartData = result.map(day => ({
      date: day.date.toISOString().split('T')[0],
      price: day.close
    }));

    res.json(chartData);
  } catch (err) {
    console.error("History Error:", err.message);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

app.get('/api/portfolio/:username', async (req, res) => {
  try {
    const query = `
      WITH holdings AS (
        SELECT
          t.stock_ticker,
          SUM(
            CASE
              WHEN t.transaction_type = 'BUY' THEN t.quantity
              WHEN t.transaction_type = 'SELL' THEN -t.quantity
              ELSE 0
            END
          ) AS total_qty,
          SUM(
            CASE
              WHEN t.transaction_type = 'BUY' THEN t.quantity * t.price_per_share
              ELSE 0
            END
          ) AS total_buy_value,
          SUM(
            CASE
              WHEN t.transaction_type = 'BUY' THEN t.quantity
              ELSE 0
            END
          ) AS total_buy_qty
        FROM transactions t
        WHERE t.user_id = $1
        GROUP BY t.stock_ticker
      )
      SELECT
        h.stock_ticker,
        h.total_qty,
        CASE
          WHEN h.total_buy_qty > 0
          THEN ROUND((h.total_buy_value / h.total_buy_qty)::numeric, 2)
          ELSE 0
        END AS avg_buy_price,
        COALESCE(lp.current_price, 0) AS current_price,
        ROUND((h.total_qty * COALESCE(lp.current_price, 0))::numeric, 2) AS current_value,
        ROUND((
          h.total_qty * (
            COALESCE(lp.current_price, 0) -
            CASE
              WHEN h.total_buy_qty > 0 THEN h.total_buy_value / h.total_buy_qty
              ELSE 0
            END
          )
        )::numeric, 2) AS pnl,
        sd.pros,
        sd.cons,
        fd.market_cap,
        fd.pe_ratio,
        fd.pb_ratio,
        fd.dividend_yield
      FROM holdings h
      LEFT JOIN live_prices lp ON h.stock_ticker = lp.stock_ticker
      LEFT JOIN screener_data sd ON h.stock_ticker = sd.stock_ticker
      LEFT JOIN fundamental_data fd ON h.stock_ticker = fd.stock_ticker
      WHERE h.total_qty > 0
      ORDER BY current_value DESC;
    `;

    const result = await pool.query(query, [req.params.username]);
    res.json(result.rows);
  } catch (err) {
    console.error("Portfolio route error:", err.message);
    res.status(500).json({ error: "DB Error" });
  }
});

// --- AUTOMATION ---

async function refreshAllPrices() {
    try {
        const result = await pool.query("SELECT DISTINCT stock_ticker FROM transactions");
        const tickers = result.rows.map(row => row.stock_ticker);
        for (const ticker of tickers) {
            await updateLivePrice(ticker);
        }
    } catch (err) {
        console.error("Refresh Failed:", err.message);
    }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    refreshAllPrices();
    // FIXED: Now refreshes prices every 60 seconds (60000 ms)
    setInterval(refreshAllPrices, 6000000); 
});