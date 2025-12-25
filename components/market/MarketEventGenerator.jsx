import { base44 } from '@/api/base44Client';

const SECTORS = ['Tech', 'Energy', 'Finance', 'Healthcare', 'Crypto'];

export async function triggerRandomMarketEvents() {
  const events = [];
  const now = new Date();

  // Sector events (30% chance each)
  for (const sector of SECTORS) {
    if (Math.random() < 0.3) {
      const changePercent = parseFloat((Math.random() * 10 - 5).toFixed(2));
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      const event = await base44.entities.MarketEvent.create({
        sector,
        change_percent: changePercent,
        message: `${sector} sector ${changePercent > 0 ? 'surges' : 'drops'} ${Math.abs(changePercent)}%`,
        duration_hours: 24,
        is_active: true,
        expires_at: expiresAt.toISOString()
      });
      
      events.push(event);
    }
  }

  // Broad market event (10% chance)
  if (Math.random() < 0.1) {
    const changePercent = parseFloat((Math.random() * 5 - 2.5).toFixed(2));
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    const event = await base44.entities.MarketEvent.create({
      sector: 'Broad Market',
      change_percent: changePercent,
      message: `Global market ${changePercent > 0 ? 'rally' : 'correction'}: ${Math.abs(changePercent)}%`,
      duration_hours: 24,
      is_active: true,
      expires_at: expiresAt.toISOString()
    });
    
    events.push(event);
  }

  return events;
}

export async function expireOldEvents() {
  const now = new Date();
  const allEvents = await base44.entities.MarketEvent.filter({ is_active: true });
  
  for (const event of allEvents) {
    if (new Date(event.expires_at) < now) {
      await base44.entities.MarketEvent.update(event.id, { is_active: false });
    }
  }
}

// Apply market event modifiers to prices
export function applyMarketEventModifiers(ticker, basePrice, events) {
  let modifiedPrice = basePrice;
  
  for (const event of events) {
    if (!event.is_active) continue;
    
    const tickerSector = getTickerSector(ticker);
    
    if (event.sector === 'Broad Market' || event.sector === tickerSector) {
      const modifier = 1 + (event.change_percent / 100);
      modifiedPrice *= modifier;
    }
  }
  
  return modifiedPrice;
}

function getTickerSector(ticker) {
  const sectors = {
    'AAPL': 'Tech', 'GOOGL': 'Tech', 'MSFT': 'Tech', 'NVDA': 'Tech', 'AMD': 'Tech',
    'XOM': 'Energy', 'CVX': 'Energy', 'COP': 'Energy',
    'JPM': 'Finance', 'BAC': 'Finance', 'GS': 'Finance', 'V': 'Finance', 'MA': 'Finance',
    'JNJ': 'Healthcare', 'PFE': 'Healthcare', 'UNH': 'Healthcare',
    'BTC-USD': 'Crypto', 'ETH-USD': 'Crypto', 'BNB-USD': 'Crypto', 'SOL-USD': 'Crypto'
  };
  
  return sectors[ticker] || 'Tech';
}