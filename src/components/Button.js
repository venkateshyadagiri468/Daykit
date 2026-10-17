import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { palette, typography, spacing, radius } from '../constants/colors';

export function Button({ title, onPress, variant = 'primary', size = 'md', disabled = false, style }) {
  const baseStyle = [styles.button, styles[variant], styles[size], disabled && styles.disabled, style];
  const textStyle = [styles.buttonText, styles[`${variant}Text`], disabled && styles.disabledText];

  return (
    <TouchableOpacity
      style={baseStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: palette.primary,
  },
  secondary: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.borderStrong,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  accent: {
    backgroundColor: palette.accent,
  },
  md: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  sm: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  lg: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    ...typography.button,
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: palette.textPrimary,
  },
  ghostText: {
    color: palette.primary,
  },
  accentText: {
    color: '#FFFFFF',
  },
  disabledText: {
    opacity: 0.7,
  },
});