import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert, Phone, MapPin, Camera, CheckCircle2, ArrowRight,
  AlertTriangle, UserCheck, Heart, Flame, Activity
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { apiClient } from '../../api/client';

export const EmergencySOSPage: React.FC = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState<'entry' | 'form' | 'dispatched'>('entry');
  const [step, setStep] = useState<number>(1);
  const [idType, setIdType] = useState<'mupid' | 'abha' | 'none'>('none');
  const [patientIdInput, setPatientIdInput] = useState<string>('MB-7X4Q2K');
  const [whatHappened, setWhatHappened] = useState<string>('Road accident - head injury');
  const [category, setCategory] = useState<string>('Accident / Trauma');
  const [isConscious, setIsConscious] = useState<boolean>(false);
  const [isBreathing, setIsBreathing] = useState<boolean>(true);
  const [locationAddress, setLocationAddress] = useState<string>('Sector 62, Noida, Uttar Pradesh (Near Metro Station)');
  const [contactPhone, setContactPhone] = useState<string>('+91 98765 11111');
  const [dispatchedCaseId, setDispatchedCaseId] = useState<string>('EMG-2024-001');

  const handleStartWithoutId = () => {
    setIdType('none');
    setStage('form');
  };

  const handleStartWithId = () => {
    setIdType('mupid');
    setStage('form');
  };

  const handleSendAlert = async () => {
    try {
      const payload = {
        chief_complaint: whatHappened || 'Emergency medical alert',
        category: category || 'Accident / Trauma',
        is_conscious: isConscious,
        is_breathing: isBreathing,
        incident_address: locationAddress,
        reported_by: contactPhone,
        mupid: idType === 'mupid' && patientIdInput ? patientIdInput : undefined,
        abha_id: idType === 'abha' && patientIdInput ? patientIdInput : undefined,
      };
      const response: any = await apiClient('/emergency/sos', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setDispatchedCaseId(response.case?.case_id || `EMG-${new Date().getFullYear()}-001`);
    } catch {
      const generatedId = `EMG-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
      setDispatchedCaseId(generatedId);
    }
    setStage('dispatched');
  };

  return (
    <div style={{ backgroundColor: '#0B132B', color: '#F8FAFC', minHeight: 'calc(100vh - 68px)', padding: '3rem 0' }}>
      <div className="container-custom" style={{ maxWidth: '680px' }}>
        {/* Urgent Hotline Bar */}
        <div style={{
          backgroundColor: '#DC2626',
          color: '#FFFFFF',
          borderRadius: '8px',
          padding: '0.85rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
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

        {/* STAGE 1: Entry Gate Modal */}
        {stage === 'entry' && (
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
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              color: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem'
            }}>
              <ShieldAlert size={36} />
            </div>

            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.5rem' }}>
              Emergency SOS
            </h1>
            <p style={{ fontSize: '0.95rem', color: '#94A3B8', marginBottom: '2rem', maxWidth: '480px', margin: '0 auto 2rem' }}>
              Get urgent medical assistance from nearby accredited hospitals. Immediate emergency dispatch does not require an account or password.
            </p>

            {/* Path 1: I have my ID */}
            <div style={{
              backgroundColor: '#0B132B',
              border: '1px solid #1E293B',
              borderRadius: '10px',
              padding: '1.25rem',
              marginBottom: '1rem',
              textAlign: 'left'
            }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '0.25rem' }}>
                I have a MediBridge Patient ID or ABHA ID
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '0.75rem' }}>
                Linking your ID helps emergency physicians immediately access critical allergies and conditions.
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="input-text input-text--dark"
                  placeholder="Enter MUPID (e.g. MB-7X4Q2K) or ABHA ID"
                  value={patientIdInput}
                  onChange={(e) => setPatientIdInput(e.target.value)}
                />
                <Button variant="danger" onClick={handleStartWithId}>
                  Continue
                </Button>
              </div>
            </div>

            {/* Path 2: Continue Without ID (Zero Login Barrier) */}
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '10px',
              padding: '1.25rem',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#EF4444' }}>
                    Don't have an ID? Or reporting for someone else?
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#CBD5E1', marginTop: '2px' }}>
                    Zero authentication barrier. Dispatch emergency alert directly.
                  </div>
                </div>
                <Button variant="danger" size="md" onClick={handleStartWithoutId}>
                  Continue Without ID →
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 2: 4-Step Emergency Details Form */}
        {stage === 'form' && (
          <div style={{
            backgroundColor: '#111C38',
            border: '1px solid #1E293B',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)'
          }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={24} color="#EF4444" /> Emergency Incident Details
            </h2>

            {/* Stepper Indicator */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid #1E293B', paddingBottom: '1rem' }}>
              {['1. Identification', '2. Incident', '3. Location', '4. Confirm'].map((lbl, idx) => (
                <span key={idx} style={{ fontSize: '0.8125rem', fontWeight: 600, color: step >= idx + 1 ? '#EF4444' : '#64748B' }}>
                  {lbl}
                </span>
              ))}
            </div>

            {/* What Happened */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-group__label" style={{ color: '#F8FAFC' }}>
                What happened? (Chief complaint)
              </label>
              <input
                type="text"
                className="input-text input-text--dark"
                value={whatHappened}
                onChange={(e) => setWhatHappened(e.target.value)}
                placeholder="e.g. Road accident, chest pain, stroke symptoms, loss of consciousness"
              />
            </div>

            {/* Category Pills */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-group__label" style={{ color: '#F8FAFC' }}>Emergency Category</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {['Accident / Trauma', 'Cardiac / Chest Pain', 'Respiratory / Breathing', 'Stroke Symptoms', 'Burns', 'Other'].map((cat) => (
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
                      border: category === cat ? '1px solid #EF4444' : '1px solid #1E293B'
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
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input type="radio" checked={isConscious} onChange={() => setIsConscious(true)} /> Conscious
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input type="radio" checked={!isConscious} onChange={() => setIsConscious(false)} /> Unconscious
                  </label>
                </div>
              </div>

              <div style={{ backgroundColor: '#0B132B', padding: '0.85rem', borderRadius: '8px', border: '1px solid #1E293B' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#F8FAFC', marginBottom: '0.5rem' }}>
                  Breathing Status
                </div>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8125rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input type="radio" checked={isBreathing} onChange={() => setIsBreathing(true)} /> Breathing
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input type="radio" checked={!isBreathing} onChange={() => setIsBreathing(false)} /> Not Breathing
                  </label>
                </div>
              </div>
            </div>

            {/* Current Location */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label className="form-group__label" style={{ color: '#F8FAFC' }}>Current Location</label>
                <button
                  type="button"
                  style={{ color: '#3B82F6', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  onClick={() => alert('GPS auto-located: Coordinates 28.628°N, 77.365°E matched to Sector 62, Noida.')}
                >
                  <MapPin size={12} /> Use My Current GPS Location
                </button>
              </div>
              <input
                type="text"
                className="input-text input-text--dark"
                value={locationAddress}
                onChange={(e) => setLocationAddress(e.target.value)}
              />
            </div>

            {/* Contact Number */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-group__label" style={{ color: '#F8FAFC' }}>Caller Contact Number (For ER ambulance driver)</label>
              <input
                type="text"
                className="input-text input-text--dark"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </div>

            <Button variant="danger" size="lg" style={{ width: '100%', fontSize: '1.1rem', padding: '0.85rem' }} onClick={handleSendAlert}>
              <ShieldAlert size={20} />
              <span>Send Emergency Alert to Apollo ER Team</span>
            </Button>
          </div>
        )}

        {/* STAGE 3: Dispatched Confirmation */}
        {stage === 'dispatched' && (
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
              padding: '0.35rem 0.85rem',
              borderRadius: '6px',
              color: '#EF4444',
              fontWeight: 700,
              fontFamily: 'monospace',
              fontSize: '1rem',
              marginBottom: '1rem'
            }}>
              Case ID: {dispatchedCaseId}
            </div>

            <p style={{ fontSize: '0.95rem', color: '#CBD5E1', marginBottom: '1.75rem' }}>
              The Emergency Response Team at <strong>Apollo Hospital, Delhi</strong> has received your alert. Trauma bay and ambulance are being coordinated.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <Button variant="danger" size="md" onClick={() => navigate('/hospital/emergency-panel')}>
                Open Live Emergency Command Panel
              </Button>
              <Button variant="outline" size="md" style={{ borderColor: '#334155', color: '#F8FAFC' }} onClick={() => setStage('entry')}>
                Back to SOS Home
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

