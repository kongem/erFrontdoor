'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTriage, calculateAgeInMonths } from '@/lib/triageContext';
import { X, ShieldCheck, User, Baby, CreditCard, MapPin, Phone, Mail, ArrowRight } from 'lucide-react';

interface DemographicsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DemographicsModal({ isOpen, onClose }: DemographicsModalProps) {
  const router = useRouter();
  const { state, updateChild, updateGuardian, setStep } = useTriage();

  const [formData, setFormData] = useState({
    firstName: state?.child?.firstName || '',
    middleName: state?.child?.middleName || '',
    lastName: state?.child?.lastName || '',
    dateOfBirth: state?.child?.dateOfBirth || '',
    sexAtBirth: state?.child?.sexAtBirth || 'Female',
    ohipNumber: state?.child?.ohipNumber || '',
    postalCode: state?.child?.postalCode || state?.guardian?.postalCode || '',
    phone: state?.child?.phone || state?.guardian?.phone || '',
    email: state?.child?.email || state?.guardian?.email || '',
    address: state?.child?.address || '',
    city: state?.child?.city || 'Toronto',
    province: state?.child?.province || 'ON',
    guardianName: state?.guardian?.name || '',
    guardianRelationship: state?.guardian?.relationship || 'Parent',
    guardianPhone: state?.guardian?.phone || '',
    guardianEmail: state?.guardian?.email || '',
  });

  React.useEffect(() => {
    if (isOpen && state) {
      setFormData((prev) => ({
        ...prev,
        firstName: state.child?.firstName || prev.firstName,
        middleName: state.child?.middleName || prev.middleName,
        lastName: state.child?.lastName || prev.lastName,
        dateOfBirth: state.child?.dateOfBirth || prev.dateOfBirth,
        sexAtBirth: state.child?.sexAtBirth || prev.sexAtBirth,
        ohipNumber: state.child?.ohipNumber || prev.ohipNumber,
        postalCode: state.child?.postalCode || state.guardian?.postalCode || prev.postalCode,
        phone: state.child?.phone || state.guardian?.phone || prev.phone,
        email: state.child?.email || state.guardian?.email || prev.email,
        address: state.child?.address || prev.address,
        guardianName: state.guardian?.name || prev.guardianName,
        guardianRelationship: state.guardian?.relationship || prev.guardianRelationship,
        guardianPhone: state.guardian?.phone || prev.guardianPhone,
        guardianEmail: state.guardian?.email || prev.guardianEmail,
      }));
    }
  }, [isOpen, state]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'Patient first name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Patient last name is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    
    // Postal code validation
    const postalRegex = /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i;
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    } else if (!postalRegex.test(formData.postalCode.trim())) {
      newErrors.postalCode = 'Invalid format. Use A1A 1A1 (e.g. L5N 6P2)';
    }

    // Phone validation
    const phoneRegex = /^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;
    if (formData.phone.trim() && !phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = 'Invalid format. Use (123) 456-7890';
    }
    if (formData.guardianPhone.trim() && !phoneRegex.test(formData.guardianPhone.trim())) {
      newErrors.guardianPhone = 'Invalid format. Use (123) 456-7890';
    }

    if (!formData.guardianName.trim()) newErrors.guardianName = 'Guardian name is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Format postal code cleanly: "A1A 1A1"
    const cleanPostal = formData.postalCode.toUpperCase().replace(/\s+/g, '');
    const formattedPostal = `${cleanPostal.substring(0, 3)} ${cleanPostal.substring(3)}`;

    // Calculate age from Date of Birth
    const calculatedAgeInMonths = calculateAgeInMonths(formData.dateOfBirth);
    const fullName = [formData.firstName, formData.middleName, formData.lastName]
      .filter(Boolean)
      .join(' ');

    // Update Context
    updateChild({
      firstName: formData.firstName,
      middleName: formData.middleName,
      lastName: formData.lastName,
      name: fullName || formData.firstName,
      dateOfBirth: formData.dateOfBirth,
      ageInMonths: calculatedAgeInMonths,
      sexAtBirth: formData.sexAtBirth as any,
      sex: formData.sexAtBirth as any,
      ohipNumber: formData.ohipNumber,
      postalCode: formattedPostal,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      city: formData.city,
      province: formData.province,
    });

    updateGuardian({
      name: formData.guardianName,
      relationship: formData.guardianRelationship as any,
      phone: formData.guardianPhone || formData.phone,
      email: formData.guardianEmail || formData.email,
      postalCode: formattedPostal,
    });

    setStep(3); // Advance directly to Symptom Checklist Step
    onClose();
    router.push('/triage');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 text-white p-6 sm:p-8 relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 text-teal-200 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 text-teal-300" />
            Patient Registration & Care Intake
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Digital Triage Demographics
          </h2>
          <p className="text-teal-100 text-xs sm:text-sm mt-1">
            Please enter the patient's information and guardian contact details below to begin symptom evaluation.
          </p>
        </div>

        {/* Modal Body - Scrollable Form */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-grow">
          <form id="demographics-form" onSubmit={handleSubmit} className="space-y-8">
            
            {/* SECTION 1: PATIENT DEMOGRAPHICS */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-slate-900 font-bold text-base">
                <Baby className="w-5 h-5 text-teal-600" />
                <h3>Patient Demographics</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="e.g. Liam"
                    className={`w-full px-3.5 py-2.5 bg-slate-50 border ${errors.firstName ? 'border-rose-500' : 'border-slate-200'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  />
                  {errors.firstName && <span className="text-[11px] text-rose-500 mt-0.5 block">{errors.firstName}</span>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleChange}
                    placeholder="e.g. James"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="e.g. Smith"
                    className={`w-full px-3.5 py-2.5 bg-slate-50 border ${errors.lastName ? 'border-rose-500' : 'border-slate-200'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  />
                  {errors.lastName && <span className="text-[11px] text-rose-500 mt-0.5 block">{errors.lastName}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date of Birth (DOB) *
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className={`w-full px-3.5 py-2.5 bg-slate-50 border ${errors.dateOfBirth ? 'border-rose-500' : 'border-slate-200'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  />
                  {errors.dateOfBirth && <span className="text-[11px] text-rose-500 mt-0.5 block">{errors.dateOfBirth}</span>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sex at Birth *
                  </label>
                  <select
                    name="sexAtBirth"
                    value={formData.sexAtBirth}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    OHIP Card Number
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="ohipNumber"
                      value={formData.ohipNumber}
                      onChange={handleChange}
                      placeholder="1234-567-890-XX"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">10-digit Ontario Health Number (optional)</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Postal Code *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      placeholder="e.g. M5G 1X8"
                      className={`w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border ${errors.postalCode ? 'border-rose-500' : 'border-slate-200'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 uppercase`}
                    />
                  </div>
                  {errors.postalCode && <span className="text-[11px] text-rose-500 mt-0.5 block">{errors.postalCode}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(416) 555-0199"
                      className={`w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border ${errors.phone ? 'border-rose-500' : 'border-slate-200'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    />
                  </div>
                  {errors.phone && <span className="text-[11px] text-rose-500 mt-0.5 block">{errors.phone}</span>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="parent@example.com"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Home Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street Address (e.g., 123 Main St W)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* SECTION 2: GUARDIAN INFORMATION */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-slate-900 font-bold text-base">
                <User className="w-5 h-5 text-teal-600" />
                <h3>Guardian Information</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Guardian Full Name *
                  </label>
                  <input
                    type="text"
                    name="guardianName"
                    value={formData.guardianName}
                    onChange={handleChange}
                    placeholder="e.g. Maria Smith"
                    className={`w-full px-3.5 py-2.5 bg-slate-50 border ${errors.guardianName ? 'border-rose-500' : 'border-slate-200'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  />
                  {errors.guardianName && <span className="text-[11px] text-rose-500 mt-0.5 block">{errors.guardianName}</span>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Relationship to Patient *
                  </label>
                  <select
                    name="guardianRelationship"
                    value={formData.guardianRelationship}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Parent">Parent</option>
                    <option value="Grandparent">Grandparent</option>
                    <option value="Legal Guardian">Legal Guardian</option>
                    <option value="Caregiver">Babysitter / Caregiver</option>
                    <option value="Other">Other Relative</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Guardian Phone
                  </label>
                  <input
                    type="tel"
                    name="guardianPhone"
                    value={formData.guardianPhone}
                    onChange={handleChange}
                    placeholder="Same as patient / (416) 555-0199"
                    className={`w-full px-3.5 py-2.5 bg-slate-50 border ${errors.guardianPhone ? 'border-rose-500' : 'border-slate-200'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  />
                  {errors.guardianPhone && <span className="text-[11px] text-rose-500 mt-0.5 block">{errors.guardianPhone}</span>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Guardian Email
                  </label>
                  <input
                    type="email"
                    name="guardianEmail"
                    value={formData.guardianEmail}
                    onChange={handleChange}
                    placeholder="guardian@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="demographics-form"
            className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-xl text-sm font-bold shadow-md shadow-teal-600/20 transition flex items-center gap-2"
          >
            <span>Proceed to Symptom Triage</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
