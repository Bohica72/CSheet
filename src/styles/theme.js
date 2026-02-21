export const colors = {
  // Backgrounds
  background:   '#1e2326',
  surface:      '#2e383c',
  surfaceAlt:   '#384b55',
  surfaceDeep:  '#2e383c',
  surfaceDeep2: '#3c4841',

  // Accent
  accent:       '#2e383c',
  accentDim:    '#7a1020',
  accentSoft:   '#d3c6aa',

  // Text
  textPrimary:  '#d3c6aa',
  textMuted:    '#888888',
  textDisabled: '#444444',

  // Special
  gold:         '#9da9a0',
  success:      '#4caf50',
  warning:      '#ff9800',

  // Rarity colours
  rarity: {
    common:    '#aaaaaa',
    uncommon:  '#4caf50',
    rare:      '#4fc3f7',
    veryrare:  '#b44fc3',
    legendary: '#f0c040',
    artifact:  '#c41e3a',
  },

  // Ability colours
  ability: {
    str: '#e67e80',
    dex: '#7fbbb3',
    con: '#dbbc7f',
    int: '#9da9a0',
    wis: '#b44fc3',
    cha: '#f0c040',
  },
};

export const spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  24,
  xxl: 32,
};

export const radius = {
  sm:   6,
  md:   10,
  lg:   16,
  full: 999,
};

export const typography = {
  label:    { fontSize: 10, color: colors.textMuted,    letterSpacing: 0.5 },
  body:     { fontSize: 13, color: colors.textPrimary,  lineHeight: 20 },
  bodyBold: { fontSize: 13, color: colors.textPrimary,  fontWeight: 'bold' },
  subtitle: { fontSize: 12, color: colors.textMuted },
  heading:  { fontSize: 18, color: colors.textPrimary,  fontWeight: 'bold' },
  value:    { fontSize: 22, color: colors.textPrimary,  fontWeight: 'bold' },
  valueSm:  { fontSize: 16, color: colors.textPrimary,  fontWeight: 'bold' },
  accent:   { fontSize: 13, color: colors.accentSoft },
};

export const shadows = {
  cardV: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
};

// Shared reusable component styles
export const sharedStyles = {
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadows.card,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceDeep,
    marginVertical: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    padding: spacing.xl,
    width: '85%',
  },
  modalTitle: {
    ...typography.heading,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surfaceDeep,
    color: colors.textPrimary,
    borderRadius: radius.sm,
    padding: spacing.sm,
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    padding: spacing.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.textPrimary,
    fontWeight: 'bold',
    fontSize: 15,
  },
  cancelText: {
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
};
