import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  ArrowLeft, 
  TrendingUp,
  Coins,
  Search,
  Filter,
  RefreshCw,
  Bitcoin,
  Newspaper,
  BarChart3,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import StockCard from '@/components/trading/StockCard';
import NewsFeed from '@/components/news/NewsFeed';
import MarketEventsBanner from '@/components/market/MarketEventsBanner';
import EnhancedChart from '@/components/trading/EnhancedChart';
import CandlestickChart from '@/components/trading/CandlestickChart';
import AdvancedOrderPanel from '@/components/trading/AdvancedOrderPanel';
import BacktestEngine from '@/components/trading/BacktestEngine';
import StrategyManager from '@/components/trading/StrategyManager';
import TradeConfirmationModal from '@/components/trading/TradeConfirmationModal';
import MiniPriceChart from '@/components/trading/MiniPriceChart';
import DetailedStockChart from '@/components/trading/DetailedStockChart';
import PortfolioTab from '@/components/trading/PortfolioTab';
import { fetchRealTimePrice } from '@/components/portfolio/PriceService';
import { getActiveMarketEvents, applyMarketEventsToPrices } from '@/components/market/MarketEventsService';
import antiCheatSystem from '@/components/security/AntiCheatSystem';

// Extended stock and crypto list with price simulation
const ALL_ASSETS = [
  // ETFs - 12/19/2025 exact prices
  { ticker: 'SPY', name: 'S&P 500 ETF', basePrice: 675.00, volatility: 0.02, isCrypto: false, isETF: true },
  { ticker: 'QQQ', name: 'Nasdaq-100 ETF', basePrice: 609.00, volatility: 0.025, isCrypto: false, isETF: true },
  { ticker: 'IWM', name: 'Russell 2000 ETF', basePrice: 248.90, volatility: 0.03, isCrypto: false, isETF: true },
  { ticker: 'TQQQ', name: '3x Nasdaq Bull ETF', basePrice: 51.77, volatility: 0.065, isCrypto: false, isETF: true },
  { ticker: 'XRT', name: 'Retail ETF', basePrice: 84.23, volatility: 0.025, isCrypto: false, isETF: true },
  { ticker: 'XLF', name: 'Financial Sector ETF', basePrice: 52.90, volatility: 0.025, isCrypto: false, isETF: true },
  { ticker: 'XLE', name: 'Energy Sector ETF', basePrice: 98.34, volatility: 0.035, isCrypto: false, isETF: true },
  { ticker: 'XLK', name: 'Tech Sector ETF', basePrice: 256.78, volatility: 0.03, isCrypto: false, isETF: true },
  { ticker: 'VTI', name: 'Total Market ETF', basePrice: 328.45, volatility: 0.02, isCrypto: false, isETF: true },
  { ticker: 'VOO', name: 'Vanguard S&P 500', basePrice: 618.90, volatility: 0.02, isCrypto: false, isETF: true },

  // Tech Giants - 12/19/2025 exact prices
  { ticker: 'AAPL', name: 'Apple Inc.', basePrice: 271.44, volatility: 0.042, isCrypto: false },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', basePrice: 205.34, volatility: 0.03, isCrypto: false },
  { ticker: 'MSFT', name: 'Microsoft Corp.', basePrice: 518.90, volatility: 0.025, isCrypto: false },
  { ticker: 'AMZN', name: 'Amazon.com Inc.', basePrice: 227.24, volatility: 0.035, isCrypto: false },
  { ticker: 'META', name: 'Meta Platforms', basePrice: 664.77, volatility: 0.035, isCrypto: false },
  { ticker: 'NVDA', name: 'NVIDIA Corp.', basePrice: 176.71, volatility: 0.04, isCrypto: false },
  { ticker: 'TSM', name: 'Taiwan Semiconductor', basePrice: 245.67, volatility: 0.03, isCrypto: false },
  { ticker: 'ORCL', name: 'Oracle Corp.', basePrice: 215.78, volatility: 0.025, isCrypto: false },
  { ticker: 'IBM', name: 'IBM', basePrice: 278.45, volatility: 0.025, isCrypto: false },
  { ticker: 'INTC', name: 'Intel Corp.', basePrice: 25.34, volatility: 0.03, isCrypto: false },
  { ticker: 'AMD', name: 'Advanced Micro Devices', basePrice: 202.64, volatility: 0.035, isCrypto: false },
  { ticker: 'MU', name: 'Micron Technology', basePrice: 251.48, volatility: 0.035, isCrypto: false },
  { ticker: 'HOOD', name: 'Robinhood', basePrice: 119.12, volatility: 0.045, isCrypto: false },
  { ticker: 'CRM', name: 'Salesforce', basePrice: 425.67, volatility: 0.035, isCrypto: false },
  { ticker: 'ADBE', name: 'Adobe Inc.', basePrice: 538.90, volatility: 0.03, isCrypto: false },
  { ticker: 'NOW', name: 'ServiceNow', basePrice: 1298.67, volatility: 0.035, isCrypto: false },
  { ticker: 'SNOW', name: 'Snowflake Inc.', basePrice: 198.90, volatility: 0.045, isCrypto: false },
  { ticker: 'PLTR', name: 'Palantir Technologies', basePrice: 186.00, volatility: 0.045, isCrypto: false },
  
  // Automotive
  { ticker: 'TSLA', name: 'Tesla Inc.', basePrice: 548.90, volatility: 0.045, isCrypto: false },
  { ticker: 'F', name: 'Ford Motor', basePrice: 12.78, volatility: 0.03, isCrypto: false },
  { ticker: 'GM', name: 'General Motors', basePrice: 62.45, volatility: 0.03, isCrypto: false },
  { ticker: 'TM', name: 'Toyota Motor', basePrice: 228.90, volatility: 0.025, isCrypto: false },
  { ticker: 'RIVN', name: 'Rivian Automotive', basePrice: 18.45, volatility: 0.055, isCrypto: false },
  { ticker: 'LCID', name: 'Lucid Group', basePrice: 4.23, volatility: 0.06, isCrypto: false },
  { ticker: 'NIO', name: 'Nio Inc.', basePrice: 8.90, volatility: 0.055, isCrypto: false },
  { ticker: 'XPEV', name: 'XPeng Inc.', basePrice: 12.34, volatility: 0.055, isCrypto: false },
  
  // Finance
  { ticker: 'JPM', name: 'JPMorgan Chase', basePrice: 198.75, volatility: 0.015, isCrypto: false },
  { ticker: 'BAC', name: 'Bank of America', basePrice: 35.60, volatility: 0.02, isCrypto: false },
  { ticker: 'GS', name: 'Goldman Sachs', basePrice: 425.80, volatility: 0.025, isCrypto: false },
  { ticker: 'MS', name: 'Morgan Stanley', basePrice: 98.40, volatility: 0.02, isCrypto: false },
  { ticker: 'WFC', name: 'Wells Fargo', basePrice: 52.30, volatility: 0.02, isCrypto: false },
  { ticker: 'C', name: 'Citigroup', basePrice: 64.20, volatility: 0.025, isCrypto: false },
  { ticker: 'V', name: 'Visa Inc.', basePrice: 285.50, volatility: 0.02, isCrypto: false },
  { ticker: 'MA', name: 'Mastercard Inc.', basePrice: 475.25, volatility: 0.02, isCrypto: false },
  { ticker: 'AXP', name: 'American Express', basePrice: 218.90, volatility: 0.02, isCrypto: false },
  { ticker: 'PYPL', name: 'PayPal Holdings', basePrice: 65.80, volatility: 0.03, isCrypto: false },
  
  // Retail & Consumer
  { ticker: 'WMT', name: 'Walmart Inc.', basePrice: 168.50, volatility: 0.015, isCrypto: false },
  { ticker: 'TGT', name: 'Target Corp.', basePrice: 148.70, volatility: 0.02, isCrypto: false },
  { ticker: 'COST', name: 'Costco Wholesale', basePrice: 725.60, volatility: 0.02, isCrypto: false },
  { ticker: 'HD', name: 'Home Depot', basePrice: 385.40, volatility: 0.02, isCrypto: false },
  { ticker: 'LOW', name: "Lowe's Companies", basePrice: 248.30, volatility: 0.02, isCrypto: false },
  { ticker: 'MCD', name: "McDonald's Corp.", basePrice: 295.80, volatility: 0.015, isCrypto: false },
  { ticker: 'SBUX', name: 'Starbucks Corp.', basePrice: 98.50, volatility: 0.02, isCrypto: false },
  { ticker: 'NKE', name: 'Nike Inc.', basePrice: 108.20, volatility: 0.025, isCrypto: false },
  
  // Healthcare & Pharma
  { ticker: 'JNJ', name: 'Johnson & Johnson', basePrice: 158.90, volatility: 0.015, isCrypto: false },
  { ticker: 'PFE', name: 'Pfizer Inc.', basePrice: 28.40, volatility: 0.025, isCrypto: false },
  { ticker: 'UNH', name: 'UnitedHealth Group', basePrice: 538.70, volatility: 0.02, isCrypto: false },
  { ticker: 'ABBV', name: 'AbbVie Inc.', basePrice: 178.30, volatility: 0.02, isCrypto: false },
  { ticker: 'TMO', name: 'Thermo Fisher Scientific', basePrice: 568.90, volatility: 0.02, isCrypto: false },
  { ticker: 'ABT', name: 'Abbott Laboratories', basePrice: 115.60, volatility: 0.02, isCrypto: false },
  
  // Entertainment & Media
  { ticker: 'NFLX', name: 'Netflix Inc.', basePrice: 94.00, volatility: 0.025, isCrypto: false },
  { ticker: 'DIS', name: 'Walt Disney Co.', basePrice: 112.50, volatility: 0.02, isCrypto: false },
  { ticker: 'CMCSA', name: 'Comcast Corp.', basePrice: 42.80, volatility: 0.02, isCrypto: false },
  { ticker: 'T', name: 'AT&T Inc.', basePrice: 19.50, volatility: 0.02, isCrypto: false },
  { ticker: 'VZ', name: 'Verizon Communications', basePrice: 41.30, volatility: 0.015, isCrypto: false },
  
  // Food & Beverage
  { ticker: 'KO', name: 'Coca-Cola Co.', basePrice: 62.75, volatility: 0.01, isCrypto: false },
  { ticker: 'PEP', name: 'PepsiCo Inc.', basePrice: 175.30, volatility: 0.015, isCrypto: false },
  { ticker: 'MDLZ', name: 'Mondelez International', basePrice: 72.40, volatility: 0.015, isCrypto: false },
  
  // Energy
  { ticker: 'XOM', name: 'Exxon Mobil', basePrice: 108.70, volatility: 0.025, isCrypto: false },
  { ticker: 'CVX', name: 'Chevron Corp.', basePrice: 158.30, volatility: 0.025, isCrypto: false },
  { ticker: 'COP', name: 'ConocoPhillips', basePrice: 128.90, volatility: 0.03, isCrypto: false },
  
  // Industrial
  { ticker: 'BA', name: 'Boeing Co.', basePrice: 215.75, volatility: 0.03, isCrypto: false },
  { ticker: 'CAT', name: 'Caterpillar Inc.', basePrice: 338.50, volatility: 0.025, isCrypto: false },
  { ticker: 'GE', name: 'General Electric', basePrice: 128.40, volatility: 0.025, isCrypto: false },
  { ticker: 'HON', name: 'Honeywell International', basePrice: 215.80, volatility: 0.02, isCrypto: false },
  { ticker: '3M', name: '3M Company', basePrice: 98.60, volatility: 0.02, isCrypto: false },
  
  // Semiconductors
  { ticker: 'QCOM', name: 'Qualcomm Inc.', basePrice: 168.90, volatility: 0.03, isCrypto: false },
  { ticker: 'AVGO', name: 'Broadcom Inc.', basePrice: 1485.30, volatility: 0.025, isCrypto: false },
  { ticker: 'TXN', name: 'Texas Instruments', basePrice: 185.40, volatility: 0.02, isCrypto: false },
  { ticker: 'AMAT', name: 'Applied Materials', basePrice: 195.60, volatility: 0.03, isCrypto: false },
  
  // E-commerce & Services
  { ticker: 'BABA', name: 'Alibaba Group', basePrice: 78.50, volatility: 0.04, isCrypto: false },
  { ticker: 'EBAY', name: 'eBay Inc.', basePrice: 48.30, volatility: 0.025, isCrypto: false },
  { ticker: 'SHOP', name: 'Shopify Inc.', basePrice: 78.90, volatility: 0.035, isCrypto: false },
  
  // Telecom & Network
  { ticker: 'CSCO', name: 'Cisco Systems', basePrice: 52.40, volatility: 0.02, isCrypto: false },
  { ticker: 'TMUS', name: 'T-Mobile US', basePrice: 175.30, volatility: 0.025, isCrypto: false },
  
  // Luxury & Apparel
  { ticker: 'LULU', name: 'Lululemon Athletica', basePrice: 485.70, volatility: 0.03, isCrypto: false },
  { ticker: 'TJX', name: 'TJX Companies', basePrice: 98.20, volatility: 0.02, isCrypto: false },
  
  // Real Estate & Construction
  { ticker: 'DHI', name: 'D.R. Horton', basePrice: 158.30, volatility: 0.025, isCrypto: false },
  { ticker: 'LEN', name: 'Lennar Corp.', basePrice: 168.90, volatility: 0.025, isCrypto: false },
  
  // Travel & Hospitality
  { ticker: 'ABNB', name: 'Airbnb Inc.', basePrice: 138.50, volatility: 0.035, isCrypto: false },
  { ticker: 'MAR', name: 'Marriott International', basePrice: 248.70, volatility: 0.025, isCrypto: false },
  { ticker: 'AAL', name: 'American Airlines', basePrice: 15.80, volatility: 0.035, isCrypto: false },
  { ticker: 'DAL', name: 'Delta Air Lines', basePrice: 48.90, volatility: 0.03, isCrypto: false },
  { ticker: 'UAL', name: 'United Airlines', basePrice: 78.40, volatility: 0.03, isCrypto: false },
  
  // Gaming & Software
  { ticker: 'EA', name: 'Electronic Arts', basePrice: 142.30, volatility: 0.025, isCrypto: false },
  { ticker: 'ATVI', name: 'Activision Blizzard', basePrice: 95.20, volatility: 0.02, isCrypto: false },
  { ticker: 'TTWO', name: 'Take-Two Interactive', basePrice: 168.50, volatility: 0.03, isCrypto: false },
  { ticker: 'RBLX', name: 'Roblox Corp.', basePrice: 42.30, volatility: 0.04, isCrypto: false },
  
  // Payment & Fintech
  { ticker: 'SQ', name: 'Block Inc.', basePrice: 78.60, volatility: 0.035, isCrypto: false },
  { ticker: 'COIN', name: 'Coinbase Global', basePrice: 185.40, volatility: 0.05, isCrypto: false },
  
  // Biotech
  { ticker: 'GILD', name: 'Gilead Sciences', basePrice: 88.90, volatility: 0.025, isCrypto: false },
  { ticker: 'AMGN', name: 'Amgen Inc.', basePrice: 298.50, volatility: 0.02, isCrypto: false },
  { ticker: 'BIIB', name: 'Biogen Inc.', basePrice: 248.70, volatility: 0.03, isCrypto: false },
  { ticker: 'MRNA', name: 'Moderna Inc.', basePrice: 118.40, volatility: 0.04, isCrypto: false },
  { ticker: 'REGN', name: 'Regeneron Pharmaceuticals', basePrice: 885.60, volatility: 0.025, isCrypto: false },

  // Consumer Goods
  { ticker: 'PG', name: 'Procter & Gamble', basePrice: 158.70, volatility: 0.015, isCrypto: false },
  { ticker: 'UL', name: 'Unilever', basePrice: 58.20, volatility: 0.015, isCrypto: false },
  { ticker: 'CL', name: 'Colgate-Palmolive', basePrice: 88.90, volatility: 0.015, isCrypto: false },

  // Aerospace & Defense
  { ticker: 'LMT', name: 'Lockheed Martin', basePrice: 448.60, volatility: 0.02, isCrypto: false },
  { ticker: 'RTX', name: 'Raytheon Technologies', basePrice: 98.30, volatility: 0.02, isCrypto: false },
  { ticker: 'NOC', name: 'Northrop Grumman', basePrice: 468.50, volatility: 0.02, isCrypto: false },

  // Luxury Brands
  { ticker: 'LVMUY', name: 'LVMH', basePrice: 168.90, volatility: 0.025, isCrypto: false },
  { ticker: 'EL', name: 'Estée Lauder', basePrice: 138.40, volatility: 0.025, isCrypto: false },
  
  // Additional Tech Stocks
  { ticker: 'SQ', name: 'Block Inc.', basePrice: 78.60, volatility: 0.035, isCrypto: false },
  { ticker: 'PYPL', name: 'PayPal', basePrice: 65.80, volatility: 0.03, isCrypto: false },
  { ticker: 'UBER', name: 'Uber Technologies', basePrice: 68.50, volatility: 0.035, isCrypto: false },
  { ticker: 'LYFT', name: 'Lyft Inc.', basePrice: 15.20, volatility: 0.04, isCrypto: false },
  { ticker: 'SNAP', name: 'Snap Inc.', basePrice: 12.80, volatility: 0.045, isCrypto: false },
  { ticker: 'TWTR', name: 'Twitter/X', basePrice: 45.30, volatility: 0.04, isCrypto: false },
  { ticker: 'PINS', name: 'Pinterest', basePrice: 35.60, volatility: 0.04, isCrypto: false },
  { ticker: 'SPOT', name: 'Spotify', basePrice: 285.40, volatility: 0.035, isCrypto: false },
  { ticker: 'ZM', name: 'Zoom Video', basePrice: 68.90, volatility: 0.035, isCrypto: false },
  { ticker: 'DOCU', name: 'DocuSign', basePrice: 58.70, volatility: 0.035, isCrypto: false },
  
  // Additional Financial
  { ticker: 'BLK', name: 'BlackRock', basePrice: 825.40, volatility: 0.02, isCrypto: false },
  { ticker: 'SCHW', name: 'Charles Schwab', basePrice: 72.80, volatility: 0.025, isCrypto: false },
  { ticker: 'TD', name: 'Toronto-Dominion Bank', basePrice: 58.30, volatility: 0.025, isCrypto: false },
  { ticker: 'USB', name: 'U.S. Bancorp', basePrice: 48.90, volatility: 0.025, isCrypto: false },
  { ticker: 'PNC', name: 'PNC Financial', basePrice: 168.50, volatility: 0.025, isCrypto: false },
  
  // Additional Retail
  { ticker: 'ETSY', name: 'Etsy Inc.', basePrice: 78.30, volatility: 0.035, isCrypto: false },
  { ticker: 'CHWY', name: 'Chewy Inc.', basePrice: 28.50, volatility: 0.04, isCrypto: false },
  { ticker: 'W', name: 'Wayfair Inc.', basePrice: 58.70, volatility: 0.045, isCrypto: false },
  { ticker: 'ROST', name: 'Ross Stores', basePrice: 148.90, volatility: 0.025, isCrypto: false },
  { ticker: 'DG', name: 'Dollar General', basePrice: 88.40, volatility: 0.025, isCrypto: false },
  { ticker: 'DLTR', name: 'Dollar Tree', basePrice: 118.60, volatility: 0.025, isCrypto: false },
  
  // Additional Healthcare
  { ticker: 'CVS', name: 'CVS Health', basePrice: 68.50, volatility: 0.025, isCrypto: false },
  { ticker: 'WBA', name: 'Walgreens Boots', basePrice: 28.40, volatility: 0.03, isCrypto: false },
  { ticker: 'CI', name: 'Cigna Group', basePrice: 348.90, volatility: 0.025, isCrypto: false },
  { ticker: 'HUM', name: 'Humana Inc.', basePrice: 468.70, volatility: 0.025, isCrypto: false },
  { ticker: 'ISRG', name: 'Intuitive Surgical', basePrice: 485.60, volatility: 0.03, isCrypto: false },
  { ticker: 'BSX', name: 'Boston Scientific', basePrice: 78.90, volatility: 0.025, isCrypto: false },
  
  // Additional Entertainment
  { ticker: 'PARA', name: 'Paramount Global', basePrice: 15.80, volatility: 0.035, isCrypto: false },
  { ticker: 'WBD', name: 'Warner Bros Discovery', basePrice: 10.50, volatility: 0.04, isCrypto: false },
  { ticker: 'NFLX', name: 'Netflix Alt', basePrice: 625.00, volatility: 0.025, isCrypto: false },
  { ticker: 'FOX', name: 'Fox Corporation', basePrice: 38.90, volatility: 0.03, isCrypto: false },
  
  // Electric Vehicles & Green Energy
  { ticker: 'PLUG', name: 'Plug Power', basePrice: 4.50, volatility: 0.055, isCrypto: false },
  { ticker: 'FCEL', name: 'FuelCell Energy', basePrice: 1.80, volatility: 0.06, isCrypto: false },
  { ticker: 'ENPH', name: 'Enphase Energy', basePrice: 128.40, volatility: 0.045, isCrypto: false },
  { ticker: 'SEDG', name: 'SolarEdge', basePrice: 48.60, volatility: 0.05, isCrypto: false },
  { ticker: 'NEE', name: 'NextEra Energy', basePrice: 78.90, volatility: 0.025, isCrypto: false },
  
  // Cryptocurrencies - Major
  { ticker: 'BTC-USD', name: 'Bitcoin', basePrice: 86900.00, volatility: 0.075, isCrypto: true },
  { ticker: 'ETH-USD', name: 'Ethereum', basePrice: 2920.00, volatility: 0.085, isCrypto: true },
  { ticker: 'BNB-USD', name: 'Binance Coin', basePrice: 350, volatility: 0.08, isCrypto: true },
  { ticker: 'SOL-USD', name: 'Solana', basePrice: 95, volatility: 0.095, isCrypto: true },
  { ticker: 'ADA-USD', name: 'Cardano', basePrice: 0.58, volatility: 0.06, isCrypto: true },
  { ticker: 'XRP-USD', name: 'Ripple', basePrice: 0.62, volatility: 0.055, isCrypto: true },
  { ticker: 'DOT-USD', name: 'Polkadot', basePrice: 7.85, volatility: 0.065, isCrypto: true },
  { ticker: 'AVAX-USD', name: 'Avalanche', basePrice: 38.50, volatility: 0.07, isCrypto: true },
  { ticker: 'MATIC-USD', name: 'Polygon', basePrice: 0.92, volatility: 0.065, isCrypto: true },
  { ticker: 'LINK-USD', name: 'Chainlink', basePrice: 15.80, volatility: 0.06, isCrypto: true },
  { ticker: 'UNI-USD', name: 'Uniswap', basePrice: 6.45, volatility: 0.065, isCrypto: true },
  { ticker: 'ATOM-USD', name: 'Cosmos', basePrice: 10.20, volatility: 0.06, isCrypto: true },
  { ticker: 'LTC-USD', name: 'Litecoin', basePrice: 75.30, volatility: 0.055, isCrypto: true },

  // Meme Coins
  { ticker: 'DOGE-USD', name: 'Dogecoin', basePrice: 0.58, volatility: 0.085, isCrypto: true },
  { ticker: 'SHIB-USD', name: 'Shiba Inu', basePrice: 0.000042, volatility: 0.095, isCrypto: true },
  { ticker: 'PEPE-USD', name: 'Pepe', basePrice: 0.000035, volatility: 0.105, isCrypto: true },
  { ticker: 'FLOKI-USD', name: 'Floki Inu', basePrice: 0.00028, volatility: 0.095, isCrypto: true },
  { ticker: 'WIF-USD', name: 'dogwifhat', basePrice: 3.78, volatility: 0.115, isCrypto: true },
  { ticker: 'BONK-USD', name: 'Bonk', basePrice: 0.000048, volatility: 0.105, isCrypto: true },
  { ticker: 'MEME-USD', name: 'Memecoin', basePrice: 0.028, volatility: 0.095, isCrypto: true },
  { ticker: 'BRETT-USD', name: 'Brett', basePrice: 0.18, volatility: 0.11, isCrypto: true },
  { ticker: 'WOJAK-USD', name: 'Wojak', basePrice: 0.0012, volatility: 0.12, isCrypto: true },
  
  // AI & Tech Coins
  { ticker: 'FET-USD', name: 'Fetch.ai', basePrice: 1.45, volatility: 0.075, isCrypto: true },
  { ticker: 'AGIX-USD', name: 'SingularityNET', basePrice: 0.68, volatility: 0.08, isCrypto: true },
  { ticker: 'RNDR-USD', name: 'Render Token', basePrice: 8.90, volatility: 0.08, isCrypto: true },
  { ticker: 'GRT-USD', name: 'The Graph', basePrice: 0.28, volatility: 0.075, isCrypto: true },

  // DeFi & Layer 2
  { ticker: 'ARB-USD', name: 'Arbitrum', basePrice: 1.25, volatility: 0.07, isCrypto: true },
  { ticker: 'OP-USD', name: 'Optimism', basePrice: 2.15, volatility: 0.07, isCrypto: true },
  { ticker: 'IMX-USD', name: 'Immutable X', basePrice: 1.45, volatility: 0.08, isCrypto: true },
  { ticker: 'AAVE-USD', name: 'Aave', basePrice: 95.50, volatility: 0.06, isCrypto: true },
  { ticker: 'MKR-USD', name: 'Maker', basePrice: 1650, volatility: 0.06, isCrypto: true },
  { ticker: 'CRV-USD', name: 'Curve DAO', basePrice: 0.65, volatility: 0.07, isCrypto: true },

  // Quantum Computing & Advanced Tech Stocks
  { ticker: 'IONQ', name: 'IonQ Inc.', basePrice: 38.50, volatility: 0.065, isCrypto: false },
  { ticker: 'RGTI', name: 'Rigetti Computing', basePrice: 12.80, volatility: 0.075, isCrypto: false },
  { ticker: 'QUBT', name: 'Quantum Computing Inc.', basePrice: 8.45, volatility: 0.08, isCrypto: false },
  { ticker: 'ARQQ', name: 'Arqit Quantum', basePrice: 4.20, volatility: 0.085, isCrypto: false },
  { ticker: 'QBTS', name: 'D-Wave Quantum', basePrice: 6.75, volatility: 0.075, isCrypto: false },
  
  // Space & Satellite
  { ticker: 'SPCE', name: 'Virgin Galactic', basePrice: 8.90, volatility: 0.055, isCrypto: false },
  { ticker: 'RKLB', name: 'Rocket Lab', basePrice: 28.40, volatility: 0.05, isCrypto: false },
  { ticker: 'ASTS', name: 'AST SpaceMobile', basePrice: 42.50, volatility: 0.06, isCrypto: false },
  { ticker: 'PL', name: 'Planet Labs', basePrice: 5.60, volatility: 0.055, isCrypto: false },
  
  // Robotics & Automation
  { ticker: 'IRBT', name: 'iRobot', basePrice: 38.70, volatility: 0.04, isCrypto: false },
  { ticker: 'ABB', name: 'ABB Ltd', basePrice: 48.90, volatility: 0.025, isCrypto: false },
  { ticker: 'FANUY', name: 'Fanuc Corp', basePrice: 28.50, volatility: 0.03, isCrypto: false },
  
  // Cybersecurity
  { ticker: 'CRWD', name: 'CrowdStrike', basePrice: 398.60, volatility: 0.035, isCrypto: false },
  { ticker: 'PANW', name: 'Palo Alto Networks', basePrice: 405.80, volatility: 0.03, isCrypto: false },
  { ticker: 'ZS', name: 'Zscaler', basePrice: 238.90, volatility: 0.035, isCrypto: false },
  { ticker: 'FTNT', name: 'Fortinet', basePrice: 118.50, volatility: 0.03, isCrypto: false },
  { ticker: 'S', name: 'SentinelOne', basePrice: 32.70, volatility: 0.04, isCrypto: false },
  
  // AR/VR & Metaverse
  { ticker: 'META', name: 'Meta Platforms', basePrice: 664.77, volatility: 0.035, isCrypto: false },
  { ticker: 'RBLX', name: 'Roblox', basePrice: 42.30, volatility: 0.04, isCrypto: false },
  { ticker: 'U', name: 'Unity Software', basePrice: 28.90, volatility: 0.045, isCrypto: false },
  { ticker: 'VUZI', name: 'Vuzix Corp', basePrice: 3.85, volatility: 0.055, isCrypto: false },
  
  // Clean Energy & Nuclear
  { ticker: 'RUN', name: 'Sunrun Inc.', basePrice: 18.40, volatility: 0.04, isCrypto: false },
  { ticker: 'FSLR', name: 'First Solar', basePrice: 298.50, volatility: 0.035, isCrypto: false },
  { ticker: 'SMR', name: 'NuScale Power', basePrice: 12.60, volatility: 0.055, isCrypto: false },
  { ticker: 'OKLO', name: 'Oklo Inc.', basePrice: 15.80, volatility: 0.06, isCrypto: false },
  
  // Biotech & Gene Editing
  { ticker: 'CRSP', name: 'CRISPR Therapeutics', basePrice: 108.40, volatility: 0.045, isCrypto: false },
  { ticker: 'EDIT', name: 'Editas Medicine', basePrice: 12.30, volatility: 0.05, isCrypto: false },
  { ticker: 'NTLA', name: 'Intellia Therapeutics', basePrice: 38.50, volatility: 0.045, isCrypto: false },
  { ticker: 'BEAM', name: 'Beam Therapeutics', basePrice: 28.90, volatility: 0.05, isCrypto: false },
  
  // Advanced Crypto Assets
  { ticker: 'QNT-USD', name: 'Quant', basePrice: 125.40, volatility: 0.08, isCrypto: true },
  { ticker: 'ALGO-USD', name: 'Algorand', basePrice: 0.48, volatility: 0.07, isCrypto: true },
  { ticker: 'HBAR-USD', name: 'Hedera', basePrice: 0.38, volatility: 0.075, isCrypto: true },
  { ticker: 'VET-USD', name: 'VeChain', basePrice: 0.068, volatility: 0.07, isCrypto: true },
  { ticker: 'FTM-USD', name: 'Fantom', basePrice: 1.12, volatility: 0.075, isCrypto: true },
  { ticker: 'NEAR-USD', name: 'NEAR Protocol', basePrice: 6.85, volatility: 0.07, isCrypto: true }
];

export default function Trading() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [marketPrices, setMarketPrices] = useState({});
  const [priceHistory, setPriceHistory] = useState({});
  const [marketEvents, setMarketEvents] = useState([]);
  const [selectedForChart, setSelectedForChart] = useState(null);
  const [showAdvancedOrder, setShowAdvancedOrder] = useState(null);
  const [showBacktest, setShowBacktest] = useState(null);
  const [showStrategyManager, setShowStrategyManager] = useState(false);
  const [watchlistView, setWatchlistView] = useState(false);
  const [pendingTrade, setPendingTrade] = useState(null);
  const [selectedChartAsset, setSelectedChartAsset] = useState(null);
  const [priceHistoryMap, setPriceHistoryMap] = useState({});
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  // Initialize prices and fetch from Alpha Vantage API
  useEffect(() => {
    const initHistory = {};
    
    ALL_ASSETS.forEach(asset => {
      // Generate realistic historical price data with trends
      const periods = 50;
      const history = [];
      let price = asset.basePrice * 0.92; // Start from -8%
      const volatility = asset.isCrypto ? 0.055 : 0.035; // Balanced
      
      for (let i = 0; i < periods; i++) {
        const trend = (asset.basePrice - price) / periods;
        const noise = (Math.random() - 0.5) * 2 * volatility * price;
        price = Math.max(price + trend + noise, asset.basePrice * 0.85);
        
        history.push({
          time: Date.now() - (periods - i) * 60000,
          price: price
        });
      }
      
      history[history.length - 1].price = asset.basePrice;
      initHistory[asset.ticker] = history;
    });
    
    setPriceHistory(initHistory);

    // Fetch active market events
    const fetchEvents = async () => {
      const events = await getActiveMarketEvents();
      setMarketEvents(events);
    };

    // Fetch real-time prices in batches to avoid rate limits
    const fetchAllPrices = async () => {
      const prices = {};
      const events = await getActiveMarketEvents();
      setMarketEvents(events);

      const BATCH_SIZE = 10;
      const batches = [];
      
      for (let i = 0; i < ALL_ASSETS.length; i += BATCH_SIZE) {
        batches.push(ALL_ASSETS.slice(i, i + BATCH_SIZE));
      }

      for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
        const batch = batches[batchIdx];
        
        await Promise.all(batch.map(async (asset) => {
          try {
            let price = await fetchRealTimePrice(asset.ticker);
            price = Number(price) || asset.basePrice;
            const eventAdjustedPrice = applyMarketEventsToPrices(price, asset.ticker, events);
            prices[asset.ticker] = Number(eventAdjustedPrice) || asset.basePrice;
          } catch (error) {
            const fallbackPrice = applyMarketEventsToPrices(asset.basePrice, asset.ticker, events);
            prices[asset.ticker] = Number(fallbackPrice) || asset.basePrice;
          }
        }));

        // Update prices after each batch
        setMarketPrices(prev => ({ ...prev, ...prices }));

        // Wait 1 second between batches to avoid rate limits
        if (batchIdx < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    };

    // Initial fetch
    fetchAllPrices();

    // Auto-refresh every 5 minutes to reduce load
    const priceInterval = setInterval(fetchAllPrices, 300000);

    // Update price history and record to database every 3 seconds
    const historyInterval = setInterval(() => {
      setPriceHistory(prev => {
        const updated = { ...prev };
        ALL_ASSETS.forEach(asset => {
          const history = [...prev[asset.ticker]];
          if (history.length > 0) {
            history.shift();
            const lastPrice = history[history.length - 1]?.price || asset.basePrice;
            const targetPrice = marketPrices[asset.ticker] || asset.basePrice;

            // Create momentum and trends
            const momentum = history.length > 2 ? 
              (history[history.length - 1].price - history[history.length - 3].price) * 0.3 : 0;

            const volatility = asset.isCrypto ? 0.016 : 0.01; // Balanced volatility
            const noise = (Math.random() - 0.5) * 2 * volatility * lastPrice;
            const drift = (targetPrice - lastPrice) * 0.15;

            const newPrice = lastPrice + drift + momentum + noise;

            history.push({
              time: Date.now(),
              price: newPrice
            });
          }
          updated[asset.ticker] = history;
        });
        return updated;
      });

      // Also update live prices with micro-movements
      setMarketPrices(prev => {
        const updated = { ...prev };
        ALL_ASSETS.forEach((asset) => {
          const currentPrice = prev[asset.ticker] || asset.basePrice;
          const volatility = asset.isCrypto ? 0.003 : 0.002; // Balanced
          const microMove = (Math.random() - 0.5) * 2 * volatility * currentPrice;
          // Add subtle momentum-based price movement
          const momentum = Math.random() > 0.5 ? 1.001 : 0.999;
          const newPrice = Math.max(currentPrice * momentum + microMove, asset.basePrice * 0.90);
          updated[asset.ticker] = newPrice;
        });
        return updated;
      });
    }, 3000);

    // Record price history to database every 60 seconds in batches
    const recordInterval = setInterval(async () => {
      const timestamp = new Date().toISOString();
      const RECORD_BATCH_SIZE = 20;
      
      for (let i = 0; i < ALL_ASSETS.length; i += RECORD_BATCH_SIZE) {
        const batch = ALL_ASSETS.slice(i, i + RECORD_BATCH_SIZE);
        const recordData = batch.map((asset) => {
          const currentPrice = marketPrices[asset.ticker] || asset.basePrice;
          const prevPrice = priceHistory[asset.ticker]?.[priceHistory[asset.ticker].length - 2]?.price || currentPrice;
          
          return {
            ticker: asset.ticker,
            price: currentPrice,
            timestamp: timestamp,
            high: Math.max(currentPrice, prevPrice) * 1.002,
            low: Math.min(currentPrice, prevPrice) * 0.998,
            open: prevPrice,
            close: currentPrice,
            volume: Math.floor(Math.random() * 1000000) + 100000
          };
        });

        try {
          await base44.entities.PriceHistory.bulkCreate(recordData);
        } catch (error) {
          // Silent fail
        }

        // Small delay between batches
        if (i + RECORD_BATCH_SIZE < ALL_ASSETS.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }, 60000);

    return () => {
      clearInterval(priceInterval);
      clearInterval(historyInterval);
      clearInterval(recordInterval);
    };
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

  const { data: portfolio = [] } = useQuery({
    queryKey: ['portfolio', player?.id],
    queryFn: async () => {
      if (!player?.id) return [];
      return base44.entities.Portfolio.filter({ player_id: player.id });
    },
    enabled: !!player?.id
  });

  const { data: watchlist = [] } = useQuery({
    queryKey: ['watchlist', player?.id],
    queryFn: async () => {
      if (!player?.id) return [];
      return base44.entities.Watchlist.filter({ player_id: player.id });
    },
    enabled: !!player?.id
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions', player?.id],
    queryFn: async () => {
      if (!player?.id) return [];
      const txs = await base44.entities.Transaction.filter({ player_id: player.id });
      return txs.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    enabled: !!player?.id
  });

  // Fetch price history for all assets
  const { data: allPriceHistory = [] } = useQuery({
    queryKey: ['priceHistory'],
    queryFn: async () => {
      return base44.entities.PriceHistory.list('-timestamp', 1000);
    },
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['orders', player?.id],
    queryFn: async () => {
      if (!player?.id) return [];
      return base44.entities.TradingOrder.filter({ player_id: player.id, status: 'pending' });
    },
    enabled: !!player?.id
  });

  // Group price history by ticker
  useEffect(() => {
    const historyMap = {};
    allPriceHistory.forEach(point => {
      if (!historyMap[point.ticker]) {
        historyMap[point.ticker] = [];
      }
      historyMap[point.ticker].push(point);
    });
    setPriceHistoryMap(historyMap);
  }, [allPriceHistory]);

  const updatePlayerMutation = useMutation({
    mutationFn: (data) => base44.entities.Player.update(player.id, data),
    onSuccess: () => queryClient.invalidateQueries(['player'])
  });

  const portfolioMutation = useMutation({
    mutationFn: async ({ ticker, shares, price, action }) => {
      const existing = portfolio.find(p => p.ticker === ticker);
      
      if (action === 'buy') {
        if (existing) {
          const newShares = existing.shares + shares;
          const newTotal = (existing.total_invested || 0) + (shares * price);
          await base44.entities.Portfolio.update(existing.id, {
            shares: newShares,
            avg_acquisition_price: newTotal / newShares,
            total_invested: newTotal
          });
        } else {
          await base44.entities.Portfolio.create({
            player_id: player.id,
            ticker,
            shares,
            avg_acquisition_price: price,
            total_invested: shares * price
          });
        }
      } else if (action === 'sell' && existing) {
        const newShares = existing.shares - shares;
        if (newShares <= 0) {
          await base44.entities.Portfolio.delete(existing.id);
        } else {
          await base44.entities.Portfolio.update(existing.id, {
            shares: newShares,
            total_invested: (existing.total_invested || 0) * (newShares / existing.shares)
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['portfolio']);
      queryClient.invalidateQueries(['player']);
    }
  });

  const handleBuyClick = (ticker, name, quantity, price, bidPrice, askPrice, isCrypto) => {
    setPendingTrade({
      action: 'buy',
      ticker,
      name,
      quantity,
      price,
      bidPrice,
      askPrice,
      isCrypto
    });
  };

  const handleSellClick = (ticker, name, quantity, price, bidPrice, askPrice, isCrypto) => {
    setPendingTrade({
      action: 'sell',
      ticker,
      name,
      quantity,
      price,
      bidPrice,
      askPrice,
      isCrypto
    });
  };

  const handleConfirmTrade = async (trade) => {
    const { action, ticker, quantity, bidPrice, askPrice } = trade;
    const executionPrice = action === 'buy' ? askPrice : bidPrice;

    // Anti-cheat validation
    if (!antiCheatSystem.validateTrade(player, ticker, quantity, executionPrice, action)) {
      console.error('[ANTI-CHEAT] Invalid trade attempt blocked');
      setPendingTrade(null);
      return;
    }

    // Track action
    antiCheatSystem.trackAction(player.id, 'trade', {
      ticker, quantity, price: executionPrice, action
    });

    if (action === 'buy') {
      const cost = quantity * executionPrice;
      if ((player?.soft_currency || 0) < cost) {
        setPendingTrade(null);
        return;
      }

      const newBalance = Math.max(0, (player.soft_currency || 0) - cost);
      await updatePlayerMutation.mutateAsync({
        soft_currency: newBalance
      });

      await portfolioMutation.mutateAsync({
        ticker,
        shares: quantity,
        price: executionPrice,
        action: 'buy'
      });

      await base44.entities.Transaction.create({
        player_id: player.id,
        type: 'purchase',
        description: `Bought ${quantity.toFixed(4)} ${ticker} @ $${executionPrice.toFixed(2)}`,
        soft_currency_change: -cost,
        stock_ticker: ticker,
        shares_change: quantity
      });
    } else {
      const revenue = quantity * executionPrice;

      await updatePlayerMutation.mutateAsync({
        soft_currency: (player.soft_currency || 0) + revenue
      });

      await portfolioMutation.mutateAsync({
        ticker,
        shares: quantity,
        price: executionPrice,
        action: 'sell'
      });

      await base44.entities.Transaction.create({
        player_id: player.id,
        type: 'purchase',
        description: `Sold ${quantity.toFixed(4)} ${ticker} @ $${executionPrice.toFixed(2)}`,
        soft_currency_change: revenue,
        stock_ticker: ticker,
        shares_change: -quantity
      });
    }

    setPendingTrade(null);
  };

  const createAdvancedOrderMutation = useMutation({
    mutationFn: async (orderData) => {
      await base44.entities.TradingOrder.create({
        ...orderData,
        player_id: player.id,
        status: 'pending'
      });

      await base44.entities.Transaction.create({
        player_id: player.id,
        type: 'purchase',
        description: `Created ${orderData.order_type} order for ${orderData.ticker}`,
        soft_currency_change: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
      setShowAdvancedOrder(null);
    }
  });

  const addToWatchlistMutation = useMutation({
    mutationFn: async (ticker) => {
      await base44.entities.Watchlist.create({
        player_id: player.id,
        ticker
      });
    },
    onSuccess: () => queryClient.invalidateQueries(['watchlist'])
  });

  const removeFromWatchlistMutation = useMutation({
    mutationFn: async (id) => {
      await base44.entities.Watchlist.delete(id);
    },
    onSuccess: () => queryClient.invalidateQueries(['watchlist'])
  });

  const stocksData = ALL_ASSETS.filter(a => !a.isCrypto).map(asset => {
    const currentPrice = Number(marketPrices[asset.ticker]) || asset.basePrice;
    const prevPrice = Number(priceHistory[asset.ticker]?.[0]?.price) || asset.basePrice;
    return {
      ...asset,
      price: currentPrice,
      priceChange: ((currentPrice - prevPrice) / prevPrice) * 100,
      priceHistory: priceHistory[asset.ticker] || []
    };
  }).filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.ticker.toLowerCase().includes(searchQuery.toLowerCase()));

  const cryptoData = ALL_ASSETS.filter(a => a.isCrypto).map(asset => {
    const currentPrice = Number(marketPrices[asset.ticker]) || asset.basePrice;
    const prevPrice = Number(priceHistory[asset.ticker]?.[0]?.price) || asset.basePrice;
    return {
      ...asset,
      price: currentPrice,
      priceChange: ((currentPrice - prevPrice) / prevPrice) * 100,
      priceHistory: priceHistory[asset.ticker] || []
    };
  }).filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.ticker.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-x-hidden p-4 md:p-6 pb-24 md:pb-6">
      <div className="max-w-6xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Home')}>
              <Button variant="outline" className="border-green-500/50 text-white hover:bg-green-500/20 hover:border-green-400 shadow-lg">
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span>Back</span>
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-green-400" />
                Trading Floor
              </h1>
              <p className="text-slate-400">Buy and sell stocks & crypto</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-xl">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-bold">{player?.soft_currency?.toLocaleString() || 0}</span>
            </div>
            <Button variant="outline" size="icon" className="border-slate-600">
              <RefreshCw className="w-4 h-4 text-slate-400" />
            </Button>
          </div>
        </div>

        <MarketEventsBanner events={marketEvents} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/50">
            <CardContent className="p-4">
              <p className="text-green-400 text-sm font-bold mb-2">🚀 Top Gainer Today</p>
              {stocksData.sort((a, b) => b.priceChange - a.priceChange)[0] && (
                <div>
                  <p className="text-white font-bold text-lg">{stocksData.sort((a, b) => b.priceChange - a.priceChange)[0].ticker}</p>
                  <p className="text-green-400 text-2xl font-bold">
                    +{stocksData.sort((a, b) => b.priceChange - a.priceChange)[0].priceChange.toFixed(2)}%
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-900/30 to-orange-900/30 border-red-500/50">
            <CardContent className="p-4">
              <p className="text-red-400 text-sm font-bold mb-2">📉 Top Loser Today</p>
              {stocksData.sort((a, b) => a.priceChange - b.priceChange)[0] && (
                <div>
                  <p className="text-white font-bold text-lg">{stocksData.sort((a, b) => a.priceChange - b.priceChange)[0].ticker}</p>
                  <p className="text-red-400 text-2xl font-bold">
                    {stocksData.sort((a, b) => a.priceChange - b.priceChange)[0].priceChange.toFixed(2)}%
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search stocks or crypto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white"
            />
          </div>
          <Button
            onClick={() => setWatchlistView(!watchlistView)}
            variant={watchlistView ? 'default' : 'outline'}
            className={watchlistView ? 'bg-blue-600 hover:bg-blue-700' : 'border-slate-600'}
          >
            <Star className="w-4 h-4 mr-2" />
            Watchlist ({watchlist.length})
          </Button>
          <Button
            onClick={() => setShowStrategyManager(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Strategies
          </Button>
        </div>

        <Tabs defaultValue="etfs" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700 flex-wrap h-auto">
            <TabsTrigger value="portfolio">
              <BarChart3 className="w-4 h-4 mr-2" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="etfs">
              <BarChart3 className="w-4 h-4 mr-2" />
              ETFs ({ALL_ASSETS.filter(a => a.isETF).length})
            </TabsTrigger>
            <TabsTrigger value="stocks">
              <TrendingUp className="w-4 h-4 mr-2" />
              Stocks ({stocksData.length})
            </TabsTrigger>
            <TabsTrigger value="crypto">
              <Bitcoin className="w-4 h-4 mr-2" />
              Crypto ({cryptoData.length})
            </TabsTrigger>
            <TabsTrigger value="news">
              <Newspaper className="w-4 h-4 mr-2" />
              News
            </TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio">
            <PortfolioTab 
              portfolio={portfolio}
              player={player}
              realTimePrices={marketPrices}
              transactions={transactions}
            />
          </TabsContent>

          <TabsContent value="etfs">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ALL_ASSETS.filter(a => a.isETF).map(etf => {
                const currentPrice = marketPrices[etf.ticker] || etf.basePrice;
                const prevPrice = priceHistory[etf.ticker]?.[0]?.price || etf.basePrice;
                const etfData = {
                  ...etf,
                  price: currentPrice,
                  priceChange: ((currentPrice - prevPrice) / prevPrice) * 100,
                  priceHistory: priceHistory[etf.ticker] || []
                };
                
                return (
                  <div key={etf.ticker}>
                    <StockCard
                      stock={etfData}
                      holding={portfolio.find(p => p.ticker === etf.ticker)}
                      onBuy={handleBuyClick}
                      onSell={handleSellClick}
                      canAfford={(amount) => (player?.soft_currency || 0) >= amount}
                    />
                    <div 
                      className="mt-2 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setSelectedChartAsset(etfData)}
                    >
                      <MiniPriceChart 
                        priceHistory={priceHistoryMap[etf.ticker] || []}
                        currentPrice={etfData.price}
                        color={etfData.priceChange >= 0 ? '#22c55e' : '#ef4444'}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="stocks">
            {watchlistView ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Your Watchlist</h2>
                  <Button onClick={() => setWatchlistView(false)} variant="outline" className="border-slate-600">
                    View All Stocks
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {watchlist.map(w => {
                    const stockData = stocksData.find(s => s.ticker === w.ticker);
                    if (!stockData) return null;
                    return (
                      <div key={w.id}>
                        <StockCard
                          stock={stockData}
                          holding={portfolio.find(p => p.ticker === w.ticker)}
                          onBuy={handleBuyClick}
                          onSell={handleSellClick}
                          canAfford={(amount) => (player?.soft_currency || 0) >= amount}
                        />
                        <div 
                          className="mt-2 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setSelectedChartAsset(stockData)}
                        >
                          <MiniPriceChart 
                            priceHistory={priceHistoryMap[w.ticker] || []}
                            currentPrice={stockData.price}
                            color={stockData.priceChange >= 0 ? '#22c55e' : '#ef4444'}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                {watchlist.length === 0 && (
                  <p className="text-slate-400 text-center py-12">No stocks in watchlist. Click the star icon to add.</p>
                )}
              </div>
            ) : selectedForChart ? (
              <div className="space-y-4">
                <Button
                  onClick={() => setSelectedForChart(null)}
                  variant="outline"
                  className="border-slate-600"
                >
                  ← Back to List
                </Button>
                <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white">{selectedForChart.ticker}</h2>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          const inWatchlist = watchlist.find(w => w.ticker === selectedForChart.ticker);
                          if (inWatchlist) {
                            removeFromWatchlistMutation.mutate(inWatchlist.id);
                          } else {
                            addToWatchlistMutation.mutate(selectedForChart.ticker);
                          }
                        }}
                        variant="outline"
                        className="border-slate-600"
                      >
                        <Star className={`w-4 h-4 mr-2 ${watchlist.find(w => w.ticker === selectedForChart.ticker) ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                        {watchlist.find(w => w.ticker === selectedForChart.ticker) ? 'Watching' : 'Watch'}
                      </Button>
                      <Button
                        onClick={() => setShowAdvancedOrder(selectedForChart)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Advanced Order
                      </Button>
                    </div>
                  </div>
                  <CandlestickChart
                    ticker={selectedForChart.ticker}
                    currentPrice={selectedForChart.price}
                    basePrice={selectedForChart.basePrice}
                    isCrypto={selectedForChart.isCrypto}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stocksData.map(stock => (
                  <div key={stock.ticker}>
                    <StockCard
                      stock={stock}
                      holding={portfolio.find(p => p.ticker === stock.ticker)}
                      onBuy={handleBuyClick}
                      onSell={handleSellClick}
                      canAfford={(amount) => (player?.soft_currency || 0) >= amount}
                    />
                    <div 
                      className="mt-2 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setSelectedChartAsset(stock)}
                    >
                      <MiniPriceChart 
                        priceHistory={priceHistoryMap[stock.ticker] || []}
                        currentPrice={stock.price}
                        color={stock.priceChange >= 0 ? '#22c55e' : '#ef4444'}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="crypto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cryptoData.map(crypto => (
                <div key={crypto.ticker}>
                  <StockCard
                    stock={crypto}
                    holding={portfolio.find(p => p.ticker === crypto.ticker)}
                    onBuy={handleBuyClick}
                    onSell={handleSellClick}
                    canAfford={(amount) => (player?.soft_currency || 0) >= amount}
                  />
                  <div 
                    className="mt-2 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setSelectedChartAsset(crypto)}
                  >
                    <MiniPriceChart 
                      priceHistory={priceHistoryMap[crypto.ticker] || []}
                      currentPrice={crypto.price}
                      color={crypto.priceChange >= 0 ? '#22c55e' : '#ef4444'}
                    />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="news">
            <NewsFeed portfolio={portfolio} />
          </TabsContent>
        </Tabs>
      </div>

      {showAdvancedOrder && (
        <AdvancedOrderPanel
          ticker={showAdvancedOrder.ticker}
          currentPrice={showAdvancedOrder.price}
          onCreateOrder={(order) => createAdvancedOrderMutation.mutate(order)}
          onClose={() => setShowAdvancedOrder(null)}
        />
      )}

      {orders.length > 0 && (
        <div className="fixed bottom-4 right-4 z-40 bg-slate-800 border border-slate-700 rounded-xl p-4 max-w-xs">
          <h3 className="text-white font-bold mb-2">Active Orders ({orders.length})</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {orders.slice(0, 3).map(order => (
              <div key={order.id} className="text-xs p-2 bg-slate-700/30 rounded">
                <p className="text-white">{order.ticker} - {order.order_type}</p>
                <p className="text-slate-400">{order.action} {order.quantity} @ ${order.limit_price || order.stop_price}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {showBacktest && (
        <BacktestEngine
          priceHistory={priceHistory[showBacktest.ticker] || []}
          strategy={showBacktest}
          onClose={() => setShowBacktest(null)}
          onSaveResults={async (results) => {
            await base44.entities.TradingStrategy.update(showBacktest.id, {
              backtested: true,
              backtest_results: results
            });
            queryClient.invalidateQueries(['strategies']);
          }}
        />
      )}

      {showStrategyManager && (
        <StrategyManager
          playerId={player?.id}
          onBacktest={(strategy) => {
            setShowBacktest(strategy);
            setShowStrategyManager(false);
          }}
          onClose={() => setShowStrategyManager(false)}
        />
      )}

      <TradeConfirmationModal
        trade={pendingTrade}
        onConfirm={handleConfirmTrade}
        onCancel={() => setPendingTrade(null)}
        playerBalance={player?.soft_currency || 0}
      />

      {selectedChartAsset && (
        <DetailedStockChart
          ticker={selectedChartAsset.ticker}
          currentPrice={selectedChartAsset.price}
          priceHistory={priceHistoryMap[selectedChartAsset.ticker] || []}
          playerPositions={portfolio.filter(p => p.ticker === selectedChartAsset.ticker)}
          onClose={() => setSelectedChartAsset(null)}
        />
      )}
    </div>
  );
}