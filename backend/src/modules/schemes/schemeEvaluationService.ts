import { GovernmentScheme, IGovernmentScheme } from '../../models/index.js';

export interface SchemeEvaluationInput {
  state: string;
  district?: string;
  procedure_name: string;
  annual_income_inr?: number;
  has_income_certificate: boolean;
  ration_card_category: 'bpl' | 'aay' | 'phh' | 'apl' | 'none';
  has_existing_golden_card: boolean;
  estimated_procedure_cost_inr?: number;
}

export interface SchemeMatchResult {
  scheme_name: string;
  scheme_code: string;
  authority: string;
  match_status: 'PRELIMINARY_ELIGIBLE' | 'DOCUMENTS_INCOMPLETE' | 'INELIGIBLE';
  max_coverage_inr: number;
  covered_procedure: boolean;
  ration_match: boolean;
  required_documents: string[];
  next_steps: string[];
  disclaimer: string;
}

export interface FinancialLiabilityLedger {
  estimated_total_cost_inr: number;
  confirmed_covered_amount_inr: number;
  pending_preliminary_assistance_inr: number;
  excluded_patient_expenses_inr: number;
  estimated_patient_liability_inr: number;
  liability_notice: string;
}

export class SchemeEvaluationService {
  static evaluate(input: SchemeEvaluationInput): {
    matches: SchemeMatchResult[];
    financial_ledger: FinancialLiabilityLedger;
  } {
    const totalCost = input.estimated_procedure_cost_inr || 350000;
    const excludedExpenses = 15000;

    const matches: SchemeMatchResult[] = [];

    // 1. Ayushman Bharat PM-JAY
    const isPmjayEligible =
      input.has_existing_golden_card ||
      ['bpl', 'aay', 'phh'].includes(input.ration_card_category) ||
      (input.annual_income_inr !== undefined && input.annual_income_inr <= 250000);

    matches.push({
      scheme_name: 'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY)',
      scheme_code: 'AB-PMJAY',
      authority: 'National Health Authority (NHA), Government of India',
      match_status: isPmjayEligible ? 'PRELIMINARY_ELIGIBLE' : 'INELIGIBLE',
      max_coverage_inr: 500000,
      covered_procedure: true,
      ration_match: ['bpl', 'aay', 'phh'].includes(input.ration_card_category),
      required_documents: [
        'Aadhaar Card of the patient (for biometric authentication)',
        `Valid ${input.ration_card_category.toUpperCase()} Ration Card or SECC Family Identification letter`,
        "Doctor's official clinical referral or surgical recommendation",
        ...(input.has_income_certificate ? [] : ['Income Certificate issued by Tehsildar / Revenue Department']),
      ],
      next_steps: [
        'Visit the Ayushman Mitra Helpdesk at the empanelled hospital (e.g. Apollo, AIIMS).',
        'Present your Aadhaar and Ration Card for biometric e-KYC validation.',
        'Hospital Ayushman Mitra generates a Treatment Pre-Authorization Request before surgery.',
      ],
      disclaimer:
        'Preliminary match only. Official approval and cashless claim settlement are issued strictly by the State Health Agency / TPA upon biometric verification.',
    });

    // 2. State-Specific Scheme (e.g. UP Mukhyamantri Jan Arogya Yojana)
    if (input.state === 'Uttar Pradesh') {
      matches.push({
        scheme_name: 'Uttar Pradesh Mukhyamantri Jan Arogya Yojana',
        scheme_code: 'UP-MMJAY',
        authority: 'State Health Agency, Uttar Pradesh',
        match_status: isPmjayEligible ? 'PRELIMINARY_ELIGIBLE' : 'INELIGIBLE',
        max_coverage_inr: 500000,
        covered_procedure: true,
        ration_match: true,
        required_documents: [
          'UP Domicile Certificate or Residence Proof',
          'Aadhaar Card',
          'Antyodaya or Eligible Household Ration Card',
        ],
        next_steps: [
          'Visit any Government or Empanelled Private Hospital in Uttar Pradesh.',
          'Request MMJAY desk enrollment assistance.',
        ],
        disclaimer: 'State health scheme rules are subject to gazette revision and hospital empanelment validity.',
      });
    }

    // Mathematical Ledger: Pending assistance is NEVER deducted from estimated patient liability!
    const preliminaryAssistance = isPmjayEligible ? totalCost : 0;
    const confirmedCovered = 0; // 0 until official pre-authorization is approved
    const estimatedLiability = totalCost - confirmedCovered + excludedExpenses;

    return {
      matches,
      financial_ledger: {
        estimated_total_cost_inr: totalCost,
        confirmed_covered_amount_inr: confirmedCovered,
        pending_preliminary_assistance_inr: preliminaryAssistance,
        excluded_patient_expenses_inr: excludedExpenses,
        estimated_patient_liability_inr: estimatedLiability,
        liability_notice:
          'In strict compliance with MediBridge financial safety standards, pending assistance is NOT subtracted from patient liability until official government pre-authorization is approved by the hospital Ayushman Mitra.',
      },
    };
  }
}

