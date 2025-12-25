import { base44 } from '@/api/base44Client';
import NotificationSystem from '@/components/notifications/NotificationSystem';

const SECTORS = ['Tech', 'Energy', 'Finance', 'Healthcare', 'Crypto'];

const DRAMATIC_EVENTS = [
  {
    name: 'Tech Bubble Burst',
    sector: 'Tech',
    changePercent: -18,
    duration: 4,
    message: '💥 Major tech correction! Tech stocks plummet as valuations come under scrutiny',
    icon: '💥'
  },
  {
    name: 'AI Revolution',
    sector: 'Tech',
    changePercent: 25,
    duration: 6,
    message: '🚀 AI breakthrough! Tech stocks soar on major innovation announcement',
    icon: '🚀'
  },
  {
    name: 'Commodity Shortage',
    sector: 'Energy',
    changePercent: 22,
    duration: 8,
    message: '⚡ Energy crisis! Supply disruptions send energy stocks skyrocketing',
    icon: '⚡'
  },
  {
    name: 'Green Energy Boom',
    sector: 'Energy',
    changePercent: 15,
    duration: 12,
    message: '🌱 Renewable energy surge! Green policies boost energy sector',
    icon: '🌱'
  },
  {
    name: 'Banking Crisis',
    sector: 'Finance',
    changePercent: -15,
    duration: 6,
    message: '🏦 Banking sector turmoil! Regulatory concerns shake financial markets',
    icon: '🏦'
  },
  {
    name: 'Interest Rate Cut',
    sector: 'Finance',
    changePercent: 12,
    duration: 24,
    message: '📈 Central bank cuts rates! Financial stocks rally on stimulus hopes',
    icon: '📈'
  },
  {
    name: 'Pandemic Outbreak',
    sector: 'Healthcare',
    changePercent: 20,
    duration: 10,
    message: '💊 Healthcare demand spikes! Medical stocks surge on treatment needs',
    icon: '💊'
  },
  {
    name: 'Drug Approval Wave',
    sector: 'Healthcare',
    changePercent: 14,
    duration: 8,
    message: '✅ FDA approvals flood in! Healthcare sector celebrates breakthrough',
    icon: '✅'
  },
  {
    name: 'Crypto Crackdown',
    sector: 'Crypto',
    changePercent: -25,
    duration: 5,
    message: '⚠️ Regulatory hammer falls! Crypto markets tank on enforcement actions',
    icon: '⚠️'
  },
  {
    name: 'Bitcoin Halving Hype',
    sector: 'Crypto',
    changePercent: 30,
    duration: 12,
    message: '₿ Crypto mania! Bitcoin halving ignites massive rally across crypto',
    icon: '₿'
  },
  {
    name: 'Global Summit',
    sector: 'Broad Market',
    changePercent: -3,
    duration: 24,
    message: '🌍 Trade talks succeed! Market volatility decreases, stable conditions ahead',
    icon: '🌍',
    reducesVolatility: true
  },
  {
    name: 'Flash Crash',
    sector: 'Broad Market',
    changePercent: -12,
    duration: 2,
    message: '💔 Markets in freefall! Panic selling triggers rapid decline',
    icon: '💔'
  },
  {
    name: 'Bull Run',
    sector: 'Broad Market',
    changePercent: 8,
    duration: 48,
    message: '🐂 Epic bull run! All sectors surge on unstoppable buying pressure',
    icon: '🐂'
  },
  {
    name: 'Earnings Season Blowout',
    sector: 'Broad Market',
    changePercent: 6,
    duration: 72,
    message: '📊 Record earnings! Companies exceed expectations across the board',
    icon: '📊'
  }
];

let lastEventTime = Date.now();
const MIN_EVENT_INTERVAL = 2.5 * 60 * 60 * 1000; // 2.5 hours minimum between dramatic events

export async function generateRandomMarketEvents() {
  const events = [];
  const now = Date.now();
  
  // Dramatic event (8% chance, but only if enough time has passed)
  if (now - lastEventTime >= MIN_EVENT_INTERVAL && Math.random() < 0.08) {
    const dramaticEvent = DRAMATIC_EVENTS[Math.floor(Math.random() * DRAMATIC_EVENTS.length)];
    const durationMs = dramaticEvent.duration * 60 * 60 * 1000;
    const expiresAt = new Date(now + durationMs);
    
    const event = await base44.entities.MarketEvent.create({
      sector: dramaticEvent.sector,
      change_percent: dramaticEvent.changePercent,
      message: dramaticEvent.message,
      duration_hours: dramaticEvent.duration,
      is_active: true,
      expires_at: expiresAt.toISOString(),
      is_dramatic: true,
      reduces_volatility: dramaticEvent.reducesVolatility || false
    });
    
    events.push(event);
    lastEventTime = now;
    
    // Send push notification
    NotificationSystem.marketEvent(
      `${dramaticEvent.icon} ${dramaticEvent.name}`,
      `${dramaticEvent.message} | Active for ${dramaticEvent.duration}h`
    );
    
    return events;
  }
  
  // Regular sector events (10% chance each)
  for (const sector of SECTORS) {
    if (Math.random() < 0.10) {
      const changePercent = parseFloat((Math.random() * 8 - 4).toFixed(2));
      const expiresAt = new Date(now + 20 * 60 * 60 * 1000); // 20 hour duration
      
      const message = changePercent > 0 
        ? `${sector} sector rallies as investor confidence grows`
        : `${sector} sector faces headwinds amid market concerns`;
      
      const event = await base44.entities.MarketEvent.create({
        sector,
        change_percent: changePercent,
        message,
        duration_hours: 24,
        is_active: true,
        expires_at: expiresAt.toISOString(),
        is_dramatic: false
      });
      
      events.push(event);
    }
  }
  
  return events;
}

export async function getActiveMarketEvents() {
  const now = new Date().toISOString();
  const allEvents = await base44.entities.MarketEvent.filter({ is_active: true });
  
  // Filter expired events and deactivate them
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

export function applyMarketEventsToPrices(basePrice, ticker, events) {
  if (!events || events.length === 0) return basePrice;
  
  let adjustedPrice = basePrice;
  
  // Expanded ticker sector mapping
  const sectorMap = {
    // Tech
    'AAPL': 'Tech', 'GOOGL': 'Tech', 'MSFT': 'Tech', 'NVDA': 'Tech', 'AMD': 'Tech',
    'META': 'Tech', 'NFLX': 'Tech', 'TSLA': 'Tech', 'ORCL': 'Tech', 'ADBE': 'Tech',
    'CRM': 'Tech', 'INTC': 'Tech', 'CSCO': 'Tech', 'AVGO': 'Tech', 'QCOM': 'Tech',
    'TSM': 'Tech', 'PLTR': 'Tech', 'SNOW': 'Tech', 'NOW': 'Tech', 'MU': 'Tech',
    // Energy
    'XOM': 'Energy', 'CVX': 'Energy', 'COP': 'Energy', 'XLE': 'Energy', 'NEE': 'Energy',
    'PLUG': 'Energy', 'ENPH': 'Energy', 'SEDG': 'Energy',
    // Finance
    'JPM': 'Finance', 'BAC': 'Finance', 'GS': 'Finance', 'V': 'Finance', 'MA': 'Finance',
    'WFC': 'Finance', 'C': 'Finance', 'MS': 'Finance', 'AXP': 'Finance', 'XLF': 'Finance',
    'PYPL': 'Finance', 'SQ': 'Finance', 'COIN': 'Finance',
    // Healthcare
    'JNJ': 'Healthcare', 'PFE': 'Healthcare', 'UNH': 'Healthcare', 'ABBV': 'Healthcare',
    'TMO': 'Healthcare', 'ABT': 'Healthcare', 'MRNA': 'Healthcare', 'REGN': 'Healthcare',
    'CVS': 'Healthcare', 'ISRG': 'Healthcare',
    // Crypto
    'BTC-USD': 'Crypto', 'ETH-USD': 'Crypto', 'BNB-USD': 'Crypto', 'SOL-USD': 'Crypto',
    'ADA-USD': 'Crypto', 'XRP-USD': 'Crypto', 'DOT-USD': 'Crypto', 'DOGE-USD': 'Crypto',
    'AVAX-USD': 'Crypto', 'MATIC-USD': 'Crypto', 'LINK-USD': 'Crypto', 'UNI-USD': 'Crypto',
    'SHIB-USD': 'Crypto', 'PEPE-USD': 'Crypto', 'WIF-USD': 'Crypto', 'AAVE-USD': 'Crypto'
  };
  
  const tickerSector = sectorMap[ticker];
  
  for (const event of events) {
    // Time decay for realistic event impact
    const eventAge = Date.now() - new Date(event.created_date).getTime();
    const ageHours = eventAge / (1000 * 60 * 60);
    const decayFactor = Math.max(0.6, 1 - (ageHours / (event.duration_hours * 1.5)));
    
    // Apply price changes with decay
    if (event.sector === 'Broad Market') {
      const impact = (event.change_percent / 100) * decayFactor;
      adjustedPrice *= (1 + impact);
      
      if (event.is_dramatic) {
        adjustedPrice *= (1 + impact * 0.2); // Extra 20% boost for dramatic
      }
    } else if (event.sector === tickerSector) {
      const impact = (event.change_percent / 100) * decayFactor;
      adjustedPrice *= (1 + impact);
      
      if (event.is_dramatic) {
        adjustedPrice *= (1 + impact * 0.4); // Extra 40% boost for dramatic sector events
      }
    }
  }
  
  return adjustedPrice;
}