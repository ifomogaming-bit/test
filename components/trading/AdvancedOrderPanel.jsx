import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';

export default function AdvancedOrderPanel({ ticker, currentPrice, onCreateOrder, onClose }) {
  const [orderType, setOrderType] = useState('limit');
  const [action, setAction] = useState('buy');
  const [quantity, setQuantity] = useState(1);
  const [limitPrice, setLimitPrice] = useState(currentPrice);
  const [stopPrice, setStopPrice] = useState(currentPrice * 0.95);
  const [trailingPercent, setTrailingPercent] = useState(5);

  const handleSubmit = () => {
    const order = {
      ticker,
      order_type: orderType,
      action,
      quantity: parseFloat(quantity),
      limit_price: orderType.includes('limit') ? parseFloat(limitPrice) : null,
      stop_price: orderType.includes('stop') ? parseFloat(stopPrice) : null,
      trailing_percent: orderType === 'trailing_stop' ? parseFloat(trailingPercent) : null,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    onCreateOrder(order);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Advanced Order: {ticker}</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4 text-slate-400" />
            </Button>
          </div>
          <p className="text-slate-400 text-sm">Current Price: ${currentPrice.toFixed(2)}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 text-sm mb-2 block">Order Type</label>
              <Select value={orderType} onValueChange={setOrderType}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="limit">Limit Order</SelectItem>
                  <SelectItem value="stop_loss">Stop Loss</SelectItem>
                  <SelectItem value="stop_limit">Stop Limit</SelectItem>
                  <SelectItem value="trailing_stop">Trailing Stop</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-slate-400 text-sm mb-2 block">Action</label>
              <Select value={action} onValueChange={setAction}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">Buy</SelectItem>
                  <SelectItem value="sell">Sell</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-slate-400 text-sm mb-2 block">Quantity</label>
            <Input
              type="number"
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          {orderType.includes('limit') && (
            <div>
              <label className="text-slate-400 text-sm mb-2 block">Limit Price</label>
              <Input
                type="number"
                step="0.01"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          )}

          {orderType.includes('stop') && orderType !== 'trailing_stop' && (
            <div>
              <label className="text-slate-400 text-sm mb-2 block">Stop Price</label>
              <Input
                type="number"
                step="0.01"
                value={stopPrice}
                onChange={(e) => setStopPrice(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          )}

          {orderType === 'trailing_stop' && (
            <div>
              <label className="text-slate-400 text-sm mb-2 block">Trailing %</label>
              <Input
                type="number"
                step="0.1"
                value={trailingPercent}
                onChange={(e) => setTrailingPercent(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          )}

          <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3 text-sm text-blue-300">
            {orderType === 'limit' && `Order will execute when price reaches $${limitPrice}`}
            {orderType === 'stop_loss' && `Order will trigger at $${stopPrice}`}
            {orderType === 'stop_limit' && `Triggers at $${stopPrice}, executes at $${limitPrice}`}
            {orderType === 'trailing_stop' && `Follows price by ${trailingPercent}%`}
          </div>

          <Button onClick={handleSubmit} className="w-full bg-blue-600 hover:bg-blue-700">
            Place {orderType.replace('_', ' ')} Order
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}