import React, { useState, useEffect } from 'react';
import {
  Search, Pill, ShieldCheck, ArrowRight, CheckCircle2,
  AlertTriangle, Info, Sparkles
} from 'lucide-react';
import { MedicineComparisonItem } from '../../types';
import { Button } from '../../components/ui/Button';
import { apiClient } from '../../api/client';

const MEDICINES: MedicineComparisonItem[] = [
  {
    id: 'med-1',
    brand_name: 'Azee 500',
    brand_price: 160,
    generic_name: 'Azithromycin Tablets IP 500 mg (PMBJP)',
    generic_price: 38,
    savings_percentage: 76,
    active_ingredient: 'Azithromycin 500 mg',
    dosage: '500 mg',
    pack_size: 'Strip of 3 Tablets',
    manufacturer_brand: 'Cipla Ltd',
    manufacturer_generic: 'Pradhan Mantri Jan Aushadhi Kendra'
  },
  {
    id: 'med-2',
    brand_name: 'Augmentin 625 Duo',
    brand_price: 220,
    generic_name: 'Amoxycillin & Potassium Clavulanate (PMBJP)',
    generic_price: 55,
    savings_percentage: 75,
    active_ingredient: 'Amoxicillin 500 mg + Clavulanic Acid 125 mg',
    dosage: '625 mg',
    pack_size: 'Strip of 10 Tablets',
    manufacturer_brand: 'GlaxoSmithKline',
    manufacturer_generic: 'Pradhan Mantri Jan Aushadhi Kendra'
  },
  {
    id: 'med-3',
    brand_name: 'Lipitor 20 / Atorva 20',
    brand_price: 280,
    generic_name: 'Atorvastatin Tablets IP 20 mg (PMBJP)',
    generic_price: 45,
    savings_percentage: 84,
    active_ingredient: 'Atorvastatin 20 mg',
    dosage: '20 mg',
    pack_size: 'Strip of 10 Tablets',
    manufacturer_brand: 'Zydus Cadila',
    manufacturer_generic: 'Pradhan Mantri Jan Aushadhi Kendra'
  }
];

export const MedicineComparePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [medicinesList, setMedicinesList] = useState<MedicineComparisonItem[]>(MEDICINES);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setMedicinesList(MEDICINES);
      return;
    }

    const timer = setTimeout(() => {
      apiClient<{ medicines: any[] }>(`/medicines/search?q=${encodeURIComponent(searchTerm)}`)
        .then((res) => {
          if (res.medicines && res.medicines.length > 0) {
            const mapped = res.medicines.map((m: any, idx: number) => ({
              id: `api-med-${idx}`,
              brand_name: m.brand_name,
              brand_price: m.max_retail_price_inr || m.brand_price_inr || 120,
              generic_name: `${m.generic_name} (PMBJP Equivalent)`,
              generic_price: m.generic_price_inr || Math.round((m.max_retail_price_inr || 120) * 0.25),
              savings_percentage: m.savings_percentage || 75,
              active_ingredient: `${m.generic_name} ${m.strength_value || ''} ${m.strength_unit || ''}`,
              dosage: `${m.strength_value || ''} ${m.strength_unit || ''}`,
              pack_size: m.pack_size || 'Standard Strip',
              manufacturer_brand: m.manufacturer_brand || 'Standard Pharma',
              manufacturer_generic: 'Pradhan Mantri Bharatiya Janaushadhi Pariyojana (PMBJP)',
            }));
            setMedicinesList(mapped);
          }
        })
        .catch(() => {});
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredMedicines = medicinesList;

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: 'calc(100vh - 68px)', padding: '2.5rem 0' }}>
      <div className="container-custom" style={{ maxWidth: '880px' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#ECFDF5',
            color: '#059669',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            marginBottom: '0.5rem'
          }}>
            <Sparkles size={14} /> Pradhan Mantri Bharatiya Janaushadhi Pariyojana (PMBJP)
          </div>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
            Medicine Price Comparison & Generic Alternatives
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#64748B' }}>
            Compare branded pharmaceutical drugs with WHO-GMP certified Jan Aushadhi generic equivalents.
          </p>
        </div>

        {/* Search */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '10px',
          border: '1px solid #E2E8F0',
          padding: '0.85rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <Search size={20} color="#94A3B8" />
          <input
            type="text"
            className="input-text"
            style={{ border: 'none', padding: 0 }}
            placeholder="Search medicine brand or salt (e.g. Azee 500, Augmentin, Atorvastatin)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Comparison Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filteredMedicines.map((m) => (
            <div key={m.id} className="medicine-compare-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.85rem' }}>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>
                    Active Salt: {m.active_ingredient}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    Dosage: {m.dosage} • {m.pack_size}
                  </div>
                </div>

                <div style={{
                  backgroundColor: '#ECFDF5',
                  color: '#047857',
                  border: '1px solid #A7F3D0',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '9999px',
                  fontWeight: 700,
                  fontSize: '0.875rem'
                }}>
                  {m.savings_percentage}% Cheaper
                </div>
              </div>

              {/* Side-by-Side Comparison Box */}
              <div className="medicine-compare-card__grid">
                {/* Prescribed Brand */}
                <div className="medicine-compare-card__box" style={{ backgroundColor: '#F8FAFC' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                    Prescribed Brand
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>
                    {m.brand_name}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#64748B', marginBottom: '0.85rem' }}>
                    Mfg: {m.manufacturer_brand}
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#475569' }}>
                    ₹{m.brand_price}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                    Estimated retail price per {m.pack_size}
                  </div>
                </div>

                {/* Jan Aushadhi Generic Alternative */}
                <div className="medicine-compare-card__box medicine-compare-card__box--generic">
                  <div style={{ fontSize: '0.75rem', color: '#065F46', fontWeight: 600, textTransform: 'uppercase' }}>
                    Jan Aushadhi Generic Alternative
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#047857', marginTop: '4px' }}>
                    {m.generic_name}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#065F46', marginBottom: '0.85rem' }}>
                    Source: {m.manufacturer_generic}
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#047857' }}>
                    ₹{m.generic_price}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#065F46' }}>
                    Save ₹{m.brand_price - m.generic_price} per pack at official Kendra
                  </div>
                </div>
              </div>

              {/* Strict Non-Substitution Medical Banner */}
              <div style={{
                backgroundColor: '#FFF7ED',
                border: '1px solid #FFEDD5',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                fontSize: '0.75rem',
                color: '#9A3412',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <ShieldCheck size={18} color="#EA580C" style={{ flexShrink: 0 }} />
                <span>
                  <strong>Clinical Safety Rule:</strong> Same active ingredient, strength, and formulation. MediBridge AI does not substitute medications automatically. Please consult your treating doctor or pharmacist before switching brands.
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

