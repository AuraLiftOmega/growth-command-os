import { create } from 'zustand';

interface AriesState {
  isActive: boolean;
  activatedAt: Date | null;
  demoPhase: 'idle' | 'authority' | 'replacement' | 'intelligence' | 'scale' | 'close';
  residualCue: 'pending_automation' | 'paused_execution' | 'muted_delta' | null;
  
  // HIGH-TICKET CLOSE VARIANT™
  isHighTicketActive: boolean;
  highTicketActivatedAt: Date | null;
  closePhase: 'idle' | 'collapse' | 'cost' | 'certainty' | 'activation';
  opportunityCostAccumulated: number;
  
  // Actions
  activate: () => void;
  deactivate: () => void;
  toggle: () => void;
  setDemoPhase: (phase: AriesState['demoPhase']) => void;
  setResidualCue: (cue: AriesState['residualCue']) => void;
  
  // High-Ticket Actions
  activateHighTicket: () => void;
  deactivateHighTicket: () => void;
  toggleHighTicket: () => void;
  setClosePhase: (phase: AriesState['closePhase']) => void;
  incrementOpportunityCost: (amount: number) => void;
}

export const useAriesStore = create<AriesState>((set, get) => ({
  isActive: false,
  activatedAt: null,
  demoPhase: 'idle',
  residualCue: null,
  
  // High-Ticket state
  isHighTicketActive: false,
  highTicketActivatedAt: null,
  closePhase: 'idle',
  opportunityCostAccumulated: 0,

  activate: () => set({ 
    isActive: true, 
    activatedAt: new Date(),
    demoPhase: 'authority',
    residualCue: null 
  }),
  
  deactivate: () => {
    const cues: AriesState['residualCue'][] = ['pending_automation', 'paused_execution', 'muted_delta'];
    const randomCue = cues[Math.floor(Math.random() * cues.length)];
    set({ 
      isActive: false, 
      demoPhase: 'idle',
      residualCue: randomCue 
    });
  },
  
  toggle: () => {
    const { isActive, activate, deactivate } = get();
    if (isActive) {
      deactivate();
    } else {
      activate();
    }
  },
  
  setDemoPhase: (phase) => set({ demoPhase: phase }),
  setResidualCue: (cue) => set({ residualCue: cue }),
  
  // High-Ticket Close Actions
  activateHighTicket: () => set({
    isHighTicketActive: true,
    highTicketActivatedAt: new Date(),
    closePhase: 'collapse',
    opportunityCostAccumulated: 0,
  }),
  
  deactivateHighTicket: () => set({
    isHighTicketActive: false,
    closePhase: 'idle',
  }),
  
  toggleHighTicket: () => {
    const { isHighTicketActive, activateHighTicket, deactivateHighTicket } = get();
    if (isHighTicketActive) {
      deactivateHighTicket();
    } else {
      activateHighTicket();
    }
  },
  
  setClosePhase: (phase) => set({ closePhase: phase }),
  incrementOpportunityCost: (amount) => set((state) => ({
    opportunityCostAccumulated: state.opportunityCostAccumulated + amount
  })),
}));

// Language transformation utilities for Aries Mode
export const ariesLanguage = {
  transform: (text: string): string => {
    const replacements: [RegExp, string][] = [
      [/you can choose to/gi, 'the system executes'],
      [/here's an option/gi, 'this replaces'],
      [/we help you/gi, 'the system eliminates'],
      [/you might want to/gi, 'the system has already'],
      [/consider/gi, 'observe'],
      [/try/gi, 'deploy'],
      [/maybe/gi, 'precisely'],
      [/option/gi, 'execution path'],
      [/feature/gi, 'capability'],
      [/tool/gi, 'infrastructure'],
      [/help/gi, 'replace'],
      [/assist/gi, 'execute'],
      [/support/gi, 'operate'],
    ];
    
    let result = text;
    replacements.forEach(([pattern, replacement]) => {
      result = result.replace(pattern, replacement);
    });
    return result;
  },
  
  phaseHeadlines: {
    idle: 'System Standing By',
    authority: 'Autonomous Operations Active',
    replacement: 'Labor Elimination in Progress',
    intelligence: 'Compounding Intelligence Engaged',
    scale: 'Infinite Scale Protocol Active',
    close: 'Execution Awaiting Authorization',
  },
  
  preemptiveProof: [
    { objection: 'cost', proof: 'Agency replacement: 73% cost reduction observed' },
    { objection: 'time', proof: 'Execution velocity: 47x faster than manual teams' },
    { objection: 'quality', proof: 'Quality gate: 94.2% first-pass approval rate' },
    { objection: 'scale', proof: 'Current capacity: unlimited concurrent operations' },
    { objection: 'learning', proof: 'Intelligence compounds: +12% efficiency per cycle' },
  ],
};

// HIGH-TICKET CLOSE language and objection neutralization
export const highTicketLanguage = {
  objectionNeutralizers: [
    { 
      objection: "We need to think about it",
      neutralizer: "147 operators evaluated. Average decision time: 23 minutes.",
      subtext: "Extended evaluation correlates with delayed ROI"
    },
    { 
      objection: "We want to compare",
      neutralizer: "Comparison complete: Agencies = labor. Tools = work. DOMINION = infrastructure.",
      subtext: "No comparable system exists"
    },
    { 
      objection: "We need internal buy-in",
      neutralizer: "System operates autonomously. No internal adoption required.",
      subtext: "Buy-in is a labor problem. This eliminates labor."
    },
    { 
      objection: "The price is high",
      neutralizer: "Current monthly burn: ~$52,200 in labor costs.",
      subtext: "Price is a line item. Cost is what you remove."
    },
    { 
      objection: "We'll decide later",
      neutralizer: "Opportunity cost since evaluation: accumulating.",
      subtext: "Delay is a decision. It compounds against you."
    },
  ],
  
  authorityTransfer: [
    "Activation grants control of an already-working system",
    "This is not a purchase. This is access.",
    "The system is running. You are deciding to enter.",
    "Execution begins immediately upon authorization",
  ],
  
  closePhrases: [
    "Ready for activation",
    "First autonomous action: pending your authorization",
    "System initialization: awaiting command",
    "Execution timeline: immediate",
  ],
};
