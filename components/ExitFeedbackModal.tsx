'use client';

import React, { useState } from 'react';
import { X, MessageSquare, CheckCircle2, HeartHandshake, Send } from 'lucide-react';

interface ExitFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  refId?: string;
}

export default function ExitFeedbackModal({ isOpen, onClose, refId }: ExitFeedbackModalProps) {
  const [helped, setHelped] = useState<'yes' | 'no' | 'unsure' | null>(null);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [skipped, setSkipped] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setHelped(null);
    setFeedback('');
    setSubmitted(false);
    setSkipped(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'exit_survey',
          refId: refId || null,
          skipped: false,
          helpedDecide: helped,
          comment: feedback,
        }),
      });
    } catch (err) {
      console.warn('Error saving exit feedback:', err);
    }
  };

  const handleSkip = async () => {
    setSkipped(true);
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'exit_survey',
          refId: refId || null,
          skipped: true,
        }),
      });
    } catch (err) {
      console.warn('Error saving skip feedback:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-teal-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Triage Assessment Completed!
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Thank You for Your Feedback!</h4>
            <p className="text-xs text-slate-600">
              Your feedback directly impacts how we improve pediatric emergency guidance for all families.
            </p>
            <button
              onClick={handleClose}
              className="mt-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition"
            >
              Done & Close
            </button>
          </div>
        ) : skipped ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto border border-teal-150">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">We Understand This Is a Stressful Situation</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              We appreciate feedback when your child's medical concerns are fully addressed.
              An email will be sent to you with a link to provide feedback at a later time when you are ready.
            </p>
            <button
              onClick={handleClose}
              className="mt-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-slate-600">
              Your summary has been generated and sent. Please take 30 seconds to let us know about your experience using REVAMP.
            </p>

            <p className="text-xs font-semibold text-slate-700">
              Did this digital triage tool help you decide where to seek care for your child today?
            </p>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'yes', label: 'Yes, Absolutely' },
                { id: 'no', label: 'No' },
                { id: 'unsure', label: 'Still Unsure' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setHelped(opt.id as any)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold transition border text-center ${helped === opt.id
                      ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Any quick comments or suggestions? (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Let us know what worked well or what was missing..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleSkip}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Skip
              </button>
              <button
                type="submit"
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-6 py-2 rounded-xl transition flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Feedback</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
