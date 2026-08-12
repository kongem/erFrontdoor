'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  Mail,
  MessageSquare,
  Star,
  Users,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  FileText,
  UserCheck,
  Building,
  RefreshCw,
  Search,
  Lock,
  Eye,
  EyeOff,
  User,
  ShieldCheck,
  AlertCircle,
  Smile
} from 'lucide-react';

export default function VendorPortalPage() {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Dashboard State
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'metrics' | 'qualitative' | 'experience'>('metrics');
  const [selectedCase, setSelectedCase] = useState<any | null>(null);

  // FSA filtering state
  const [fsaSearch, setFsaSearch] = useState('');

  // Sorting State
  const [triageSort, setTriageSort] = useState<{ field: string; direction: 'asc' | 'desc' }>({
    field: 'timestamp',
    direction: 'desc',
  });
  const [providerSort, setProviderSort] = useState<{ field: string; direction: 'asc' | 'desc' }>({
    field: 'timestamp',
    direction: 'desc',
  });
  const [experienceSort, setExperienceSort] = useState<{ field: string; direction: 'asc' | 'desc' }>({
    field: 'timestamp',
    direction: 'desc',
  });

  const toggleTriageSort = (field: string) => {
    setTriageSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const toggleProviderSort = (field: string) => {
    setProviderSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const toggleExperienceSort = (field: string) => {
    setExperienceSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const getSortIndicator = (sortState: { field: string; direction: 'asc' | 'desc' }, field: string) => {
    if (sortState.field !== field) return <span className="text-slate-300 ml-1 select-none">↕</span>;
    return sortState.direction === 'asc'
      ? <span className="text-indigo-600 ml-1 select-none font-extrabold">▲</span>
      : <span className="text-indigo-600 ml-1 select-none font-extrabold">▼</span>;
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
  };

  const fetchData = async () => {
    if (!isLoggedIn) return;
    setLoading(true);
    try {
      const res = await fetch('/api/feedback');
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn]);

  // Compute Metrics
  const triageCases = data.filter((x) => x.type === 'triage_case');
  const pcpEmailsCount = triageCases.filter((x) => x.emailSent).length;
  const providerFeedbacks = data.filter((x) => x.type === 'provider_feedback');

  const avgRating =
    providerFeedbacks.length > 0
      ? (
        providerFeedbacks.reduce((sum, item) => sum + (item.rating || 0), 0) /
        providerFeedbacks.length
      ).toFixed(1)
      : 'N/A';

  const providerFeedbacksWithAccess = providerFeedbacks.filter((x) => x.accessRating !== undefined && x.accessRating !== null);
  const avgAccessRating =
    providerFeedbacksWithAccess.length > 0
      ? (
        providerFeedbacksWithAccess.reduce((sum, item) => sum + (item.accessRating || 0), 0) /
        providerFeedbacksWithAccess.length
      ).toFixed(1)
      : 'N/A';

  const providerFeedbacksWithCompleteness = providerFeedbacks.filter((x) => x.completenessRating !== undefined && x.completenessRating !== null);
  const avgCompletenessRating =
    providerFeedbacksWithCompleteness.length > 0
      ? (
        providerFeedbacksWithCompleteness.reduce((sum, item) => sum + (item.completenessRating || 0), 0) /
        providerFeedbacksWithCompleteness.length
      ).toFixed(1)
      : 'N/A';

  const experienceFeedbacks = data.filter((x) => x.type === 'experience_feedback');
  const avgExperienceRating =
    experienceFeedbacks.length > 0
      ? (
        experienceFeedbacks.reduce((sum, item) => sum + (item.rating || 0), 0) /
        experienceFeedbacks.length
      ).toFixed(1)
      : 'N/A';



  // Helper to link provider feedback to a specific triage case
  const getProviderFeedbackForCase = (refId: string) => {
    return providerFeedbacks.find((f) => f.refId === refId);
  };

  // Helper to link patient exit feedback to a specific triage case
  const getPatientFeedbackForCase = (refId: string) => {
    return data.find((x) => x.type === 'exit_survey' && x.refId === refId);
  };

  // Helper to link a case definition to provider feedback (for details lookup)
  const getCaseByRefId = (refId: string) => {
    return triageCases.find((c) => c.refId === refId);
  };

  const handleShowCaseDetails = (refId: string) => {
    const matched = getCaseByRefId(refId);
    if (matched) {
      setSelectedCase(matched);
    } else {
      alert('Case data not found or was logged before full logging was enabled.');
    }
  };

  // Filtered cases by FSA prefix search
  const filteredTriageCases = triageCases.filter((c) => {
    const postal = c.guardian?.postalCode || '';
    return postal.toUpperCase().includes(fsaSearch.trim().toUpperCase());
  });

  // Sort Triage Cases
  const sortedTriageCases = [...filteredTriageCases].sort((a, b) => {
    let aVal: any = '';
    let bVal: any = '';

    switch (triageSort.field) {
      case 'refId':
        aVal = a.refId || '';
        bVal = b.refId || '';
        break;
      case 'timestamp':
        aVal = new Date(a.timestamp).getTime();
        bVal = new Date(b.timestamp).getTime();
        break;
      case 'age':
        aVal = a.child?.ageInMonths ?? 0;
        bVal = b.child?.ageInMonths ?? 0;
        break;
      case 'location':
        aVal = (a.guardian?.postalCode || '').trim().substring(0, 3).toUpperCase();
        bVal = (b.guardian?.postalCode || '').trim().substring(0, 3).toUpperCase();
        break;
      case 'category':
        aVal = a.result?.category || '';
        bVal = b.result?.category || '';
        break;
      case 'email':
        aVal = a.emailSent ? 1 : 0;
        bVal = b.emailSent ? 1 : 0;
        break;
      case 'audit':
        aVal = providerFeedbacks.find((f) => f.refId === a.refId)?.rating ?? 0;
        bVal = providerFeedbacks.find((f) => f.refId === b.refId)?.rating ?? 0;
        break;
      case 'feedback':
        const patientFA = data.find((x) => x.type === 'exit_survey' && x.refId === a.refId);
        const patientFB = data.find((x) => x.type === 'exit_survey' && x.refId === b.refId);
        aVal = patientFA ? (patientFA.skipped ? 'skipped' : patientFA.helpedDecide || '') : '';
        bVal = patientFB ? (patientFB.skipped ? 'skipped' : patientFB.helpedDecide || '') : '';
        break;
      default:
        aVal = new Date(a.timestamp).getTime();
        bVal = new Date(b.timestamp).getTime();
    }

    if (aVal < bVal) return triageSort.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return triageSort.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Sort Provider Feedbacks
  const sortedProviderFeedbacks = [...providerFeedbacks].sort((a, b) => {
    let aVal: any = '';
    let bVal: any = '';

    switch (providerSort.field) {
      case 'refId':
        aVal = a.refId || '';
        bVal = b.refId || '';
        break;
      case 'timestamp':
        aVal = new Date(a.timestamp).getTime();
        bVal = new Date(b.timestamp).getTime();
        break;
      case 'rating':
        aVal = a.rating ?? 0;
        bVal = b.rating ?? 0;
        break;
      case 'accessRating':
        aVal = a.accessRating ?? 0;
        bVal = b.accessRating ?? 0;
        break;
      case 'completenessRating':
        aVal = a.completenessRating ?? 0;
        bVal = b.completenessRating ?? 0;
        break;
      case 'comment':
        aVal = a.comment || '';
        bVal = b.comment || '';
        break;
      default:
        aVal = new Date(a.timestamp).getTime();
        bVal = new Date(b.timestamp).getTime();
    }

    if (aVal < bVal) return providerSort.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return providerSort.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Sort Experience Feedbacks
  const sortedExperienceFeedbacks = [...experienceFeedbacks].sort((a, b) => {
    let aVal: any = '';
    let bVal: any = '';

    switch (experienceSort.field) {
      case 'timestamp':
        aVal = new Date(a.timestamp).getTime();
        bVal = new Date(b.timestamp).getTime();
        break;
      case 'visitType':
        aVal = a.visitType || '';
        bVal = b.visitType || '';
        break;
      case 'rating':
        aVal = a.rating ?? 0;
        bVal = b.rating ?? 0;
        break;
      case 'comment':
        aVal = a.comment || '';
        bVal = b.comment || '';
        break;
      default:
        aVal = new Date(a.timestamp).getTime();
        bVal = new Date(b.timestamp).getTime();
    }

    if (aVal < bVal) return experienceSort.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return experienceSort.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Auth Gate
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center mx-auto text-indigo-600">
              <BarChart3 className="w-6 h-6 animate-pulse" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Vendor Analytics Portal
            </h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Authorization required. Log in using your vendor credentials to view triage metrics and statistics.
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
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
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
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-655"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
            >
              <ShieldCheck className="w-4.5 h-4.5 text-indigo-200" />
              <span>Access Dashboard</span>
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

  // Authenticated Dashboard View
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>

            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              REVAMP System Dashboard
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Quality Assurance, anonymized clinical analytics, and healthcare provider accuracy metrics.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2.5 bg-white border border-slate-205 rounded-xl hover:bg-slate-100 text-slate-700 transition"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-705 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 px-4 py-2.5 rounded-xl transition shadow-2xs"
            >
              <span>Exit Portal</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-2 relative overflow-hidden">
            <div className="absolute right-4 top-4 w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Triage</p>
            <p className="text-3xl font-black text-slate-900">{triageCases.length}</p>
            <p className="text-[10px] text-slate-500 font-semibold">Total digital intake cases recorded</p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-2 relative overflow-hidden">
            <div className="absolute right-4 top-4 w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Mail className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Summary</p>
            <p className="text-3xl font-black text-slate-900">{pcpEmailsCount}</p>
            <p className="text-[10px] text-slate-500 font-semibold">Summaries sent to parent email</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-2 relative overflow-hidden">
            <div className="absolute right-4 top-4 w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
              <MessageSquare className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reviews</p>
            <p className="text-3xl font-black text-slate-900">{providerFeedbacks.length}</p>
            <p className="text-[10px] text-slate-500 font-semibold">Healthcare audit cases submitted</p>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-2 relative overflow-hidden">
            <div className="absolute right-4 top-4 w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Star className="w-5 h-5 fill-emerald-600 text-emerald-600" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Review Scores</p>
            <div className="space-y-1 pt-1 text-slate-700">
              <p className="text-xs">Decision Accuracy: <strong>{avgRating}/5</strong></p>
              <p className="text-xs">Form Access Ease: <strong>{avgAccessRating}/5</strong></p>
              <p className="text-xs">Report Completeness: <strong>{avgCompletenessRating}/5</strong></p>
            </div>
            <p className="text-[9px] text-slate-500 font-semibold mt-1">Average provider ratings</p>
          </div>

          {/* Card 5 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-2 relative overflow-hidden">
            <div className="absolute right-4 top-4 w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Smile className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pt Experience</p>
            <div className="space-y-1 pt-1 text-slate-700">
              <p className="text-xs">Total Reviews: <strong>{experienceFeedbacks.length}</strong></p>
              <p className="text-xs">Average Rating: <strong>{avgExperienceRating}/5</strong></p>
            </div>
            <p className="text-[9px] text-slate-500 font-semibold mt-1">Anonymized parent satisfaction</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`py-3.5 px-6 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${activeTab === 'metrics'
              ? 'border-indigo-600 text-indigo-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
          >
            <Layers className="w-4 h-4" />
            Highlight Capture Logs
          </button>
          <button
            onClick={() => setActiveTab('qualitative')}
            className={`py-3.5 px-6 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${activeTab === 'qualitative'
              ? 'border-indigo-600 text-indigo-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
          >
            <MessageSquare className="w-4 h-4" />
            Provider Qualitative Feedback
          </button>
          <button
            onClick={() => setActiveTab('experience')}
            className={`py-3.5 px-6 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${activeTab === 'experience'
              ? 'border-indigo-600 text-indigo-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
          >
            <Smile className="w-4 h-4" />
            Other Feedback
          </button>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 font-semibold flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin" />
            <p>Loading analytics database log entries...</p>
          </div>
        ) : (
          <div className="space-y-8">

            {/* Tab 1: METRICS HIGHLIGHTS */}
            {activeTab === 'metrics' && (
              <div className="space-y-8">

                {/* Triage Cases Table */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-card-soft overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Anonymized Triage Audits</h3>
                      <p className="text-xs text-slate-505"></p>
                    </div>
                    {/* FSA filter */}
                    <div className="relative max-w-xs w-full">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search by FSA (e.g. M5G)..."
                        value={fsaSearch}
                        onChange={(e) => setFsaSearch(e.target.value)}
                        className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white uppercase"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    {filteredTriageCases.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                        No triage case entries found.
                      </div>
                    ) : (
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-slate-455 font-bold uppercase tracking-wider">
                            <th className="p-4 cursor-pointer hover:bg-slate-100 select-none transition" onClick={() => toggleTriageSort('refId')}>
                              Reference ID {getSortIndicator(triageSort, 'refId')}
                            </th>
                            <th className="p-4 cursor-pointer hover:bg-slate-100 select-none transition" onClick={() => toggleTriageSort('timestamp')}>
                              Date {getSortIndicator(triageSort, 'timestamp')}
                            </th>
                            <th className="p-4 cursor-pointer hover:bg-slate-100 select-none transition" onClick={() => toggleTriageSort('age')}>
                              Age {getSortIndicator(triageSort, 'age')}
                            </th>
                            <th className="p-4 cursor-pointer hover:bg-slate-100 select-none transition text-center" onClick={() => toggleTriageSort('location')}>
                              Location {getSortIndicator(triageSort, 'location')}
                            </th>
                            <th className="p-4 cursor-pointer hover:bg-slate-100 select-none transition" onClick={() => toggleTriageSort('category')}>
                              Triage Classification {getSortIndicator(triageSort, 'category')}
                            </th>
                            <th className="p-4 cursor-pointer hover:bg-slate-100 select-none transition" onClick={() => toggleTriageSort('email')}>
                              Email Status {getSortIndicator(triageSort, 'email')}
                            </th>
                            <th className="p-4 cursor-pointer hover:bg-slate-100 select-none transition" onClick={() => toggleTriageSort('audit')}>
                              Clinical Audit {getSortIndicator(triageSort, 'audit')}
                            </th>
                            <th className="p-4 cursor-pointer hover:bg-slate-100 select-none transition" onClick={() => toggleTriageSort('feedback')}>
                              Patient Feedback {getSortIndicator(triageSort, 'feedback')}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150">
                          {sortedTriageCases.map((c) => {
                            const feedback = getProviderFeedbackForCase(c.refId);
                            return (
                              <tr key={c.id} className="hover:bg-slate-50/50">
                                <td className="p-4 font-bold text-slate-900">{c.refId}</td>
                                <td className="p-4 text-slate-550">{new Date(c.timestamp).toLocaleDateString()}</td>
                                <td className="p-4 text-slate-700 font-medium">{c.child?.ageInMonths} months</td>
                                <td className="p-4 text-slate-700 font-bold uppercase text-center">{c.guardian?.postalCode ? c.guardian.postalCode.trim().substring(0, 3).toUpperCase() : 'N/A'}</td>
                                <td className="p-4">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${c.result?.category === 'HIGH_EMERGENCY'
                                    ? 'bg-rose-100 text-rose-800'
                                    : c.result?.category === 'MODERATE_URGENT_CARE'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-teal-100 text-teal-850'
                                    }`}>
                                    {c.result?.badgeText || 'Assessed'}
                                  </span>
                                </td>
                                <td className="p-4">
                                  {c.emailSent ? (
                                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 w-max">
                                      <UserCheck className="w-3 h-3 text-emerald-600" />
                                      Sent
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                                      Unsent
                                    </span>
                                  )}
                                </td>
                                <td className="p-4">
                                  {feedback ? (
                                    <div className="flex items-center gap-0.5 text-amber-500" title={`Clinician rating: ${feedback.rating}/5`}>
                                      {Array.from({ length: 5 }).map((_, i) => (
                                        <Star key={i} className={`w-3.5 h-3.5 ${i < feedback.rating ? 'fill-current' : 'text-slate-200'}`} />
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 italic text-[10px]">No audit submitted</span>
                                  )}
                                </td>
                                <td className="p-4">
                                  {(() => {
                                    const pFeedback = getPatientFeedbackForCase(c.refId);
                                    if (!pFeedback) {
                                      return <span className="text-slate-400 italic text-[10px]">Pending / None</span>;
                                    }
                                    if (pFeedback.skipped) {
                                      return (
                                        <span className="inline-flex flex-col text-[10px]">
                                          <span className="inline-flex items-center gap-1 font-semibold text-rose-750 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 w-max">
                                            Skipped
                                          </span>
                                          <span className="text-[9px] text-slate-500 mt-0.5 block">Email link sent</span>
                                        </span>
                                      );
                                    }
                                    return (
                                      <div className="flex flex-col text-[10px] space-y-0.5 max-w-[150px]">
                                        <span className="inline-flex items-center gap-1 font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 w-max">
                                          Submitted: {pFeedback.helpedDecide === 'yes' ? 'Helped' : pFeedback.helpedDecide === 'no' ? 'No Help' : 'Unsure'}
                                        </span>
                                        {pFeedback.comment && (
                                          <span className="text-[9px] text-slate-600 truncate block mt-0.5 font-medium italic" title={pFeedback.comment}>
                                            "{pFeedback.comment}"
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })()}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: QUALITATIVE FEEDBACK */}
            {activeTab === 'qualitative' && (
              <div className="space-y-6">
                {providerFeedbacks.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 text-xs font-semibold">
                    No clinician audits with comments recorded.
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-card-soft overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-slate-455 font-bold uppercase tracking-wider">
                            <th className="p-4 cursor-pointer hover:bg-slate-100 select-none transition whitespace-nowrap" onClick={() => toggleProviderSort('refId')}>
                              Reference ID {getSortIndicator(providerSort, 'refId')}
                            </th>
                            <th className="p-4 cursor-pointer hover:bg-slate-100 select-none transition whitespace-nowrap" onClick={() => toggleProviderSort('timestamp')}>
                              Date {getSortIndicator(providerSort, 'timestamp')}
                            </th>
                            <th className="p-4 cursor-pointer hover:bg-slate-100 select-none transition whitespace-nowrap" onClick={() => toggleProviderSort('rating')}>
                              Accuracy {getSortIndicator(providerSort, 'rating')}
                            </th>
                            <th className="p-4 cursor-pointer hover:bg-slate-100 select-none transition whitespace-nowrap" onClick={() => toggleProviderSort('accessRating')}>
                              Ease of Access {getSortIndicator(providerSort, 'accessRating')}
                            </th>
                            <th className="p-4 cursor-pointer hover:bg-slate-100 select-none transition whitespace-nowrap" onClick={() => toggleProviderSort('completenessRating')}>
                              Completeness {getSortIndicator(providerSort, 'completenessRating')}
                            </th>
                            <th className="p-4 whitespace-nowrap">
                              Clinical Comments
                            </th>
                            <th className="p-4 text-right whitespace-nowrap">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150">
                          {sortedProviderFeedbacks.map((f) => (
                            <tr key={f.id} className="hover:bg-slate-50/50">
                              <td className="p-4 font-bold text-slate-900 whitespace-nowrap">
                                {f.refId}
                              </td>
                              <td className="p-4 text-slate-550">
                                {new Date(f.timestamp).toLocaleDateString()}
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-0.5 text-amber-500" title={`Accuracy: ${f.rating}/5`}>
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className={`w-3.5 h-3.5 ${i < f.rating ? 'fill-current' : 'text-slate-200'}`} />
                                  ))}
                                </div>
                              </td>
                              <td className="p-4">
                                {f.accessRating !== undefined && f.accessRating !== null ? (
                                  <div className="flex items-center gap-0.5 text-amber-500" title={`Access Rating: ${f.accessRating}/5`}>
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <Star key={i} className={`w-3.5 h-3.5 ${i < f.accessRating ? 'fill-current' : 'text-slate-200'}`} />
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-slate-400 italic text-[10px]">N/A</span>
                                )}
                              </td>
                              <td className="p-4">
                                {f.completenessRating !== undefined && f.completenessRating !== null ? (
                                  <div className="flex items-center gap-0.5 text-amber-500" title={`Completeness Rating: ${f.completenessRating}/5`}>
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <Star key={i} className={`w-3.5 h-3.5 ${i < f.completenessRating ? 'fill-current' : 'text-slate-200'}`} />
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-slate-400 italic text-[10px]">N/A</span>
                                )}
                              </td>
                              <td className="p-4 max-w-[400px]">
                                <p className="text-slate-700 italic leading-relaxed whitespace-normal break-words" title={f.comment}>
                                  {f.comment ? `"${f.comment}"` : 'No clinical comments provided.'}
                                </p>
                              </td>
                              <td className="p-4 text-right">
                                <button
                                  onClick={() => handleShowCaseDetails(f.refId)}
                                  className="inline-flex items-center justify-center text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 p-2 rounded-xl transition shadow-2xs"
                                  title="Inspect Case"
                                >
                                  <FileText className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: OTHER FEEDBACK */}
            {activeTab === 'experience' && (
              <div className="space-y-6">
                {experienceFeedbacks.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 text-xs font-semibold">
                    No parent experience feedback submissions recorded yet.
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-card-soft overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-slate-455 font-bold uppercase tracking-wider">
                            <th className="p-4 cursor-pointer hover:bg-slate-100 select-none transition" onClick={() => toggleExperienceSort('timestamp')}>
                              Date {getSortIndicator(experienceSort, 'timestamp')}
                            </th>
                            <th className="p-4 cursor-pointer hover:bg-slate-100 select-none transition" onClick={() => toggleExperienceSort('visitType')}>
                              Service Used {getSortIndicator(experienceSort, 'visitType')}
                            </th>
                            <th className="p-4 cursor-pointer hover:bg-slate-100 select-none transition" onClick={() => toggleExperienceSort('rating')}>
                              Experience Rating {getSortIndicator(experienceSort, 'rating')}
                            </th>
                            <th className="p-4">
                              Patient Comments & Suggestions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150">
                          {sortedExperienceFeedbacks.map((f) => (
                            <tr key={f.id} className="hover:bg-slate-50/50">
                              <td className="p-4 text-slate-550">
                                {new Date(f.timestamp).toLocaleDateString()}
                              </td>
                              <td className="p-4 font-semibold text-slate-800">
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-900 text-white capitalize">
                                  {f.visitType === 'triage'
                                    ? 'Digital Triage Tool'
                                    : f.visitType === 'er-summary'
                                      ? 'Triage Summary Email'
                                      : f.visitType === 'faq'
                                        ? 'FAQ Portal'
                                        : f.visitType === 'education'
                                          ? 'Educational Materials'
                                          : f.visitType || 'General'}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-0.5 text-amber-500" title={`Rating: ${f.rating}/5`}>
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className={`w-3.5 h-3.5 ${i < f.rating ? 'fill-current' : 'text-slate-200'}`} />
                                  ))}
                                </div>
                              </td>

                              <td className="p-4">
                                <p className="text-slate-700 italic leading-relaxed" style={{ maxWidth: '350px', wordBreak: 'break-word' }}>
                                  {f.comment ? `"${f.comment}"` : 'No text comments provided.'}
                                </p>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Case Details Drawer / Modal overlay */}
        {selectedCase && (() => {
          const feedback = getProviderFeedbackForCase(selectedCase.refId);
          const patientFeedback = getPatientFeedbackForCase(selectedCase.refId);
          return (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative">
                <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    Case Audit: {selectedCase.refId}
                  </h3>
                  <button
                    onClick={() => setSelectedCase(null)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
                  >
                    Close Details
                  </button>
                </div>

                {/* Demographics */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs">
                  <p className="font-bold text-slate-900">Anonymized Profile</p>
                  <div className="grid grid-cols-2 gap-2 text-slate-650">
                    <p>Child Age: <strong>{selectedCase.child?.ageInMonths} months</strong></p>
                    <p>Sex at Birth: <strong>{selectedCase.child?.sex || 'Prefer not to say'}</strong></p>
                    <p>Weight: <strong>{selectedCase.child?.weightKg ? `${selectedCase.child.weightKg} kg` : 'N/A'}</strong></p>
                    <p>Chronic Conditions: <strong>{selectedCase.child?.hasChronicConditions ? 'Yes' : 'None'}</strong></p>
                    <p>Location: <strong>{selectedCase.guardian?.postalCode ? selectedCase.guardian.postalCode.trim().substring(0, 3).toUpperCase() : 'N/A'}</strong></p>
                  </div>
                </div>

                {/* Triage Decision */}
                <div className="space-y-2 text-xs">
                  <p className="font-bold text-slate-900">Triage Care Decision</p>
                  <div className="p-3 bg-indigo-50/70 border border-indigo-150 rounded-xl">
                    <p className="font-bold text-indigo-950">{selectedCase.result?.title}</p>
                    <p className="text-slate-600 mt-1">{selectedCase.result?.summary}</p>
                  </div>
                </div>

                {/* Symptoms */}
                <div className="space-y-2 text-xs">
                  <p className="font-bold text-slate-900">Reported Symptoms & Concerns</p>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-650">
                    <li className="capitalize"><strong>Primary Symptom:</strong> {selectedCase.symptoms?.primarySymptom ? selectedCase.symptoms.primarySymptom.replace(/_/g, ' ') : 'Fever'}</li>
                    {selectedCase.symptoms?.selectedRedFlags?.length > 0 && (
                      <li><strong>Red Flags:</strong> {selectedCase.symptoms.selectedRedFlags.map((x: string) => x.replace(/_/g, ' ')).join(', ')}</li>
                    )}
                    {selectedCase.symptoms?.selectedSecondarySymptoms?.length > 0 && (
                      <li><strong>Secondary Concerns:</strong> {selectedCase.symptoms.selectedSecondarySymptoms.map((x: string) => x.replace(/_/g, ' ')).join(', ')}</li>
                    )}
                    {selectedCase.symptoms?.additionalNotes && (
                      <li className="italic"><strong>Parent note:</strong> "{selectedCase.symptoms.additionalNotes}"</li>
                    )}
                  </ul>
                </div>

                {/* Clinician Audit Feedback */}
                {feedback && (
                  <div className="space-y-3 border-t border-slate-100 pt-4 text-xs">
                    <p className="font-bold text-slate-900">Clinician Audit Details</p>
                    <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-2">
                      <div className="space-y-1 text-slate-700">
                        <div className="flex items-center gap-2">
                          <span className="font-bold w-36">Decision Accuracy:</span>
                          <div className="flex items-center gap-0.5 text-amber-500">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i < feedback.rating ? 'fill-current' : 'text-slate-200'}`} />
                            ))}
                          </div>
                        </div>
                        {feedback.accessRating !== undefined && feedback.accessRating !== null && (
                          <div className="flex items-center gap-2">
                            <span className="font-bold w-36">Ease of Access:</span>
                            <div className="flex items-center gap-0.5 text-amber-500">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`w-3.5 h-3.5 ${i < feedback.accessRating ? 'fill-current' : 'text-slate-200'}`} />
                              ))}
                            </div>
                          </div>
                        )}
                        {feedback.completenessRating !== undefined && feedback.completenessRating !== null && (
                          <div className="flex items-center gap-2">
                            <span className="font-bold w-36">Report Completeness:</span>
                            <div className="flex items-center gap-0.5 text-amber-500">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`w-3.5 h-3.5 ${i < feedback.completenessRating ? 'fill-current' : 'text-slate-200'}`} />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      {feedback.comment && (
                        <p className="text-slate-600 italic border-l-2 border-indigo-200 pl-2 mt-2 leading-relaxed">
                          "{feedback.comment}"
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Patient Exit Feedback */}
                {patientFeedback && (
                  <div className="space-y-3 border-t border-slate-100 pt-4 text-xs">
                    <p className="font-bold text-slate-900">Patient Exit Feedback Details</p>
                    <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-2">
                      <p className="text-slate-700 font-medium">
                        Status: <span className={patientFeedback.skipped ? 'text-rose-700 font-bold' : 'text-teal-700 font-bold'}>
                          {patientFeedback.skipped ? 'Skipped (Follow-up email link requested)' : 'Submitted'}
                        </span>
                      </p>
                      {!patientFeedback.skipped && (
                        <>
                          <p className="text-slate-700 font-medium">
                            Did this help decide care? <strong>{patientFeedback.helpedDecide === 'yes' ? 'Yes, Absolutely' : patientFeedback.helpedDecide === 'no' ? 'No' : 'Still Unsure'}</strong>
                          </p>
                          {patientFeedback.comment && (
                            <p className="text-slate-600 italic border-l-2 border-teal-200 pl-2 mt-2 leading-relaxed font-medium">
                              "{patientFeedback.comment}"
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setSelectedCase(null)}
                    className="bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition"
                  >
                    Close Inspection
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      </div>
    </div>
  );
}
