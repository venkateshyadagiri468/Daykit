import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { PlaybookCard } from '../components/PlaybookCard';
import { SectionHeader } from '../components/SectionHeader';
import { palette, typography, spacing, radius } from '../constants/colors';
import { CATEGORIES, CATEGORY_LABELS } from '../data/starterPlaybooks';
import { loadAllPlaybooks, loadPlaybookProgress, loadFavorites } from '../storage/storage';
import { useNavigation } from '@react-navigation/native';

export function BrowseScreen({ route }) {
  const [playbooks, setPlaybooks] = useState([]);
  const [filteredPlaybooks, setFilteredPlaybooks] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(route.params?.category || 'all');
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterPlaybooks();
  }, [playbooks, searchQuery, selectedCategory]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allPlaybooks, favs] = await Promise.all([
        loadAllPlaybooks(),
        loadFavorites(),
      ]);
      setPlaybooks(allPlaybooks);
      setFavorites(favs);
    } finally {
      setLoading(false);
    }
  };

  const filterPlaybooks = () => {
    let filtered = [...playbooks];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(pb => pb.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(pb => {
        return (
          pb.title.toLowerCase().includes(query) ||
          pb.description?.toLowerCase().includes(query) ||
          pb.steps.some(step => step.toLowerCase().includes(query))
        );
      });
    }

    setFilteredPlaybooks(filtered);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
  };

  const hasActiveFilters = searchQuery.trim() || selectedCategory !== 'all';

  const renderEmptyState = () => {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search-outline" size={64} color={palette.textTertiary} />
        <Text style={styles.emptyTitle}>No playbooks found</Text>
        <Text style={styles.emptySubtitle}>
          {hasActiveFilters
            ? 'Try different search terms or clear your filters'
            : 'Try creating a playbook or check other categories'}
        </Text>
        {hasActiveFilters && (
          <Button
            title="Clear filters"
            onPress={clearFilters}
            variant="secondary"
            style={styles.clearButton}
          />
        )}
      </View>
    );
  };

  const renderCategoryTabs = () => {
    return (
      <View style={styles.categoryTabsContainer}>
        {CATEGORIES.map(category => {
          if (category.id === 'all') return null;

          const isSelected = selectedCategory === category.id;
          return (
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryTab, isSelected && styles.categoryTabSelected]}
              onPress={() => setSelectedCategory(category.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              <Text style={[styles.categoryTabText, isSelected && styles.categoryTabTextSelected]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={palette.textTertiary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search playbooks..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={palette.textTertiary}
            accessibilityLabel="Search playbooks"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} accessibilityLabel="Clear search">
              <Ionicons name="close" size={20} color={palette.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Tabs */}
      {renderCategoryTabs()}

      {/* Active Filters */}
      {hasActiveFilters && (
        <View style={styles.filtersContainer}>
          {selectedCategory !== 'all' && (
            <View style={styles.filterTag}>
              <Text style={styles.filterTagText}>Category: {CATEGORY_LABELS[selectedCategory]}</Text>
              <TouchableOpacity onPress={() => setSelectedCategory('all')}>
                <Ionicons name="close" size={16} color={palette.textPrimary} />
              </TouchableOpacity>
            </View>
          )}
          {searchQuery.trim() && (
            <View style={styles.filterTag}>
              <Text style={styles.filterTagText}>Search: {searchQuery}</Text>
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close" size={16} color={palette.textPrimary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredPlaybooks.length} {filteredPlaybooks.length === 1 ? 'playbook' : 'playbooks'}
        </Text>
      </View>

      {/* Playbooks List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Ionicons name="hourglass-outline" size={32} color={palette.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredPlaybooks}
          renderItem={({ item }) => (
            <PlaybookCard
              playbook={item}
              progress={null}
              onPress={() => navigation.navigate('PlaybookDetail', { playbookId: item.id })}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  searchContainer: {
    padding: spacing.md,
    paddingTop: spacing.lg,
    backgroundColor: palette.background,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    ...typography.body,
    color: palette.textPrimary,
  },
  categoryTabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  categoryTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.lg,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  categoryTabSelected: {
    backgroundColor: palette.primarySoft,
    borderColor: palette.primary,
  },
  categoryTabText: {
    ...typography.bodySm,
    color: palette.textSecondary,
  },
  categoryTabTextSelected: {
    color: palette.primary,
    fontWeight: '600',
  },
  filtersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  filterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.accentSoft,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  filterTagText: {
    ...typography.bodySm,
    color: palette.accent,
    fontWeight: '600',
  },
  resultsHeader: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  resultsCount: {
    ...typography.bodySm,
    color: palette.textSecondary,
  },
  listContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    marginTop: spacing.xl,
  },
  emptyTitle: {
    ...typography.heading,
    color: palette.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.bodySm,
    color: palette.textTertiary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  clearButton: {
    minWidth: 120,
  },
});