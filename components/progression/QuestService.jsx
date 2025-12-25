import { base44 } from '@/api/base44Client';

const QUEST_TEMPLATES = [
  { quest_type: 'answer_questions', description: 'Answer 5 questions correctly', target: 5, reward_type: 'coins', reward_amount: 250 },
  { quest_type: 'answer_questions', description: 'Answer 10 questions correctly', target: 10, reward_type: 'gems', reward_amount: 15 },
  { quest_type: 'answer_questions', description: 'Answer 15 questions correctly', target: 15, reward_type: 'xp', reward_amount: 600 },
  { quest_type: 'answer_questions', description: 'Answer 20 questions correctly', target: 20, reward_type: 'gems', reward_amount: 55 },
  { quest_type: 'answer_questions', description: 'Get 8 consecutive correct answers', target: 8, reward_type: 'gems', reward_amount: 35 },
  { quest_type: 'answer_questions', description: 'Answer 3 advanced options questions', target: 3, reward_type: 'xp', reward_amount: 400 },
  { quest_type: 'answer_questions', description: 'Answer 5 crypto-related questions', target: 5, reward_type: 'coins', reward_amount: 350 },
  { quest_type: 'pop_bubbles', description: 'Pop 15 stock bubbles', target: 15, reward_type: 'coins', reward_amount: 200 },
  { quest_type: 'pop_bubbles', description: 'Pop 20 stock bubbles', target: 20, reward_type: 'gems', reward_amount: 30 },
  { quest_type: 'pop_bubbles', description: 'Pop 30 bubbles in one session', target: 30, reward_type: 'xp', reward_amount: 750 },
  { quest_type: 'pop_bubbles', description: 'Pop 3 Rare or Epic bubbles', target: 3, reward_type: 'xp', reward_amount: 200 },
  { quest_type: 'pop_bubbles', description: 'Pop 1 Legendary bubble', target: 1, reward_type: 'gems', reward_amount: 50 },
  { quest_type: 'pop_bubbles', description: 'Pop 5 Epic bubbles', target: 5, reward_type: 'gems', reward_amount: 70 },
  { quest_type: 'open_lootboxes', description: 'Open 3 Loot Boxes', target: 3, reward_type: 'gems', reward_amount: 20 },
  { quest_type: 'open_lootboxes', description: 'Open 5 Loot Boxes', target: 5, reward_type: 'coins', reward_amount: 500 },
  { quest_type: 'open_lootboxes', description: 'Open 1 Legendary Loot Box', target: 1, reward_type: 'xp', reward_amount: 800 },
  { quest_type: 'trade_stocks', description: 'Complete 5 stock trades', target: 5, reward_type: 'coins', reward_amount: 350 },
  { quest_type: 'trade_stocks', description: 'Complete 10 stock trades', target: 10, reward_type: 'gems', reward_amount: 40 },
  { quest_type: 'trade_stocks', description: 'Trade 3 different stocks', target: 3, reward_type: 'xp', reward_amount: 300 },
  { quest_type: 'trade_stocks', description: 'Execute 1 profitable trade', target: 1, reward_type: 'coins', reward_amount: 350 },
  { quest_type: 'trade_stocks', description: 'Trade in 3 different sectors', target: 3, reward_type: 'gems', reward_amount: 40 },
  { quest_type: 'win_pvp', description: 'Win 3 PvP matches', target: 3, reward_type: 'xp', reward_amount: 400 },
  { quest_type: 'win_pvp', description: 'Win 5 PvP matches', target: 5, reward_type: 'gems', reward_amount: 50 },
  { quest_type: 'win_pvp', description: 'Win PvP match without losing streak', target: 1, reward_type: 'coins', reward_amount: 500 },
  { quest_type: 'win_pvp', description: 'Win 3 PvP matches in a row', target: 3, reward_type: 'gems', reward_amount: 65 },
  { quest_type: 'earn_coins', description: 'Earn 500 coins', target: 500, reward_type: 'gems', reward_amount: 25 },
  { quest_type: 'earn_coins', description: 'Earn 1000 coins', target: 1000, reward_type: 'xp', reward_amount: 500 },
  { quest_type: 'earn_coins', description: 'Earn 2500 coins in one day', target: 2500, reward_type: 'gems', reward_amount: 60 },
  { quest_type: 'earn_coins', description: 'Earn 5000 coins in one day', target: 5000, reward_type: 'gems', reward_amount: 120 },
  { quest_type: 'sector_specific', description: 'Answer 5 Tech sector questions correctly', target: 5, reward_type: 'coins', reward_amount: 300, sector: 'tech' },
  { quest_type: 'sector_specific', description: 'Answer 5 Finance sector questions correctly', target: 5, reward_type: 'coins', reward_amount: 300, sector: 'finance' },
  { quest_type: 'sector_specific', description: 'Answer 3 Crypto questions correctly', target: 3, reward_type: 'gems', reward_amount: 35, sector: 'crypto' },
  { quest_type: 'sector_specific', description: 'Answer 7 Healthcare sector questions', target: 7, reward_type: 'xp', reward_amount: 450, sector: 'healthcare' },
  { quest_type: 'maintain_streak', description: 'Maintain a 5x streak', target: 5, reward_type: 'xp', reward_amount: 350 },
  { quest_type: 'maintain_streak', description: 'Maintain a 10x streak', target: 10, reward_type: 'gems', reward_amount: 50 },
  { quest_type: 'maintain_streak', description: 'Reach a 15x streak', target: 15, reward_type: 'gems', reward_amount: 80 },
  { quest_type: 'maintain_streak', description: 'Reach a 20x streak', target: 20, reward_type: 'gems', reward_amount: 120 },
  { quest_type: 'portfolio_value', description: 'Reach $5,000 portfolio value', target: 5000, reward_type: 'coins', reward_amount: 300 },
  { quest_type: 'portfolio_value', description: 'Reach $10,000 portfolio value', target: 10000, reward_type: 'gems', reward_amount: 45 },
  { quest_type: 'portfolio_value', description: 'Reach $25,000 portfolio value', target: 25000, reward_type: 'gems', reward_amount: 100 },
  { quest_type: 'join_guild', description: 'Join or create a guild', target: 1, reward_type: 'coins', reward_amount: 500 },
  { quest_type: 'guild_contribution', description: 'Contribute 1000 coins to guild', target: 1000, reward_type: 'xp', reward_amount: 400 },
  { quest_type: 'guild_contribution', description: 'Contribute 2500 coins to guild', target: 2500, reward_type: 'gems', reward_amount: 55 },
  { quest_type: 'complete_wager', description: 'Complete 1 wager bet', target: 1, reward_type: 'coins', reward_amount: 350 },
  { quest_type: 'complete_wager', description: 'Win 3 wager bets', target: 3, reward_type: 'gems', reward_amount: 70 },
  { quest_type: 'create_strategy', description: 'Create 1 trading strategy', target: 1, reward_type: 'xp', reward_amount: 250 },
  { quest_type: 'create_strategy', description: 'Backtest 1 trading strategy', target: 1, reward_type: 'coins', reward_amount: 300 },
  { quest_type: 'follow_trader', description: 'Follow 3 traders in Social Trading', target: 3, reward_type: 'coins', reward_amount: 200 },
  { quest_type: 'follow_trader', description: 'Copy trade 1 successful strategy', target: 1, reward_type: 'xp', reward_amount: 350 },
  { quest_type: 'daily_login', description: 'Login 3 days in a row', target: 3, reward_type: 'gems', reward_amount: 25 },
  { quest_type: 'daily_login', description: 'Login 7 days in a row', target: 7, reward_type: 'gems', reward_amount: 75 },
  { quest_type: 'use_powerup', description: 'Use 3 power-ups', target: 3, reward_type: 'coins', reward_amount: 250 },
  { quest_type: 'options_trading', description: 'Execute 2 options trades', target: 2, reward_type: 'xp', reward_amount: 400 },
  { quest_type: 'options_trading', description: 'Close 1 profitable options position', target: 1, reward_type: 'gems', reward_amount: 45 },
  { quest_type: 'portfolio_diversity', description: 'Own stocks from 5 different sectors', target: 5, reward_type: 'coins', reward_amount: 400 },
  { quest_type: 'watch_ads', description: 'Watch 3 reward videos', target: 3, reward_type: 'coins', reward_amount: 150 },
  { quest_type: 'complete_tutorial', description: 'Complete trading tutorial', target: 1, reward_type: 'gems', reward_amount: 50 },
  { quest_type: 'raid_participation', description: 'Participate in 1 guild raid', target: 1, reward_type: 'xp', reward_amount: 500 },
  { quest_type: 'work_shifts', description: 'Complete 3 work shifts', target: 3, reward_type: 'coins', reward_amount: 300 },
  { quest_type: 'work_shifts', description: 'Complete 5 work shifts in one day', target: 5, reward_type: 'gems', reward_amount: 50 },
  { quest_type: 'stock_research', description: 'Check 10 different stock charts', target: 10, reward_type: 'xp', reward_amount: 250 },
  { quest_type: 'perfect_answers', description: 'Answer 5 questions without mistakes', target: 5, reward_type: 'gems', reward_amount: 40 },
  { quest_type: 'market_timing', description: 'Buy a stock that gains 5%+ today', target: 1, reward_type: 'coins', reward_amount: 500 },
  { quest_type: 'diversification', description: 'Own stocks from 3 different sectors', target: 3, reward_type: 'xp', reward_amount: 350 },
  { quest_type: 'quick_profit', description: 'Make 3 profitable trades', target: 3, reward_type: 'gems', reward_amount: 45 },
  { quest_type: 'guild_teamwork', description: 'Send 10 messages in guild chat', target: 10, reward_type: 'coins', reward_amount: 200 },
  { quest_type: 'wealth_builder', description: 'Earn 3000 coins total today', target: 3000, reward_type: 'gems', reward_amount: 55 },
  { quest_type: 'social_trader', description: 'Follow 5 different traders', target: 5, reward_type: 'xp', reward_amount: 300 },
  { quest_type: 'options_mastery', description: 'Execute 3 options contracts', target: 3, reward_type: 'gems', reward_amount: 60 },
  { quest_type: 'portfolio_size', description: 'Own 10+ different assets', target: 10, reward_type: 'coins', reward_amount: 400 },
  { quest_type: 'high_roller', description: 'Make a single trade worth 5000+ coins', target: 1, reward_type: 'xp', reward_amount: 450 },
  { quest_type: 'bargain_hunter', description: 'Buy 3 stocks at 5%+ discount', target: 3, reward_type: 'gems', reward_amount: 35 },
  { quest_type: 'guild_investor', description: 'Vote on 2 guild investment proposals', target: 2, reward_type: 'coins', reward_amount: 250 },
  { quest_type: 'map_explorer', description: 'Play on 3 different maps', target: 3, reward_type: 'xp', reward_amount: 400 },
  { quest_type: 'winning_streak', description: 'Win 2 PvP matches in a row', target: 2, reward_type: 'gems', reward_amount: 50 },
  { quest_type: 'crypto_trader', description: 'Trade 2 cryptocurrencies', target: 2, reward_type: 'coins', reward_amount: 350 },
  { quest_type: 'long_term', description: 'Hold a stock for 7 days', target: 1, reward_type: 'xp', reward_amount: 500 },
  { quest_type: 'loot_collector', description: 'Open 2 loot boxes', target: 2, reward_type: 'gems', reward_amount: 30 },
  { quest_type: 'power_player', description: 'Use 5 power-ups in battles', target: 5, reward_type: 'coins', reward_amount: 350 },
  { quest_type: 'achievement_hunter', description: 'Unlock 2 new achievements', target: 2, reward_type: 'gems', reward_amount: 70 },
  { quest_type: 'guild_supporter', description: 'Contribute 2000 to guild treasury', target: 2000, reward_type: 'xp', reward_amount: 600 },
  { quest_type: 'wager_master', description: 'Win 2 price prediction wagers', target: 2, reward_type: 'gems', reward_amount: 65 },
  { quest_type: 'raid_defender', description: 'Successfully defend against 1 raid', target: 1, reward_type: 'coins', reward_amount: 400 },
  { quest_type: 'market_analyzer', description: 'View 5 detailed stock charts', target: 5, reward_type: 'xp', reward_amount: 300 },
  { quest_type: 'bubble_master', description: 'Pop 25 bubbles today', target: 25, reward_type: 'gems', reward_amount: 55 },
  { quest_type: 'early_bird', description: 'Complete first task before 10 AM', target: 1, reward_type: 'coins', reward_amount: 300 },
  { quest_type: 'night_owl', description: 'Trade after 8 PM', target: 1, reward_type: 'coins', reward_amount: 250 }
];

export async function generateDailyQuests(playerId) {
  // Check if player already has quests for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const existingQuests = await base44.entities.DailyQuest.filter({
    player_id: playerId
  });

  const todayQuests = existingQuests.filter(q => {
    const questDate = new Date(q.created_date);
    questDate.setHours(0, 0, 0, 0);
    return questDate.getTime() === today.getTime();
  });

  if (todayQuests.length > 0) {
    return todayQuests;
  }

  // Generate 6-8 random quests with variety and NO duplicates
  const questCount = Math.floor(Math.random() * 3) + 6; // 6 to 8 quests
  const shuffled = [...QUEST_TEMPLATES].sort(() => Math.random() - 0.5);
  
  // Ensure variety by selecting from different quest types
  const selectedByType = new Map();
  const selected = [];
  
  for (const template of shuffled) {
    const typeCount = selectedByType.get(template.quest_type) || 0;
    if (typeCount < 2 && selected.length < questCount) { // Max 2 per type
      selected.push(template);
      selectedByType.set(template.quest_type, typeCount + 1);
    }
  }

  const expiresAt = new Date();
  expiresAt.setHours(23, 59, 59, 999);

  const quests = [];
  for (const template of selected) {
    const quest = await base44.entities.DailyQuest.create({
      player_id: playerId,
      quest_type: template.quest_type,
      quest_description: template.description,
      target_value: template.target,
      current_progress: 0,
      reward_type: template.reward_type,
      reward_amount: template.reward_amount,
      sector: template.sector,
      completed: false,
      claimed: false,
      expires_at: expiresAt.toISOString()
    });
    quests.push(quest);
  }

  return quests;
}

export async function updateQuestProgress(playerId, questType, increment = 1, sector = null) {
  const quests = await base44.entities.DailyQuest.filter({
    player_id: playerId,
    quest_type: questType,
    completed: false
  });

  for (const quest of quests) {
    // Check sector match if applicable
    if (quest.sector && quest.sector !== sector) {
      continue;
    }

    const newProgress = quest.current_progress + increment;
    const updates = {
      current_progress: newProgress
    };

    if (newProgress >= quest.target_value) {
      updates.completed = true;
    }

    await base44.entities.DailyQuest.update(quest.id, updates);
  }
}