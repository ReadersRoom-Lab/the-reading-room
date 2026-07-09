'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Sparkles, Folder, FileText } from 'lucide-react';

function HighlightAd({ isActive }: { isActive: boolean }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setStep(0);
      return;
    }
    const interval = setInterval(() => {
      setStep((s) => (s + 1) % 5);
    }, 1200);
    return () => clearInterval(interval);
  }, [isActive]);

  const isSelected = step === 1 || step === 2;
  const isMenuVisible = step === 2 || step === 3;
  const isHighlighted = step === 3 || step === 4;

  let highlightClass = "bg-transparent text-gray-700 border-b-2 border-transparent px-1 rounded transition-colors duration-300";
  if (isSelected) {
    highlightClass = "bg-blue-200/50 text-black border-b-2 border-transparent px-1 rounded transition-colors duration-300";
  } else if (isHighlighted) {
    highlightClass = "bg-[#E4D7C5]/60 text-black border-b-2 border-[#E4D7C5] px-1 rounded transition-colors duration-300";
  }

  return (
    <div className="p-6 relative h-full flex flex-col justify-center">
      <h4 className="font-heading font-bold text-lg text-[#1A1A1A] mb-2">
        The Architecture of Thought
      </h4>
      
      <p className="font-serif text-xs leading-relaxed text-gray-700 mb-2 transition-colors">
        When we interact with complex systems, our minds naturally seek to build <mark className={highlightClass}>structural scaffolding</mark>. This allows us to map new concepts onto existing frameworks.
      </p>
      <p className="font-serif text-xs leading-relaxed text-gray-700">
        The most effective learning environments are those that <mark className="bg-[#D1D9D3]/40 text-black px-1 rounded border-b-2 border-[#D1D9D3]">encourage active synthesis</mark> rather than passive consumption. By highlighting and annotating, we transform the text into our own context.
      </p>

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
  );
}

function AIAd({ isActive }: { isActive: boolean }) {
  const [step, setStep] = useState(0);
  
  useEffect(() => {
    if (!isActive) {
      setStep(0);
      return;
    }
    const interval = setInterval(() => setStep(s => (s + 1) % 4), 1500);
    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="p-6 h-full flex flex-col justify-center relative">
       <div className="flex items-center gap-2 mb-4">
          <Sparkles className={cn("w-5 h-5 text-indigo-500 transition-all duration-1000", step > 0 ? "animate-pulse shadow-[0_0_20px_rgba(99,102,241,0.5)]" : "")} />
          <h4 className="font-heading font-bold text-base text-indigo-950">AI Knowledge Synthesis</h4>
       </div>
       
       <div className="space-y-4">
          <div className="h-2 bg-gray-100 rounded w-full overflow-hidden relative">
             <div className="absolute top-0 left-0 h-full bg-indigo-200 transition-all duration-1000 ease-out" style={{ width: step > 0 ? '100%' : '0%' }} />
          </div>
          <div className="h-2 bg-gray-100 rounded w-5/6 overflow-hidden relative">
             <div className="absolute top-0 left-0 h-full bg-indigo-200 transition-all duration-1000 ease-out delay-150" style={{ width: step > 1 ? '100%' : '0%' }} />
          </div>
          <div className="h-2 bg-gray-100 rounded w-4/6 overflow-hidden relative">
             <div className="absolute top-0 left-0 h-full bg-indigo-200 transition-all duration-1000 ease-out delay-300" style={{ width: step > 2 ? '100%' : '0%' }} />
          </div>
       </div>
       <div className={cn("absolute bottom-6 left-6 right-6 p-3 bg-indigo-50/80 backdrop-blur-sm border border-indigo-100 rounded-lg text-xs font-serif italic text-indigo-900 transition-all duration-700", step === 3 ? "opacity-100 translate-y-0 shadow-lg" : "opacity-0 translate-y-4")}>
          &quot;A profound conceptual link was found between your highlights on <b>Philosophy</b> and <b>Quantum Mechanics</b>.&quot;
       </div>
    </div>
  )
}

function OrganizeAd({ isActive }: { isActive: boolean }) {
  const [step, setStep] = useState(0);
  
  useEffect(() => {
    if (!isActive) {
      setStep(0);
      return;
    }
    const interval = setInterval(() => setStep(s => (s + 1) % 4), 1500);
    return () => clearInterval(interval);
  }, [isActive]);

  let dragFileClass = "translate-x-0 translate-y-0 opacity-100";
  if (step === 1) {
    dragFileClass = "-translate-x-[120px] translate-y-[10px] opacity-0";
  } else if (step === 2 || step === 3) {
    dragFileClass = "opacity-0 translate-y-4";
  }

  return (
     <div className="flex h-full w-full">
        <div className="w-1/3 border-r border-gray-100 p-4 bg-gray-50/50 flex flex-col gap-2 relative z-10">
           <div className="text-[10px] font-bold text-gray-600 mb-2 uppercase tracking-wider">Rooms</div>
           <div className={cn("flex items-center gap-2 p-2 rounded transition-all duration-300", step === 1 ? "bg-white shadow-md ring-1 ring-blue-200 scale-105" : "")}>
              <Folder className={cn("w-4 h-4", step === 1 ? "text-blue-500" : "text-blue-400")} />
              <span className="text-xs font-semibold">Neuroscience</span>
           </div>
           <div className="flex items-center gap-2 p-2 rounded">
              <Folder className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold">Philosophy</span>
           </div>
        </div>
        <div className="w-2/3 p-6 relative bg-white overflow-hidden">
           {/* Dragging File */}
           <div className={cn("p-4 border border-gray-200 shadow-sm rounded-lg bg-white flex items-start gap-3 absolute top-6 left-6 right-6 transition-all duration-700 ease-in-out z-20", dragFileClass)}>
              <FileText className="w-5 h-5 text-gray-400 shrink-0" />
              <div>
                 <div className="text-sm font-bold mb-1">The Brain&apos;s Network</div>
                 <div className="text-[10px] text-gray-700 leading-tight">How neurons wire together...</div>
              </div>
           </div>

           {/* Next file sitting underneath */}
           <div className={cn("p-4 border border-gray-100 border-dashed rounded-lg bg-gray-50 flex items-start gap-3 absolute top-28 left-6 right-6 transition-all duration-700 ease-in-out",
              step >= 2 ? "-translate-y-[88px] border-solid border-gray-200 shadow-sm bg-white" : ""
           )}>
              <FileText className="w-5 h-5 text-gray-300 shrink-0" />
              <div>
                 <div className="text-sm font-bold mb-1 text-gray-600">Synaptic Plasticity</div>
                 <div className="text-[10px] text-gray-600 leading-tight">Memory formation and...</div>
              </div>
           </div>
        </div>
     </div>
  )
}

export function LandingMockup() {
  const [activeAd, setActiveAd] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAd((prev) => (prev + 1) % 3);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const titles = [
    "Read & Highlight",
    "Synthesize with AI",
    "Organize in Rooms"
  ];

  return (
    <div className="bg-gray-50/50 p-6 lg:p-8 relative overflow-hidden flex items-center justify-center border-t border-[#E5E5E5] w-full min-h-[360px]" aria-hidden="true">
      
      {/* Glow effect behind the mockup */}
      <div className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[500px] h-[300px] blur-[80px] rounded-full pointer-events-none transition-colors duration-1000",
        activeAd === 0 && "bg-amber-100/80",
        activeAd === 1 && "bg-indigo-100/80",
        activeAd === 2 && "bg-blue-100/80"
      )} />

      <div className="flex flex-col items-center z-10 w-full max-w-[480px]">
        
        {/* The Mockup Window */}
        <div className="relative w-full h-[260px] bg-white border border-gray-200 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] rounded-xl overflow-hidden transform hover:-translate-y-2 hover:shadow-[0_30px_50px_-20px_rgba(0,0,0,0.15)] transition-all duration-700 ease-out group/mockup">
          
          {/* Mockup Topbar */}
          <div className="h-10 border-b border-gray-100 flex items-center justify-between px-4 bg-[#FDFBF7]">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            </div>
            <div className="font-sans text-[10px] text-gray-600 font-bold tracking-widest uppercase transition-all duration-300">
              {titles[activeAd]}
            </div>
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>

          {/* Ad Container */}
          <div className="relative w-full h-[220px] bg-white">
            <div className={cn("absolute inset-0 transition-opacity duration-1000", activeAd === 0 ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none")}>
              <HighlightAd isActive={activeAd === 0} />
            </div>
            <div className={cn("absolute inset-0 transition-opacity duration-1000", activeAd === 1 ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none")}>
              <AIAd isActive={activeAd === 1} />
            </div>
            <div className={cn("absolute inset-0 transition-opacity duration-1000", activeAd === 2 ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none")}>
              <OrganizeAd isActive={activeAd === 2} />
            </div>
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="mt-8 flex gap-3">
          {[0, 1, 2].map((i) => (
            <button 
              key={i}
              onClick={() => setActiveAd(i)}
              className="relative py-2 px-1 group"
              tabIndex={-1}
              aria-label={`Slide ${i + 1}`}
              title={`Slide ${i + 1}`}
            >
              <span className="sr-only">Slide {i + 1}</span>
              <div className={cn(
                "h-1 rounded-full transition-all duration-700 ease-out", 
                activeAd === i ? "w-8 bg-[#1A1A1A]" : "w-4 bg-gray-300 group-hover:bg-gray-400"
              )} />
            </button>
          ))}
        </div>
        
      </div>
    </div>
  );
}
