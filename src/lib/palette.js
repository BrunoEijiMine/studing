// Paleta "gelo" validada (dataviz skill, OKLCH, superfície #1a1a19) — ordem fixa,
// não gerar/ciclar hues. Só famílias frias (azul/ciano/índigo/violeta), sem
// verde/amarelo/laranja/vermelho. Pior par adjacente: ΔE CVD 15.0 (deutan,
// meta ≥8), ΔE visão normal 15.8 (piso ≥15).
export const CATEGORICAL_DARK = [
  '#0060cf', // blue
  '#00a5bd', // cyan
  '#5f4dd5', // indigo
  '#009ee8', // sky
  '#00a787', // teal
  '#557df1', // periwinkle
]

export const STATUS = {
  good: '#0ca30c',
  critical: '#d03b3b',
}

export const CHART = {
  surface: '#1a1a19',
  gridline: '#2c2c2a',
  baseline: '#383835',
  textPrimary: '#ffffff',
  textSecondary: '#c3c2b7',
  textMuted: '#898781',
  other: '#52514e',
}
