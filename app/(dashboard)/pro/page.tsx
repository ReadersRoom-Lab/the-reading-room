import { Check, X, Shield } from "lucide-react";

export default function ProUpgradePage() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-6 font-sans">
      <div className="text-center mb-16">
        <span className="inline-block px-3 py-1 bg-[#D17659] text-white text-[10px] font-bold tracking-widest uppercase mb-6 rounded-sm">
          Pro Researcher
        </span>
        <h1 className="text-5xl md:text-6xl font-heading font-bold text-[#1a1a1a] mb-6 tracking-tight">
          You&apos;re working like a researcher.
        </h1>
        <p className="text-xl font-source-serif text-[#444] max-w-2xl mx-auto leading-relaxed">
          Your reading habits suggest a deeper need for cross-referencing and persistent synthesis.
          Unlock the full potential of your library.
        </p>
      </div>

      <div className="w-full h-[300px] bg-muted mb-16 overflow-hidden relative">
        <div className="absolute inset-0 bg-[#3F362D]/20 mix-blend-multiply" />
        {/* Placeholder for the aesthetic image */}
        <div className="w-full h-full bg-[#E5DFD3] flex items-center justify-center">
          <p className="text-muted-foreground font-source-serif italic text-sm">
            Glasses & Books Image Placeholder
          </p>
        </div>
      </div>

      <div className="border border-border bg-card rounded-md overflow-hidden">
        <div className="grid grid-cols-2 divide-x divide-border border-b border-border text-center">
          <div className="p-6 bg-muted/30">
            <h3 className="font-semibold text-[#1a1a1a]">Free Tier</h3>
          </div>
          <div className="p-6 bg-[#FCFBF8]">
            <h3 className="font-semibold text-[#D17659]">Pro Researcher</h3>
          </div>
        </div>

        {/* Row 1 */}
        <div className="grid grid-cols-2 divide-x divide-border border-b border-border text-center">
          <div className="p-8 flex flex-col items-center justify-center gap-3">
            <Check className="w-6 h-6 text-muted-foreground" />
            <span className="text-sm font-medium text-[#1a1a1a]">Unlimited Bookmarks</span>
          </div>
          <div className="p-8 flex flex-col items-center justify-center gap-3 bg-[#FCFBF8]">
            <Check className="w-6 h-6 text-[#D17659]" />
            <span className="text-sm font-medium text-[#1a1a1a]">Unlimited Bookmarks</span>
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-2 divide-x divide-border border-b border-border text-center">
          <div className="p-8 flex flex-col items-center justify-center gap-3">
            <Check className="w-6 h-6 text-muted-foreground" />
            <span className="text-sm font-medium text-[#1a1a1a]">Standard Library Sync</span>
          </div>
          <div className="p-8 flex flex-col items-center justify-center gap-3 bg-[#FCFBF8]">
            <Check className="w-6 h-6 text-[#D17659]" />
            <span className="text-sm font-medium text-[#1a1a1a]">Standard Library Sync</span>
          </div>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-2 divide-x divide-border border-b border-border text-center">
          <div className="p-8 flex flex-col items-center justify-center gap-3">
            <X className="w-6 h-6 text-muted-foreground/30" />
            <span className="text-sm font-medium text-muted-foreground/50">
              Cross-Text Synthesis
            </span>
          </div>
          <div className="p-8 flex flex-col items-center justify-center gap-3 bg-[#FCFBF8]">
            <div className="w-6 h-6 relative flex items-center justify-center text-[#D17659]">
              <span className="absolute text-xl leading-none font-serif">✨</span>
            </div>
            <span className="text-sm font-bold text-[#1a1a1a]">Semantic Search & AI Synthesis</span>
          </div>
        </div>

        {/* Row 4 */}
        <div className="grid grid-cols-2 divide-x divide-border text-center">
          <div className="p-8 flex flex-col items-center justify-center gap-3">
            <X className="w-6 h-6 text-muted-foreground/30" />
            <span className="text-sm font-medium text-muted-foreground/50">
              Private Vault Backups
            </span>
          </div>
          <div className="p-8 flex flex-col items-center justify-center gap-3 bg-[#FCFBF8]">
            <Shield className="w-6 h-6 text-[#D17659]" />
            <span className="text-sm font-bold text-[#1a1a1a]">End-to-End Encrypted Vault</span>
          </div>
        </div>
      </div>
    </div>
  );
}
