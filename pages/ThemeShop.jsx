import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles, Clock, Star } from 'lucide-react';
import ThemeBundleCard from '@/components/shop/ThemeBundleCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Bundle definitions with rotation logic
const createBundles = () => {
  const now = Date.now();
  const day = 86400000; // 1 day in milliseconds

  return [
    // Permanent bundles
    {
      id: 'investor_prestige',
      name: 'Investor Prestige',
      coinPrice: 5000,
      gemPrice: 400,
      usdPrice: 2.99,
      description: 'Gold UI theme + animated icons',
      limitedTime: false,
      startTime: 0,
      endTime: 0
    },
    {
      id: 'tropical_chill',
      name: 'Tropical Chill',
      coinPrice: 3000,
      gemPrice: 250,
      usdPrice: 1.99,
      description: 'Relaxed ocean theme, non-animated',
      limitedTime: false,
      startTime: 0,
      endTime: 0
    },
    
    // Limited-time seasonal bundles (auto-rotating)
    {
      id: 'cyber_bull',
      name: 'Cyber Bull Pack',
      coinPrice: 10000,
      gemPrice: 800,
      usdPrice: 4.99,
      description: 'Neon UI, animated avatar frame, bonus coins',
      limitedTime: true,
      startTime: now,
      endTime: now + (2 * day)
    },
    {
      id: 'bear_survival',
      name: 'Bear Market Survival',
      coinPrice: 9000,
      gemPrice: 700,
      usdPrice: 4.49,
      description: 'Red/black crash theme + flickering graphs',
      limitedTime: true,
      startTime: now + (3 * day),
      endTime: now + (5 * day)
    },
    {
      id: 'holiday_rally',
      name: 'Holiday Rally Pack',
      coinPrice: 12000,
      gemPrice: 900,
      usdPrice: 5.99,
      description: 'Festive theme with fireworks and bonus loot',
      limitedTime: true,
      startTime: now + (10 * day),
      endTime: now + (13 * day)
    },
    {
      id: 'midnight_trader',
      name: 'Midnight Trader',
      coinPrice: 8000,
      gemPrice: 650,
      usdPrice: 3.99,
      description: 'Dark mode perfected + trading sound effects',
      limitedTime: true,
      startTime: now + (7 * day),
      endTime: now + (9 * day)
    },
    {
      id: 'wall_street_elite',
      name: 'Wall Street Elite Bundle',
      coinPrice: 15000,
      gemPrice: 1200,
      usdPrice: 7.99,
      description: 'Exclusive marble-themed map with golden accents + premium avatar frame',
      limitedTime: false,
      startTime: 0,
      endTime: 0,
      mapId: 11
    },
    {
      id: 'tokyo_neon_nights',
      name: 'Tokyo Neon Nights',
      coinPrice: 12000,
      gemPrice: 950,
      usdPrice: 5.99,
      description: 'Cyberpunk Tokyo map with neon lights + futuristic UI',
      limitedTime: true,
      startTime: now + (5 * day),
      endTime: now + (8 * day),
      mapId: 12
    },
    {
      id: 'crypto_galaxy',
      name: 'Crypto Galaxy',
      coinPrice: 18000,
      gemPrice: 1400,
      usdPrice: 9.99,
      description: 'Space-themed crypto map with planets and stars + holographic effects',
      limitedTime: false,
      startTime: 0,
      endTime: 0,
      mapId: 13
    },
    {
      id: 'gold_rush_valley',
      name: 'Gold Rush Valley',
      coinPrice: 14000,
      gemPrice: 1100,
      usdPrice: 6.99,
      description: 'Western goldmine map with realistic ore veins + prospector avatar',
      limitedTime: true,
      startTime: now + (12 * day),
      endTime: now + (15 * day),
      mapId: 14
    },
    {
      id: 'arctic_diamond_mine',
      name: 'Arctic Diamond Mine',
      coinPrice: 20000,
      gemPrice: 1600,
      usdPrice: 11.99,
      description: 'Frozen tundra map with ice crystals + aurora borealis effects',
      limitedTime: false,
      startTime: 0,
      endTime: 0,
      mapId: 15
    }
  ];
};

export default function ThemeShop() {
  const [user, setUser] = useState(null);
  const [activeBundles, setActiveBundles] = useState([]);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
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

  const { data: inventory = [] } = useQuery({
    queryKey: ['inventory', player?.id],
    queryFn: async () => {
      if (!player?.id) return [];
      return base44.entities.Inventory.filter({ player_id: player.id, item_type: 'theme' });
    },
    enabled: !!player?.id
  });

  // Filter active bundles
  useEffect(() => {
    const bundles = createBundles();
    const now = Date.now();
    const active = bundles.filter(b => 
      !b.limitedTime || (now >= b.startTime && now <= b.endTime)
    );
    setActiveBundles(active);

    // Refresh every minute to update active bundles
    const interval = setInterval(() => {
      const refreshed = bundles.filter(b => 
        !b.limitedTime || (Date.now() >= b.startTime && Date.now() <= b.endTime)
      );
      setActiveBundles(refreshed);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const purchaseMutation = useMutation({
    mutationFn: async ({ bundle, paymentType }) => {
      const owned = inventory.find(i => i.item_name === bundle.name);
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
        item_id: bundle.id,
        quantity: 1
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
      queryClient.invalidateQueries(['inventory']);
      setSelectedPurchase(null);
    }
  });

  const handlePurchase = (bundle, paymentType) => {
    setSelectedPurchase({ bundle, paymentType });
  };

  const confirmPurchase = () => {
    if (selectedPurchase) {
      purchaseMutation.mutate(selectedPurchase);
    }
  };

  const limitedBundles = activeBundles.filter(b => b.limitedTime);
  const permanentBundles = activeBundles.filter(b => !b.limitedTime);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" className="text-white">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-purple-400" />
                Theme Shop
              </h1>
              <p className="text-slate-400">Exclusive themes & bundles</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-xl border border-slate-700">
              <span className="text-yellow-400">💰</span>
              <span className="text-white font-bold">{player?.soft_currency?.toLocaleString() || 0}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-xl border border-slate-700">
              <span className="text-purple-400">💎</span>
              <span className="text-white font-bold">{player?.premium_currency || 0}</span>
            </div>
          </div>
        </div>

        {/* Limited Time Section */}
        {limitedBundles.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">Limited Time Offers</h2>
              <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                {limitedBundles.length} Active
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {limitedBundles.map(bundle => (
                <ThemeBundleCard
                  key={bundle.id}
                  bundle={bundle}
                  owned={inventory.some(i => i.item_name === bundle.name)}
                  playerCoins={player?.soft_currency || 0}
                  playerGems={player?.premium_currency || 0}
                  onPurchase={handlePurchase}
                />
              ))}
            </div>
          </div>
        )}

        {/* Permanent Themes Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">Permanent Collection</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {permanentBundles.map(bundle => (
              <ThemeBundleCard
                key={bundle.id}
                bundle={bundle}
                owned={inventory.some(i => i.item_name === bundle.name)}
                playerCoins={player?.soft_currency || 0}
                playerGems={player?.premium_currency || 0}
                onPurchase={handlePurchase}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Purchase Confirmation */}
      <Dialog open={!!selectedPurchase} onOpenChange={() => setSelectedPurchase(null)}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Confirm Purchase</DialogTitle>
          </DialogHeader>
          {selectedPurchase && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">{selectedPurchase.bundle.name}</h3>
                <p className="text-slate-400 text-sm">{selectedPurchase.bundle.description}</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <p className="text-white font-medium">
                  Payment: {selectedPurchase.paymentType === 'coins' 
                    ? `${selectedPurchase.bundle.coinPrice.toLocaleString()} Coins` 
                    : `${selectedPurchase.bundle.gemPrice.toLocaleString()} Gems`}
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setSelectedPurchase(null)} className="flex-1 border-slate-600">
                  Cancel
                </Button>
                <Button onClick={confirmPurchase} className="flex-1 bg-purple-600 hover:bg-purple-700">
                  Confirm Purchase
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}