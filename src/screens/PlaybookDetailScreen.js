import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { palette, typography, spacing, radius } from '../constants/colors';
import { loadAllPlaybooks, loadPlaybookProgress, savePlaybookProgress, loadFavorites, toggleFavorite } from '../storage/storage';
import { useNavigation, useRoute } from '@react-navigation/native';

export function PlaybookDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { playbookId } = route.params || {};

  const [playbook, setPlaybook] = useState(null);
  const [progress, setProgress] = useState({ completedSteps: [] });
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingFavorite, setTogglingFavorite] = useState(false);

  useEffect(() => {
    loadData();
  }, [playbookId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allPlaybooks, favs, playbookProgress] = await Promise.all([
        loadAllPlaybooks(),
        loadFavorites(),
        loadPlaybookProgress(playbookId),
      ]);
      const currentPlaybook = allPlaybooks.find(pb => pb.id === playbookId);
      setPlaybook(currentPlaybook);
      setProgress(playbookProgress);
      setFavorites(favs);
    } finally {
      setLoading(false);
    }
  };

  const toggleStepCompletion = async (stepIndex) => {
    const newCompletedSteps = [...progress.completedSteps];
    const stepIndexInArray = newCompletedSteps.indexOf(stepIndex);

    if (stepIndexInArray > -1) {
      newCompletedSteps.splice(stepIndexInArray, 1);
    } else {
      newCompletedSteps.push(stepIndex);
    }

    const updatedProgress = { completedSteps: newCompletedSteps };
    setProgress(updatedProgress);
    await savePlaybookProgress(playbookId, updatedProgress);

    // Add to recent activity
    await import('../storage/storage').then(storage => storage.addRecentPlaybook(playbookId));
  };

  const resetProgress = async () => {
    await savePlaybookProgress(playbookId, { completedSteps: [] });
    setProgress({ completedSteps: [] });
  };

  const handleFavoriteToggle = async () => {
    setTogglingFavorite(true);
    try {
      const updatedFavorites = await toggleFavorite(playbookId);
      setFavorites(updatedFavorites);
    } finally {
      setTogglingFavorite(false);
    }
  };

  const isFavorite = favorites.includes(playbookId);
  const isComplete = progress.completedSteps.length === playbook?.steps.length;
  const isInProgress = progress.completedSteps.length > 0 && !isComplete;

  const renderStepItem = ({ item, index }) => {
    const isCompleted = progress.completedSteps.includes(index);

    return (
      <View style={[styles.stepItem, isCompleted && styles.stepItemCompleted]}>
        <TouchableOpacity
          style={[styles.stepCheckbox, isCompleted && styles.stepCheckboxCompleted]}
          onPress={() => toggleStepCompletion(index)}
          activeOpacity={0.7}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isCompleted }}
          accessibilityLabel={`${item} - ${isCompleted ? 'completed' : 'not completed'}`}
        >
          {isCompleted && (
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          )}
        </TouchableOpacity>

        <View style={styles.stepContent}>
          <Text style={[styles.stepText, isCompleted && styles.stepTextCompleted]}>
            {item}
          </Text>
        </View>
      </View>
    );
  };

  if (loading || !playbook) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={palette.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={palette.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.title} numberOfLines={1}>
            {playbook.title}
          </Text>
          <Text style={styles.category} numberOfLines={1}>
            {playbook.category}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleFavoriteToggle}
          disabled={togglingFavorite}
          accessibilityRole="button"
          accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? palette.danger : palette.textPrimary}
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Description and metadata */}
        <View style={styles.metaContainer}>
          {playbook.description && (
            <Text style={styles.description}>{playbook.description}</Text>
          )}

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="list" size={16} color={palette.textTertiary} />
              <Text style={styles.metaText}>{playbook.steps.length} steps</Text>
            </View>

            {playbook.duration && (
              <View style={styles.metaItem}>
                <Ionicons name="time" size={16} color={palette.textTertiary} />
                <Text style={styles.metaText}>{playbook.duration}</Text>
              </View>
            )}

            {isComplete && (
              <View style={styles.completeBadge}>
                <Ionicons name="checkmark-circle" size={16} color={palette.success} />
                <Text style={styles.completeBadgeText}>Complete</Text>
              </View>
            )}

            {isInProgress && (
              <View style={styles.inProgressBadge}>
                <Ionicons name="hourglass" size={16} color={palette.accent} />
                <Text style={styles.inProgressBadgeText}>In Progress</Text>
              </View>
            )}
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarContainer}>
            <View
              style={[styles.progressBar, { width: `${(progress.completedSteps.length / playbook.steps.length) * 100}%` }]}
            />
          </View>
          <Text style={styles.progressText}>
            {progress.completedSteps.length} of {playbook.steps.length} completed
          </Text>
        </View>

        {/* Steps List */}
        <Text style={styles.stepsTitle}>Steps</Text>
        <FlatList
          data={playbook.steps}
          renderItem={renderStepItem}
          keyExtractor={(item, index) => index.toString()}
          style={styles.stepsList}
          showsVerticalScrollIndicator={false}
        />

        {/* Actions */}
        <View style={styles.actionsContainer}>
          {isComplete && (
            <View style={styles.completionContainer}>
              <Ionicons name="trophy" size={32} color={palette.success} />
              <Text style={styles.completionText}>Great job! All steps completed.</Text>
            </View>
          )}

          <View style={styles.actionButtonsRow}>
            <Button
              title="Reset Progress"
              onPress={resetProgress}
              variant="secondary"
              style={styles.actionButton}
              disabled={progress.completedSteps.length === 0}
            />

            <Button
              title="Start Over"
              onPress={resetProgress}
              variant="primary"
              style={styles.actionButton}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingTop: spacing.lg,
    backgroundColor: palette.surface,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    ...typography.title,
  },
  category: {
    ...typography.bodySm,
    color: palette.primary,
    textTransform: 'capitalize',
    marginTop: spacing.xs / 2,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  metaContainer: {
    marginBottom: spacing.lg,
  },
  description: {
    ...typography.body,
    color: palette.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 24,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    ...typography.bodySm,
    color: palette.textTertiary,
  },
  completeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: palette.success + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  completeBadgeText: {
    ...typography.bodySm,
    color: palette.success,
    fontWeight: '600',
  },
  inProgressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: palette.accentSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  inProgressBadgeText: {
    ...typography.bodySm,
    color: palette.accent,
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: spacing.xl,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: palette.surfaceAlt,
    borderRadius: radius.sm,
    marginBottom: spacing.xs,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: palette.primary,
    borderRadius: radius.sm,
  },
  progressText: {
    ...typography.bodySm,
    color: palette.textSecondary,
    textAlign: 'center',
  },
  stepsTitle: {
    ...typography.heading,
    marginBottom: spacing.md,
  },
  stepsList: {
    marginBottom: spacing.xl,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  stepItemCompleted: {
    backgroundColor: palette.success + '10',
    borderColor: palette.success + '30',
  },
  stepCheckbox: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: palette.borderStrong,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  stepCheckboxCompleted: {
    backgroundColor: palette.success,
    borderColor: palette.success,
  },
  stepContent: {
    flex: 1,
  },
  stepText: {
    ...typography.body,
    color: palette.textPrimary,
  },
  stepTextCompleted: {
    textDecorationLine: 'line-through',
    color: palette.textTertiary,
  },
  actionsContainer: {
    marginTop: spacing.lg,
  },
  completionContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: palette.success + '10',
    borderRadius: radius.md,
  },
  completionText: {
    ...typography.body,
    color: palette.success,
    fontWeight: '600',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});