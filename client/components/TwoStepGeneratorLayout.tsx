import React, { ReactNode } from 'react';

interface TwoStepGeneratorLayoutProps {
  mobileTab?: 'step1' | 'step2';
  step1Content: ReactNode;
  step2Content: ReactNode;
}

export default function TwoStepGeneratorLayout({ 
  mobileTab = 'step1', 
  step1Content, 
  step2Content 
}: TwoStepGeneratorLayoutProps) {
  return (
    <div className="flex h-full">
      {/* Step 1 - Left Panel */}
      <div className={`flex flex-col h-full flex-1 lg:border-r border-gray-300 lg:pr-3.5 ${mobileTab === 'step2' ? 'hidden lg:flex' : ''}`}>
        {step1Content}
      </div>

      {/* Step 2 - Right Panel */}
      <div className={`flex flex-col h-full flex-1 lg:pl-3.5 ${mobileTab === 'step1' ? 'hidden lg:flex' : ''}`}>
        {step2Content}
      </div>
    </div>
  );
}
