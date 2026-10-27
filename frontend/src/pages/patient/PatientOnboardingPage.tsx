import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle2, ArrowRight, Building, FileCheck, HelpCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const PatientOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(2); // Default to Identity step
  const [citizenship, setCitizenship] = useState<'india' | 'international'>('india');
  const [selectedOption, setSelectedOption] = useState<'abha' | 'mupid' | 'manual'>('abha');
  const [abhaId, setAbhaId] = useState<string>('91-8472-9102-4521');
  const [mupid, setMupid] = useState<string>('MB-7X4Q2K');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationSuccess, setVerificationSuccess] = useState<boolean>(false);

  const handleVerifyAbha = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationSuccess(true);
      alert('Mock ABDM/ABHA Gateway Response: ABHA verified successfully with authorized OTP simulation.');
    }, 1500);
  };

  const handleComplete = () => {
    navigate('/patient/dashboard');
  };

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: 'calc(100vh - 68px)', padding: '3rem 0' }}>
      <div className="container-custom" style={{ maxWidth: '640px' }}>
        {/* Progress Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
          {[
            { num: 1, label: 'Country' },
            { num: 2, label: 'Identity' },
            { num: 3, label: 'Verification' },
            { num: 4, label: 'Complete' }
          ].map((s) => (
            <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: step >= s.num ? '#0F766E' : '#E2E8F0',
                color: step >= s.num ? '#FFFFFF' : '#64748B',
                fontSize: '0.8125rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {s.num}
              </div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: step >= s.num ? '#0F172A' : '#94A3B8' }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Main Card */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>
            Select Your Citizenship & Identity
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '1.5rem' }}>
            Choose your country to proceed with authorized medical record verification.
          </p>

          {/* Country Selector */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-group__label">Country of Residence / Domicile</label>
            <select
              className="input-select"
              value={citizenship}
              onChange={(e) => setCitizenship(e.target.value as any)}
            >
              <option value="india">🇮🇳 India</option>
              <option value="international">🌐 International / Other Country</option>
            </select>
          </div>

          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.75rem' }}>
            Select an option to continue
          </div>

          {/* Option 1: ABHA ID */}
          {citizenship === 'india' && (
            <div
              style={{
                border: selectedOption === 'abha' ? '2px solid #0F766E' : '1px solid #E2E8F0',
                backgroundColor: selectedOption === 'abha' ? '#F0FDFA' : '#FFFFFF',
                borderRadius: '8px',
                padding: '1.25rem',
                marginBottom: '1rem',
                cursor: 'pointer'
              }}
              onClick={() => setSelectedOption('abha')}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>
                    Enter your ABHA ID (Ayushman Bharat Health Account)
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                    Use your 14-digit ABHA ID through the official ABDM verification process.
                  </div>
                </div>
                <input type="radio" checked={selectedOption === 'abha'} onChange={() => setSelectedOption('abha')} />
              </div>

              {selectedOption === 'abha' && (
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    className="input-text"
                    placeholder="Enter 14-digit ABHA ID (e.g. 91-8472-9102-4521)"
                    value={abhaId}
                    onChange={(e) => setAbhaId(e.target.value)}
                  />
                  <Button variant="primary" onClick={handleVerifyAbha} disabled={isVerifying}>
                    {isVerifying ? 'Verifying...' : verificationSuccess ? 'Verified ✓' : 'Verify'}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Option 2: MUPID */}
          <div
            style={{
              border: selectedOption === 'mupid' ? '2px solid #0F766E' : '1px solid #E2E8F0',
              backgroundColor: selectedOption === 'mupid' ? '#F0FDFA' : '#FFFFFF',
              borderRadius: '8px',
              padding: '1.25rem',
              marginBottom: '1rem',
              cursor: 'pointer'
            }}
            onClick={() => setSelectedOption('mupid')}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>
                  Enter your MediBridge Unique Patient ID (MUPID)
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                  Already registered with MediBridge AI? Enter your MUPID to link your record.
                </div>
              </div>
              <input type="radio" checked={selectedOption === 'mupid'} onChange={() => setSelectedOption('mupid')} />
            </div>

            {selectedOption === 'mupid' && (
              <div style={{ marginTop: '1rem' }}>
                <input
                  type="text"
                  className="input-text"
                  placeholder="e.g. MB-7X4Q2K"
                  value={mupid}
                  onChange={(e) => setMupid(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Option 3: Manual Verification */}
          <div
            style={{
              border: selectedOption === 'manual' ? '2px solid #0F766E' : '1px solid #E2E8F0',
              backgroundColor: selectedOption === 'manual' ? '#F0FDFA' : '#FFFFFF',
              borderRadius: '8px',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              cursor: 'pointer'
            }}
            onClick={() => setSelectedOption('manual')}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>
                  Use other ID / Manual Verification
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                  Use Aadhaar, Passport, or other government-approved identity documents.
                </div>
              </div>
              <input type="radio" checked={selectedOption === 'manual'} onChange={() => setSelectedOption('manual')} />
            </div>
          </div>

          {/* Safety & Compliance Disclaimer */}
          <div style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '0.85rem 1rem',
            fontSize: '0.75rem',
            color: '#64748B',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            <Shield size={16} color="#0F766E" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              <strong>Privacy Protection:</strong> Entering an ABHA ID alone does not retrieve records without your explicit OTP consent. Protected medical documents remain locked until authorized identity confirmation.
            </span>
          </div>

          <Button variant="primary" size="lg" style={{ width: '100%' }} onClick={handleComplete}>
            <span>Continue to Dashboard</span>
            <ArrowRight size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

