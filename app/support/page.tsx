'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  FileText,
  Shield,
  LifeBuoy,
  MessageSquare,
  Building
} from 'lucide-react';

export default function SupportPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    parentName: '',
    email: '',
    phone: '',
    childAge: '',
    topic: 'general',
    urgency: 'routine',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    try {
      await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    } catch (err) {
      console.warn('Error submitting support request:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back Link */}


        {/* Header */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-card-soft space-y-4">

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            REVAMP Digital Front Door Support
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Need help navigating our digital triage tool, assistance with ER pre-registration, or non-clinical guidance? Submit a request below or reach our support team directly.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-slate-600 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-teal-600" />
              <span>Response Time: &lt; 2 Hours</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-teal-600" />
              <span>Confidential & Secure</span>
            </div>
          </div>
        </div>

        {/* Emergency Callout Box */}
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-start gap-4 shadow-2xs">
          <AlertTriangle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-rose-900 space-y-1">
            <strong className="font-bold block text-rose-950">Is this a medical emergency?</strong>
            <p>
              Please do not use this support form for active medical emergencies or urgent clinical questions. Call <strong>911</strong> immediately or go to your nearest Pediatric Emergency Department.
            </p>
          </div>
        </div>

        {/* Support Form Shell */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-card-soft">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mx-auto border-2 border-teal-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Support Request Submitted!</h3>
              <p className="text-slate-600 text-sm max-w-md mx-auto">
                Thank you, <strong>{formData.parentName || 'Parent'}</strong>. Our pediatric support team has received your inquiry regarding <strong>{formData.topic}</strong> and will follow up shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <FileText className="w-5 h-5 text-teal-600" />
                Submit Support Request Form
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Parent / Caregiver Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="parent@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="(555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Child’s Age / Age Group
                  </label>
                  <select
                    value={formData.childAge}
                    onChange={(e) => setFormData({ ...formData, childAge: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                  >
                    <option value="">Select Age Group</option>
                    <option value="infant">Infant (0 - 3 months)</option>
                    <option value="baby">Baby (4 - 12 months)</option>
                    <option value="toddler">Toddler (1 - 3 years)</option>
                    <option value="child">Child (4 - 11 years)</option>
                    <option value="teen">Teen (12+ years)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Inquiry Topic
                  </label>
                  <select
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                  >
                    <option value="triage-help">Digital Triage Tool Navigation</option>
                    <option value="general">General Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Urgency Priority
                  </label>
                  <select
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                  >
                    <option value="routine">Routine (Next Business Day)</option>
                    <option value="today">Needs Attention Today</option>
                    <option value="urgent">Urgent Non-Clinical Concern</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Message / Details *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your inquiry or how we can assist you..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  * Required fields
                </span>
                <button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-md shadow-teal-600/20 transition flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Support Request</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
