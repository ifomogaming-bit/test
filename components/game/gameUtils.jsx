// Stock-related questions database
const QUESTIONS = {
  easy: [
    {
      text: "What does IPO stand for?",
      answers: ["Initial Public Offering", "Internal Price Option", "Investment Portfolio Order", "Instant Purchase Order"],
      correctIndex: 0
    },
    {
      text: "Which market index tracks 500 large US companies?",
      answers: ["S&P 500", "NASDAQ", "Dow Jones", "Russell 2000"],
      correctIndex: 0
    },
    {
      text: "What color typically represents a stock price increase?",
      answers: ["Red", "Green", "Blue", "Yellow"],
      correctIndex: 1
    },
    {
      text: "What is a 'bull market'?",
      answers: ["Falling prices", "Rising prices", "Stable prices", "Volatile prices"],
      correctIndex: 1
    },
    {
      text: "What is a dividend?",
      answers: ["A stock split", "A company payment to shareholders", "A trading fee", "A market index"],
      correctIndex: 1
    },
    {
      text: "What does CEO stand for?",
      answers: ["Chief Executive Officer", "Central Economic Operator", "Corporate Earnings Overseer", "Capital Exchange Official"],
      correctIndex: 0
    },
    {
      text: "What is a ticker symbol?",
      answers: ["Stock price", "Unique stock identifier", "Trading volume", "Market index"],
      correctIndex: 1
    },
    {
      text: "What does NYSE stand for?",
      answers: ["New York Stock Exchange", "National Yield Security Exchange", "New Yearly Stock Estimate", "Northern Yield Securities"],
      correctIndex: 0
    },
    {
      text: "What is a share?",
      answers: ["Company loan", "Unit of company ownership", "Trading fee", "Market index"],
      correctIndex: 1
    },
    {
      text: "What is the NASDAQ?",
      answers: ["A bank", "A stock exchange", "A cryptocurrency", "A trading strategy"],
      correctIndex: 1
    },
    {
      text: "What does 'volume' mean in trading?",
      answers: ["Stock price", "Number of shares traded", "Market cap", "Dividend amount"],
      correctIndex: 1
    },
    {
      text: "What is a broker?",
      answers: ["Company owner", "Stock buyer only", "Trading intermediary", "Market regulator"],
      correctIndex: 2
    },
    {
      text: "What does 'bear market' mean?",
      answers: ["Rising market", "Falling market", "Stable market", "Closed market"],
      correctIndex: 1
    },
    {
      text: "What is the Dow Jones?",
      answers: ["A bank", "A stock index", "A company", "A currency"],
      correctIndex: 1
    },
    {
      text: "What does CFO stand for?",
      answers: ["Chief Financial Officer", "Central Fund Operator", "Corporate Finance Official", "Capital Flow Organizer"],
      correctIndex: 0
    },
    {
      text: "What is equity?",
      answers: ["Company debt", "Ownership stake", "Trading fee", "Stock price"],
      correctIndex: 1
    },
    {
      text: "What is market volatility?",
      answers: ["Trading volume", "Price stability", "Price fluctuation", "Market size"],
      correctIndex: 2
    },
    {
      text: "What is a portfolio?",
      answers: ["Single investment", "Collection of investments", "Stock certificate", "Trading account"],
      correctIndex: 1
    },
    {
      text: "What does ETF stand for?",
      answers: ["Exchange Traded Fund", "Equity Trading Forum", "Electronic Transaction Fee", "Expected Trading Future"],
      correctIndex: 0
    },
    {
      text: "What is a stock exchange?",
      answers: ["Bank branch", "Trading marketplace", "Investment advisor", "Brokerage firm"],
      correctIndex: 1
    },
    {
      text: "What are securities?",
      answers: ["Safety measures", "Financial instruments", "Bank deposits", "Insurance policies"],
      correctIndex: 1
    },
    {
      text: "What is a mutual fund?",
      answers: ["Bank account", "Pooled investment vehicle", "Insurance policy", "Retirement plan"],
      correctIndex: 1
    },
    {
      text: "What does 'market cap' measure?",
      answers: ["Daily volume", "Company's total value", "Stock price", "Trading limit"],
      correctIndex: 1
    },
    {
      text: "What is a bond?",
      answers: ["Stock type", "Debt security", "Insurance", "Commodity"],
      correctIndex: 1
    },
    {
      text: "What is liquidity?",
      answers: ["Company profit", "Cash availability", "Stock volatility", "Market size"],
      correctIndex: 1
    },
    {
      text: "What are assets?",
      answers: ["Company debts", "Valuable resources", "Trading fees", "Market indexes"],
      correctIndex: 1
    },
    {
      text: "What is a stock market crash?",
      answers: ["Small decline", "Rapid major decline", "Slow decline", "Market closure"],
      correctIndex: 1
    },
    {
      text: "What is compound interest?",
      answers: ["Simple interest", "Interest on interest", "Trading fee", "Dividend payment"],
      correctIndex: 1
    },
    {
      text: "What is inflation?",
      answers: ["Price decrease", "Price increase", "Stable prices", "Market crash"],
      correctIndex: 1
    },
    {
      text: "What is a financial advisor?",
      answers: ["Stock seller", "Investment consultant", "Bank teller", "Tax collector"],
      correctIndex: 1
    },
    {
      text: "What does REIT stand for?",
      answers: ["Real Estate Investment Trust", "Return Equity Interest Term", "Retail Exchange Index Trading", "Revenue Enhancement Investment Type"],
      correctIndex: 0
    },
    {
      text: "What is a commodity?",
      answers: ["Stock type", "Raw material", "Bond", "Currency"],
      correctIndex: 1
    },
    {
      text: "What is forex trading?",
      answers: ["Stock trading", "Currency trading", "Bond trading", "Commodity trading"],
      correctIndex: 1
    },
    {
      text: "What is a recession?",
      answers: ["Economic growth", "Economic decline", "Market boom", "Inflation spike"],
      correctIndex: 1
    },
    {
      text: "What is GDP?",
      answers: ["Government Debt Product", "Gross Domestic Product", "Global Dividend Payment", "General Distribution Plan"],
      correctIndex: 1
    }
  ],
  medium: [
    {
      text: "What is the P/E ratio?",
      answers: ["Price-to-Earnings", "Profit-to-Expense", "Portfolio-to-Equity", "Payment-to-Exchange"],
      correctIndex: 0
    },
    {
      text: "What is market capitalization?",
      answers: ["Daily trading volume", "Total value of company's shares", "Highest stock price", "Annual profit"],
      correctIndex: 1
    },
    {
      text: "What is a stock split?",
      answers: ["Selling half your shares", "Dividing existing shares", "Company bankruptcy", "Merger announcement"],
      correctIndex: 1
    },
    {
      text: "What does 'going short' mean?",
      answers: ["Buying quickly", "Betting prices will fall", "Selling at a loss", "Trading after hours"],
      correctIndex: 1
    },
    {
      text: "What is a blue-chip stock?",
      answers: ["Penny stock", "Large, established company", "Tech startup", "Foreign stock"],
      correctIndex: 1
    },
    {
      text: "What does EPS stand for?",
      answers: ["Earnings Per Share", "Equity Position Status", "Exchange Price System", "Expected Profit Scale"],
      correctIndex: 0
    },
    {
      text: "What is dollar-cost averaging?",
      answers: ["Selling at average price", "Investing fixed amounts regularly", "Trading only dollars", "Averaging losses"],
      correctIndex: 1
    },
    {
      text: "What is a limit order?",
      answers: ["Maximum shares to buy", "Order at specified price or better", "Daily trade limit", "Order timeout"],
      correctIndex: 1
    },
    {
      text: "What does ROI stand for?",
      answers: ["Return On Investment", "Rate Of Interest", "Risk Output Index", "Revenue Ongoing Income"],
      correctIndex: 0
    },
    {
      text: "What is diversification?",
      answers: ["Buying one stock", "Spreading investments", "Selling everything", "Day trading"],
      correctIndex: 1
    },
    {
      text: "What is after-hours trading?",
      answers: ["Illegal trading", "Trading outside regular hours", "Weekend trading", "International trading"],
      correctIndex: 1
    },
    {
      text: "What is a bear market?",
      answers: ["Rising prices", "Falling prices 20%+", "Stable market", "High volatility"],
      correctIndex: 1
    },
    {
      text: "What is yield?",
      answers: ["Stock split", "Return on investment", "Trading volume", "Market index"],
      correctIndex: 1
    },
    {
      text: "What is a market order?",
      answers: ["Order at specific price", "Order at current market price", "Cancelled order", "Pending order"],
      correctIndex: 1
    },
    {
      text: "What is profit margin?",
      answers: ["Total revenue", "Profit as % of revenue", "Total expenses", "Stock price"],
      correctIndex: 1
    },
    {
      text: "What is insider trading?",
      answers: ["Legal trading", "Trading with non-public info", "Day trading", "Long-term investing"],
      correctIndex: 1
    },
    {
      text: "What is a fiscal year?",
      answers: ["Calendar year", "Company's financial year", "Tax year only", "Market cycle"],
      correctIndex: 1
    },
    {
      text: "What is revenue?",
      answers: ["Net profit", "Total income", "Total expenses", "Asset value"],
      correctIndex: 1
    },
    {
      text: "What is depreciation?",
      answers: ["Asset appreciation", "Asset value decline", "Stock split", "Dividend payment"],
      correctIndex: 1
    },
    {
      text: "What is a balance sheet?",
      answers: ["Trading record", "Financial snapshot", "Tax form", "Investment plan"],
      correctIndex: 1
    },
    {
      text: "What is cash flow?",
      answers: ["Stock price", "Money in/out", "Trading volume", "Market cap"],
      correctIndex: 1
    },
    {
      text: "What is a bull trap?",
      answers: ["Sustained rally", "False upward signal", "Bear market", "Market crash"],
      correctIndex: 1
    },
    {
      text: "What is sector rotation?",
      answers: ["Stock split", "Shifting between sectors", "Company merger", "Market crash"],
      correctIndex: 1
    },
    {
      text: "What is a stop order?",
      answers: ["Cancel order", "Trigger at price", "Market order", "Limit order"],
      correctIndex: 1
    },
    {
      text: "What is book value?",
      answers: ["Market price", "Net asset value", "Stock price", "Trading volume"],
      correctIndex: 1
    },
    {
      text: "What is volatility clustering?",
      answers: ["Low volatility", "High volatility periods grouped", "Stable trading", "Market crash"],
      correctIndex: 1
    },
    {
      text: "What is a tender offer?",
      answers: ["IPO", "Buyback offer", "Stock split", "Dividend"],
      correctIndex: 1
    },
    {
      text: "What is correlation?",
      answers: ["Stock price", "Asset relationship", "Trading volume", "Market size"],
      correctIndex: 1
    },
    {
      text: "What is a trailing stop?",
      answers: ["Fixed stop loss", "Moving stop loss", "Limit order", "Market order"],
      correctIndex: 1
    },
    {
      text: "What is working capital?",
      answers: ["Total assets", "Current assets minus liabilities", "Stock price", "Market cap"],
      correctIndex: 1
    },
    {
      text: "What is front running?",
      answers: ["Legal trading", "Trading ahead of client", "Fast trading", "Long investing"],
      correctIndex: 1
    },
    {
      text: "What is momentum trading?",
      answers: ["Value investing", "Following price trends", "Buy and hold", "Dividend investing"],
      correctIndex: 1
    },
    {
      text: "What is a spinoff?",
      answers: ["IPO", "New company from parent", "Merger", "Bankruptcy"],
      correctIndex: 1
    },
    {
      text: "What is market breadth?",
      answers: ["Market size", "Advancing vs declining stocks", "Trading volume", "Stock price"],
      correctIndex: 1
    },
    {
      text: "What is slippage?",
      answers: ["Profit gain", "Price difference at execution", "Trading fee", "Stock split"],
      correctIndex: 1
    },
    {
      text: "What is relative strength?",
      answers: ["Stock weight", "Performance vs benchmark", "Trading volume", "Company size"],
      correctIndex: 1
    }
  ],
  hard: [
    {
      text: "What is the VIX index known as?",
      answers: ["Value Index", "Fear Index", "Growth Index", "Bond Index"],
      correctIndex: 1
    },
    {
      text: "What is a dead cat bounce?",
      answers: ["Long-term recovery", "Brief recovery after decline", "Steady growth", "Market crash"],
      correctIndex: 1
    },
    {
      text: "What is algorithmic trading?",
      answers: ["Manual trading", "Computer-automated trading", "Insider trading", "Options trading"],
      correctIndex: 1
    },
    {
      text: "What is a margin call?",
      answers: ["Broker requesting deposit", "Dividend payment", "Stock recommendation", "Market close"],
      correctIndex: 0
    },
    {
      text: "What does EBITDA stand for?",
      answers: [
        "Earnings Before Interest, Taxes, Depreciation & Amortization",
        "Expected Balance In Trade & Distribution Assets",
        "Equity Based Income Through Daily Analysis",
        "Economic Baseline Index for Trading & Development"
      ],
      correctIndex: 0
    },
    {
      text: "What is beta in stock analysis?",
      answers: ["Dividend rate", "Volatility vs market", "Price trend", "Volume measure"],
      correctIndex: 1
    },
    {
      text: "What is arbitrage?",
      answers: ["Long-term investing", "Exploiting price differences", "Risk management", "Market timing"],
      correctIndex: 1
    },
    {
      text: "What is a put option?",
      answers: ["Right to buy", "Right to sell", "Obligation to buy", "Obligation to sell"],
      correctIndex: 1
    },
    {
      text: "What is a call option?",
      answers: ["Right to buy at set price", "Right to sell", "Phone trading", "Broker call"],
      correctIndex: 0
    },
    {
      text: "What does SEC stand for?",
      answers: ["Stock Exchange Commission", "Securities and Exchange Commission", "Standard Equity Council", "Shareholder Earnings Committee"],
      correctIndex: 1
    },
    {
      text: "What is quantitative easing?",
      answers: ["Tax reduction", "Central bank buying assets", "Interest rate hike", "Stock buyback"],
      correctIndex: 1
    },
    {
      text: "What is a covered call strategy?",
      answers: ["Buying calls", "Selling calls on owned stock", "Buying puts", "Shorting stock"],
      correctIndex: 1
    }
  ],
  math: [
    {
      text: "If you buy 10 shares at $50 each and sell at $60, what's your profit?",
      answers: ["$50", "$100", "$150", "$200"],
      correctIndex: 1
    },
    {
      text: "A stock drops 20% from $100. What's the new price?",
      answers: ["$90", "$85", "$80", "$75"],
      correctIndex: 2
    },
    {
      text: "You have 100 shares worth $25 each. The stock splits 2-for-1. How many shares do you have?",
      answers: ["50", "100", "150", "200"],
      correctIndex: 3
    },
    {
      text: "A stock rises 10% on Monday and falls 10% on Tuesday. Is the overall change positive, negative, or zero?",
      answers: ["Positive", "Negative", "Zero", "Cannot determine"],
      correctIndex: 1
    },
    {
      text: "If a company's P/E ratio is 20 and earnings per share is $5, what's the stock price?",
      answers: ["$25", "$50", "$75", "$100"],
      correctIndex: 3
    },
    {
      text: "You invest $1,000. It grows 50% then drops 40%. What's your final amount?",
      answers: ["$1,000", "$900", "$800", "$1,100"],
      correctIndex: 1
    },
    {
      text: "What's 15% of $3,000?",
      answers: ["$300", "$450", "$500", "$600"],
      correctIndex: 1
    },
    {
      text: "A stock's market cap is $50B with 1B shares. What's the price per share?",
      answers: ["$25", "$50", "$75", "$100"],
      correctIndex: 1
    },
    {
      text: "If you buy 50 shares at $20 and the price rises 25%, what's your total value?",
      answers: ["$1,000", "$1,250", "$1,500", "$1,750"],
      correctIndex: 1
    },
    {
      text: "A portfolio of $8,000 gains 15%. What's the new value?",
      answers: ["$8,600", "$9,000", "$9,200", "$9,600"],
      correctIndex: 2
    },
    {
      text: "You invest $2,000. After 1 year at 10% return, what do you have?",
      answers: ["$2,100", "$2,200", "$2,300", "$2,400"],
      correctIndex: 1
    },
    {
      text: "If a stock falls from $80 to $60, what's the percentage loss?",
      answers: ["20%", "25%", "30%", "33%"],
      correctIndex: 1
    },
    {
      text: "Calculate 3% of $15,000",
      answers: ["$350", "$400", "$450", "$500"],
      correctIndex: 2
    },
    {
      text: "You own 200 shares at $15. Stock rises to $18. What's your gain?",
      answers: ["$300", "$400", "$500", "$600"],
      correctIndex: 3
    },
    {
      text: "A $5,000 investment earns 8% annually. Value after 1 year?",
      answers: ["$5,200", "$5,300", "$5,400", "$5,500"],
      correctIndex: 2
    }
  ],
  crypto: [
    {
      text: "What is Bitcoin's maximum supply?",
      answers: ["21 million", "100 million", "Unlimited", "1 billion"],
      correctIndex: 0
    },
    {
      text: "What consensus mechanism does Ethereum 2.0 use?",
      answers: ["Proof of Work", "Proof of Stake", "Proof of Authority", "Delegated Proof of Stake"],
      correctIndex: 1
    },
    {
      text: "What does 'HODL' mean in crypto?",
      answers: ["Hold On for Dear Life", "High Order Digital Ledger", "Holding Original Digital Loot", "Happy Optimistic Day Ledger"],
      correctIndex: 0
    },
    {
      text: "What blockchain does Cardano use?",
      answers: ["Ethereum", "Bitcoin", "Ouroboros", "Solana"],
      correctIndex: 2
    },
    {
      text: "What is a 'whale' in crypto trading?",
      answers: ["Small investor", "Large holder", "Exchange", "Mining pool"],
      correctIndex: 1
    },
    {
      text: "What year was Bitcoin created?",
      answers: ["2007", "2008", "2009", "2010"],
      correctIndex: 2
    },
    {
      text: "What is a blockchain fork?",
      answers: ["Mining hardware", "Protocol change", "Wallet type", "Exchange feature"],
      correctIndex: 1
    },
    {
      text: "What does DeFi stand for?",
      answers: ["Digital Finance", "Decentralized Finance", "Defiant Financial", "Definite Finances"],
      correctIndex: 1
    },
    {
      text: "What is gas fee in Ethereum?",
      answers: ["Mining reward", "Transaction cost", "Staking bonus", "Exchange fee"],
      correctIndex: 1
    },
    {
      text: "What does NFT stand for?",
      answers: ["New Financial Token", "Non-Fungible Token", "Network File Transfer", "Nominal Future Trading"],
      correctIndex: 1
    },
    {
      text: "What is a crypto wallet?",
      answers: ["Physical money holder", "Digital asset storage", "Mining device", "Exchange platform"],
      correctIndex: 1
    },
    {
      text: "What is staking in crypto?",
      answers: ["Selling coins", "Locking coins for rewards", "Mining process", "Trading strategy"],
      correctIndex: 1
    },
    {
      text: "Who created Bitcoin?",
      answers: ["Elon Musk", "Satoshi Nakamoto", "Vitalik Buterin", "Bill Gates"],
      correctIndex: 1
    },
    {
      text: "What is a smart contract?",
      answers: ["Legal document", "Self-executing code", "Trading agreement", "Investment plan"],
      correctIndex: 1
    },
    {
      text: "What does FOMO mean in crypto?",
      answers: ["Fear Of Missing Out", "Follow Only Market Orders", "Financial Outlook Market Opinion", "Future Options Money Outlook"],
      correctIndex: 0
    }
  ],
  advanced: [
    {
      text: "What is options trading?",
      answers: ["Buying stocks directly", "Right to buy/sell at set price", "Day trading only", "Long-term investing"],
      correctIndex: 1
    },
    {
      text: "What does 'short squeeze' mean?",
      answers: ["Selling quickly", "Shorts forced to buy", "Market crash", "Long position"],
      correctIndex: 1
    },
    {
      text: "What is a hedge fund's primary goal?",
      answers: ["Maximize returns using various strategies", "Only buy stocks", "Day trading", "Cryptocurrency mining"],
      correctIndex: 0
    },
    {
      text: "What is 'liquidity' in markets?",
      answers: ["Water supply", "Ease of buying/selling", "Profit margin", "Market hours"],
      correctIndex: 1
    },
    {
      text: "What does RSI indicator measure?",
      answers: ["Revenue", "Momentum and overbought/oversold", "Stock splits", "Dividends"],
      correctIndex: 1
    },
    {
      text: "What is gamma in options?",
      answers: ["Delta change rate", "Option price", "Time decay", "Implied volatility"],
      correctIndex: 0
    },
    {
      text: "What is theta decay?",
      answers: ["Stock depreciation", "Option time value loss", "Portfolio decline", "Market correction"],
      correctIndex: 1
    },
    {
      text: "What is implied volatility?",
      answers: ["Historical price swings", "Market's expectation of future volatility", "Trading volume", "Price momentum"],
      correctIndex: 1
    },
    {
      text: "What is dark pool trading?",
      answers: ["Illegal trading", "Private exchange for large orders", "After-hours trading", "Cryptocurrency trading"],
      correctIndex: 1
    },
    {
      text: "What is MACD indicator used for?",
      answers: ["Dividend tracking", "Trend and momentum", "Volume analysis", "Price prediction"],
      correctIndex: 1
    },
    {
      text: "What is contango in futures?",
      answers: ["Future price > spot price", "Spot price > future price", "Price stability", "Market crash"],
      correctIndex: 0
    },
    {
      text: "What is a straddle strategy?",
      answers: ["Buying call and put same strike", "Only buying calls", "Only selling puts", "Shorting stock"],
      correctIndex: 0
    },
    {
      text: "What is Bollinger Bands?",
      answers: ["Stock group", "Volatility indicator", "Trading hours", "Market sector"],
      correctIndex: 1
    },
    {
      text: "What is the Sharpe Ratio?",
      answers: ["Risk-adjusted return", "Price volatility", "Trading volume", "Dividend yield"],
      correctIndex: 0
    },
    {
      text: "What is delta hedging?",
      answers: ["Buying deltas", "Neutralizing directional risk", "Selling options", "Holding stocks"],
      correctIndex: 1
    },
    {
      text: "What is the Iron Condor strategy?",
      answers: ["Stock buying", "Selling OTM calls and puts", "Day trading", "Short selling"],
      correctIndex: 1
    },
    {
      text: "What does Vega measure in options?",
      answers: ["Time decay", "Volatility sensitivity", "Price change", "Interest rate risk"],
      correctIndex: 1
    },
    {
      text: "What is the Kelly Criterion?",
      answers: ["Stock picking", "Optimal bet sizing formula", "Trading hours", "Market timing"],
      correctIndex: 1
    },
    {
      text: "What is backwardation?",
      answers: ["Spot > future price", "Future > spot price", "Price stability", "Market crash"],
      correctIndex: 0
    },
    {
      text: "What is a butterfly spread?",
      answers: ["Stock pattern", "Multi-leg options strategy", "Day trading", "Forex strategy"],
      correctIndex: 1
    },
    {
      text: "What is the Black-Scholes model?",
      answers: ["Stock picking", "Options pricing formula", "Trading system", "Risk measure"],
      correctIndex: 1
    },
    {
      text: "What is a credit spread?",
      answers: ["Loan interest", "Net premium from options", "Bond yield", "Stock range"],
      correctIndex: 1
    },
    {
      text: "What is vega risk?",
      answers: ["Price risk", "Volatility change risk", "Time risk", "Interest risk"],
      correctIndex: 1
    },
    {
      text: "What is the Greeks in options?",
      answers: ["Greek stocks", "Risk measures", "Trading hours", "Market indices"],
      correctIndex: 1
    },
    {
      text: "What is a synthetic position?",
      answers: ["Fake stock", "Options replicating stock", "ETF", "Index fund"],
      correctIndex: 1
    },
    {
      text: "What is rho in options?",
      answers: ["Time decay", "Interest rate sensitivity", "Price change", "Volatility"],
      correctIndex: 1
    },
    {
      text: "What is the put-call parity?",
      answers: ["Equal premiums", "Relationship between puts/calls", "Trading rule", "Market balance"],
      correctIndex: 1
    },
    {
      text: "What is calendar spread?",
      answers: ["Day trading", "Different expiration dates", "Same day trades", "Weekly options"],
      correctIndex: 1
    },
    {
      text: "What is volatility smile?",
      answers: ["Happy market", "IV pattern across strikes", "Price chart", "Volume pattern"],
      correctIndex: 1
    },
    {
      text: "What is a collar strategy?",
      answers: ["Buy stock only", "Long stock + protective put + covered call", "Short stock", "Buy calls"],
      correctIndex: 1
    },
    {
      text: "What is pin risk?",
      answers: ["Stock risk", "Options expire near strike", "Market crash", "Trading error"],
      correctIndex: 1
    },
    {
      text: "What is skewness in returns?",
      answers: ["Average return", "Asymmetric distribution", "Standard deviation", "Mean variance"],
      correctIndex: 1
    },
    {
      text: "What is kurtosis?",
      answers: ["Average", "Tail risk measure", "Volatility", "Price trend"],
      correctIndex: 1
    },
    {
      text: "What is the efficient frontier?",
      answers: ["Fast trading", "Optimal risk-return curve", "Market boundary", "Price limit"],
      correctIndex: 1
    },
    {
      text: "What is basis risk?",
      answers: ["Stock risk", "Hedge vs underlying divergence", "Market risk", "Credit risk"],
      correctIndex: 1
    },
    {
      text: "What is convexity in bonds?",
      answers: ["Bond shape", "Price sensitivity curvature", "Yield measure", "Risk metric"],
      correctIndex: 1
    },
    {
      text: "What is jump diffusion?",
      answers: ["Day trading", "Price model with sudden moves", "Volatility measure", "Options strategy"],
      correctIndex: 1
    },
    {
      text: "What is the VaR metric?",
      answers: ["Variable rate", "Value at Risk", "Volatility average", "Volume analysis"],
      correctIndex: 1
    },
    {
      text: "What is Sortino Ratio?",
      answers: ["Italian index", "Downside risk-adjusted return", "Volume ratio", "Price metric"],
      correctIndex: 1
    },
    {
      text: "What is autocorrelation?",
      answers: ["Auto trading", "Correlation with past values", "Car stocks", "Market correlation"],
      correctIndex: 1
    }
  ]
};

export function generateQuestion(ticker, mapDifficulty) {
  const isCrypto = ticker.includes('-');
  const difficultyLevel = mapDifficulty <= 3 ? 'easy' : mapDifficulty <= 6 ? 'medium' : mapDifficulty <= 8 ? 'hard' : 'advanced';
  const rand = Math.random();
  
  let pool;
  if (isCrypto && rand > 0.4) {
    pool = QUESTIONS.crypto;
  } else if (rand > 0.7) {
    pool = QUESTIONS.math;
  } else {
    pool = QUESTIONS[difficultyLevel];
  }
  
  const question = pool[Math.floor(Math.random() * pool.length)];
  
  return {
    ...question,
    ticker,
    id: `${ticker}-${Date.now()}-${Math.random()}` // Unique ID for tracking
  };
}

import { getBalancedBubbleReward } from '@/components/economy/EconomyManager';

export function generateReward(bubble, streak, playerLevel = 1) {
  const { rarity, isLucky } = bubble;
  
  const baseReward = getBalancedBubbleReward(rarity, streak, playerLevel);
  
  // Apply lucky bonus
  if (isLucky) {
    baseReward.shares *= 2;
    baseReward.coins *= 2;
  }
  
  return {
    shares: baseReward.shares,
    rarity,
    coins: baseReward.coins,
    xp: baseReward.xp,
    isLucky
  };
}

export function getRandomPosition(index, total) {
  const padding = 80;
  const columns = Math.ceil(Math.sqrt(total));
  const row = Math.floor(index / columns);
  const col = index % columns;
  
  const cellWidth = (100 - padding * 2 / (typeof window !== 'undefined' ? window.innerWidth : 1000) * 100) / columns;
  const cellHeight = (100 - padding * 2 / (typeof window !== 'undefined' ? window.innerHeight : 800) * 100) / Math.ceil(total / columns);
  
  const baseX = `${padding + col * cellWidth * (typeof window !== 'undefined' ? window.innerWidth : 1000) / 100 + Math.random() * 50}px`;
  const baseY = `${padding + row * cellHeight * (typeof window !== 'undefined' ? window.innerHeight : 800) / 100 + Math.random() * 50 + 60}px`;
  
  return { x: baseX, y: baseY };
}

export function calculatePortfolioValue(portfolio, stockPrices) {
  return portfolio.reduce((total, holding) => {
    const price = stockPrices[holding.ticker] || holding.avg_acquisition_price || 0;
    return total + (holding.shares * price);
  }, 0);
}

export function getXpForLevel(level) {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

export function getLevelFromXp(xp) {
  let level = 1;
  let requiredXp = 100;
  while (xp >= requiredXp) {
    xp -= requiredXp;
    level++;
    requiredXp = Math.floor(100 * Math.pow(1.5, level - 1));
  }
  return { level, currentXp: xp, requiredXp };
}