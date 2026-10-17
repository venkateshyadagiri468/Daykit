# DayKit

[![React Native](https://img.shields.io/badge/React%20Native-0.88.0-61DAFB?logo=react&logoColor=white)](https://reactnative.dev/)
[![Expo SDK](https://img.shields.io/badge/Expo%20SDK-58.0-000020?logo=expo&logoColor=white)](https://docs.expo.dev/)
[![React](https://img.shields.io/badge/React-19.3.0-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Storage](https://img.shields.io/badge/Storage-AsyncStorage%203.1.1-blue)](https://react-native-async-storage.github.io/async-storage/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**DayKit** is an offline-first, client-side mobile checklist runtime and routine execution engine built on React Native 0.88 and Expo SDK 58. It facilitates the discovery, creation, and deterministic execution of procedural step-by-step checklists ("playbooks") with real-time progress tracking, zero-latency local caching, and persistent state hydration across app launches.

---

## Table of Contents

- [System Architecture](#system-architecture)
- [Key Engineering Characteristics](#key-engineering-characteristics)
- [Directory Structure](#directory-structure)
- [Data Models & Schema Specifications](#data-models--schema-specifications)
- [Persistence Layer & Storage Protocol](#persistence-layer--storage-protocol)
- [Navigation Graph & Routing Contract](#navigation-graph--routing-contract)
- [Design Token System](#design-token-system)
- [Component Specifications](#component-specifications)
- [Development & Runtime Environment](#development--runtime-environment)
- [Scripts & Diagnostics](#scripts--diagnostics)
- [License](#license)

---

## System Architecture

DayKit operates with a strictly client-centric, zero-backend architecture. All state is hydrated from local non-volatile storage via `@react-native-async-storage/async-storage` and synchronized with in-memory component states.

```
                              ┌────────────────────────────────────────┐
                              │            App.js / index.js           │
                              │       Root Entry & StatusBar Host      │
                              └───────────────────┬────────────────────┘
                                                  │
                                                  ▼
                              ┌────────────────────────────────────────┐
                              │         AppNavigator (Root)            │
                              │    createStackNavigator (Headerless)  │
                              └──────────┬─────────────────┬───────────┘
                                         │                 │
                 ┌───────────────────────┘                 └───────────────────────┐
                 ▼                                                                 ▼
┌─────────────────────────────────┐                             ┌─────────────────────────────────┐
│     TabNavigator (BottomTabs)   │                             │      PlaybookDetailScreen       │
│  Today | Browse | Favs | Create │                             │  Interactive Execution Engine   │
└────────────────┬────────────────┘                             └────────────────┬────────────────┘
                 │                                                               │
                 └───────────────────────────────┬───────────────────────────────┘
                                                 │
                                                 ▼
                              ┌────────────────────────────────────────┐
                              │       Persistence Layer (AsyncStorage) │
                              │     CRUD Operations & Cache Sync       │
                              └──────────────────┬────────────────────┘
                                                 │
                                                 ▼
                              ┌────────────────────────────────────────┐
                              │         Device File System             │
                              │   Key-Value Document Store (JSON)      │
                              └────────────────────────────────────────┘
```

### Unidirectional Data Flow
1. **Bootstrap / Focus**: Screens subscribe to navigation lifecycle events (`useIsFocused` / `useEffect`).
2. **Hydration**: Asynchronous batch fetches (`Promise.all`) execute against `AsyncStorage` to load playbooks, active progress, favorite IDs, and recent access rings.
3. **Mutation**: User actions (completing a step, toggling favorite status, creating custom entries) trigger localized state mutation followed by asynchronous JSON serialization back to the key-value store.
4. **Invalidation**: Screen refocus events trigger re-hydration to prevent stale state across stack transitions.

---

## Key Engineering Characteristics

- **Zero-Latency Offline Execution**: Complete self-containment with zero external network dependencies at runtime.
- **Deterministic Step Tracking**: State tracking preserves ordered step index arrays per playbook ID, enabling partial completion resumes and idempotent toggle mutations.
- **Atomic Category Aggregation**: Starter playbooks compile from immutable local sources while custom playbooks dynamically merge and deduplicate via unique slug identifiers.
- **Bounded LRU Recent Activity Buffer**: Fixed-depth FIFO ring buffer (max 10 entries) dynamically maintaining recently opened playbooks.
- **Accessible UI Primitives**: Screen reader-compliant components leveraging semantic `accessibilityRole`, `accessibilityLabel`, and `accessibilityState` attributes.

---

## Directory Structure

```text
Daykit/
├── assets/                       # Static platform iconographies & splash assets
│   ├── android-icon-background.png
│   ├── android-icon-foreground.png
│   ├── android-icon-monochrome.png
│   ├── favicon.png
│   ├── icon.png
│   └── splash-icon.png
├── src/
│   ├── components/               # Atomic presentation and layout components
│   │   ├── Button.js             # Variant-driven touchable button primitive
│   │   ├── PlaybookCard.js       # Standard & mini progress-aware playbook cards
│   │   └── SectionHeader.js      # Layout section header with interactive call-to-actions
│   ├── constants/
│   │   └── colors.js             # Design tokens: palette, typography, spacing, radius
│   ├── data/
│   │   └── starterPlaybooks.js   # Immutable starter seeds, categories, and theme mappings
│   ├── navigation/
│   │   └── AppNavigator.js       # Root StackNavigator and nested BottomTabNavigator
│   ├── screens/                  # View layer and lifecycle orchestration
│   │   ├── BrowseScreen.js       # Search index, category chips, and filter matrix
│   │   ├── CreateScreen.js       # Dynamic multi-step form and validation editor
│   │   ├── FavoritesScreen.js    # Bookmarked playbook index with empty-state routing
│   │   ├── PlaybookDetailScreen.js # Step runner, progress calculation, and reset pipeline
│   │   └── TodayScreen.js        # Dynamic home feed: time greetings, active resume, recents
│   └── storage/
│       └── storage.js            # AsyncStorage abstraction, schemas, and persistence routines
├── AGENTS.md                     # Agent execution instructions and SDK constraints
├── App.js                        # Top-level React component root
├── app.json                      # Expo application manifest configuration
├── index.js                      # Expo registerRootComponent bootstrap
├── LICENSE                       # MIT licensing terms
├── package.json                  # Engine definitions, dependencies, and execution scripts
└── README.md                     # Technical architecture documentation
```

---

## Data Models & Schema Specifications

### 1. Playbook Entity (`Playbook`)

```typescript
type PlaybookCategory = 'home' | 'work' | 'errands' | 'health' | 'travel';

interface Playbook {
  /** Unique URI slug or timestamp identifier (e.g., 'starter-get-ready-for-work') */
  id: string;

  /** Title of the playbook (validated non-empty string, <= 50 characters) */
  title: string;

  /** Functional domain category mapping to visual theme tokens */
  category: PlaybookCategory;

  /** Optional contextual summary describing the routine */
  description?: string;

  /** Human-readable estimated duration (e.g., '25 min') */
  duration: string;

  /** Zero-indexed ordered list of textual instructions */
  steps: string[];

  /** Distinguishes built-in seed playbooks from user-authored entities */
  isCustom: boolean;
}
```

### 2. Execution Progress Entity (`PlaybookProgress`)

```typescript
interface PlaybookProgress {
  /** Array of completed 0-indexed step offsets */
  completedSteps: number[];
}

interface PlaybookProgressStore {
  /** Dictionary indexed by Playbook ID */
  [playbookId: string]: PlaybookProgress;
}
```

### 3. Category Metadata Definition

```typescript
interface CategoryItem {
  id: 'all' | PlaybookCategory;
  label: string;
}
```

---

## Persistence Layer & Storage Protocol

All persistent data resides inside the device's native key-value engine via `@react-native-async-storage/async-storage`.

### Storage Keys

| Key Namespace | Value Type | Description |
| :--- | :--- | :--- |
| `daykit_favorites` | `string[]` | Array of bookmarked `playbook.id` strings. |
| `daykit_custom_playbooks` | `Playbook[]` | Serialized JSON array of user-generated playbooks (`isCustom: true`). |
| `daykit_recent_activity` | `string[]` | Bounded array (max 10 items) of most recently accessed `playbook.id`s. |
| `daykit_playbook_progress` | `Record<string, PlaybookProgress>` | Map of `playbookId` to execution progress payload. |

### Storage API Methods (`src/storage/storage.js`)

```javascript
/**
 * Merges immutable starter seeds with local custom playbooks.
 * @returns {Promise<Playbook[]>}
 */
export async function loadAllPlaybooks();

/**
 * Retrieves the list of favorited playbook IDs.
 * @returns {Promise<string[]>}
 */
export async function loadFavorites();

/**
 * Commits an updated favorites array to storage.
 * @param {string[]} favorites
 * @returns {Promise<void>}
 */
export async function saveFavorites(favorites);

/**
 * Idempotently appends or removes a playbook ID from favorites.
 * @param {string} playbookId
 * @returns {Promise<string[]>}
 */
export async function toggleFavorite(playbookId);

/**
 * Upserts a custom playbook into the local collection.
 * Replaces existing records if matching ID is found.
 * @param {Playbook} playbook
 * @returns {Promise<Playbook[]>}
 */
export async function saveCustomPlaybook(playbook);

/**
 * Deletes a custom playbook by ID and clears associated favorite records.
 * @param {string} playbookId
 * @returns {Promise<Playbook[]>}
 */
export async function deleteCustomPlaybook(playbookId);

/**
 * Prepends a playbook ID to the recent activity ring buffer (max 10 entries).
 * @param {string} playbookId
 * @returns {Promise<string[]>}
 */
export async function addRecentPlaybook(playbookId);

/**
 * Reads the progress object for a specific playbook.
 * @param {string} playbookId
 * @returns {Promise<{ completedSteps: number[] }>}
 */
export async function loadPlaybookProgress(playbookId);

/**
 * Writes the execution progress object for a specific playbook ID.
 * @param {string} playbookId
 * @param {{ completedSteps: number[] }} progress
 * @returns {Promise<void>}
 */
export async function savePlaybookProgress(playbookId, progress);

/**
 * Resets progress for a playbook by wiping the completedSteps array.
 * @param {string} playbookId
 * @returns {Promise<void>}
 */
export async function resetPlaybookProgress(playbookId);

/**
 * Bootstraps initial keys with fallback JSON payloads if null.
 * @returns {Promise<void>}
 */
export async function initializeStorage();
```

---

## Navigation Graph & Routing Contract

The application utilizes React Navigation 7.x combining a root stack navigator with a nested bottom tab bar navigator.

```text
Root Stack Navigator (screenOptions: { headerShown: false })
├── "MainTabs" -> BottomTabNavigator
│   ├── "Today"     (TodayScreen)     -> Icon: 'sunny' / 'sunny-outline'
│   ├── "Browse"    (BrowseScreen)    -> Icon: 'grid' / 'grid-outline'
│   ├── "Favorites" (FavoritesScreen) -> Icon: 'heart' / 'heart-outline'
│   └── "Create"    (CreateScreen)    -> Icon: 'add-circle' / 'add-circle-outline'
└── "PlaybookDetail" (PlaybookDetailScreen) -> Target Route (params: { playbookId: string })
```

### Route Parameters Specification

| Screen | Route Name | Parameter Schema | Description |
| :--- | :--- | :--- | :--- |
| **Browse** | `Browse` | `{ category?: string }` | Optional pre-filtered category slug (`'all'`, `'work'`, etc.) |
| **Playbook Detail** | `PlaybookDetail` | `{ playbookId: string }` | Mandatory target entity identifier for data hydration |

---

## Design Token System

Design variables are centralized in `src/constants/colors.js` providing a deterministic palette, scale, and typographic hierarchy.

### 1. Color Palette Tokens

```javascript
export const palette = {
  // Surfaces
  background:    '#FBF7F1', // Warm cream canvas
  surface:       '#FFFFFF', // Card and container surface
  surfaceAlt:    '#F3EFE7', // Secondary surface neutral

  // Text Hierarchy
  textPrimary:   '#1F2A24', // Deep green-black high-contrast text
  textSecondary: '#5C6B63', // Muted secondary slate green
  textTertiary:  '#8A9790', // Inactive placeholder / meta grey

  // Primary Accent (Deep Green)
  primary:       '#2F5D4F', // Brand primary action fill
  primaryDark:   '#24483E', // Pressed / active primary
  primarySoft:   '#E3EBE7', // Pill badges and highlights

  // Warm Accent (Amber)
  accent:        '#C78B4A', // Warning / highlight / secondary action
  accentSoft:    '#F3E4D2', // Amber surface pill

  // Status & Validation
  success:       '#4A7C68', // Complete checkmarks & status
  danger:        '#B05A4A', // Destructive action / error states

  // Borders & Dividers
  border:        '#E5DFD5', // Standard subtle border
  borderStrong:  '#D4CCC0', // Interactive border (inputs, secondary buttons)
  overlay:       'rgba(31, 42, 36, 0.06)'
};
```

### 2. Spacing & Geometric Radii Scale

```javascript
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 40 };
export const radius  = { sm: 8, md: 14, lg: 20, xl: 28 };
```

### 3. Typography Scale

| Style Key | Font Size | Weight | Line Height | Color |
| :--- | :--- | :--- | :--- | :--- |
| `display` | `30px` | `700` (Bold) | `38px` | `palette.textPrimary` |
| `title` | `22px` | `700` (Bold) | `28px` | `palette.textPrimary` |
| `heading` | `18px` | `600` (SemiBold) | `24px` | `palette.textPrimary` |
| `body` | `16px` | `400` (Regular) | `24px` | `palette.textPrimary` |
| `bodySm` | `14px` | `400` (Regular) | `20px` | `palette.textSecondary` |
| `caption` | `12px` | `400` (Regular) | `16px` | `palette.textTertiary` |
| `button` | `16px` | `600` (SemiBold) | `22px` | Dynamic per variant |

---

## Component Specifications

### `<Button />` (`src/components/Button.js`)
Configurable touchable interface element with accessibility primitives.

```typescript
interface ButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}
```

### `<PlaybookCard />` & `<PlaybookCardMini />` (`src/components/PlaybookCard.js`)
State-aware card views calculating real-time completion quotients.
- **Card States**:
  - `isComplete`: `completedSteps.length === totalSteps && totalSteps > 0`
  - `isInProgress`: `completedSteps.length > 0 && !isComplete`
  - `isNotStarted`: `completedSteps.length === 0`
- **Mini Variant**: Compact horizontal layout optimized for scrollable rows (`TodayScreen`).

### `<SectionHeader />` (`src/components/SectionHeader.js`)
Section title container with an optional right-aligned accessible action trigger.

---

## Development & Runtime Environment

### Prerequisites
- **Node.js**: `v18.x` or higher (LTS recommended)
- **Package Manager**: `npm` (v9+) or `yarn` / `bun`
- **Expo CLI**: Integrated via `npx expo`
- **Target Emulators / Simulators**:
  - **Android**: Android Studio with configured AVD (API Level 33+)
  - **iOS**: Xcode 15+ (macOS host required)
  - **Web**: Chromium- or WebKit-based modern browser

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/daykit.git
cd daykit

# Install dependencies strictly targeting Expo SDK 58 runtime compatibility
npm install
```

### Running Locally

```bash
# Launch Metro bundler server with interactive CLI
npm start

# Run targeting specific platforms directly
npm run android    # Boots connected Android device or running AVD
npm run ios        # Boots active iOS Simulator
npm run web        # Compiles and serves development web bundle
```

---

## Scripts & Diagnostics

| Command | Action |
| :--- | :--- |
| `npx expo start` | Launches Metro bundler and development client listener |
| `npx expo start --clear` | Purges Metro cache before launching development server |
| `npx expo doctor` | Validates package dependencies and SDK version compatibility |
| `npx expo install --fix` | Upgrades/downgrades mismatched packages to SDK 58 targets |

---

## License

This project is open-source software licensed under the [MIT License](LICENSE).
