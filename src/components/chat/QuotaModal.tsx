import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Sparkles, Clock, ArrowRight, X, ShieldCheck } from 'lucide-react';
import { PlanSlug } from '../../types/database';
import { PlanRequestModal } from '../plans/PlanRequestModal';

interface QuotaModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: PlanSlug;
  currentUsage: number;
  dailyLimit: number;
  resetsAt?: string;
}

export const QuotaModal: React.FC<QuotaModalProps> = ({
  isOpen,
  onClose,
  currentPlan,
  currentUsage,
  dailyLimit,
  resetsAt,
}) => {
  const navigate = useNavigate();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    function calcTimeLeft() {
      if (resetsAt) {
        const diff = new Date(resetsAt).getTime() - Date.now();
        if (diff <= 0) {
          setTimeLeft('a few moments');
          return;
        }
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${hours}h ${minutes}m`);
        return;
      }
      const now = new Date();
      const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${hours}h ${minutes}m`);
    }

    calcTimeLeft();
    const interval = setInterval(calcTimeLeft, 60000);
    return () => clearInterval(interval);
  }, [resetsAt]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="relative w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl overflow-hidden p-6 text-center space-y-5 max-h-[90vh] overflow-y-auto">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-xl text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-xs">
            <Clock className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-foreground">
              Daily Question Limit Reached
            </h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              You have used all <strong className="text-foreground">{currentUsage}</strong> of your{' '}
              <strong className="text-foreground">{dailyLimit}</strong> daily questions on the{' '}
              <span className="capitalize font-semibold text-blue-600">{currentPlan} Plan</span>.
            </p>
          </div>

          {/* Reset countdown */}
          <div className="p-3 rounded-2xl bg-muted/40 border border-border flex items-center justify-center gap-2 text-xs">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-muted-foreground">Quota resets in:</span>
            <span className="font-bold text-foreground">{timeLeft}</span>
          </div>

          {/* Upgrade preview box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-500/20 text-left space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Unlock Talib al-Ilm (Pro)</span>
            </div>
            <ul className="text-[11px] text-muted-foreground space-y-1">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>150 questions per day</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>Comparative rulings across the 4 Sunni Madhhabs</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>Authentic Hadith grading & verification notes</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-1">
            <button
              onClick={() => setIsUpgradeModalOpen(true)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Request Pro Upgrade</span>
            </button>
            <button
              onClick={() => {
                onClose();
                navigate('/pricing');
              }}
              className="w-full py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              View All Plan Options
            </button>
          </div>
        </div>
      </div>

      <PlanRequestModal
        isOpen={isUpgradeModalOpen}
        onClose={() => {
          setIsUpgradeModalOpen(false);
          onClose();
        }}
        defaultPlan="pro"
      />
    </>
  );
};
