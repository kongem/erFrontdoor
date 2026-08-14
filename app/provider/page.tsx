'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Search,
  Activity,
  User,
  Clock,
  Star,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  HeartPulse,
  Lock,
  Eye,
  EyeOff,
  Send
} from 'lucide-react';

const anonymizeName = (name?: string) => {
  if (!name) return 'Anonymous';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0][0] ? `${parts[0][0]}.` : 'Anonymous';
  }
  return parts.map(p => p[0] ? `${p[0]}.` : '').join(' ');
};

export default function StaffPortalPage() {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Lookup State
  const [refId, setRefId] = useState('');
  const [loading, setLoading] = useState(false);
  const [caseData, setCaseData] = useState<any | null>(null);
  const [error, setError] = useState('');

  // Feedback Form State
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [accessRating, setAccessRating] = useState<number>(0);
  const [hoverAccessRating, setHoverAccessRating] = useState<number>(0);
  const [completenessRating, setCompletenessRating] = useState<number>(0);
  const [hoverCompletenessRating, setHoverCompletenessRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Chatbot State
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [currentStage, setCurrentStage] = useState<'ask_accuracy' | 'ask_accessibility' | 'ask_completeness' | 'ask_freetext' | 'complete'>('ask_accuracy');
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Effect to scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Effect to reset chatbot state when a new case is loaded
  useEffect(() => {
    if (caseData) {
      setRating(0);
      setAccessRating(0);
      setCompletenessRating(0);
      setComment('');
      setSubmitSuccess(false);
      setCurrentStage('ask_accuracy');
      setMessages([
        {
          id: '1',
          sender: 'bot',
          text: `Hi! I am the provider feedback assistant. Thank you for inspecting case **${caseData.refId}**.\n\nFirst, how would you rate the **Triage Decision Accuracy**?`,
          timestamp: new Date(),
          isStarRating: true,
          ratingType: 'accuracy',
        },
      ]);
    } else {
      setMessages([]);
    }
  }, [caseData]);

  // Handle star rating click in the chat message bubble
  const handleStarRatingSelect = (starVal: number, ratingType: 'accuracy' | 'accessibility' | 'completeness') => {
    if (ratingType === 'accuracy') {
      setRating(starVal);
      const userMsgId = Date.now().toString();
      setMessages((prev) => [
        ...prev,
        {
          id: userMsgId,
          sender: 'user',
          text: `Selected accuracy rating: **${starVal}** / 5 stars`,
          timestamp: new Date(),
        },
      ]);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString() + '_bot',
            sender: 'bot',
            text: `Got it: ${starVal}/5 stars. Next, **was this form easy to access?**`,
            timestamp: new Date(),
            isStarRating: true,
            ratingType: 'accessibility',
          },
        ]);
        setCurrentStage('ask_accessibility');
      }, 500);
    } else if (ratingType === 'accessibility') {
      setAccessRating(starVal);
      const userMsgId = Date.now().toString();
      setMessages((prev) => [
        ...prev,
        {
          id: userMsgId,
          sender: 'user',
          text: `Selected ease of access rating: **${starVal}** / 5 stars`,
          timestamp: new Date(),
        },
      ]);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString() + '_bot',
            sender: 'bot',
            text: `Understood. Third, **was the summary report complete?**`,
            timestamp: new Date(),
            isStarRating: true,
            ratingType: 'completeness',
          },
        ]);
        setCurrentStage('ask_completeness');
      }, 500);
    } else if (ratingType === 'completeness') {
      setCompletenessRating(starVal);
      const userMsgId = Date.now().toString();
      setMessages((prev) => [
        ...prev,
        {
          id: userMsgId,
          sender: 'user',
          text: `Selected report completeness rating: **${starVal}** / 5 stars`,
          timestamp: new Date(),
        },
      ]);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString() + '_bot',
            sender: 'bot',
            text: `Perfect. Finally, do you have any other discrepancies, clinical notes, or comments? (You can type **"none"** if there is none.)`,
            timestamp: new Date(),
          },
        ]);
        setCurrentStage('ask_freetext');
      }, 500);
    }
  };

  // Submit feedback directly from the chat freetext input
  const submitChatFeedback = async (freetextComment: string) => {
    if (!caseData) return;
    const finalComment = freetextComment.trim().toLowerCase() === 'none' ? '' : freetextComment.trim();
    setComment(finalComment);
    setSubmitting(true);
    
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'provider_feedback',
          refId: caseData.refId,
          rating,
          accessRating: accessRating || 5, // fallback if somehow not set
          completenessRating: completenessRating || 5,
          comment: finalComment,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setSubmitSuccess(true);
        setCurrentStage('complete');
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString() + '_bot',
            sender: 'bot',
            text: `Thank you! Feedback logged. Your case audit has been registered successfully.`,
            timestamp: new Date(),
          },
        ]);
      } else {
        alert('Failed to submit feedback. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Send a message from the text input box
  const handleSendTextMessage = () => {
    const val = inputValue.trim();
    if (!val) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'user',
        text: val,
        timestamp: new Date(),
      },
    ]);
    setInputValue('');

    if (currentStage === 'ask_freetext') {
      setTimeout(() => {
        submitChatFeedback(val);
      }, 500);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === 'admin' && password === 'admin') {
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Invalid username or password. (Hint: use admin / admin to access)');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCaseData(null);
    setRefId('');
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = refId.trim();
    if (!cleanInput) return;

    setLoading(true);
    setError('');
    setCaseData(null);
    setSubmitSuccess(false);
    setRating(0);
    setComment('');

    // Normalize Ref ID (support both 6-digits and full ID)
    let searchRef = cleanInput.toUpperCase();
    if (/^\d{6}$/.test(cleanInput)) {
      searchRef = `PEDS-TRG-${cleanInput}`;
    }

    try {
      const res = await fetch(`/api/triage?refId=${searchRef}`);
      const result = await res.json();

      if (result.success && result.data) {
        setCaseData(result.data);
      } else {
        setError(result.message || `Triage case '${searchRef}' not found. Verify number (e.g. 100100).`);
      }
    } catch (err) {
      console.error('Error fetching triage case:', err);
      setError('An error occurred while retrieving this case. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseData) return;
    if (rating === 0) {
      alert('Please select a triage decision accuracy rating out of 5 stars.');
      return;
    }
    if (accessRating === 0) {
      alert('Please select an ease of access rating out of 5 stars.');
      return;
    }
    if (completenessRating === 0) {
      alert('Please select a report completeness rating out of 5 stars.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'provider_feedback',
          refId: caseData.refId,
          rating,
          accessRating,
          completenessRating,
          comment,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setSubmitSuccess(true);
      } else {
        alert('Failed to submit feedback. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Auth Gate
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center mx-auto text-teal-600">
              <Stethoscope className="w-6 h-6 animate-pulse" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Provider Portal
            </h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Authorization required. Log in using your clinical credentials to review patient triage recommendations.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            {loginError && (
              <div className="bg-rose-50 border border-rose-250 rounded-xl p-3 flex items-start gap-2 text-xs text-rose-900">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Enter username (e.g. admin)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter password (e.g. admin)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
            >
              <ShieldCheck className="w-4.5 h-4.5 text-teal-200" />
              <span>Access Clinical Panel</span>
            </button>
          </form>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-slate-400 hover:text-slate-600 underline">
              Return to Landing Page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Dashboard Panel
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Portal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Triage Accuracy Verification
            </h1>
            <p className="text-sm text-slate-650 mt-1">
              Physicians, Nurses and other providers: Submit accuracy reviews and log diagnostic feedback for REVAMP triage runs.
            </p>
          </div>
          <div className="flex items-center gap-2">

            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-teal-700 hover:text-teal-900 bg-white border border-slate-200 hover:border-slate-300 px-4 py-2 rounded-xl transition shadow-2xs"
            >
              <span>Exit Portal</span>
            </Link>
          </div>
        </div>

        {/* Lookup Case Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
            <Search className="w-5 h-5 text-teal-600" />
            Lookup Triage Case
          </h2>
          <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <span className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm select-none">
                PEDS-TRG-
              </span>
              <input
                type="text"
                placeholder="Enter last 6 digits (e.g. 100100)"
                value={refId}
                onChange={(e) => setRefId(e.target.value)}
                className="w-full pl-[95px] pr-4.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-550 focus:bg-white text-slate-800"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !refId.trim()}
              className="bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm px-6 py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
            >
              {loading ? (
                <>
                  <Activity className="w-4.5 h-4.5 animate-spin text-white" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <span>Retrieve Case</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="bg-rose-50 border border-rose-250 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-rose-900">
              <AlertCircle className="w-4.5 h-4.5 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Case Details and Feedback Form */}
        {caseData && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Case Details Info */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-teal-600" />
                  Patient Triage Report ({caseData.refId})
                </h3>
                <span className="text-xs font-semibold text-slate-550 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(caseData.timestamp).toLocaleDateString()}
                </span>
              </div>

              {/* Patient Profile */}
              <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-650 bg-slate-50/60 border border-slate-100 p-4 rounded-2xl">
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Patient Name</p>
                  <p className="text-slate-800 text-sm font-bold mt-0.5">{anonymizeName(caseData.child?.name)}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Age</p>
                  <p className="text-slate-800 text-sm font-bold mt-0.5">{caseData.child?.ageInMonths} months</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Sex at Birth</p>
                  <p className="text-slate-800 text-sm font-bold mt-0.5 capitalize">{caseData.child?.sex || 'Prefer not to say'}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Postal Code FSA</p>
                  <p className="text-slate-800 text-sm font-bold mt-0.5">{caseData.guardian?.postalCode || 'M5G 1X8'}</p>
                </div>
                {caseData.child?.weightKg && (
                  <div>
                    <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Weight</p>
                    <p className="text-slate-800 text-sm font-bold mt-0.5">{caseData.child?.weightKg} kg</p>
                  </div>
                )}
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Chronic Conditions</p>
                  <p className="text-slate-800 text-sm font-bold mt-0.5">
                    {caseData.child?.hasChronicConditions ? 'Yes' : 'None reported'}
                  </p>
                </div>
              </div>

              {/* Triage Decision Result */}
              <div className="space-y-2">
                <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Assigned Recommendation</p>
                <div className={`p-4 rounded-2xl border ${caseData.result?.category === 'HIGH_EMERGENCY'
                  ? 'bg-rose-50 border-rose-200 text-rose-950'
                  : caseData.result?.category === 'MODERATE_URGENT_CARE'
                    ? 'bg-amber-50 border-amber-250 text-amber-950'
                    : 'bg-teal-50 border-teal-200 text-teal-950'
                  }`}>
                  <div className="flex items-center justify-between font-bold text-sm">
                    <span>{caseData.result?.title}</span>
                    <span className="px-2.5 py-0.5 text-[10px] rounded-full bg-slate-900 text-white font-extrabold">
                      {caseData.result?.badgeText}
                    </span>
                  </div>
                  <p className="text-xs mt-1.5 opacity-90 leading-relaxed">{caseData.result?.summary}</p>
                </div>
              </div>

              {/* Clinical Indicators */}
              <div className="space-y-3">
                <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Reported Symptoms & Concerns</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Primary Concern:</span>
                    <span className="text-xs text-slate-800 capitalize font-bold block">
                      {caseData.symptoms?.primarySymptom ? caseData.symptoms.primarySymptom.replace('_', ' ') : 'None'}
                      {caseData.symptoms?.primarySymptom === 'fever' && caseData.symptoms?.hasFever && (
                        ` (${caseData.symptoms.feverTempCelsius}°C for ${caseData.symptoms.feverDurationHours}h)`
                      )}
                    </span>
                  </div>

                  <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Checked Indicators:</span>
                    <span className="text-xs text-slate-700 font-bold block max-h-[60px] overflow-y-auto leading-normal">
                      {(() => {
                        const redFlags = caseData.symptoms?.selectedRedFlags || [];
                        const secondaries = caseData.symptoms?.selectedSecondarySymptoms || [];
                        const total = [...redFlags, ...secondaries];
                        return total.length > 0 ? total.map(t => t.replace(/_/g, ' ')).join(', ') : 'None Checked';
                      })()}
                    </span>
                  </div>
                </div>
                {caseData.symptoms?.additionalNotes && (
                  <div className="text-xs text-slate-655 bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Guardian Clinical Notes:</span>
                    <p className="italic leading-relaxed">"{caseData.symptoms.additionalNotes}"</p>
                  </div>
                )}
              </div>
            </div>
            {/* Provider Feedback Form (Chatbot Version) */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3 flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-teal-600" />
                Verification Audit Assistant
              </h3>

              {submitSuccess && currentStage === 'complete' ? (
                <div className="text-center py-8 space-y-4 flex-grow flex flex-col justify-center items-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border border-emerald-250 animate-bounce">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900">Feedback Logged!</h4>
                  <p className="text-xs text-slate-655 max-w-xs mx-auto leading-relaxed">
                    Thank you. Your assessment details have been registered. This feedback is critical in refining our triage decision-making protocol.
                  </p>
                </div>
              ) : (
                <div className="flex-grow flex flex-col min-h-0 space-y-4">
                  {/* Chat Message Stream */}
                  <div 
                    ref={chatContainerRef}
                    className="h-[380px] overflow-y-auto border border-slate-150 rounded-2xl p-4 bg-slate-50/50 space-y-4"
                  >
                    {messages.map((msg, index) => {
                      const isBot = msg.sender === 'bot';
                      return (
                        <div key={msg.id || index} className={`flex items-start gap-2 ${isBot ? 'justify-start' : 'justify-end'}`}>
                          {isBot && (
                            <div className="w-6 h-6 rounded-full bg-teal-100 border border-teal-205 flex items-center justify-center text-teal-700 flex-shrink-0 mt-0.5 shadow-2xs">
                              <Activity className="w-3.5 h-3.5" />
                            </div>
                          )}
                          <div className="space-y-2 max-w-[85%]">
                            <div className={`p-3 rounded-xl text-xs leading-relaxed shadow-card-soft ${
                              isBot 
                                ? 'bg-white border border-slate-150 text-slate-800 rounded-tl-none' 
                                : 'bg-teal-600 text-white font-medium rounded-tr-none'
                            }`}>
                              <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                            </div>

                             {isBot && msg.isStarRating && (
                              (msg.ratingType === 'accuracy' && currentStage === 'ask_accuracy') ||
                              (msg.ratingType === 'accessibility' && currentStage === 'ask_accessibility') ||
                              (msg.ratingType === 'completeness' && currentStage === 'ask_completeness')
                             ) && (
                               <div className="bg-white border border-slate-150 rounded-xl p-2.5 shadow-sm inline-flex items-center gap-1 mt-1">
                                 {[1, 2, 3, 4, 5].map((star) => {
                                   let filled = false;
                                   let setHover: (val: number) => void = () => {};

                                   if (msg.ratingType === 'accuracy') {
                                     filled = hoverRating ? star <= hoverRating : star <= rating;
                                     setHover = setHoverRating;
                                   } else if (msg.ratingType === 'accessibility') {
                                     filled = hoverAccessRating ? star <= hoverAccessRating : star <= accessRating;
                                     setHover = setHoverAccessRating;
                                   } else if (msg.ratingType === 'completeness') {
                                     filled = hoverCompletenessRating ? star <= hoverCompletenessRating : star <= completenessRating;
                                     setHover = setHoverCompletenessRating;
                                   }

                                   return (
                                     <button
                                       key={star}
                                       type="button"
                                       onClick={() => handleStarRatingSelect(star, msg.ratingType)}
                                       onMouseEnter={() => setHover(star)}
                                       onMouseLeave={() => setHover(0)}
                                       className="p-1 hover:scale-125 transition-transform"
                                     >
                                       <Star 
                                         className={`w-6 h-6 transition-colors ${
                                           filled 
                                             ? 'text-amber-500 fill-amber-500' 
                                             : 'text-slate-300 fill-transparent'
                                         }`} 
                                       />
                                     </button>
                                   );
                                 })}
                               </div>
                             )}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Form Box at the bottom */}
                  <div className="flex gap-2 items-center flex-shrink-0">
                    <input
                      type="text"
                      disabled={currentStage !== 'ask_freetext'}
                      placeholder={
                        currentStage === 'ask_freetext'
                          ? "Type clinical notes (or 'none')..."
                          : "Select star ratings above..."
                      }
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSendTextMessage();
                        }
                      }}
                      className="flex-grow px-3.5 py-2.5 bg-slate-50 border border-slate-205 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      disabled={currentStage !== 'ask_freetext' || !inputValue.trim()}
                      onClick={handleSendTextMessage}
                      className="bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 text-white p-3 rounded-xl shadow-xs disabled:shadow-none transition flex-shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
