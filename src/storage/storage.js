import AsyncStorage from '@react-native-async-storage/async-storage';
import { STARTER_PLAYBOOKS } from '../data/starterPlaybooks';

const STORAGE_KEYS = {
  FAVORITES: 'daykit_favorites',
  CUSTOM_PLAYBOOKS: 'daykit_custom_playbooks',
  RECENT_ACTIVITY: 'daykit_recent_activity',
  PLAYBOOK_PROGRESS: 'daykit_playbook_progress',
};

const DEFAULT_PLAYBOOKS = STARTER_PLAYBOOKS.map(pb => ({ ...pb, isCustom: false }));

export async function loadAllPlaybooks() {
  try {
    const customData = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_PLAYBOOKS);
    const customPlaybooks = customData ? JSON.parse(customData) : [];
    return [...DEFAULT_PLAYBOOKS, ...customPlaybooks];
  } catch (e) {
    console.error('Error loading playbooks:', e);
    return DEFAULT_PLAYBOOKS;
  }
}

export async function loadFavorites() {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error loading favorites:', e);
    return [];
  }
}

export async function saveFavorites(favorites) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  } catch (e) {
    console.error('Error saving favorites:', e);
  }
}

export async function toggleFavorite(playbookId) {
  const favorites = await loadFavorites();
  const index = favorites.indexOf(playbookId);
  if (index > -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(playbookId);
  }
  await saveFavorites(favorites);
  return favorites;
}

export async function saveCustomPlaybook(playbook) {
  try {
    const customPlaybooks = await loadCustomPlaybooks();
    const existingIndex = customPlaybooks.findIndex(p => p.id === playbook.id);
    if (existingIndex > -1) {
      customPlaybooks[existingIndex] = { ...playbook, isCustom: true };
    } else {
      customPlaybooks.push({ ...playbook, isCustom: true });
    }
    await AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_PLAYBOOKS, JSON.stringify(customPlaybooks));
    return customPlaybooks;
  } catch (e) {
    console.error('Error saving custom playbook:', e);
    return [];
  }
}

export async function loadCustomPlaybooks() {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_PLAYBOOKS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error loading custom playbooks:', e);
    return [];
  }
}

export async function deleteCustomPlaybook(playbookId) {
  try {
    const customPlaybooks = await loadCustomPlaybooks();
    const filtered = customPlaybooks.filter(p => p.id !== playbookId);
    await AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_PLAYBOOKS, JSON.stringify(filtered));
    
    // Also remove from favorites if present
    const favorites = await loadFavorites();
    const updatedFavorites = favorites.filter(id => id !== playbookId);
    await saveFavorites(updatedFavorites);
    
    return filtered;
  } catch (e) {
    console.error('Error deleting custom playbook:', e);
    return [];
  }
}

export async function addRecentPlaybook(playbookId) {
  try {
    const recent = await loadRecentActivity();
    const filtered = recent.filter(id => id !== playbookId);
    filtered.unshift(playbookId);
    const trimmed = filtered.slice(0, 10);
    await AsyncStorage.setItem(STORAGE_KEYS.RECENT_ACTIVITY, JSON.stringify(trimmed));
    return trimmed;
  } catch (e) {
    console.error('Error adding recent playbook:', e);
    return [];
  }
}

export async function loadRecentActivity() {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.RECENT_ACTIVITY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error loading recent activity:', e);
    return [];
  }
}

export async function loadPlaybookProgress(playbookId) {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PLAYBOOK_PROGRESS);
    const allProgress = data ? JSON.parse(data) : {};
    return allProgress[playbookId] || { completedSteps: [] };
  } catch (e) {
    console.error('Error loading playbook progress:', e);
    return { completedSteps: [] };
  }
}

export async function savePlaybookProgress(playbookId, progress) {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PLAYBOOK_PROGRESS);
    const allProgress = data ? JSON.parse(data) : {};
    allProgress[playbookId] = progress;
    await AsyncStorage.setItem(STORAGE_KEYS.PLAYBOOK_PROGRESS, JSON.stringify(allProgress));
  } catch (e) {
    console.error('Error saving playbook progress:', e);
  }
}

export async function resetPlaybookProgress(playbookId) {
  await savePlaybookProgress(playbookId, { completedSteps: [] });
}

export async function initializeStorage() {
  // Ensure storage keys exist (even if empty)
  const keys = [
    STORAGE_KEYS.FAVORITES,
    STORAGE_KEYS.CUSTOM_PLAYBOOKS,
    STORAGE_KEYS.RECENT_ACTIVITY,
    STORAGE_KEYS.PLAYBOOK_PROGRESS,
  ];
  
  for (const key of keys) {
    const exists = await AsyncStorage.getItem(key);
    if (exists === null) {
      if (key === STORAGE_KEYS.FAVORITES) {
        await AsyncStorage.setItem(key, JSON.stringify([]));
      } else if (key === STORAGE_KEYS.CUSTOM_PLAYBOOKS) {
        await AsyncStorage.setItem(key, JSON.stringify([]));
      } else if (key === STORAGE_KEYS.RECENT_ACTIVITY) {
        await AsyncStorage.setItem(key, JSON.stringify([]));
      } else if (key === STORAGE_KEYS.PLAYBOOK_PROGRESS) {
        await AsyncStorage.setItem(key, JSON.stringify({}));
      }
    }
  }
}