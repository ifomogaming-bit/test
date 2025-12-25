import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Newspaper, RefreshCw, TrendingUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NewsCard from './NewsCard';
import { fetchStockNews, fetchGeneralMarketNews } from './NewsService';

export default function NewsFeed({ portfolio = [], watchlist = [] }) {
  const [selectedTab, setSelectedTab] = useState('all');

  const { data: generalNews = [], isLoading: generalLoading, refetch: refetchGeneral } = useQuery({
    queryKey: ['news', 'general'],
    queryFn: () => fetchGeneralMarketNews(20),
    refetchInterval: 300000, // Refresh every 5 minutes
    staleTime: 240000
  });

  const { data: portfolioNews = [], isLoading: portfolioLoading, refetch: refetchPortfolio } = useQuery({
    queryKey: ['news', 'portfolio', portfolio.map(p => p.ticker).join(',')],
    queryFn: async () => {
      if (portfolio.length === 0) return [];
      
      const newsPromises = portfolio.slice(0, 5).map(p => fetchStockNews(p.ticker, 3));
      const newsArrays = await Promise.all(newsPromises);
      return newsArrays.flat().sort((a, b) => 
        new Date(b.publishedAt) - new Date(a.publishedAt)
      );
    },
    enabled: portfolio.length > 0,
    refetchInterval: 300000,
    staleTime: 240000
  });

  const handleRefresh = () => {
    if (selectedTab === 'all') {
      refetchGeneral();
    } else {
      refetchPortfolio();
    }
  };

  const isLoading = selectedTab === 'all' ? generalLoading : portfolioLoading;
  const currentNews = selectedTab === 'all' ? generalNews : portfolioNews;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Newspaper className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-bold text-white">Market News</h2>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          className="border-slate-600"
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="all">
            <TrendingUp className="w-4 h-4 mr-2" />
            All Market News
          </TabsTrigger>
          {portfolio.length > 0 && (
            <TabsTrigger value="portfolio">
              <TrendingUp className="w-4 h-4 mr-2" />
              My Holdings ({portfolio.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="all" className="mt-4">
          {generalLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
            </div>
          ) : generalNews.length === 0 ? (
            <div className="text-center py-12">
              <Newspaper className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p className="text-slate-400">No news available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {generalNews.map((article, index) => (
                <NewsCard key={article.id} article={article} index={index} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="portfolio" className="mt-4">
          {portfolioLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
            </div>
          ) : portfolioNews.length === 0 ? (
            <div className="text-center py-12">
              <Newspaper className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p className="text-slate-400">No news for your holdings</p>
            </div>
          ) : (
            <div className="space-y-3">
              {portfolioNews.map((article, index) => (
                <NewsCard key={article.id} article={article} index={index} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}