import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown,
  Coins,
  Shield,
  Zap,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import OptionChain from '@/components/options/OptionChain';
import CoveredOptionsWriter from '@/components/options/CoveredOptionsWriter';
import { calculateGreeks } from '@/components/options/OptionGreeks';
import { fetchRealTimePrice } from '@/components/portfolio/PriceService';

// All tradeable assets in the game
const ALL_TRADEABLE_ASSETS = [
  // ETFs
  { ticker: 'SPY', name: 'S&P 500 ETF', basePrice: 675.00, category: 'etf' },
  { ticker: 'QQQ', name: 'Nasdaq-100 ETF', basePrice: 609.00, category: 'etf' },
  { ticker: 'IWM', name: 'Russell 2000 ETF', basePrice: 248.90, category: 'etf' },
  { ticker: 'TQQQ', name: '3x Nasdaq Bull', basePrice: 51.77, category: 'etf' },
  { ticker: 'XLF', name: 'Financial ETF', basePrice: 52.90, category: 'etf' },
  { ticker: 'XLE', name: 'Energy ETF', basePrice: 98.34, category: 'etf' },
  { ticker: 'XLK', name: 'Tech ETF', basePrice: 256.78, category: 'etf' },
  
  // Top Tech
  { ticker: 'AAPL', name: 'Apple', basePrice: 271.44, category: 'tech' },
  { ticker: 'GOOGL', name: 'Alphabet', basePrice: 205.34, category: 'tech' },
  { ticker: 'MSFT', name: 'Microsoft', basePrice: 518.90, category: 'tech' },
  { ticker: 'AMZN', name: 'Amazon', basePrice: 227.24, category: 'tech' },
  { ticker: 'META', name: 'Meta', basePrice: 664.77, category: 'tech' },
  { ticker: 'NVDA', name: 'NVIDIA', basePrice: 176.71, category: 'tech' },
  { ticker: 'AMD', name: 'AMD', basePrice: 202.64, category: 'tech' },
  { ticker: 'TSLA', name: 'Tesla', basePrice: 548.90, category: 'auto' },
  
  // Finance
  { ticker: 'JPM', name: 'JPMorgan', basePrice: 198.75, category: 'finance' },
  { ticker: 'BAC', name: 'Bank of America', basePrice: 35.60, category: 'finance' },
  { ticker: 'GS', name: 'Goldman Sachs', basePrice: 425.80, category: 'finance' },
  { ticker: 'V', name: 'Visa', basePrice: 285.50, category: 'finance' },
  { ticker: 'MA', name: 'Mastercard', basePrice: 475.25, category: 'finance' },
  
  // Popular Stocks
  { ticker: 'NFLX', name: 'Netflix', basePrice: 94.00, category: 'tech' },
  { ticker: 'DIS', name: 'Disney', basePrice: 112.50, category: 'entertainment' },
  { ticker: 'WMT', name: 'Walmart', basePrice: 168.50, category: 'retail' },
  { ticker: 'COST', name: 'Costco', basePrice: 725.60, category: 'retail' },
  { ticker: 'HOOD', name: 'Robinhood', basePrice: 119.12, category: 'finance' },
  { ticker: 'PLTR', name: 'Palantir', basePrice: 186.00, category: 'tech' },
  { ticker: 'COIN', name: 'Coinbase', basePrice: 185.40, category: 'finance' },
  
  // Major Crypto
  { ticker: 'BTC-USD', name: 'Bitcoin', basePrice: 86900.00, category: 'crypto' },
  { ticker: 'ETH-USD', name: 'Ethereum', basePrice: 2920.00, category: 'crypto' },
  { ticker: 'BNB-USD', name: 'Binance Coin', basePrice: 350, category: 'crypto' },
  { ticker: 'SOL-USD', name: 'Solana', basePrice: 95, category: 'crypto' },
  { ticker: 'ADA-USD', name: 'Cardano', basePrice: 0.58, category: 'crypto' },
  { ticker: 'XRP-USD', name: 'Ripple', basePrice: 0.62, category: 'crypto' },
  { ticker: 'AVAX-USD', name: 'Avalanche', basePrice: 38.50, category: 'crypto' },
  { ticker: 'LINK-USD', name: 'Chainlink', basePrice: 15.80, category: 'crypto' },
  { ticker: 'DOGE-USD', name: 'Dogecoin', basePrice: 0.58, category: 'crypto' },
  { ticker: 'SHIB-USD', name: 'Shiba Inu', basePrice: 0.000042, category: 'crypto' }
];

export default function Options() {
  const [user, setUser] = useState(null);
  const [selectedTicker, setSelectedTicker] = useState('AAPL');
  const [currentPrice, setCurrentPrice] = useState(271.44);
  const [allPrices, setAllPrices] = useState({});
  const [showCoveredWriter, setShowCoveredWriter] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: player } = useQuery({
    queryKey: ['player', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const players = await base44.entities.Player.filter({ created_by: user.email });
      return players[0] || null;
    },
    enabled: !!user?.email
  });

  const { data: portfolio = [] } = useQuery({
    queryKey: ['portfolio', player?.id],
    queryFn: async () => {
      if (!player?.id) return [];
      return base44.entities.Portfolio.filter({ player_id: player.id });
    },
    enabled: !!player?.id
  });

  const { data: optionContracts = [] } = useQuery({
    queryKey: ['optionContracts', player?.id],
    queryFn: async () => {
      if (!player?.id) return [];
      return base44.entities.OptionContract.filter({ 
        player_id: player.id,
        status: 'active'
      });
    },
    enabled: !!player?.id
  });

  // Fetch and continuously update prices for ALL assets
  useEffect(() => {
    const fetchPrices = async () => {
      const prices = {};
      for (const asset of ALL_TRADEABLE_ASSETS) {
        try {
          prices[asset.ticker] = await fetchRealTimePrice(asset.ticker);
        } catch {
          prices[asset.ticker] = asset.basePrice;
        }
      }
      setAllPrices(prices);
      setCurrentPrice(prices[selectedTicker] || ALL_TRADEABLE_ASSETS[0].basePrice);
    };

    fetchPrices();
    
    // Refresh every 10 seconds for real-time updates
    const mainInterval = setInterval(fetchPrices, 10000);
    
    // Micro price updates every 2 seconds for smooth price action
    const microInterval = setInterval(() => {
      setAllPrices(prev => {
        const updated = { ...prev };
        ALL_TRADEABLE_ASSETS.forEach(asset => {
          const current = prev[asset.ticker] || asset.basePrice;
          const isCrypto = asset.category === 'crypto';
          const microVolatility = isCrypto ? 0.003 : 0.0015;
          const change = (Math.random() - 0.5) * 2 * microVolatility * current;
          updated[asset.ticker] = current + change;
        });
        return updated;
      });
      setCurrentPrice(prev => {
        const asset = ALL_TRADEABLE_ASSETS.find(a => a.ticker === selectedTicker);
        const isCrypto = asset?.category === 'crypto';
        const microVolatility = isCrypto ? 0.003 : 0.0015;
        const change = (Math.random() - 0.5) * 2 * microVolatility * prev;
        return prev + change;
      });
    }, 2000);
    
    return () => {
      clearInterval(mainInterval);
      clearInterval(microInterval);
    };
  }, [selectedTicker]);

  const buyOptionMutation = useMutation({
    mutationFn: async ({ ticker, contractType, strikePrice, premium, daysToExpiry, greeks }) => {
      const cost = premium;
      if ((player?.soft_currency || 0) < cost) throw new Error('Insufficient funds');

      await base44.entities.Player.update(player.id, {
        soft_currency: (player.soft_currency || 0) - cost
      });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + daysToExpiry);

      await base44.entities.OptionContract.create({
        player_id: player.id,
        ticker,
        contract_type: contractType,
        strike_price: strikePrice,
        premium_paid: premium,
        contracts: 1,
        expires_at: expiresAt.toISOString(),
        position_type: 'long',
        is_covered: false,
        status: 'active',
        entry_underlying_price: currentPrice,
        counterparty_type: 'ai',
        delta: greeks.delta,
        gamma: greeks.gamma,
        theta: greeks.theta,
        vega: greeks.vega,
        implied_volatility: 0.3
      });

      await base44.entities.Transaction.create({
        player_id: player.id,
        type: 'purchase',
        description: `Bought ${contractType.toUpperCase()} $${strikePrice} exp ${daysToExpiry}d on ${ticker}`,
        soft_currency_change: -cost
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['player']);
      queryClient.invalidateQueries(['optionContracts']);
    }
  });

  const writeCoveredOptionMutation = useMutation({
    mutationFn: async ({ ticker, contractType, strikePrice, premium, contracts, expiry, greeks, currentPrice }) => {
      const sharesNeeded = contracts * 100;
      const holding = portfolio.find(p => p.ticker === ticker);
      
      if (!holding || holding.shares < sharesNeeded) {
        throw new Error('Insufficient shares');
      }

      // Receive premium
      const premiumReceived = premium * contracts;
      await base44.entities.Player.update(player.id, {
        soft_currency: (player.soft_currency || 0) + premiumReceived
      });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiry);

      await base44.entities.OptionContract.create({
        player_id: player.id,
        ticker,
        contract_type: contractType,
        strike_price: strikePrice,
        premium_paid: premium,
        contracts,
        expires_at: expiresAt.toISOString(),
        position_type: 'short',
        is_covered: true,
        status: 'active',
        entry_underlying_price: currentPrice,
        counterparty_type: 'ai',
        delta: greeks.delta,
        gamma: greeks.gamma,
        theta: greeks.theta,
        vega: greeks.vega,
        implied_volatility: 0.3
      });

      await base44.entities.Transaction.create({
        player_id: player.id,
        type: 'purchase',
        description: `Wrote ${contracts} ${contractType.toUpperCase()} $${strikePrice} on ${ticker}`,
        soft_currency_change: premiumReceived
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['player']);
      queryClient.invalidateQueries(['optionContracts']);
    }
  });

  const closeOptionMutation = useMutation({
    mutationFn: async (contract) => {
      const greeks = calculateGreeks(
        allPrices[contract.ticker] || contract.entry_underlying_price,
        contract.strike_price,
        (new Date(contract.expires_at) - new Date()) / (365 * 24 * 60 * 60 * 1000),
        0.05,
        contract.implied_volatility,
        contract.contract_type === 'call'
      );

      const closePrice = greeks.price;
      
      if (contract.position_type === 'long') {
        // Sell to close - receive money
        const proceeds = closePrice * contract.contracts;
        await base44.entities.Player.update(player.id, {
          soft_currency: (player.soft_currency || 0) + proceeds
        });

        await base44.entities.Transaction.create({
          player_id: player.id,
          type: 'purchase',
          description: `Closed ${contract.contract_type.toUpperCase()} position on ${contract.ticker}`,
          soft_currency_change: proceeds
        });
      } else {
        // Buy to close - pay money
        const cost = closePrice * contract.contracts;
        if ((player?.soft_currency || 0) < cost) throw new Error('Insufficient funds');

        await base44.entities.Player.update(player.id, {
          soft_currency: (player.soft_currency || 0) - cost
        });

        await base44.entities.Transaction.create({
          player_id: player.id,
          type: 'purchase',
          description: `Closed short ${contract.contract_type.toUpperCase()} on ${contract.ticker}`,
          soft_currency_change: -cost
        });
      }

      await base44.entities.OptionContract.update(contract.id, {
        status: 'closed'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['player']);
      queryClient.invalidateQueries(['optionContracts']);
    }
  });

  const handleTrade = (ticker, contractType, strikePrice, premium, daysToExpiry, greeks) => {
    buyOptionMutation.mutate({ ticker, contractType, strikePrice, premium, daysToExpiry, greeks });
  };

  const calculateContractPnL = (contract) => {
    const currentUnderlying = allPrices[contract.ticker] || contract.entry_underlying_price;
    const daysLeft = Math.max(0, (new Date(contract.expires_at) - new Date()) / (1000 * 60 * 60 * 24));
    const T = Math.max(daysLeft / 365, 0.0001); // Prevent zero

    const isCrypto = contract.ticker.includes('-USD');
    const adjustedVol = isCrypto ? 0.5 : 0.35; // Realistic vol

    const currentGreeks = calculateGreeks(
      currentUnderlying,
      contract.strike_price,
      T,
      0.05,
      adjustedVol,
      contract.contract_type === 'call'
    );

    const currentValue = currentGreeks.price * contract.contracts;
    const costBasis = contract.premium_paid * contract.contracts;

    if (contract.position_type === 'long') {
      return currentValue - costBasis;
    } else {
      return costBasis - currentValue;
    }
  };

  const totalOptionsValue = optionContracts.reduce((sum, contract) => {
    return sum + calculateContractPnL(contract);
  }, 0);

  const filteredAssets = ALL_TRADEABLE_ASSETS.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         asset.ticker.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" className="text-white">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Zap className="w-8 h-8 text-purple-400" />
                Options Trading
              </h1>
              <p className="text-slate-400">Advanced derivatives trading with Greeks</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-xl">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-bold">{player?.soft_currency?.toLocaleString() || 0}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-xl">
              <DollarSign className="w-5 h-5 text-purple-400" />
              <span className="text-purple-400 font-bold">{totalOptionsValue >= 0 ? '+' : ''}{totalOptionsValue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="chain" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="chain">
              <TrendingUp className="w-4 h-4 mr-2" />
              Options Chain
            </TabsTrigger>
            <TabsTrigger value="positions">
              <DollarSign className="w-4 h-4 mr-2" />
              My Positions ({optionContracts.length})
            </TabsTrigger>
            <TabsTrigger value="write">
              <Shield className="w-4 h-4 mr-2" />
              Write Covered
            </TabsTrigger>
          </TabsList>

          {/* Options Chain */}
          <TabsContent value="chain">
            <div className="space-y-6">
              {/* Search & Filter */}
              <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 space-y-4">
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Search Assets</label>
                  <Input
                    placeholder="Search stocks, crypto, ETFs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-900 border-slate-700 text-white"
                  />
                </div>
                
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {['all', 'etf', 'tech', 'finance', 'crypto', 'auto', 'retail', 'entertainment'].map(cat => (
                      <Button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        variant={selectedCategory === cat ? 'default' : 'outline'}
                        size="sm"
                        className={selectedCategory === cat ? 'bg-purple-600' : 'border-slate-600 text-slate-300'}
                      >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Select Asset ({filteredAssets.length} available)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-64 overflow-y-auto p-2">
                    {filteredAssets.map(asset => (
                      <Button
                        key={asset.ticker}
                        onClick={() => {
                          setSelectedTicker(asset.ticker);
                          setCurrentPrice(allPrices[asset.ticker] || asset.basePrice);
                        }}
                        variant={selectedTicker === asset.ticker ? 'default' : 'outline'}
                        size="sm"
                        className={`${
                          selectedTicker === asset.ticker 
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 border-cyan-400 shadow-lg shadow-cyan-500/50 animate-pulse' 
                            : 'border-slate-600 hover:border-cyan-500/50 hover:shadow-md hover:shadow-cyan-500/20 transition-all'
                        } text-xs font-bold`}
                      >
                        {asset.ticker}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Current Price - Live Updating */}
              <div className="bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 border-2 border-blue-500/40 rounded-2xl p-6 shadow-xl shadow-blue-500/10">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-white text-xl font-bold">{ALL_TRADEABLE_ASSETS.find(a => a.ticker === selectedTicker)?.name || selectedTicker}</h3>
                      <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1 rounded-full border border-green-400/50">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-green-400 text-xs font-bold">LIVE</span>
                      </div>
                    </div>
                    <motion.div
                      key={currentPrice}
                      initial={{ scale: 1.08, color: '#3b82f6' }}
                      animate={{ scale: 1, color: '#ffffff' }}
                      className="text-5xl font-black"
                    >
                      ${currentPrice.toFixed(currentPrice < 1 ? 6 : 2)}
                    </motion.div>
                    <p className="text-slate-400 text-sm mt-2">Underlying Asset Price</p>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/50 animate-pulse">
                      <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                      ALL_TRADEABLE_ASSETS.find(a => a.ticker === selectedTicker)?.category === 'crypto' 
                        ? 'bg-orange-500/20 text-orange-300' 
                        : ALL_TRADEABLE_ASSETS.find(a => a.ticker === selectedTicker)?.category === 'etf'
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-green-500/20 text-green-300'
                    }`}>
                      {ALL_TRADEABLE_ASSETS.find(a => a.ticker === selectedTicker)?.category?.toUpperCase() || 'STOCK'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Options Chain */}
              <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
                <OptionChain
                  ticker={selectedTicker}
                  currentPrice={currentPrice}
                  onTrade={handleTrade}
                  playerBalance={player?.soft_currency || 0}
                />
              </div>
            </div>
          </TabsContent>

          {/* My Positions */}
          <TabsContent value="positions">
            <div className="space-y-4">
              {optionContracts.length === 0 ? (
                <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-12 text-center">
                  <Zap className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 text-lg">No active options positions</p>
                  <p className="text-slate-500 text-sm">Trade options to see them here</p>
                </div>
              ) : (
                optionContracts.map(contract => {
                  const pnl = calculateContractPnL(contract);
                  const pnlPercent = ((pnl / (contract.premium_paid * contract.contracts)) * 100);
                  const daysLeft = Math.max(0, (new Date(contract.expires_at) - new Date()) / (1000 * 60 * 60 * 24));
                  const currentUnderlying = allPrices[contract.ticker] || contract.entry_underlying_price;
                  const priceMove = ((currentUnderlying - contract.entry_underlying_price) / contract.entry_underlying_price * 100);

                  return (
                    <motion.div
                      key={contract.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`bg-gradient-to-br ${
                        contract.contract_type === 'call' 
                          ? 'from-green-900/20 to-emerald-900/20 border-green-500/30' 
                          : 'from-red-900/20 to-rose-900/20 border-red-500/30'
                      } rounded-xl border p-6 hover:border-slate-500 transition-all shadow-lg hover:shadow-xl`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center backdrop-blur-sm ${
                            contract.contract_type === 'call' 
                              ? 'bg-green-500/30 border-2 border-green-400/50 shadow-lg shadow-green-500/20' 
                              : 'bg-red-500/30 border-2 border-red-400/50 shadow-lg shadow-red-500/20'
                          }`}>
                            {contract.contract_type === 'call' ? (
                              <TrendingUp className="w-7 h-7 text-green-300" />
                            ) : (
                              <TrendingDown className="w-7 h-7 text-red-300" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                              {contract.ticker} ${contract.strike_price} 
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                contract.contract_type === 'call' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                              }`}>
                                {contract.contract_type.toUpperCase()}
                              </span>
                            </h3>
                            <p className="text-slate-300 text-sm flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                contract.position_type === 'long' ? 'bg-blue-500/20 text-blue-300' : 'bg-orange-500/20 text-orange-300'
                              }`}>
                                {contract.position_type === 'long' ? 'Long' : 'Short'}
                              </span>
                              <span>{contract.contracts} contract{contract.contracts > 1 ? 's' : ''}</span>
                              {contract.is_covered && <span className="text-yellow-400">• Covered</span>}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-slate-400 bg-slate-800/50 px-2 py-1 rounded">
                                Spot: ${currentUnderlying.toFixed(2)}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded font-bold ${
                                priceMove >= 0 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                              }`}>
                                {priceMove >= 0 ? '+' : ''}{priceMove.toFixed(2)}%
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right bg-slate-900/50 backdrop-blur-sm px-4 py-3 rounded-xl border border-slate-700">
                          <motion.div 
                            key={pnl}
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            className={`text-2xl font-bold ${pnl >= 0 ? 'text-green-300' : 'text-red-300'}`}
                          >
                            {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                          </motion.div>
                          <div className={`text-sm font-semibold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {pnl >= 0 ? '+' : ''}{pnlPercent.toFixed(1)}%
                          </div>
                        </div>
                      </div>

                      {/* Greeks */}
                      <div className="grid grid-cols-4 gap-3 mb-4">
                        <div className="bg-slate-900/70 backdrop-blur-sm rounded-lg p-3 border border-slate-700">
                          <p className="text-slate-400 text-xs mb-1">Delta</p>
                          <p className="text-white font-bold text-lg">{contract.delta?.toFixed(3) || '—'}</p>
                        </div>
                        <div className="bg-slate-900/70 backdrop-blur-sm rounded-lg p-3 border border-slate-700">
                          <p className="text-slate-400 text-xs mb-1">Gamma</p>
                          <p className="text-white font-bold text-lg">{contract.gamma?.toFixed(4) || '—'}</p>
                        </div>
                        <div className="bg-slate-900/70 backdrop-blur-sm rounded-lg p-3 border border-red-500/30">
                          <p className="text-red-400 text-xs mb-1">Theta</p>
                          <p className="text-red-300 font-bold text-lg">{contract.theta?.toFixed(3) || '—'}</p>
                        </div>
                        <div className="bg-slate-900/70 backdrop-blur-sm rounded-lg p-3 border border-slate-700">
                          <p className="text-slate-400 text-xs mb-1">Vega</p>
                          <p className="text-white font-bold text-lg">{contract.vega?.toFixed(3) || '—'}</p>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-lg">
                            <Clock className="w-4 h-4 text-blue-400" />
                            <span className="text-slate-300 font-medium">{daysLeft.toFixed(1)} days left</span>
                          </div>
                          <div className="bg-slate-900/50 px-3 py-1.5 rounded-lg">
                            <span className="text-slate-400 text-xs">Premium:</span>
                            <span className="text-slate-200 font-bold ml-1">${contract.premium_paid.toFixed(2)}</span>
                          </div>
                        </div>

                        <Button
                          onClick={() => {
                            if (window.confirm(`Close ${contract.contract_type.toUpperCase()} position on ${contract.ticker}?\n\nThis action cannot be undone.`)) {
                              closeOptionMutation.mutate(contract);
                            }
                          }}
                          disabled={closeOptionMutation.isLoading}
                          variant="outline"
                          size="sm"
                          className="border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:border-slate-500"
                        >
                          Close Position
                        </Button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* Write Covered */}
          <TabsContent value="write">
            <div className="space-y-6">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-blue-300 font-medium mb-1">Write Covered Options</p>
                    <p className="text-blue-300/80 text-sm">
                      Use your portfolio shares to write covered calls or cash-secured puts. 
                      Earn premium upfront but be prepared for assignment if the option moves against you.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setShowCoveredWriter(true)}
                className="w-full py-8 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Shield className="w-6 h-6 mr-3" />
                Start Writing Covered Options
              </Button>

              {/* Portfolio Holdings */}
              <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
                <h3 className="text-xl font-bold text-white mb-4">Eligible Holdings</h3>
                <div className="space-y-2">
                  {portfolio.filter(p => p.shares >= 100).map(p => (
                    <div key={p.ticker} className="flex items-center justify-between p-3 bg-slate-900/50 rounded">
                      <div>
                        <p className="text-white font-bold">{p.ticker}</p>
                        <p className="text-slate-400 text-sm">{p.shares.toFixed(2)} shares</p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-bold">
                          {Math.floor(p.shares / 100)} contracts
                        </p>
                        <p className="text-slate-500 text-xs">available</p>
                      </div>
                    </div>
                  ))}
                  {portfolio.filter(p => p.shares >= 100).length === 0 && (
                    <p className="text-slate-500 text-center py-8">
                      You need at least 100 shares of a stock to write covered options
                    </p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {showCoveredWriter && (
        <CoveredOptionsWriter
          portfolio={portfolio}
          currentPrices={allPrices}
          onWrite={(data) => writeCoveredOptionMutation.mutate(data)}
          onClose={() => setShowCoveredWriter(false)}
        />
      )}
    </div>
  );
}