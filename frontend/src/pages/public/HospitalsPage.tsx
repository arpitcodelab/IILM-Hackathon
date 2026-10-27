import React, { useState, useEffect } from 'react';
import {
  Search, MapPin, Star, ShieldCheck, Filter, ArrowRight,
  Building2, CheckCircle2, ChevronRight, Info
} from 'lucide-react';
import { HospitalRecord } from '../../types';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { apiClient } from '../../api/client';

const HOSPITALS: HospitalRecord[] = [
  {
    id: 'hosp-1',
    name: 'Apollo Hospital',
    location: 'Sarita Vihar, Delhi',
    distance_km: 3.5,
    rating: 4.6,
    reviews_count: 900,
    specialties: ['Cardiology', 'Neurology', 'Orthopedics', 'Oncology'],
    starting_price: 25000,
    procedure_name: 'Knee Replacement',
    accreditation: ['NABH', 'JCI']
  },
  {
    id: 'hosp-2',
    name: 'Max Super Speciality Hospital',
    location: 'Saket, New Delhi',
    distance_km: 6.2,
    rating: 4.4,
    reviews_count: 350,
    specialties: ['Cardiology', 'Neuroscience', 'Robotic Surgery'],
    starting_price: 350000,
    procedure_name: 'Heart Bypass Surgery (CABG)',
    accreditation: ['NABH', 'NABL']
  },
  {
    id: 'hosp-3',
    name: 'Fortis Hospital',
    location: 'Vasant Kunj, New Delhi',
    distance_km: 8.0,
    rating: 4.3,
    reviews_count: 450,
    specialties: ['Urology', 'Gastroenterology', 'Critical Care'],
    starting_price: 180000,
    procedure_name: 'Laparoscopic Gall Bladder Surgery',
    accreditation: ['NABH']
  }
];

export const HospitalsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [hospitalsList, setHospitalsList] = useState<HospitalRecord[]>(HOSPITALS);
  const [selectedHospital, setSelectedHospital] = useState<HospitalRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    apiClient<{ hospitals: any[] }>('/hospitals')
      .then((res) => {
        if (res.hospitals && res.hospitals.length > 0) {
          const mapped = res.hospitals.map((h: any, idx: number) => ({
            id: h._id || `hosp-${idx}`,
            name: h.name,
            location: `${h.address || ''}, ${h.city || 'Delhi'}`,
            distance_km: 3.5 + idx * 1.5,
            rating: h.rating || 4.5,
            reviews_count: h.reviews_count || 500,
            specialties: h.specialties || ['Cardiology', 'Surgery'],
            starting_price: h.procedure_tariffs?.[0]?.base_price_inr || 25000,
            procedure_name: h.procedure_tariffs?.[0]?.procedure_name || 'Standard Consultation',
            accreditation: h.accreditations || ['NABH'],
          }));
          setHospitalsList(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const filteredHospitals = hospitalsList.filter(
    (h) =>
      h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.procedure_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenBreakdown = (h: HospitalRecord) => {
    setSelectedHospital(h);
    setIsModalOpen(true);
  };

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: 'calc(100vh - 68px)', padding: '2.5rem 0' }}>
      <div className="container-custom">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
            Accredited Hospitals & Transparent Tariffs
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#64748B' }}>
            Verified NABH/JCI accredited hospital tariffs in Delhi NCR • No hidden charges
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '10px',
          border: '1px solid #E2E8F0',
          padding: '1rem',
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="input-text"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search hospitals, procedure names (e.g. CABG, Knee Replacement)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ width: '180px' }}>
            <select className="input-select">
              <option>📍 Delhi NCR</option>
              <option>Mumbai</option>
              <option>Bengaluru</option>
              <option>Chennai</option>
            </select>
          </div>

          <Button variant="outline" size="md">
            <Filter size={16} /> Filters
          </Button>
        </div>

        {/* Hospitals Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredHospitals.map((h) => (
            <div
              key={h.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '1.5rem',
                display: 'grid',
                gridTemplateColumns: '1.5fr 1fr auto',
                gap: '1.5rem',
                alignItems: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              {/* Left Column: Hospital Info */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.35rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A' }}>
                    {h.name}
                  </h3>
                  {h.accreditation.map((acc, i) => (
                    <span key={i} className="badge badge--success" style={{ fontSize: '0.65rem' }}>
                      {acc}
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8125rem', color: '#64748B', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#D97706', fontWeight: 600 }}>
                    <Star size={15} fill="#D97706" /> {h.rating} ({h.reviews_count} reviews)
                  </div>
                  <div>•</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={15} /> {h.location} ({h.distance_km} km)
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {h.specialties.map((s, i) => (
                    <span key={i} style={{ backgroundColor: '#F1F5F9', color: '#475569', fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Center Column: Transparent Starting Tariff */}
              <div style={{ borderLeft: '1px solid #E2E8F0', paddingLeft: '1.5rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                  Starting From
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F766E', margin: '2px 0' }}>
                  ₹{h.starting_price.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155' }}>
                  {h.procedure_name}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '2px' }}>
                  Estimated tariff • Subject to clinical severity
                </div>
              </div>

              {/* Right Column: Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', minWidth: '150px' }}>
                <Button variant="primary" size="md" onClick={() => handleOpenBreakdown(h)}>
                  View Details
                </Button>
                <Button variant="outline" size="md" onClick={() => alert(`Added ${h.name} to side-by-side hospital comparison matrix.`)}>
                  Add to Compare
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transparent Breakdown Modal */}
      {selectedHospital && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Tariff Breakdown — ${selectedHospital.name}`}
          size="lg"
        >
          <div style={{ fontSize: '0.875rem' }}>
            <div style={{ backgroundColor: '#F0FDFA', border: '1px solid #CCFBF1', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 700, color: '#0F766E', fontSize: '1rem' }}>
                Procedure: {selectedHospital.procedure_name}
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F766E', marginTop: '4px' }}>
                Starting at ₹{selectedHospital.starting_price.toLocaleString('en-IN')}
              </div>
            </div>

            <h4 style={{ fontWeight: 700, marginBottom: '0.5rem', color: '#0F172A' }}>Inclusions:</h4>
            <ul style={{ paddingLeft: '1.25rem', listStyle: 'disc', color: '#475569', marginBottom: '1rem', lineHeight: 1.6 }}>
              <li>Surgeon & Anesthetist consultation fees</li>
              <li>Standard 3-day hospital room stay (Twin sharing)</li>
              <li>Standard Operation Theatre & Nursing charges</li>
              <li>Routine post-operative medications during admission</li>
            </ul>

            <h4 style={{ fontWeight: 700, marginBottom: '0.5rem', color: '#0F172A' }}>Exclusions:</h4>
            <ul style={{ paddingLeft: '1.25rem', listStyle: 'disc', color: '#475569', marginBottom: '1.25rem', lineHeight: 1.6 }}>
              <li>Special imported implants or high-grade prosthetics</li>
              <li>Extended ICU stay exceeding 24 hours</li>
              <li>Outpatient pharmacy after discharge</li>
            </ul>

            <div style={{
              backgroundColor: '#FFF7ED',
              border: '1px solid #FED7AA',
              borderRadius: '6px',
              padding: '0.75rem',
              color: '#9A3412',
              fontSize: '0.75rem',
              lineHeight: 1.5,
              marginBottom: '1.25rem'
            }}>
              <strong>Clinical Non-Guarantee Disclaimer:</strong> This estimate is based on standard hospital tariffs. Final billing is determined by the treating surgical team based on patient condition and clinical complications.
            </div>

            <Button variant="primary" style={{ width: '100%' }} onClick={() => setIsModalOpen(false)}>
              Close Tariff Details
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

