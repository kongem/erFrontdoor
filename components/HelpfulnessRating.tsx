'use client';

import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, CheckCircle2, MessageSquare, Send } from 'lucide-react';

interface HelpfulnessRatingProps {
  onRatingSubmit?: (helpful: boolean, comment?: string) => void;
}

export default function HelpfulnessRating({ onRatingSubmit }: HelpfulnessRatingProps) {
  const [rated, setRated] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [comment, setComment] = useState('');

  const handleSelect = (isHelpful: boolean) => {
    setRated(isHelpful);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'helpfulness_rating',
          helpful: rated,
          comment,
        }),
      });
    } catch (err) {
      console.warn('Failed to send feedback to API:', err);
    }
    if (onRatingSubmit && rated !== null) {
      onRatingSubmit(rated, comment);
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4">
      {submitted ? (
        <div className="flex items-center gap-3 text-emerald-800 text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>Thank you for your rating! Your feedback helps refine our triage algorithms.</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Was this care recommendation helpful?
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSelect(true)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                  rated === true
                    ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Yes, Helpful</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelect(false)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                  rated === false
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                <span>Needs Improvement</span>
              </button>
            </div>
          </div>

          {rated !== null && (
            <div className="space-y-2 pt-2 border-t border-slate-200/60">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Optional: Add any brief comments on this recommendation..."
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5 ml-auto"
              >
                <Send className="w-3 h-3" />
                <span>Submit Rating</span>
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
