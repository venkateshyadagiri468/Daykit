import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { SectionHeader } from '../components/SectionHeader';
import { palette, typography, spacing, radius } from '../constants/colors';
import { CATEGORIES, CATEGORY_LABELS } from '../data/starterPlaybooks';
import { saveCustomPlaybook } from '../storage/storage';
import { useNavigation } from '@react-navigation/native';

export function CreateScreen() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('work');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [steps, setSteps] = useState(['']);
  const [stepToDelete, setStepToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigation = useNavigation();

  const generatePlaybookId = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please provide a title for the playbook');
      return false;
    }

    const validSteps = steps.filter(step => step.trim());
    if (validSteps.length === 0) {
      Alert.alert('Validation Error', 'Please provide at least one step');
      return false;
    }

    return true;
  };

  const handleCreatePlaybook = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const validSteps = steps.filter(step => step.trim());
      const playbookId = generatePlaybookId(title);

      const newPlaybook = {
        id: playbookId,
        title: title.trim(),
        category,
        description: description.trim() || null,
        duration: duration.trim() || null,
        steps: validSteps,
      };

      await saveCustomPlaybook(newPlaybook);

      Alert.alert(
        'Success',
        'Your playbook has been created successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create playbook. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addStep = () => {
    setSteps([...steps, '']);
  };

  const updateStep = (index, value) => {
    const updatedSteps = [...steps];
    updatedSteps[index] = value;
    setSteps(updatedSteps);
  };

  const removeStep = (index) => {
    const updatedSteps = steps.filter((_, i) => i !== index);
    setSteps(updatedSteps);
    if (stepToDelete === index) {
      setStepToDelete(null);
    }
  };

  const handleStepFocus = (index) => {
    setStepToDelete(index);
  };

  const handleStepBlur = () => {
    setTimeout(() => setStepToDelete(null), 100);
  };

  const renderStepInput = ({ item, index }) => {
    return (
      <View style={styles.stepInputContainer}>
        <View style={styles.stepNumberContainer}>
          <Text style={styles.stepNumber}>{index + 1}</Text>
        </View>

        <TextInput
          style={styles.stepInput}
          value={item}
          onChangeText={text => updateStep(index, text)}
          placeholder={`Step ${index + 1}`}
          placeholderTextColor={palette.textTertiary}
          multiline
          onFocus={() => handleStepFocus(index)}
          onBlur={handleStepBlur}
          accessibilityLabel={`Step ${index + 1}`}
        />

        {steps.length > 1 && (
          <TouchableOpacity
            style={styles.removeStepButton}
            onPress={() => removeStep(index)}
            accessibilityRole="button"
            accessibilityLabel={`Remove step ${index + 1}`}
          >
            <Ionicons name="trash-outline" size={20} color={palette.danger} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={palette.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Create New Playbook</Text>

        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        <SectionHeader title="Basic Information" />

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter playbook title"
            placeholderTextColor={palette.textTertiary}
            maxLength={50}
            accessibilityLabel="Playbook title"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categorySelector}>
            {Object.entries(CATEGORY_LABELS).map(([key, value]) => (
              <TouchableOpacity
                key={key}
                style={[styles.categoryOption, category === key && styles.categoryOptionSelected]}
                onPress={() => setCategory(key)}
                accessibilityRole="button"
                accessibilityState={{ selected: category === key }}
                accessibilityLabel={`Category ${value}`}
              >
                <Text
                  style={[styles.categoryOptionText, category === key && styles.categoryOptionTextSelected]}
                >
                  {value}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter a brief description (optional)"
            placeholderTextColor={palette.textTertiary}
            multiline
            numberOfLines={3}
            maxLength={200}
            accessibilityLabel="Description"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Duration (Optional)</Text>
          <TextInput
            style={styles.input}
            value={duration}
            onChangeText={setDuration}
            placeholder="e.g., 15 min, 30 min, 1 hour"
            placeholderTextColor={palette.textTertiary}
            maxLength={30}
            accessibilityLabel="Duration"
          />
        </View>

        <SectionHeader title="Steps" actionLabel="Add Step" onAction={addStep} />

        <FlatList
          data={steps}
          renderItem={renderStepInput}
          keyExtractor={(item, index) => index.toString()}
          style={styles.stepsList}
          showsVerticalScrollIndicator={false}
        />

        <Button
          title="Create Playbook"
          onPress={handleCreatePlaybook}
          variant="primary"
          size="lg"
          disabled={isSubmitting}
          style={styles.createButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  },
  headerTitle: {
    ...typography.title,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.md,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.sm,
    color: palette.textPrimary,
  },
  input: {
    backgroundColor: palette.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
    color: palette.textPrimary,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: spacing.sm,
  },
  categorySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  categoryOptionSelected: {
    backgroundColor: palette.primarySoft,
    borderColor: palette.primary,
  },
  categoryOptionText: {
    ...typography.bodySm,
    color: palette.textSecondary,
  },
  categoryOptionTextSelected: {
    color: palette.primary,
    fontWeight: '600',
  },
  stepsList: {
    marginBottom: spacing.lg,
  },
  stepInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: palette.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  stepNumberContainer: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: palette.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    marginTop: spacing.xs,
  },
  stepNumber: {
    ...typography.bodySm,
    color: palette.primary,
    fontWeight: '600',
  },
  stepInput: {
    flex: 1,
    minHeight: 40,
    ...typography.body,
    color: palette.textPrimary,
  },
  removeStepButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  createButton: {
    marginTop: spacing.lg,
  },
});
