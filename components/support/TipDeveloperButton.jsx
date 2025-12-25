import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export default function TipDeveloperButton() {
  const [showTipModal, setShowTipModal] = useState(false);

  return (
    <>
      {/* Floating Tip Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-[180px] right-4 sm:bottom-[200px] sm:right-6 z-30"
      >
        <Button
          onClick={() => setShowTipModal(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transition-all"
        >
          <Heart className="w-6 h-6 text-white fill-white" />
        </Button>
      </motion.div>

      {/* Tip Modal */}
      <Dialog open={showTipModal} onOpenChange={setShowTipModal}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-md">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">💸 Support the Developer</h2>

            {/* Send Tip Button */}
            <a 
              href="https://cash.app/$thebullishbearhq" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block mb-4"
            >
              <Button className="w-full bg-[#00C244] hover:bg-[#00A63D] text-white text-lg py-6">
                Send a Tip 💚
              </Button>
            </a>

            {/* QR Code Display */}
            <div className="mb-4">
              <img 
                src="/assets/qrcodes/bullishbearhq.png"
                alt="Scan to tip on Cash App"
                className="w-48 mx-auto rounded-xl border-2 border-slate-700"
              />
            </div>

            {/* Disclaimer Text */}
            <p className="text-sm text-slate-400 leading-relaxed">
              All tips go directly toward improving the game, developing new features, and supporting ongoing updates.
              Every contribution helps keep <strong className="text-white">The Bullish Bear HQ</strong> growing. Thank you for your support!
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}