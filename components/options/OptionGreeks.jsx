// Black-Scholes Greeks Calculator for Options

function normalCDF(x) {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - prob : prob;
}

function normalPDF(x) {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

export function calculateD1(S, K, T, r, sigma) {
  return (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
}

export function calculateD2(d1, sigma, T) {
  return d1 - sigma * Math.sqrt(T);
}

export function calculateCallPrice(S, K, T, r, sigma) {
  if (T <= 0) return Math.max(0, S - K);
  const d1 = calculateD1(S, K, T, r, sigma);
  const d2 = calculateD2(d1, sigma, T);
  return S * normalCDF(d1) - K * Math.exp(-r * T) * normalCDF(d2);
}

export function calculatePutPrice(S, K, T, r, sigma) {
  if (T <= 0) return Math.max(0, K - S);
  const d1 = calculateD1(S, K, T, r, sigma);
  const d2 = calculateD2(d1, sigma, T);
  return K * Math.exp(-r * T) * normalCDF(-d2) - S * normalCDF(-d1);
}

export function calculateGreeks(S, K, T, r, sigma, isCall = true) {
  if (T <= 0) {
    return {
      delta: isCall ? (S > K ? 1 : 0) : (S < K ? -1 : 0),
      gamma: 0,
      theta: 0,
      vega: 0,
      price: isCall ? Math.max(0, S - K) : Math.max(0, K - S)
    };
  }

  const d1 = calculateD1(S, K, T, r, sigma);
  const d2 = calculateD2(d1, sigma, T);
  const nd1 = normalPDF(d1);

  const delta = isCall ? normalCDF(d1) : normalCDF(d1) - 1;
  const gamma = nd1 / (S * sigma * Math.sqrt(T));
  const theta = isCall
    ? (-S * nd1 * sigma / (2 * Math.sqrt(T)) - r * K * Math.exp(-r * T) * normalCDF(d2)) / 365
    : (-S * nd1 * sigma / (2 * Math.sqrt(T)) + r * K * Math.exp(-r * T) * normalCDF(-d2)) / 365;
  const vega = S * nd1 * Math.sqrt(T) / 100;

  const price = isCall ? calculateCallPrice(S, K, T, r, sigma) : calculatePutPrice(S, K, T, r, sigma);

  return { delta, gamma, theta, vega, price };
}

export function calculateImpliedVolatility(marketPrice, S, K, T, r, isCall) {
  let sigma = 0.3; // Initial guess
  const maxIterations = 100;
  const tolerance = 0.0001;

  for (let i = 0; i < maxIterations; i++) {
    const price = isCall ? calculateCallPrice(S, K, T, r, sigma) : calculatePutPrice(S, K, T, r, sigma);
    const diff = price - marketPrice;

    if (Math.abs(diff) < tolerance) break;

    const vega = S * normalPDF(calculateD1(S, K, T, r, sigma)) * Math.sqrt(T);
    sigma = sigma - diff / vega;

    if (sigma <= 0) sigma = 0.01;
    if (sigma > 2) sigma = 2;
  }

  return sigma;
}