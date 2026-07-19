"use client";

import { Check, X, Shield } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function ProUpgradePage() {
  const [currency, setCurrency] = useState<"usd" | "inr">("usd");
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annually">("annually");

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 font-sans animate-page-transition">
      {/* Page Header */}
      <div className="text-center mb-12">
        <span className="inline-block px-3 py-1 bg-[#D97706] text-white text-[10px] font-bold tracking-widest uppercase mb-4 rounded-none">
          PRICING & TIERS
        </span>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#1C1C1E] mb-4 tracking-tight">
          Invest in your intellect.
        </h1>
        <p className="text-lg font-serif italic text-[#52525B] max-w-2xl mx-auto leading-relaxed">
          &quot;Five tools. One subscription. Turn saved pages into a permanent personal knowledge
          base.&quot;
        </p>
      </div>

      {/* Pricing Hero Image Banner (Replaces Placeholder) */}
      <div className="w-full h-[320px] mb-12 relative border border-[#E5E5E5] rounded-none overflow-hidden">
        <Image
          src="/pricing_hero.png"
          alt="Premium study space illustration with reading glasses and open books"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-[#1C1C1E]/5 flex flex-col justify-end p-8">
          <p className="text-xs uppercase tracking-widest font-semibold text-white bg-[#1C1C1E]/80 self-start px-3 py-1 mb-2 rounded-none">
            SCHOLARLY MINIMALISM
          </p>
          <h2 className="text-2xl font-serif font-bold text-white drop-shadow-md">
            Built in India for readers who take reading seriously.
          </h2>
        </div>
      </div>

      {/* Currency & Billing Control Panel */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10 bg-white border border-[#E5E5E5] p-5 rounded-none">
        {/* Region/Currency Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#1C1C1E] uppercase tracking-wider">
            Region:
          </span>
          <div className="flex border border-[#1C1C1E] p-0.5 rounded-none bg-[#F4F3F3]">
            <button
              type="button"
              onClick={() => setCurrency("usd")}
              className={`px-4 py-1.5 text-xs font-bold transition-all rounded-none cursor-pointer ${
                currency === "usd"
                  ? "bg-[#1C1C1E] text-white"
                  : "text-[#52525B] hover:text-[#1C1C1E]"
              }`}
              aria-label="Switch to global pricing in US dollars"
            >
              Global (USD)
            </button>
            <button
              type="button"
              onClick={() => setCurrency("inr")}
              className={`px-4 py-1.5 text-xs font-bold transition-all rounded-none cursor-pointer ${
                currency === "inr"
                  ? "bg-[#1C1C1E] text-white"
                  : "text-[#52525B] hover:text-[#1C1C1E]"
              }`}
              aria-label="Switch to localized India pricing in Rupees"
            >
              India (INR)
            </button>
          </div>
        </div>

        {/* Billing Period Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#1C1C1E] uppercase tracking-wider">
            Billing:
          </span>
          <div className="flex border border-[#1C1C1E] p-0.5 rounded-none bg-[#F4F3F3]">
            <button
              type="button"
              onClick={() => setBillingPeriod("monthly")}
              className={`px-4 py-1.5 text-xs font-bold transition-all rounded-none cursor-pointer ${
                billingPeriod === "monthly"
                  ? "bg-[#1C1C1E] text-white"
                  : "text-[#52525B] hover:text-[#1C1C1E]"
              }`}
              aria-label="Select monthly billing"
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingPeriod("annually")}
              className={`px-4 py-1.5 text-xs font-bold transition-all rounded-none cursor-pointer ${
                billingPeriod === "annually"
                  ? "bg-[#1C1C1E] text-white"
                  : "text-[#52525B] hover:text-[#1C1C1E]"
              }`}
              aria-label="Select annual billing"
            >
              Annual (Save ~15%)
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {currency === "usd" ? (
          // Global USD Tiers
          <>
            {/* USD Card 1: Free */}
            <div className="border border-[#E5E5E5] bg-white p-8 flex flex-col justify-between rounded-none hover:border-[#1C1C1E] transition-all">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-[#52525B] uppercase block mb-2">
                  THE SHELF
                </span>
                <h3 className="text-2xl font-serif font-bold text-[#1C1C1E] mb-2">Free Tier</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold font-serif text-[#1C1C1E]">$0</span>
                  <span className="text-xs text-[#52525B] uppercase tracking-wider font-semibold">
                    forever
                  </span>
                </div>
                <p className="text-xs text-[#52525B] mb-6 leading-relaxed">
                  A generous foundation for casual readers starting to build their reference vault.
                </p>
                <div className="border-t border-[#E5E5E5] pt-6 flex flex-col gap-3">
                  <div className="flex items-start gap-2.5 text-xs text-[#1C1C1E]">
                    <Check className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                    <span>Save up to 100 articles</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-[#1C1C1E]">
                    <Check className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                    <span>Up to 3 Rooms</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-[#1C1C1E]">
                    <Check className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                    <span>Vocabulary Vault (up to 50 words)</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-[#1C1C1E]">
                    <Check className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                    <span>Basic Chrome extension</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-[#1C1C1E]">
                    <Check className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                    <span>AI Chat (10 queries/mo)</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="w-full mt-8 border border-[#E5E5E5] text-[#52525B] bg-[#F4F3F3] py-2.5 text-center text-xs font-bold tracking-widest uppercase rounded-none cursor-not-allowed"
                disabled
              >
                Current Plan
              </button>
            </div>

            {/* USD Card 2: Pro */}
            <div className="border-2 border-[#D97706] bg-white p-8 flex flex-col justify-between rounded-none relative">
              <div className="absolute top-0 right-8 -translate-y-1/2 bg-[#D97706] text-white text-[9px] font-bold tracking-widest uppercase px-3 py-1 rounded-none">
                RECOMMENDED
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-widest text-[#D97706] uppercase block mb-2">
                  THE STUDY
                </span>
                <h3 className="text-2xl font-serif font-bold text-[#1C1C1E] mb-2">
                  Pro Researcher
                </h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold font-serif text-[#1C1C1E]">
                    {billingPeriod === "annually" ? "$6" : "$7"}
                  </span>
                  <span className="text-xs text-[#52525B] uppercase tracking-wider font-semibold">
                    / month {billingPeriod === "annually" && "(billed $72/yr)"}
                  </span>
                </div>
                <p className="text-xs text-[#52525B] mb-6 leading-relaxed">
                  For scholars, researchers, and professionals demanding deep synthesis and
                  unlimited workspace.
                </p>
                <div className="border-t border-[#E5E5E5] pt-6 flex flex-col gap-3">
                  <div className="flex items-start gap-2.5 text-xs text-[#1C1C1E]">
                    <Check className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                    <span className="font-semibold">Everything in Free</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-[#1C1C1E]">
                    <Check className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                    <span>Unlimited articles & Rooms</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-[#1C1C1E]">
                    <Check className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                    <span>Full AI Chat (unlimited Gemini queries)</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-[#1C1C1E]">
                    <Check className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                    <span>Insights Studio (engagement metrics & heatmaps)</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-[#1C1C1E]">
                    <Check className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                    <span>Markdown export per Room</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-[#1C1C1E]">
                    <Check className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                    <span>Reading streaks & goal tracking</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="w-full mt-8 bg-[#1C1C1E] text-white py-2.5 text-center text-xs font-bold tracking-widest uppercase hover:bg-[#333] transition-colors rounded-none cursor-pointer"
              >
                Upgrade Now
              </button>
            </div>

            {/* USD Card 3: Scholar */}
            <div className="border border-[#E5E5E5] bg-white p-8 flex flex-col justify-between rounded-none hover:border-[#1C1C1E] transition-all">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-[#52525B] uppercase block mb-2">
                  THE LAB (FUTURE)
                </span>
                <h3 className="text-2xl font-serif font-bold text-[#1C1C1E] mb-2">Scholar Tier</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold font-serif text-[#1C1C1E]">
                    {billingPeriod === "annually" ? "$10" : "$12"}
                  </span>
                  <span className="text-xs text-[#52525B] uppercase tracking-wider font-semibold">
                    / month {billingPeriod === "annually" && "(billed $120/yr)"}
                  </span>
                </div>
                <p className="text-xs text-[#52525B] mb-6 leading-relaxed">
                  AI Ghostreader, text-to-speech reading, and automated spaced repetition
                  algorithms.
                </p>
                <div className="border-t border-[#E5E5E5] pt-6 flex flex-col gap-3">
                  <div className="flex items-start gap-2.5 text-xs text-[#1C1C1E]">
                    <Check className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                    <span className="font-semibold">Everything in Pro</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-[#1C1C1E]">
                    <Check className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                    <span>AI-generated TL;DRs & Auto-tagging</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-[#1C1C1E]">
                    <Check className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                    <span>Spaced Repetition scheduling for Vault</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-[#1C1C1E]">
                    <Check className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                    <span>Text-to-speech audio reading</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-[#1C1C1E]">
                    <Check className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                    <span>Direct Notion/Obsidian export pipeline</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="w-full mt-8 bg-[#F4F3F3] text-[#52525B] py-2.5 text-center text-xs font-bold tracking-widest uppercase rounded-none cursor-not-allowed animate-pulse"
                disabled
              >
                Coming Soon
              </button>
            </div>
          </>
        ) : (
          // India INR Localized Tiers
          <>
            {/* INR Card 1: Student Pro */}
            <div className="border border-[#E5E5E5] bg-white p-8 flex flex-col justify-between rounded-none hover:border-[#1C1C1E] transition-all">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold tracking-widest text-[#52525B] uppercase">
                    THE DESK
                  </span>
                  <span className="text-[9px] font-semibold text-[#D97706] bg-[#D97706]/10 px-1.5 py-0.5 border border-[#D97706]/20 uppercase">
                    Verification Req.
                  </span>
                </div>
                <h3 className="text-2xl font-serif font-bold text-[#1C1C1E] mb-2">Student Pro</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold font-serif text-[#1C1C1E]">
                    {billingPeriod === "annually" ? "₹41" : "₹49"}
                  </span>
                  <span className="text-xs text-[#52525B] uppercase tracking-wider font-semibold">
                    / month {billingPeriod === "annually" && "(billed ₹499/yr)"}
                  </span>
                </div>
                <p className="text-xs italic text-[#D97706] font-semibold mb-6">
                  &quot;3 cups of chai per month. Unlimited reading.&quot;
                </p>
                <div className="border-t border-[#E5E5E5] pt-6 flex flex-col gap-3">
                  <div className="flex items-start gap-2.5 text-xs text-[#1C1C1E]">
                    <Check className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                    <span>Full Pro access at 50% discount</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-[#1C1C1E]">
                    <Check className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                    <span>Unlimited articles & Rooms</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-[#1C1C1E]">
                    <Check className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                    <span>Unlimited AI Chat queries</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-[#1C1C1E]">
                    <Check className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                    <span>Verification via .ac.in / .edu email</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="w-full mt-8 border border-[#1C1C1E] text-[#1C1C1E] bg-transparent py-2.5 text-center text-xs font-bold tracking-widest uppercase hover:bg-[#F4F3F3] transition-colors rounded-none cursor-pointer"
              >
                Verify & Upgrade
              </button>
            </div>

            {/* INR Card 2: Pro */}
            <div className="border-2 border-[#D97706] bg-white p-8 flex flex-col justify-between rounded-none relative">
              <div className="absolute top-0 right-8 -translate-y-1/2 bg-[#D97706] text-white text-[9px] font-bold tracking-widest uppercase px-3 py-1 rounded-none">
                POPULAR
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-widest text-[#D97706] uppercase block mb-2">
                  THE STUDY
                </span>
                <h3 className="text-2xl font-serif font-bold text-[#1C1C1E] mb-2">
                  Pro Researcher
                </h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold font-serif text-[#1C1C1E]">
                    {billingPeriod === "annually" ? "₹66" : "₹99"}
                  </span>
                  <span className="text-xs text-[#52525B] uppercase tracking-wider font-semibold">
                    / month {billingPeriod === "annually" && "(billed ₹799/yr)"}
                  </span>
                </div>
                <p className="text-xs italic text-[#D97706] font-semibold mb-6">
                  &quot;Less than your monthly mobile data top-up.&quot;
                </p>
                <div className="border-t border-[#E5E5E5] pt-6 flex flex-col gap-3">
                  <div className="flex items-start gap-2.5 text-xs text-[#1C1C1E]">
                    <Check className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                    <span>Unlimited articles & Rooms</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-[#1C1C1E]">
                    <Check className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                    <span>Full AI Chat (unlimited queries)</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-[#1C1C1E]">
                    <Check className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                    <span>Insights Studio (engagement statistics)</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-[#1C1C1E]">
                    <Check className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                    <span>Reading streaks & goal tracking</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-[#1C1C1E]">
                    <Check className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                    <span>Markdown export per Room</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="w-full mt-8 bg-[#1C1C1E] text-white py-2.5 text-center text-xs font-bold tracking-widest uppercase hover:bg-[#333] transition-colors rounded-none cursor-pointer"
              >
                Upgrade Now
              </button>
            </div>

            {/* INR Card 3: Lifetime Deal */}
            <div className="border border-[#E5E5E5] bg-white p-8 flex flex-col justify-between rounded-none hover:border-[#1C1C1E] transition-all">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-[#52525B] uppercase block mb-2">
                  LIMITED RUN
                </span>
                <h3 className="text-2xl font-serif font-bold text-[#1C1C1E] mb-2">Lifetime Deal</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold font-serif text-[#1C1C1E]">₹1,499</span>
                  <span className="text-xs text-[#52525B] uppercase tracking-wider font-semibold">
                    one-time
                  </span>
                </div>
                <p className="text-xs text-[#52525B] mb-6 leading-relaxed">
                  Capped at the first 500 users. Hedges against recurring-subscription anxiety
                  forever.
                </p>
                <div className="border-t border-[#E5E5E5] pt-6 flex flex-col gap-3">
                  <div className="flex items-start gap-2.5 text-xs text-[#1C1C1E]">
                    <Check className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                    <span className="font-semibold">Permanent Pro access</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-[#1C1C1E]">
                    <Check className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                    <span>Never pay monthly or annually</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-[#1C1C1E]">
                    <Check className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                    <span>All future Pro features included</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-[#1C1C1E]">
                    <Check className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                    <span>Support independent open-source software</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="w-full mt-8 bg-[#1C1C1E] text-white py-2.5 text-center text-xs font-bold tracking-widest uppercase hover:bg-[#333] transition-colors rounded-none cursor-pointer"
              >
                Buy Lifetime
              </button>
            </div>
          </>
        )}
      </div>

      {/* Feature Comparison Matrix Table */}
      <h3 className="text-xl font-serif font-bold text-[#1C1C1E] mb-6">Detailed Feature Matrix</h3>
      <div className="border border-[#E5E5E5] bg-white rounded-none overflow-x-auto mb-12">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E5E5E5] bg-[#F4F3F3]">
              <th className="p-4 text-xs font-bold text-[#1C1C1E] uppercase tracking-wider">
                Feature
              </th>
              <th className="p-4 text-xs font-bold text-[#1C1C1E] uppercase tracking-wider text-center">
                Free Tier
              </th>
              <th className="p-4 text-xs font-bold text-[#1C1C1E] uppercase tracking-wider text-center">
                Pro Researcher
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E5] text-sm">
            <tr>
              <td className="p-4 font-semibold text-[#1C1C1E]">Distraction-Free Reader</td>
              <td className="p-4 text-center">
                <Check className="w-4 h-4 text-[#D97706] mx-auto" />
              </td>
              <td className="p-4 text-center">
                <Check className="w-4 h-4 text-[#D97706] mx-auto" />
              </td>
            </tr>
            <tr>
              <td className="p-4 font-semibold text-[#1C1C1E]">Bookmarks & Saved Articles</td>
              <td className="p-4 text-center text-[#52525B] text-xs">Limit 100</td>
              <td className="p-4 text-center text-[#1C1C1E] text-xs font-bold">Unlimited</td>
            </tr>
            <tr>
              <td className="p-4 font-semibold text-[#1C1C1E]">Thematic Rooms / Spaces</td>
              <td className="p-4 text-center text-[#52525B] text-xs">Up to 3 Rooms</td>
              <td className="p-4 text-center text-[#1C1C1E] text-xs font-bold">Unlimited</td>
            </tr>
            <tr>
              <td className="p-4 font-semibold text-[#1C1C1E]">Vocabulary Vault Entries</td>
              <td className="p-4 text-center text-[#52525B] text-xs">Up to 50 words</td>
              <td className="p-4 text-center text-[#1C1C1E] text-xs font-bold">Unlimited</td>
            </tr>
            <tr>
              <td className="p-4 font-semibold text-[#1C1C1E]">In-Context Definition Lookup</td>
              <td className="p-4 text-center">
                <Check className="w-4 h-4 text-[#D97706] mx-auto" />
              </td>
              <td className="p-4 text-center">
                <Check className="w-4 h-4 text-[#D97706] mx-auto" />
              </td>
            </tr>
            <tr>
              <td className="p-4 font-semibold text-[#1C1C1E]">AI Chat queries (Gemini)</td>
              <td className="p-4 text-center text-[#52525B] text-xs">10 / month</td>
              <td className="p-4 text-center text-[#1C1C1E] text-xs font-bold">Unlimited</td>
            </tr>
            <tr>
              <td className="p-4 font-semibold text-[#1C1C1E]">Markdown Export per Room</td>
              <td className="p-4 text-center">
                <X className="w-4 h-4 text-[#bdbdbd] mx-auto" />
              </td>
              <td className="p-4 text-center">
                <Check className="w-4 h-4 text-[#D97706] mx-auto" />
              </td>
            </tr>
            <tr>
              <td className="p-4 font-semibold text-[#1C1C1E]">Insights Studio Dashboard</td>
              <td className="p-4 text-center text-[#52525B] text-xs">Basic stats</td>
              <td className="p-4 text-center text-[#1C1C1E] text-xs font-bold">Full Analytics</td>
            </tr>
            <tr>
              <td className="p-4 font-semibold text-[#1C1C1E]">Priority Chrome Extension</td>
              <td className="p-4 text-center text-[#52525B] text-xs">Basic save</td>
              <td className="p-4 text-center text-[#1C1C1E] text-xs font-bold">
                Full rendering & PDF support
              </td>
            </tr>
            <tr>
              <td className="p-4 font-semibold text-[#1C1C1E]">Spaced Repetition Scheduling</td>
              <td className="p-4 text-center">
                <X className="w-4 h-4 text-[#bdbdbd] mx-auto" />
              </td>
              <td className="p-4 text-center">
                <span className="text-[10px] font-bold text-[#D97706] bg-[#D97706]/10 px-2 py-0.5 uppercase">
                  Future Tier
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Security and Trust section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-[#E5E5E5] pt-12">
        <div className="flex gap-4">
          <Shield className="w-8 h-8 text-[#D97706] shrink-0" />
          <div>
            <h4 className="text-lg font-serif font-bold text-[#1C1C1E] mb-2">
              Security at the Core
            </h4>
            <p className="text-xs text-[#52525B] leading-relaxed">
              We employ HTTPS transit encryption and AES-256 database encryption at rest. Your
              payment data is handled entirely via secure Stripe/Razorpay compliance
              structures—never stored locally.
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="w-8 h-8 flex items-center justify-center font-bold text-lg font-serif text-[#D97706] shrink-0 bg-[#D97706]/10 border border-[#D97706]/20">
            F
          </div>
          <div>
            <h4 className="text-lg font-serif font-bold text-[#1C1C1E] mb-2">
              The Permanent Open-Source Play
            </h4>
            <p className="text-xs text-[#52525B] leading-relaxed">
              &quot;ReadrSpace is open-source. If this service ever shuts down, you can fork it,
              self-host it, and keep every article, highlight, and vocabulary word you&apos;ve ever
              saved. Your knowledge belongs to you.&quot;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
