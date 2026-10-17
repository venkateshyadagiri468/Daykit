import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { PlaybookCard } from '../components/PlaybookCard';
import { palette, typography, spacing, radius } from '../constants/colors';
import { loadFavorites, loadAllPlaybooks } from '../storage/storage';
import { useNavigation } from '@react-navigation/native';

export function FavoritesScreen() {
  const [favorites, setFavorites] = useState([]);
  const [favoritePlaybooks, setFavoritePlaybooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [favs, allPlaybooks] = await Promise.all([
        loadFavorites(),
        loadAllPlaybooks(),
      ]);
      setFavorites(favs);

      // Get full playbook data for favorites
      const favoriteData = allPlaybooks.filter(pb => favs.includes(pb.id));
      setFavoritePlaybooks(favoriteData);
    } finally {
      setLoading(false);
    }
  };

  const renderEmptyState = () => {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="heart-outline" size={64} color={palette.textTertiary} />
        <Text style={styles.emptyTitle}>No favorites yet</Text>
        <Text style={styles.emptySubtitle}>
          Save your most-used playbooks for quick access
        </Text>
        <Button
          title="Browse playbooks"
          onPress={() => navigation.navigate('Browse')}
          variant="primary"
          style={styles.browseButton}
        />
      </View>
    );
  };

  const renderFavoriteItem = ({ item }) => (
    <PlaybookCard
      playbook={item}
      progress={null}
      onPress={() => navigation.navigate('PlaybookDetail', { playbookId: item.id })}
    />
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={palette.primary} />
        </View>
      ) : favoritePlaybooks.length > 0 ? (
        <FlatList
          data={favoritePlaybooks}
          renderItem={renderFavoriteItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        renderEmptyState()
      )}
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
  listContainer: {
    padding: spacing.md,
    paddingTop: spacing.lg,
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
  browseButton: {
    minWidth: 160,
  },
});