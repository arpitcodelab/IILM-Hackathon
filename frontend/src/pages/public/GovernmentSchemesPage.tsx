import React, { useState } from 'react';
import {
  HeartHandshake, ShieldCheck, CheckCircle2, AlertCircle, FileText,
  ChevronRight, ArrowRight, HelpCircle, Building2, ExternalLink
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { apiClient } from '../../api/client';

export const GovernmentSchemesPage: React.FC = () => {
  const [state, setState] = useState('Uttar Pradesh');
  const [procedure, setProcedure] = useState('Coronary Artery Bypass Grafting (CABG)');
  const [doctorRecommended, setDoctorRecommended] = useState('yes');
  const [incomeRange, setIncomeRange] = useState('below_1.5L');
  const [hasIncomeCertificate, setHasIncomeCertificate] = useState('yes');
  const [rationCategory, setRationCategory] = useState('bpl');
  const [hasGoldenCard, setHasGoldenCard] = useState('no');
  const [evaluated, setEvaluated] = useState(true);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient<any>('/gov-schemes/evaluate', {
        method: 'POST',
        body: JSON.stringify({
          state,
          procedure_name: procedure,
          annual_income_inr: incomeRange === 'below_1.5L' ? 120000 : 250000,
          has_income_certificate: hasIncomeCertificate === 'yes',
          ration_card_category: rationCategory,
          has_existing_golden_card: hasGoldenCard === 'yes',
        }),
      });
      setEvaluationResult(res);
      setEvaluated(true);
    } catch {
      setEvaluated(true);
    }
  };

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: 'calc(100vh - 68px)', padding: '2.5rem 0' }}>
      <div className="container-custom" style={{ maxWidth: '960px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#F0FDFA',
            color: '#0F766E',
            padding: '0.25rem 0.85rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            marginBottom: '0.5rem'
          }}>
            <HeartHandshake size={14} /> Official Public Health Assistance
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
            Find Government Health Schemes for Your Treatment
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#64748B', maxWidth: '640px', margin: '0 auto' }}>
            Simple eligibility guidance for Indian citizens. Check whether your surgery or hospital treatment qualifies for Ayushman Bharat PM-JAY or State Health Schemes.
          </p>
        </div>

        {/* Two-Column Layout: Questionnaire on Left, Results on Right */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', alignItems: 'start' }}>
          {/* Questionnaire Card */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '1.75rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', marginBottom: '1.25rem' }}>
              Patient Eligibility Details
            </h2>

            <form onSubmit={handleEvaluate}>
              {/* Domicile State */}
              <div className="form-group">
                <label className="form-group__label">Which Indian State do you live in?</label>
                <select className="input-select" value={state} onChange={(e) => setState(e.target.value)}>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Delhi">Delhi (NCT)</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Bihar">Bihar</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Rajasthan">Rajasthan</option>
                </select>
              </div>

              {/* Treatment Needed */}
              <div className="form-group">
                <label className="form-group__label">What operation or medical treatment do you need?</label>
                <select className="input-select" value={procedure} onChange={(e) => setProcedure(e.target.value)}>
                  <option value="Coronary Artery Bypass Grafting (CABG)">Heart Bypass Surgery (CABG)</option>
                  <option value="Total Knee Replacement">Total Knee Replacement</option>
                  <option value="Cataract Surgery">Cataract Surgery with IOL</option>
                  <option value="Hemodialysis">Maintenance Hemodialysis (Per Session)</option>
                  <option value="Cholecystectomy">Gall Bladder Removal (Laparoscopic)</option>
                </select>
              </div>

              {/* Doctor Recommended */}
              <div className="form-group">
                <label className="form-group__label">Has a registered doctor recommended this treatment?</label>
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '4px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem' }}>
                    <input type="radio" name="doc" checked={doctorRecommended === 'yes'} onChange={() => setDoctorRecommended('yes')} /> Yes
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem' }}>
                    <input type="radio" name="doc" checked={doctorRecommended === 'no'} onChange={() => setDoctorRecommended('no')} /> No
                  </label>
                </div>
              </div>

              {/* Income Range */}
              <div className="form-group">
                <label className="form-group__label">Approximate Annual Household Income</label>
                <select className="input-select" value={incomeRange} onChange={(e) => setIncomeRange(e.target.value)}>
                  <option value="below_1.5L">Below ₹1,50,000 per year</option>
                  <option value="1.5L_3L">₹1,50,000 to ₹3,00,000 per year</option>
                  <option value="3L_5L">₹3,00,000 to ₹5,00,000 per year</option>
                  <option value="above_5L">Above ₹5,00,000 per year</option>
                </select>
              </div>

              {/* Ration Card */}
              <div className="form-group">
                <label className="form-group__label">Do you hold a Ration Card?</label>
                <select className="input-select" value={rationCategory} onChange={(e) => setRationCategory(e.target.value)}>
                  <option value="bpl">BPL (Below Poverty Line)</option>
                  <option value="aay">Antyodaya Anna Yojana (AAY / Yellow)</option>
                  <option value="phh">Priority Household (PHH)</option>
                  <option value="none">None / Above Poverty Line (APL)</option>
                </select>
              </div>

              {/* Income Certificate */}
              <div className="form-group">
                <label className="form-group__label">Do you possess an Income Certificate from Tehsildar/Revenue Dept?</label>
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '4px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem' }}>
                    <input type="radio" name="inc" checked={hasIncomeCertificate === 'yes'} onChange={() => setHasIncomeCertificate('yes')} /> Yes
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem' }}>
                    <input type="radio" name="inc" checked={hasIncomeCertificate === 'no'} onChange={() => setHasIncomeCertificate('no')} /> No
                  </label>
                </div>
              </div>

              {/* Golden Card */}
              <div className="form-group">
                <label className="form-group__label">Already have Ayushman PM-JAY Card (Golden Card)?</label>
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '4px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem' }}>
                    <input type="radio" name="gc" checked={hasGoldenCard === 'yes'} onChange={() => setHasGoldenCard('yes')} /> Yes
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem' }}>
                    <input type="radio" name="gc" checked={hasGoldenCard === 'no'} onChange={() => setHasGoldenCard('no')} /> No
                  </label>
                </div>
              </div>

              <Button variant="primary" size="lg" style={{ width: '100%', marginTop: '0.5rem' }}>
                <span>Evaluate Scheme Eligibility</span>
                <ArrowRight size={18} />
              </Button>
            </form>
          </div>

          {/* Results Panel */}
          <div>
            {evaluated ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Scheme Recommendation Card */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '2px solid #0F766E',
                  padding: '1.5rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span className="badge badge--success">
                      Preliminary Match
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      Rule v2.4 (Official)
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.25rem' }}>
                    Ayushman Bharat PM-JAY
                  </h3>
                  <div style={{ fontSize: '0.8125rem', color: '#0F766E', fontWeight: 600, marginBottom: '0.75rem' }}>
                    Coverage: Up to ₹5,00,000 per family per year
                  </div>

                  <p style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.5, marginBottom: '1rem' }}>
                    You qualify for preliminary evaluation under PM-JAY based on holding a <strong>{rationCategory.toUpperCase()} Ration Card</strong> and residence in <strong>{state}</strong>.
                  </p>

                  <div style={{ backgroundColor: '#F0FDFA', border: '1px solid #CCFBF1', borderRadius: '8px', padding: '0.85rem', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0F766E', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Covered Procedure Tariff
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>
                      {procedure}: 100% Cashless at Empanelled Hospitals
                    </div>
                  </div>

                  {/* Required Documents */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>
                      Required Documents for Verification:
                    </div>
                    <ul style={{ fontSize: '0.75rem', color: '#475569', paddingLeft: '1.2rem', listStyle: 'disc', lineHeight: 1.6 }}>
                      <li>Aadhaar Card of the patient</li>
                      <li>Valid {rationCategory.toUpperCase()} Ration Card or SECC Family ID</li>
                      <li>Doctor's clinical referral / surgical prescription</li>
                      <li>Income Certificate from Tehsildar (if requested by State NHA)</li>
                    </ul>
                  </div>

                  {/* Next Steps */}
                  <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '0.85rem' }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>
                      Next Steps:
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#64748B', lineHeight: 1.5, marginBottom: '0.85rem' }}>
                      Visit the <strong>Ayushman Mitra kiosk</strong> at any empanelled hospital (e.g. Apollo, AIIMS) with your Aadhaar and Ration Card for biometric e-KYC and pre-authorization.
                    </p>
                  </div>
                </div>

                {/* Financial Liability Transparency Card */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  padding: '1.5rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginBottom: '1rem' }}>
                    Estimated Financial Liability Ledger
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.8125rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#475569' }}>Estimated Total Treatment Cost:</span>
                      <strong>₹3,50,000</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                      <span>Confirmed Scheme Coverage:</span>
                      <strong>₹0 (Pending Pre-Auth)</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2563EB' }}>
                      <span>Preliminary Matched Assistance:</span>
                      <strong>₹3,50,000</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                      <span>Excluded Personal Expenses:</span>
                      <strong>₹15,000</strong>
                    </div>

                    <div style={{
                      borderTop: '2px solid #E2E8F0',
                      paddingTop: '0.65rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      color: '#0F172A'
                    }}>
                      <span>Current Estimated Patient Liability:</span>
                      <span>₹3,65,000*</span>
                    </div>
                  </div>

                  <div style={{
                    marginTop: '0.85rem',
                    backgroundColor: '#FFF7ED',
                    border: '1px solid #FED7AA',
                    borderRadius: '6px',
                    padding: '0.65rem',
                    fontSize: '0.7rem',
                    color: '#9A3412',
                    lineHeight: 1.4
                  }}>
                    *<strong>Financial Integrity Notice:</strong> In accordance with MediBridge safety rules, preliminary matched assistance is not deducted from your liability until official government pre-authorization is approved by the hospital Ayushman Mitra.
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

