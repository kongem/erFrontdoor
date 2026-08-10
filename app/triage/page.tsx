'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useTriage,
  calculateAgeInMonths,
  GuardianInfo,
  ChildInfo,
  SymptomInfo,
} from '@/lib/triageContext';
import { RED_FLAG_SYMPTOMS, SYMPTOMS_BY_PRIMARY, PrimarySymptom } from '@/lib/aboutKidsHealthLogic';
import PrintableSummaryModal from '@/components/PrintableSummaryModal';
import ExitFeedbackModal from '@/components/ExitFeedbackModal';
import HelpfulnessRating from '@/components/HelpfulnessRating';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Phone,
  MapPin,
  Baby,
  User,
  Activity,
  Printer,
  Mail,
  RotateCcw,
  ShieldCheck,
  Stethoscope,
  Info,
  ChevronRight,
  ExternalLink,
  Heart
} from 'lucide-react';

export default function TriageWizardPage() {
  const {
    state,
    setStep,
    updateGuardian,
    updateChild,
    updateSymptoms,
    evaluateAndSave,
    resetTriage,
  } = useTriage();

  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [exitModalOpen, setExitModalOpen] = useState(false);

  const router = useRouter();

  const handleExitAssessment = () => {
    resetTriage();
    router.push('/');
  };

  const handleExitFeedbackClose = () => {
    setExitModalOpen(false);
    resetTriage();
    router.push('/');
  };

  const { step, guardian, child, symptoms, result, nearestFacilities, isHydrated } = state;

  if (!isHydrated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 font-semibold">
          <Activity className="w-5 h-5 animate-spin text-teal-600" />
          <span>Loading Pediatric Triage Context...</span>
        </div>
      </div>
    );
  }

  // Next Step Handlers
  const handleGuardianSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleChildSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  const handleSymptomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    evaluateAndSave();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle Red Flag Symptom
  const toggleRedFlag = (id: string) => {
    const isSelected = symptoms.selectedRedFlags.includes(id);
    const updated = isSelected
      ? symptoms.selectedRedFlags.filter((rf) => rf !== id)
      : [...symptoms.selectedRedFlags, id];
    updateSymptoms({ selectedRedFlags: updated });
  };

  // Toggle Secondary Symptom
  const toggleSecondary = (id: string) => {
    const isSelected = symptoms.selectedSecondarySymptoms.includes(id);
    const updated = isSelected
      ? symptoms.selectedSecondarySymptoms.filter((s) => s !== id)
      : [...symptoms.selectedSecondarySymptoms, id];
    updateSymptoms({ selectedSecondarySymptoms: updated });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Top Header Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200/80 px-3.5 py-1.5 rounded-full transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>

          <button
            onClick={handleExitAssessment}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
          >
            Exit Assessment
          </button>
        </div>

        {/* Step Progress Bar Header */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card-soft space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-teal-700">
              Pediatric Digital Triage Assessment
            </span>
            <span className="text-xs font-bold text-slate-500">
              Step {step} of 4
            </span>
          </div>

          {/* Progress track */}
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
            <div
              className="bg-gradient-to-r from-teal-500 to-teal-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-semibold text-slate-500">
            <span className={step >= 1 ? 'text-teal-700 font-bold' : ''}>1. Child/Guardian Profile</span>
            <span className={step >= 2 ? 'text-teal-700 font-bold' : ''}>2. Additional Info</span>
            <span className={step >= 3 ? 'text-teal-700 font-bold' : ''}>3. Primary/Secondary Concerns</span>
            <span className={step >= 4 ? 'text-teal-700 font-bold' : ''}>4. Care Guidance</span>
          </div>
        </div>

        {/* STEP 1: PATIENT & GUARDIAN DEMOGRAPHICS */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-card-soft space-y-6"
          >
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-800 px-3 py-1 rounded-full text-xs font-semibold">
                <User className="w-3.5 h-3.5 text-teal-600" />
                <span>Patient Registration & Demographics</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Patient & Guardian Details
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Please enter patient demographics and contact details to prepare triage assessments and match nearby Ontario pediatric care centers.
              </p>
            </div>

            <form onSubmit={handleGuardianSubmit} className="space-y-6">
              {/* Patient Demographics */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-teal-800 border-b border-slate-200 pb-2">
                  Patient Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Patient First Name"
                      value={child.firstName || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        const fullName = [val, child.middleName, child.lastName].filter(Boolean).join(' ');
                        updateChild({ firstName: val, name: fullName });
                      }}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Middle Name
                    </label>
                    <input
                      type="text"
                      placeholder="Middle Name"
                      value={child.middleName || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        const fullName = [child.firstName, val, child.lastName].filter(Boolean).join(' ');
                        updateChild({ middleName: val, name: fullName });
                      }}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Patient Last Name"
                      value={child.lastName || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        const fullName = [child.firstName, child.middleName, val].filter(Boolean).join(' ');
                        updateChild({ lastName: val, name: fullName });
                      }}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Date of Birth (DOB) *
                    </label>
                    <input
                      type="date"
                      required
                      value={child.dateOfBirth || ''}
                      onChange={(e) => {
                        const dob = e.target.value;
                        const computedAge = calculateAgeInMonths(dob);
                        updateChild({ dateOfBirth: dob, ageInMonths: computedAge });
                      }}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                    />
                    {child.ageInMonths <= 3 && child.dateOfBirth && (
                      <span className="text-xs font-bold text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200 mt-2 block">
                        ⚠️ Clinical Alert: Infant &lt;= 3 months (~{child.ageInMonths} months old). Any fever requires immediate ER evaluation.
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Sex at Birth *
                    </label>
                    <select
                      value={child.sexAtBirth || 'Female'}
                      onChange={(e) => updateChild({ sexAtBirth: e.target.value as any, sex: e.target.value as any })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Intersex">Intersex</option>
                      <option value="Undisclosed">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      OHIP Card Number
                    </label>
                    <input
                      type="text"
                      placeholder="1234-567-890-XX"
                      value={child.ohipNumber || ''}
                      onChange={(e) => updateChild({ ohipNumber: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Ontario Postal Code *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder=""
                      value={guardian.postalCode || ''}
                      onChange={(e) => {
                        updateGuardian({ postalCode: e.target.value });
                        updateChild({ postalCode: e.target.value });
                      }}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="(416) 555-0199"
                      value={guardian.phone || ''}
                      onChange={(e) => {
                        updateGuardian({ phone: e.target.value });
                        updateChild({ phone: e.target.value });
                      }}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="guardian@example.com"
                      value={guardian.email || ''}
                      onChange={(e) => {
                        updateGuardian({ email: e.target.value });
                        updateChild({ email: e.target.value });
                      }}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Home Address
                  </label>
                  <input
                    type="text"
                    placeholder="Street address, City, Province"
                    value={child.address || ''}
                    onChange={(e) => updateChild({ address: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Guardian Information */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <h3 className="text-sm font-bold uppercase tracking-wider text-teal-800 border-b border-slate-200 pb-2">
                  Guardian Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Guardian Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Guardian Full Name"
                      value={guardian.name || ''}
                      onChange={(e) => updateGuardian({ name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Relationship to Patient *
                    </label>
                    <select
                      value={guardian.relationship || 'Parent'}
                      onChange={(e) => updateGuardian({ relationship: e.target.value as any })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                    >
                      <option value="Parent">Parent</option>
                      <option value="Grandparent">Grandparent</option>
                      <option value="Legal Guardian">Legal Guardian</option>
                      <option value="Caregiver">Babysitter / Caregiver</option>
                      <option value="Other">Other Relative</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-md shadow-teal-600/20 transition flex items-center gap-2"
                >
                  <span>Continue to Clinical Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* STEP 2: CLINICAL PROFILE & CHRONIC CONDITIONS */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-card-soft space-y-6"
          >
            <div className="space-y-2">

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Additional Clinical Information
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Review registered demographics and add any optional weight or chronic condition details.
              </p>
            </div>

            {/* Demographics Summary Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2">
              <div className="font-bold text-slate-800 flex items-center justify-between">
                <span>Registered Patient: {child.name || 'Not provided'}</span>
                <span className="text-teal-700 font-extrabold">Age: ~{child.ageInMonths} months</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <p>DOB: <strong>{child.dateOfBirth || 'Not provided'}</strong></p>
                <p>Sex at Birth: <strong>{child.sexAtBirth || 'Undisclosed'}</strong></p>
                <p>OHIP: <strong>{child.ohipNumber || 'Not provided'}</strong></p>
                <p>Guardian: <strong>{guardian.name || 'Not provided'} ({guardian.relationship})</strong></p>
              </div>
            </div>

            <form onSubmit={handleChildSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Weight in KG (Optional)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 12.5"
                    value={child.weightKg || ''}
                    onChange={(e) => updateChild({ weightKg: parseFloat(e.target.value) || undefined })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                  />
                </div>
              </div>


              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Step 1</span>
                </button>

                <button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-md shadow-teal-600/20 transition flex items-center gap-2"
                >
                  <span>Continue to Symptoms</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* STEP 3: SYMPTOM SCREENER & RED FLAGS */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-card-soft space-y-8"
          >
            <div className="space-y-2">

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                What is {child.name || 'your child'}'s primary concern?
              </h2>
            </div>
            <form onSubmit={handleSymptomSubmit} className="space-y-8">
              {/* PRIMARY SYMPTOM DROPDOWN */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-teal-800 mb-2">
                    Select Primary Concern *
                  </label>
                  <select
                    value={symptoms.primarySymptom || 'select'}
                    onChange={(e) => {
                      const prim = e.target.value as PrimarySymptom;
                      updateSymptoms({
                        primarySymptom: prim,
                        selectedRedFlags: [],
                        selectedSecondarySymptoms: [],
                        hasFever: prim === 'fever',
                      });
                    }}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white shadow-2xs"
                  >
                    <option value="select">Select...</option>
                    <option value="fever">Fever / Body Temperature</option>
                    <option value="chest_pain">Chest Pain / Chest Discomfort</option>
                    <option value="abdominal_pain">Abdominal Pain / Stomach Pain</option>
                    <option value="soft_tissue_injury">Soft Tissue Injury (Bruises, Sprains, Strains)</option>
                    <option value="head_injury">Head Injury and Concussion</option>
                  </select>
                </div>

                {symptoms.primarySymptom === 'fever' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Highest Measured Temp: {symptoms.feverTempCelsius}°C / {(symptoms.feverTempCelsius * 9 / 5 + 32).toFixed(1)}°F
                      </label>
                      <input
                        type="range"
                        min="36.5"
                        max="41.5"
                        step="0.1"
                        value={symptoms.feverTempCelsius}
                        onChange={(e) => updateSymptoms({ feverTempCelsius: parseFloat(e.target.value) })}
                        className="w-full accent-teal-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Fever Duration (Hours): {symptoms.feverDurationHours}h (~{(symptoms.feverDurationHours / 24).toFixed(1)} days)
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="120"
                        step="1"
                        value={symptoms.feverDurationHours}
                        onChange={(e) => updateSymptoms({ feverDurationHours: parseInt(e.target.value) })}
                        className="w-full accent-teal-600"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* DYNAMIC RED FLAG SYMPTOMS CARDS */}
              {(() => {
                const currentPrimary = symptoms.primarySymptom || 'select';
                const definitions = SYMPTOMS_BY_PRIMARY[currentPrimary] || [];
                const redFlags = definitions.filter((d) => d.isRedFlag);
                const secondaries = definitions.filter((d) => !d.isRedFlag);

                return (
                  <>
                    {currentPrimary === 'select' && (
                      <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center text-slate-500 font-semibold text-xs sm:text-sm flex flex-col items-center justify-center gap-3">
                        <Stethoscope className="w-12 h-12 text-slate-350" />
                        <p>Please select a primary concern from the dropdown menu above to begin the assessment.</p>
                      </div>
                    )}
                    {redFlags.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-rose-950 flex items-center gap-2 border-b border-rose-100 pb-1.5">
                          <AlertTriangle className="w-4 h-4 text-rose-600" />
                          Secondary Concerns (Select any that apply):
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {redFlags.map((rf) => {
                            const isChecked = symptoms.selectedRedFlags.includes(rf.id);
                            return (
                              <div
                                key={rf.id}
                                onClick={() => toggleRedFlag(rf.id)}
                                className={`cursor-pointer p-4 rounded-2xl border transition-all ${isChecked
                                  ? 'bg-rose-55/10 border-rose-500 ring-2 ring-rose-500/20 shadow-2xs'
                                  : 'bg-white border-slate-200 hover:border-slate-300'
                                  }`}
                              >
                                <div className="flex items-start gap-3">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => { }} // Handled by parent div click
                                    className="w-4 h-4 text-rose-600 rounded border-slate-300 mt-1"
                                  />
                                  <div>
                                    <span className="text-xs font-bold text-slate-900 block">
                                      {rf.label}
                                    </span>
                                    <span className="text-[11px] text-slate-500 leading-relaxed block mt-0.5">
                                      {rf.description}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* DYNAMIC SECONDARY/ASSOCIATED SYMPTOMS CARDS */}
                    {secondaries.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-teal-950 flex items-center gap-2 border-b border-teal-100 pb-1.5">
                          <Stethoscope className="w-4 h-4 text-teal-600" />
                          Other Associated Symptoms:
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {secondaries.map((sec) => {
                            const isChecked = symptoms.selectedSecondarySymptoms.includes(sec.id);
                            return (
                              <div
                                key={sec.id}
                                onClick={() => toggleSecondary(sec.id)}
                                className={`cursor-pointer p-4 rounded-2xl border transition-all ${isChecked
                                  ? 'bg-teal-55/10 border-teal-500 ring-2 ring-teal-500/20 shadow-2xs'
                                  : 'bg-white border-slate-200 hover:border-slate-300'
                                  }`}
                              >
                                <div className="flex items-start gap-3">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => { }} // Handled by parent div click
                                    className="w-4 h-4 text-teal-600 rounded border-slate-300 mt-1"
                                  />
                                  <div>
                                    <span className="text-xs font-bold text-slate-900 block">
                                      {sec.label}
                                    </span>
                                    <span className="text-[11px] text-slate-500 leading-relaxed block mt-0.5">
                                      {sec.description}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}

              {/* ADDITIONAL NOTES */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Additional Parent Notes or Observations
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe when symptoms began, medications given, or specific concerns..."
                  value={symptoms.additionalNotes}
                  onChange={(e) => updateSymptoms({ additionalNotes: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>

              {/* BOTTOM ACTIONS */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Child Info</span>
                </button>

                <button
                  type="submit"
                  disabled={symptoms.primarySymptom === 'select'}
                  className={`bg-gradient-to-r from-teal-600 to-teal-700 text-white font-extrabold text-sm px-8 py-3.5 rounded-xl shadow-lg shadow-teal-600/25 transition flex items-center gap-2 ${symptoms.primarySymptom === 'select'
                    ? 'opacity-40 cursor-not-allowed'
                    : 'hover:from-teal-700 hover:to-teal-800 hover:shadow-glow-teal'
                    }`}
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>Evaluate Care Guidance</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* STEP 4: TRIAGE RESULT DISPLAY */}
        {step === 4 && result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            {/* HERO RESULT CARD */}
            <div className={`rounded-3xl p-6 sm:p-10 border shadow-card-soft ${result.category === 'HIGH_EMERGENCY'
              ? 'bg-gradient-to-br from-rose-900 via-slate-900 to-rose-950 text-white border-rose-700'
              : result.category === 'MODERATE_URGENT_CARE'
                ? 'bg-gradient-to-br from-amber-900 via-slate-900 to-amber-950 text-white border-amber-700'
                : 'bg-gradient-to-br from-teal-900 via-slate-900 to-teal-950 text-white border-teal-700'
              }`}>
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${result.badgeBg}`}>
                      {result.badgeText}
                    </span>
                    <span className="text-xs text-slate-350 font-bold bg-white/10 px-3 py-1 rounded-full">
                      Ref: {state.refId}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-350">
                    Recommended Facility: {result.recommendedFacilityType}
                  </span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  {result.title}
                </h2>

                <p className="text-slate-200 text-sm sm:text-base leading-relaxed max-w-3xl">
                  {result.summary}
                </p>

                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-3">
                  <Clock className="w-5 h-5 text-teal-300 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-bold text-white">
                    {result.timeframeNotice}
                  </span>
                </div>
              </div>
            </div>

            {/* ACTION PLAN */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card-soft space-y-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <CheckCircle2 className="w-5 h-5 text-teal-600" />
                Step-by-Step Action Plan
              </h3>
              <ul className="space-y-3">
                {result.actionPlan.map((action, idx) => (
                  <li key={idx} className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs sm:text-sm font-medium text-slate-700">
                    <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* NEAREST ONTARIO FACILITIES */}
            {result.category !== 'LOW_PRIMARY_CARE' && nearestFacilities.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      Nearest Ontario Facilities
                    </h3>
                    <p className="text-xs text-slate-500">
                      Sorted by proximity to Postal Code: <strong>{guardian.postalCode}</strong>
                    </p>
                  </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {nearestFacilities.map((fac) => (
                    <div
                      key={fac.id}
                      className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">

                          <span className="text-xs font-bold text-slate-500">
                            📍 {fac.distanceKm} km away
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-slate-900 leading-snug">
                          {fac.name}
                        </h4>

                        <p className="text-xs text-slate-600 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span>{fac.address}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* EXPORT & ACTION MODAL BUTTONS */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card-soft flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setPrintModalOpen(true)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-3 rounded-xl transition flex items-center gap-2 shadow-xs"
                >
                  <Mail className="w-4 h-4 text-teal-400" />
                  <span>Email Summary</span>
                </button>
              </div>

              <button
                onClick={resetTriage}
                className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1.5 underline"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Start New Triage</span>
              </button>
            </div>

            {/* RATING WIDGET */}
            <HelpfulnessRating />

            {/* MODALS INTEGRATION */}
            <PrintableSummaryModal
              isOpen={printModalOpen}
              onClose={() => setPrintModalOpen(false)}
              onEmailSent={() => setExitModalOpen(true)}
              refId={state.refId}
              guardian={guardian}
              child={child}
              symptoms={symptoms}
              result={result}
              facility={nearestFacilities[0]}
            />

            <ExitFeedbackModal
              isOpen={exitModalOpen}
              onClose={handleExitFeedbackClose}
              refId={state.refId}
            />
          </motion.div>
        )}

      </div>
    </div>
  );
}
