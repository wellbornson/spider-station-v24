export type Theme = {
  id: number;
  name: string;
  category: string;
  appBg: string;
  panelBg: string;
  border: string;
  textMain: string;
  textAccent: string;
  textHighlight: string;
  button: string;
  glow: string;
  accentRgb?: string;
  previewAccent: string;   // hex for mini-preview cards
  previewBg: string;       // hex for mini-preview background
  // New properties for strict CSS variable isolation
  bgMain: string;
  bgRow: string;
  textMainHex: string;
  accentHex: string;
};

export const THEMES: Theme[] = [
  {
    id: 0, name: 'AI Nexus', category: 'AI / Futuristic',
    appBg: 'bg-[#050b1a]',
    panelBg: 'bg-[#0a162e]/90', border: 'border-cyan-500/50',
    textMain: 'text-white', textAccent: 'text-cyan-400', textHighlight: 'text-cyan-300',
    button: 'bg-cyan-600 hover:bg-cyan-500', glow: 'shadow-[0_0_20px_rgba(34,211,238,0.4)]',
    accentRgb: '34,211,238', previewAccent: '#22d3ee', previewBg: '#050b1a',
    bgMain: '#050b1a', bgRow: 'rgba(10,22,46,0.9)', textMainHex: '#ffffff', accentHex: '#22d3ee'
  },
  {
    id: 1, name: 'Digital Matrix', category: 'Professional',
    appBg: 'bg-black',
    panelBg: 'bg-black/95', border: 'border-green-500/60',
    textMain: 'text-green-50', textAccent: 'text-green-500', textHighlight: 'text-green-300 font-mono',
    button: 'bg-green-900 text-green-400 border border-green-500/50 hover:bg-green-800', glow: 'shadow-[0_0_15px_rgba(34,197,94,0.3)]',
    accentRgb: '34,197,94', previewAccent: '#22c55e', previewBg: '#000000',
    bgMain: '#000000', bgRow: 'rgba(0,0,0,0.95)', textMainHex: '#f0fdf4', accentHex: '#22c55e'
  },
  {
    id: 2, name: 'Cute Pastel', category: 'Professional',
    appBg: 'bg-[#f3f0ff]',
    panelBg: 'bg-white/80', border: 'border-purple-200',
    textMain: 'text-slate-700', textAccent: 'text-purple-500', textHighlight: 'text-emerald-500 font-bold',
    button: 'bg-purple-400 text-white hover:bg-purple-500', glow: 'shadow-[0_4px_12px_rgba(167,139,250,0.2)]',
    accentRgb: '167,139,250', previewAccent: '#a78bfa', previewBg: '#f3f0ff',
    bgMain: '#f3f0ff', bgRow: 'rgba(255,255,255,0.8)', textMainHex: '#334155', accentHex: '#a78bfa'
  },
  {
    id: 3, name: 'Orange-Black (The Beast)', category: 'Neon / Colorful',
    appBg: 'bg-[#0a0a0a]',
    panelBg: 'bg-[#111111]/95', border: 'border-orange-600/70',
    textMain: 'text-orange-50', textAccent: 'text-orange-500', textHighlight: 'text-orange-400 font-black',
    button: 'bg-orange-600 text-black font-bold hover:bg-orange-500', glow: 'shadow-[0_0_25px_rgba(234,88,12,0.5)]',
    accentRgb: '234,88,12', previewAccent: '#ea580c', previewBg: '#0a0a0a',
    bgMain: '#0a0a0a', bgRow: 'rgba(17,17,17,0.95)', textMainHex: '#fff7ed', accentHex: '#ea580c'
  },
  {
    id: 4, name: 'Midnight Stealth', category: 'Professional',
    appBg: 'bg-[#121212]',
    panelBg: 'bg-[#1e1e1e]', border: 'border-white/10',
    textMain: 'text-slate-300', textAccent: 'text-slate-100', textHighlight: 'text-white font-bold',
    button: 'bg-white/10 text-white hover:bg-white/20', glow: 'shadow-[0_0_15px_rgba(255,255,255,0.05)]',
    accentRgb: '255,255,255', previewAccent: '#ffffff', previewBg: '#121212',
    bgMain: '#121212', bgRow: '#1e1e1e', textMainHex: '#cbd5e1', accentHex: '#ffffff'
  },
  {
    id: 5, name: 'Cyber Pink', category: 'Neon / Colorful',
    appBg: 'bg-[#0a000a]',
    panelBg: 'bg-[#1a001a]/95', border: 'border-pink-600/60',
    textMain: 'text-pink-50', textAccent: 'text-pink-500', textHighlight: 'text-white font-black',
    button: 'bg-pink-600 text-white hover:bg-pink-500', glow: 'shadow-[0_0_20px_rgba(219,39,119,0.5)]',
    accentRgb: '219,39,119', previewAccent: '#db2677', previewBg: '#0a000a',
    bgMain: '#0a000a', bgRow: 'rgba(26,0,26,0.95)', textMainHex: '#fdf2f8', accentHex: '#db2677'
  },
  {
    id: 6, name: 'Arctic Frost', category: 'Digital / Glass',
    appBg: 'bg-[#f0f9ff]',
    panelBg: 'bg-white/70', border: 'border-blue-200',
    textMain: 'text-slate-600', textAccent: 'text-blue-500', textHighlight: 'text-sky-600 font-bold',
    button: 'bg-blue-500 text-white hover:bg-blue-600', glow: 'shadow-[0_4px_15px_rgba(59,130,246,0.15)]',
    accentRgb: '59,130,246', previewAccent: '#3b82f6', previewBg: '#f0f9ff',
    bgMain: '#f0f9ff', bgRow: 'rgba(255,255,255,0.7)', textMainHex: '#475569', accentHex: '#3b82f6'
  },
];

export const THEME_CATEGORIES = ['All', 'AI / Futuristic', 'Digital / Glass', 'Neon / Colorful', 'Professional'] as const;
