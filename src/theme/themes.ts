export type UiFlavor =
  | 'minimal'
  | 'skeuomorphic'
  | 'flat'
  | 'glass'
  | 'neon'
  | 'paper'
  | 'high-contrast'
  | 'rounded';

export const builtinThemes: Record<UiFlavor, { vars: Record<string, string>; antToken?: Record<string, any> }> = {
  minimal: { vars: { '--bg': '#ffffff', '--panel-bg': '#f6f6f6', '--text': '#111827', '--muted': '#6b7280', '--accent': '#2563eb', '--shadow': 'rgba(16,24,40,0.06)', '--radius': '6px' }, antToken: { colorPrimary: '#2563eb' } },
  skeuomorphic: { vars: { '--bg': '#efe7dd', '--panel-bg': '#fffaf3', '--text': '#2b2b2b', '--muted': '#6b5a4a', '--accent': '#d97706', '--shadow': 'rgba(0,0,0,0.12)', '--radius': '10px' }, antToken: { colorPrimary: '#d97706' } },
  flat: { vars: { '--bg': '#fafafa', '--panel-bg': '#ffffff', '--text': '#0f172a', '--muted': '#475569', '--accent': '#06b6d4', '--shadow': 'rgba(2,6,23,0.06)', '--radius': '4px' }, antToken: { colorPrimary: '#06b6d4' } },
  glass: { vars: { '--bg': 'linear-gradient(180deg,#f8fafc, #f1f5f9)', '--panel-bg': 'rgba(255,255,255,0.6)', '--text': '#0b1226', '--muted': '#4b5563', '--accent': '#7c3aed', '--shadow': 'rgba(12,18,42,0.08)', '--radius': '8px' }, antToken: { colorPrimary: '#7c3aed' } },
  neon: { vars: { '--bg': '#0b1020', '--panel-bg': '#0f1724', '--text': '#e6eef8', '--muted': '#94a3b8', '--accent': '#ff0080', '--shadow': 'rgba(255,0,128,0.12)', '--radius': '6px' }, antToken: { colorPrimary: '#ff0080' } },
  paper: { vars: { '--bg': '#fbf7ef', '--panel-bg': '#fffdf6', '--text': '#2f2f2f', '--muted': '#7b6f5a', '--accent': '#0ea5a4', '--shadow': 'rgba(0,0,0,0.04)', '--radius': '2px' }, antToken: { colorPrimary: '#0ea5a4' } },
  'high-contrast': { vars: { '--bg': '#000000', '--panel-bg': '#0b0b0b', '--text': '#ffffff', '--muted': '#d1d5db', '--accent': '#f59e0b', '--shadow': 'rgba(255,255,255,0.04)', '--radius': '4px' }, antToken: { colorPrimary: '#f59e0b' } },
  rounded: { vars: { '--bg': '#f7fbff', '--panel-bg': '#ffffff', '--text': '#0f172a', '--muted': '#6b7280', '--accent': '#3b82f6', '--shadow': 'rgba(59,130,246,0.06)', '--radius': '16px' }, antToken: { colorPrimary: '#3b82f6' } }
};
