import { base44 } from '@/api/base44Client';
import NotificationSystem from '@/components/notifications/NotificationSystem';

const SECTORS = ['Tech', 'Energy', 'Finance', 'Healthcare', 'Crypto', 'Retail', 'Auto', 'Entertainment'];

// Expanded event library with more variety
const COMPANY_EVENTS = [
  { ticker: 'AAPL', event: 'iPhone sales beat estimates', change: 8, duration: 12 },
  { ticker: 'AAPL', event: 'Production delays reported', change: -6, duration: 8 },
  { ticker: 'TSLA', event: 'Record deliveries announced', change: 12, duration: 10 },
  { ticker: 'TSLA', event: 'CEO controversy sparks selloff', change: -9, duration: 6 },
  { ticker: 'NVDA', event: 'New AI chip unveiled', change: 15, duration: 14 },
  { ticker: 'NVDA', event: 'Export restrictions imposed', change: -11, duration: 20 },
  { ticker: 'AMZN', event: 'AWS growth accelerates', change: 10, duration: 16 },
  { ticker: 'GOOGL', event: 'Antitrust lawsuit filed', change: -7, duration: 24 },
  { ticker: 'META', event: 'User growth exceeds forecasts', change: 11, duration: 12 },
  { ticker: 'JPM', event: 'Earnings crush expectations', change: 9, duration: 8 },
  { ticker: 'BTC-USD', event: 'Institutional adoption surge', change: 18, duration: 48 },
  { ticker: 'BTC-USD', event: 'Exchange hack concerns', change: -22, duration: 12 },
  { ticker: 'ETH-USD', event: 'Network upgrade successful', change: 14, duration: 20 },
  { ticker: 'NFLX', event: 'Subscriber growth slows', change: -8, duration: 10 },
  { ticker: 'DIS', event: 'Blockbuster movie release', change: 7, duration: 8 },
];

const POLITICAL_EVENTS = [
  { name: 'Trade Deal Signed', sector: 'Broad Market', change: 5, duration: 36, message: '🤝 Major trade agreement boosts market confidence' },
  { name: 'Tariff Announcement', sector: 'Broad Market', change: -6, duration: 24, message: '🚨 New tariffs trigger market selloff' },
  { name: 'Fed Rate Hike', sector: 'Finance', change: -4, duration: 48, message: '📊 Federal Reserve raises rates, financial sector adjusts' },
  { name: 'Infrastructure Bill', sector: 'Broad Market', change: 7, duration: 72, message: '🏗️ Massive infrastructure spending approved' },
  { name: 'Tax Reform', sector: 'Broad Market', change: -3, duration: 48, message: '💼 Tax policy changes create market uncertainty' },
  { name: 'Tech Regulation', sector: 'Tech', change: -8, duration: 36, message: '⚖️ New tech regulations announced' },
  { name: 'Green Energy Subsidy', sector: 'Energy', change: 12, duration: 60, message: '♻️ Renewable energy incentives approved' },
  { name: 'Healthcare Reform', sector: 'Healthcare', change: -5, duration: 40, message: '🏥 Healthcare policy changes proposed' },
  { name: 'Crypto Clarity', sector: 'Crypto', change: 15, duration: 48, message: '📜 Clear crypto regulations bring stability' },
];

const ECONOMIC_EVENTS = [
  { name: 'GDP Growth Surprise', sector: 'Broad Market', change: 4, duration: 24, message: '📈 GDP exceeds expectations, optimism rises' },
  { name: 'Inflation Spike', sector: 'Broad Market', change: -5, duration: 48, message: '💸 Inflation data shocks markets' },
  { name: 'Unemployment Drop', sector: 'Broad Market', change: 3, duration: 20, message: '👔 Job market strengthens, economy robust' },
  { name: 'Consumer Confidence Surge', sector: 'Retail', change: 8, duration: 30, message: '🛍️ Consumer spending accelerates' },
  { name: 'Recession Fears', sector: 'Broad Market', change: -10, duration: 60, message: '⚠️ Recession indicators flash warning' },
  { name: 'Currency Devaluation', sector: 'Crypto', change: 12, duration: 36, message: '💱 Fiat weakness drives crypto demand' },
];

const TECHNICAL_EVENTS = [
  { name: 'Golden Cross SPY', sector: 'Broad Market', change: 6, duration: 48, message: '📊 Major bullish technical signal triggered' },
  { name: 'Death Cross Detected', sector: 'Broad Market', change: -7, duration: 36, message: '💀 Bearish technical pattern emerges' },
  { name: 'Oversold Bounce', sector: 'Broad Market', change: 8, duration: 12, message: '📈 RSI oversold, strong bounce expected' },
  { name: 'Resistance Breakthrough', sector: 'Tech', change: 9, duration: 20, message: '🚀 Key resistance level broken, momentum builds' },
];

// Generate dynamic market events with AI
export async function generateDynamicMarketEvent() {
  try {
    const prompt = `Generate a realistic market event for a stock trading game.
    
Event should include:
- Type: economic, political, company_specific, crypto_regulatory, or technical
- Sector or specific ticker affected
- Price impact percentage (-30% to +30%)
- Duration in hours (4-72)
- Engaging headline message
- Current sentiment shift

Make it creative, dramatic, and realistic. Examples: earnings surprises, product launches, scandals, breakthroughs, regulatory changes.

Respond with valid JSON only.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          event_type: { type: "string" },
          sector: { type: "string" },
          ticker: { type: "string" },
          change_percent: { type: "number" },
          duration_hours: { type: "number" },
          message: { type: "string" },
          sentiment_score: { type: "number" }
        }
      }
    });

    return response;
  } catch (error) {
    return null;
  }
}

// Create market event in database
export async function createMarketEvent(eventData) {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + eventData.duration_hours);

  const event = await base44.entities.MarketEvent.create({
    event_type: eventData.event_type || 'economic',
    sector: eventData.sector,
    affected_tickers: eventData.ticker ? [eventData.ticker] : [],
    change_percent: eventData.change_percent,
    message: eventData.message,
    duration_hours: eventData.duration_hours,
    is_active: true,
    is_dramatic: Math.abs(eventData.change_percent) > 10,
    sentiment_score: eventData.sentiment_score || 0,
    supply_demand_impact: eventData.supply_demand || {},
    expires_at: expiresAt.toISOString()
  });

  // Update sentiment for affected tickers
  if (eventData.ticker) {
    await updateMarketSentiment(eventData.ticker, eventData.sentiment_score || 0, eventData.message);
  }

  return event;
}

// Trigger random events on interval
export async function generateRandomMarketEvents() {
  const events = [];
  const now = Date.now();
  
  // Company-specific event (30% chance - increased frequency)
  if (Math.random() < 0.30) {
    const companyEvent = COMPANY_EVENTS[Math.floor(Math.random() * COMPANY_EVENTS.length)];
    const event = await createMarketEvent({
      event_type: 'company_specific',
      sector: 'Company',
      ticker: companyEvent.ticker,
      change_percent: companyEvent.change,
      duration_hours: companyEvent.duration,
      message: `${companyEvent.ticker}: ${companyEvent.event}`,
      sentiment_score: companyEvent.change * 3
    });
    events.push(event);
  }

  // Political event (18% chance - increased frequency)
  if (Math.random() < 0.18) {
    const politicalEvent = POLITICAL_EVENTS[Math.floor(Math.random() * POLITICAL_EVENTS.length)];
    const event = await createMarketEvent({
      event_type: 'political',
      sector: politicalEvent.sector,
      change_percent: politicalEvent.change,
      duration_hours: politicalEvent.duration,
      message: politicalEvent.message,
      sentiment_score: politicalEvent.change * 2
    });
    events.push(event);
  }

  // Economic event (25% chance - increased frequency)
  if (Math.random() < 0.25) {
    const economicEvent = ECONOMIC_EVENTS[Math.floor(Math.random() * ECONOMIC_EVENTS.length)];
    const event = await createMarketEvent({
      event_type: 'economic',
      sector: economicEvent.sector,
      change_percent: economicEvent.change,
      duration_hours: economicEvent.duration,
      message: economicEvent.message,
      sentiment_score: economicEvent.change * 2.5
    });
    events.push(event);
  }

  // Technical event (20% chance - increased frequency)
  if (Math.random() < 0.20) {
    const technicalEvent = TECHNICAL_EVENTS[Math.floor(Math.random() * TECHNICAL_EVENTS.length)];
    const event = await createMarketEvent({
      event_type: 'technical',
      sector: technicalEvent.sector,
      change_percent: technicalEvent.change,
      duration_hours: technicalEvent.duration,
      message: technicalEvent.message,
      sentiment_score: technicalEvent.change * 1.5
    });
    events.push(event);
  }
  
  return events;
}

// Get active events
export async function getActiveMarketEvents() {
  const now = new Date().toISOString();
  const allEvents = await base44.entities.MarketEvent.filter({ is_active: true });
  
  const activeEvents = [];
  for (const event of allEvents) {
    if (new Date(event.expires_at) > new Date()) {
      activeEvents.push(event);
    } else {
      await base44.entities.MarketEvent.update(event.id, { is_active: false });
    }
  }
  
  return activeEvents;
}

// Apply events to prices with supply/demand
export function applyMarketEventsToPrices(basePrice, ticker, events) {
  if (!events || events.length === 0) return basePrice;
  
  let adjustedPrice = basePrice;
  let supplyDemandMultiplier = 1.0;
  
  const sectorMap = {
    'AAPL': 'Tech', 'GOOGL': 'Tech', 'MSFT': 'Tech', 'NVDA': 'Tech', 'AMD': 'Tech',
    'META': 'Tech', 'NFLX': 'Tech', 'TSLA': 'Auto', 'AMZN': 'Tech', 'PLTR': 'Tech',
    'JPM': 'Finance', 'BAC': 'Finance', 'GS': 'Finance', 'V': 'Finance', 'MA': 'Finance',
    'BTC-USD': 'Crypto', 'ETH-USD': 'Crypto', 'BNB-USD': 'Crypto', 'SOL-USD': 'Crypto',
    'DIS': 'Entertainment', 'WMT': 'Retail', 'COST': 'Retail',
    'XOM': 'Energy', 'CVX': 'Energy', 'XLE': 'Energy',
    'JNJ': 'Healthcare', 'PFE': 'Healthcare', 'UNH': 'Healthcare'
  };
  
  const tickerSector = sectorMap[ticker];
  
  for (const event of events) {
    const eventAge = Date.now() - new Date(event.created_date).getTime();
    const ageHours = eventAge / (1000 * 60 * 60);
    const decayFactor = Math.max(0.5, 1 - (ageHours / (event.duration_hours * 2)));
    
    // Company-specific events - amplified impact
    if (event.affected_tickers?.includes(ticker)) {
      const impact = (event.change_percent / 100) * decayFactor * 1.5; // 50% stronger
      adjustedPrice *= (1 + impact);
      
      // Supply/demand impact
      if (event.supply_demand_impact?.[ticker]) {
        supplyDemandMultiplier *= event.supply_demand_impact[ticker];
      }
    }
    // Sector events - increased impact
    else if (event.sector === tickerSector) {
      const impact = (event.change_percent / 100) * decayFactor * 1.3; // 30% stronger
      adjustedPrice *= (1 + impact);
    }
    // Broad market events - increased impact
    else if (event.sector === 'Broad Market') {
      const impact = (event.change_percent / 100) * decayFactor * 0.8; // Stronger broad impact
      adjustedPrice *= (1 + impact);
    }
  }
  
  return adjustedPrice * supplyDemandMultiplier;
}

// Update market sentiment
export async function updateMarketSentiment(ticker, sentimentDelta, newsHeadline) {
  try {
    const existing = await base44.entities.MarketSentiment.filter({ ticker });
    
    if (existing.length > 0) {
      const current = existing[0];
      const newScore = Math.max(-100, Math.min(100, (current.sentiment_score || 0) + sentimentDelta));
      
      await base44.entities.MarketSentiment.update(current.id, {
        sentiment_score: newScore,
        news_count: (current.news_count || 0) + 1,
        positive_mentions: sentimentDelta > 0 ? (current.positive_mentions || 0) + 1 : current.positive_mentions,
        negative_mentions: sentimentDelta < 0 ? (current.negative_mentions || 0) + 1 : current.negative_mentions,
        trending_topics: [...(current.trending_topics || []), newsHeadline].slice(-5),
        social_volume: (current.social_volume || 0) + Math.abs(sentimentDelta) * 10,
        updated_at: new Date().toISOString()
      });
    } else {
      await base44.entities.MarketSentiment.create({
        ticker,
        sentiment_score: sentimentDelta,
        news_count: 1,
        positive_mentions: sentimentDelta > 0 ? 1 : 0,
        negative_mentions: sentimentDelta < 0 ? 1 : 0,
        trending_topics: [newsHeadline],
        social_volume: Math.abs(sentimentDelta) * 10,
        fear_greed_index: 50 + sentimentDelta / 2,
        updated_at: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Failed to update sentiment:', error);
  }
}

// Get sentiment for ticker
export async function getMarketSentiment(ticker) {
  const sentiments = await base44.entities.MarketSentiment.filter({ ticker });
  return sentiments[0] || null;
}

// Calculate supply/demand multiplier
export function calculateSupplyDemand(ticker, recentTransactions) {
  if (!recentTransactions || recentTransactions.length === 0) return 1.0;
  
  const buyVolume = recentTransactions.filter(t => t.type === 'purchase' && t.stock_ticker === ticker && t.shares_change > 0).length;
  const sellVolume = recentTransactions.filter(t => t.type === 'purchase' && t.stock_ticker === ticker && t.shares_change < 0).length;
  
  const totalVolume = buyVolume + sellVolume;
  if (totalVolume === 0) return 1.0;
  
  const buyPressure = buyVolume / totalVolume;
  
  // Convert to multiplier: high buy pressure = higher prices
  const multiplier = 0.97 + (buyPressure * 0.06); // Range: 0.97 to 1.03
  
  return multiplier;
}