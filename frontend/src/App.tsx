import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { HomePage } from './pages/public/HomePage';
import { PatientOnboardingPage } from './pages/patient/PatientOnboardingPage';
import { PatientDashboardPage } from './pages/patient/PatientDashboardPage';
import { AIReportAnalysisPage } from './pages/patient/AIReportAnalysisPage';
import { DoctorWorkspacePage } from './pages/doctor/DoctorWorkspacePage';
import { EmergencyPanelPage } from './pages/emergency/EmergencyPanelPage';
import { EmergencySOSPage } from './pages/emergency/EmergencySOSPage';
import { HospitalsPage } from './pages/public/HospitalsPage';
import { MedicineComparePage } from './pages/patient/MedicineComparePage';
import { GovernmentSchemesPage } from './pages/public/GovernmentSchemesPage';

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Standalone Full-Screen Hospital Emergency Panel (Screen 1 Wireframe) */}
      <Route path="/hospital/emergency-panel" element={<EmergencyPanelPage />} />

      {/* Main Layout Pages */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/patient/onboarding" element={<PatientOnboardingPage />} />
        <Route path="/patient/dashboard" element={<PatientDashboardPage />} />
        <Route path="/patient/records/ai-analysis" element={<AIReportAnalysisPage />} />
        <Route path="/doctor/workspace" element={<DoctorWorkspacePage />} />
        <Route path="/emergency" element={<EmergencySOSPage />} />
        <Route path="/hospitals" element={<HospitalsPage />} />
        <Route path="/medicine-compare" element={<MedicineComparePage />} />
        <Route path="/schemes" element={<GovernmentSchemesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

