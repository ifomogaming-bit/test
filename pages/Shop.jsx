import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  ArrowLeft, 
  ShoppingBag, 
  Coins,
  Gem,
  Zap,
  Sparkles,
  CheckCircle,
  DollarSign,
  CreditCard,
  AlertCircle,
  Star,
  Flame,
  Shield,
  TrendingUp,
  Package,
  Clock,
  Award,
  Users,
  Swords,
  Gift,
  Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import LootBoxCard from '@/components/shop/LootBoxCard';
import ThemeBundleCard from '@/components/shop/ThemeBundleCard';

// Coin Bundles - Enhanced value per USD
const COIN_BUNDLES = [
  { id: 'starter', coins: 5000, price: 0.99, bonus: 0, popular: false },
  { id: 'basic', coins: 15000, price: 4.99, bonus: 3000, popular: false },
  { id: 'pro', coins: 35000, price: 9.99, bonus: 10000, popular: true },
  { id: 'elite', coins: 85000, price: 19.99, bonus: 25000, popular: false },
  { id: 'master', coins: 225000, price: 49.99, bonus: 75000, popular: false },
  { id: 'whale', coins: 550000, price: 99.99, bonus: 250000, popular: false }
];

const GEM_BUNDLES = [
  { amount: 100, price: 0.99, name: 'Tiny Gem Pouch', usd: true },
  { amount: 250, price: 1.99, name: 'Small Gem Pouch', bonus: 25, usd: true },
  { amount: 600, price: 4.99, name: 'Medium Gem Pack', bonus: 75, usd: true },
  { amount: 1300, price: 9.99, name: 'Large Gem Pack', bonus: 200, usd: true },
  { amount: 3000, price: 19.99, name: 'Huge Gem Chest', bonus: 500, usd: true },
  { amount: 8000, price: 49.99, name: 'Epic Gem Vault', bonus: 2000, usd: true },
  { amount: 20000, price: 99.99, name: 'Legendary Gem Hoard', bonus: 5000, usd: true }
];

import { ECONOMY_CONFIG, calculateDynamicPricing } from '@/components/economy/EconomyManager';

// Power-ups available for gems
const POWER_UPS = [
  { 
    id: 'double_xp_1h', 
    name: 'Double XP (1 Hour)', 
    description: 'Earn 2x XP from all activities for 1 hour',
    basePrice: ECONOMY_CONFIG.ITEM_BASE_PRICES.double_xp_1h,
    icon: Zap,
    color: 'from-yellow-500 to-orange-500',
    duration: 3600,
    category: 'general'
  },
  { 
    id: 'double_xp_24h', 
    name: 'Double XP (24 Hours)', 
    description: 'Earn 2x XP from all activities for 24 hours',
    basePrice: ECONOMY_CONFIG.ITEM_BASE_PRICES.double_xp_24h,
    icon: Zap,
    color: 'from-yellow-500 to-orange-500',
    duration: 86400,
    category: 'general'
  },
  { 
    id: 'triple_rewards_1h', 
    name: 'Triple Rewards (1 Hour)', 
    description: '3x coins from bubbles for 1 hour',
    basePrice: ECONOMY_CONFIG.ITEM_BASE_PRICES.triple_rewards_1h,
    icon: Coins,
    color: 'from-green-500 to-emerald-500',
    duration: 3600,
    category: 'general'
  },
  { 
    id: 'lucky_streak_30m', 
    name: 'Lucky Streak (30 Min)', 
    description: 'Increased chance of rare bubbles',
    basePrice: ECONOMY_CONFIG.ITEM_BASE_PRICES.lucky_streak_30m,
    icon: Star,
    color: 'from-purple-500 to-pink-500',
    duration: 1800,
    category: 'general'
  },
  { 
    id: 'instant_cooldown', 
    name: 'Remove Cooldown', 
    description: 'Instantly remove game cooldown',
    basePrice: ECONOMY_CONFIG.ITEM_BASE_PRICES.instant_cooldown,
    icon: Flame,
    color: 'from-red-500 to-orange-500',
    instant: true,
    category: 'general'
  },
  { 
    id: 'pvp_shield_1h', 
    name: 'PvP Shield (1 Hour)', 
    description: 'Protected from rating loss for 1 hour',
    basePrice: ECONOMY_CONFIG.ITEM_BASE_PRICES.pvp_shield_1h,
    icon: Shield,
    color: 'from-blue-500 to-cyan-500',
    duration: 3600,
    category: 'general'
  },
  { 
    id: 'stock_boost_1h', 
    name: 'Stock Boost (1 Hour)', 
    description: 'Get 50% more shares from bubbles',
    basePrice: ECONOMY_CONFIG.ITEM_BASE_PRICES.stock_boost_1h,
    icon: TrendingUp,
    color: 'from-indigo-500 to-purple-500',
    duration: 3600,
    category: 'general'
  },
  
  // Guild Raid Items
  {
    id: 'raid_shield_6h',
    name: 'Raid Shield (6 Hours)',
    description: 'Protects your guild from all raid attacks',
    basePrice: ECONOMY_CONFIG.ITEM_BASE_PRICES.raid_shield_6h,
    icon: Shield,
    color: 'from-blue-600 to-cyan-600',
    duration: 21600,
    category: 'raid'
  },
  {
    id: 'attack_power_2h',
    name: 'Attack Power (2 Hours)',
    description: '+50% attack power in guild raids',
    basePrice: ECONOMY_CONFIG.ITEM_BASE_PRICES.attack_power_2h,
    icon: Zap,
    color: 'from-red-600 to-orange-600',
    duration: 7200,
    category: 'raid'
  },
  {
    id: 'defense_fort_2h',
    name: 'Defense Fort (2 Hours)',
    description: '+50% defense power against raids',
    basePrice: ECONOMY_CONFIG.ITEM_BASE_PRICES.defense_fort_2h,
    icon: Shield,
    color: 'from-green-600 to-emerald-600',
    duration: 7200,
    category: 'raid'
  },
  {
    id: 'loot_2x',
    name: 'Loot Multiplier',
    description: '2x loot from your next successful raid',
    basePrice: ECONOMY_CONFIG.ITEM_BASE_PRICES.loot_2x,
    icon: Coins,
    color: 'from-yellow-600 to-orange-600',
    instant: true,
    category: 'raid'
  },
  {
    id: 'instant_raid_cd',
    name: 'Instant Raid Reset',
    description: 'Remove guild raid cooldown immediately',
    basePrice: ECONOMY_CONFIG.ITEM_BASE_PRICES.instant_raid_cd,
    icon: Flame,
    color: 'from-purple-600 to-pink-600',
    instant: true,
    category: 'raid'
  },
  {
    id: 'scout_24h',
    name: 'Scout Intel (24h)',
    description: 'See enemy guild stats before raiding',
    basePrice: ECONOMY_CONFIG.ITEM_BASE_PRICES.scout_24h,
    icon: Star,
    color: 'from-indigo-600 to-purple-600',
    duration: 86400,
    category: 'raid'
  }
];

export default function Shop() {
  const [user, setUser] = useState(null);
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [selectedPowerUp, setSelectedPowerUp] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedThemePurchase, setSelectedThemePurchase] = useState(null);
  const queryClient = useQueryClient();

  const updatePlayerMutation = useMutation({
    mutationFn: (data) => base44.entities.Player.update(player.id, data),
    onSuccess: () => queryClient.invalidateQueries(['player'])
  });

  const handleOpenLootBox = async (tier, reward) => {
    // Deduct gems with dynamic pricing
    const baseCost = ECONOMY_CONFIG.LOOT_BOX_PRICES[tier];
    const gemCost = calculateDynamicPricing(baseCost, economyHealth);
    
    // Validate player can afford
    if ((player.premium_currency || 0) < gemCost) {
      return;
    }
    
    // Apply reward
    const newGemBalance = Math.max(0, (player.premium_currency || 0) - gemCost);
    const updates = { premium_currency: newGemBalance };
    
    if (reward.type === 'coins') {
      updates.soft_currency = (player.soft_currency || 0) + reward.value;
    } else if (reward.type === 'xp') {
      updates.xp = (player.xp || 0) + reward.value;
    } else if (reward.type === 'gems') {
      updates.premium_currency = (player.premium_currency || 0) - gemCost + reward.value;
    } else if (reward.type === 'level') {
      updates.level = (player.level || 1) + 1;
      updates.xp = 0;
    } else if (reward.type === 'stock') {
      // Add stock shares to portfolio
      const existingPortfolio = await base44.entities.Portfolio.filter({ 
        player_id: player.id, 
        ticker: reward.ticker 
      });
      
      if (existingPortfolio.length > 0) {
        const existing = existingPortfolio[0];
        await base44.entities.Portfolio.update(existing.id, {
          shares: existing.shares + reward.shares
        });
      } else {
        await base44.entities.Portfolio.create({
          player_id: player.id,
          ticker: reward.ticker,
          shares: reward.shares,
          avg_acquisition_price: reward.price || 0,
          total_invested: 0
        });
      }
    } else if (reward.type === 'powerup') {
      // Add powerup to inventory
      await base44.entities.Inventory.create({
        player_id: player.id,
        item_id: reward.id,
        item_type: 'effect',
        acquired_at: new Date().toISOString()
      });
    }

    await updatePlayerMutation.mutateAsync(updates);

    // Record loot box
    await base44.entities.LootBox.create({
      player_id: player.id,
      tier,
      reward_type: reward.type,
      reward_value: reward.value || 0,
      stock_ticker: reward.type === 'stock' ? reward.ticker : null
    });

    // Transaction
    const rewardDesc = reward.type === 'stock' 
      ? `${reward.shares} ${reward.ticker} shares` 
      : reward.type === 'powerup'
      ? reward.name
      : `${reward.value} ${reward.type}`;
    
    await base44.entities.Transaction.create({
      player_id: player.id,
      type: 'purchase',
      description: `Opened ${tier} loot box: ${rewardDesc}`,
      premium_currency_change: -gemCost,
      stock_ticker: reward.type === 'stock' ? reward.ticker : null,
      shares_change: reward.type === 'stock' ? reward.shares : 0
    });

    setSuccessMessage(`Claimed: ${rewardDesc}`);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

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

  const { data: themeInventory = [] } = useQuery({
    queryKey: ['themeInventory', player?.id],
    queryFn: async () => {
      if (!player?.id) return [];
      return base44.entities.Inventory.filter({ player_id: player.id, item_type: 'theme' });
    },
    enabled: !!player?.id
  });

  // Calculate dynamic pricing based on economy health (simplified)
  const economyHealth = player ? (player.soft_currency / (player.level * 500)) : 1;
  
  const getPowerUpPrice = (powerUp) => {
    return calculateDynamicPricing(powerUp.basePrice, economyHealth);
  };

  const purchasePowerUpMutation = useMutation({
    mutationFn: async (powerUp) => {
      const actualPrice = getPowerUpPrice(powerUp);
      if ((player.premium_currency || 0) < actualPrice) {
        throw new Error('Insufficient gems');
      }

      const newBalance = (player.premium_currency || 0) - actualPrice;
      await base44.entities.Player.update(player.id, {
        premium_currency: Math.max(0, newBalance)
      });

      // Add to inventory instead of immediately activating
      const existing = await base44.entities.PowerUpInventory.filter({
        player_id: player.id,
        power_up_id: powerUp.id,
        is_active: false
      });

      if (existing.length > 0) {
        await base44.entities.PowerUpInventory.update(existing[0].id, {
          quantity: existing[0].quantity + 1
        });
      } else {
        await base44.entities.PowerUpInventory.create({
          player_id: player.id,
          power_up_id: powerUp.id,
          power_up_name: powerUp.name,
          power_up_type: powerUp.category === 'raid' ? 'guild' : 'personal',
          quantity: 1,
          duration_hours: powerUp.duration ? powerUp.duration / 3600 : 0,
          effect_data: { instant: powerUp.instant || false }
        });
      }
      
      await base44.entities.Transaction.create({
        player_id: player.id,
        type: 'purchase',
        description: `Purchased ${powerUp.name}`,
        premium_currency_change: -actualPrice
      });

      return powerUp;
    },
    onSuccess: (powerUp) => {
      queryClient.invalidateQueries(['player']);
      queryClient.invalidateQueries(['powerUpInventory']);
      setSuccessMessage(`${powerUp.name} added to inventory!`);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  });

  const canAffordPowerUp = (powerUp) => {
    const price = getPowerUpPrice(powerUp);
    return (player?.premium_currency || 0) >= price;
  };

  const handlePurchasePowerUp = (powerUp) => {
    if (!canAffordPowerUp(powerUp)) return;
    setSelectedPowerUp(powerUp);
  };

  const confirmPowerUpPurchase = () => {
    if (selectedPowerUp) {
      purchasePowerUpMutation.mutate(selectedPowerUp);
      setSelectedPowerUp(null);
    }
  };

  // Theme bundle creation (from ThemeShop)
  const createThemeBundles = () => {
    const now = Date.now();
    const day = 86400000;

    return [
      { id: 'investor_prestige', name: 'Investor Prestige', coinPrice: 5000, gemPrice: 400, usdPrice: 2.99, description: 'Gold UI theme + animated icons', limitedTime: false },
      { id: 'tropical_chill', name: 'Tropical Chill', coinPrice: 3000, gemPrice: 250, usdPrice: 1.99, description: 'Relaxed ocean theme', limitedTime: false },
      { id: 'cyber_bull', name: 'Cyber Bull Pack', coinPrice: 10000, gemPrice: 800, usdPrice: 4.99, description: 'Neon UI + animated frame', limitedTime: true, endTime: now + (2 * day) },
      { id: 'wall_street_elite', name: 'Wall Street Elite', coinPrice: 15000, gemPrice: 1200, usdPrice: 7.99, description: 'Marble theme + golden accents', limitedTime: false }
    ];
  };

  const purchaseThemeMutation = useMutation({
    mutationFn: async ({ bundle, paymentType }) => {
      const owned = themeInventory.find(i => i.item_name === bundle.name);
      if (owned) throw new Error('Already owned');

      let updates = {};
      if (paymentType === 'coins') {
        if (player.soft_currency < bundle.coinPrice) throw new Error('Insufficient coins');
        updates.soft_currency = Math.max(0, player.soft_currency - bundle.coinPrice);
      } else if (paymentType === 'gems') {
        if (player.premium_currency < bundle.gemPrice) throw new Error('Insufficient gems');
        updates.premium_currency = Math.max(0, player.premium_currency - bundle.gemPrice);
      }

      await base44.entities.Player.update(player.id, updates);
      await base44.entities.Inventory.create({
        player_id: player.id,
        item_type: 'theme',
        item_name: bundle.name,
        item_id: bundle.id
      });

      await base44.entities.Transaction.create({
        player_id: player.id,
        type: 'purchase',
        description: `Purchased theme: ${bundle.name}`,
        soft_currency_change: paymentType === 'coins' ? -bundle.coinPrice : 0,
        premium_currency_change: paymentType === 'gems' ? -bundle.gemPrice : 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['player']);
      queryClient.invalidateQueries(['themeInventory']);
      setSelectedThemePurchase(null);
      setSuccessMessage('Theme purchased!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
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
                <ShoppingBag className="w-8 h-8 text-purple-400" />
                Premium Store
              </h1>
              <p className="text-slate-400">Purchase coins and exclusive power-ups</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-xl border border-slate-700">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-bold">{player?.soft_currency?.toLocaleString() || 0}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-xl border border-slate-700">
              <Gem className="w-5 h-5 text-purple-400" />
              <span className="text-white font-bold">{player?.premium_currency || 0}</span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="lootboxes" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700 grid grid-cols-2 md:grid-cols-6">
            <TabsTrigger value="lootboxes">
              <Package className="w-4 h-4 mr-2" />
              Loot Boxes
            </TabsTrigger>
            <TabsTrigger value="themes">
              <Sparkles className="w-4 h-4 mr-2" />
              Themes
            </TabsTrigger>
            <TabsTrigger value="gems">
              <Gem className="w-4 h-4 mr-2" />
              Gems (USD)
            </TabsTrigger>
            <TabsTrigger value="coins">
              <DollarSign className="w-4 h-4 mr-2" />
              Coins
            </TabsTrigger>
            <TabsTrigger value="powerups">
              <Zap className="w-4 h-4 mr-2" />
              Power-Ups
            </TabsTrigger>
            <TabsTrigger value="raid">
              <Shield className="w-4 h-4 mr-2" />
              Raid Items
            </TabsTrigger>
          </TabsList>

          {/* Themes Tab */}
          <TabsContent value="themes">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-400" />
                Exclusive Themes & Bundles
              </h3>
              <p className="text-slate-400">
                Customize your game with stunning visual themes and special effects
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {createThemeBundles().map(bundle => (
                <ThemeBundleCard
                  key={bundle.id}
                  bundle={bundle}
                  owned={themeInventory.some(i => i.item_name === bundle.name)}
                  playerCoins={player?.soft_currency || 0}
                  playerGems={player?.premium_currency || 0}
                  onPurchase={(bundle, paymentType) => setSelectedThemePurchase({ bundle, paymentType })}
                />
              ))}
            </div>
          </TabsContent>

          {/* Loot Boxes Tab */}
          <TabsContent value="lootboxes">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-400" />
                Mystery Loot Boxes
              </h3>
              <p className="text-slate-400">
                Open boxes to receive random rewards like coins, XP, gems, and more!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <LootBoxCard
                tier="common"
                playerGems={player?.premium_currency || 0}
                onOpen={handleOpenLootBox}
                economyHealth={economyHealth}
              />
              <LootBoxCard
                tier="rare"
                playerGems={player?.premium_currency || 0}
                onOpen={handleOpenLootBox}
                economyHealth={economyHealth}
              />
              <LootBoxCard
                tier="legendary"
                playerGems={player?.premium_currency || 0}
                onOpen={handleOpenLootBox}
                economyHealth={economyHealth}
              />
              <LootBoxCard
                tier="mythical"
                playerGems={player?.premium_currency || 0}
                onOpen={handleOpenLootBox}
                economyHealth={economyHealth}
              />
            </div>
          </TabsContent>

          {/* Gem Bundles Tab */}
          <TabsContent value="gems">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {GEM_BUNDLES.map((bundle, index) => (
                <motion.div
                  key={bundle.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/50 hover:border-purple-400 transition-all rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-bold">{bundle.name}</h3>
                      <Gem className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="text-center mb-4">
                      <p className="text-5xl font-bold text-purple-400 mb-2">{bundle.amount}</p>
                      {bundle.bonus > 0 && (
                        <div className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs inline-block mb-2">
                          +{bundle.bonus} BONUS
                        </div>
                      )}
                      <p className="text-white text-3xl font-bold mt-2">${bundle.price}</p>
                      <p className="text-slate-400 text-sm">USD</p>
                    </div>
                    <Button
                      onClick={() => alert('Payment integration coming soon! This will use Stripe to process real USD payments.')}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Purchase
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-blue-400 text-sm flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Secure payments powered by Stripe. All transactions are encrypted and protected.
              </p>
            </div>
          </TabsContent>

          {/* Coin Bundles Tab */}
          <TabsContent value="coins">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-blue-300 font-medium">Payment Integration Required</p>
                  <p className="text-blue-300/80 text-sm mt-1">
                    To enable real USD purchases with Plaid/Stripe, backend functions must be enabled. 
                    Contact support to set up secure payment processing.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {COIN_BUNDLES.map((bundle, index) => (
                <motion.div
                  key={bundle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`relative p-6 rounded-xl border transition-all ${
                    bundle.popular 
                      ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/50' 
                      : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {bundle.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                      <span className="text-white text-xs font-bold">MOST POPULAR</span>
                    </div>
                  )}

                  <div className="text-center mb-4">
                    <Coins className="w-12 h-12 mx-auto mb-3 text-yellow-400" />
                    <h3 className="text-2xl font-bold text-white mb-1">
                      {bundle.coins.toLocaleString()}
                    </h3>
                    {bundle.bonus > 0 && (
                      <p className="text-green-400 text-sm">
                        +{bundle.bonus.toLocaleString()} Bonus!
                      </p>
                    )}
                  </div>

                  <div className="text-center mb-4">
                    <p className="text-3xl font-bold text-white">${bundle.price}</p>
                    <p className="text-slate-400 text-sm">One-time purchase</p>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    onClick={() => setSelectedBundle(bundle)}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Purchase
                  </Button>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Power-Ups Tab */}
          <TabsContent value="powerups">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Exclusive Power-Ups
              </h3>
              <p className="text-slate-400">
                Boost your progress with powerful temporary effects
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {POWER_UPS.filter(p => p.category === 'general').map((powerUp, index) => {
                const Icon = powerUp.icon;
                const actualPrice = getPowerUpPrice(powerUp);
                const canAfford = canAffordPowerUp(powerUp);

                return (
                  <motion.div
                    key={powerUp.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-5 rounded-xl border transition-all ${
                      canAfford 
                        ? 'bg-slate-800/50 border-slate-700 hover:border-slate-600' 
                        : 'bg-slate-800/30 border-slate-700/50 opacity-60'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${powerUp.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    <h4 className="text-lg font-bold text-white mb-2">{powerUp.name}</h4>
                    <p className="text-slate-400 text-sm mb-4">{powerUp.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <Gem className="w-5 h-5 text-purple-400" />
                          <span className="text-purple-400 font-bold text-lg">{actualPrice}</span>
                        </div>
                        {actualPrice !== powerUp.basePrice && (
                          <span className="text-xs text-slate-400 line-through">{powerUp.basePrice}</span>
                        )}
                      </div>
                      
                      <Button
                        onClick={() => handlePurchasePowerUp(powerUp)}
                        disabled={!canAfford}
                        size="sm"
                        className={`${
                          canAfford 
                            ? `bg-gradient-to-r ${powerUp.color}` 
                            : 'bg-slate-700'
                        }`}
                      >
                        Activate
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          {/* Guild Raid Items Tab */}
          <TabsContent value="raid">
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-6">
              <h3 className="text-red-400 font-bold mb-2 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Guild Raid Enhancements
              </h3>
              <p className="text-slate-300 text-sm">
                Strategic power-ups to dominate guild raids - boost attack, fortify defense, and maximize loot
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {POWER_UPS.filter(p => p.category === 'raid').map((powerUp, index) => {
                const Icon = powerUp.icon;
                const raidPrice = getPowerUpPrice(powerUp);
                const canAfford = canAffordPowerUp(powerUp);

                return (
                  <motion.div
                    key={powerUp.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-5 rounded-xl border transition-all ${
                      canAfford 
                        ? 'bg-slate-800/50 border-slate-700 hover:border-slate-600' 
                        : 'bg-slate-800/30 border-slate-700/50 opacity-60'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${powerUp.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    <h4 className="text-lg font-bold text-white mb-2">{powerUp.name}</h4>
                    <p className="text-slate-400 text-sm mb-4">{powerUp.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <Gem className="w-5 h-5 text-purple-400" />
                          <span className="text-purple-400 font-bold text-lg">{raidPrice}</span>
                        </div>
                        {raidPrice !== powerUp.basePrice && (
                          <span className="text-xs text-slate-400 line-through">{powerUp.basePrice}</span>
                        )}
                      </div>
                      
                      <Button
                        onClick={() => handlePurchasePowerUp(powerUp)}
                        disabled={!canAfford}
                        size="sm"
                        className={`${
                          canAfford 
                            ? `bg-gradient-to-r ${powerUp.color}` 
                            : 'bg-slate-700'
                        }`}
                      >
                        <ShoppingBag className="w-4 h-4 mr-1" />
                        Buy
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Bundle Purchase Dialog */}
      <Dialog open={!!selectedBundle} onOpenChange={() => setSelectedBundle(null)}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Payment Integration Required</DialogTitle>
          </DialogHeader>
          {selectedBundle && (
            <div className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-blue-300 text-sm">
                  To purchase this bundle, backend functions must be enabled to integrate secure payment processing 
                  (Stripe/Plaid). Please enable backend functions in your app settings to activate real payments.
                </p>
              </div>
              <div className="text-center">
                <Coins className="w-16 h-16 mx-auto mb-3 text-yellow-400" />
                <h3 className="text-xl font-bold text-white">{selectedBundle.coins.toLocaleString()} Coins</h3>
                {selectedBundle.bonus > 0 && (
                  <p className="text-green-400">+{selectedBundle.bonus.toLocaleString()} Bonus</p>
                )}
                <p className="text-3xl font-bold text-white mt-2">${selectedBundle.price}</p>
              </div>
              <Button variant="outline" onClick={() => setSelectedBundle(null)} className="w-full border-slate-600 text-slate-300">
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Theme Purchase Confirmation */}
      <Dialog open={!!selectedThemePurchase} onOpenChange={() => setSelectedThemePurchase(null)}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Confirm Theme Purchase</DialogTitle>
          </DialogHeader>
          {selectedThemePurchase && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">{selectedThemePurchase.bundle.name}</h3>
                <p className="text-slate-400 text-sm">{selectedThemePurchase.bundle.description}</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <p className="text-white font-medium">
                  Payment: {selectedThemePurchase.paymentType === 'coins' 
                    ? `${selectedThemePurchase.bundle.coinPrice.toLocaleString()} Coins` 
                    : `${selectedThemePurchase.bundle.gemPrice.toLocaleString()} Gems`}
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setSelectedThemePurchase(null)} className="flex-1 border-slate-600">
                  Cancel
                </Button>
                <Button onClick={() => purchaseThemeMutation.mutate(selectedThemePurchase)} className="flex-1 bg-purple-600 hover:bg-purple-700">
                  Confirm Purchase
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Power-Up Confirmation Dialog */}
      <Dialog open={!!selectedPowerUp} onOpenChange={() => setSelectedPowerUp(null)}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Activate Power-Up</DialogTitle>
          </DialogHeader>
          {selectedPowerUp && (
            <div className="space-y-4">
              <div className={`w-20 h-20 rounded-xl bg-gradient-to-br ${selectedPowerUp.color} flex items-center justify-center mx-auto`}>
                <selectedPowerUp.icon className="w-10 h-10 text-white" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">{selectedPowerUp.name}</h3>
                <p className="text-slate-400">{selectedPowerUp.description}</p>
              </div>
              <div className="flex items-center justify-center gap-2 py-3 bg-purple-500/20 rounded-lg">
                <Gem className="w-6 h-6 text-purple-400" />
                <span className="text-purple-400 font-bold text-xl">{getPowerUpPrice(selectedPowerUp)} Gems</span>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setSelectedPowerUp(null)} className="flex-1 border-slate-600 text-slate-300">
                  Cancel
                </Button>
                <Button onClick={confirmPowerUpPurchase} className={`flex-1 bg-gradient-to-r ${selectedPowerUp.color}`}>
                  Activate Now
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-green-600 rounded-full flex items-center gap-2 shadow-lg"
          >
            <CheckCircle className="w-5 h-5 text-white" />
            <span className="text-white font-medium">{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}