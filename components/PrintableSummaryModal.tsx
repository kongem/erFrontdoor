'use client';

import { useState } from 'react';
import { X, Mail, Send, CheckCircle2, FileText, Heart, ShieldCheck, Phone, MapPin } from 'lucide-react';
import { GuardianInfo, ChildInfo, SymptomInfo } from '@/lib/triageContext';
import { TriageEvaluationResult, SYMPTOMS_BY_PRIMARY } from '@/lib/aboutKidsHealthLogic';
import { FacilityWithDistance } from '@/lib/facilityData';

interface PrintableSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmailSent?: () => void;
  guardian: GuardianInfo;
  child: ChildInfo;
  symptoms: SymptomInfo;
  result: TriageEvaluationResult;
  facility?: FacilityWithDistance;
  refId: string;
}

export default function PrintableSummaryModal({
  isOpen,
  onClose,
  onEmailSent,
  guardian,
  child,
  symptoms,
  result,
  facility,
  refId,
}: PrintableSummaryModalProps) {
  const registeredEmail = guardian?.email || child?.email || '';
  const [emailInput, setEmailInput] = useState(registeredEmail);
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!isOpen) return null;

  const handleEmailToMe = async () => {
    const targetEmail = emailInput.trim() || registeredEmail;
    if (!targetEmail) {
      alert('Please enter a valid email address to receive your triage summary.');
      return;
    }

    setSending(true);
    try {
      await fetch('/api/email-pcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorName: guardian?.name || 'Parent / Guardian',
          doctorEmail: targetEmail,
          childName: child?.name || 'Child',
          triageResult: result,
          message: 'Pediatric Triage PCP Referral Copy sent to patient email',
          copySelf: true,
          refId,
        }),
      });
    } catch (e) {
      console.warn('Failed to send triage summary email:', e);
    }
    setSending(false);
    setSentSuccess(true);
    if (onEmailSent) {
      setTimeout(() => {
        onClose();
        onEmailSent();
      }, 400);
    }
  };

  const currentDateStr = new Date().toLocaleString('en-CA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col p-6 sm:p-8 shadow-2xl border border-slate-200 relative space-y-6">

        {/* Header Action Buttons */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Triage Summary
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PRINTABLE DOCUMENT BODY */}
        <div className="space-y-6 text-slate-800 text-xs sm:text-sm overflow-y-auto pr-2 flex-grow min-h-0">
          {/* Document Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-teal-600 fill-current print:text-black" />
                <span className="text-xl font-extrabold text-slate-900">
                  REVAMP PedsER
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                Digital Front Door • Clinical Assessment Summary
              </p>
            </div>
            <div className="text-right text-xs text-slate-500 space-y-0.5">
              <p><strong>Assessment Date:</strong> {currentDateStr}</p>
              <p><strong>Ref ID:</strong> {refId}</p>
              <p><strong>Protocol:</strong> AboutKidsHealth Triage Rules</p>
            </div>
          </div>

          {/* Urgency Category Banner */}
          <div className={`p-4 rounded-2xl border ${result.category === 'HIGH_EMERGENCY'
            ? 'bg-rose-50 border-rose-300 text-rose-950'
            : result.category === 'MODERATE_URGENT_CARE'
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : 'bg-teal-50 border-teal-300 text-teal-950'
            }`}>
            <div className="flex items-center justify-between font-bold text-base">
              <span>Triage Classification: {result.title}</span>
              <span className="px-3 py-1 text-xs rounded-full bg-slate-900 text-white">
                {result.badgeText}
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed">
              {result.summary}
            </p>
          </div>

          {/* Patient & Guardian Grid */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">
                Patient (Child) Information
              </h4>
              <ul className="space-y-1 text-xs font-medium text-slate-700">
                <li><strong>Name:</strong> {child.name || 'Anonymous Child'}</li>
                <li><strong>Age:</strong> {child.ageInMonths} months (~{(child.ageInMonths / 12).toFixed(1)} yrs)</li>
                <li><strong>Sex:</strong> {child.sex}</li>
                {child.weightKg && <li><strong>Weight:</strong> {child.weightKg} kg</li>}
                <li><strong>Chronic Conditions:</strong> {child.hasChronicConditions ? 'Yes (Noted)' : 'None Reported'}</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">
                Guardian / Contact Information
              </h4>
              <ul className="space-y-1 text-xs font-medium text-slate-700">
                <li><strong>Guardian Name:</strong> {guardian.name || 'Anonymous Guardian'}</li>
                <li><strong>Relationship:</strong> {guardian.relationship}</li>
                <li><strong>Phone:</strong> {guardian.phone || 'N/A'}</li>
                <li><strong>Email:</strong> {guardian.email || 'N/A'}</li>
                <li><strong>Postal Code (FSA):</strong> {guardian.postalCode}</li>
              </ul>
            </div>
          </div>

          {/* Clinical Symptom Assessment */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
              Reported Symptoms & Clinical Indicators
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-xs font-bold block text-slate-700">Primary Assessed Symptom:</span>
                <span className="text-xs text-slate-600 capitalize">
                  {symptoms.primarySymptom ? symptoms.primarySymptom.replace('_', ' ') : 'Fever'}
                  {symptoms.primarySymptom === 'fever' && symptoms.hasFever && (
                    ` (${symptoms.feverTempCelsius}°C / ${(symptoms.feverTempCelsius * 9 / 5 + 32).toFixed(1)}°F for ${symptoms.feverDurationHours}h)`
                  )}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-xs font-bold block text-slate-700">Checked Clinical Indicators:</span>
                <span className="text-xs text-slate-600">
                  {(() => {
                    const currentPrimary = symptoms.primarySymptom || 'fever';
                    const defs = SYMPTOMS_BY_PRIMARY[currentPrimary] || [];
                    const allSelectedIds = [...symptoms.selectedRedFlags, ...symptoms.selectedSecondarySymptoms];
                    const selectedLabels = allSelectedIds.map((id) => defs.find((d) => d.id === id)?.label || id);
                    return selectedLabels.length > 0 ? selectedLabels.join(', ') : 'None Checked';
                  })()}
                </span>
              </div>
            </div>
            {symptoms.additionalNotes && (
              <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <strong>Parent Notes:</strong> {symptoms.additionalNotes}
              </div>
            )}
          </div>

          {/* Recommended Action Plan */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
              Recommended Clinical Action Plan
            </h4>
            <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
              {result.actionPlan.map((action, idx) => (
                <li key={idx}>{action}</li>
              ))}
            </ul>
          </div>

          {/* Recommended Facility */}
          {facility && (
            <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-1 print:bg-slate-100 print:text-black">
              <h4 className="font-bold text-xs uppercase tracking-wider text-teal-400 print:text-black">
                Primary Recommended Facility
              </h4>
              <p className="font-bold text-sm">{facility.name}</p>
              <p className="text-xs opacity-90">{facility.address} • Phone: {facility.phone}</p>
            </div>
          )}

          {/* Signatures & Disclaimer */}
          <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-400 space-y-2">
            <p>
              <strong>Notice for Primary Care Provider:</strong> This assessment was generated via REVAMP PedsER Digital Front Door using AboutKidsHealth decision protocols. Please file this summary in the patient’s chart.
            </p>
          </div>
        </div>

        {/* Modal Footer with Email Input & Send to Email Button */}
        <div className="pt-4 border-t border-slate-200 space-y-3 flex-shrink-0">
          {sentSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-900">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0" />
                <span>Summary emailed successfully to <strong>{emailInput || registeredEmail}</strong>!</span>
              </div>
              <button
                onClick={() => setSentSuccess(false)}
                className="text-xs text-emerald-700 underline font-medium hover:text-emerald-900"
              >
                Send again
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto flex-grow max-w-md">
              <input
                type="email"
                placeholder="Enter recipient email address..."
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
              />
              <button
                onClick={handleEmailToMe}
                disabled={sending}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs flex-shrink-0"
              >
                <Send className="w-4 h-4" />
                <span>{sending ? 'Sending...' : 'Email Summary'}</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              Close Window
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
