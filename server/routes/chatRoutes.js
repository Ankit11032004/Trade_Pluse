const express = require("express");
const { Pool } = require("pg");

const router = express.Router();

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "finance_db",
  password: process.env.DB_PASSWORD || "admin1234",
  port: process.env.DB_PORT || 5432,
});

function analyzePortfolio(portfolio) {
  const totalInvestment = portfolio.reduce(
    (sum, item) => sum + Number(item.total_qty) * Number(item.avg_buy_price || 0),
    0
  );

  const currentValue = portfolio.reduce(
    (sum, item) => sum + Number(item.current_value || 0),
    0
  );

  const totalPnL = currentValue - totalInvestment;
  const pnlPercent = totalInvestment > 0 ? ((totalPnL / totalInvestment) * 100).toFixed(2) : "0.00";

  const enriched = portfolio.map((item) => ({
    stock_ticker: item.stock_ticker,
    total_qty: Number(item.total_qty || 0),
    avg_buy_price: Number(item.avg_buy_price || 0),
    current_price: Number(item.current_price || 0),
    current_value: Number(item.current_value || 0),
    pnl: Number(item.pnl || 0),
    market_cap: item.market_cap,
    pe_ratio: item.pe_ratio,
    pb_ratio: item.pb_ratio,
    dividend_yield: item.dividend_yield,
    pros: item.pros,
    cons: item.cons,
  }));

  const best = [...enriched].sort((a, b) => b.pnl - a.pnl)[0];
  const worst = [...enriched].sort((a, b) => a.pnl - b.pnl)[0];

  return {
    totalInvestment,
    currentValue,
    totalPnL,
    pnlPercent,
    holdings: enriched,
    best,
    worst,
  };
}

function generateReply(prompt, analysis) {
  const text = prompt.toLowerCase();

  if (text.includes("highest profit") || text.includes("best stock")) {
    return `Your highest profit stock is ${analysis.best.stock_ticker}. It has a profit of ₹${analysis.best.pnl.toLocaleString()} and current value of ₹${analysis.best.current_value.toLocaleString()}.`;
  }

  if (text.includes("worst") || text.includes("lowest profit")) {
    return `Your worst performing stock is ${analysis.worst.stock_ticker}. It has a gain/loss of ₹${analysis.worst.pnl.toLocaleString()}.`;
  }

  if (text.includes("total portfolio value") || text.includes("portfolio value")) {
    return `Your current portfolio value is ₹${analysis.currentValue.toLocaleString()}. Your total investment is ₹${analysis.totalInvestment.toLocaleString()} and total P&L is ₹${analysis.totalPnL.toLocaleString()} (${analysis.pnlPercent}%).`;
  }

  if (text.includes("diversified")) {
    return `You currently have ${analysis.holdings.length} holdings in your portfolio. Based on the available data, your portfolio is spread across multiple stocks.`;
  }

  if (text.includes("tcs")) {
    const stock = analysis.holdings.find((h) => h.stock_ticker === "TCS");
    if (!stock) return "I could not find TCS in your current portfolio.";
    return `TCS has quantity ${stock.total_qty}, average buy price ₹${stock.avg_buy_price.toLocaleString()}, current price ₹${stock.current_price.toLocaleString()}, and P&L ₹${stock.pnl.toLocaleString()}.`;
  }

  return `Your portfolio has ${analysis.holdings.length} holdings. Total investment is ₹${analysis.totalInvestment.toLocaleString()}, current value is ₹${analysis.currentValue.toLocaleString()}, and overall P&L is ₹${analysis.totalPnL.toLocaleString()} (${analysis.pnlPercent}%).`;
}

router.post("/", async (req, res) => {
  try {
    const { prompt, username } = req.body;

    if (!prompt || !username) {
      return res.status(400).json({ error: "prompt and username are required" });
    }

    const portfolioQuery = `
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
        fd.market_cap,
        fd.pe_ratio,
        fd.pb_ratio,
        fd.dividend_yield,
        sd.pros,
        sd.cons
      FROM holdings h
      LEFT JOIN live_prices lp ON h.stock_ticker = lp.stock_ticker
      LEFT JOIN fundamental_data fd ON h.stock_ticker = fd.stock_ticker
      LEFT JOIN screener_data sd ON h.stock_ticker = sd.stock_ticker
      WHERE h.total_qty > 0
      ORDER BY current_value DESC;
    `;

    const portfolioResult = await pool.query(portfolioQuery, [username]);
    const portfolio = portfolioResult.rows;

    if (!portfolio.length) {
      return res.json({
        text: "You don't have any active holdings in your portfolio yet."
      });
    }

    const analysis = analyzePortfolio(portfolio);
    const reply = generateReply(prompt, analysis);

    return res.json({ text: reply });
  } catch (err) {
    console.error("Chat route error:", err.message);
    return res.status(500).json({ error: "AI service unavailable. Try again later." });
  }
});

module.exports = router;