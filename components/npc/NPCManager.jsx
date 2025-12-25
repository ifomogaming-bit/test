import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

// Initialize 100 NPCs in batches to avoid rate limits
export async function initializeNPCs() {
  try {
    const existingNPCs = await base44.entities.NPCProfile.list();
    
    if (existingNPCs.length >= 100) {
      console.log('NPCs already initialized');
      return;
    }

    const difficulties = ['normal', 'normal', 'normal', 'normal', 'normal', 'normal', 'medium', 'medium', 'medium', 'hard'];
    const behaviors = ['conservative', 'aggressive', 'balanced', 'risk_taker', 'day_trader'];
    const specializations = ['stocks', 'crypto', 'options', 'mixed'];
    
    const npcNames = [
      'TraderBot', 'StockHawk', 'CryptoKing', 'BullRun', 'BearSlayer',
      'DiamondHands', 'PaperHands', 'MoonShot', 'DipBuyer', 'WhaleWatcher',
      'ChartMaster', 'TrendFollower', 'ValueHunter', 'GrowthSeeker', 'DayTrader',
      'SwingKing', 'ScalpMaster', 'OptionsPro', 'HedgeFund', 'IndexTracker',
      'DividendKing', 'MomentumRider', 'MeanReverts', 'ArbitrageBot', 'AlgoTrader',
      'QuantKing', 'TechBull', 'EnergyBear', 'FinanceGuru', 'RetailRookie',
      'CryptoWhale', 'BitcoinMaxi', 'EthereumFan', 'AltcoinAlly', 'DefiDegen',
      'NFTCollector', 'YieldFarmer', 'StableSwapper', 'LeverageLord', 'MarginMaster',
      'RiskManager', 'VolatilityKing', 'GammaGang', 'ThetaGang', 'DeltaHedger',
      'IronCondor', 'ButterflyMaestro', 'StraddleKing', 'SpreadMaster', 'CallWriter',
      'PutProtector', 'CoveredCaller', 'WheelRunner', 'PMCCPro', 'LeapLover',
      'PortfolioBalancer', 'AssetAllocator', 'DiversifyDan', 'ConcentrateCarl', 'SectorRotator',
      'SmallCapHunter', 'LargeCapLord', 'MidCapMike', 'PennyPusher', 'BlueChipBob',
      'GrowthGuru', 'ValueVince', 'QualityQueen', 'MomentumMary', 'LowVolLarry',
      'HighBetaHank', 'ZeroBetaZoe', 'SmartBetaSam', 'FactorFrank', 'RiskParityPat',
      'GlobalGary', 'EmergingEllie', 'BondBaron', 'FixedIncomePhil', 'CreditCarla',
      'MacroMike', 'MicroMolly', 'FundamentalFred', 'TechnicalTina', 'QuantitativeQuinn',
      'EventDrivenEve', 'MergerMaven', 'SpinoffStan', 'DistressedDave', 'ActivistAnna',
      'LongOnlyLeo', 'LongShortLucy', 'MarketNeutralNed', 'StatArbSteve', 'PairsTraderPete',
      'CommodityClaire', 'ForexFiona', 'RateTradingRob', 'InflationHedger', 'DeflationDana'
    ];

    // Create in smaller batches of 5 to avoid rate limits
    const BATCH_SIZE = 5;
    const numBatches = Math.ceil(100 / BATCH_SIZE);

    for (let batch = 0; batch < numBatches; batch++) {
      const start = batch * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, 100);
      
      const playersToCreate = [];
      const npcsToCreate = [];

      for (let i = start; i < end; i++) {
        const difficulty = difficulties[i % difficulties.length];
        const behavior = behaviors[Math.floor(Math.random() * behaviors.length)];
        const specialization = specializations[Math.floor(Math.random() * specializations.length)];
        const activityLevel = difficulty === 'hard' ? 1.5 + Math.random() * 0.5 : 
                             difficulty === 'medium' ? 1.0 + Math.random() * 0.5 : 
                             0.5 + Math.random() * 0.5;

        playersToCreate.push({
          username: `${npcNames[i]} ${i + 1}`,
          level: 1,
          xp: 0,
          soft_currency: 25000,
          premium_currency: 100,
          unlocked_maps: [1],
          current_map: 1,
          bubbles_popped_today: 0,
          streak: 0,
          total_correct_answers: 0,
          total_bubbles_popped: 0,
          achievements: [],
          pvp_rating: 1000,
          pvp_wins: 0,
          pvp_losses: 0
        });
      }

      // Create players in batch
      const createdPlayers = await base44.entities.Player.bulkCreate(playersToCreate);

      // Create NPC profiles for this batch
      createdPlayers.forEach((player, idx) => {
        const i = start + idx;
        const difficulty = difficulties[i % difficulties.length];
        const behavior = behaviors[Math.floor(Math.random() * behaviors.length)];
        const specialization = specializations[Math.floor(Math.random() * specializations.length)];
        const activityLevel = difficulty === 'hard' ? 1.5 + Math.random() * 0.5 : 
                             difficulty === 'medium' ? 1.0 + Math.random() * 0.5 : 
                             0.5 + Math.random() * 0.5;

        npcsToCreate.push({
          player_id: player.id,
          difficulty,
          behavior_type: behavior,
          specialization,
          activity_level: activityLevel,
          last_action_time: new Date().toISOString()
        });
      });

      await base44.entities.NPCProfile.bulkCreate(npcsToCreate);

      console.log(`✓ Batch ${batch + 1}/${numBatches} complete (${end} NPCs)`);

      // Wait 8 seconds between batches to avoid rate limits
      if (batch < numBatches - 1) {
        await new Promise(resolve => setTimeout(resolve, 8000));
      }
    }

    console.log('✓ All 100 NPCs initialized successfully');
  } catch (error) {
    console.error('Failed to initialize NPCs:', error);
  }
}

// NPC Manager Component
export default function NPCManager() {
  useEffect(() => {
    const checkAndInit = async () => {
      try {
        const npcs = await base44.entities.NPCProfile.list('', 5);
        if (npcs.length === 0) {
          console.log('No NPCs found, initializing in background...');
          // Delay initialization to prevent startup rate limits
          setTimeout(() => initializeNPCs(), 10000);
        }
      } catch (error) {
        console.error('NPC check failed:', error);
      }
    };

    // Delay initial check
    const timer = setTimeout(checkAndInit, 5000);
    return () => clearTimeout(timer);
  }, []);

  return null;
}