// Financial news fetching service using Finnhub API
// Includes caching and fallback handling

const NEWS_CACHE = {};
const CACHE_DURATION = 300000; // 5 minutes

// Finnhub API key (demo - replace with actual key for production)
const FINNHUB_KEY = 'demo';

export async function fetchStockNews(ticker, limit = 10) {
  const cacheKey = `${ticker}_${limit}`;
  
  // Check cache
  if (NEWS_CACHE[cacheKey] && Date.now() - NEWS_CACHE[cacheKey].timestamp < CACHE_DURATION) {
    return NEWS_CACHE[cacheKey].articles;
  }

  try {
    const symbol = ticker.replace('-USD', '');
    const isCrypto = ticker.includes('-USD');
    
    let url;
    if (isCrypto) {
      // Crypto news endpoint
      url = `https://finnhub.io/api/v1/news?category=crypto&token=${FINNHUB_KEY}`;
    } else {
      // Company news endpoint
      const toDate = new Date().toISOString().split('T')[0];
      const fromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      url = `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${fromDate}&to=${toDate}&token=${FINNHUB_KEY}`;
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('News API request failed');
    }

    const data = await response.json();
    const articles = data.slice(0, limit).map(article => ({
      id: article.id || Math.random().toString(36),
      title: article.headline || article.title || 'No title',
      summary: article.summary || article.description || 'No description available',
      source: article.source || 'Unknown',
      url: article.url || '#',
      image: article.image || null,
      publishedAt: article.datetime ? new Date(article.datetime * 1000).toISOString() : new Date().toISOString(),
      ticker: ticker
    }));

    NEWS_CACHE[cacheKey] = { articles, timestamp: Date.now() };
    return articles;
  } catch (error) {
    console.warn(`Failed to fetch news for ${ticker}`, error);
    return generateMockNews(ticker);
  }
}

export async function fetchGeneralMarketNews(limit = 20) {
  const cacheKey = `market_general_${limit}`;
  
  if (NEWS_CACHE[cacheKey] && Date.now() - NEWS_CACHE[cacheKey].timestamp < CACHE_DURATION) {
    return NEWS_CACHE[cacheKey].articles;
  }

  try {
    const url = `https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('News API request failed');
    }

    const data = await response.json();
    const articles = data.slice(0, limit).map(article => ({
      id: article.id || Math.random().toString(36),
      title: article.headline || 'No title',
      summary: article.summary || 'No description available',
      source: article.source || 'Unknown',
      url: article.url || '#',
      image: article.image || null,
      publishedAt: article.datetime ? new Date(article.datetime * 1000).toISOString() : new Date().toISOString()
    }));

    NEWS_CACHE[cacheKey] = { articles, timestamp: Date.now() };
    return articles;
  } catch (error) {
    console.warn('Failed to fetch general market news', error);
    return generateMockNews('MARKET');
  }
}

// Fallback mock news generator
function generateMockNews(ticker) {
  const headlines = [
    `${ticker} Shows Strong Performance in Q4`,
    `Analysts Upgrade ${ticker} Price Target`,
    `${ticker} Announces New Strategic Partnership`,
    `Market Watch: ${ticker} Trading Volume Surges`,
    `${ticker} CEO Discusses Future Growth Plans`,
    `Institutional Investors Increase ${ticker} Holdings`,
    `${ticker} Reports Better Than Expected Earnings`,
    `Technical Analysis: ${ticker} Breaks Key Resistance`
  ];

  return Array.from({ length: 5 }, (_, i) => ({
    id: `mock_${ticker}_${i}`,
    title: headlines[i % headlines.length],
    summary: `Latest developments and market analysis for ${ticker}. Stay informed about price movements and company updates.`,
    source: 'Market News',
    url: '#',
    image: null,
    publishedAt: new Date(Date.now() - i * 3600000).toISOString(),
    ticker: ticker
  }));
}