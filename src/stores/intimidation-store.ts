import { create } from 'zustand';

interface IntimidationState {
  isActive: boolean;
  activatedAt: Date | null;
  demoPhase: 'idle' | 'authority' | 'replacement' | 'intelligence' | 'scale' | 'close';
  residualCue: 'pending_automation' | 'paused_execution' | 'muted_delta' | null;
  
  // Actions
  activate: () => void;
  deactivate: () => void;
  toggle: () => void;
  setDemoPhase: (phase: IntimidationState['demoPhase']) => void;
  setResidualCue: (cue: IntimidationState['residualCue']) => void;
}

export const useIntimidationStore = create<IntimidationState>((set, get) => ({
  isActive: false,
  activatedAt: null,
  demoPhase: 'idle',
  residualCue: null,

  activate: () => set({ 
    isActive: true, 
    activatedAt: new Date(),
    demoPhase: 'authority',
    residualCue: null 
  }),
  
  deactivate: () => {
    // Set residual cue on exit for psychological residue
    const cues: IntimidationState['residualCue'][] = ['pending_automation', 'paused_execution', 'muted_delta'];
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
}));

// Language transformation utilities for Intimidation Mode
export const intimidationLanguage = {
  // Transform friendly language to dominant language
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
  
  // Demo phase headlines
  phaseHeadlines: {
    idle: 'System Standing By',
    authority: 'Autonomous Operations Active',
    replacement: 'Labor Elimination in Progress',
    intelligence: 'Compounding Intelligence Engaged',
    scale: 'Infinite Scale Protocol Active',
    close: 'Execution Awaiting Authorization',
  },
  
  // Preemptive objection answers
  preemptiveProof: [
    { objection: 'cost', proof: 'Agency replacement: 73% cost reduction observed' },
    { objection: 'time', proof: 'Execution velocity: 47x faster than manual teams' },
    { objection: 'quality', proof: 'Quality gate: 94.2% first-pass approval rate' },
    { objection: 'scale', proof: 'Current capacity: unlimited concurrent operations' },
    { objection: 'learning', proof: 'Intelligence compounds: +12% efficiency per cycle' },
  ],
};
