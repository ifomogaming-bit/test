// Helper function to get max vault capacity based on upgrades
export function getMaxVaultCapacity(guildUpgrades = []) {
  const vaultUpgrade = guildUpgrades.find(u => u.upgrade_type === 'vault_capacity');
  const level = vaultUpgrade?.current_level || 0;
  
  // Base capacity is 50,000
  // Each level adds 50,000
  return 50000 + (level * 50000);
}

// Check if vault deposit is allowed
export function canDepositToVault(currentVaultBalance, depositAmount, guildUpgrades = []) {
  const maxCapacity = getMaxVaultCapacity(guildUpgrades);
  return (currentVaultBalance + depositAmount) <= maxCapacity;
}

// Get remaining vault capacity
export function getRemainingVaultCapacity(currentVaultBalance, guildUpgrades = []) {
  const maxCapacity = getMaxVaultCapacity(guildUpgrades);
  return Math.max(0, maxCapacity - currentVaultBalance);
}