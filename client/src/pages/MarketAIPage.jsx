import React, { useState } from "react";
import axios from "axios";
import { Search, RefreshCw, TrendingUp, TrendingDown, Minus } from "lucide-react";

const MarketAIPage = () => {
  const [ticker, setTicker] = useState("TCS");
  const [news, setNews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchNews = async () => {
  if (!ticker.trim()) return;

  try {
    setLoading(true);
    setError("");

    const newsRes = await axios.get(
      `http://localhost:5000/api/news/${ticker.trim().toUpperCase()}`
    );

    setNews(newsRes.data || []);
    setSummary(null);
  } catch (err) {
    console.error(err);
    setError("Failed to load news. Please try again.");
    setNews([]);
    setSummary(null);
  } finally {
    setLoading(false);
  }
};
  const refreshNews = async () => {
    if (!ticker.trim()) return;

    try {
      setRefreshing(true);
      setError("");

      await axios.post(`http://localhost:5000/api/news/refresh/${ticker.trim().toUpperCase()}`);
      await fetchNews();
    } catch (err) {
      console.error(err);
      setError("Refresh failed. Please try again.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      fetchNews();
    }
  };

  const getSentimentIcon = (sentiment) => {
    if (sentiment === "positive") return <TrendingUp className="h-4 w-4" />;
    if (sentiment === "negative") return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getSentimentClasses = (sentiment) => {
    if (sentiment === "positive") return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    if (sentiment === "negative") return "bg-rose-500/10 text-rose-400 border-rose-500/20";
    return "bg-slate-500/10 text-slate-300 border-slate-500/20";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">
            Market AI
          </p>
          <h1 className="mt-2 text-4xl font-black text-white">
            Stock News & Market Analysis
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
            Search a company ticker to see the latest news, sentiment analysis,
            and a simple market summary powered by your backend and database.
          </p>
        </div>

        {/* Search Box */}
        <div className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3">
              <Search className="h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                onKeyDown={handleKeyDown}
                placeholder="Enter ticker like TCS, SBIN, INFY"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={fetchNews}
                className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Search
              </button>

              <button
                onClick={refreshNews}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/80 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Summary */}
        {summary && (
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
            <SummaryCard title="Total Articles" value={summary.totalArticles} />
            <SummaryCard title="Positive" value={summary.positive} tone="positive" />
            <SummaryCard title="Negative" value={summary.negative} tone="negative" />
            <SummaryCard title="Verdict" value={summary.verdict} tone={summary.verdict?.toLowerCase()} />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-slate-400">
            Loading latest market news...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* News list */}
            <div className="xl:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl">
              <h2 className="mb-5 text-xl font-bold text-white">Latest News</h2>

              {news.length === 0 ? (
                <p className="text-sm text-slate-400">
                  No news found yet. Search a ticker to load articles.
                </p>
              ) : (
                <div className="space-y-4">
                  {news.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 transition hover:border-blue-500/20"
                    >
                      <div className="mb-3 flex items-start justify-between gap-4">
                        <h3 className="text-base font-semibold text-white">
                          {item.headline}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${getSentimentClasses(
                            item.sentiment
                          )}`}
                        >
                          {getSentimentIcon(item.sentiment)}
                          {item.sentiment || "neutral"}
                        </span>
                      </div>

                      <p className="text-sm leading-7 text-slate-400">
                        {item.summary || "No description available."}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        <span>{item.source_url || "Unknown source"}</span>
                        <span>
                          {item.published_at
                            ? new Date(item.published_at).toLocaleString()
                            : "Unknown date"}
                        </span>
                        {item.article_url && (
                          <a
                            href={item.article_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300"
                          >
                            Read more
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Analysis box */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl">
              <h2 className="mb-5 text-xl font-bold text-white">AI Market Summary</h2>

              {summary ? (
                <div className="space-y-4">
                  <div className="rounded-2xl bg-slate-900/80 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      Verdict
                    </p>
                    <p className="mt-2 text-2xl font-black text-white">
                      {summary.verdict}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <MiniStat label="Bullish" value={summary.positive} />
                    <MiniStat label="Bearish" value={summary.negative} />
                    <MiniStat label="Neutral" value={summary.neutral} />
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                    <p className="text-sm leading-7 text-slate-400">
                      This summary is based on the latest stored news articles for the selected company.
                      You can improve it later with stronger NLP or LLM-based analysis.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400">
                  Search a ticker to see the news sentiment summary here.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SummaryCard = ({ title, value, tone }) => {
  const toneClass =
    tone === "positive"
      ? "text-emerald-400"
      : tone === "negative"
      ? "text-rose-400"
      : "text-white";

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-xl">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{title}</p>
      <p className={`mt-3 text-2xl font-black ${toneClass}`}>{value}</p>
    </div>
  );
};

const MiniStat = ({ label, value }) => (
  <div className="rounded-2xl bg-slate-900/80 p-3 text-center">
    <p className="text-xs text-slate-500">{label}</p>
    <p className="mt-1 text-lg font-bold text-white">{value}</p>
  </div>
);

export default MarketAIPage;