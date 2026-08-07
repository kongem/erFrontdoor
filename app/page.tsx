'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTriage } from '@/lib/triageContext';
import {
  ShieldAlert,
  Clock,
  CheckCircle2,
  Stethoscope,
  Activity,
  Search,
  ChevronDown,
  ArrowRight,
  Sparkles,
  PhoneCall,
  MapPin,
  Heart,
  Baby,
  ShieldCheck,
  AlertCircle,
  Building2,
  UserCheck,
  FileText,
  ExternalLink,
  Shield,
  BookOpen,
  Thermometer,
  Smile
} from 'lucide-react';

import DemographicsModal from '@/components/DemographicsModal';

// Care Levels Data
const CARE_LEVELS = [
  {
    id: 'er',
    title: 'Pediatric Emergency Room',
    subtitle: 'Immediate Specialized Care',
    badge: 'Immediate Action',
    badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
    color: 'rose',
    borderColor: 'border-rose-300',
    bgLight: 'bg-rose-50/70',
    iconColor: 'text-rose-600',
    description: 'For severe, life-threatening, or sudden medical conditions requiring specialized pediatric trauma or emergency intervention.',
    examples: [
      'Severe difficulty breathing or rapid gasping',
      'High fever in infants under 3 months (>100.4°F)',
      'Unconsciousness, unresponsiveness, or lethargy',
      'Severe allergic reactions (anaphylaxis)',
      'Suspected broken bones with visible deformity',
      'Head injury with vomiting or confusion',
    ],
  },
  {
    id: 'urgent',
    title: 'Urgent Care',
    subtitle: 'Same-Day Treatment for Non-Emergencies',
    badge: 'Same-Day Care',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-200',
    color: 'amber',
    borderColor: 'border-amber-300',
    bgLight: 'bg-amber-50/70',
    iconColor: 'text-amber-600',
    description: 'For urgent medical concerns that need attention within hours but are not immediately life-threatening.',
    examples: [
      'Minor cuts needing stitches or minor burns',
      'Ear infections, sore throat, or mild asthma attacks',
      'Sprains, strains, or minor sports injuries',
      'Persistent vomiting or mild dehydration',
      'Fever over 101°F in children older than 6 months',
      'Mild skin rashes or insect bites',
    ],
  },
  {
    id: 'primary',
    title: 'Pediatrician / Primary Care',
    subtitle: 'Routine & Ongoing Health Management',
    badge: 'Scheduled Visit',
    badgeBg: 'bg-teal-100 text-teal-800 border-teal-200',
    color: 'teal',
    borderColor: 'border-teal-300',
    bgLight: 'bg-teal-50/70',
    iconColor: 'text-teal-600',
    description: 'For routine checkups, mild recurring symptoms, vaccinations, and non-urgent medical advice.',
    examples: [
      'Routine well-child checkups & immunizations',
      'Mild cold symptoms without breathing trouble',
      'Chronic condition check-ins (mild eczema, asthma)',
      'Behavioral or developmental questions',
      'School or sports clearance physicals',
      'Sleep, feeding, or digestive routine advice',
    ],
  },
];

// FAQ Data
const FAQ_ITEMS = [
  {
    category: 'Emergency',
    question: 'How do I know if my child needs the Pediatric ER vs Urgent Care?',
    answer: 'If your child has trouble breathing, severe lethargy, a fever in an infant under 3 months, major head trauma, or uncontrollable bleeding, head directly to the Pediatric ER. Urgent Care is suitable for minor cuts, mild asthma, sprains, or earaches.'
  },
  {
    category: 'Emergency',
    question: 'What should I bring with me to the Pediatric Emergency Room?',
    answer: 'Bring a government-issued photo ID, your health card, a list of current medications your child takes, immunization records, and any favorite comforting item (blanket, toy, or pacifier) for your child.'
  },
  {
    category: 'Triage Tool',
    question: 'How accurate is the Digital Triage Tool?',
    answer: 'Our digital triage tool uses pediatric clinical algorithms reviewed by board-certified pediatric emergency physicians. It helps categorize symptom urgency, but it does not replace professional medical judgment. Always seek immediate care if worried.'
  },
  {
    category: 'Triage Tool',
    question: 'How come my concern is not on the list?',
    answer: 'Our triage tool covers the most common pediatric symptoms. If your child’s specific concern is not listed, we recommend contacting your primary care provider or telehealth advisory line for personalized guidance.'
  },
  {
    category: 'Triage Tool',
    question: 'What technology do I need to launch the triage tool?',
    answer: 'Any modern web browser on a smartphone, tablet, or desktop computer is all you need. No app downloads or installations are required.'
  },
  {
    category: 'General',
    question: 'Is there a fee?',
    answer: 'No, using this digital triage tool is completely free for patients, parents, and caregivers.'
  },
  {
    category: 'General',
    question: 'Is this digital triage tool a safe and secure way to share information?',
    answer: 'Yes, your information is encrypted and protected in accordance with privacy regulations. Demographics are only used to prepare your summary referral copy.'
  },
  {
    category: 'General',
    question: 'Where can I share feedback on the digital triage tool?',
    answer: 'We value your input! After you complete a triage session and email your summary, an exit feedback form will pop up. You can also contact our support team at any time.'
  }
];

// Steps Data
const STEPS = [
  {
    number: '01',
    title: 'Demographics',
    time: 'Intake',
    icon: Baby,
    description: 'Enter your child\'s age and other demographic information',
  },
  {
    number: '02',
    title: 'Screening',
    time: 'Evaluation',
    icon: Activity,
    description: 'Automated evaluation for high-risk symptoms such as respiratory distress or fever.',
  },
  {
    number: '03',
    title: 'Recommendation',
    time: 'Coordination',
    icon: Stethoscope,
    description: 'Receive clear guidance on whether to visit the ER, Urgent Care, or consult your Pediatrician.',
  },
  {
    number: '04',
    title: 'Directions & Summary',
    time: 'Care',
    icon: MapPin,
    description: 'See your closest emergency room and access your triage summary',
  },
];

export default function LandingPage() {
  const router = useRouter();
  const { setStep, updateChild } = useTriage();
  const [activeTab, setActiveTab] = useState('er');
  const [faqSearch, setFaqSearch] = useState('');
  const [activeFaqCategory, setActiveFaqCategory] = useState('All');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [triageStarted, setTriageStarted] = useState(false);
  const [demographicsModalOpen, setDemographicsModalOpen] = useState(false);
  const [showEligibility, setShowEligibility] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setShowEligibility(true);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStartTriage = (ageInMonths?: number) => {
    if (ageInMonths !== undefined) {
      updateChild({ ageInMonths });
    }
    setDemographicsModalOpen(true);
  };

  const handleScrollToTriage = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCompareClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setShowEligibility(true);
    setTimeout(() => {
      const el = document.getElementById('eligibility-guide');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  // FAQ Filtering
  const filteredFaqs = FAQ_ITEMS.filter((item) => {
    const matchesSearch =
      item.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      item.answer.toLowerCase().includes(faqSearch.toLowerCase());
    const matchesCategory =
      activeFaqCategory === 'All' || item.category === activeFaqCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-16 pb-20">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/80 via-sky-50/40 to-slate-50 min-h-[calc(100vh-105px)] flex flex-col justify-center items-center py-12 border-b border-slate-200/60">
        <div className="absolute top-0 right-0 -z-10 translate-x-1/3 -translate-y-1/4 w-[500px] h-[500px] rounded-full bg-teal-200/30 blur-3xl" />
        <div className="absolute bottom-0 left-0 -z-10 -translate-x-1/3 translate-y-1/4 w-[500px] h-[500px] rounded-full bg-sky-200/30 blur-3xl" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6 text-center flex flex-col items-center">
            {/* Left Content */}


            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15] max-w-3xl">
              Fast, Reassuring Care Guidance for Your <span className="bg-gradient-to-r from-teal-600 via-teal-700 to-sky-600 bg-clip-text text-transparent">Child’s Health</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl font-normal leading-relaxed">
              Not sure if your child needs the Emergency Room, Urgent Care, or a doctor’s visit? Our clinically guided digital triage tool delivers instant care recommendations in under 90 seconds.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 w-full sm:w-auto">
              <button
                onClick={handleScrollToTriage}
                className="w-full sm:w-auto bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold text-base px-8 py-4 rounded-2xl shadow-lg shadow-teal-600/25 hover:shadow-glow-teal hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
              >
                <ShieldCheck className="w-5 h-5 text-teal-200 group-hover:rotate-6 transition-transform" />
                <span>Launch Digital Triage</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href="#eligibility-guide"
                onClick={handleCompareClick}
                className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 font-semibold text-base px-6 py-4 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition flex items-center justify-center gap-2"
              >
                <Stethoscope className="w-5 h-5 text-teal-600" />
                Compare Care Levels
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ANIMATED ELIGIBILITY GUIDE (ER VS URGENT CARE VS PRIMARY CARE) */}
      <section
        id="eligibility-guide"
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-36 transition-all duration-1000 ease-in-out ${showEligibility ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-16 scale-95 pointer-events-none'
          }`}
      >
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Where Should You Take Your Child?
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            Understand the difference between Pediatric Emergency Rooms, Urgent Care, and Primary Care before you travel.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8">
          {CARE_LEVELS.map((level) => {
            const isActive = activeTab === level.id;
            return (
              <button
                key={level.id}
                onClick={() => setActiveTab(level.id)}
                className={`relative px-5 py-3 rounded-2xl font-bold text-sm transition-all duration-200 flex items-center gap-2.5 ${isActive
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10 scale-105'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${level.id === 'er' ? 'bg-rose-500' : level.id === 'urgent' ? 'bg-amber-500' : 'bg-teal-500'
                  }`} />
                <span>{level.title}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 border-2 border-teal-500 rounded-2xl pointer-events-none"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Display */}
        <AnimatePresence mode="wait">
          {CARE_LEVELS.filter((l) => l.id === activeTab).map((level) => (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className={`glass-card rounded-3xl p-6 sm:p-10 border ${level.borderColor} shadow-card-soft`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-5 space-y-4">
                  <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full border ${level.badgeBg}`}>
                    {level.badge}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {level.title}
                  </h3>
                  <p className="text-sm font-semibold text-slate-500">
                    {level.subtitle}
                  </p>
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                    {level.description}
                  </p>
                </div>

                <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <Activity className={`w-4 h-4 ${level.iconColor}`} />
                    Common Reasons to Choose {level.title}:
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {level.examples.map((example, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs sm:text-sm font-medium text-slate-700"
                      >
                        <CheckCircle2 className={`w-4 h-4 flex-shrink-0 mt-0.5 ${level.iconColor}`} />
                        <span>{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </section>

      {/* HOW THIS TRIAGE TOOL WORKS */}
      <section id="how-it-works" className="bg-white py-16 border-y border-slate-200/70 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How This Triage Tool Works
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              Designed by pediatric emergency specialists to give parents immediate clarity and peace of mind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, idx) => {
              const IconComp = step.icon;
              return (
                <div
                  key={idx}
                  className="relative group bg-slate-50 hover:bg-teal-50/50 rounded-3xl p-6 border border-slate-200/80 hover:border-teal-300 transition-all duration-300 shadow-xs hover:shadow-md flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-teal-600/40 group-hover:text-teal-600 transition-colors">
                        {step.number}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200 shadow-2xs">
                        {step.time}
                      </span>
                    </div>

                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-teal-700 shadow-xs group-hover:scale-110 transition-transform">
                      <IconComp className="w-6 h-6" />
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">
                      {step.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* LAUNCH DIGITAL TRIAGE BUTTON CARD */}
      <section id="launch-triage" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="relative rounded-3xl bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white p-8 sm:p-12 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 w-[400px] h-[400px] rounded-full bg-teal-500/20 blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-4 text-center lg:text-left">
              <span className="inline-flex items-center gap-2 bg-teal-500/20 border border-teal-400/30 text-teal-200 text-xs font-semibold px-3 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                Secure & Confidential
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
                Ready to Evaluate Your Child’s Symptoms?
              </h2>
              <p className="text-teal-100/90 text-sm sm:text-base max-w-2xl font-normal leading-relaxed">
                Start our guided interactive assessment now. Answer a few brief questions regarding your child’s symptoms to get immediate care recommendations and pre-arrival ER notice options.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col items-center lg:items-end justify-center">
              <button
                onClick={() => handleStartTriage()}
                className="w-full sm:w-auto bg-gradient-to-r from-teal-400 to-teal-500 hover:from-teal-300 hover:to-teal-400 text-slate-950 font-extrabold text-lg px-8 py-5 rounded-2xl shadow-lg shadow-teal-500/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 group"
              >
                <Activity className="w-6 h-6 text-slate-950 group-hover:rotate-12 transition-transform" />
                <span>Launch Digital Triage</span>
                <ArrowRight className="w-5 h-5 text-slate-950 group-hover:translate-x-1 transition-transform" />
              </button>

            </div>
          </div>
        </div>
      </section>

      {/* SEARCHABLE FAQ ACCORDION */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-36 mt-[500px]">
        <div className="text-center space-y-4">

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Have Questions About Pediatric ER Care?
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Find quick answers regarding emergency symptoms, fees, and triage accuracy.
          </p>
        </div>

        {/* Search Bar & Category Filter */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              placeholder="Search questions (e.g., security, technology, fee...)"
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-xs transition"
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            {['All', 'Emergency', 'Triage Tool', 'General'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFaqCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${activeFaqCategory === cat
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden transition"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full text-left p-5 font-bold text-slate-900 text-sm sm:text-base flex items-center justify-between gap-4 hover:bg-slate-50 transition"
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0" />
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180 text-teal-600' : ''
                        }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-slate-500 text-sm bg-white rounded-2xl border border-slate-200">
              No questions found matching your search term.
            </div>
          )}
        </div>
      </section>

      {/* EDUCATIONAL RESOURCES SECTION */}
      <section id="educational-resources" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-24 pb-8">
        <div className="text-center max-w-3xl mx-auto space-y-4">

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Educational Resources for Parents
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Access reliable, clinician-approved symptom guides from AboutKidsHealth to manage common health issues at home.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Card 1: Fever */}
          <a
            href="https://www.aboutkidshealth.ca/fever"
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs hover:shadow-card-soft hover:border-teal-300 transition duration-300 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Thermometer className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-950 flex items-center gap-1.5 group-hover:text-teal-600 transition-colors">
                  <span>Fever in Children</span>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-teal-500" />
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Learn how to accurately measure your child's temperature, when to use fever reducers, and signs that require medical attention.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-teal-600 hover:text-teal-700 mt-4 inline-flex items-center gap-1">
              Read Guide
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </a>

          {/* Card 2: Allergies */}
          <a
            href="https://www.aboutkidshealth.ca/allergies"
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs hover:shadow-card-soft hover:border-teal-300 transition duration-300 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-950 flex items-center gap-1.5 group-hover:text-teal-600 transition-colors">
                  <span>Allergies Guide</span>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-teal-500" />
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Understand seasonal allergies, food sensitivities, hives, and how to differentiate between mild reactions and emergency anaphylaxis.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-teal-600 hover:text-teal-700 mt-4 inline-flex items-center gap-1">
              Read Guide
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </a>

          {/* Card 3: Colds */}
          <a
            href="https://www.aboutkidshealth.ca/healthaz/infectious-diseases/colds-viral-upper-respiratory-infections/?language=en"
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs hover:shadow-card-soft hover:border-teal-300 transition duration-300 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Smile className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-950 flex items-center gap-1.5 group-hover:text-teal-600 transition-colors">
                  <span>Colds, Coughs & Flu</span>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-teal-500" />
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Tips for soothing a sore throat, relieving nasal congestion safely, and helping your child recover comfortably from viral infections.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-teal-600 hover:text-teal-700 mt-4 inline-flex items-center gap-1">
              Read Guide
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Brand Col */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-teal-400 flex items-center justify-center text-white">
                  <Heart className="w-5 h-5 fill-current" />
                </div>
                <span className="text-lg font-bold text-white">
                  REVAMP <span className="text-teal-400">Pediatric ER Frontdoor</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                Dedicated pediatric emergency room frontdoor and smart digital triage for children, infants, and teens.
              </p>
              <div className="pt-2 text-xs text-slate-400 space-y-1">
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  <span>1001H eMHI Way, Suite 404, Zoom</span>
                </p>
                <p className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  <span>REVAMP Hotline 1-800-555-PEDS</span>
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100">
                Navigation
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><Link href="/" className="hover:text-teal-400 transition">Landing Page</Link></li>
                <li><Link href="/#eligibility-guide" className="hover:text-teal-400 transition">Care Level Guide</Link></li>
                <li><Link href="/#how-it-works" className="hover:text-teal-400 transition">How Triage Works</Link></li>
                <li><Link href="/#faq" className="hover:text-teal-400 transition">FAQ Accordion</Link></li>
                <li><Link href="/support" className="hover:text-teal-400 transition">Support Request Form</Link></li>
                <li><Link href="/feedback" className="hover:text-teal-400 transition">Patient Feedback</Link></li>
              </ul>
            </div>

            {/* Emergency Contacts */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100">
                Emergency Hotlines
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="text-rose-400 font-bold">Emergency Services: 911</li>
                <li>Poison Help 1-844-764-7669</li>
                <li>Kids Help Phone 1-800-668-6868</li>
              </ul>
            </div>

            {/* Medical Disclaimer */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100">
                Medical Disclaimer
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                This digital triage tool provides general information and care guidance only. It does not replace immediate evaluation by a licensed healthcare professional.
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} REVAMP Health System. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-slate-400">Privacy Policy</a>
              <a href="#" className="hover:text-slate-400">PHIPA Compliance</a>
              <a href="#" className="hover:text-slate-400">Terms of Use</a>
            </div>
          </div>
        </div>
      </footer>

      <DemographicsModal
        isOpen={demographicsModalOpen}
        onClose={() => setDemographicsModalOpen(false)}
      />
    </div>
  );
}
