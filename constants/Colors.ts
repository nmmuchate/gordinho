// Color palette
export const colors = {
  // Primary colors (60% white, 30% black, 10% orange)
  primary: {
    white: '#FFFFFF',
    black: '#0F172A',
    orange: '#FB923C', // Sun orange
  },
  
  // Secondary colors
  secondary: {
    gray: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
    },
  },
  
  // Status colors
  status: {
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
  
  // Payment specific colors
  payment: {
    positive: '#22C55E', // Green for positive amounts
    negative: '#EF4444', // Red for negative amounts
    pending: '#FB923C', // Orange for pending transactions
  },
  
  // Background variations
  background: {
    primary: '#FFFFFF', // 60% usage
    secondary: '#F8FAFC', // Light gray for contrast
    dark: '#0F172A', // 30% usage
  },
  
  // Text variations
  text: {
    primary: '#0F172A', // 30% usage
    secondary: '#64748B',
    inverse: '#FFFFFF',
  },
  
  // Border colors
  border: {
    light: '#E2E8F0',
    medium: '#CBD5E1',
    dark: '#94A3B8',
  }
};

// Theme configuration
export const theme = {
  // Component specific colors
  components: {
    button: {
      primary: {
        background: colors.primary.orange, // 10% usage
        text: colors.primary.white,
      },
      secondary: {
        background: colors.primary.black,
        text: colors.primary.white,
      },
      tertiary: {
        background: colors.primary.white,
        text: colors.primary.black,
        border: colors.border.light,
      }
    },
    card: {
      background: colors.primary.white,
      border: colors.border.light,
      shadow: 'rgba(15, 23, 42, 0.1)', // Black with opacity
    },
    input: {
      background: colors.secondary.gray[50],
      text: colors.text.primary,
      placeholder: colors.text.secondary,
      border: colors.border.medium,
    },
    tabBar: {
      active: colors.primary.orange,
      inactive: colors.text.secondary,
      background: colors.primary.white,
      border: colors.border.light,
    },
  },
  
  // Typography colors
  typography: {
    heading: colors.text.primary,
    body: colors.text.primary,
    caption: colors.text.secondary,
  },
  
  // Payment specific styling
  payment: {
    amount: {
      positive: colors.payment.positive,
      negative: colors.payment.negative,
      pending: colors.payment.pending,
    },
    status: {
      success: colors.status.success,
      error: colors.status.error,
      warning: colors.status.warning,
      info: colors.status.info,
    },
  },
};