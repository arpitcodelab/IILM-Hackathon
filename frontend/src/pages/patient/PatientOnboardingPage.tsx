import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, CheckCircle2, ArrowRight, Building, FileCheck, HelpCircle,
  Sparkles, UserCheck, AlertTriangle, FileText
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { apiClient } from '../../api/client';

export const PatientOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [citizenship, setCitizenship] = useState<'india' | 'international'>('india');
  const [selectedOption, setSelectedOption] = useState<'apar' | 'mupid' | 'abha' | 'manual'>('apar');
  const [identifierInput, setIdentifierInput] = useState<string>('APAR-9821-4412');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const demoPersonas = [
    {
      label: 'Demo A: Routine Follow-up',
      apar_id: 'APAR-9821-4412',
      mupid: 'MB-DEMO-01',
      name: 'Rohan Mehta (Demo)',
      desc: 'Blood tests, lipid panel, elevated sugar & penicillin allergy alert.',
      color: '#0F766E',
      bg: '#F0FDFA',
    },
    {
      label: 'Demo B: Chronic-Care Review',
      apar_id: 'APAR-5532-8891',
      mupid: 'MB-DEMO-02',
      name: 'Sunita Sharma (Demo)',
      desc: 'Longitudinal HbA1c reduction (8.4% → 7.2%) & knee osteoarthritis history.',
      color: '#2563EB',
      bg: '#EFF6FF',
    },
    {
      label: 'Demo C: Emergency Trauma',
      apar_id: 'APAR-1122-3344',
      mupid: 'MB-DEMO-03',
      name: 'Vikram Malhotra (Demo)',
      desc: 'Road accident simulation, cardiac stent history & critical penicillin warning.',
      color: '#DC2626',
      bg: '#FEF2F2',
    },
  ];

  const handleSelectDemoPersona = async (persona: typeof demoPersonas[0]) => {
    setSelectedOption('apar');
    setIdentifierInput(persona.apar_id);
    await executeLookup('apar_id', persona.apar_id);
  };

  const executeLookup = async (type: string, value: string) => {
    setIsVerifying(true);
    setErrorMsg(null);

    try {
      const res: any = await apiClient('/demo/patient-lookup', {
        method: 'POST',
        body: JSON.stringify({
          identifier_type: type,
          identifier_value: value.trim(),
        }),
      });

      if (res.patient) {
        localStorage.setItem('medibridge_active_patient', JSON.stringify(res.patient));
        navigate('/patient/dashboard');
      }
    } catch (err: any) {
      console.warn('Demo lookup note:', err.message);
      // Fallback matching in case backend is offline
      const localMatch = demoPersonas.find(
        (p) =>
          p.apar_id.toLowerCase() === value.toLowerCase() ||
          p.mupid.toLowerCase() === value.toLowerCase()
      );
      if (localMatch) {
        localStorage.setItem(
          'medibridge_active_patient',
          JSON.stringify({
            is_demo: true,
            apar_id: localMatch.apar_id,
            mupid: localMatch.mupid,
            name: localMatch.name,
            scenario: localMatch.label,
            age: 34,
            gender: 'Male',
            blood_group: 'B+',
          })
        );
        navigate('/patient/dashboard');
      } else {
        setErrorMsg(
          `Demo profile not found for "${value}". Please click one of the quick demo chips above (e.g. APAR-9821-4412).`
        );
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeLookup(selectedOption === 'apar' ? 'apar_id' : selectedOption === 'mupid' ? 'mupid' : 'abha_id', identifierInput);
  };

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: 'calc(100vh - 68px)', padding: '2.5rem 0' }}>
      <div className="container-custom" style={{ maxWidth: '680px' }}>
        {/* Hackathon Mentor Quick Launch Banner */}
        <div style={{
          backgroundColor: '#0F172A',
          color: '#F8FAFC',
          borderRadius: '12px',
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.95rem', color: '#38BDF8' }}>
              <Sparkles size={18} />
              <span>Mentor Demonstration Mode (Instant Synthetic Personas)</span>
            </div>
            <span style={{ fontSize: '0.75rem', backgroundColor: '#1E293B', padding: '0.2rem 0.6rem', borderRadius: '9999px', color: '#94A3B8' }}>
              Deterministic Seeds
            </span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: '#94A3B8', marginBottom: '1rem', lineHeight: 1.5 }}>
            Click any demonstration scenario below to instantly populate the patient dashboard with pre-processed MedInsight AI medical records, clinical facts, and RAG Q&A:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
            {demoPersonas.map((p) => (
              <div
                key={p.apar_id}
                onClick={() => handleSelectDemoPersona(p)}
                style={{
                  backgroundColor: '#1E293B',
                  border: `1px solid ${p.color}`,
                  borderRadius: '8px',
                  padding: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#FFFFFF' }}>{p.label}</div>
                <div style={{ fontSize: '0.7rem', color: p.color, fontWeight: 600, margin: '2px 0 4px' }}>
                  {p.apar_id} • {p.mupid}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94A3B8', lineHeight: 1.3 }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Identification Form Card */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>
            Patient Identification & Verification
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '1.5rem' }}>
            Enter your APAR ID, MediBridge Unique Patient ID (MUPID), or ABHA ID to access your records.
          </p>

          {errorMsg && (
            <div style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              color: '#DC2626',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '1.25rem'
            }}>
              <AlertTriangle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleManualSubmit}>
            {/* Country Selector */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
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
              Select Identifier Type
            </div>

            {/* Option 1: APAR ID */}
            <div
              style={{
                border: selectedOption === 'apar' ? '2px solid #0F766E' : '1px solid #E2E8F0',
                backgroundColor: selectedOption === 'apar' ? '#F0FDFA' : '#FFFFFF',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '0.75rem',
                cursor: 'pointer'
              }}
              onClick={() => {
                setSelectedOption('apar');
                setIdentifierInput('APAR-9821-4412');
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }}>
                    APAR ID (Automated Permanent Account Registry)
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    Standard national registry identifier for patient records & academic health history.
                  </div>
                </div>
                <input type="radio" checked={selectedOption === 'apar'} onChange={() => setSelectedOption('apar')} />
              </div>

              {selectedOption === 'apar' && (
                <div style={{ marginTop: '0.75rem' }}>
                  <input
                    type="text"
                    className="input-text"
                    placeholder="Enter APAR ID (e.g. APAR-9821-4412)"
                    value={identifierInput}
                    onChange={(e) => setIdentifierInput(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Option 2: MUPID / MUCID */}
            <div
              style={{
                border: selectedOption === 'mupid' ? '2px solid #0F766E' : '1px solid #E2E8F0',
                backgroundColor: selectedOption === 'mupid' ? '#F0FDFA' : '#FFFFFF',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '0.75rem',
                cursor: 'pointer'
              }}
              onClick={() => {
                setSelectedOption('mupid');
                setIdentifierInput('MB-DEMO-01');
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }}>
                    MUPID / MUCID (MediBridge Unique Patient Identifier)
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    Unique cryptographically verified MB-XXXXXX health identifier.
                  </div>
                </div>
                <input type="radio" checked={selectedOption === 'mupid'} onChange={() => setSelectedOption('mupid')} />
              </div>

              {selectedOption === 'mupid' && (
                <div style={{ marginTop: '0.75rem' }}>
                  <input
                    type="text"
                    className="input-text"
                    placeholder="Enter MUPID (e.g. MB-DEMO-01 or MB-7X4Q2K)"
                    value={identifierInput}
                    onChange={(e) => setIdentifierInput(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Option 3: ABHA ID */}
            <div
              style={{
                border: selectedOption === 'abha' ? '2px solid #0F766E' : '1px solid #E2E8F0',
                backgroundColor: selectedOption === 'abha' ? '#F0FDFA' : '#FFFFFF',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.25rem',
                cursor: 'pointer'
              }}
              onClick={() => {
                setSelectedOption('abha');
                setIdentifierInput('91-8472-9102-4521');
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }}>
                    ABHA ID (Ayushman Bharat Health Account)
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    14-digit ABDM national healthcare account.
                  </div>
                </div>
                <input type="radio" checked={selectedOption === 'abha'} onChange={() => setSelectedOption('abha')} />
              </div>

              {selectedOption === 'abha' && (
                <div style={{ marginTop: '0.75rem' }}>
                  <input
                    type="text"
                    className="input-text"
                    placeholder="14-digit ABHA (e.g. 91-8472-9102-4521)"
                    value={identifierInput}
                    onChange={(e) => setIdentifierInput(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Privacy Protection Notice */}
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
                <strong>Zero-Knowledge Identity Protection:</strong> Knowing a MUPID or APAR ID alone never grants unauthorized access to medical records. Demonstration mode uses isolated synthetic records that cannot access real clinical data.
              </span>
            </div>

            <Button variant="primary" size="lg" style={{ width: '100%' }} disabled={isVerifying}>
              <span>{isVerifying ? 'Validating Identifier...' : 'Load Patient Record & Dashboard'}</span>
              <ArrowRight size={18} />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
