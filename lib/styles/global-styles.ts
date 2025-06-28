/**
 * Common style combinations for frequently used layout patterns
 * These can be spread into StyleSheet objects or used directly
 */
export const globalStyles = {
  // Flex layouts
  flexColumn: {
    flexDirection: 'column' as const,
  },
  flexRow: {
    flexDirection: 'row' as const,
  },
  flex1: {
    flex: 1,
  },
  flexGrow: {
    flexGrow: 1,
  },
  flexShrink: {
    flexShrink: 1,
  },

  // Centering
  justifyCenter: {
    justifyContent: 'center' as const,
  },
  alignCenter: {
    alignItems: 'center' as const,
  },
  center: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  centerContent: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },

  // Alignment
  justifyStart: {
    justifyContent: 'flex-start' as const,
  },
  justifyEnd: {
    justifyContent: 'flex-end' as const,
  },
  justifyBetween: {
    justifyContent: 'space-between' as const,
  },
  justifyAround: {
    justifyContent: 'space-around' as const,
  },
  justifyEvenly: {
    justifyContent: 'space-evenly' as const,
  },

  alignStart: {
    alignItems: 'flex-start' as const,
  },
  alignEnd: {
    alignItems: 'flex-end' as const,
  },
  alignStretch: {
    alignItems: 'stretch' as const,
  },
  alignBaseline: {
    alignItems: 'baseline' as const,
  },

  // Text alignment
  textCenter: {
    textAlign: 'center' as const,
  },
  textLeft: {
    textAlign: 'left' as const,
  },
  textRight: {
    textAlign: 'right' as const,
  },

  // Position
  absolute: {
    position: 'absolute' as const,
  },
  relative: {
    position: 'relative' as const,
  },
  absoluteFill: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  // Common layouts
  rowCenter: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  columnCenter: {
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
  },
  rowBetween: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  rowAround: {
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as const,
    alignItems: 'center' as const,
  },

  // Overflow
  overflowHidden: {
    overflow: 'hidden' as const,
  },
  overflowScroll: {
    overflow: 'scroll' as const,
  },

  // Common button styles
  buttonBase: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  // Common card styles
  cardBase: {
    flexDirection: 'column' as const,
    overflow: 'hidden' as const,
  },

  // Common input styles
  inputBase: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },

  // Common list styles
  listBase: {
    flexDirection: 'column' as const,
  },
  listItemBase: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },

  // Common modal styles
  modalOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },

  // Common header styles
  headerBase: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },

  // Common footer styles
  footerBase: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  debug: {
    borderWidth: 1,
    borderColor: 'red',
  },
} as const;

export type CommonStyleKey = keyof typeof globalStyles;
