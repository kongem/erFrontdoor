'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  evaluatePediatricTriage,
  TriageInput,
  TriageEvaluationResult,
  PrimarySymptom,
} from './aboutKidsHealthLogic';
import {
  findNearestFacilities,
  FacilityWithDistance,
} from './facilityData';

export interface GuardianInfo {
  name: string;
  email: string;
  phone: string;
  postalCode: string;
  relationship: 'Parent' | 'Grandparent' | 'Legal Guardian' | 'Caregiver' | 'Other';
}

export interface ChildInfo {
  firstName: string;
  middleName: string;
  lastName: string;
  name: string;
  dateOfBirth: string;
  sexAtBirth: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  ohipNumber: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  email: string;
  ageInMonths: number;
  sex: 'Female' | 'Male' | 'Other' | 'Prefer not to say';
  weightKg?: number;
  hasChronicConditions: boolean;
  chronicConditionNotes?: string;
}

export function calculateAgeInMonths(dobString: string): number {
  if (!dobString) return 24;
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return 24;
  const now = new Date();
  let months = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
  if (now.getDate() < dob.getDate()) {
    months--;
  }
  return Math.max(0, months);
}

export interface SymptomInfo {
  primarySymptom: PrimarySymptom;
  hasFever: boolean;
  feverTempCelsius: number;
  feverDurationHours: number;
  selectedRedFlags: string[];
  selectedSecondarySymptoms: string[];
  additionalNotes: string;
}

export interface TriageState {
  refId: string;
  step: number; // 1: Guardian, 2: Child, 3: Symptoms, 4: Result
  guardian: GuardianInfo;
  child: ChildInfo;
  symptoms: SymptomInfo;
  result: TriageEvaluationResult | null;
  nearestFacilities: FacilityWithDistance[];
  isHydrated: boolean;
}

const DEFAULT_GUARDIAN: GuardianInfo = {
  name: '',
  email: '',
  phone: '',
  postalCode: '',
  relationship: 'Parent',
};

const DEFAULT_CHILD: ChildInfo = {
  firstName: '',
  middleName: '',
  lastName: '',
  name: '',
  dateOfBirth: '2024-08-01',
  sexAtBirth: 'Prefer not to say',
  ohipNumber: '',
  address: '',
  city: 'Toronto',
  province: 'ON',
  postalCode: '',
  phone: '',
  email: '',
  ageInMonths: 24, // 2 years default
  sex: 'Prefer not to say',
  hasChronicConditions: false,
};

const DEFAULT_SYMPTOMS: SymptomInfo = {
  primarySymptom: 'select',
  hasFever: false,
  feverTempCelsius: 38.5,
  feverDurationHours: 12,
  selectedRedFlags: [],
  selectedSecondarySymptoms: [],
  additionalNotes: '',
};

const DEFAULT_RESULT = evaluatePediatricTriage({
  primarySymptom: 'fever',
  ageInMonths: 24,
  feverTempCelsius: 39.2,
  feverDurationHours: 24,
  selectedRedFlags: ['respiratory_distress'],
  selectedSecondarySymptoms: ['cough'],
});

interface TriageContextType {
  state: TriageState;
  setStep: (step: number) => void;
  updateGuardian: (info: Partial<GuardianInfo>) => void;
  updateChild: (info: Partial<ChildInfo>) => void;
  updateSymptoms: (info: Partial<SymptomInfo>) => void;
  evaluateAndSave: () => TriageEvaluationResult;
  resetTriage: () => void;
}

const TriageContext = createContext<TriageContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'pediatric_er_triage_v4';

export function TriageProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TriageState>({
    refId: '',
    step: 1,
    guardian: DEFAULT_GUARDIAN,
    child: DEFAULT_CHILD,
    symptoms: DEFAULT_SYMPTOMS,
    result: DEFAULT_RESULT,
    nearestFacilities: findNearestFacilities(DEFAULT_GUARDIAN.postalCode, DEFAULT_RESULT.category),
    isHydrated: false, // Hydrated dynamically on mount
  });

  // Load state from localStorage on mount (Hydration safety)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const refId = parsed.refId || `PEDS-TRG-${Math.floor(100000 + Math.random() * 900000)}`;
        const guardian = { ...DEFAULT_GUARDIAN, ...(parsed.guardian || {}) };
        const child = { ...DEFAULT_CHILD, ...(parsed.child || {}) };
        const symptoms = { ...DEFAULT_SYMPTOMS, ...(parsed.symptoms || {}) };

        // Recalculate nearest facilities using the loaded postal code
        const nearestFacilities = findNearestFacilities(guardian.postalCode || child.postalCode);

        setState((prev) => ({
          ...prev,
          ...parsed,
          refId,
          guardian,
          child,
          symptoms,
          nearestFacilities,
          isHydrated: true,
        }));
      } else {
        const refId = `PEDS-TRG-${Math.floor(100000 + Math.random() * 900000)}`;
        setState((prev) => ({ ...prev, refId, isHydrated: true }));
      }
    } catch (e) {
      console.warn('Failed to load triage state from localStorage:', e);
      const refId = `PEDS-TRG-${Math.floor(100000 + Math.random() * 900000)}`;
      setState((prev) => ({ ...prev, refId, isHydrated: true }));
    }
  }, []);

  // Save state to localStorage whenever state changes
  useEffect(() => {
    if (!state.isHydrated) return;
    try {
      const stateToSave = {
        refId: state.refId,
        step: state.step,
        guardian: state.guardian,
        child: state.child,
        symptoms: state.symptoms,
        result: state.result,
        nearestFacilities: state.nearestFacilities,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.warn('Failed to persist triage state to localStorage:', e);
    }
  }, [state.refId, state.step, state.guardian, state.child, state.symptoms, state.result, state.nearestFacilities, state.isHydrated]);

  const setStep = (step: number) => {
    setState((prev) => ({ ...prev, step }));
  };

  const updateGuardian = (info: Partial<GuardianInfo>) => {
    setState((prev) => {
      const newGuardian = { ...prev.guardian, ...info };
      const newFacilities = findNearestFacilities(newGuardian.postalCode);
      return {
        ...prev,
        guardian: newGuardian,
        nearestFacilities: newFacilities,
      };
    });
  };

  const updateChild = (info: Partial<ChildInfo>) => {
    setState((prev) => ({
      ...prev,
      child: { ...prev.child, ...info },
    }));
  };

  const updateSymptoms = (info: Partial<SymptomInfo>) => {
    setState((prev) => ({
      ...prev,
      symptoms: { ...prev.symptoms, ...info },
    }));
  };

  const evaluateAndSave = (): TriageEvaluationResult => {
    const input: TriageInput = {
      primarySymptom: state.symptoms.primarySymptom,
      ageInMonths: state.child.ageInMonths,
      feverTempCelsius: state.symptoms.primarySymptom === 'fever' ? state.symptoms.feverTempCelsius : 37.0,
      feverDurationHours: state.symptoms.primarySymptom === 'fever' ? state.symptoms.feverDurationHours : 0,
      selectedRedFlags: state.symptoms.selectedRedFlags,
      selectedSecondarySymptoms: state.symptoms.selectedSecondarySymptoms,
      hasChronicCondition: state.child.hasChronicConditions,
    };

    const evaluationResult = evaluatePediatricTriage(input);
    const facilities = findNearestFacilities(state.guardian.postalCode, evaluationResult.category);

    setState((prev) => ({
      ...prev,
      result: evaluationResult,
      nearestFacilities: facilities,
      step: 4, // Navigate to Result step
    }));

    // Auto-log case to data/feedback.json store
    fetch('/api/triage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        refId: state.refId,
        child: state.child,
        guardian: state.guardian,
        symptoms: state.symptoms,
        result: evaluationResult,
      }),
    }).catch((err) => {
      console.warn('Failed to log triage case to storage:', err);
    });

    return evaluationResult;
  };

  const resetTriage = () => {
    setState({
      refId: `PEDS-TRG-${Math.floor(100000 + Math.random() * 900000)}`,
      step: 1,
      guardian: DEFAULT_GUARDIAN,
      child: DEFAULT_CHILD,
      symptoms: DEFAULT_SYMPTOMS,
      result: null,
      nearestFacilities: findNearestFacilities(DEFAULT_GUARDIAN.postalCode),
      isHydrated: true,
    });
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear localStorage:', e);
    }
  };

  return (
    <TriageContext.Provider
      value={{
        state,
        setStep,
        updateGuardian,
        updateChild,
        updateSymptoms,
        evaluateAndSave,
        resetTriage,
      }}
    >
      {children}
    </TriageContext.Provider>
  );
}

export function useTriage() {
  const context = useContext(TriageContext);
  if (!context) {
    throw new Error('useTriage must be used within a TriageProvider');
  }
  return context;
}
