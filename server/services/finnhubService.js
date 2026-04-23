const axios = require('axios');
const pool = require('../db');

function analyzeText(text) {
  const positiveWords = [
    'profit', 'growth', 'beats', 'surge', 'rise', 'strong', 'bullish',
    'upgrade', 'gain', 'record', 'increase', 'outperform', 'expands'
  ];

  const negativeWords = [
    'loss', 'fall', 'drop', 'weak', 'bearish', 'downgrade', 'decline',
    'miss', 'lawsuit', 'cut', 'decrease', 'slump', 'risk'
  ];

  const lower = (text || '').toLowerCase();
  let score = 0;

  for (const word of positiveWords) {
    if (lower.includes(word)) score += 1;
  }

  for (const word of negativeWords) {
    if (lower.includes(word)) score -= 1;
  }

  let sentiment = 'neutral';
  if (score > 0) sentiment = 'positive';
  if (score < 0) sentiment = 'negative';

  return { sentiment, sentimentScore: score };
}

async function fetchFinnhubNews(symbol) {
  const apiKey = process.env.FINNHUB_API_KEY;

  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - 7);

  const fromDate = from.toISOString().split('T')[0];
  const toDate = to.toISOString().split('T')[0];

  const response = await axios.get('https://finnhub.io/api/v1/company-news', {
    params: {
      symbol,
      _from: fromDate,
      to: toDate,
      token: apiKey,
    },
  });

  return response.data || [];
}

async function saveNewsArticles(symbol, articles) {
  for (const article of articles) {
    const headline = article.headline || '';
    const description = article.summary || '';
    const articleUrl = article.url || '';
    const sourceName = article.source || '';
    const publishedAt = article.datetime ? new Date(article.datetime * 1000) : null;

    const { sentiment, sentimentScore } = analyzeText(`${headline} ${description}`);

    await pool.query(
      `
      INSERT INTO company_news (
        stock_ticker, headline, description, article_url, source_name,
        published_at, sentiment, sentiment_score, last_updated
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      ON CONFLICT (article_url)
      DO UPDATE SET
        headline = EXCLUDED.headline,
        description = EXCLUDED.description,
        source_name = EXCLUDED.source_name,
        published_at = EXCLUDED.published_at,
        sentiment = EXCLUDED.sentiment,
        sentiment_score = EXCLUDED.sentiment_score,
        last_updated = NOW()
      `,
      [
        symbol,
        headline,
        description,
        articleUrl,
        sourceName,
        publishedAt,
        sentiment,
        sentimentScore,
      ]
    );
  }
}

async function refreshCompanyNews(symbol) {
  const articles = await fetchFinnhubNews(symbol);
  await saveNewsArticles(symbol, articles);
  return articles;
}

module.exports = {
  fetchFinnhubNews,
  saveNewsArticles,
  refreshCompanyNews,
  analyzeText,
};