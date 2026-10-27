import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert, Phone, MapPin, Camera, CheckCircle2, ArrowRight,
  ChevronLeft, AlertTriangle, UserCheck, Heart, Flame, Activity,
  Loader2, Plus, Trash2, Shield, Info, Navigation
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { EmergencyMap } from '../../components/emergency/EmergencyMap';
import { apiClient } from '../../api/client';

export const EmergencySOSPage: React.FC = () => {
  const navigate = useNavigate();

  // Single source of truth for step navigation (1: Identification, 2: Incident, 3: Location, 4: Confirm)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [isDispatched, setIsDispatched] = useState<boolean>(false);
  const [dispatchedCase, setDispatchedCase] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Field validation error tracker
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  // STEP 1: Identification
  const [idMode, setIdMode] = useState<'id' | 'none'>('id');
  const [patientIdInput, setPatientIdInput] = useState<string>('MB-7X4Q2K');
  const [patientMatchedName, setPatientMatchedName] = useState<string | null>('Rohan Mehta');

  // STEP 2: Incident Details
  const [whatHappened, setWhatHappened] = useState<string>('Road accident - head injury');
  const [category, setCategory] = useState<string>('Accident / Trauma');
  const [isConscious, setIsConscious] = useState<boolean>(false);
  const [isBreathing, setIsBreathing] = useState<boolean>(true);
  const [incidentPhotos, setIncidentPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400&auto=format&fit=crop&q=60'
  ]);

  // STEP 3: Location & Caller Contact
  const [locationAddress, setLocationAddress] = useState<string>('Sector 62, Noida, Uttar Pradesh (Near Metro Station)');
  const [distanceKm, setDistanceKm] = useState<number>(2.3);
  const [etaMinutes, setEtaMinutes] = useState<number>(7);
  const [contactPhone, setContactPhone] = useState<string>('+91 98765 11111');

  // Step-specific validation
  const validateStep = (step: number): boolean => {
    const errors: { [key: string]: string } = {};

    if (step === 1) {
      if (idMode === 'id' && !patientIdInput.trim()) {
        errors.patientIdInput = 'Please enter your MUPID, APAR ID, or ABHA ID, or click "Continue Without ID".';
      }
    }

    if (step === 2) {
      if (!whatHappened.trim()) {
        errors.whatHappened = 'Chief complaint is required (please describe what happened).';
      }
      if (!category.trim()) {
        errors.category = 'Please select an emergency category.';
      }
    }

    if (step === 3) {
      if (!locationAddress.trim()) {
        errors.locationAddress = 'Incident location address is required for ambulance dispatch.';
      }
      if (!contactPhone.trim()) {
        errors.contactPhone = 'Caller contact number is required so hospital dispatch can reach you.';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Navigation Handlers
  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      setValidationErrors({});
      setSubmitError(null);
      setCurrentStep((prev) => Math.min(prev + 1, 4) as 1 | 2 | 3 | 4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    setValidationErrors({});
    setSubmitError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1) as 1 | 2 | 3 | 4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectDemoPatient = (name: string, id: string) => {
    setIdMode('id');
    setPatientIdInput(id);
    setPatientMatchedName(name);
    setValidationErrors({});
  };

  const handleContinueWithoutId = (e: React.MouseEvent) => {
    e.preventDefault();
    setIdMode('none');
    setPatientIdInput('');
    setPatientMatchedName('Unregistered Bystander Emergency');
    setValidationErrors({});
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUseCurrentGps = () => {
    setLocationAddress('Sector 62, Noida, Uttar Pradesh (Near Electronic City Metro)');
    setDistanceKm(2.3);
    setEtaMinutes(7);
    setValidationErrors((prev) => {
      const next = { ...prev };
      delete next.locationAddress;
      return next;
    });
  };

  const handleAddSamplePhoto = () => {
    if (incidentPhotos.length < 3) {
      setIncidentPhotos((prev) => [
        ...prev,
        'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=400&auto=format&fit=crop&q=60'
      ]);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setIncidentPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // STEP 4: Final Submission
  const handleSubmitEmergency = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent duplicate clicks

    // Validate all required inputs before submitting
    if (!whatHappened.trim() || !locationAddress.trim() || !contactPhone.trim()) {
      setSubmitError('Required emergency information is incomplete. Please review previous steps.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const isMupid = idMode === 'id' && patientIdInput.trim().startsWith('MB-');
      const isApar = idMode === 'id' && patientIdInput.trim().startsWith('APAR-');
      const isAbha = idMode === 'id' && !isMupid && !isApar && patientIdInput.trim().length > 0;

      const payload = {
        chief_complaint: whatHappened.trim(),
        category: category || 'Accident / Trauma',
        is_conscious: isConscious,
        is_breathing: isBreathing,
        incident_address: locationAddress.trim(),
        distance_km: distanceKm,
        reported_by: contactPhone.trim(),
        mupid: isMupid ? patientIdInput.trim() : undefined,
        apar_id: isApar ? patientIdInput.trim() : undefined,
        abha_id: isAbha ? patientIdInput.trim() : undefined,
        photos: incidentPhotos,
      };

      const response: any = await apiClient('/emergency/sos', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (response && response.case) {
        setDispatchedCase(response.case);
        setIsDispatched(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error(response?.error?.message || 'Unexpected response from emergency dispatch service.');
      }
    } catch (err: any) {
      setSubmitError(
        err?.message || 'Emergency dispatch network failure. Please retry or call National Ambulance directly at 108 / 102.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setIsDispatched(false);
    setDispatchedCase(null);
    setCurrentStep(1);
    setSubmitError(null);
    setValidationErrors({});
  };

  return (
    <div style={{ backgroundColor: '#0B132B', color: '#F8FAFC', minHeight: 'calc(100vh - 68px)', padding: '2.5rem 0' }}>
      <div className="container-custom" style={{ maxWidth: '720px' }}>
        {/* Urgent Hotline Top Banner */}
        <div style={{
          backgroundColor: '#DC2626',
          color: '#FFFFFF',
          borderRadius: '10px',
          padding: '0.85rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.75rem',
          boxShadow: '0 4px 14px rgba(220, 38, 38, 0.4)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.875rem' }}>
            <Phone size={18} />
            <span>Need immediate medical help? National Ambulance: Call 108 / 102</span>
          </div>
          <a href="tel:108" style={{ color: '#FFFFFF', fontWeight: 800, textDecoration: 'underline', fontSize: '0.95rem' }}>
            Call Now
          </a>
        </div>

        {/* ======================================================== */}
        {/* MAIN 4-STEP WIZARD CONTAINER                            */}
        {/* ======================================================== */}
        {!isDispatched ? (
          <div style={{
            backgroundColor: '#111C38',
            border: '1px solid #1E293B',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)'
          }}>
            {/* Header & Back Action */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  color: '#EF4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ShieldAlert size={22} />
                </div>
                <div>
                  <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                    Emergency SOS Dispatch
                  </h1>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                    Zero-barrier medical dispatch • Hospital Trauma Pre-Alert
                  </span>
                </div>
              </div>

              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  style={{
                    backgroundColor: '#1E293B',
                    color: '#CBD5E1',
                    border: 'none',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <ChevronLeft size={14} /> Back
                </button>
              )}
            </div>

            {/* Stepper Progress Bar (Single Source of Truth) */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem',
              borderBottom: '1px solid #1E293B',
              paddingBottom: '1.25rem',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              {[
                { num: 1, label: 'Identification' },
                { num: 2, label: 'Incident' },
                { num: 3, label: 'Location' },
                { num: 4, label: 'Confirm' },
              ].map((s) => {
                const isActive = currentStep === s.num;
                const isCompleted = currentStep > s.num;
                return (
                  <div
                    key={s.num}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: isActive ? '#EF4444' : isCompleted ? '#10B981' : '#64748B',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '0.85rem'
                    }}
                  >
                    <span style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: isActive ? '#EF4444' : isCompleted ? '#10B981' : '#1E293B',
                      color: isActive || isCompleted ? '#FFFFFF' : '#94A3B8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      {isCompleted ? <CheckCircle2 size={14} /> : s.num}
                    </span>
                    <span>{s.label}</span>
                  </div>
                );
              })}
            </div>

            {/* ======================================================== */}
            {/* STEP 1: IDENTIFICATION                                   */}
            {/* ======================================================== */}
            {currentStep === 1 && (
              <div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '0.35rem' }}>
                    Step 1: Patient Identification
                  </h2>
                  <p style={{ fontSize: '0.8125rem', color: '#94A3B8', margin: 0 }}>
                    Providing an ID allows the trauma team to instantly retrieve critical medical records, allergies, and blood group. If unknown, continue without ID.
                  </p>
                </div>

                {/* Option A: Provide ID */}
                <div style={{
                  backgroundColor: idMode === 'id' ? '#0B132B' : '#0F1A36',
                  border: idMode === 'id' ? '1.5px solid #3B82F6' : '1px solid #1E293B',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  marginBottom: '1rem',
                  cursor: 'pointer'
                }}
                onClick={() => setIdMode('id')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                    <input
                      type="radio"
                      name="idChoice"
                      checked={idMode === 'id'}
                      onChange={() => setIdMode('id')}
                    />
                    <strong style={{ fontSize: '0.9rem', color: '#F8FAFC' }}>
                      I have a MediBridge Patient ID, APAR ID, or ABHA ID
                    </strong>
                  </div>

                  <div style={{ marginTop: '0.75rem' }}>
                    <input
                      type="text"
                      className="input-text input-text--dark"
                      placeholder="Enter MUPID (e.g. MB-7X4Q2K) or APAR ID"
                      value={patientIdInput}
                      onChange={(e) => {
                        setPatientIdInput(e.target.value);
                        if (validationErrors.patientIdInput) {
                          setValidationErrors((prev) => {
                            const next = { ...prev };
                            delete next.patientIdInput;
                            return next;
                          });
                        }
                      }}
                    />
                    {validationErrors.patientIdInput && (
                      <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px', marginBottom: 0 }}>
                        {validationErrors.patientIdInput}
                      </p>
                    )}
                  </div>

                  {/* Demo Persona Quick Select Chips */}
                  <div style={{ marginTop: '0.85rem' }}>
                    <span style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                      Quick Fill Known Demo Personas:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleSelectDemoPatient('Rohan Mehta', 'MB-7X4Q2K'); }}
                        style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '4px', backgroundColor: '#1E293B', color: '#93C5FD', border: '1px solid #3B82F6', cursor: 'pointer' }}
                      >
                        Rohan Mehta (MB-7X4Q2K)
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleSelectDemoPatient('Sunita Sharma', 'MB-DEMO-02'); }}
                        style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '4px', backgroundColor: '#1E293B', color: '#93C5FD', border: '1px solid #3B82F6', cursor: 'pointer' }}
                      >
                        Sunita Sharma (MB-DEMO-02)
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleSelectDemoPatient('Vikram Malhotra', 'MB-DEMO-03'); }}
                        style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '4px', backgroundColor: '#1E293B', color: '#93C5FD', border: '1px solid #3B82F6', cursor: 'pointer' }}
                      >
                        Vikram Malhotra (MB-DEMO-03)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Option B: Continue Without ID (Zero-Barrier) */}
                <div style={{
                  backgroundColor: idMode === 'none' ? 'rgba(239, 68, 68, 0.1)' : '#0F1A36',
                  border: idMode === 'none' ? '1.5px solid #EF4444' : '1px solid #1E293B',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  marginBottom: '1.75rem',
                  cursor: 'pointer'
                }}
                onClick={() => { setIdMode('none'); setPatientIdInput(''); }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="radio"
                        name="idChoice"
                        checked={idMode === 'none'}
                        onChange={() => { setIdMode('none'); setPatientIdInput(''); }}
                      />
                      <div>
                        <strong style={{ fontSize: '0.9rem', color: '#EF4444', display: 'block' }}>
                          Continue Without ID (Zero-Barrier Emergency Protocol)
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: '#CBD5E1' }}>
                          No login, MUPID, or payment required. Immediate emergency dispatch.
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="danger"
                      size="sm"
                      type="button"
                      onClick={handleContinueWithoutId}
                    >
                      Skip ID & Proceed →
                    </Button>
                  </div>
                </div>

                {/* Step 1 Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #1E293B', paddingTop: '1.25rem' }}>
                  <Button
                    variant="danger"
                    size="md"
                    type="button"
                    onClick={handleNext}
                    style={{ minWidth: '180px' }}
                  >
                    Continue to Incident Details <ArrowRight size={16} />
                  </Button>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* STEP 2: INCIDENT DETAILS                                 */}
            {/* ======================================================== */}
            {currentStep === 2 && (
              <div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '0.35rem' }}>
                    Step 2: Emergency Incident Details
                  </h2>
                  <p style={{ fontSize: '0.8125rem', color: '#94A3B8', margin: 0 }}>
                    Please describe the critical medical situation for incoming paramedics and the hospital trauma bay.
                  </p>
                </div>

                {/* Chief Complaint */}
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-group__label" style={{ color: '#F8FAFC', display: 'flex', justifyContent: 'space-between' }}>
                    <span>What happened? (Chief complaint) <span style={{ color: '#EF4444' }}>*</span></span>
                  </label>
                  <input
                    type="text"
                    className="input-text input-text--dark"
                    value={whatHappened}
                    onChange={(e) => {
                      setWhatHappened(e.target.value);
                      if (validationErrors.whatHappened) {
                        setValidationErrors((prev) => {
                          const next = { ...prev };
                          delete next.whatHappened;
                          return next;
                        });
                      }
                    }}
                    placeholder="e.g. Road accident, head injury, chest pain, stroke symptoms, loss of consciousness"
                  />
                  {validationErrors.whatHappened && (
                    <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px', marginBottom: 0 }}>
                      {validationErrors.whatHappened}
                    </p>
                  )}
                </div>

                {/* Emergency Category */}
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-group__label" style={{ color: '#F8FAFC' }}>
                    Emergency Category <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {[
                      'Accident / Trauma',
                      'Cardiac / Chest Pain',
                      'Respiratory / Breathing',
                      'Stroke Symptoms',
                      'Burns',
                      'Severe Bleeding',
                      'Other'
                    ].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        style={{
                          padding: '0.45rem 0.85rem',
                          borderRadius: '6px',
                          fontSize: '0.8125rem',
                          fontWeight: 500,
                          backgroundColor: category === cat ? '#EF4444' : '#0B132B',
                          color: '#FFFFFF',
                          border: category === cat ? '1px solid #EF4444' : '1px solid #1E293B',
                          cursor: 'pointer'
                        }}
                        onClick={() => setCategory(cat)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Patient Condition Radios */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ backgroundColor: '#0B132B', padding: '0.85rem', borderRadius: '8px', border: '1px solid #1E293B' }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#F8FAFC', marginBottom: '0.5rem' }}>
                      Patient Consciousness
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8125rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <input type="radio" checked={isConscious} onChange={() => setIsConscious(true)} /> Conscious
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <input type="radio" checked={!isConscious} onChange={() => setIsConscious(false)} /> Unconscious
                      </label>
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#0B132B', padding: '0.85rem', borderRadius: '8px', border: '1px solid #1E293B' }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#F8FAFC', marginBottom: '0.5rem' }}>
                      Breathing Status
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8125rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <input type="radio" checked={isBreathing} onChange={() => setIsBreathing(true)} /> Breathing
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <input type="radio" checked={!isBreathing} onChange={() => setIsBreathing(false)} /> Not Breathing
                      </label>
                    </div>
                  </div>
                </div>

                {/* Optional Incident Photos */}
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label className="form-group__label" style={{ color: '#F8FAFC', margin: 0 }}>
                      Upload Incident Photos (Optional)
                    </label>
                    <button
                      type="button"
                      onClick={handleAddSamplePhoto}
                      style={{ color: '#3B82F6', fontSize: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                    >
                      <Plus size={13} /> Add Photo
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {incidentPhotos.map((url, idx) => (
                      <div key={idx} style={{ position: 'relative', width: '80px', height: '60px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #334155' }}>
                        <img src={url} alt="Incident" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          style={{ position: 'absolute', top: 2, right: 2, backgroundColor: 'rgba(0,0,0,0.7)', color: '#EF4444', border: 'none', borderRadius: '50%', padding: '2px', cursor: 'pointer' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                    {incidentPhotos.length === 0 && (
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>No incident photos attached.</div>
                    )}
                  </div>
                </div>

                {/* Step 2 Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #1E293B', paddingTop: '1.25rem' }}>
                  <Button variant="outline" size="md" type="button" onClick={handleBack} style={{ borderColor: '#334155', color: '#CBD5E1' }}>
                    <ChevronLeft size={16} /> Back
                  </Button>
                  <Button variant="danger" size="md" type="button" onClick={handleNext} style={{ minWidth: '180px' }}>
                    Continue to Location <ArrowRight size={16} />
                  </Button>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* STEP 3: LOCATION & CALLER CONTACT                        */}
            {/* ======================================================== */}
            {currentStep === 3 && (
              <div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '0.35rem' }}>
                    Step 3: Location & Ambulance Routing
                  </h2>
                  <p style={{ fontSize: '0.8125rem', color: '#94A3B8', margin: 0 }}>
                    Specify incident coordinates for immediate ambulance routing and emergency driver contact.
                  </p>
                </div>

                {/* Location Address */}
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label className="form-group__label" style={{ color: '#F8FAFC', margin: 0 }}>
                      Current Incident Location <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleUseCurrentGps}
                      style={{ color: '#3B82F6', fontSize: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <MapPin size={13} /> Use My Current GPS Location
                    </button>
                  </div>
                  <input
                    type="text"
                    className="input-text input-text--dark"
                    value={locationAddress}
                    onChange={(e) => {
                      setLocationAddress(e.target.value);
                      if (validationErrors.locationAddress) {
                        setValidationErrors((prev) => {
                          const next = { ...prev };
                          delete next.locationAddress;
                          return next;
                        });
                      }
                    }}
                    placeholder="Enter landmark, street, city or sector"
                  />
                  {validationErrors.locationAddress && (
                    <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px', marginBottom: 0 }}>
                      {validationErrors.locationAddress}
                    </p>
                  )}
                </div>

                {/* Map Preview */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Route to Nearest Trauma Center: Apollo Hospital Emergency Dept.</span>
                    <span style={{ color: '#EF4444', fontWeight: 600 }}>{distanceKm} km • ~{etaMinutes} mins ETA</span>
                  </div>
                  <div style={{ height: '170px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #1E293B' }}>
                    <EmergencyMap
                      origin={{ lat: 28.628, lng: 77.365, name: locationAddress }}
                      destination={{ lat: 28.544, lng: 77.288, name: 'Apollo Hospital Emergency Dept.' }}
                      distanceKm={distanceKm}
                      etaMinutes={etaMinutes}
                    />
                  </div>
                </div>

                {/* Caller Contact */}
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-group__label" style={{ color: '#F8FAFC' }}>
                    Caller Contact Phone Number <span style={{ color: '#EF4444' }}>*</span> (For ER ambulance driver)
                  </label>
                  <input
                    type="text"
                    className="input-text input-text--dark"
                    value={contactPhone}
                    onChange={(e) => {
                      setContactPhone(e.target.value);
                      if (validationErrors.contactPhone) {
                        setValidationErrors((prev) => {
                          const next = { ...prev };
                          delete next.contactPhone;
                          return next;
                        });
                      }
                    }}
                    placeholder="e.g. +91 98765 11111"
                  />
                  {validationErrors.contactPhone && (
                    <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px', marginBottom: 0 }}>
                      {validationErrors.contactPhone}
                    </p>
                  )}
                </div>

                {/* Step 3 Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #1E293B', paddingTop: '1.25rem' }}>
                  <Button variant="outline" size="md" type="button" onClick={handleBack} style={{ borderColor: '#334155', color: '#CBD5E1' }}>
                    <ChevronLeft size={16} /> Back
                  </Button>
                  <Button variant="danger" size="md" type="button" onClick={handleNext} style={{ minWidth: '180px' }}>
                    Review & Confirm <ArrowRight size={16} />
                  </Button>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* STEP 4: REVIEW & CONFIRM EMERGENCY DISPATCH              */}
            {/* ======================================================== */}
            {currentStep === 4 && (
              <div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '0.35rem' }}>
                    Step 4: Confirm Emergency Alert
                  </h2>
                  <p style={{ fontSize: '0.8125rem', color: '#94A3B8', margin: 0 }}>
                    Please review all incident parameters before triggering the live trauma pre-alert.
                  </p>
                </div>

                {/* Review Card */}
                <div style={{
                  backgroundColor: '#0B132B',
                  border: '1px solid #1E293B',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  marginBottom: '1.25rem'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.8125rem' }}>
                    {/* Patient Identification */}
                    <div>
                      <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>Patient Identification:</span>
                      <strong style={{ color: '#F8FAFC' }}>
                        {idMode === 'id' && patientIdInput
                          ? `${patientMatchedName || 'Registered Patient'} (${patientIdInput})`
                          : 'Unregistered / Emergency Protocol (No ID provided)'}
                      </strong>
                    </div>

                    {/* Priority / Condition */}
                    <div>
                      <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>Clinical Triage Priority:</span>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: !isConscious ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                        color: !isConscious ? '#EF4444' : '#F59E0B'
                      }}>
                        {!isConscious ? 'CRITICAL (Unconscious)' : 'HIGH PRIORITY'}
                      </span>
                    </div>

                    {/* Chief Complaint */}
                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>Chief Complaint:</span>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F8FAFC' }}>
                        {whatHappened}
                      </div>
                      <span style={{ color: '#94A3B8', fontSize: '0.75rem' }}>
                        Category: {category} • Condition: {isConscious ? 'Conscious' : 'Unconscious'}, {isBreathing ? 'Breathing' : 'Not Breathing'}
                      </span>
                    </div>

                    {/* Incident Location */}
                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>Incident Location & Estimated Route:</span>
                      <strong style={{ color: '#F8FAFC' }}>{locationAddress}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#38BDF8', marginTop: '2px' }}>
                        Distance to Apollo Hospital: {distanceKm} km (~{etaMinutes} min ambulance ETA)
                      </div>
                    </div>

                    {/* Contact Number */}
                    <div>
                      <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>Caller Contact:</span>
                      <strong style={{ color: '#F8FAFC' }}>{contactPhone}</strong>
                    </div>

                    {/* Attached Photos */}
                    <div>
                      <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>Photos Attached:</span>
                      <strong style={{ color: '#F8FAFC' }}>{incidentPhotos.length} photo(s)</strong>
                    </div>
                  </div>
                </div>

                {/* Transmission Disclaimer Notice */}
                <div style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  fontSize: '0.75rem',
                  color: '#CBD5E1',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <ShieldAlert size={18} color="#EF4444" style={{ flexShrink: 0 }} />
                  <span>
                    Emergency alert will be dispatched to the application's emergency coordination network and forwarded to Apollo Hospital Emergency Department.
                  </span>
                </div>

                {/* Submission Error Banner */}
                {submitError && (
                  <div style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid #EF4444',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    color: '#FCA5A5',
                    fontSize: '0.8125rem',
                    marginBottom: '1.25rem'
                  }}>
                    <strong>Dispatch Error:</strong> {submitError}
                  </div>
                )}

                {/* Step 4 Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #1E293B', paddingTop: '1.25rem' }}>
                  <Button
                    variant="outline"
                    size="md"
                    type="button"
                    onClick={handleBack}
                    disabled={isSubmitting}
                    style={{ borderColor: '#334155', color: '#CBD5E1' }}
                  >
                    <ChevronLeft size={16} /> Back to Edit Location
                  </Button>

                  <Button
                    variant="danger"
                    size="lg"
                    type="button"
                    onClick={handleSubmitEmergency}
                    disabled={isSubmitting}
                    style={{ minWidth: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Transmitting Alert...</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert size={18} />
                        <span>Send Emergency Alert</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ======================================================== */
          /* SUCCESS: EMERGENCY ALERT DISPATCHED SCREEN                */
          /* ======================================================== */
          <div style={{
            backgroundColor: '#111C38',
            border: '1px solid #1E293B',
            borderRadius: '16px',
            padding: '2.5rem',
            textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              color: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem'
            }}>
              <CheckCircle2 size={36} />
            </div>

            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.5rem' }}>
              Emergency Alert Dispatched!
            </h1>

            <div style={{
              display: 'inline-block',
              backgroundColor: '#0B132B',
              padding: '0.4rem 1rem',
              borderRadius: '6px',
              color: '#EF4444',
              fontWeight: 700,
              fontFamily: 'monospace',
              fontSize: '1.1rem',
              marginBottom: '1.25rem',
              border: '1px solid #1E293B'
            }}>
              Case ID: {dispatchedCase?.case_id || 'EMG-2026-001'}
            </div>

            <p style={{ fontSize: '0.95rem', color: '#CBD5E1', marginBottom: '1.75rem', lineHeight: 1.6, maxWidth: '520px', margin: '0 auto 1.75rem' }}>
              The emergency case has been registered in the system. The Trauma Care Team at <strong>Apollo Hospital, Delhi</strong> has been notified for intake preparation.
            </p>

            {/* Matched Details */}
            <div style={{
              backgroundColor: '#0B132B',
              border: '1px solid #1E293B',
              borderRadius: '10px',
              padding: '1rem',
              maxWidth: '480px',
              margin: '0 auto 1.75rem',
              textAlign: 'left',
              fontSize: '0.8125rem'
            }}>
              <div><strong>Incident:</strong> {dispatchedCase?.chief_complaint || whatHappened}</div>
              <div><strong>Location:</strong> {dispatchedCase?.incident_location?.address || locationAddress}</div>
              <div><strong>Caller:</strong> {dispatchedCase?.reported_by || contactPhone}</div>
              <div><strong>Status:</strong> <span style={{ color: '#10B981', fontWeight: 600 }}>Active (Dispatched)</span></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Button
                variant="danger"
                size="md"
                type="button"
                onClick={() => navigate('/hospital/emergency-panel')}
              >
                Open Live Emergency Command Panel
              </Button>
              <Button
                variant="outline"
                size="md"
                type="button"
                style={{ borderColor: '#334155', color: '#F8FAFC' }}
                onClick={handleResetForm}
              >
                Submit Another Alert
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
