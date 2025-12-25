import { base44 } from '@/api/base44Client';

// Calculate dynamic price based on demand
export async function getDynamicPrice(itemId, itemType, basePrice) {
  const demands = await base44.entities.ItemDemand.filter({ item_id: itemId, item_type: itemType });
  
  if (demands.length === 0) {
    // Create initial demand record
    await base44.entities.ItemDemand.create({
      item_id: itemId,
      item_type: itemType,
      base_price: basePrice,
      current_price: basePrice,
      total_purchases: 0,
      purchases_last_24h: 0,
      demand_score: 50,
      price_trend: 'stable',
      last_price_update: new Date().toISOString()
    });
    return basePrice;
  }

  return demands[0].current_price;
}

// Update demand after purchase
export async function recordPurchase(itemId, itemType) {
  const demands = await base44.entities.ItemDemand.filter({ item_id: itemId, item_type: itemType });
  
  if (demands.length > 0) {
    const demand = demands[0];
    const newPurchases24h = (demand.purchases_last_24h || 0) + 1;
    
    // Calculate new demand score (0-100)
    const demandScore = Math.min(100, 50 + (newPurchases24h * 5));
    
    // Dynamic pricing: higher demand = higher price (max 2x base price)
    const priceMultiplier = 1 + (demandScore / 200); // 1.0x to 1.5x
    const newPrice = Math.round(demand.base_price * priceMultiplier);
    
    // Determine trend
    let trend = 'stable';
    if (newPrice > demand.current_price * 1.05) trend = 'rising';
    if (newPrice < demand.current_price * 0.95) trend = 'falling';
    
    await base44.entities.ItemDemand.update(demand.id, {
      total_purchases: (demand.total_purchases || 0) + 1,
      purchases_last_24h: newPurchases24h,
      demand_score: demandScore,
      current_price: newPrice,
      price_trend: trend,
      last_price_update: new Date().toISOString()
    });
  }
}

// Reset daily purchase counters (should be called by a background job)
export async function resetDailyDemand() {
  const allDemands = await base44.entities.ItemDemand.list('-last_price_update', 500);
  
  for (const demand of allDemands) {
    const lastUpdate = new Date(demand.last_price_update);
    const now = new Date();
    const hoursSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60);
    
    if (hoursSinceUpdate >= 24) {
      // Gradually reduce prices back to base
      const decayRate = 0.9; // 10% reduction per day
      const targetPrice = demand.base_price + (demand.current_price - demand.base_price) * decayRate;
      
      await base44.entities.ItemDemand.update(demand.id, {
        purchases_last_24h: 0,
        demand_score: Math.max(30, (demand.demand_score || 50) * 0.9),
        current_price: Math.round(targetPrice),
        last_price_update: now.toISOString()
      });
    }
  }
}