import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { typography, spacing, palette } from '../constants/colors';

export function SectionHeader({ title, actionLabel, onAction }) {
  const Container = actionLabel && onAction ? TouchableOpacity : View;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity onPress={onAction} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel={actionLabel}>
          <Text style={styles.action}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  title: {
    ...typography.heading,
  },
  action: {
    ...typography.bodySm,
    color: palette.primary,
  },
});