import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, typography, spacing, radius } from '../constants/colors';

export function PlaybookCard({ playbook, progress, onPress }) {
  const totalSteps = playbook.steps.length;
  const completedSteps = progress?.completedSteps?.length || 0;
  const isComplete = completedSteps > 0 && completedSteps === totalSteps;
  const isInProgress = completedSteps > 0 && !isComplete;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`Open playbook: ${playbook.title}`}
    >
      <View style={styles.cardInner}>
        <View style={styles.cardHeader}>
          <Text style={styles.title} numberOfLines={2}>{playbook.title}</Text>
          <Text style={styles.category}>{playbook.category}</Text>
        </View>

        {playbook.description && (
          <Text style={styles.description} numberOfLines={2}>
            {playbook.description}
          </Text>
        )}

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{totalSteps} steps</Text>
          {playbook.duration && (
            <Text style={styles.metaText}>{playbook.duration}</Text>
          )}
          {isInProgress && (
            <Text style={styles.inProgressText}>
              {completedSteps}/{totalSteps}
            </Text>
          )}
          {isComplete && (
            <Text style={styles.completeText}>Completed</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function PlaybookCardMini({ playbook, onPress }) {
  return (
    <TouchableOpacity
      style={styles.miniCard}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`Open playbook: ${playbook.title}`}
    >
      <Text style={styles.miniTitle} numberOfLines={1}>{playbook.title}</Text>
      <Text style={styles.miniCategory}>{playbook.category}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: spacing.sm,
  },
  cardInner: {
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.heading,
    flex: 1,
    marginRight: spacing.sm,
  },
  category: {
    ...typography.caption,
    color: palette.primary,
    backgroundColor: palette.primarySoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    textTransform: 'capitalize',
  },
  description: {
    ...typography.bodySm,
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  metaText: {
    ...typography.caption,
    color: palette.textTertiary,
  },
  inProgressText: {
    ...typography.caption,
    color: palette.accent,
    fontWeight: '600',
  },
  completeText: {
    ...typography.caption,
    color: palette.success,
    fontWeight: '600',
  },
  miniCard: {
    backgroundColor: palette.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.md,
    marginRight: spacing.sm,
  },
  miniTitle: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  miniCategory: {
    ...typography.caption,
    color: palette.textTertiary,
    textTransform: 'capitalize',
  },
});