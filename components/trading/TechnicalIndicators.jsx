// Technical indicator calculations
export function calculateSMA(data, period) {
  const sma = [];
  for (let i = period - 1; i < data.length; i++) {
    const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b.price, 0);
    sma.push({ time: data[i].time, value: sum / period });
  }
  return sma;
}

export function calculateEMA(data, period) {
  const multiplier = 2 / (period + 1);
  const ema = [];
  
  // Start with SMA
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i].price;
  }
  let emaValue = sum / period;
  ema.push({ time: data[period - 1].time, value: emaValue });
  
  // Calculate EMA
  for (let i = period; i < data.length; i++) {
    emaValue = (data[i].price - emaValue) * multiplier + emaValue;
    ema.push({ time: data[i].time, value: emaValue });
  }
  
  return ema;
}

export function calculateRSI(data, period = 14) {
  const rsi = [];
  let gains = 0, losses = 0;
  
  for (let i = 1; i <= period; i++) {
    const change = data[i].price - data[i - 1].price;
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }
  
  let avgGain = gains / period;
  let avgLoss = losses / period;
  let rs = avgGain / avgLoss;
  rsi.push({ time: data[period].time, value: 100 - (100 / (1 + rs)) });
  
  for (let i = period + 1; i < data.length; i++) {
    const change = data[i].price - data[i - 1].price;
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;
    
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    rs = avgGain / avgLoss;
    
    rsi.push({ time: data[i].time, value: 100 - (100 / (1 + rs)) });
  }
  
  return rsi;
}

export function calculateMACD(data) {
  const ema12 = calculateEMA(data, 12);
  const ema26 = calculateEMA(data, 26);
  const macd = [];
  
  for (let i = 0; i < ema12.length; i++) {
    macd.push({
      time: ema12[i].time,
      value: ema12[i].value - ema26[i].value
    });
  }
  
  return macd;
}

export function calculateBollingerBands(data, period = 20, stdDev = 2) {
  const sma = calculateSMA(data, period);
  const bands = { upper: [], middle: [], lower: [] };
  
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const mean = slice.reduce((sum, d) => sum + d.price, 0) / period;
    const variance = slice.reduce((sum, d) => sum + Math.pow(d.price - mean, 2), 0) / period;
    const std = Math.sqrt(variance);
    
    bands.middle.push({ time: data[i].time, value: mean });
    bands.upper.push({ time: data[i].time, value: mean + (std * stdDev) });
    bands.lower.push({ time: data[i].time, value: mean - (std * stdDev) });
  }
  
  return bands;
}