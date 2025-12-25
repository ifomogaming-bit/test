import { Star, Gift, Shield, Swords, Zap, Target, Gem, Trophy, Users, Sparkles } from 'lucide-react';

export const TUTORIALS = {
  welcome: {
    id: 'welcome',
    title: 'Welcome to Stock Battle!',
    icon: Sparkles,
    steps: [
      {
        title: 'Welcome, Trader!',
        description: 'Stock Battle is a competitive trading game where you learn about stocks, earn rewards, and compete with players worldwide. Let\'s get you started!',
        position: 'center',
        icon: Sparkles,
        action: 'Click Next to begin your journey'
      },
      {
        title: 'Your Resources',
        description: 'You have two main currencies: Stock Coins (yellow) for gameplay and Bull Bucks (purple gems) for premium items. Earn them through gameplay!',
        target: '.currency-display',
        icon: Gem,
        action: 'Check your balance at the top'
      },
      {
        title: 'Daily Rewards',
        description: 'Come back every day to spin the wheel, claim login bonuses, and scratch cards for free rewards!',
        target: '[data-tutorial="daily-spin"]',
        icon: Gift,
        action: 'Try your Daily Spin now!'
      },
      {
        title: 'Explore Features',
        description: 'Navigate through Play, Trading, PvP, Guilds, and more using the menu. Each offers unique ways to earn and compete!',
        position: 'center',
        icon: Target,
        action: 'Start playing to level up!'
      }
    ]
  },

  skill_tree: {
    id: 'skill_tree',
    title: 'Skill Tree Mastery',
    icon: Star,
    steps: [
      {
        title: 'Power Up Your Trader',
        description: 'The Skill Tree lets you permanently upgrade your earning potential, unlock special abilities, and become more powerful!',
        position: 'center',
        icon: Star
      },
      {
        title: 'Skill Types',
        description: 'Skills are categorized by what they enhance: Bubble rewards, XP gains, coin earnings, cooldown reduction, and more. Each skill has up to 20 levels!',
        position: 'center',
        icon: Zap,
        action: 'Look for skills that match your playstyle'
      },
      {
        title: 'XP vs Gems',
        description: 'Some skills cost XP (earned from gameplay), others cost Gems (premium currency). XP skills are great for beginners, Gem skills offer powerful boosts!',
        position: 'center',
        icon: Gem,
        action: 'Choose wisely based on your resources'
      },
      {
        title: 'Progressive Costs',
        description: 'Each skill level costs more than the last. Plan your upgrades carefully! Focus on a few skills early, then branch out as you grow stronger.',
        position: 'center',
        icon: Target,
        action: 'Start with Bubble Master or Coin Magnet'
      },
      {
        title: 'Mastery Rewards',
        description: 'Max out a skill to reach MASTERED status! Some skills unlock special abilities at max level, like never losing your streak!',
        position: 'center',
        icon: Trophy,
        action: 'Unlock your first skill to continue'
      }
    ]
  },

  loot_boxes: {
    id: 'loot_boxes',
    title: 'Loot Box System',
    icon: Gift,
    steps: [
      {
        title: 'Open Loot Boxes',
        description: 'Loot boxes contain random rewards including coins, gems, XP, stock shares, level boosts, and power-ups! The higher the tier, the better the rewards.',
        position: 'center',
        icon: Gift
      },
      {
        title: 'Rarity Tiers',
        description: 'Common (8 gems) - Basic rewards. Rare (18 gems) - Better rewards + chance for legendary items. Legendary (30 gems) - Huge rewards guaranteed. Mythical (60 gems) - EPIC rewards, best value!',
        position: 'center',
        icon: Sparkles,
        action: 'Check the shop to see all tiers'
      },
      {
        title: 'Reward Types',
        description: 'You can get: Coins (currency), Gems (premium), XP (progression), Stocks (portfolio value), Levels (instant boost), or Power-ups (temporary buffs)!',
        position: 'center',
        icon: Trophy
      },
      {
        title: 'Smart Strategy',
        description: 'Save gems for Legendary or Mythical boxes for best value! Common boxes are good for quick small rewards, but rare+ boxes have much better odds.',
        position: 'center',
        icon: Target,
        action: 'Visit the Shop to open your first box!'
      }
    ]
  },

  guilds: {
    id: 'guilds',
    title: 'Guild System',
    icon: Shield,
    steps: [
      {
        title: 'Join a Guild',
        description: 'Guilds are teams of players working together! Share strategies, pool resources, compete in wars, and dominate the leaderboards together.',
        position: 'center',
        icon: Shield
      },
      {
        title: 'Guild Benefits',
        description: 'Access guild chat, shared treasury, tournaments, raids, wars, and exclusive guild-only events. Stronger together than alone!',
        position: 'center',
        icon: Users,
        action: 'Browse available guilds'
      },
      {
        title: 'Roles & Permissions',
        description: 'Guilds have hierarchy: Leader → Co-Leader → War General → Lieutenant → Officer → Veteran → Member → Recruit. Higher ranks unlock more permissions!',
        position: 'center',
        icon: Trophy
      },
      {
        title: 'Guild Treasury',
        description: 'Contribute coins to your guild\'s shared treasury. Leaders can create investment proposals that members vote on. Earn profits together!',
        position: 'center',
        icon: Gem,
        action: 'Contribute to earn respect and influence'
      },
      {
        title: 'Wars & Raids',
        description: 'Battle other guilds in 48-hour wars, raid enemy vaults for loot, and compete in tournaments for massive prize pools!',
        position: 'center',
        icon: Swords,
        action: 'Join or create a guild to get started'
      }
    ]
  },

  pvp: {
    id: 'pvp',
    title: 'PvP Battle Guide',
    icon: Swords,
    steps: [
      {
        title: 'Challenge Players',
        description: 'PvP is a 10-question trivia battle where you face off against another player! Answer stock market questions correctly to win.',
        position: 'center',
        icon: Swords
      },
      {
        title: 'Question Types',
        description: 'Questions cover: Basic concepts (easy), Trading strategies (medium), Math problems, Crypto knowledge, and Advanced options/derivatives (hard).',
        position: 'center',
        icon: Target,
        action: 'Study the markets to improve your odds'
      },
      {
        title: 'Scoring System',
        description: 'Each correct answer = 1 point. First to answer gets a slight bonus. After 10 questions, the higher score wins! Ties result in a draw.',
        position: 'center',
        icon: Trophy
      },
      {
        title: 'Rating & Rewards',
        description: 'Win: +25 rating, 200 coins, 150 XP, 3 gems. Draw: ±0 rating, 50 coins/XP. Lose: -15 rating, 25 coins/XP. Climb the ladder!',
        position: 'center',
        icon: Star,
        action: 'Higher rating matches you with stronger opponents'
      },
      {
        title: 'Match Modes',
        description: 'Casual (practice), Ranked (competitive rating), or Tournament (special events). No question repeats during a match!',
        position: 'center',
        icon: Zap,
        action: 'Start your first match now!'
      }
    ]
  }
};

export function getNextTutorial(completedTutorials) {
  const order = ['welcome', 'skill_tree', 'loot_boxes', 'guilds', 'pvp'];
  
  for (const tutorialId of order) {
    if (!completedTutorials.includes(tutorialId)) {
      return tutorialId;
    }
  }
  
  return null;
}