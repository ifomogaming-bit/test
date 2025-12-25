import { base44 } from '@/api/base44Client';
import questionTracker from './QuestionTracker';

export async function generateAIStockQuestion(playerId, sector = 'General') {
  try {
    // Check recent questions to avoid repeats
    const recentQuestions = await base44.entities.QuizHistory.filter(
      { player_id: playerId },
      '-created_date',
      50
    );

    const usedQuestions = recentQuestions.map(q => q.question).join('\n');

    const prompt = `Generate a unique stock market trivia or math question for a trading game.
Sector focus: ${sector}

Requirements:
- Multiple choice with 4 options
- Include one correct answer
- Can be about ROI calculations, percentage changes, stock fundamentals, or market concepts
- Difficulty: Medium to Hard
- Do NOT repeat these questions: ${usedQuestions.slice(0, 500)}

Respond ONLY with valid JSON in this exact format:
{
  "question": "Question text here?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "Option A"
}`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          question: { type: "string" },
          options: { type: "array", items: { type: "string" } },
          correctAnswer: { type: "string" }
        }
      }
    });

    // Store in history
    await base44.entities.QuizHistory.create({
      player_id: playerId,
      question: response.question,
      sector,
      was_correct: false
    });

    return response;
  } catch (error) {
    console.error('AI question generation failed:', error);
    // Fallback to predefined questions
    return generateFallbackQuestion();
  }
}

function generateFallbackQuestion() {
  const expertQuestions = [
    // Ultra-Advanced Derivatives
    {
      question: "A butterfly spread has max profit when stock price at expiration is:",
      options: ["Lower strike", "Middle strike", "Upper strike", "Anywhere in range"],
      correctAnswer: "Middle strike"
    },
    {
      question: "Rho measures option sensitivity to:",
      options: ["Time", "Volatility", "Interest rates", "Dividends"],
      correctAnswer: "Interest rates"
    },
    {
      question: "Vanna measures the change in:",
      options: ["Delta w.r.t. volatility", "Gamma w.r.t. time", "Vega w.r.t. price", "Theta w.r.t. delta"],
      correctAnswer: "Delta w.r.t. volatility"
    },
    {
      question: "If call has delta 0.6 and put has delta -0.4, is put-call parity satisfied?",
      options: ["Yes", "No", "Need more info", "Only at expiration"],
      correctAnswer: "Yes"
    },
    {
      question: "What is vomma (volga)?",
      options: ["Second derivative of option price w.r.t. volatility", "Delta decay", "Gamma acceleration", "Price momentum"],
      correctAnswer: "Second derivative of option price w.r.t. volatility"
    },
    {
      question: "Pin risk occurs when:",
      options: ["Stock closes exactly at strike at expiration", "Options expire worthless", "Volatility spikes", "Early assignment"],
      correctAnswer: "Stock closes exactly at strike at expiration"
    },
    {
      question: "For American options, early exercise is optimal for:",
      options: ["Deep ITM calls before dividend", "Deep OTM puts", "ATM calls", "Never optimal"],
      correctAnswer: "Deep ITM calls before dividend"
    },

    // Quantitative Finance Advanced
    {
      question: "Under Black-Scholes, log returns are assumed to follow:",
      options: ["Normal distribution", "Log-normal distribution", "Uniform distribution", "Exponential distribution"],
      correctAnswer: "Normal distribution"
    },
    {
      question: "GARCH models are used to model:",
      options: ["Expected returns", "Time-varying volatility", "Price levels", "Dividend yields"],
      correctAnswer: "Time-varying volatility"
    },
    {
      question: "Cointegration implies:",
      options: ["Perfect correlation", "Long-run equilibrium relationship", "No relationship", "Causation"],
      correctAnswer: "Long-run equilibrium relationship"
    },
    {
      question: "The Kelly Criterion optimal bet size is f* = (bp - q)/b where p is win prob, q is loss prob, b is odds. If p=0.6, b=1, f*=?",
      options: ["0.1", "0.2", "0.4", "0.6"],
      correctAnswer: "0.2"
    },
    {
      question: "Maximum likelihood estimation finds parameters that:",
      options: ["Minimize squared errors", "Maximize probability of observed data", "Minimize variance", "Maximize R²"],
      correctAnswer: "Maximize probability of observed data"
    },
    {
      question: "Jump diffusion models add what to geometric Brownian motion?",
      options: ["Higher drift", "Discrete jumps", "Mean reversion", "Regime switching"],
      correctAnswer: "Discrete jumps"
    },
    {
      question: "Principal Component Analysis (PCA) in portfolio management identifies:",
      options: ["Best stocks", "Sources of variance", "Arbitrage opportunities", "Credit risk"],
      correctAnswer: "Sources of variance"
    },

    // Advanced Portfolio Theory
    {
      question: "According to CAPM, expected return E(Ri) = Rf + βi[E(Rm) - Rf]. If Rf=2%, β=1.5, E(Rm)=10%, E(Ri)=?",
      options: ["8%", "10%", "12%", "14%"],
      correctAnswer: "14%"
    },
    {
      question: "Fama-French 3-factor model adds which factors to CAPM?",
      options: ["Momentum, Liquidity", "Size, Value", "Quality, Profitability", "Volatility, Correlation"],
      correctAnswer: "Size, Value"
    },
    {
      question: "Minimum variance frontier includes all portfolios that:",
      options: ["Maximize return", "Minimize risk for given return", "Have positive alpha", "Track index"],
      correctAnswer: "Minimize risk for given return"
    },
    {
      question: "Black-Litterman model combines:",
      options: ["Market equilibrium and investor views", "Value and growth", "Stocks and bonds", "Calls and puts"],
      correctAnswer: "Market equilibrium and investor views"
    },
    {
      question: "If idiosyncratic risk is 12% and systematic risk is 9%, total volatility is:",
      options: ["15%", "21%", "√(144+81)=15%", "Cannot determine"],
      correctAnswer: "√(144+81)=15%"
    },
    {
      question: "Maximum Sharpe ratio portfolio is found at the tangency point between:",
      options: ["Efficient frontier and capital market line", "Two stocks", "Risk-free asset and market", "Bonds and stocks"],
      correctAnswer: "Efficient frontier and capital market line"
    },

    // Corporate Finance Advanced
    {
      question: "Adjusted present value (APV) equals:",
      options: ["NPV of levered firm", "NPV unlevered + PV(tax shield)", "WACC × Cash flows", "Market value"],
      correctAnswer: "NPV unlevered + PV(tax shield)"
    },
    {
      question: "In MM Proposition II with taxes, cost of equity increases with leverage due to:",
      options: ["Financial risk only", "Financial risk + tax benefit", "Operating risk", "Bankruptcy costs"],
      correctAnswer: "Financial risk only"
    },
    {
      question: "If unlevered beta is 1.0, D/E=1, tax rate=30%, levered beta=?",
      options: ["1.0", "1.5", "1.7", "2.0"],
      correctAnswer: "1.7"
    },
    {
      question: "Economic Value Added (EVA) = NOPAT - (Capital × WACC). If NOPAT=$50M, Capital=$400M, WACC=10%, EVA=?",
      options: ["$5M", "$10M", "$15M", "$20M"],
      correctAnswer: "$10M"
    },
    {
      question: "Trade-off theory of capital structure balances:",
      options: ["Debt vs equity only", "Tax benefits vs bankruptcy costs", "Risk vs return", "Growth vs dividends"],
      correctAnswer: "Tax benefits vs bankruptcy costs"
    },

    // Fixed Income Advanced  
    {
      question: "Modified duration of 7 means 1% rate increase causes what price change?",
      options: ["-1%", "-5%", "-7%", "-10%"],
      correctAnswer: "-7%"
    },
    {
      question: "Convexity is desirable because:",
      options: ["Linear relationship", "Gains more than loses with rate changes", "Higher yield", "Lower default risk"],
      correctAnswer: "Gains more than loses with rate changes"
    },
    {
      question: "DV01 (dollar value of 1 basis point) for $1M bond with modified duration 5 is:",
      options: ["$50", "$100", "$500", "$1,000"],
      correctAnswer: "$500"
    },
    {
      question: "Z-spread over Treasury curve represents:",
      options: ["Credit spread", "Spread added to each spot rate for NPV=price", "Yield spread", "Option cost"],
      correctAnswer: "Spread added to each spot rate for NPV=price"
    },

    // Market Microstructure
    {
      question: "Adverse selection costs in market making arise from:",
      options: ["Volatility", "Trading against informed traders", "Inventory risk", "Clearinghouse fees"],
      correctAnswer: "Trading against informed traders"
    },
    {
      question: "Effective spread captures:",
      options: ["Quoted spread only", "Actual execution vs midpoint", "Volume weighted price", "Daily range"],
      correctAnswer: "Actual execution vs midpoint"
    },
    {
      question: "Kyle's lambda measures:",
      options: ["Price impact per unit volume", "Volatility", "Correlation", "Beta"],
      correctAnswer: "Price impact per unit volume"
    },

    // Risk Management Advanced
    {
      question: "CVaR (Conditional VaR) measures:",
      options: ["Average loss", "Expected loss given VaR exceeded", "Maximum loss", "Minimum variance"],
      correctAnswer: "Expected loss given VaR exceeded"
    },
    {
      question: "If 1-day 99% VaR is $100K, √t rule gives 10-day VaR as:",
      options: ["$100K", "$316K", "$1M", "$3.16M"],
      correctAnswer: "$316K"
    },
    {
      question: "Stressed VaR uses:",
      options: ["Normal market data", "Historical crisis period data", "Simulated data", "Average volatility"],
      correctAnswer: "Historical crisis period data"
    },
    {
      question: "Delta-normal VaR assumes returns follow:",
      options: ["Normal distribution", "t-distribution", "Lognormal", "Uniform"],
      correctAnswer: "Normal distribution"
    },

    // Crypto/DeFi Advanced
    {
      question: "Automated Market Maker (AMM) constant product formula is:",
      options: ["x + y = k", "x × y = k", "x / y = k", "x² + y² = k"],
      correctAnswer: "x × y = k"
    },
    {
      question: "Impermanent loss in LP equals what when one token 2x vs the other?",
      options: ["0%", "2.02%", "5.72%", "10%"],
      correctAnswer: "5.72%"
    },
    {
      question: "Smart contract gas limit prevents:",
      options: ["High fees", "Infinite loops/excessive computation", "Price manipulation", "Front-running"],
      correctAnswer: "Infinite loops/excessive computation"
    },
    {
      question: "Proof of Stake consensus requires validators to:",
      options: ["Mine blocks", "Lock up capital as collateral", "Solve puzzles", "Provide liquidity"],
      correctAnswer: "Lock up capital as collateral"
    },
    {
      question: "MEV (Maximal Extractable Value) comes from:",
      options: ["Mining rewards", "Transaction ordering and inclusion power", "Staking yield", "Airdrops"],
      correctAnswer: "Transaction ordering and inclusion power"
    },

    // Statistical Arbitrage
    {
      question: "Pairs trading profit comes from:",
      options: ["Direction prediction", "Mean reversion of spread", "Trend following", "Volatility trading"],
      correctAnswer: "Mean reversion of spread"
    },
    {
      question: "Ornstein-Uhlenbeck process models:",
      options: ["Random walk", "Mean reversion", "Momentum", "Jumps"],
      correctAnswer: "Mean reversion"
    },
    {
      question: "Half-life of mean reversion process tells you:",
      options: ["Time to double", "Time for 50% of deviation to decay", "Correlation period", "Maximum holding time"],
      correctAnswer: "Time for 50% of deviation to decay"
    },

    // Advanced Technical Analysis
    {
      question: "Elliott Wave Theory suggests market moves in:",
      options: ["Random patterns", "5-wave impulse, 3-wave correction", "Straight lines", "Circular patterns"],
      correctAnswer: "5-wave impulse, 3-wave correction"
    },
    {
      question: "Fibonacci retracement levels most commonly used are:",
      options: ["25%, 50%, 75%", "38.2%, 50%, 61.8%", "20%, 40%, 60%", "10%, 30%, 70%"],
      correctAnswer: "38.2%, 50%, 61.8%"
    },
    {
      question: "Bollinger Bands width indicates:",
      options: ["Price direction", "Volatility", "Volume", "Momentum"],
      correctAnswer: "Volatility"
    },
    {
      question: "MACD histogram measures:",
      options: ["Price", "Difference between MACD and signal line", "Volume", "RSI"],
      correctAnswer: "Difference between MACD and signal line"
    },
    {
      question: "Ichimoku Cloud 'kumo' represents:",
      options: ["Support/resistance zone", "Volume", "Price average", "RSI levels"],
      correctAnswer: "Support/resistance zone"
    },
    {
      question: "On-Balance Volume (OBV) combines:",
      options: ["Price and time", "Volume and price direction", "RSI and MACD", "Support and resistance"],
      correctAnswer: "Volume and price direction"
    },
    {
      question: "Head and shoulders pattern suggests:",
      options: ["Continuation", "Reversal from bullish to bearish", "Neutral", "Accumulation"],
      correctAnswer: "Reversal from bullish to bearish"
    },
    {
      question: "Stochastic oscillator above 80 indicates:",
      options: ["Oversold", "Overbought", "Neutral", "Bullish trend"],
      correctAnswer: "Overbought"
    },
    {
      question: "ADX above 25 indicates:",
      options: ["Weak trend", "Strong trend", "Reversal", "Consolidation"],
      correctAnswer: "Strong trend"
    },
    {
      question: "Parabolic SAR dots flip position when:",
      options: ["Volume spikes", "Trend reversal occurs", "Price consolidates", "Market opens"],
      correctAnswer: "Trend reversal occurs"
    },

    // Market Making & HFT
    {
      question: "Market makers profit primarily from:",
      options: ["Directional bets", "Bid-ask spread", "Dividends", "Tax benefits"],
      correctAnswer: "Bid-ask spread"
    },
    {
      question: "Latency arbitrage exploits:",
      options: ["Price differences across time", "Slow order execution", "News delays", "Geographic distance"],
      correctAnswer: "Slow order execution"
    },
    {
      question: "Iceberg orders hide:",
      options: ["Price", "True order size", "Ticker symbol", "Time of order"],
      correctAnswer: "True order size"
    },
    {
      question: "VWAP execution aims to:",
      options: ["Beat the market", "Match volume-weighted average price", "Minimize time", "Maximize profits"],
      correctAnswer: "Match volume-weighted average price"
    },
    {
      question: "Spoofing involves:",
      options: ["Legitimate trading", "Placing fake orders to manipulate", "Fast execution", "Arbitrage"],
      correctAnswer: "Placing fake orders to manipulate"
    },

    // Alternative Investments
    {
      question: "Hedge fund high-water mark means:",
      options: ["Maximum AUM", "Performance fee only on gains above previous peak", "Minimum investment", "Redemption threshold"],
      correctAnswer: "Performance fee only on gains above previous peak"
    },
    {
      question: "Hurdle rate in private equity is:",
      options: ["Maximum return", "Minimum return before carry", "Average market return", "Risk-free rate"],
      correctAnswer: "Minimum return before carry"
    },
    {
      question: "Carried interest typically equals:",
      options: ["10% of profits", "20% of profits", "30% of AUM", "Fixed fee"],
      correctAnswer: "20% of profits"
    },
    {
      question: "Venture capital invests primarily in:",
      options: ["Public companies", "Early-stage startups", "Bonds", "Real estate"],
      correctAnswer: "Early-stage startups"
    },
    {
      question: "Cap rate in real estate is:",
      options: ["NOI / Property Value", "Rental income / Price", "Appreciation rate", "Mortgage rate"],
      correctAnswer: "NOI / Property Value"
    },

    // International Finance
    {
      question: "Purchasing Power Parity (PPP) suggests:",
      options: ["Equal prices across countries", "Exchange rates equalize purchasing power", "Interest rate parity", "Forward premium"],
      correctAnswer: "Exchange rates equalize purchasing power"
    },
    {
      question: "Covered Interest Parity relates:",
      options: ["Stock prices", "Interest rates and forward exchange rates", "Bond yields", "Commodity prices"],
      correctAnswer: "Interest rates and forward exchange rates"
    },
    {
      question: "If USD/EUR = 0.85 and EUR/GBP = 0.90, what's USD/GBP?",
      options: ["0.765", "0.945", "1.056", "1.765"],
      correctAnswer: "0.765"
    },
    {
      question: "Currency carry trade profits from:",
      options: ["Exchange rate changes only", "Interest rate differentials", "Inflation", "GDP growth"],
      correctAnswer: "Interest rate differentials"
    },
    {
      question: "Eurodollar is:",
      options: ["Euro currency", "Dollar deposited outside US", "European stock", "Exchange rate"],
      correctAnswer: "Dollar deposited outside US"
    },

    // Exotic Options
    {
      question: "Asian option payoff depends on:",
      options: ["Final price", "Average price over period", "Maximum price", "Minimum price"],
      correctAnswer: "Average price over period"
    },
    {
      question: "Barrier option activates/deactivates when:",
      options: ["Time passes", "Price crosses barrier", "Volatility spikes", "Dividend paid"],
      correctAnswer: "Price crosses barrier"
    },
    {
      question: "Rainbow option depends on:",
      options: ["One asset", "Multiple underlying assets", "Weather", "Time only"],
      correctAnswer: "Multiple underlying assets"
    },
    {
      question: "Lookback option allows holder to:",
      options: ["See future prices", "Exercise at historical optimal price", "Change strike", "Extend maturity"],
      correctAnswer: "Exercise at historical optimal price"
    },
    {
      question: "Binary option pays:",
      options: ["Proportional to moneyness", "Fixed amount if ITM", "Variable amount", "Premium back"],
      correctAnswer: "Fixed amount if ITM"
    }
  ];

  const advancedQuestions = [
    // Advanced Options & Greeks
    {
      question: "An at-the-money call option has delta of 0.5. If stock rises $2, option price increases approximately:",
      options: ["$0.50", "$1.00", "$1.50", "$2.00"],
      correctAnswer: "$1.00"
    },
    {
      question: "If a put option has gamma of 0.03 and delta of -0.40, after $1 stock drop, new delta is:",
      options: ["-0.37", "-0.43", "-0.40", "-0.46"],
      correctAnswer: "-0.37"
    },
    {
      question: "Theta of -0.05 means option loses what per day?",
      options: ["$0.05", "$0.50", "$5.00", "$50.00"],
      correctAnswer: "$0.05"
    },
    {
      question: "Which has highest gamma?",
      options: ["Deep ITM call", "ATM call", "Deep OTM call", "All equal"],
      correctAnswer: "ATM call"
    },
    {
      question: "Vega of 0.15 means 1% volatility increase adds:",
      options: ["$0.015", "$0.15", "$1.50", "$15.00"],
      correctAnswer: "$0.15"
    },
    
    // Complex Financial Ratios
    {
      question: "If ROE is 20%, ROA is 10%, what's equity multiplier?",
      options: ["0.5", "1.0", "2.0", "3.0"],
      correctAnswer: "2.0"
    },
    {
      question: "Company A: EV/EBITDA=8, Company B: EV/EBITDA=12. Which is relatively cheaper?",
      options: ["Company A", "Company B", "Equal valuation", "Cannot determine"],
      correctAnswer: "Company A"
    },
    {
      question: "If current ratio is 2.0 and quick ratio is 1.2, inventory is what % of current assets?",
      options: ["20%", "40%", "60%", "80%"],
      correctAnswer: "40%"
    },
    {
      question: "Operating leverage of 3 means 10% revenue increase produces what EBIT increase?",
      options: ["10%", "20%", "30%", "40%"],
      correctAnswer: "30%"
    },
    {
      question: "If NOPAT is $100M and invested capital is $500M, what's ROIC?",
      options: ["10%", "15%", "20%", "25%"],
      correctAnswer: "20%"
    },

    // Advanced Valuation
    {
      question: "DCF with 10% discount rate: Year 1 CF=$100, Year 2 CF=$110. Present value?",
      options: ["$181", "$191", "$201", "$210"],
      correctAnswer: "$181"
    },
    {
      question: "Terminal value using perpetuity growth: FCF=$100M, g=3%, WACC=10%. Terminal value?",
      options: ["$1.0B", "$1.43B", "$1.67B", "$2.0B"],
      correctAnswer: "$1.43B"
    },
    {
      question: "If EV=$500M, cash=$50M, debt=$100M, what's equity value?",
      options: ["$350M", "$400M", "$450M", "$550M"],
      correctAnswer: "$450M"
    },
    {
      question: "Comparable company trades at 8x EV/EBITDA. Target has EBITDA=$25M, debt=$50M, cash=$10M. Equity value?",
      options: ["$150M", "$160M", "$190M", "$200M"],
      correctAnswer: "$160M"
    },

    // Portfolio Theory
    {
      question: "Two assets: r1=10%, σ1=15%; r2=8%, σ2=10%; correlation=0. Portfolio 50/50, expected return?",
      options: ["8%", "9%", "10%", "12%"],
      correctAnswer: "9%"
    },
    {
      question: "If portfolio volatility is 12% and market volatility is 15%, R²=0.64, what's tracking error?",
      options: ["3%", "6%", "9%", "12%"],
      correctAnswer: "9%"
    },
    {
      question: "Capital Market Line slope (Sharpe ratio) is 0.4. Risk-free=2%, market σ=15%. Market return?",
      options: ["6%", "7%", "8%", "10%"],
      correctAnswer: "8%"
    },
    {
      question: "Minimum variance portfolio with assets A(σ=20%) and B(σ=30%), correlation=0.3. Weight in A?",
      options: ["~65%", "~75%", "~85%", "50%"],
      correctAnswer: "~75%"
    },

    // Derivatives Advanced
    {
      question: "Black-Scholes assumes:",
      options: ["Constant volatility", "Jumps in price", "Changing interest rates", "Dividends paid"],
      correctAnswer: "Constant volatility"
    },
    {
      question: "Put-call parity: C - P = ?",
      options: ["S - PV(K)", "K - S", "S + K", "PV(dividend)"],
      correctAnswer: "S - PV(K)"
    },
    {
      question: "If implied volatility > historical volatility, options are likely:",
      options: ["Underpriced", "Overpriced", "Fairly priced", "Unrelated"],
      correctAnswer: "Overpriced"
    },
    {
      question: "Delta hedging requires rebalancing because of:",
      options: ["Theta", "Vega", "Gamma", "Rho"],
      correctAnswer: "Gamma"
    },
    {
      question: "A calendar spread profits from:",
      options: ["Directional movement", "Time decay differential", "Volatility increase", "Interest rates"],
      correctAnswer: "Time decay differential"
    },

    // Risk Management
    {
      question: "VaR at 95% confidence of $1M means:",
      options: ["Max loss is $1M", "5% chance of losing >$1M", "95% return probability", "Average loss $1M"],
      correctAnswer: "5% chance of losing >$1M"
    },
    {
      question: "If Sortino ratio is 1.5 and downside deviation is 8%, excess return?",
      options: ["8%", "10%", "12%", "15%"],
      correctAnswer: "12%"
    },
    {
      question: "Maximum drawdown of 30% means portfolio peak to trough:",
      options: ["Fell 30%", "Rose 30%", "Volatility 30%", "Return -30% annually"],
      correctAnswer: "Fell 30%"
    },
    {
      question: "If portfolio beta is 1.3, market drops 10%, expected portfolio change?",
      options: ["-8%", "-10%", "-13%", "-15%"],
      correctAnswer: "-13%"
    },

    // Corporate Finance
    {
      question: "WACC formula weighs:",
      options: ["Only equity cost", "Only debt cost", "Cost of equity and after-tax debt", "Revenue and expenses"],
      correctAnswer: "Cost of equity and after-tax debt"
    },
    {
      question: "If tax rate is 30% and pre-tax cost of debt is 8%, after-tax cost?",
      options: ["5.2%", "5.6%", "6.0%", "8.0%"],
      correctAnswer: "5.6%"
    },
    {
      question: "Modigliani-Miller (no taxes) states leverage affects:",
      options: ["Firm value", "Cost of equity only", "WACC", "None - irrelevant"],
      correctAnswer: "None - irrelevant"
    },
    {
      question: "Pecking order theory suggests companies prefer:",
      options: ["Equity first", "Debt first", "Internal financing first", "Random"],
      correctAnswer: "Internal financing first"
    },

    // Behavioral Finance
    {
      question: "Anchoring bias causes investors to:",
      options: ["Diversify properly", "Rely too heavily on first information", "Follow trends", "Avoid risk"],
      correctAnswer: "Rely too heavily on first information"
    },
    {
      question: "Disposition effect means investors tend to:",
      options: ["Sell winners too early, hold losers too long", "Buy high sell low", "Overtrade", "Never sell"],
      correctAnswer: "Sell winners too early, hold losers too long"
    },
    {
      question: "Herding behavior in markets leads to:",
      options: ["Efficient pricing", "Asset bubbles and crashes", "Perfect diversification", "Zero returns"],
      correctAnswer: "Asset bubbles and crashes"
    },

    // Cryptocurrency Specific
    {
      question: "Bitcoin halving reduces block rewards by what factor?",
      options: ["10%", "25%", "50%", "75%"],
      correctAnswer: "50%"
    },
    {
      question: "Ethereum's consensus mechanism (post-merge) is:",
      options: ["Proof of Work", "Proof of Stake", "Proof of Authority", "Delegated PoS"],
      correctAnswer: "Proof of Stake"
    },
    {
      question: "If gas price is 50 gwei and transaction uses 21,000 gas, cost in ETH (1 gwei = 10^-9 ETH)?",
      options: ["0.00105 ETH", "0.0105 ETH", "0.105 ETH", "1.05 ETH"],
      correctAnswer: "0.00105 ETH"
    },
    {
      question: "Total Value Locked (TVL) in DeFi measures:",
      options: ["Total crypto market cap", "Assets deposited in protocols", "Trading volume", "Number of users"],
      correctAnswer: "Assets deposited in protocols"
    },
    {
      question: "Impermanent loss occurs when:",
      options: ["Token price stable", "Providing liquidity and price diverges", "Holding tokens", "Staking rewards"],
      correctAnswer: "Providing liquidity and price diverges"
    },

    // Market Microstructure
    {
      question: "Payment for order flow means:",
      options: ["Broker pays exchange", "Market maker pays broker", "Investor pays premium", "SEC fee"],
      correctAnswer: "Market maker pays broker"
    },
    {
      question: "Dark pools are used to:",
      options: ["Illegal trading", "Execute large orders without market impact", "After-hours trading", "Hide losses"],
      correctAnswer: "Execute large orders without market impact"
    },
    {
      question: "If bid size is 500 and ask size is 200, market is:",
      options: ["Perfectly liquid", "Buying pressure stronger", "Selling pressure stronger", "Cannot determine"],
      correctAnswer: "Buying pressure stronger"
    },

    // Quantitative Finance
    {
      question: "Monte Carlo simulation uses:",
      options: ["Historical data only", "Random sampling", "Linear regression", "Fixed formulas"],
      correctAnswer: "Random sampling"
    },
    {
      question: "Mean reversion strategy assumes:",
      options: ["Trends continue", "Prices return to average", "Volatility clusters", "Momentum persists"],
      correctAnswer: "Prices return to average"
    },
    {
      question: "Autocorrelation in returns violates:",
      options: ["Efficient market hypothesis", "CAPM", "Diversification", "Liquidity"],
      correctAnswer: "Efficient market hypothesis"
    },
    {
      question: "If Calmar ratio is 2.0 and max drawdown is 15%, annual return?",
      options: ["15%", "20%", "30%", "40%"],
      correctAnswer: "30%"
    }
  ];

  const fallbacks = [
    {
      question: "If a stock rises from $50 to $65, what is the percentage gain?",
      options: ["15%", "20%", "25%", "30%"],
      correctAnswer: "30%"
    },
    {
      question: "A company reports revenue of $500M and net income of $50M. What is the profit margin?",
      options: ["5%", "10%", "15%", "20%"],
      correctAnswer: "10%"
    },
    {
      question: "What is a mutual fund?",
      options: ["Single stock investment", "Pooled money from many investors", "Government bond", "Cryptocurrency"],
      correctAnswer: "Pooled money from many investors"
    },
    {
      question: "If a stock's price is $120 and annual dividend is $6, what's the dividend yield?",
      options: ["3%", "4%", "5%", "6%"],
      correctAnswer: "5%"
    },
    {
      question: "What does 'bid' price represent?",
      options: ["Price seller asks", "Price buyer offers", "Average price", "Closing price"],
      correctAnswer: "Price buyer offers"
    },
    {
      question: "A company has $100M assets and $60M liabilities. What's the equity?",
      options: ["$160M", "$100M", "$60M", "$40M"],
      correctAnswer: "$40M"
    },
    {
      question: "What is a bull put spread?",
      options: ["Bearish strategy", "Neutral strategy", "Bullish credit spread", "Long volatility play"],
      correctAnswer: "Bullish credit spread"
    },
    {
      question: "If you invest $10,000 and it grows to $13,000 in 2 years, what's the annualized return?",
      options: ["10%", "14.02%", "15%", "20%"],
      correctAnswer: "14.02%"
    },
    {
      question: "What is theta in options trading?",
      options: ["Price sensitivity", "Time decay", "Volatility measure", "Delta hedge ratio"],
      correctAnswer: "Time decay"
    },
    {
      question: "A stock has earnings of $5/share and pays $2 dividend. What's the payout ratio?",
      options: ["20%", "30%", "40%", "50%"],
      correctAnswer: "40%"
    },
    {
      question: "What is the primary difference between ETF and mutual fund?",
      options: ["ETFs trade like stocks, mutual funds don't", "Mutual funds are safer", "ETFs have no fees", "No difference"],
      correctAnswer: "ETFs trade like stocks, mutual funds don't"
    },
    {
      question: "If inflation is 3% and your investment returns 5%, what's your real return?",
      options: ["1%", "2%", "3%", "8%"],
      correctAnswer: "2%"
    },
    {
      question: "What does a high Sortino ratio indicate?",
      options: ["High volatility", "Good downside risk-adjusted returns", "Low returns", "High fees"],
      correctAnswer: "Good downside risk-adjusted returns"
    },
    {
      question: "A stock at $50 drops to $40, then rises to $50. What's the percentage gain from $40?",
      options: ["20%", "25%", "30%", "40%"],
      correctAnswer: "25%"
    },
    {
      question: "What is vega in options pricing?",
      options: ["Time sensitivity", "Price sensitivity", "Volatility sensitivity", "Interest rate sensitivity"],
      correctAnswer: "Volatility sensitivity"
    },
    {
      question: "If a company's operating margin is 20% and revenue is $1B, what's operating income?",
      options: ["$100M", "$200M", "$300M", "$400M"],
      correctAnswer: "$200M"
    },
    {
      question: "What is a straddle strategy?",
      options: ["Buying call and put at same strike", "Selling covered calls", "Hedging with futures", "Dollar cost averaging"],
      correctAnswer: "Buying call and put at same strike"
    },
    {
      question: "A bond with 5% coupon and $1000 face value pays how much annually?",
      options: ["$25", "$50", "$75", "$100"],
      correctAnswer: "$50"
    },
    {
      question: "What is the efficient market hypothesis?",
      options: ["Markets are always correct", "All info is reflected in prices", "Technical analysis works", "Day trading is profitable"],
      correctAnswer: "All info is reflected in prices"
    },
    {
      question: "If a stock's PE is 25 and industry average is 15, the stock is:",
      options: ["Undervalued", "Fairly valued", "Overvalued relative to peers", "Cannot determine"],
      correctAnswer: "Overvalued relative to peers"
    },
    {
      question: "What does P/E ratio measure?",
      options: ["Profit to Earnings", "Price to Earnings", "Performance to Equity", "Portfolio to Expense"],
      correctAnswer: "Price to Earnings"
    },
    {
      question: "A portfolio worth $10,000 drops 20%. What is its new value?",
      options: ["$8,000", "$8,500", "$7,500", "$9,000"],
      correctAnswer: "$8,000"
    },
    {
      question: "What is a bull market?",
      options: ["Market trending upward", "Market trending downward", "Flat market", "Volatile market"],
      correctAnswer: "Market trending upward"
    },
    {
      question: "If you buy 100 shares at $25 and sell at $30, what's your profit?",
      options: ["$300", "$400", "$500", "$600"],
      correctAnswer: "$500"
    },
    {
      question: "What does IPO stand for?",
      options: ["Initial Public Offering", "International Portfolio Option", "Investor Profit Output", "Index Price Outlook"],
      correctAnswer: "Initial Public Offering"
    },
    {
      question: "A stock trading at $40 with a dividend of $2 has what yield?",
      options: ["3%", "4%", "5%", "6%"],
      correctAnswer: "5%"
    },
    {
      question: "What is market capitalization?",
      options: ["Total company debt", "Share price × outstanding shares", "Annual revenue", "Total assets"],
      correctAnswer: "Share price × outstanding shares"
    },
    {
      question: "If ROI is 25% on a $4,000 investment, what's the profit?",
      options: ["$800", "$1,000", "$1,200", "$1,500"],
      correctAnswer: "$1,000"
    },
    {
      question: "What is a bearish trend?",
      options: ["Rising prices", "Falling prices", "Stable prices", "Unpredictable prices"],
      correctAnswer: "Falling prices"
    },
    {
      question: "Diversification means spreading investments across:",
      options: ["Different asset types", "Only tech stocks", "Single industry", "One company"],
      correctAnswer: "Different asset types"
    },
    {
      question: "What does EPS measure?",
      options: ["Earnings Per Share", "Equity Per Stock", "Expected Price Surge", "Exchange Position Status"],
      correctAnswer: "Earnings Per Share"
    },
    {
      question: "A stop-loss order protects against:",
      options: ["Excessive gains", "Excessive losses", "Tax penalties", "Market closure"],
      correctAnswer: "Excessive losses"
    },
    {
      question: "Beta measures a stock's:",
      options: ["Dividend yield", "Volatility vs market", "Total volume", "Trading frequency"],
      correctAnswer: "Volatility vs market"
    },
    {
      question: "What is short selling?",
      options: ["Selling borrowed shares", "Quick day trades", "Selling at low price", "Short-term holdings"],
      correctAnswer: "Selling borrowed shares"
    },
    {
      question: "If a stock's P/E ratio is 20 and EPS is $5, what's the price?",
      options: ["$80", "$90", "$100", "$110"],
      correctAnswer: "$100"
    },
    {
      question: "What is dollar-cost averaging?",
      options: ["Investing fixed amounts regularly", "Buying only low prices", "Selling at peaks", "Trading currencies"],
      correctAnswer: "Investing fixed amounts regularly"
    },
    {
      question: "A stock splits 2-for-1. You own 50 shares at $100. New holding?",
      options: ["50 shares at $100", "100 shares at $50", "100 shares at $100", "50 shares at $50"],
      correctAnswer: "100 shares at $50"
    },
    {
      question: "What indicates a company's liquidity?",
      options: ["P/E ratio", "Current ratio", "Beta", "Market cap"],
      correctAnswer: "Current ratio"
    },
    {
      question: "Margin trading means:",
      options: ["Trading with borrowed funds", "Trading extra shares", "Trading at market edge", "Trading minimal amounts"],
      correctAnswer: "Trading with borrowed funds"
    },
    {
      question: "What is the Sharpe Ratio used to measure?",
      options: ["Stock volatility only", "Risk-adjusted returns", "Company size", "Trading volume"],
      correctAnswer: "Risk-adjusted returns"
    },
    {
      question: "If a company has a debt-to-equity ratio of 0.5, what does this mean?",
      options: ["Debt is half of equity", "Debt equals equity", "Debt is double equity", "Company has no debt"],
      correctAnswer: "Debt is half of equity"
    },
    {
      question: "A call option gives you the right to:",
      options: ["Sell at strike price", "Buy at strike price", "Borrow shares", "Hedge losses only"],
      correctAnswer: "Buy at strike price"
    },
    {
      question: "What does RSI (Relative Strength Index) indicate above 70?",
      options: ["Oversold condition", "Overbought condition", "Neutral market", "Low volatility"],
      correctAnswer: "Overbought condition"
    },
    {
      question: "Book value per share is calculated as:",
      options: ["Assets ÷ Shares", "(Assets - Liabilities) ÷ Shares", "Revenue ÷ Shares", "Profit ÷ Shares"],
      correctAnswer: "(Assets - Liabilities) ÷ Shares"
    },
    {
      question: "A stock with a beta of 1.5 is:",
      options: ["50% less volatile than market", "50% more volatile than market", "Same volatility as market", "Not correlated to market"],
      correctAnswer: "50% more volatile than market"
    },
    {
      question: "What is the primary purpose of a dividend reinvestment plan (DRIP)?",
      options: ["Increase trading fees", "Automatically buy more shares", "Sell dividends", "Hedge positions"],
      correctAnswer: "Automatically buy more shares"
    },
    {
      question: "A company's quick ratio excludes which asset?",
      options: ["Cash", "Accounts receivable", "Inventory", "Short-term investments"],
      correctAnswer: "Inventory"
    },
    {
      question: "What does a 52-week high represent?",
      options: ["Highest price in past year", "Yearly average price", "Predicted future price", "Dividend payment"],
      correctAnswer: "Highest price in past year"
    },
    {
      question: "If a stock pays $3 annual dividend and trades at $60, what's the yield?",
      options: ["3%", "4%", "5%", "6%"],
      correctAnswer: "5%"
    },
    {
      question: "A reverse stock split 1-for-4 means:",
      options: ["4 old shares become 1 new share", "1 old share becomes 4 new shares", "Price drops 75%", "Dividends quadruple"],
      correctAnswer: "4 old shares become 1 new share"
    },
    {
      question: "What does VIX measure?",
      options: ["Volume Index", "Market volatility expectation", "Dividend yield", "Trading velocity"],
      correctAnswer: "Market volatility expectation"
    },
    {
      question: "A covered call strategy involves:",
      options: ["Owning stock and selling call options", "Buying calls without stock", "Selling naked options", "Trading futures"],
      correctAnswer: "Owning stock and selling call options"
    },
    {
      question: "What is the breakeven point for a stock bought at $80 with $5 commission?",
      options: ["$80", "$85", "$75", "$80.50"],
      correctAnswer: "$85"
    },
    {
      question: "EBITDA stands for:",
      options: ["Equity Before Interest Tax Debt Amortization", "Earnings Before Interest Taxes Depreciation Amortization", "Estimated Business Income Total Deposits Assets", "Exchange Board International Trading Data Analysis"],
      correctAnswer: "Earnings Before Interest Taxes Depreciation Amortization"
    },
    {
      question: "A golden cross pattern occurs when:",
      options: ["50-day MA crosses above 200-day MA", "Price hits all-time high", "Volume doubles", "RSI reaches 50"],
      correctAnswer: "50-day MA crosses above 200-day MA"
    },
    {
      question: "Sector rotation strategy involves:",
      options: ["Staying in one sector", "Moving between sectors based on economic cycle", "Random trading", "Only tech stocks"],
      correctAnswer: "Moving between sectors based on economic cycle"
    },
    {
      question: "What is a REIT?",
      options: ["Real Estate Investment Trust", "Retail Equity Index Trade", "Regional Economic Investment Tool", "Regulated Exchange Interest Transfer"],
      correctAnswer: "Real Estate Investment Trust"
    },
    {
      question: "If a stock has a PEG ratio below 1, it suggests:",
      options: ["Overvalued", "Undervalued relative to growth", "High risk", "No growth potential"],
      correctAnswer: "Undervalued relative to growth"
    },
    {
      question: "The ex-dividend date is when:",
      options: ["Dividend is paid", "Stock trades without dividend", "Dividend is announced", "Company goes bankrupt"],
      correctAnswer: "Stock trades without dividend"
    },
    {
      question: "A protective put is used to:",
      options: ["Maximize gains", "Protect against downside", "Increase leverage", "Day trade"],
      correctAnswer: "Protect against downside"
    },
    {
      question: "What does it mean when a stock is 'in the money'?",
      options: ["Option has intrinsic value", "Company is profitable", "High trading volume", "Dividend increased"],
      correctAnswer: "Option has intrinsic value"
    },
    {
      question: "Free cash flow is calculated as:",
      options: ["Revenue - Expenses", "Operating Cash Flow - Capital Expenditures", "Assets - Liabilities", "Profit + Depreciation"],
      correctAnswer: "Operating Cash Flow - Capital Expenditures"
    },
    {
      question: "A stock's alpha measures:",
      options: ["Total return", "Excess return vs benchmark", "Volatility", "Dividend yield"],
      correctAnswer: "Excess return vs benchmark"
    },
    {
      question: "What is a limit order?",
      options: ["Buy/sell at market price", "Buy/sell at specific price or better", "Stop trading at loss", "Cancel all orders"],
      correctAnswer: "Buy/sell at specific price or better"
    },
    {
      question: "What is arbitrage?",
      options: ["High risk trading", "Exploiting price differences", "Long-term investing", "Options strategy"],
      correctAnswer: "Exploiting price differences"
    },
    {
      question: "A company with $200M market cap and 10M shares outstanding has what share price?",
      options: ["$10", "$15", "$20", "$25"],
      correctAnswer: "$20"
    },
    {
      question: "What is gamma in options?",
      options: ["Rate of delta change", "Time decay rate", "Volatility measure", "Price sensitivity"],
      correctAnswer: "Rate of delta change"
    },
    {
      question: "If ROE is 15% and equity multiplier is 2, what's ROA?",
      options: ["5%", "7.5%", "15%", "30%"],
      correctAnswer: "7.5%"
    },
    {
      question: "What is contango in futures?",
      options: ["Futures price below spot", "Futures price above spot", "No price difference", "Market crash"],
      correctAnswer: "Futures price above spot"
    },
    {
      question: "A collar strategy combines:",
      options: ["Long stock, long put, short call", "Two calls", "Two puts", "Stock and bond"],
      correctAnswer: "Long stock, long put, short call"
    },
    {
      question: "What does a debt service coverage ratio of 2.0 mean?",
      options: ["Income is 2x debt payments", "Debt is double income", "2 years to pay debt", "20% interest rate"],
      correctAnswer: "Income is 2x debt payments"
    },
    {
      question: "If you short 100 shares at $80 and cover at $60, what's your profit?",
      options: ["$1,000", "$1,500", "$2,000", "$2,500"],
      correctAnswer: "$2,000"
    },
    {
      question: "What is the put-call ratio used for?",
      options: ["Calculating profits", "Market sentiment indicator", "Pricing options", "Tax calculations"],
      correctAnswer: "Market sentiment indicator"
    },
    {
      question: "A stock's 200-day moving average is a:",
      options: ["Short-term indicator", "Long-term trend indicator", "Volume measure", "Volatility index"],
      correctAnswer: "Long-term trend indicator"
    },
    {
      question: "What is basis risk?",
      options: ["Default risk", "Interest rate risk", "Hedge imperfection risk", "Market crash risk"],
      correctAnswer: "Hedge imperfection risk"
    },
    {
      question: "If a company's asset turnover is 1.5 and revenue is $300M, what are total assets?",
      options: ["$150M", "$200M", "$250M", "$300M"],
      correctAnswer: "$200M"
    },
    {
      question: "What is a iron condor?",
      options: ["Single option trade", "Four-leg options strategy", "Stock split", "Bond strategy"],
      correctAnswer: "Four-leg options strategy"
    },
    {
      question: "If a stock has a correlation of -0.8 with market, it is:",
      options: ["Strongly positively correlated", "Weakly correlated", "Strongly negatively correlated", "Uncorrelated"],
      correctAnswer: "Strongly negatively correlated"
    },
    {
      question: "What is a butterfly spread?",
      options: ["Vertical spread", "Three-strike options strategy", "Day trading method", "Portfolio rebalancing"],
      correctAnswer: "Three-strike options strategy"
    },
    {
      question: "If interest coverage ratio is 5, EBIT is how many times interest expense?",
      options: ["2x", "3x", "5x", "10x"],
      correctAnswer: "5x"
    },
    {
      question: "What is the Treynor ratio?",
      options: ["Total return / risk", "Excess return / beta", "Price / earnings", "Dividend / price"],
      correctAnswer: "Excess return / beta"
    },
    {
      question: "A backwardation market means:",
      options: ["Spot price above futures", "Futures above spot", "Market collapse", "High volatility"],
      correctAnswer: "Spot price above futures"
    },
    {
      question: "What is mark-to-market?",
      options: ["Marketing strategy", "Daily valuation at market prices", "Technical indicator", "Tax method"],
      correctAnswer: "Daily valuation at market prices"
    },
    {
      question: "If working capital is $500K and current liabilities are $300K, what are current assets?",
      options: ["$200K", "$500K", "$800K", "$1M"],
      correctAnswer: "$800K"
    },
    {
      question: "What is a credit default swap (CDS)?",
      options: ["Insurance against bond default", "Type of stock option", "Currency exchange", "Mutual fund"],
      correctAnswer: "Insurance against bond default"
    },
    {
      question: "If a portfolio has a standard deviation of 15% and expected return of 12%, what's the coefficient of variation?",
      options: ["0.8", "1.25", "1.5", "2.0"],
      correctAnswer: "1.25"
    },
    {
      question: "What does negative working capital indicate?",
      options: ["Company is bankrupt", "Current liabilities exceed current assets", "High profitability", "Strong cash position"],
      correctAnswer: "Current liabilities exceed current assets"
    },
    {
      question: "A company with $50M EBIT and $10M interest has what times interest earned?",
      options: ["2x", "3x", "5x", "10x"],
      correctAnswer: "5x"
    },
    {
      question: "What is slippage in trading?",
      options: ["Tax on profits", "Difference between expected and actual execution price", "Stock dividend", "Account fees"],
      correctAnswer: "Difference between expected and actual execution price"
    },
    {
      question: "If you invest $5,000 at 8% annually for 3 years with compound interest, final value?",
      options: ["$5,800", "$6,200", "$6,299", "$6,500"],
      correctAnswer: "$6,299"
    },
    {
      question: "What is a SPAC?",
      options: ["Special Purpose Acquisition Company", "Stock Performance Analysis Chart", "Standardized Portfolio Asset Class", "Securities Protection Advisory Council"],
      correctAnswer: "Special Purpose Acquisition Company"
    },
    {
      question: "A stock's implied volatility is 40%. What does this suggest?",
      options: ["Stock is stable", "Market expects large price movements", "Low trading volume", "High dividends"],
      correctAnswer: "Market expects large price movements"
    },
    {
      question: "What is the Gordon Growth Model used for?",
      options: ["Valuing stocks with constant dividend growth", "Predicting market crashes", "Calculating beta", "Measuring volatility"],
      correctAnswer: "Valuing stocks with constant dividend growth"
    },
    {
      question: "If a stock's bid is $49.90 and ask is $50.10, what's the bid-ask spread?",
      options: ["$0.10", "$0.20", "$0.50", "$1.00"],
      correctAnswer: "$0.20"
    },
    {
      question: "What is a wash sale?",
      options: ["Selling at profit", "Selling and repurchasing within 30 days", "Company liquidation", "IPO"],
      correctAnswer: "Selling and repurchasing within 30 days"
    },
    {
      question: "A company's inventory turnover is 8. What does this mean?",
      options: ["Inventory sold 8 times per year", "8% profit margin", "8 day holding period", "8 million inventory"],
      correctAnswer: "Inventory sold 8 times per year"
    },
    {
      question: "What is kurtosis in statistics?",
      options: ["Average return", "Measure of tail risk", "Price momentum", "Volume indicator"],
      correctAnswer: "Measure of tail risk"
    },
    {
      question: "If a company pays out 40% of earnings as dividends, what's the retention ratio?",
      options: ["40%", "50%", "60%", "100%"],
      correctAnswer: "60%"
    },
    {
      question: "What is a zero-coupon bond?",
      options: ["Bond with variable interest", "Bond with no periodic interest payments", "Worthless bond", "Corporate bond"],
      correctAnswer: "Bond with no periodic interest payments"
    },
    {
      question: "A stock option with 30 days to expiration has how much time value vs intrinsic value?",
      options: ["All intrinsic", "All time value", "Mix of both depending on moneyness", "Neither"],
      correctAnswer: "Mix of both depending on moneyness"
    },
    {
      question: "What is the Altman Z-score used to predict?",
      options: ["Stock returns", "Bankruptcy probability", "Dividend growth", "Market volatility"],
      correctAnswer: "Bankruptcy probability"
    },
    {
      question: "If GDP grows 3% and inflation is 2%, what's real GDP growth?",
      options: ["1%", "2%", "3%", "5%"],
      correctAnswer: "1%"
    },
    {
      question: "What is convexity in bond pricing?",
      options: ["Straight-line price change", "Curvature of price-yield relationship", "Default risk", "Maturity date"],
      correctAnswer: "Curvature of price-yield relationship"
    },
    {
      question: "A merger arbitrage strategy profits from:",
      options: ["Market crashes", "Price differences in merger deals", "High dividends", "IPO gains"],
      correctAnswer: "Price differences in merger deals"
    },
    {
      question: "What is the Herfindahl index?",
      options: ["Stock valuation metric", "Market concentration measure", "Bond rating", "Volatility index"],
      correctAnswer: "Market concentration measure"
    },
    {
      question: "If a company's gross margin is 60% and operating margin is 20%, what percentage goes to operating expenses?",
      options: ["20%", "30%", "40%", "60%"],
      correctAnswer: "40%"
    },
    {
      question: "What is pairs trading?",
      options: ["Trading two stocks", "Long one stock, short correlated stock", "Buying pairs of options", "Married put strategy"],
      correctAnswer: "Long one stock, short correlated stock"
    },
    {
      question: "A bond with 10 year maturity and 5% coupon trading at par has what yield?",
      options: ["3%", "5%", "7%", "10%"],
      correctAnswer: "5%"
    },
    {
      question: "What is the January effect?",
      options: ["Year-end tax selling", "Small caps outperform in January", "Market always crashes", "Dividend season"],
      correctAnswer: "Small caps outperform in January"
    },
    {
      question: "If a stock has a 3-year beta of 1.2 and market returns 10%, expected stock return?",
      options: ["10%", "12%", "Depends on risk-free rate", "15%"],
      correctAnswer: "Depends on risk-free rate"
    },
    {
      question: "What is tangible book value?",
      options: ["Total assets", "Book value minus intangibles", "Market value", "Revenue minus costs"],
      correctAnswer: "Book value minus intangibles"
    },
    {
      question: "A synthetic long stock position consists of:",
      options: ["Long call, short put at same strike", "Two long calls", "Long stock and put", "Short call, long put"],
      correctAnswer: "Long call, short put at same strike"
    },
    {
      question: "What is the momentum factor in factor investing?",
      options: ["Stocks that have risen tend to continue", "Value stocks", "Low volatility", "High dividends"],
      correctAnswer: "Stocks that have risen tend to continue"
    },
    {
      question: "If a hedge fund charges 2 and 20, what does this mean?",
      options: ["2% return, 20% risk", "2% management fee, 20% performance fee", "2 year lockup, 20% penalty", "20% max drawdown"],
      correctAnswer: "2% management fee, 20% performance fee"
    },
    {
      question: "What is duration in fixed income?",
      options: ["Time to maturity", "Price sensitivity to interest rate changes", "Credit rating", "Coupon frequency"],
      correctAnswer: "Price sensitivity to interest rate changes"
    },
    {
      question: "A company with negative free cash flow is:",
      options: ["Always bankrupt", "Spending more on capex than generating from operations", "Highly profitable", "Tax efficient"],
      correctAnswer: "Spending more on capex than generating from operations"
    },
    {
      question: "What is front-running?",
      options: ["Leading the market", "Trading ahead of client orders illegally", "Fast execution", "Day trading"],
      correctAnswer: "Trading ahead of client orders illegally"
    },
    {
      question: "If a portfolio has 3 stocks with equal weights and correlations of 0.5, what's the diversification benefit?",
      options: ["None", "Moderate reduction in volatility", "Eliminates all risk", "Doubles returns"],
      correctAnswer: "Moderate reduction in volatility"
    },
    {
      question: "What is the information ratio?",
      options: ["Total return", "Excess return per unit of tracking error", "Price to book", "Dividend yield"],
      correctAnswer: "Excess return per unit of tracking error"
    },
    {
      question: "A callable bond benefits the issuer when:",
      options: ["Rates rise", "Rates fall", "Stock crashes", "Market is flat"],
      correctAnswer: "Rates fall"
    },
    {
      question: "What is the equity risk premium?",
      options: ["Stock price volatility", "Expected return of stocks over risk-free rate", "Dividend yield", "Beta measure"],
      correctAnswer: "Expected return of stocks over risk-free rate"
    },
    {
      question: "If a convertible bond can convert to 50 shares and stock is at $25, what's the conversion value?",
      options: ["$500", "$1,000", "$1,250", "$2,000"],
      correctAnswer: "$1,250"
    },
    {
      question: "What is a circuit breaker in trading?",
      options: ["Trading strategy", "Automatic halt on extreme moves", "Tax rule", "Settlement system"],
      correctAnswer: "Automatic halt on extreme moves"
    },
    {
      question: "A company with high financial leverage is more sensitive to:",
      options: ["Dividend changes", "Operating income changes", "Market share", "Currency risk"],
      correctAnswer: "Operating income changes"
    }
  ];

  const masterQuestions = [
    // Machine Learning in Trading
    {
      question: "Overfitting in trading models means:",
      options: ["Model works perfectly", "Model captures noise instead of signal", "Model is too simple", "High accuracy guaranteed"],
      correctAnswer: "Model captures noise instead of signal"
    },
    {
      question: "Walk-forward optimization tests:",
      options: ["Historical data only", "Out-of-sample performance", "In-sample fit", "Random data"],
      correctAnswer: "Out-of-sample performance"
    },
    {
      question: "Reinforcement learning in trading uses:",
      options: ["Supervised labels", "Reward signals from profits/losses", "Fixed rules", "No data"],
      correctAnswer: "Reward signals from profits/losses"
    },
    {
      question: "Feature engineering in quant trading involves:",
      options: ["Buying features", "Creating predictive variables from raw data", "Trading features", "Deleting data"],
      correctAnswer: "Creating predictive variables from raw data"
    },
    {
      question: "Cross-validation prevents:",
      options: ["Losses", "Overfitting", "Trading", "Volatility"],
      correctAnswer: "Overfitting"
    },

    // Liquidity & Trading Costs
    {
      question: "Amihud illiquidity ratio measures:",
      options: ["Volume", "Price impact per dollar traded", "Spread", "Depth"],
      correctAnswer: "Price impact per dollar traded"
    },
    {
      question: "Implementation shortfall equals:",
      options: ["Slippage only", "Difference between decision price and execution price", "Commission", "Spread"],
      correctAnswer: "Difference between decision price and execution price"
    },
    {
      question: "Roll's spread estimator uses:",
      options: ["Quoted spreads", "Serial covariance of price changes", "Volume", "Time"],
      correctAnswer: "Serial covariance of price changes"
    },
    {
      question: "Immediacy cost refers to:",
      options: ["Fast execution premium", "Settlement delay", "Transfer fees", "Account opening"],
      correctAnswer: "Fast execution premium"
    },

    // Credit Risk
    {
      question: "Credit spread widens when:",
      options: ["Default risk increases", "Default risk decreases", "Unrelated to risk", "Interest rates fall"],
      correctAnswer: "Default risk increases"
    },
    {
      question: "Recovery rate in default is:",
      options: ["0%", "Percentage of principal recovered", "100%", "Interest rate"],
      correctAnswer: "Percentage of principal recovered"
    },
    {
      question: "Probability of default (PD) × Loss Given Default (LGD) equals:",
      options: ["Expected Loss", "Total Loss", "Recovery Rate", "Credit Spread"],
      correctAnswer: "Expected Loss"
    },
    {
      question: "Merton model treats equity as:",
      options: ["Fixed claim", "Call option on assets", "Put option", "Bond"],
      correctAnswer: "Call option on assets"
    },
    {
      question: "Duration matching immunizes against:",
      options: ["Credit risk", "Interest rate risk", "Equity risk", "FX risk"],
      correctAnswer: "Interest rate risk"
    },

    // ESG & Sustainable Investing
    {
      question: "ESG integration considers:",
      options: ["Returns only", "Environmental, Social, Governance factors", "Technical analysis", "Price momentum"],
      correctAnswer: "Environmental, Social, Governance factors"
    },
    {
      question: "Negative screening excludes:",
      options: ["Low returns", "Companies in certain industries", "Volatile stocks", "Small caps"],
      correctAnswer: "Companies in certain industries"
    },
    {
      question: "Impact investing prioritizes:",
      options: ["Maximum returns", "Measurable social/environmental impact", "Tax benefits", "Liquidity"],
      correctAnswer: "Measurable social/environmental impact"
    },
    {
      question: "Green bonds finance:",
      options: ["Any projects", "Environmental/climate projects", "Fossil fuels", "Real estate"],
      correctAnswer: "Environmental/climate projects"
    },

    // Structured Products
    {
      question: "Principal-protected note guarantees:",
      options: ["Profits", "Return of initial investment", "Dividends", "Liquidity"],
      correctAnswer: "Return of initial investment"
    },
    {
      question: "Reverse convertible offers:",
      options: ["Low yield", "High coupon but downside risk", "Guaranteed returns", "No risk"],
      correctAnswer: "High coupon but downside risk"
    },
    {
      question: "Autocallable note terminates early if:",
      options: ["Price falls", "Price reaches trigger level", "Time passes", "Dividend paid"],
      correctAnswer: "Price reaches trigger level"
    },
    {
      question: "Structured product combines:",
      options: ["Only stocks", "Bonds and derivatives", "Commodities only", "Cash only"],
      correctAnswer: "Bonds and derivatives"
    },

    // Commodity Trading
    {
      question: "Spot-futures parity for commodities includes:",
      options: ["Interest and storage costs", "Only interest", "Only storage", "Neither"],
      correctAnswer: "Interest and storage costs"
    },
    {
      question: "Convenience yield represents:",
      options: ["Interest earned", "Benefit of holding physical commodity", "Tax benefit", "Dividend"],
      correctAnswer: "Benefit of holding physical commodity"
    },
    {
      question: "Oil futures in contango lose value from:",
      options: ["Price increase", "Roll cost", "Geopolitical events", "OPEC decisions"],
      correctAnswer: "Roll cost"
    },
    {
      question: "Gold futures margin requirement reflects:",
      options: ["Full contract value", "Percentage of notional value", "Storage costs", "Insurance"],
      correctAnswer: "Percentage of notional value"
    },

    // Forex Advanced
    {
      question: "Triangular arbitrage exploits:",
      options: ["Time differences", "Cross-rate inconsistencies", "Interest rates", "Inflation"],
      correctAnswer: "Cross-rate inconsistencies"
    },
    {
      question: "Forward points represent:",
      options: ["Profit", "Interest rate differential", "Spot price", "Bid-ask spread"],
      correctAnswer: "Interest rate differential"
    },
    {
      question: "If spot EUR/USD = 1.10 and 1-year forward = 1.08, EUR is at:",
      options: ["Premium", "Discount", "Parity", "Cannot determine"],
      correctAnswer: "Discount"
    },
    {
      question: "Cross-currency swap exchanges:",
      options: ["Stocks", "Principal and interest in different currencies", "Options", "Futures"],
      correctAnswer: "Principal and interest in different currencies"
    },

    // Regulatory & Compliance
    {
      question: "Reg T in US requires:",
      options: ["100% cash", "50% initial margin", "25% margin", "No margin"],
      correctAnswer: "50% initial margin"
    },
    {
      question: "Pattern Day Trader rule requires maintaining:",
      options: ["$10K equity", "$25K equity", "$50K equity", "$100K equity"],
      correctAnswer: "$25K equity"
    },
    {
      question: "Wash sale rule disallows loss if repurchased within:",
      options: ["7 days", "30 days", "60 days", "90 days"],
      correctAnswer: "30 days"
    },
    {
      question: "Short sale uptick rule was:",
      options: ["Never existed", "Required price above previous trade", "Eliminated in 2007", "Still in effect"],
      correctAnswer: "Eliminated in 2007"
    },

    // Volatility Trading
    {
      question: "Realized volatility is calculated from:",
      options: ["Implied vol", "Historical price changes", "Options prices", "VIX"],
      correctAnswer: "Historical price changes"
    },
    {
      question: "Volatility smile indicates:",
      options: ["Constant vol", "OTM options have higher implied vol", "ATM highest vol", "Linear relationship"],
      correctAnswer: "OTM options have higher implied vol"
    },
    {
      question: "Volatility skew shows:",
      options: ["Equal vol across strikes", "Different vol for puts vs calls", "Price direction", "Volume patterns"],
      correctAnswer: "Different vol for puts vs calls"
    },
    {
      question: "VIX futures in contango means:",
      options: ["Spot above futures", "Futures above spot VIX", "Equal prices", "Backwardation"],
      correctAnswer: "Futures above spot VIX"
    },
    {
      question: "Long straddle profits from:",
      options: ["Low volatility", "High volatility movement either direction", "Upward only", "Time decay"],
      correctAnswer: "High volatility movement either direction"
    },
    {
      question: "Short strangle profits from:",
      options: ["Large moves", "Low volatility/range-bound", "Directional bet", "Interest rates"],
      correctAnswer: "Low volatility/range-bound"
    },

    // Market Anomalies
    {
      question: "Weekend effect suggests:",
      options: ["Higher returns Monday", "Lower returns Monday", "No pattern", "Higher volume"],
      correctAnswer: "Lower returns Monday"
    },
    {
      question: "Size premium means:",
      options: ["Large caps outperform", "Small caps outperform historically", "Equal returns", "Caps don't matter"],
      correctAnswer: "Small caps outperform historically"
    },
    {
      question: "Value premium suggests:",
      options: ["Growth beats value", "Value beats growth long-term", "Equal returns", "Momentum dominates"],
      correctAnswer: "Value beats growth long-term"
    },
    {
      question: "Post-earnings announcement drift means:",
      options: ["Random walk", "Price continues moving in earnings surprise direction", "Immediate efficiency", "Reversal"],
      correctAnswer: "Price continues moving in earnings surprise direction"
    },

    // Modern Portfolio Theory Extended
    {
      question: "Security Market Line plots:",
      options: ["Return vs total risk", "Expected return vs beta", "Return vs time", "Price vs volume"],
      correctAnswer: "Expected return vs beta"
    },
    {
      question: "Jensen's alpha measures:",
      options: ["Total return", "Excess return over CAPM prediction", "Volatility", "Correlation"],
      correctAnswer: "Excess return over CAPM prediction"
    },
    {
      question: "Tracking error for index fund measures:",
      options: ["Total risk", "Deviation from benchmark", "Returns", "Costs"],
      correctAnswer: "Deviation from benchmark"
    },
    {
      question: "Risk parity portfolio weights assets by:",
      options: ["Market cap", "Equal dollar amounts", "Inverse volatility (equal risk contribution)", "Returns"],
      correctAnswer: "Inverse volatility (equal risk contribution)"
    },
    {
      question: "Smart beta strategies typically:",
      options: ["Pure passive", "Rule-based factor exposure", "Discretionary active", "Random"],
      correctAnswer: "Rule-based factor exposure"
    },

    // Credit Derivatives
    {
      question: "CDO tranches are structured with:",
      options: ["Equal risk", "Senior, mezzanine, equity with different risks", "Random distribution", "No structure"],
      correctAnswer: "Senior, mezzanine, equity with different risks"
    },
    {
      question: "Synthetic CDO uses:",
      options: ["Actual bonds", "CDS contracts referencing bonds", "Stocks", "Commodities"],
      correctAnswer: "CDS contracts referencing bonds"
    },
    {
      question: "First-to-default basket CDS pays when:",
      options: ["All default", "Any one defaults", "Majority default", "None default"],
      correctAnswer: "Any one defaults"
    },

    // Valuation Multiples Advanced
    {
      question: "EV/Sales multiple is useful when:",
      options: ["Mature profitable companies", "Unprofitable growth companies", "Banks", "Real estate"],
      correctAnswer: "Unprofitable growth companies"
    },
    {
      question: "Price/Book ratio below 1 suggests:",
      options: ["Overvalued", "Trading below net asset value", "Growth premium", "High profitability"],
      correctAnswer: "Trading below net asset value"
    },
    {
      question: "PEG ratio adjusts P/E for:",
      options: ["Size", "Growth rate", "Debt", "Industry"],
      correctAnswer: "Growth rate"
    },
    {
      question: "Price/Cash Flow often preferred to P/E because:",
      options: ["Simpler", "Cash flow less subject to accounting manipulation", "Higher numbers", "Tax benefits"],
      correctAnswer: "Cash flow less subject to accounting manipulation"
    },

    // Merger Arbitrage
    {
      question: "In cash merger, arb spread represents:",
      options: ["Profit guarantee", "Deal risk premium", "Time value", "Interest"],
      correctAnswer: "Deal risk premium"
    },
    {
      question: "Stock-for-stock merger arb involves:",
      options: ["Buying target only", "Long target, short acquirer", "Long both", "Short both"],
      correctAnswer: "Long target, short acquirer"
    },
    {
      question: "Merger spread compression occurs when:",
      options: ["Deal fails", "Deal approval becomes more certain", "Regulators reject", "Market crashes"],
      correctAnswer: "Deal approval becomes more certain"
    },

    // Event-Driven Strategies
    {
      question: "Spinoff typically creates value because:",
      options: ["Tax benefits", "Focused management and forced selling pressure", "Larger size", "Debt reduction"],
      correctAnswer: "Focused management and forced selling pressure"
    },
    {
      question: "Activist investing aims to:",
      options: ["Passive ownership", "Influence management for value creation", "Short-term trading", "Arbitrage"],
      correctAnswer: "Influence management for value creation"
    },
    {
      question: "Distressed debt investors buy:",
      options: ["Safe bonds", "Bonds of troubled/bankrupt companies", "Government bonds", "Investment grade only"],
      correctAnswer: "Bonds of troubled/bankrupt companies"
    },

    // Tax & Accounting
    {
      question: "Long-term capital gains (US) held over:",
      options: ["6 months", "1 year", "2 years", "5 years"],
      correctAnswer: "1 year"
    },
    {
      question: "Tax-loss harvesting involves:",
      options: ["Avoiding taxes", "Selling losers to offset gains", "Tax evasion", "Deferring all taxes"],
      correctAnswer: "Selling losers to offset gains"
    },
    {
      question: "FIFO inventory accounting during inflation shows:",
      options: ["Lower COGS, higher profits", "Higher COGS, lower profits", "No effect", "Random effect"],
      correctAnswer: "Lower COGS, higher profits"
    },
    {
      question: "Mark-to-market accounting values assets at:",
      options: ["Historical cost", "Current market price", "Future value", "Book value"],
      correctAnswer: "Current market price"
    },

    // Interest Rate Products
    {
      question: "Interest rate swap exchanges:",
      options: ["Fixed for floating rate payments", "Currencies", "Stocks", "Commodities"],
      correctAnswer: "Fixed for floating rate payments"
    },
    {
      question: "FRA (Forward Rate Agreement) locks in:",
      options: ["Spot rate", "Future interest rate", "Exchange rate", "Stock price"],
      correctAnswer: "Future interest rate"
    },
    {
      question: "Cap provides protection against:",
      options: ["Falling rates", "Rising rates", "FX risk", "Credit risk"],
      correctAnswer: "Rising rates"
    },
    {
      question: "Swaption gives right to:",
      options: ["Trade swaps", "Enter interest rate swap", "Exchange currencies", "Buy bonds"],
      correctAnswer: "Enter interest rate swap"
    },

    // Financial Engineering
    {
      question: "Collateralized Loan Obligation (CLO) packages:",
      options: ["Mortgages", "Corporate loans", "Credit cards", "Auto loans"],
      correctAnswer: "Corporate loans"
    },
    {
      question: "Mortgage-Backed Security (MBS) has prepayment risk when:",
      options: ["Rates rise", "Rates fall (refinancing)", "Inflation rises", "Economy grows"],
      correctAnswer: "Rates fall (refinancing)"
    },
    {
      question: "Stripped MBS separates:",
      options: ["Principal and interest", "Risk and return", "Time and value", "Debt and equity"],
      correctAnswer: "Principal and interest"
    },

    // Statistical Methods
    {
      question: "Heteroskedasticity means:",
      options: ["Constant variance", "Non-constant variance over time", "Normal distribution", "Zero mean"],
      correctAnswer: "Non-constant variance over time"
    },
    {
      question: "Durbin-Watson test checks for:",
      options: ["Normality", "Autocorrelation in residuals", "Heteroskedasticity", "Multicollinearity"],
      correctAnswer: "Autocorrelation in residuals"
    },
    {
      question: "White test detects:",
      options: ["Autocorrelation", "Heteroskedasticity", "Normality", "Causality"],
      correctAnswer: "Heteroskedasticity"
    },
    {
      question: "Granger causality tests:",
      options: ["True causation", "Predictive ability of one variable for another", "Correlation", "Cointegration"],
      correctAnswer: "Predictive ability of one variable for another"
    },
    {
      question: "Johansen test is used for:",
      options: ["Stationarity", "Cointegration", "Normality", "Autocorrelation"],
      correctAnswer: "Cointegration"
    },
    {
      question: "Augmented Dickey-Fuller tests:",
      options: ["Stationarity/unit root", "Normality", "Heteroskedasticity", "Independence"],
      correctAnswer: "Stationarity/unit root"
    },

    // Central Banking & Monetary Policy
    {
      question: "Quantitative easing involves central bank:",
      options: ["Raising rates", "Buying assets to inject liquidity", "Selling assets", "Increasing reserve requirements"],
      correctAnswer: "Buying assets to inject liquidity"
    },
    {
      question: "Tapering refers to:",
      options: ["Increasing QE", "Reducing QE purchases", "Raising rates", "Currency devaluation"],
      correctAnswer: "Reducing QE purchases"
    },
    {
      question: "Taylor Rule suggests interest rates based on:",
      options: ["Random", "Inflation and output gap", "Stock market", "Unemployment only"],
      correctAnswer: "Inflation and output gap"
    },
    {
      question: "Forward guidance is:",
      options: ["Secret policy", "Central bank communication about future policy", "Technical indicator", "Trading strategy"],
      correctAnswer: "Central bank communication about future policy"
    },
    {
      question: "Negative interest rates aim to:",
      options: ["Increase saving", "Encourage lending and spending", "Reduce inflation", "Strengthen currency"],
      correctAnswer: "Encourage lending and spending"
    },

    // Blockchain & DeFi Advanced
    {
      question: "Layer 2 scaling solutions aim to:",
      options: ["Replace Layer 1", "Increase throughput off main chain", "Add features", "Increase fees"],
      correctAnswer: "Increase throughput off main chain"
    },
    {
      question: "51% attack allows attacker to:",
      options: ["Steal all coins", "Double-spend transactions", "Print unlimited coins", "Shut down network"],
      correctAnswer: "Double-spend transactions"
    },
    {
      question: "Slashing in PoS penalizes validators for:",
      options: ["Low performance", "Malicious behavior/downtime", "High fees", "Profits"],
      correctAnswer: "Malicious behavior/downtime"
    },
    {
      question: "Flash loan must be:",
      options: ["Repaid in same block/transaction", "Long-term", "Collateralized", "Approved by governance"],
      correctAnswer: "Repaid in same block/transaction"
    },
    {
      question: "Yield farming involves:",
      options: ["Agricultural investment", "Providing liquidity for rewards", "Staking only", "Mining"],
      correctAnswer: "Providing liquidity for rewards"
    },
    {
      question: "Liquidity mining rewards:",
      options: ["Miners", "Liquidity providers with governance tokens", "Traders", "Validators"],
      correctAnswer: "Liquidity providers with governance tokens"
    },
    {
      question: "Rug pull in DeFi means:",
      options: ["Legitimate exit", "Developers drain liquidity/exit scam", "Successful project", "Protocol upgrade"],
      correctAnswer: "Developers drain liquidity/exit scam"
    },
    {
      question: "Wrapped token represents:",
      options: ["New coin", "Pegged representation on different chain", "Derivative", "Stablecoin"],
      correctAnswer: "Pegged representation on different chain"
    },
    {
      question: "Oracle problem in smart contracts refers to:",
      options: ["Too much data", "Getting reliable off-chain data on-chain", "Prediction markets", "Price manipulation"],
      correctAnswer: "Getting reliable off-chain data on-chain"
    },
    {
      question: "Composability in DeFi means:",
      options: ["Complex code", "Protocols can interact like Lego blocks", "Isolated systems", "High fees"],
      correctAnswer: "Protocols can interact like Lego blocks"
    },

    // Fixed Income Advanced
    {
      question: "Callable bond has negative convexity at:",
      options: ["All prices", "Low yields when likely to be called", "High yields", "Par value"],
      correctAnswer: "Low yields when likely to be called"
    },
    {
      question: "Option-Adjusted Spread (OAS) removes:",
      options: ["Credit risk", "Embedded option value", "Liquidity premium", "Tax effects"],
      correctAnswer: "Embedded option value"
    },
    {
      question: "Yield curve inversion often precedes:",
      options: ["Bull market", "Economic recession", "Inflation spike", "Currency crisis"],
      correctAnswer: "Economic recession"
    },
    {
      question: "Barbell strategy in bonds involves:",
      options: ["All intermediate maturity", "Short and long maturities, avoiding intermediate", "Only short", "Only long"],
      correctAnswer: "Short and long maturities, avoiding intermediate"
    },
    {
      question: "Bullet strategy concentrates holdings in:",
      options: ["Short term", "Single maturity range", "Long term", "Across all maturities"],
      correctAnswer: "Single maturity range"
    },

    // Systematic Trading
    {
      question: "Momentum strategy buys:",
      options: ["Losers", "Recent winners", "Random stocks", "Value stocks"],
      correctAnswer: "Recent winners"
    },
    {
      question: "Contrarian strategy assumes:",
      options: ["Trends persist", "Reversals after extremes", "Random walk", "Efficient markets"],
      correctAnswer: "Reversals after extremes"
    },
    {
      question: "CTA (Commodity Trading Advisor) typically uses:",
      options: ["Fundamental analysis", "Trend-following systems", "Buy and hold", "Arbitrage only"],
      correctAnswer: "Trend-following systems"
    },
    {
      question: "Stat arb exploits:",
      options: ["News", "Statistical relationships between securities", "Insider info", "Technical patterns"],
      correctAnswer: "Statistical relationships between securities"
    },

    // Performance Attribution
    {
      question: "Brinson attribution decomposes returns into:",
      options: ["Luck and skill", "Allocation and selection effects", "Alpha and beta", "Systematic and idiosyncratic"],
      correctAnswer: "Allocation and selection effects"
    },
    {
      question: "Asset allocation explains what % of portfolio return variance?",
      options: ["~30%", "~50%", "~90%", "~10%"],
      correctAnswer: "~90%"
    },

    // Advanced Metrics
    {
      question: "Sterling ratio uses:",
      options: ["Total return / volatility", "Return / average drawdown", "Sharpe ratio", "Beta"],
      correctAnswer: "Return / average drawdown"
    },
    {
      question: "Omega ratio considers:",
      options: ["Only mean and variance", "Entire return distribution", "Beta only", "Correlation"],
      correctAnswer: "Entire return distribution"
    },
    {
      question: "Maximum Adverse Excursion (MAE) measures:",
      options: ["Best profit", "Worst drawdown during trade", "Average return", "Volatility"],
      correctAnswer: "Worst drawdown during trade"
    },
    {
      question: "Ulcer Index measures:",
      options: ["Upside volatility", "Depth and duration of drawdowns", "Returns", "Correlation"],
      correctAnswer: "Depth and duration of drawdowns"
    },

    // Trading Psychology & Biases
    {
      question: "Confirmation bias leads traders to:",
      options: ["Diversify", "Seek information confirming existing beliefs", "Change views easily", "Follow data"],
      correctAnswer: "Seek information confirming existing beliefs"
    },
    {
      question: "Recency bias overweights:",
      options: ["All data equally", "Recent information", "Historical data", "Future predictions"],
      correctAnswer: "Recent information"
    },
    {
      question: "Overconfidence bias causes:",
      options: ["Undertrading", "Excessive trading and risk-taking", "Proper diversification", "Risk aversion"],
      correctAnswer: "Excessive trading and risk-taking"
    },
    {
      question: "Loss aversion means:",
      options: ["Losses and gains equally weighted", "Losses hurt more than equivalent gains feel good", "Risk neutral", "Profit maximizing"],
      correctAnswer: "Losses hurt more than equivalent gains feel good"
    },
    {
      question: "Mental accounting causes:",
      options: ["Optimal decisions", "Treating money differently based on source/use", "Rational allocation", "Tax efficiency"],
      correctAnswer: "Treating money differently based on source/use"
    },

    // Market Structure
    {
      question: "Maker-taker pricing model:",
      options: ["Charges both sides equally", "Rebates liquidity providers, charges takers", "Free trading", "Fixed fees"],
      correctAnswer: "Rebates liquidity providers, charges takers"
    },
    {
      question: "Reg NMS aims to:",
      options: ["Increase fees", "Ensure best execution and market transparency", "Limit trading", "Ban HFT"],
      correctAnswer: "Ensure best execution and market transparency"
    },
    {
      question: "Odd lot orders are:",
      options: ["100+ shares", "Less than 100 shares", "Exactly 100", "Over 10,000"],
      correctAnswer: "Less than 100 shares"
    },

    // Quantitative Risk
    {
      question: "Copula functions model:",
      options: ["Individual distributions", "Dependence structure between variables", "Mean returns", "Volatility"],
      correctAnswer: "Dependence structure between variables"
    },
    {
      question: "Extreme Value Theory (EVT) focuses on:",
      options: ["Average returns", "Tail events", "Normal distributions", "Median outcomes"],
      correctAnswer: "Tail events"
    },
    {
      question: "Expected Shortfall at 95% is:",
      options: ["5% quantile", "Average loss in worst 5% scenarios", "Maximum loss", "Standard deviation"],
      correctAnswer: "Average loss in worst 5% scenarios"
    },

    // Global Macro
    {
      question: "Current account deficit means country:",
      options: ["Exports exceed imports", "Imports exceed exports", "Balanced trade", "No trade"],
      correctAnswer: "Imports exceed exports"
    },
    {
      question: "Impossible trinity states countries cannot have:",
      options: ["Low inflation", "Fixed FX, free capital, independent monetary policy simultaneously", "Growth", "Trade"],
      correctAnswer: "Fixed FX, free capital, independent monetary policy simultaneously"
    },
    {
      question: "Sovereign credit rating affects:",
      options: ["Only government", "Country's borrowing costs", "Stock prices only", "Currency only"],
      correctAnswer: "Country's borrowing costs"
    },

    // Industry-Specific
    {
      question: "P/NAV ratio is used for:",
      options: ["Tech companies", "REITs and asset managers", "Retailers", "Utilities"],
      correctAnswer: "REITs and asset managers"
    },
    {
      question: "Bank's net interest margin equals:",
      options: ["Assets - liabilities", "(Interest income - interest expense) / earning assets", "ROE", "Efficiency ratio"],
      correctAnswer: "(Interest income - interest expense) / earning assets"
    },
    {
      question: "Insurance company's combined ratio above 100% indicates:",
      options: ["Underwriting profit", "Underwriting loss", "Break-even", "Strong performance"],
      correctAnswer: "Underwriting loss"
    },
    {
      question: "Same-store sales growth excludes:",
      options: ["All stores", "New/closed stores", "Online sales", "International"],
      correctAnswer: "New/closed stores"
    },

    // Advanced Crypto
    {
      question: "Ethereum gas fees paid in:",
      options: ["USD", "Gwei (ETH denomination)", "Bitcoin", "Stablecoins"],
      correctAnswer: "Gwei (ETH denomination)"
    },
    {
      question: "NFT metadata typically stored:",
      options: ["On-chain only", "Off-chain (IPFS) with on-chain hash", "Centralized server", "Not stored"],
      correctAnswer: "Off-chain (IPFS) with on-chain hash"
    },
    {
      question: "Smart contract immutability means:",
      options: ["Always upgradeable", "Cannot be modified after deployment", "Temporary", "Flexible"],
      correctAnswer: "Cannot be modified after deployment"
    },
    {
      question: "DAO governance token holders can:",
      options: ["Only trade", "Vote on protocol decisions", "Mine blocks", "Nothing"],
      correctAnswer: "Vote on protocol decisions"
    },
    {
      question: "Decentralized exchange (DEX) eliminates:",
      options: ["All risk", "Centralized custody/intermediary", "Price risk", "Liquidity"],
      correctAnswer: "Centralized custody/intermediary"
    },

    // More Derivatives Math
    {
      question: "If stock price follows GBM with μ=10%, σ=20%, 1-year expected price from $100?",
      options: ["$110", "$110.52", "$112", "$120"],
      correctAnswer: "$110.52"
    },
    {
      question: "Risk-neutral valuation assumes investors are:",
      options: ["Risk-seeking", "Risk-averse", "Indifferent to risk (for pricing)", "Loss-averse"],
      correctAnswer: "Indifferent to risk (for pricing)"
    },
    {
      question: "Martingale property means:",
      options: ["Increasing trend", "Expected future value = current value", "Mean reversion", "Random walk"],
      correctAnswer: "Expected future value = current value"
    },
    {
      question: "Girsanov theorem allows:",
      options: ["Changing volatility", "Changing probability measure", "Pricing without math", "Eliminating risk"],
      correctAnswer: "Changing probability measure"
    },

    // Corporate Actions
    {
      question: "Stock dividend of 10% means:",
      options: ["10% cash", "10 new shares per 100 owned", "Price up 10%", "$10 per share"],
      correctAnswer: "10 new shares per 100 owned"
    },
    {
      question: "Rights offering allows shareholders to:",
      options: ["Sell shares", "Buy additional shares at discount", "Receive dividends", "Vote twice"],
      correctAnswer: "Buy additional shares at discount"
    },
    {
      question: "Tender offer is:",
      options: ["IPO", "Public offer to buy shares at specified price", "Dividend", "Stock split"],
      correctAnswer: "Public offer to buy shares at specified price"
    },
    {
      question: "Going-private transaction:",
      options: ["IPO", "Public company becomes private", "Bankruptcy", "Merger"],
      correctAnswer: "Public company becomes private"
    },

    // More Valuation
    {
      question: "Sum-of-the-parts valuation is useful for:",
      options: ["Single business", "Conglomerates with diverse units", "Startups", "Banks"],
      correctAnswer: "Conglomerates with diverse units"
    },
    {
      question: "Liquidation value represents:",
      options: ["Market cap", "Asset sale value if company liquidates", "Book value", "Going concern value"],
      correctAnswer: "Asset sale value if company liquidates"
    },
    {
      question: "Precedent transaction analysis uses:",
      options: ["Current prices", "Prices paid in past M&A deals", "Book values", "Projections"],
      correctAnswer: "Prices paid in past M&A deals"
    },

    // Order Types Advanced
    {
      question: "Fill-or-kill (FOK) order:",
      options: ["Partial fills OK", "Must execute completely immediately or cancel", "Good till cancelled", "Market order"],
      correctAnswer: "Must execute completely immediately or cancel"
    },
    {
      question: "Immediate-or-cancel (IOC) order:",
      options: ["Must fill completely", "Fill available quantity immediately, cancel rest", "Day order", "GTC order"],
      correctAnswer: "Fill available quantity immediately, cancel rest"
    },
    {
      question: "Good-till-cancelled (GTC) order:",
      options: ["Expires daily", "Remains until filled or cancelled", "One hour only", "Fills at any price"],
      correctAnswer: "Remains until filled or cancelled"
    },
    {
      question: "All-or-none (AON) order:",
      options: ["Partial OK", "Must fill entire quantity but not immediately", "Market order", "Cancelled if any execution"],
      correctAnswer: "Must fill entire quantity but not immediately"
    },

    // Leverage & Margin Advanced
    {
      question: "Portfolio margin is based on:",
      options: ["Fixed percentages", "Risk-based calculations", "Account size only", "Time in market"],
      correctAnswer: "Risk-based calculations"
    },
    {
      question: "Cross-margining allows:",
      options: ["Multiple accounts", "Offsetting positions across products", "Higher leverage", "Lower fees"],
      correctAnswer: "Offsetting positions across products"
    },
    {
      question: "Variation margin is:",
      options: ["Initial deposit", "Daily settlement of P&L", "Maintenance requirement", "Fee"],
      correctAnswer: "Daily settlement of P&L"
    },

    // Economic Indicators
    {
      question: "Leading economic indicators:",
      options: ["Lag economy", "Predict future economic activity", "Coincide with economy", "Unrelated"],
      correctAnswer: "Predict future economic activity"
    },
    {
      question: "ISM Manufacturing Index above 50 indicates:",
      options: ["Contraction", "Expansion", "Recession", "Depression"],
      correctAnswer: "Expansion"
    },
    {
      question: "Yield curve steepening suggests:",
      options: ["Recession coming", "Economic growth expectations", "Deflation", "Currency crisis"],
      correctAnswer: "Economic growth expectations"
    },
    {
      question: "Core inflation excludes:",
      options: ["All prices", "Food and energy", "Housing", "Services"],
      correctAnswer: "Food and energy"
    },
    {
      question: "Unemployment rate measures:",
      options: ["All non-workers", "Unemployed actively seeking work / labor force", "Job openings", "Productivity"],
      correctAnswer: "Unemployed actively seeking work / labor force"
    },

    // Factor Models
    {
      question: "Carhart 4-factor model adds which factor to Fama-French?",
      options: ["Quality", "Momentum", "Liquidity", "Profitability"],
      correctAnswer: "Momentum"
    },
    {
      question: "Quality factor focuses on:",
      options: ["Cheap stocks", "Profitable, stable companies", "High beta", "Small caps"],
      correctAnswer: "Profitable, stable companies"
    },
    {
      question: "Low volatility anomaly shows:",
      options: ["High vol outperforms", "Low vol stocks outperform risk-adjusted", "No difference", "Volatility irrelevant"],
      correctAnswer: "Low vol stocks outperform risk-adjusted"
    },

    // Trading Costs
    {
      question: "Total cost of trading includes:",
      options: ["Commission only", "Commission + spread + market impact + opportunity cost", "Spread only", "Nothing"],
      correctAnswer: "Commission + spread + market impact + opportunity cost"
    },
    {
      question: "Market impact cost increases with:",
      options: ["Small orders", "Large order size relative to volume", "Time", "Volatility decrease"],
      correctAnswer: "Large order size relative to volume"
    },
    {
      question: "Timing risk in order execution refers to:",
      options: ["Time of day", "Price moving away while executing", "Settlement delay", "Market hours"],
      correctAnswer: "Price moving away while executing"
    },

    // Structured Products Advanced
    {
      question: "Cliquet option locks in gains:",
      options: ["Never", "Periodically (ratchet feature)", "Only at maturity", "Daily"],
      correctAnswer: "Periodically (ratchet feature)"
    },
    {
      question: "Quanto option settles in:",
      options: ["Underlying currency", "Different currency than underlying", "Gold", "Shares"],
      correctAnswer: "Different currency than underlying"
    },
    {
      question: "Compound option is:",
      options: ["Two separate options", "Option on an option", "Complex strategy", "Synthetic position"],
      correctAnswer: "Option on an option"
    },

    // Clearing & Settlement
    {
      question: "T+2 settlement means:",
      options: ["Trade settles in 2 hours", "Trade settles 2 business days after", "2% fee", "2 day hold"],
      correctAnswer: "Trade settles 2 business days after"
    },
    {
      question: "Central counterparty (CCP) becomes:",
      options: ["Advisor", "Buyer to every seller, seller to every buyer", "Broker", "Exchange"],
      correctAnswer: "Buyer to every seller, seller to every buyer"
    },
    {
      question: "Novation in clearing means:",
      options: ["New trade", "CCP replaces original counterparty", "Trade cancellation", "Price adjustment"],
      correctAnswer: "CCP replaces original counterparty"
    },

    // Specific Market Knowledge
    {
      question: "Russell 2000 index tracks:",
      options: ["Large caps", "Small-cap US stocks", "International", "Bonds"],
      correctAnswer: "Small-cap US stocks"
    },
    {
      question: "FTSE 100 represents:",
      options: ["US stocks", "UK's 100 largest companies", "European stocks", "Emerging markets"],
      correctAnswer: "UK's 100 largest companies"
    },
    {
      question: "Nikkei 225 is from:",
      options: ["China", "Japan", "Korea", "India"],
      correctAnswer: "Japan"
    },
    {
      question: "DAX index represents:",
      options: ["France", "Germany", "Netherlands", "Switzerland"],
      correctAnswer: "Germany"
    },
    {
      question: "HSI (Hang Seng Index) tracks:",
      options: ["Shanghai", "Hong Kong", "Singapore", "Tokyo"],
      correctAnswer: "Hong Kong"
    },

    // Options Strategies Advanced
    {
      question: "Ratio spread involves:",
      options: ["Equal long and short", "Unequal number of long vs short options", "Stock and options", "Futures only"],
      correctAnswer: "Unequal number of long vs short options"
    },
    {
      question: "Christmas tree spread uses:",
      options: ["Two strikes", "Three strikes with varying quantities", "Four equal strikes", "No options"],
      correctAnswer: "Three strikes with varying quantities"
    },
    {
      question: "Diagonal spread differs from calendar by:",
      options: ["No difference", "Different strikes AND expiries", "Only stock vs options", "Direction"],
      correctAnswer: "Different strikes AND expiries"
    },
    {
      question: "Jade lizard combines:",
      options: ["Long call, short put", "Short call, short put spread", "All long", "Straddle + stock"],
      correctAnswer: "Short call, short put spread"
    },

    // Sector Rotation
    {
      question: "In early economic recovery, outperforming sector typically:",
      options: ["Utilities", "Consumer discretionary and industrials", "Staples", "Bonds"],
      correctAnswer: "Consumer discretionary and industrials"
    },
    {
      question: "Defensive sectors include:",
      options: ["Tech and growth", "Utilities, healthcare, consumer staples", "Financials", "Energy"],
      correctAnswer: "Utilities, healthcare, consumer staples"
    },
    {
      question: "Cyclical sectors perform best during:",
      options: ["Recession", "Economic expansion", "Stagnation", "Crisis"],
      correctAnswer: "Economic expansion"
    },

    // More DeFi
    {
      question: "Bonding curve defines:",
      options: ["Bond prices", "Token price as function of supply", "Yield curve", "Credit curve"],
      correctAnswer: "Token price as function of supply"
    },
    {
      question: "Governance attack can occur when:",
      options: ["Bug in code", "Attacker gains majority voting power", "Network congestion", "Fork"],
      correctAnswer: "Attacker gains majority voting power"
    },
    {
      question: "Stable coin depeg means:",
      options: ["Perfect peg", "Losing peg to target (e.g., $1)", "Gaining value", "Constant value"],
      correctAnswer: "Losing peg to target (e.g., $1)"
    },
    {
      question: "Front-running in DeFi:",
      options: ["Illegal always", "Seeing pending transaction and inserting own first", "Fast trading", "Arbitrage"],
      correctAnswer: "Seeing pending transaction and inserting own first"
    },

    // Complex Scenarios
    {
      question: "If call delta 0.7, put delta must be (same strike/expiry):",
      options: ["-0.3", "-0.7", "0.3", "0.7"],
      correctAnswer: "-0.3"
    },
    {
      question: "Synthetic forward = ?",
      options: ["Long call + short put", "Two calls", "Stock only", "Collar"],
      correctAnswer: "Long call + short put"
    },
    {
      question: "Box spread arbitrage combines:",
      options: ["Random options", "Bull call + bear put spread", "Only calls", "Only puts"],
      correctAnswer: "Bull call + bear put spread"
    },
    {
      question: "Conversion arbitrage involves:",
      options: ["Currency", "Long stock + long put + short call", "Bonds", "Futures"],
      correctAnswer: "Long stock + long put + short call"
    },
    {
      question: "Reversal arbitrage is:",
      options: ["Long stock + options", "Short stock + short put + long call", "Pure options", "Futures spread"],
      correctAnswer: "Short stock + short put + long call"
    }
  ];

  // Mix all question categories and filter out used ones
  const allQuestions = [...expertQuestions, ...masterQuestions, ...advancedQuestions, ...fallbacks];
  const availableQuestions = allQuestions.filter(q => !questionTracker.hasBeenUsed(q.question));
  
  // Reset if all questions used
  if (availableQuestions.length === 0) {
    questionTracker.reset();
    const selected = allQuestions[Math.floor(Math.random() * allQuestions.length)];
    questionTracker.markAsUsed(selected.question);
    return selected;
  }
  
  const selected = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
  questionTracker.markAsUsed(selected.question);
  return selected;
}