'use client';

import React, { useState, useEffect, useRef } from 'react';
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

  const { step, guardian, child, symptoms, result, nearestFacilities, isHydrated } = state;

  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [exitModalOpen, setExitModalOpen] = useState(false);

  // Chatbot State
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [currentStage, setCurrentStage] = useState<'ask_primary' | 'ask_fever_details' | 'ask_secondary' | 'ask_associated' | 'ask_additional' | 'complete'>('ask_primary');
  const [localRedFlags, setLocalRedFlags] = useState<string[]>([]);
  const [localSecondarySymptoms, setLocalSecondarySymptoms] = useState<string[]>([]);

  // Local Fever values for the sliders
  const [tempVal, setTempVal] = useState(38.5);
  const [durationVal, setDurationVal] = useState(12);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Helper to match input text to one of the 5 primary symptoms
  const matchPrimarySymptom = (input: string): PrimarySymptom | null => {
    const norm = input.toLowerCase().trim();
    if (/fever|temp|hot|feever|feverish|warm/i.test(norm)) return 'fever';
    if (/chest|heart|rib|cardiac|ches|chestpain/i.test(norm)) return 'chest_pain';
    if (/stomach|belly|tummy|abd|abdom|gut|digest|gastric|ache/i.test(norm)) return 'abdominal_pain';
    if (/soft|tissue|injury|sprain|strain|bruise|cut|wound|limb|scrape/i.test(norm)) return 'soft_tissue_injury';
    if (/head|concussion|bump|brain|skull|hit|headache/i.test(norm)) return 'head_injury';
    return null;
  };

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Reset chatbot when returning to Step 3
  useEffect(() => {
    if (step === 3) {
      updateSymptoms({
        primarySymptom: 'select',
        hasFever: false,
        feverTempCelsius: 38.5,
        feverDurationHours: 12,
        selectedRedFlags: [],
        selectedSecondarySymptoms: [],
        additionalNotes: '',
      });
      setCurrentStage('ask_primary');
      setLocalRedFlags([]);
      setLocalSecondarySymptoms([]);
      setInputValue('');
      setTempVal(38.5);
      setDurationVal(12);

      const childName = child.firstName || child.name || 'your child';
      setMessages([
        {
          id: '1',
          sender: 'bot',
          text: `Hi! I am your clinical triage assistant. Let's assess your child's symptoms. What is **${childName}**'s primary concern?`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [step]);

  // Ask secondary concerns stage helper
  const askSecondaryConcerns = (prim: PrimarySymptom) => {
    const childName = child.firstName || child.name || 'your child';
    const definitions = SYMPTOMS_BY_PRIMARY[prim] || [];
    const redFlags = definitions.filter((d) => d.isRedFlag);

    if (redFlags.length > 0) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + '_bot',
          sender: 'bot',
          text: `Are there any secondary concerns? Please describe any of the following that apply to **${childName}**, and click the buttons below. Tap **Done** when finished.`,
          timestamp: new Date(),
          isSecondarySelector: true,
        },
      ]);
      setCurrentStage('ask_secondary');
    } else {
      askAssociatedSymptoms(prim);
    }
  };

  // Ask associated symptoms stage helper
  const askAssociatedSymptoms = (prim: PrimarySymptom) => {
    const childName = child.firstName || child.name || 'your child';
    const definitions = SYMPTOMS_BY_PRIMARY[prim] || [];
    const secondaries = definitions.filter((d) => !d.isRedFlag);

    if (secondaries.length > 0) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + '_bot',
          sender: 'bot',
          text: `Are there any other associated symptoms? Select any that apply to **${childName}**, and click **Done** when finished.`,
          timestamp: new Date(),
          isAssociatedSelector: true,
        },
      ]);
      setCurrentStage('ask_associated');
    } else {
      askAdditionalInfo();
    }
  };

  // Ask additional details stage helper
  const askAdditionalInfo = () => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString() + '_bot',
        sender: 'bot',
        text: `Please tell us any other information including when the symptoms began, any medications given, or any specific concerns or other conditions that the child has. (You can type **"none"** if there is none.)`,
        timestamp: new Date(),
      },
    ]);
    setCurrentStage('ask_additional');
  };

  // Handle fever sliders submit
  const handleFeverDetailsSubmit = (temp: number, duration: number) => {
    updateSymptoms({
      feverTempCelsius: temp,
      feverDurationHours: duration,
    });

    const userMsgId = Date.now().toString();
    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        sender: 'user' as const,
        text: `Highest temperature is **${temp}°C**, lasting **${duration}** hours.`,
        timestamp: new Date(),
      },
    ]);

    setTimeout(() => {
      askSecondaryConcerns('fever');
    }, 600);
  };

  // Handle secondary red flags submit
  const handleSecondaryDoneSubmit = (selectedFlags: string[]) => {
    updateSymptoms({
      selectedRedFlags: selectedFlags,
    });

    const currentPrimary = symptoms.primarySymptom || 'select';
    const definitions = SYMPTOMS_BY_PRIMARY[currentPrimary] || [];
    const selectedLabels = selectedFlags.map(
      (id) => definitions.find((d) => d.id === id)?.label || id
    );

    const userMsgId = Date.now().toString();
    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        sender: 'user' as const,
        text: selectedLabels.length > 0 
          ? `Secondary concerns selected: **${selectedLabels.join(', ')}**`
          : 'No secondary concerns apply.',
        timestamp: new Date(),
      },
    ]);

    setTimeout(() => {
      askAssociatedSymptoms(currentPrimary);
    }, 600);
  };

  // Handle associated symptoms submit
  const handleAssociatedDoneSubmit = (selectedSec: string[]) => {
    updateSymptoms({
      selectedSecondarySymptoms: selectedSec,
    });

    const currentPrimary = symptoms.primarySymptom || 'select';
    const definitions = SYMPTOMS_BY_PRIMARY[currentPrimary] || [];
    const selectedLabels = selectedSec.map(
      (id) => definitions.find((d) => d.id === id)?.label || id
    );

    const userMsgId = Date.now().toString();
    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        sender: 'user' as const,
        text: selectedLabels.length > 0 
          ? `Associated symptoms selected: **${selectedLabels.join(', ')}**`
          : 'No other associated symptoms apply.',
        timestamp: new Date(),
      },
    ]);

    setTimeout(() => {
      askAdditionalInfo();
    }, 600);
  };

  // Handle user sending text message
  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    const userMsgId = Date.now().toString();
    const newUserMessage = {
      id: userMsgId,
      sender: 'user' as const,
      text: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue('');

    setTimeout(() => {
      processBotResponse(text);
    }, 600);
  };

  // Process user's response in bot chat logic
  const processBotResponse = (userInput: string) => {
    const normalized = userInput.toLowerCase().trim();
    const childName = child.firstName || child.name || 'your child';

    if (currentStage === 'ask_primary') {
      const matchedSymptom = matchPrimarySymptom(userInput);

      if (matchedSymptom) {
        updateSymptoms({
          primarySymptom: matchedSymptom,
          hasFever: matchedSymptom === 'fever',
        });

        let displayPrimaryName = '';
        switch (matchedSymptom) {
          case 'fever': displayPrimaryName = 'Fever'; break;
          case 'chest_pain': displayPrimaryName = 'Chest Pain / Discomfort'; break;
          case 'abdominal_pain': displayPrimaryName = 'Abdominal Pain / Stomach Pain'; break;
          case 'soft_tissue_injury': displayPrimaryName = 'Soft Tissue Injury'; break;
          case 'head_injury': displayPrimaryName = 'Head Injury / Concussion'; break;
        }

        const successMsg = `Understood. We will triage for primary concern: **${displayPrimaryName}**.`;

        if (matchedSymptom === 'fever') {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString() + '_bot',
              sender: 'bot',
              text: `${successMsg} Since **${childName}** has a fever, please specify the highest measured temperature and duration below:`,
              timestamp: new Date(),
              isFeverDetailsSelector: true,
            },
          ]);
          setCurrentStage('ask_fever_details');
        } else {
          askSecondaryConcerns(matchedSymptom);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString() + '_bot',
            sender: 'bot',
            text: 'We cannot triage that symptom at the moment, please try another.',
            timestamp: new Date(),
          },
        ]);
      }
    } else if (currentStage === 'ask_additional') {
      updateSymptoms({ additionalNotes: userInput });

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + '_bot',
          sender: 'bot',
          text: 'Thank you. Evaluating your care guidance now...',
          timestamp: new Date(),
        },
      ]);

      setTimeout(() => {
        evaluateAndSave();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 800);
    }
  };

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
                      placeholder="L5N 6N6"
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
                    placeholder="Street address, City"
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
            className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-card-soft space-y-6 flex flex-col"
          >
            {/* Header */}
            <div className="space-y-2 border-b border-slate-100 pb-4">
              <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-800 px-3 py-1 rounded-full text-xs font-semibold">
                <Activity className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
                <span>AI Clinical Assistant</span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Symptom Assessment Chat
              </h2>
              <p className="text-xs text-slate-500">
                Please chat with our assistant to describe {child.firstName || child.name || 'your child'}'s primary concern and any other observations.
              </p>
            </div>

            {/* Chat Messages Container */}
            <div 
              ref={chatContainerRef}
              className="h-[450px] overflow-y-auto border border-slate-150 rounded-2xl p-4 bg-slate-50/50 space-y-4"
            >
              {messages.map((msg, index) => {
                const isBot = msg.sender === 'bot';
                return (
                  <div key={msg.id || index} className={`flex items-start gap-2.5 ${isBot ? 'justify-start' : 'justify-end'}`}>
                    {isBot && (
                      <div className="w-8 h-8 rounded-full bg-teal-100 border border-teal-250 flex items-center justify-center text-teal-700 flex-shrink-0 mt-0.5 shadow-2xs">
                        <Activity className="w-4 h-4" />
                      </div>
                    )}
                    <div className="space-y-2 max-w-[80%]">
                      <div className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-card-soft ${
                        isBot 
                          ? 'bg-white border border-slate-150 text-slate-800 rounded-tl-none' 
                          : 'bg-teal-600 text-white font-medium rounded-tr-none'
                      }`}>
                        <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                      </div>
                      
                      {/* Fever Sliders */}
                      {isBot && msg.isFeverDetailsSelector && currentStage === 'ask_fever_details' && (
                        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4 text-xs mt-2">
                          <div className="space-y-2">
                            <label className="block font-bold text-slate-700">
                              Highest Measured Temp: <span className="text-teal-700 font-extrabold">{tempVal}°C</span> / <span className="text-slate-500">{(tempVal * 9 / 5 + 32).toFixed(1)}°F</span>
                            </label>
                            <input
                              type="range"
                              min="36.5"
                              max="41.5"
                              step="0.1"
                              value={tempVal}
                              onChange={(e) => setTempVal(parseFloat(e.target.value))}
                              className="w-full accent-teal-600 cursor-pointer"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="block font-bold text-slate-700">
                              Fever Duration (Hours): <span className="text-teal-700 font-extrabold">{durationVal}h</span> <span className="text-slate-500">(~{(durationVal / 24).toFixed(1)} days)</span>
                            </label>
                            <input
                              type="range"
                              min="1"
                              max="120"
                              step="1"
                              value={durationVal}
                              onChange={(e) => setDurationVal(parseInt(e.target.value))}
                              className="w-full accent-teal-600 cursor-pointer"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleFeverDetailsSubmit(tempVal, durationVal)}
                            className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition shadow-xs text-xs"
                          >
                            Confirm Fever Details
                          </button>
                        </div>
                      )}

                      {/* Secondary Concerns Red Flags Selector */}
                      {isBot && msg.isSecondarySelector && currentStage === 'ask_secondary' && (
                        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3 mt-2">
                          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                            {(() => {
                              const prim = symptoms.primarySymptom || 'select';
                              const redFlags = (SYMPTOMS_BY_PRIMARY[prim] || []).filter((d) => d.isRedFlag);
                              return redFlags.map((rf) => {
                                const isChecked = localRedFlags.includes(rf.id);
                                return (
                                  <div
                                    key={rf.id}
                                    onClick={() => {
                                      setLocalRedFlags(prev => 
                                        prev.includes(rf.id) ? prev.filter(x => x !== rf.id) : [...prev, rf.id]
                                      );
                                    }}
                                    className={`cursor-pointer p-3 rounded-xl border text-[11px] transition ${
                                      isChecked
                                        ? 'bg-rose-50/55 border-rose-400 ring-1 ring-rose-400/20'
                                        : 'bg-slate-50 border-slate-150 hover:bg-slate-100/50'
                                    }`}
                                  >
                                    <div className="flex items-start gap-2">
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => {}}
                                        className="w-3.5 h-3.5 text-rose-600 rounded border-slate-300 mt-0.5 flex-shrink-0"
                                      />
                                      <div>
                                        <span className="font-bold text-slate-800 block leading-tight">{rf.label}</span>
                                        <span className="text-[10px] text-slate-500 block leading-relaxed mt-0.5">{rf.description}</span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSecondaryDoneSubmit(localRedFlags)}
                            className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition shadow-xs text-xs"
                          >
                            Done
                          </button>
                        </div>
                      )}

                      {/* Associated Symptoms Selector */}
                      {isBot && msg.isAssociatedSelector && currentStage === 'ask_associated' && (
                        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3 mt-2">
                          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                            {(() => {
                              const prim = symptoms.primarySymptom || 'select';
                              const secondaries = (SYMPTOMS_BY_PRIMARY[prim] || []).filter((d) => !d.isRedFlag);
                              return secondaries.map((sec) => {
                                const isChecked = localSecondarySymptoms.includes(sec.id);
                                return (
                                  <div
                                    key={sec.id}
                                    onClick={() => {
                                      setLocalSecondarySymptoms(prev => 
                                        prev.includes(sec.id) ? prev.filter(x => x !== sec.id) : [...prev, sec.id]
                                      );
                                    }}
                                    className={`cursor-pointer p-3 rounded-xl border text-[11px] transition ${
                                      isChecked
                                        ? 'bg-teal-55/10 border-teal-500 ring-1 ring-teal-500/20'
                                        : 'bg-slate-50 border-slate-150 hover:bg-slate-100/50'
                                    }`}
                                  >
                                    <div className="flex items-start gap-2">
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => {}}
                                        className="w-3.5 h-3.5 text-teal-600 rounded border-slate-300 mt-0.5 flex-shrink-0"
                                      />
                                      <div>
                                        <span className="font-bold text-slate-800 block leading-tight">{sec.label}</span>
                                        <span className="text-[10px] text-slate-500 block leading-relaxed mt-0.5">{sec.description}</span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAssociatedDoneSubmit(localSecondarySymptoms)}
                            className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition shadow-xs text-xs"
                          >
                            Done
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Chips for Primary Concern */}
            {currentStage === 'ask_primary' && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Suggested Concerns:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setInputValue('Fever');
                      handleSendMessage('Fever');
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 border border-slate-200 rounded-full text-xs font-semibold text-slate-700 transition"
                  >
                    Fever
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInputValue('Chest Pain');
                      handleSendMessage('Chest Pain');
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 border border-slate-200 rounded-full text-xs font-semibold text-slate-700 transition"
                  >
                    Chest Pain
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInputValue('Stomach Pain');
                      handleSendMessage('Stomach Pain');
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 border border-slate-200 rounded-full text-xs font-semibold text-slate-700 transition"
                  >
                    Stomach Pain
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInputValue('Soft Tissue Injury');
                      handleSendMessage('Soft Tissue Injury');
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 border border-slate-200 rounded-full text-xs font-semibold text-slate-700 transition"
                  >
                    Injury / Sprain
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInputValue('Head Injury');
                      handleSendMessage('Head Injury');
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 border border-slate-200 rounded-full text-xs font-semibold text-slate-700 transition"
                  >
                    Head Injury
                  </button>
                </div>
              </div>
            )}

            {/* Input Form */}
            <div className="flex gap-2 items-center pt-2">
              <input
                type="text"
                disabled={currentStage === 'ask_fever_details' || currentStage === 'ask_secondary' || currentStage === 'ask_associated'}
                placeholder={
                  currentStage === 'ask_fever_details' || currentStage === 'ask_secondary' || currentStage === 'ask_associated'
                    ? "Please select options above..."
                    : currentStage === 'ask_additional'
                    ? "Describe symptoms context (or type 'none')..."
                    : "Type primary symptom (e.g. fever)..."
                }
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage();
                  }
                }}
                className="flex-grow px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                disabled={currentStage === 'ask_fever_details' || currentStage === 'ask_secondary' || currentStage === 'ask_associated' || !inputValue.trim()}
                onClick={() => handleSendMessage()}
                className="bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 text-white p-3.5 rounded-xl shadow-md disabled:shadow-none transition flex-shrink-0"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Back Button */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-100 mt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Child Info</span>
              </button>
            </div>
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
