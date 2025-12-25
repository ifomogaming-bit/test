// Generate random war events during guild wars
export const WAR_EVENT_TYPES = {
  resource_rush: {
    name: '💰 Resource Rush',
    description: 'Bonus points for donating to guild vault!',
    icon: '💰',
    color: 'from-yellow-500 to-amber-600',
    multiplier: 2.0,
    duration: 2, // hours
    targetGoal: 50000
  },
  challenge_frenzy: {
    name: '⚔️ Challenge Frenzy',
    description: 'Double points for winning mini-game challenges!',
    icon: '⚔️',
    color: 'from-red-500 to-orange-600',
    multiplier: 2.0,
    duration: 3,
    targetGoal: 100
  },
  diplomacy_offensive: {
    name: '🤝 Diplomacy Offensive',
    description: 'Bonus points for alliance activities!',
    icon: '🤝',
    color: 'from-green-500 to-emerald-600',
    multiplier: 1.5,
    duration: 4,
    targetGoal: 50
  },
  trading_blitz: {
    name: '📈 Trading Blitz',
    description: 'Bonus points for profitable trades!',
    icon: '📈',
    color: 'from-blue-500 to-cyan-600',
    multiplier: 1.5,
    duration: 3,
    targetGoal: 75
  },
  recruitment_drive: {
    name: '👥 Recruitment Drive',
    description: 'Bonus points for active participation!',
    icon: '👥',
    color: 'from-purple-500 to-pink-600',
    multiplier: 1.5,
    duration: 2,
    targetGoal: 50
  }
};

export function generateWarEvent(warId) {
  const eventTypes = Object.keys(WAR_EVENT_TYPES);
  const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
  const config = WAR_EVENT_TYPES[randomType];

  const startsAt = new Date();
  const expiresAt = new Date(startsAt.getTime() + config.duration * 60 * 60 * 1000);

  return {
    war_id: warId,
    event_type: randomType,
    event_name: config.name,
    description: config.description,
    bonus_multiplier: config.multiplier,
    target_goal: config.targetGoal,
    current_progress: {},
    rewards: {
      coins: 5000 + Math.floor(Math.random() * 5000),
      premium: 50 + Math.floor(Math.random() * 50),
      war_points: 50 + Math.floor(Math.random() * 50)
    },
    starts_at: startsAt.toISOString(),
    expires_at: expiresAt.toISOString(),
    status: 'active'
  };
}

export function shouldTriggerEvent(war, existingEvents = []) {
  // Check if war is active
  if (war.status !== 'active') return false;

  // Don't trigger if there's already an active event
  const hasActiveEvent = existingEvents.some(e => e.status === 'active');
  if (hasActiveEvent) return false;

  // Calculate war progress
  const warStart = new Date(war.created_date).getTime();
  const warEnd = new Date(war.expires_at).getTime();
  const now = Date.now();
  const progress = (now - warStart) / (warEnd - warStart);

  // Trigger events at 25%, 50%, 75% war progress
  const milestones = [0.25, 0.5, 0.75];
  const eventCount = existingEvents.length;

  return eventCount < milestones.length && progress >= milestones[eventCount];
}