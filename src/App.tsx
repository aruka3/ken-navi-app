import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import StepIndicator from './components/StepIndicator';
import Step0 from './components/steps/Step0';
import Step1 from './components/steps/Step1';
import Step2 from './components/steps/Step2';
import Step3 from './components/steps/Step3';
import Step4 from './components/steps/Step4';

function AppContent() {
  const { state } = useApp();

  const steps = [Step0, Step1, Step2, Step3, Step4];
  const CurrentStep = steps[state.currentStep];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            KEN-NAVI AI
          </h1>
          <p className="text-lg text-gray-600">
            建築申請プロセスをスマートにナビゲート by ナビくも
          </p>
        </header>

        <StepIndicator currentStep={state.currentStep} totalSteps={5} />

        <main>
          <CurrentStep />
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;