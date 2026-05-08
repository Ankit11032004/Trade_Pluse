# 📈 TradePulse

> **Professional-grade portfolio intelligence for retail investors** — powered by real-time data, automated research, and AI-driven insights.


![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)
![React](https://img.shields.io/badge/React-18.x-61dafb.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248.svg)

---

## 🧠 What is TradePulse?

TradePulse is a full-stack web application that brings institutional-grade portfolio tools to everyday retail investors. Instead of juggling multiple platforms for prices, research, and analysis, TradePulse consolidates everything into one unified dashboard — for free, using open-source technologies.

**Built for:** The 130M+ demat account holders in India who deserve better than spreadsheets.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📊 **Real-Time Dashboard** | Live P&L and portfolio value, auto-updating without manual refresh |
| 💹 **Live Price Fetcher** | Automatic stock price fetching from Yahoo Finance at regular intervals |
| 🧾 **Trade Logging** | Log BUY/SELL transactions; portfolio metrics recalculate instantly |
| 🔍 **Stock Scraper** | Automatically extracts pros & cons from Screener.in and caches in DB |
| 🤖 **AI Chat Assistant** | Google Gemini-powered chatbot for financial Q&A and investment guidance |
| 🥧 **Allocation Pie Chart** | Interactive donut chart showing portfolio distribution by market value |
| 📉 **Historical Charts** | 30-day price history charts per holding using Yahoo Finance data |
| 📰 **Market News** | Integrated financial news feed |
| 📧 **Email Notifications** | Market update alerts via email subscription |

---

## 🛠️ Technology Stack

### Frontend
- **React.js 18.x** — Component-based UI framework
- **Tailwind CSS 3.x** — Utility-first styling with dark-mode glassmorphism design
- **Recharts / Chart.js** — Allocation charts and historical price visualisations
- **Axios** — HTTP client for backend API communication

### Backend
- **Node.js 18.x LTS** — JavaScript runtime
- **Express.js 4.x** — REST API routing and middleware
- **yahoo-finance2** — Live prices and historical data from Yahoo Finance
- **Cheerio + Axios** — Web scraping for Screener.in fundamental data
- **@google/generative-ai** — Google Gemini SDK for AI chatbot
- **dotenv** — Environment variable management

### Databases
- **PostgreSQL 15** — Transactions, live prices, screener data, fundamental data (ACID-compliant)
- **MongoDB** — User accounts and subscription records (flexible schema)

### External APIs
- **Yahoo Finance** — Real-time and historical stock prices (NSE/BSE)
- **Screener.in** — Indian company fundamentals (pros, cons, ratios)
- **Google Gemini** — Conversational AI for financial guidance

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- PostgreSQL 15
- MongoDB (local or Atlas)
- Google Gemini API key

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/tradepulse.git
cd tradepulse
```

### 2. Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `/server` directory:

```env
# Server
PORT=5000

# PostgreSQL
DB_USER=postgres
DB_HOST=localhost
DB_NAME=finance_db
DB_PASSWORD=your_password
DB_PORT=5432

# MongoDB
MONGO_URI=mongodb://localhost:27017/tradepulse

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Set Up PostgreSQL Database

Run the following SQL to create the required tables:

```sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  stock_ticker VARCHAR(20) NOT NULL,
  transaction_type VARCHAR(10) NOT NULL,
  quantity NUMERIC NOT NULL,
  price_per_share NUMERIC(12,2) NOT NULL,
  transaction_date DATE NOT NULL
);

CREATE TABLE live_prices (
  stock_ticker VARCHAR(20) PRIMARY KEY,
  current_price NUMERIC(12,2),
  last_updated TIMESTAMP
);

CREATE TABLE screener_data (
  stock_ticker VARCHAR(20) PRIMARY KEY,
  pros TEXT,
  cons TEXT,
  last_updated TIMESTAMP
);

CREATE TABLE fundamental_data (
  stock_ticker VARCHAR(20) PRIMARY KEY,
  market_cap NUMERIC,
  pe_ratio NUMERIC(8,2),
  pb_ratio NUMERIC(8,2),
  dividend_yield NUMERIC(8,4)
);
```

### 5. Start the Application

```bash
# Start the backend server
cd server
npm start

# Start the frontend (in a new terminal)
cd client
npm start
```

The app will be available at `http://localhost:3000`.

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/transactions` | Log a new BUY or SELL transaction |
| `GET` | `/api/portfolio/:username` | Fetch full portfolio with live metrics |
| `GET` | `/api/history/:ticker` | Get 30-day price history for a stock |
| `POST` | `/api/chat` | Send a message to the Gemini chatbot |
| `GET` | `/api/news` | Fetch current financial news |
| `POST` | `/api/subscribe` | Subscribe to market update emails |

### Example: Log a Transaction

```bash
POST /api/transactions
Content-Type: application/json

{
  "username": "admin",
  "ticker": "RELIANCE",
  "type": "BUY",
  "qty": 10,
  "price": 2500,
  "date": "2024-01-15"
}
```

### Example: Get Portfolio

```bash
GET /api/portfolio/admin
```

Returns an array of holdings with `stock_ticker`, `total_qty`, `avg_buy_price`, `current_price`, `current_value`, `pnl`, `pros`, `cons`, and financial ratios.

---

## 🗃️ Database Schema

TradePulse uses a **polyglot persistence** strategy:

```
PostgreSQL (Financial Data)          MongoDB (User Data)
┌─────────────────────┐              ┌─────────────────────┐
│   transactions      │              │   users             │
│   live_prices       │              │   subscriptions     │
│   screener_data     │              └─────────────────────┘
│   fundamental_data  │
└─────────────────────┘
```

All four PostgreSQL tables share `stock_ticker` as the common dimension key, forming a star schema for efficient portfolio computation via a single CTE-based SQL query.

---

## 🧪 Testing

Functional validation was performed across all major features:

```
✅ BUY/SELL transaction logging
✅ Oversell protection (blocks invalid sells)
✅ Live price fetching from Yahoo Finance
✅ 30-day historical chart generation
✅ Screener.in research scraping and caching
✅ Weighted average cost P&L calculation
✅ AI chatbot query handling
✅ Portfolio allocation chart rendering
```

### Performance Benchmarks (10-stock portfolio)

| Operation | Response Time |
|---|---|
| Portfolio GET API | < 800ms |
| Price refresh per ticker | ~1.2 seconds |
| Screener.in scrape | ~1.8 seconds |
| Historical data retrieval | ~900ms |
| Gemini chatbot response | 2–4 seconds |
| Dashboard initial load | ~1.1 seconds |

---

## 📁 Project Structure

```
tradepulse/
├── server/
│   ├── app.js                  # Main Express server and route definitions
│   ├── routes/
│   │   ├── chatRoutes.js       # Gemini AI chatbot endpoint
│   │   ├── newsRoutes.js       # Financial news endpoint
│   │   └── subscribeRoutes.js  # Email subscription (MongoDB)
│   └── .env                    # Environment variables (not committed)
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── StatsCards.jsx
│   │   │   ├── AddTransactionForm.jsx
│   │   │   ├── PortfolioTable.jsx
│   │   │   ├── AllocationChart.jsx
│   │   │   ├── ResearchModal.jsx
│   │   │   └── ChatBot.jsx
│   │   └── pages/
│   │       └── DashboardPage.jsx
│   └── public/
│
└── README.md
```

---

## 🔮 Roadmap

- [ ] JWT-based authentication for multi-user support
- [ ] WebSocket real-time price streaming (Socket.io)
- [ ] Technical analysis indicators (RSI, Moving Averages, Bollinger Bands)
- [ ] Brokerage API integration (Zerodha Kite Connect, Angel One)
- [ ] Expanded fundamental analysis (EPS growth, ROE, ROCE, D/E ratio)
- [ ] Modern Portfolio Theory optimisation (Sharpe Ratio, Efficient Frontier)
- [ ] React Native mobile app with push notifications
- [ ] Tax reporting module (STCG/LTCG for Indian equity taxation)
- [ ] Smart price refresh — restricted to NSE trading hours (9:15 AM – 3:30 PM IST)

---

## ⚠️ Disclaimer

TradePulse is a student project built for educational purposes. It does not provide personalised financial advice. All chatbot responses are general in nature and should not be treated as investment recommendations. Always consult a qualified financial advisor before making investment decisions.

---

## 📚 References

- Markowitz, H. (1952). Portfolio Selection. *The Journal of Finance*
- Gao, X., et al. (2017). Real-Time Stock Price Prediction Using Deep Learning. *IEEE Access*
- Zhao, W., et al. (2023). Large Language Models in Finance: A Survey. *arXiv:2311.03264*
- SEBI (2024). Annual Report on Participation in Securities Markets



<div align="center">
  <strong>Built with ❤️ by undergraduate students, for retail investors everywhere.</strong>
  <br/>
  <em>"Professional-grade tools shouldn't require a Bloomberg Terminal subscription."</em>
</div>
