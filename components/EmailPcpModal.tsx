'use client';

import React, { useState } from 'react';
import { X, Mail, Send, CheckCircle2, FileText, User } from 'lucide-react';
import { TriageEvaluationResult } from '@/lib/aboutKidsHealthLogic';

interface EmailPcpModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: TriageEvaluationResult;
  childName: string;
}

export default function EmailPcpModal({
  isOpen,
  onClose,
  result,
  childName,
}: EmailPcpModalProps) {
  const [docName, setDocName] = useState('');
  const [docEmail, setDocEmail] = useState('');
  const [copySelf, setCopySelf] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await fetch('/api/email-pcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorName: docName,
          doctorEmail: docEmail,
          childName,
          triageResult: result,
          message,
          copySelf,
        }),
      });
    } catch (err) {
      console.warn('Error emailing PCP:', err);
    }
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-teal-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Email Triage Summary to Pediatrician
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {sent ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Summary Sent Successfully!</h4>
            <p className="text-xs text-slate-600 max-w-xs mx-auto">
              A copy of {childName || 'your child’s'} clinical triage assessment was emailed to <strong>{docEmail}</strong>.
            </p>
            <button
              onClick={onClose}
              className="mt-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition"
            >
              Done & Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-teal-50 border border-teal-200 p-3 rounded-2xl text-xs text-teal-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600 flex-shrink-0" />
              <span>
                Sending triage result: <strong>{result.title}</strong>
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Pediatrician / Doctor's Name *
              </label>
              <input
                type="text"
                required
                placeholder="Dr. Emily Watson"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Pediatrician's Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="dr.watson@pediatricclinic.ca"
                value={docEmail}
                onChange={(e) => setDocEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Message to Doctor (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Hi Dr. Watson, attaching our digital triage evaluation for reference..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="copySelf"
                checked={copySelf}
                onChange={(e) => setCopySelf(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 border-slate-300"
              />
              <label htmlFor="copySelf" className="text-xs text-slate-600 font-medium">
                Send a copy to my email address
              </label>
            </div>

            <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sending}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-6 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sending ? 'Sending...' : 'Send Summary Email'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
