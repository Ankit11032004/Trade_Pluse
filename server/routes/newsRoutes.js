const express = require('express');
const router = express.Router();
const pool = require('../db');
const { refreshCompanyNews } = require('../services/finnhubService');

router.get('/:ticker', async (req, res) => {
  try {
    const { ticker } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM company_news
      WHERE stock_ticker = $1
      ORDER BY published_at DESC NULLS LAST, last_updated DESC
      LIMIT 20
      `,
      [ticker]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('News fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

router.get('/summary/:ticker', async (req, res) => {
  try {
    const { ticker } = req.params;

    const result = await pool.query(
      `
      SELECT sentiment
      FROM company_news
      WHERE stock_ticker = $1
      ORDER BY published_at DESC NULLS LAST, last_updated DESC
      LIMIT 10
      `,
      [ticker]
    );

    const rows = result.rows;

    let positive = 0;
    let negative = 0;
    let neutral = 0;

    for (const row of rows) {
      if (row.sentiment === 'positive') positive++;
      else if (row.sentiment === 'negative') negative++;
      else neutral++;
    }

    let verdict = 'Neutral';
    if (positive > negative) verdict = 'Positive';
    if (negative > positive) verdict = 'Negative';

    res.json({
      totalArticles: rows.length,
      positive,
      negative,
      neutral,
      verdict,
    });
  } catch (error) {
    console.error('Summary error:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

router.post('/refresh/:ticker', async (req, res) => {
  try {
    const { ticker } = req.params;
    await refreshCompanyNews(ticker);
    res.json({ success: true, message: 'News refreshed successfully' });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh news' });
  }
});

module.exports = router;