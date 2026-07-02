'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function LandingMockup() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s + 1) % 5);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Step 0: Idle, no highlight
  // Step 1: Text selected (blue bg)
  // Step 2: Menu appears
  // Step 3: Highlight applied (Ochre), Menu active
  // Step 4: Highlight applied (Ochre), Menu fades out

  const isSelected = step === 1 || step === 2;
  const isMenuVisible = step === 2 || step === 3;
  const isHighlighted = step === 3 || step === 4;

  const highlightClass = isSelected
    ? "bg-blue-200/50 text-black border-b-2 border-transparent px-1 rounded transition-colors duration-300"
    : isHighlighted
    ? "bg-[#E4D7C5]/60 text-black border-b-2 border-[#E4D7C5] px-1 rounded transition-colors duration-300"
    : "bg-transparent text-gray-600 border-b-2 border-transparent px-1 rounded transition-colors duration-300";

  return (
    <div className="bg-gray-50/50 p-8 lg:p-12 relative overflow-hidden flex items-center justify-center border-t border-[#E5E5E5] w-full min-h-[400px]">
      
      {/* Glow effect behind the mockup */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[500px] h-[300px] bg-white/80 blur-[80px] rounded-full pointer-events-none" />

      {/* The Mockup Window */}
      <div className="relative z-10 w-full max-w-[480px] bg-white border border-gray-200 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] rounded-xl overflow-hidden transform hover:-translate-y-2 hover:shadow-[0_30px_50px_-20px_rgba(0,0,0,0.15)] transition-all duration-700 ease-out group/mockup">
        
        {/* Mockup Topbar */}
        <div className="h-10 border-b border-gray-100 flex items-center justify-between px-4 bg-[#FDFBF7]">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
          <div className="font-sans text-[10px] text-gray-400 font-bold tracking-widest uppercase">The Reading Rooms</div>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>

        {/* Mockup Body */}
        <div className="p-8 pb-10 relative">
          <h4 className="font-heading font-bold text-xl text-[#1A1A1A] mb-4">
            The Architecture of Thought
          </h4>
          
          <p className="font-serif text-sm leading-loose text-gray-600 mb-4 transition-colors">
            When we interact with complex systems, our minds naturally seek to build <mark className={highlightClass}>structural scaffolding</mark>. This allows us to map new concepts onto existing frameworks.
          </p>
          <p className="font-serif text-sm leading-loose text-gray-600">
            The most effective learning environments are those that <mark className="bg-[#D1D9D3]/40 text-black px-1 rounded border-b-2 border-[#D1D9D3]">encourage active synthesis</mark> rather than passive consumption. By highlighting and annotating, we transform the text into our own context.
          </p>

          {/* Floating Highlight Menu (Animated by state instead of hover) */}
          <div className={cn(
            "absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-[#E5E5E5] shadow-xl rounded-md p-1.5 flex gap-1.5 transition-all duration-500 ease-out pointer-events-none",
            isMenuVisible ? "opacity-100 -translate-y-6" : "opacity-0 -translate-y-2 scale-95"
          )}>
            <div className={cn("w-5 h-5 rounded-full bg-[#E4D7C5] transition-transform duration-300", step === 3 && "scale-125 shadow-md")} />
            <div className="w-5 h-5 rounded-full bg-[#D1D9D3]" />
            <div className="w-5 h-5 rounded-full bg-[#E6D0D3]" />
            <div className="w-5 h-5 rounded-full bg-[#D1D5E4]" />
            <div className="w-[1px] h-5 bg-gray-200 mx-1" />
            <div className="w-5 h-5 flex items-center justify-center text-[#1A1A1A]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </div>
          </div>
        </div>
        
        {/* Fade out bottom to indicate scrollable content */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
