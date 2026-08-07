'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Star,
  MessageSquare,
  ThumbsUp,
  Heart,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Send,
  ShieldCheck,
  User,
  Smile
} from 'lucide-react';

export default function FeedbackPage() {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [visitType, setVisitType] = useState('digital-triage');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Clarity of Instructions', 'Fast Triage']);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const TAGS = [
    'Fast Triage',
    'Clarity of Instructions',
    'Reassuring Care Guidance',
    'Clean UI',
    'Accurate Recommendation',
    'Helpful Staff',
    'Short Wait Time',
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'experience_feedback',
          rating,
          visitType,
          selectedTags,
          comment,
        }),
      });
    } catch (err) {
      console.warn('Error submitting feedback:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header Card */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-card-soft space-y-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Patient & Parent Experience Feedback
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Your feedback helps us continuously refine our digital triage tool and improve pediatric care for families.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-card-soft">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Thank You for Your Feedback!</h3>
              <p className="text-slate-600 text-sm max-w-md mx-auto">
                We appreciate you taking the time to rate your experience. Your insights help us deliver better pediatric care for every family.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setComment('');
                }}
                className="mt-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition"
              >
                Submit New Feedback
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Star Rating Section */}
              <div className="space-y-3 text-center border-b border-slate-100 pb-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Overall Experience Rating
                </label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1.5 focus:outline-none transition-transform hover:scale-125"
                    >
                      <Star
                        className={`w-8 h-8 sm:w-10 sm:h-10 ${(hoverRating || rating) >= star
                          ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                          : 'text-slate-200 fill-slate-100'
                          }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-xs font-semibold text-slate-500">
                  {rating === 5 && 'Excellent'}
                  {rating === 4 && 'Good'}
                  {rating === 3 && 'Average'}
                  {rating === 2 && 'Below Average'}
                  {rating === 1 && 'Poor'}
                </p>
              </div>

              {/* Visit Type */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Which Service Did You Use Today?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'triage', label: 'Digital Triage Tool' },
                    { id: 'er-summary', label: 'Triage Summary Email' },
                    { id: 'faq', label: 'FAQ' },
                    { id: 'education', label: 'Educational Materials' },
                  ].map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => setVisitType(service.id)}
                      className={`p-3.5 rounded-2xl text-xs sm:text-sm font-semibold border transition text-left flex items-center justify-between ${visitType === service.id
                        ? 'bg-teal-50 border-teal-500 text-teal-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                      <span>{service.label}</span>
                      {visitType === service.id && (
                        <CheckCircle2 className="w-4 h-4 text-teal-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>



              {/* Detailed Comments */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Comments or Suggestions
                </label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share any thoughts on how we can improve the pediatric digital front door experience..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                />
              </div>

              {/* Submit */}
              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>Submissions are anonymous</span>
                </div>
                <button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-md shadow-teal-600/20 transition flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Feedback</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
