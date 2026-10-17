import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PlaybookCardMini, PlaybookCard } from '../components/PlaybookCard';
import { SectionHeader } from '../components/SectionHeader';
import { palette, typography, spacing, radius } from '../constants/colors';
import { loadRecentActivity, loadAllPlaybooks, loadFavorites, loadPlaybookProgress } from '../storage/storage';
import { useNavigation, useIsFocused } from '@react-navigation/native';

export function TodayScreen() {
  const [greeting, setGreeting] = useState('');
  const [date, setDate] = useState('');
  const [recentPlaybookObjects, setRecentPlaybookObjects] = useState([]);
  const [favoritePlaybookObjects, setFavoritePlaybookObjects] = useState([]);
  const [suggestedPlaybooks, setSuggestedPlaybooks] = useState([]);
  const [inProgressPlaybook, setInProgressPlaybook] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation();
  const isFocused = useIsFocused();

  useEffect(() => {
    const now = new Date();
    const hours = now.getHours();
    if (hours < 12) setGreeting('Good morning');
    else if (hours < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
    setDate(now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));
  }, []);

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allPlaybooks, favs, recentIds] = await Promise.all([
        loadAllPlaybooks(),
        loadFavorites(),
        loadRecentActivity(),
      ]);

      // Map recent IDs to playbook objects
      const recentList = recentIds
        .map(id => allPlaybooks.find(pb => pb.id === id))
        .filter(Boolean);
      setRecentPlaybookObjects(recentList);

      // Map favorite IDs to playbook objects
      const favList = favs
        .map(id => allPlaybooks.find(pb => pb.id === id))
        .filter(Boolean);
      setFavoritePlaybookObjects(favList);

      // Check for an in-progress playbook from recent list
      let foundInProgress = null;
      for (const pb of recentList) {
        const prog = await loadPlaybookProgress(pb.id);
        if (prog && prog.completedSteps && prog.completedSteps.length > 0 && prog.completedSteps.length < pb.steps.length) {
          foundInProgress = { playbook: pb, progress: prog };
          break;
        }
      }
      setInProgressPlaybook(foundInProgress);

      // Suggested playbooks (up to 3)
      setSuggestedPlaybooks(allPlaybooks.slice(0, 3));
    } catch (e) {
      console.error('Error loading TodayScreen data:', e);
    } finally {
      setLoading(false);
    }
  };

  const getTimeBasedMessage = () => {
    const hours = new Date().getHours();
    if (hours < 10) return 'Start your day with a focused routine.';
    if (hours < 17) return 'Keep momentum going with quick checklists.';
    return 'Wind down and prepare for a restful evening.';
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={palette.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Greeting and Date */}
          <View style={styles.header}>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.date}>{date}</Text>
            <Text style={styles.motto}>{getTimeBasedMessage()}</Text>
          </View>

          {/* In Progress / Pick up where you left off */}
          {inProgressPlaybook && (
            <View style={styles.section}>
              <SectionHeader title="Pick up where you left off" />
              <PlaybookCard
                playbook={inProgressPlaybook.playbook}
                progress={inProgressPlaybook.progress}
                onPress={() => navigation.navigate('PlaybookDetail', { playbookId: inProgressPlaybook.playbook.id })}
              />
            </View>
          )}

          {/* Quick Category Access */}
          <View style={styles.section}>
            <SectionHeader title="Quick Categories" />
            <View style={styles.quickAccessRow}>
              <TouchableOpacity
                style={styles.quickAccessItem}
                onPress={() => navigation.navigate('Browse', { category: 'work' })}
              >
                <View style={[styles.quickAccessIcon, { backgroundColor: palette.primarySoft }]}>
                  <Ionicons name="briefcase-outline" size={22} color={palette.primary} />
                </View>
                <Text style={styles.quickAccessLabel}>Work</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickAccessItem}
                onPress={() => navigation.navigate('Browse', { category: 'home' })}
              >
                <View style={[styles.quickAccessIcon, { backgroundColor: palette.accentSoft }]}>
                  <Ionicons name="home-outline" size={22} color={palette.accent} />
                </View>
                <Text style={styles.quickAccessLabel}>Home</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickAccessItem}
                onPress={() => navigation.navigate('Browse', { category: 'errands' })}
              >
                <View style={[styles.quickAccessIcon, { backgroundColor: palette.surfaceAlt }]}>
                  <Ionicons name="bag-handle-outline" size={22} color={palette.textPrimary} />
                </View>
                <Text style={styles.quickAccessLabel}>Errands</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickAccessItem}
                onPress={() => navigation.navigate('Browse', { category: 'health' })}
              >
                <View style={[styles.quickAccessIcon, { backgroundColor: '#E8F5E9' }]}>
                  <Ionicons name="heart-outline" size={22} color="#2E7D32" />
                </View>
                <Text style={styles.quickAccessLabel}>Health</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickAccessItem}
                onPress={() => navigation.navigate('Browse', { category: 'travel' })}
              >
                <View style={[styles.quickAccessIcon, { backgroundColor: '#E0F7FA' }]}>
                  <Ionicons name="compass-outline" size={22} color="#00838F" />
                </View>
                <Text style={styles.quickAccessLabel}>Travel</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Suggested Playbooks */}
          <View style={styles.section}>
            <SectionHeader
              title="Suggested Playbooks"
              actionLabel="Browse all"
              onAction={() => navigation.navigate('Browse')}
            />
            <FlatList
              data={suggestedPlaybooks}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <PlaybookCardMini
                  playbook={item}
                  onPress={() => navigation.navigate('PlaybookDetail', { playbookId: item.id })}
                />
              )}
            />
          </View>

          {/* Favorites */}
          {favoritePlaybookObjects.length > 0 && (
            <View style={styles.section}>
              <SectionHeader
                title="Favorites"
                actionLabel="See all"
                onAction={() => navigation.navigate('Favorites')}
              />
              <FlatList
                data={favoritePlaybookObjects}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <PlaybookCardMini
                    playbook={item}
                    onPress={() => navigation.navigate('PlaybookDetail', { playbookId: item.id })}
                  />
                )}
              />
            </View>
          )}

          {/* Recently Used */}
          {recentPlaybookObjects.length > 0 && (
            <View style={styles.section}>
              <SectionHeader title="Recently Used" />
              <FlatList
                data={recentPlaybookObjects.slice(0, 4)}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <PlaybookCardMini
                    playbook={item}
                    onPress={() => navigation.navigate('PlaybookDetail', { playbookId: item.id })}
                  />
                )}
              />
            </View>
          )}
        </ScrollView>
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
  content: {
    padding: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  greeting: {
    ...typography.display,
  },
  date: {
    ...typography.body,
    color: palette.textSecondary,
    marginTop: spacing.xs,
  },
  motto: {
    ...typography.bodySm,
    color: palette.textTertiary,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.lg,
  },
  quickAccessRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  quickAccessItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickAccessIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  quickAccessLabel: {
    ...typography.caption,
    color: palette.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
});